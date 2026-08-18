const { Router } = require('express');
const {
  createRoom,
  createSeat,
  toggleSeatActive,
  listAllReservations,
  cancelReservation,
} = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

const router = Router();

router.post('/api/admin/rooms', authenticate, requireAdmin, createRoom);
router.post('/api/admin/rooms/:roomId/seats', authenticate, requireAdmin, createSeat);
router.patch('/api/admin/seats/:seatId', authenticate, requireAdmin, toggleSeatActive);
router.get('/api/admin/reservations', authenticate, requireAdmin, listAllReservations);
router.delete('/api/admin/reservations/:id', authenticate, requireAdmin, cancelReservation);

module.exports = router;
