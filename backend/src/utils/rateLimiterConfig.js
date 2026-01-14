const pool = require('../config/db');

let cachedRateLimitLoginEnabled = true; // Default to enabled for safety

/**
 * Initializes the rate limiter configuration loader.
 * Fetches the configuration immediately and then sets up a periodic refresh.
 * @param {object} dbPool - The database pool instance.
 */
const initRateLimiterConfig = async (dbPool) => {
    // Initial fetch
    await refreshRateLimitConfig();

    // Refresh every 5 minutes (300000 ms)
    setInterval(refreshRateLimitConfig, 5 * 60 * 1000);
};

/**
 * Refreshes the rate limiter configuration from the database.
 */
const refreshRateLimitConfig = async () => {
    try {
        const result = await pool.query(
            "SELECT setting_value FROM app_settings WHERE setting_key = 'rate_limit_login_enabled'"
        );

        if (result.rows.length > 0) {
            // Update cache
            // If setting_value is literally 'false' string, then it is disabled.
            // Otherwise default logic assumes enabled.
            const value = result.rows[0].setting_value;
            cachedRateLimitLoginEnabled = value !== 'false';
            // console.log(`Rate Limiter Config Updated: Enabled = ${cachedRateLimitLoginEnabled}`);
        } else {
            // If not found, default to true
            cachedRateLimitLoginEnabled = true;
        }
    } catch (err) {
        console.error('Error refreshing rate limiter config:', err.message);
        // Keep previous value or default to true on error (fail secure)
    }
};

/**
 * Checks if the rate limiter should be skipped based on cached configuration.
 * @returns {boolean} True if rate limiting should be skipped (disabled), false otherwise.
 */
const shouldSkipRateLimit = () => {
    return !cachedRateLimitLoginEnabled;
};

module.exports = {
    initRateLimiterConfig,
    shouldSkipRateLimit
};
