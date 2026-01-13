const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'eukrasia', // Use env or fallback
    ssl: false // explicit
});

async function main() {
    const client = await pool.connect();
    try {
        console.log(`Connected to database: ${process.env.DB_NAME}`);

        const email = 'jock.alcantara@gmail.com';
        const password = 'admin123';
        const name = 'Admin Jock';
        const role = 'admin';

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if exists
        const check = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            console.log('User already exists, updating role/password...');
            await client.query(
                'UPDATE users SET password_hash = $1, role = $2, name = $3, is_verified = true WHERE email = $4',
                [hashedPassword, role, name, email]
            );
        } else {
            console.log('Creating new admin user...');
            await client.query(
                `INSERT INTO users (email, password_hash, role, name, is_verified, active)
                 VALUES ($1, $2, $3, $4, true, true)`,
                [email, hashedPassword, role, name]
            );
        }

        console.log('Admin user seeded successfully!');
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
