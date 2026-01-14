const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, 'src', 'db', 'tables', '13_add_notes_to_breathing.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Aplicando migración 13_add_notes_to_breathing.sql...');
        await pool.query(sql);
        console.log('✅ Migración exitosa: Columna notes agregada.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en migración:', err);
        process.exit(1);
    }
}

runMigration();
