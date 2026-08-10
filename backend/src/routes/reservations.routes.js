const { Router } = require('express');
const { createReservation } = require('../controllers/reservations.controller');

const router = Router();

router.post('/api/reservations', createReservation);

module.exports = router;
