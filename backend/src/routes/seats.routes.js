const { Router } = require('express');
const { getRoomSeats } = require('../controllers/seats.controller');

const router = Router();

router.get('/api/rooms/:roomId/seats', getRoomSeats);

module.exports = router;
