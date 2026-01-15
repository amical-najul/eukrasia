const pool = require('./src/config/db');

async function check() {
    try {
        const history = await pool.query('SELECT * FROM migrations_history ORDER BY id');
        console.log('--- Migrations History ---');
        history.rows.forEach(r => console.log(`${r.id}: ${r.filename} (${r.executed_at})`));

        const tables = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log('\n--- Tables ---');
        tables.rows.forEach(t => console.log(t.tablename));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
