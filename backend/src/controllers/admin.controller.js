const pool = require('../db/pool');

async function createRoom(req, res) {
  const { name, floor_number, opens_at, closes_at } = req.body;

  if (!name || floor_number === undefined || floor_number === null) {
    return res.status(400).json({ error: 'name and floor_number are required' });
  }

  const openTime = opens_at ?? null;
  const closeTime = closes_at ?? null;

  try {
    const result = await pool.query(
      `INSERT INTO rooms (name, floor_number, opens_at, closes_at)
       VALUES ($1, $2, COALESCE($3::time, '08:00'::time), COALESCE($4::time, '22:00'::time))
       RETURNING id, name, floor_number, opens_at, closes_at, created_at`,
      [name, floor_number, openTime, closeTime]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A room with this name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
}

async function createSeat(req, res) {
  const { roomId } = req.params;
  const { label } = req.body;

  if (!label) {
    return res.status(400).json({ error: 'label is required' });
  }

  try {
    const roomResult = await pool.query('SELECT id FROM rooms WHERE id = $1', [roomId]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const result = await pool.query(
      `INSERT INTO seats (room_id, label)
       VALUES ($1, $2)
       RETURNING id, room_id, label, is_active, created_at`,
      [roomId, label]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A seat with this label already exists in this room' });
    }
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    res.status(500).json({ error: err.message });
  }
}

async function toggleSeatActive(req, res) {
  const { seatId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE seats SET is_active = NOT is_active
       WHERE id = $1
       RETURNING id, room_id, label, is_active, created_at`,
      [seatId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid seat ID' });
    }
    res.status(500).json({ error: err.message });
  }
}

async function listAllReservations(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         r.id,
         r.start_time,
         r.end_time,
         r.status,
         r.created_at,
         u.id AS user_id,
         u.name AS user_name,
         u.email AS user_email,
         s.id AS seat_id,
         s.label AS seat_label,
         rm.id AS room_id,
         rm.name AS room_name
       FROM reservations r
       JOIN users u ON u.id = r.user_id
       JOIN seats s ON s.id = r.seat_id
       JOIN rooms rm ON rm.id = s.room_id
       ORDER BY r.start_time DESC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function cancelReservation(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE reservations SET status = 'cancelled'
       WHERE id = $1 AND status = 'confirmed'
       RETURNING id, user_id, seat_id, start_time, end_time, status, created_at`,
      [id]
    );

    if (result.rows.length === 0) {
      const existsResult = await pool.query('SELECT id FROM reservations WHERE id = $1', [id]);

      if (existsResult.rows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      return res.status(409).json({ error: 'This reservation is already cancelled or completed' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid reservation ID' });
    }
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createRoom, createSeat, toggleSeatActive, listAllReservations, cancelReservation };
