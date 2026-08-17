const { Router } = require('express');
const { createReservation } = require('../controllers/reservations.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.post('/api/reservations', authenticate, createReservation);

module.exports = router;
