const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiters');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/google', authLimiter, authController.googleLogin);
router.get('/verify-email', authController.verifyEmail);

// Password Reset Routes
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Session Routes
const authMiddleware = require('../middleware/authMiddleware');
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
