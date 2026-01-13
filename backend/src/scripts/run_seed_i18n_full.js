const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const runSeed = async () => {
    try {
        const seedPath = path.join(__dirname, '../db/seeds/i18n_migration_full.sql');
        console.log(`Reading seed file from: ${seedPath}`);

        const sql = fs.readFileSync(seedPath, 'utf8');
        console.log('Executing SQL...');

        await pool.query(sql);

        console.log('✅ Full Seed executed successfully!');
    } catch (err) {
        console.error('❌ Error executing seed:', err);
    } finally {
        await pool.end();
    }
};

runSeed();
