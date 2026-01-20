const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function fixGeminiModels() {
    try {
        // Update only OBSOLETE/INVALID Gemini models to a valid current one
        // Preview models with specific dates are deprecated; update to stable versions
        const invalidModels = [
            'gemini-2.5-pro-preview-05-06',  // Old dated preview
            'gemini-2.0-flash-exp',           // Experimental (replaced by 2.5/3.0)
            'gemini-2.0-flash'                // Not in official docs
        ];

        const res = await pool.query(`
            UPDATE user_llm_config 
            SET model = 'gemini-2.5-flash', updated_at = NOW()
            WHERE provider = 'gemini' 
            AND model = ANY($1::text[])
            RETURNING user_id, model;
        `, [invalidModels]);

        console.log(`Updated ${res.rowCount} user(s) with obsolete Gemini models to 'gemini-2.5-flash'`);
        if (res.rows.length > 0) {
            console.log('Updated users:', res.rows);
        }
    } catch (err) {
        console.error('Error fixing models:', err);
    } finally {
        await pool.end();
    }
}

fixGeminiModels();
