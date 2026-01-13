const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, 'src', 'db', 'tables', '09_user_status.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Aplicando migración 09_user_status.sql...');
        await pool.query(sql);
        console.log('✅ Migración exitosa.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en migración:', err);
        process.exit(1);
    }
}

runMigration();
