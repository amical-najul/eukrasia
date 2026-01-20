
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // ssl: { rejectUnauthorized: false } 
});

const email = process.argv[2];

if (!email) {
    console.error('Email argument required');
    process.exit(1);
}

async function verifyUser() {
    try {
        const res = await pool.query('UPDATE users SET is_verified = true WHERE email = $1 RETURNING id, email, is_verified', [email]);
        if (res.rowCount > 0) {
            console.log(`User ${email} verified successfully.`, res.rows[0]);
        } else {
            console.log(`User ${email} not found.`);
        }
    } catch (err) {
        console.error('Error verifying user:', err);
    } finally {
        await pool.end();
    }
}

verifyUser();
