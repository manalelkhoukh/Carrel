const pool = require('../db/pool');
const { getUpcomingSlots } = require('../utils/timeSlots');

async function getRooms(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, floor_number, opens_at, closes_at, created_at FROM rooms ORDER BY name'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getRoomSlots(req, res) {
  const { roomId } = req.params;

  try {
    const roomResult = await pool.query('SELECT opens_at, closes_at FROM rooms WHERE id = $1', [roomId]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const now = Date.now();
    const slots = getUpcomingSlots(roomResult.rows[0]).map((slot) => ({
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      isPast: slot.endTime.getTime() <= now,
    }));

    res.status(200).json(slots);
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getRooms, getRoomSlots };
