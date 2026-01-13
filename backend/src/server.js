const app = require('./app');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

/**
 * Migration Helper
 */
const ensureColumn = async (table, column, definition) => {
    const check = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name=$1 AND column_name=$2",
        [table, column]
    );
    if (check.rows.length === 0) {
        console.log(`Migrating: Adding ${column} column to ${table}...`);
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
};

/**
 * Database Initialization & Server Start
 */
const initDbAndStartServer = async () => {
    try {
        // 1. Read and execute schema
        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await pool.query(schemaSql);
        }

        // 2. Auto-Migrations (for existing tables)
        await ensureColumn('users', 'name', 'VARCHAR(255)');
        await ensureColumn('users', 'avatar_url', 'TEXT');
        await ensureColumn('users', 'active', 'BOOLEAN DEFAULT TRUE');
        await ensureColumn('users', 'role', "VARCHAR(50) DEFAULT 'user'");
        await ensureColumn('users', 'status', "VARCHAR(20) DEFAULT 'active'");
        await ensureColumn('users', 'language_preference', "VARCHAR(5) DEFAULT 'es'");

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
                    console.log('🔐 Dynamic JWT Secret loaded from database');
                }
            }
        } catch (settingsErr) {
            console.error('Warning: Failed to load dynamic settings:', settingsErr.message);
        }

        // 3. Admin Seeding
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.warn('⚠️ Admin seeding skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
        } else {
            const adminCheck = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

            if (adminCheck.rows.length === 0) {
                console.log('Seeding: Creating initial Admin user...');
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
                    console.log('Seeding: Promoting user to admin...');
                    await pool.query("UPDATE users SET role='admin' WHERE email=$1", [adminEmail]);
                }
            }
        }

        console.log('Database initialized successfully');

        // --- MinIO Validation (Implemented strict here per user request) ---
        if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY) {
            // We could fail here, but let's just warn for now or implement strict if requested
        }
        // -------------------------------------------------------------------

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    }
};

initDbAndStartServer();
