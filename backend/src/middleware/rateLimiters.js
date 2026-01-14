/**
 * Centralized Rate Limiters
 * 
 * Consolidates rate limiting logic used across auth and user routes.
 * Uses in-memory cached configuration from rateLimiterConfig.js
 */

const rateLimit = require('express-rate-limit');
const { shouldSkipRateLimit } = require('../utils/rateLimiterConfig');

/**
 * Auth Rate Limiter
 * - 5 attempts per 15 minutes for login/register/password reset
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => shouldSkipRateLimit()
});

/**
 * API Rate Limiter
 * - More generous limits for general API use
 * - 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    authLimiter,
    apiLimiter
};
