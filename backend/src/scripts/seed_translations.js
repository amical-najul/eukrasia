const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // ssl: { rejectUnauthorized: false } // SSL disabled for dev/local
});

const seedFile = path.join(__dirname, '../db/seeds/02_translations_seed.sql');

async function seed() {
    try {
        console.log('Reading seed file...');
        const sql = fs.readFileSync(seedFile, 'utf8');
        console.log('Executing seed...');
        await pool.query(sql);
        console.log('✅ Translations seeded successfully!');
    } catch (err) {
        console.error('❌ Error seeding translations:', err);
    } finally {
        await pool.end();
    }
}

seed();
