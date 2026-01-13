const pool = require('../config/db');
const bcrypt = require('bcrypt');

const setupTestUsers = async () => {
    try {
        const password = '123456';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // 1. Setup Clara (Admin)
        console.log('--- Setting up Admin (Clara) ---');
        const claraCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['clara@gmail.com']);
        if (claraCheck.rows.length > 0) {
            await pool.query(
                "UPDATE users SET password_hash = $1, role = 'admin', active = true, is_verified = true, name = 'Clara Admin' WHERE email = $2",
                [hash, 'clara@gmail.com']
            );
            console.log('✅ Clara updated');
        } else {
            await pool.query(
                "INSERT INTO users (email, password_hash, role, active, is_verified, name, language_preference) VALUES ($1, $2, 'admin', true, true, 'Clara Admin', 'es')",
                ['clara@gmail.com', hash]
            );
            console.log('✅ Clara created');
        }

        // 2. Setup Ana (User)
        console.log('--- Setting up User (Ana) ---');
        const anaCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['ana@gmail.com']);
        if (anaCheck.rows.length > 0) {
            await pool.query(
                "UPDATE users SET password_hash = $1, role = 'user', active = true, is_verified = true, name = 'Ana User' WHERE email = $2",
                [hash, 'ana@gmail.com']
            );
            console.log('✅ Ana updated');
        } else {
            await pool.query(
                "INSERT INTO users (email, password_hash, role, active, is_verified, name, language_preference) VALUES ($1, $2, 'user', true, true, 'Ana User', 'es')",
                ['ana@gmail.com', hash]
            );
            console.log('✅ Ana created');
        }

    } catch (err) {
        console.error('❌ Error setting up users:', err);
    } finally {
        await pool.end();
    }
};

setupTestUsers();
