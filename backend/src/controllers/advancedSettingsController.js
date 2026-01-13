const pool = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// === CONFIGURACIÓN DE SEGURIDAD (JWT) ===

exports.getSecuritySettings = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT updated_at FROM advanced_settings WHERE setting_key = 'jwt_secret'"
        );

        const hasCustomSecret = result.rows.length > 0;
        const lastUpdated = hasCustomSecret ? result.rows[0].updated_at : null;

        res.json({
            hasCustomJwtSecret: hasCustomSecret,
            jwtSecretLastUpdated: lastUpdated
        });
    } catch (err) {
        console.error('Error getting security settings:', err);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

exports.updateJwtSecret = async (req, res) => {
    const { newSecret, adminPassword } = req.body;
    const userId = req.user.id;

    if (!newSecret || newSecret.length < 32) {
        return res.status(400).json({ message: 'El secreto debe tener al menos 32 caracteres.' });
    }

    if (!adminPassword) {
        return res.status(400).json({ message: 'Se requiere la contraseña del administrador.' });
    }

    try {
        // Verificar contraseña del admin
        const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(adminPassword, userRes.rows[0].password_hash);
        if (!validPassword) {
            return res.status(403).json({ message: 'Contraseña incorrecta. No se autoriza el cambio.' });
        }

        // Encriptar para almacenamiento
        const encryptedSecret = encrypt(newSecret);

        // Guardar en BD (Upsert)
        await pool.query(
            `INSERT INTO advanced_settings (setting_key, setting_value, is_encrypted)
             VALUES ('jwt_secret', $1, true)
             ON CONFLICT (setting_key) 
             DO UPDATE SET setting_value = $1, is_encrypted = true, updated_at = CURRENT_TIMESTAMP`,
            [encryptedSecret]
        );

        // ACTUALIZAR EN MEMORIA INMEDIATAMENTE
        process.env.JWT_SECRET = newSecret;
        console.log('JWT_SECRET actualizado dinámicamente por Admin.');

        res.json({ message: 'Secreto JWT actualizado. Todas las sesiones anteriores han sido invalidadas.' });
    } catch (err) {
        console.error('Error updating JWT secret:', err);
        res.status(500).json({ message: 'Error al actualizar secreto JWT' });
    }
};


// === CONFIGURACIÓN DE IA (MODELOS + LÍMITES + TOGGLE) ===

exports.getAiSettings = async (req, res) => {
    try {
        // 1. Obtener Configuración General (Modelos + Toggle)
        // Buscamos en 'advanced_settings' primero (nueva ubicación segura)
        // Nota: Migraremos llm_* de app_settings si existen, pero por ahora leemos de advanced_settings
        // O mejor, soportamos ambos temporalmente o forzamos nueva tabla. Usaremos advanced_settings.

        const keys = ['ai_global_enabled', 'llm_provider', 'llm_model', 'llm_api_key', 'llm_provider_secondary', 'llm_model_secondary', 'llm_api_key_secondary'];

        const settingsRes = await pool.query(
            "SELECT setting_key, setting_value FROM advanced_settings WHERE setting_key = ANY($1)",
            [keys]
        );

        const settingsMap = {};
        settingsRes.rows.forEach(row => {
            settingsMap[row.setting_key] = row.setting_value;
        });

        const globalEnabled = settingsMap['ai_global_enabled'] === 'false' ? false : true;

        // 2. Obtener Límites por Roles
        const limitsRes = await pool.query(
            "SELECT role, daily_token_limit, daily_request_limit, enabled FROM ai_limits ORDER BY role"
        );

        res.json({
            globalEnabled,
            llm_provider: settingsMap['llm_provider'] || 'openai',
            llm_model: settingsMap['llm_model'] || '',
            llm_api_key: settingsMap['llm_api_key'] ? '••••••••' : '', // Masked
            llm_provider_secondary: settingsMap['llm_provider_secondary'] || '',
            llm_model_secondary: settingsMap['llm_model_secondary'] || '',
            llm_api_key_secondary: settingsMap['llm_api_key_secondary'] ? '••••••••' : '', // Masked
            limits: limitsRes.rows
        });
    } catch (err) {
        console.error('Error getting AI settings:', err);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

exports.updateAiSettings = async (req, res) => {
    const {
        globalEnabled, limits,
        llm_provider, llm_model, llm_api_key,
        llm_provider_secondary, llm_model_secondary, llm_api_key_secondary
    } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Helper upsert
        const upsertSetting = async (key, value, encryptValue = false) => {
            if (value === undefined) return;
            let finalValue = value;
            let isEncrypted = encryptValue;

            if (encryptValue) {
                // Si viene '••••••••', ignorar actualización
                if (value === '••••••••') return;
                finalValue = encrypt(value);
            } else {
                finalValue = String(value);
            }

            await client.query(
                `INSERT INTO advanced_settings (setting_key, setting_value, is_encrypted, updated_at)
                 VALUES ($1, $2, $3, NOW())
                 ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, is_encrypted = $3, updated_at = NOW()`,
                [key, finalValue, isEncrypted]
            );
        };

        // 1. Configuración General
        await upsertSetting('ai_global_enabled', globalEnabled);
        await upsertSetting('llm_provider', llm_provider);
        await upsertSetting('llm_model', llm_model);
        await upsertSetting('llm_api_key', llm_api_key, true); // Encrypted

        await upsertSetting('llm_provider_secondary', llm_provider_secondary);
        await upsertSetting('llm_model_secondary', llm_model_secondary);
        await upsertSetting('llm_api_key_secondary', llm_api_key_secondary, true); // Encrypted

        // 2. Límites
        if (Array.isArray(limits)) {
            for (const limit of limits) {
                await client.query(
                    `INSERT INTO ai_limits (role, daily_token_limit, daily_request_limit, enabled)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (role) DO UPDATE 
                     SET daily_token_limit = $2, daily_request_limit = $3, enabled = $4, updated_at = NOW()`,
                    [limit.role, limit.daily_token_limit, limit.daily_request_limit, limit.enabled]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Configuración de IA actualizada exitosamente' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating AI settings:', err);
        res.status(500).json({ message: 'Error al actualizar configuración de IA' });
    } finally {
        client.release();
    }
};
