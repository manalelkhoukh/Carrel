const pool = require('../db/pool');

function getHealth(req, res) {
  res.status(200).json({ status: 'ok' });
}

async function getHealthDb(req, res) {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = { getHealth, getHealthDb };
