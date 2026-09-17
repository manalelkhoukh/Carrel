const pool = require('../db/pool');
const { isValidSlot } = require('../utils/timeSlots');

async function createReservation(req, res) {
  const { seat_id, start_time, end_time } = req.body;
  const user_id = req.user.id;

  if (!seat_id || !start_time || !end_time) {
    return res.status(400).json({ error: 'seat_id, start_time, and end_time are required' });
  }

  const startTime = new Date(start_time);
  const endTime = new Date(end_time);

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return res.status(400).json({ error: 'start_time and end_time must be valid dates' });
  }
  if (endTime <= startTime) {
    return res.status(400).json({ error: 'end_time must be after start_time' });
  }

  try {
    // Look up the seat's room hours so we can check this booking against
    // *that room's* real opening hours — never trust the client to only
    // ever send valid slot times, even though the UI should only ever
    // offer valid ones.
    const roomResult = await pool.query(
      `SELECT r.opens_at, r.closes_at
       FROM seats s
       JOIN rooms r ON r.id = s.room_id
       WHERE s.id = $1`,
      [seat_id]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    if (!isValidSlot(roomResult.rows[0], startTime, endTime)) {
      return res.status(400).json({ error: 'This is not a valid booking slot for this room today' });
    }

    const result = await pool.query(
      `INSERT INTO reservations (user_id, seat_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, 'confirmed')
       RETURNING id, user_id, seat_id, start_time, end_time, status, created_at`,
      [user_id, seat_id, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23P01') {
      return res.status(409).json({ error: 'This seat is already booked for that time' });
    }
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid seat_id or user_id' });
    }
    res.status(500).json({ error: err.message });
  }
}

async function getMyReservations(req, res) {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT
         res.id, res.start_time, res.end_time, res.status, res.created_at,
         seat.label AS seat_label,
         room.id AS room_id, room.name AS room_name
       FROM reservations res
       JOIN seats seat ON seat.id = res.seat_id
       JOIN rooms room ON room.id = seat.room_id
       WHERE res.user_id = $1
       ORDER BY res.start_time DESC`,
      [user_id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function cancelMyReservation(req, res) {
  const user_id = req.user.id;
  const { id } = req.params;

  try {
    const updateResult = await pool.query(
      `UPDATE reservations
       SET status = 'cancelled'
       WHERE id = $1 AND user_id = $2 AND status = 'confirmed'
       RETURNING id, status`,
      [id, user_id]
    );

    if (updateResult.rows.length > 0) {
      return res.status(200).json(updateResult.rows[0]);
    }

    // The UPDATE matched nothing — figure out why, so we can tell the
    // difference between "doesn't exist / isn't yours" (404) and
    // "exists, but already cancelled or completed" (409). Same pattern
    // used for the admin cancel endpoint: an UPDATE's silence alone
    // can't distinguish these, so a follow-up SELECT is needed.
    const existingResult = await pool.query('SELECT status FROM reservations WHERE id = $1 AND user_id = $2', [
      id,
      user_id,
    ]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    return res.status(409).json({ error: `Reservation is already ${existingResult.rows[0].status}` });
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid reservation ID' });
    }
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createReservation, getMyReservations, cancelMyReservation };
