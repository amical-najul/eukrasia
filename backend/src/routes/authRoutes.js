const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const pool = require('../config/db');

const rateLimit = require('express-rate-limit');

// Rate Limiter: 5 attempts per 15 mins
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Demasiados intentos de inicio de sesion, por favor intente nuevamente en 15 minutos.' },
    skip: async (req) => {
        // Check if rate limiting is disabled in settings
        try {
            const result = await pool.query(
                "SELECT setting_value FROM app_settings WHERE setting_key = 'rate_limit_login_enabled'"
            );
            // If setting exists and is 'false', skip rate limiting
            if (result.rows.length > 0 && result.rows[0].setting_value === 'false') {
                return true; // Skip rate limiting
            }
            return false; // Apply rate limiting
        } catch (err) {
            console.error('Error checking rate limit setting:', err);
            return false; // Apply rate limiting on error (fail secure)
        }
    }
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/google', authLimiter, authController.googleLogin);
router.get('/verify-email', authController.verifyEmail);

// Password Reset Routes
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

module.exports = router;
