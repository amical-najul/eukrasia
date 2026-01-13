const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Sanity check: Ensure critical DB vars are present
if (!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_PASSWORD) {
    console.log('DEBUG: DB Vars:', {
        user: !!process.env.DB_USER,
        host: !!process.env.DB_HOST,
        name: !!process.env.DB_NAME,
        pass: !!process.env.DB_PASSWORD
    });
    console.error('❌ CRITICAL ERROR: Database environment variables are missing.');
    process.exit(1);
} else {
    console.log('DEBUG: DB Config Check Passed');
}

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // process.exit(-1); // Don't crash on error, let it retry or fail gracefully
});

module.exports = pool;
