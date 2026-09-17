const { Router } = require('express');
const { createReservation, getMyReservations, cancelMyReservation } = require('../controllers/reservations.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.post('/api/reservations', authenticate, createReservation);
router.get('/api/reservations/me', authenticate, getMyReservations);
router.patch('/api/reservations/:id/cancel', authenticate, cancelMyReservation);

module.exports = router;
