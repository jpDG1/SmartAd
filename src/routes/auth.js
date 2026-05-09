const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

module.exports = router;
