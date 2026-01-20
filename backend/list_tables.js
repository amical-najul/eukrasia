
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

async function listTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log('Tables:', res.rows.map(r => r.table_name));

        // Check columns for user_llm_config
        const colRes = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'user_llm_config';
        `);
        console.log('user_llm_config columns:', colRes.rows.map(c => c.column_name));

        const reportColRes = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'ai_analysis_reports';
        `);
        console.log('ai_analysis_reports columns:', reportColRes.rows.map(c => c.column_name));

        const breathingColRes = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'breathing_exercises';
        `);
        console.log('breathing_exercises columns:', breathingColRes.rows.map(c => c.column_name));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

listTables();
