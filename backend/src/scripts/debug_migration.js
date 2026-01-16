const pool = require('../config/db');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function debugMigration() {
    console.log('Debugging migration...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('1. Creating Extension pgcrypto...');
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
        console.log('✅ Extension created.');

        console.log('2. Creating Table body_weight_logs...');
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

        console.log('3. Creating Index...');
        await client.query('CREATE INDEX IF NOT EXISTS idx_body_weight_recorded_at ON body_weight_logs(user_id, recorded_at DESC)');
        console.log('✅ Index created.');

        await client.query('ROLLBACK'); // Rollback so we don't mess up state
        console.log('🔄 Rolled back (Test successful).');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', err);
        console.error('Code:', err.code);
        console.error('Detail:', err.detail);
        console.error('Hint:', err.hint);
    } finally {
        client.release();
        await pool.end();
    }
}

debugMigration();
