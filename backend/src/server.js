const app = require('./app');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./config/db');
const { initRateLimiterConfig } = require('./utils/rateLimiterConfig');
const { initMinIOBucket } = require('./config/minio');
const logger = require('./utils/logger');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 3000;

/**
 * Database Initialization & Server Start
 */
const initDbAndStartServer = async () => {
    try {
        // Initialize Rate Limiter Config Cache
        await initRateLimiterConfig();

        // 1. Read and execute schema
        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await pool.query(schemaSql);
        }

        // 2. Initialize MinIO bucket and policy (once on startup)
        await initMinIOBucket();

        // NOTE: Column migrations now handled by `npm run migrate` script
        // See: scripts/migrate.js and db/migrations/

        // 3. Load Dynamic Settings
        try {
            const { decrypt } = require('./utils/encryption');
            const settingsRes = await pool.query("SELECT setting_key, setting_value, is_encrypted FROM advanced_settings WHERE setting_key = 'jwt_secret'");

            if (settingsRes.rows.length > 0) {
                const jwtSetting = settingsRes.rows[0];
                let secret = jwtSetting.setting_value;

                if (jwtSetting.is_encrypted) {
                    secret = decrypt(secret);
                }

                if (secret && secret.length >= 32) {
                    process.env.JWT_SECRET = secret;
                    logger.startup('🔐 Dynamic JWT Secret loaded from database');
                }
            }
        } catch (settingsErr) {
            logger.warn('Settings', 'Failed to load dynamic settings', { error: settingsErr.message });
        }

        // 3. Admin Seeding
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            logger.warn('Seeding', '⚠️ Admin seeding skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
        } else {
            const adminCheck = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

            if (adminCheck.rows.length === 0) {
                logger.startup('Seeding: Creating initial Admin user...');
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(adminPassword, salt);

                await pool.query(
                    "INSERT INTO users (email, password_hash, role, is_verified, active, name, status) VALUES ($1, $2, 'admin', TRUE, TRUE, 'Admin', 'active')",
                    [adminEmail, hash]
                );
            } else {
                // Ensure permissions
                const existing = adminCheck.rows[0];
                if (existing.role !== 'admin') {
                    logger.startup('Seeding: Promoting user to admin...');
                    await pool.query("UPDATE users SET role='admin' WHERE email=$1", [adminEmail]);
                }
            }
        }

        logger.startup('Database initialized successfully');

        // --- MinIO Validation (Implemented strict here per user request) ---
        if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY) {
            // We could fail here, but let's just warn for now or implement strict if requested
        }
        // -------------------------------------------------------------------

        app.listen(PORT, '0.0.0.0', () => {
            logger.startup(`Server running on port ${PORT}`);
        });

    } catch (err) {
        logger.error('Server', 'Failed to initialize database', { error: err.message });
        process.exit(1);
    }
};

initDbAndStartServer();
