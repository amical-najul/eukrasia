const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const runSeed = async () => {
    try {
        const seedPath = path.join(__dirname, '../db/seeds/i18n_migration_part1.sql');
        console.log(`Reading seed file from: ${seedPath}`);

        const sql = fs.readFileSync(seedPath, 'utf8');
        console.log('Executing SQL...');

        await pool.query(sql);

        console.log('✅ Seed executed successfully!');
    } catch (err) {
        console.error('❌ Error executing seed:', err);
    } finally {
        await pool.end();
    }
};

runSeed();
