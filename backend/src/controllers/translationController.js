const pool = require('../config/db');

// Get all translations for a language (public - no auth required)
exports.getTranslations = async (req, res) => {
    const { lang } = req.params;
    const validLangs = ['es', 'en', 'pt'];
    const language = validLangs.includes(lang) ? lang : 'es'; // Default to Spanish

    try {
        const result = await pool.query(
            'SELECT key, category, translations FROM translations'
        );

        // Transform to flat key:value object
        const translations = {};
        result.rows.forEach(row => {
            const value = row.translations[language] || row.translations['es'] || '';
            translations[row.key] = value;
        });

        res.json({
            language,
            translations
        });
    } catch (err) {
        console.error('Error fetching translations:', err);
        res.status(500).json({ message: 'Error al obtener traducciones' });
    }
};

// Get translations grouped by category
exports.getTranslationsByCategory = async (req, res) => {
    const { lang, category } = req.params;
    const validLangs = ['es', 'en', 'pt'];
    const language = validLangs.includes(lang) ? lang : 'es';

    try {
        const result = await pool.query(
            'SELECT key, translations FROM translations WHERE category = $1',
            [category]
        );

        const translations = {};
        result.rows.forEach(row => {
            const value = row.translations[language] || row.translations['es'] || '';
            translations[row.key] = value;
        });

        res.json({
            language,
            category,
            translations
        });
    } catch (err) {
        console.error('Error fetching translations by category:', err);
        res.status(500).json({ message: 'Error al obtener traducciones' });
    }
};

// Update or create a translation (admin only)
exports.upsertTranslation = async (req, res) => {
    const { key, category = 'common', translations } = req.body;

    if (!key || !translations) {
        return res.status(400).json({ message: 'Key y translations son requeridos' });
    }

    try {
        await pool.query(
            `INSERT INTO translations (key, category, translations, updated_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             ON CONFLICT (key) 
             DO UPDATE SET translations = $3, category = $2, updated_at = CURRENT_TIMESTAMP`,
            [key, category, JSON.stringify(translations)]
        );

        res.json({
            success: true,
            message: 'Traducción guardada correctamente'
        });
    } catch (err) {
        console.error('Error saving translation:', err);
        res.status(500).json({ message: 'Error al guardar traducción' });
    }
};

// Get available languages
exports.getAvailableLanguages = async (req, res) => {
    res.json({
        languages: [
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'pt', name: 'Português', flag: '🇧🇷' }
        ],
        default: 'es'
    });
};
