const pool = require('../config/db');

/**
 * Guarda una sesión de respiración (guiada o retención).
 * POST /api/breathing/session
 */
const saveSession = async (req, res) => {
    try {
        const { type, duration_seconds, rounds_data } = req.body;
        const userId = req.user.id; // Asumiendo que el middleware de auth inyecta req.user

        if (!type || !duration_seconds) {
            return res.status(400).json({ error: 'Faltan campos requeridos (type, duration_seconds)' });
        }

        const query = `
            INSERT INTO breathing_exercises (user_id, type, duration_seconds, rounds_data)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const values = [userId, type, duration_seconds, JSON.stringify(rounds_data || [])];
        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error guardando sesión de respiración:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Obtiene el historial de sesiones de respiración del usuario.
 * GET /api/breathing/history
 */
const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT * FROM breathing_exercises 
            WHERE user_id = $1 
            ORDER BY created_at DESC
            LIMIT 50
        `;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error obteniendo historial:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    saveSession,
    getHistory
};
