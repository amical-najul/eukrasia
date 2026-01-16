const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function applyMigration() {
    try {
        const sqlPath = path.join(__dirname, 'src', 'db', 'migrations', '008_body_tracking_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Applying migration from:", sqlPath);
        await pool.query(sql);
        console.log("Migration applied successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration Error:", err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

applyMigration();
