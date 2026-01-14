/**
 * Migration Runner Script
 * 
 * Reads SQL files from /db/migrations and executes them in order.
 * Tracks execution in 'migrations_history' table to prevent re-runs.
 * 
 * Usage: npm run migrate
 */

const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const MIGRATIONS_DIR = path.join(__dirname, '../db/migrations');

async function runMigrations() {
    console.log('🔄 Starting Migration Process...');

    try {
        // Ensure migrations_history table exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS migrations_history (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if migrations directory exists
        if (!fs.existsSync(MIGRATIONS_DIR)) {
            console.log('📁 Creating migrations directory:', MIGRATIONS_DIR);
            fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
        }

        // Get list of SQL files sorted by filename
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('✅ No migration files found. Nothing to do.');
            return;
        }

        console.log(`📋 Found ${files.length} migration file(s).`);

        // Get already executed migrations
        const executed = await pool.query('SELECT filename FROM migrations_history');
        const executedSet = new Set(executed.rows.map(r => r.filename));

        let migrationsRun = 0;

        for (const file of files) {
            if (executedSet.has(file)) {
                console.log(`⏭️  Skipping (already executed): ${file}`);
                continue;
            }

            console.log(`▶️  Running migration: ${file}`);
            const filePath = path.join(MIGRATIONS_DIR, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query(
                    'INSERT INTO migrations_history (filename) VALUES ($1)',
                    [file]
                );
                await client.query('COMMIT');
                console.log(`✅ Migration complete: ${file}`);
                migrationsRun++;
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`❌ Migration FAILED: ${file}`);
                console.error(err.message);
                throw err; // Stop on first failure
            } finally {
                client.release();
            }
        }

        if (migrationsRun === 0) {
            console.log('✅ All migrations already up-to-date.');
        } else {
            console.log(`🎉 Successfully ran ${migrationsRun} migration(s).`);
        }

    } catch (err) {
        console.error('Migration process failed:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigrations();
