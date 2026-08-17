const pool = require('../db/pool');

async function createReservation(req, res) {
  const { seat_id, start_time, end_time } = req.body;
  const user_id = req.user.id;

  if (!seat_id || !start_time || !end_time) {
    return res.status(400).json({ error: 'seat_id, start_time, and end_time are required' });
  }

  if (new Date(end_time) <= new Date(start_time)) {
    return res.status(400).json({ error: 'end_time must be after start_time' });
  }

  try {
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

module.exports = { createReservation };
