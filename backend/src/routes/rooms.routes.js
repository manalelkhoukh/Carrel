const { Router } = require('express');
const { getRooms } = require('../controllers/rooms.controller');

const router = Router();

router.get('/api/rooms', getRooms);

module.exports = router;
