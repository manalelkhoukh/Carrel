const pool = require('../db/pool');

async function getRoomSeats(req, res) {
  const { roomId } = req.params;

  try {
    const roomResult = await pool.query('SELECT id FROM rooms WHERE id = $1', [roomId]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const seatsResult = await pool.query(
      `SELECT
         s.id,
         s.label,
         s.is_active,
         (s.is_active AND r.id IS NULL) AS is_available
       FROM seats s
       LEFT JOIN reservations r
         ON r.seat_id = s.id
         AND r.status = 'confirmed'
         AND r.start_time <= NOW()
         AND r.end_time > NOW()
       WHERE s.room_id = $1
       ORDER BY s.label`,
      [roomId]
    );

    res.status(200).json(seatsResult.rows);
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getRoomSeats };
