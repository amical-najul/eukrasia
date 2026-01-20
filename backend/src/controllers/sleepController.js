const pool = require('../config/db');

exports.startSleep = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Ensure no active session exists
        const activeCheck = await pool.query(
            'SELECT id FROM sleep_sessions WHERE user_id = $1 AND end_time IS NULL',
            [userId]
        );

        if (activeCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Ya tienes una sesión de sueño activa.' });
        }

        const query = `
            INSERT INTO sleep_sessions (user_id, start_time)
            VALUES ($1, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const result = await pool.query(query, [userId]);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        next(err);
    }
};

exports.getStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT * FROM sleep_sessions 
            WHERE user_id = $1 
            ORDER BY start_time DESC 
            LIMIT 1
        `;
        const { rows } = await pool.query(query, [userId]);
        const lastSession = rows[0];

        if (lastSession && !lastSession.end_time) {
            return res.json({
                active: true,
                session: lastSession
            });
        }

        res.json({
            active: false,
            last_session: lastSession || null
        });

    } catch (err) {
        next(err);
    }
};

exports.endSleep = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { session_id, quality_score, symptoms, notes, manual_duration_minutes } = req.body;

        if (!session_id) return res.status(400).json({ message: 'Session ID es requerido.' });

        // Critical Apnea Symptoms
        const criticalSymptoms = ['RONQUIDO_FUERTE', 'AHOGO', 'BOCA_SECA'];
        const apneaFlag = Array.isArray(symptoms) && symptoms.some(s => criticalSymptoms.includes(s));

        const now = new Date();

        // Fetch session to calculate duration
        const sessionRes = await pool.query('SELECT start_time FROM sleep_sessions WHERE id = $1 AND user_id = $2', [session_id, userId]);
        if (sessionRes.rows.length === 0) return res.status(404).json({ message: 'Sesión no encontrada.' });

        const startTime = new Date(sessionRes.rows[0].start_time);
        let durationMinutes = Math.floor((now - startTime) / (1000 * 60));

        // Use manual duration if provided (explicit check for undefined to allow 0)
        if (manual_duration_minutes !== undefined && manual_duration_minutes !== null) {
            durationMinutes = manual_duration_minutes;
        }

        const query = `
            UPDATE sleep_sessions 
            SET end_time = $1,
                duration_minutes = $2,
                quality_score = $3,
                symptoms = $4,
                apnea_flag = $5,
                notes = $6
            WHERE id = $7 AND user_id = $8
            RETURNING *
        `;

        const values = [
            now,
            durationMinutes,
            quality_score !== undefined ? quality_score : 3,
            symptoms || [],
            apneaFlag,
            notes || null,
            session_id,
            userId
        ];
        const result = await pool.query(query, values);

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Error in endSleep:', err);
        next(err);
    }
};

exports.getHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;

        const query = `
            SELECT * FROM sleep_sessions 
            WHERE user_id = $1 AND end_time IS NOT NULL
            ORDER BY start_time DESC 
            LIMIT $2
        `;
        const { rows } = await pool.query(query, [userId, limit]);
        res.json(rows);
    } catch (err) {
        console.error('Error in getHistory:', err);
        next(err);
    }
};

exports.cancelSleep = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Delete only active session
        const query = `
            DELETE FROM sleep_sessions 
            WHERE user_id = $1 AND end_time IS NULL
            RETURNING id
        `;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No hay sesión activa para cancelar.' });
        }

        res.json({ message: 'Sesión cancelada exitosamente', id: result.rows[0].id });

    } catch (err) {
        console.error('Error in cancelSleep:', err);
        next(err);
    }
};

// Update a specific sleep record (for editing history)
exports.updateSleep = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { duration_minutes, notes, quality_score, symptoms } = req.body;

        // Recalculate apnea flag if symptoms are provided
        let apneaFlag = undefined;
        if (symptoms !== undefined && symptoms !== null) {
            const criticalSymptoms = ['RONQUIDO_FUERTE', 'AHOGO', 'BOCA_SECA'];
            apneaFlag = Array.isArray(symptoms) && symptoms.some(s => criticalSymptoms.includes(s));
        }

        const query = `
            UPDATE sleep_sessions 
            SET duration_minutes = COALESCE($1, duration_minutes),
                notes = COALESCE($2, notes),
                quality_score = COALESCE($3, quality_score),
                symptoms = COALESCE($4, symptoms),
                apnea_flag = COALESCE($5, apnea_flag)
            WHERE id = $6 AND user_id = $7
            RETURNING *
        `;

        // Explicitly map undefined to null for postgres driver
        const values = [
            duration_minutes !== undefined ? duration_minutes : null,
            notes !== undefined ? notes : null,
            quality_score !== undefined ? quality_score : null,
            symptoms !== undefined ? symptoms : null,
            apneaFlag !== undefined ? apneaFlag : null,
            id,
            userId
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado.' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Error in updateSleep:', err);
        next(err);
    }
};

// Delete a specific sleep record
exports.deleteSleep = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const query = `
            DELETE FROM sleep_sessions 
            WHERE id = $1 AND user_id = $2
            RETURNING id
        `;
        const result = await pool.query(query, [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado.' });
        }

        res.json({ message: 'Registro eliminado exitosamente.', id: result.rows[0].id });

    } catch (err) {
        next(err);
    }
};
