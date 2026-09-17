const { Router } = require('express');
const { getRooms, getRoomSlots } = require('../controllers/rooms.controller');

const router = Router();

router.get('/api/rooms', getRooms);
router.get('/api/rooms/:roomId/slots', getRoomSlots);

module.exports = router;
