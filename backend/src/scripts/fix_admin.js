const pool = require('../config/db');

const fixAdmin = async () => {
    try {
        console.log('🔄 Updating Jock to admin...');
        const res = await pool.query("UPDATE users SET role = 'admin' WHERE email = 'jock.alcantara@gmail.com'");
        console.log(`✅ Updated ${res.rowCount} users.`);

        const check = await pool.query("SELECT email, role FROM users WHERE email = 'jock.alcantara@gmail.com'");
        console.log('📋 Current User State:', check.rows[0]);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

fixAdmin();
