const pool = require('../config/db');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function listTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('Tables in public schema:', res.rows.map(r => r.table_name));

        // Also check users columns just in case
        const userCols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('Users table columns:', userCols.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

listTables();
