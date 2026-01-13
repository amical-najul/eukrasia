const pool = require('./src/config/db');

async function checkTables() {
    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        console.log('\n=== TABLAS EN BASE DE DATOS ===');
        result.rows.forEach(r => console.log(`✓ ${r.table_name}`));

        // Check password_reset_tokens
        const resetTokens = await pool.query('SELECT COUNT(*) FROM password_reset_tokens');
        console.log(`\n✓ password_reset_tokens: ${resetTokens.rows[0].count} registros`);

        // Check email_change_tokens
        const emailTokens = await pool.query('SELECT COUNT(*) FROM email_change_tokens');
        console.log(`✓ email_change_tokens: ${emailTokens.rows[0].count} registros`);

        // Check users
        const users = await pool.query('SELECT COUNT(*) FROM users');
        console.log(`✓ users: ${users.rows[0].count} registros`);

        console.log('\n=== VERIFICACIÓN COMPLETADA ===\n');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkTables();
