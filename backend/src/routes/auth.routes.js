const { Router } = require('express');
const { signup, login } = require('../controllers/auth.controller');

const router = Router();

router.post('/api/auth/signup', signup);
router.post('/api/auth/login', login);

module.exports = router;
