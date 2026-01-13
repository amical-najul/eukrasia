const pool = require('../config/db');

const debugTranslations = async () => {
    try {
        console.log('--- SCHEMA ---');
        const schema = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'translations'");
        console.log(schema.rows);

        console.log('--- SAMPLE DATA ---');
        const data = await pool.query("SELECT * FROM translations WHERE key IN ('settings.title', 'dashboard.welcome_user')");
        console.log(JSON.stringify(data.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
};

debugTranslations();
