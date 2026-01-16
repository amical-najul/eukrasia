const pool = require('../config/db');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function manualMigration() {
    console.log('🚀 Manual Migration 008...');
    const client = await pool.connect();

    const filename = '008_body_tracking_tables.sql';

    try {
        await client.query('BEGIN');

        // 1. Extension
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
        console.log('✅ Extension pgcrypto ensured.');

        // 2. Body Weight Logs
        await client.query(`
            CREATE TABLE IF NOT EXISTS body_weight_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                weight NUMERIC(5,2) NOT NULL,
                recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                note TEXT
            )
        `);
        console.log('✅ Table body_weight_logs created.');

        await client.query('CREATE INDEX IF NOT EXISTS idx_body_weight_recorded_at ON body_weight_logs(user_id, recorded_at DESC)');
        console.log('✅ Index idx_body_weight_recorded_at created.');

        // 3. Body Weight Goals
        await client.query(`
            CREATE TABLE IF NOT EXISTS body_weight_goals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                start_weight NUMERIC(5,2) NOT NULL,
                target_weight NUMERIC(5,2) NOT NULL,
                start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                target_date TIMESTAMP WITH TIME ZONE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table body_weight_goals created.');

        // 4. Body Measurements
        await client.query(`
            CREATE TABLE IF NOT EXISTS body_measurements (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                measurement_type VARCHAR(50) NOT NULL,
                value NUMERIC(5,2) NOT NULL,
                unit VARCHAR(10) DEFAULT 'cm',
                recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                note TEXT
            )
        `);
        console.log('✅ Table body_measurements created.');

        await client.query('CREATE INDEX IF NOT EXISTS idx_body_measurements_type_date ON body_measurements(user_id, measurement_type, recorded_at DESC)');
        console.log('✅ Index idx_body_measurements_type_date created.');

        // 5. Mark as migrated
        await client.query('INSERT INTO migrations_history (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING', [filename]);
        console.log('✅ Marked as executed in migrations_history.');

        await client.query('COMMIT');
        console.log('🎉 Manual Migration Successful!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error during manual migration:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

manualMigration();
