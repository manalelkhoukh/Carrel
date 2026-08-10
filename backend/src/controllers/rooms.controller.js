const pool = require('../db/pool');

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

module.exports = { getRooms };
