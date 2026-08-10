const { Router } = require('express');
const { getHealth, getHealthDb } = require('../controllers/health.controller');

const router = Router();

router.get('/health', getHealth);
router.get('/health/db', getHealthDb);

module.exports = router;
