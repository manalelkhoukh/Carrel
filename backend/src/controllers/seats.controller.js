const pool = require('../db/pool');

async function getRoomSeats(req, res) {
  const { roomId } = req.params;
  const { start_time, end_time } = req.query;

  // Both must be given together, or neither. Mixing (one present, one
  // missing) is almost certainly a frontend bug, so it's rejected loudly
  // here rather than silently falling back to "check availability right
  // now" and hiding the mistake.
  if ((start_time && !end_time) || (!start_time && end_time)) {
    return res.status(400).json({ error: 'start_time and end_time must be provided together' });
  }

  let rangeStart = new Date();
  let rangeEnd = new Date();

  if (start_time && end_time) {
    rangeStart = new Date(start_time);
    rangeEnd = new Date(end_time);

    if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
      return res.status(400).json({ error: 'start_time and end_time must be valid dates' });
    }
    if (rangeEnd <= rangeStart) {
      return res.status(400).json({ error: 'end_time must be after start_time' });
    }
  }

  try {
    const roomResult = await pool.query('SELECT id FROM rooms WHERE id = $1', [roomId]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // A seat is available for the requested range if it's active AND no
    // confirmed reservation for it overlaps that range at all — not just
    // "is someone in it right now." This is what makes slot-specific
    // availability possible: a seat can be free right now but booked for
    // a later slot, and this query correctly reports it as unavailable
    // for that later slot while still showing it free for the current one.
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
         AND r.start_time < $2
         AND r.end_time > $3
       WHERE s.room_id = $1
       ORDER BY s.label`,
      [roomId, rangeEnd.toISOString(), rangeStart.toISOString()]
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
