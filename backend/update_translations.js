const pool = require('./src/config/db');

async function run() {
    try {
        console.log('Updating translations...');
        await pool.query(`
            INSERT INTO translations (key, category, translations) 
            VALUES ($1, $2, $3)
            ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations
        `, ['settings.dashboardLayout', 'settings', {
            es: 'Visualización Vertical dashboard',
            pt: 'Visualização Vertical do Dashboard',
            en: 'Vertical Dashboard View'
        }]);

        await pool.query(`
            INSERT INTO translations (key, category, translations) 
            VALUES ($1, $2, $3)
            ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations
        `, ['settings.dashboardLayout_desc', 'settings', {
            es: 'Cambiar entre vista de hexágonos y lista.',
            pt: 'Alternar entre vista de hexágonos e lista.',
            en: 'Switch between hexagon and list view.'
        }]);

        console.log('✅ Translations updated successfully.');
    } catch (err) {
        console.error('❌ Error updating translations:', err);
    } finally {
        await pool.end();
    }
}

run();
