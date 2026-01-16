const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function checkTables() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = res.rows.map(r => r.table_name);
        console.log("Existing tables:", tables);

        const bodyTables = ['body_weight_logs', 'body_weight_goals', 'body_measurements'];
        const missing = bodyTables.filter(t => !tables.includes(t));

        if (missing.length > 0) {
            console.log("MISSING TABLES:", missing);
            process.exit(1);
        } else {
            console.log("All body tracking tables exist.");
            process.exit(0);
        }
    } catch (err) {
        console.error("Database Error:", err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

checkTables();
