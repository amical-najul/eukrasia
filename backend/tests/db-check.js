require('dotenv').config();
const pool = require('../src/config/db');

async function checkDb() {
    try {
        console.log('Connecting to DB...', process.env.DB_HOST);
        const res = await pool.query('SELECT NOW()');
        console.log('DB Connected:', res.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error('DB Connection Failed:', err);
        process.exit(1);
    }
}

checkDb();
