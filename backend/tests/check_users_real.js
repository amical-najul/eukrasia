const pool = require('../src/config/db');

async function checkUsers() {
    try {
        console.log('--- Verificando Usuarios en DB ---');
        const res = await pool.query('SELECT id, email, role, is_verified, active FROM users LIMIT 10');
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error al conectar con DB:', err.message);
        process.exit(1);
    }
}

checkUsers();
