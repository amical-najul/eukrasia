const pool = require('../config/db');

// --- Session Methods ---

const saveSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            target_duration_sec,
            actual_duration_sec,
            distraction_count,
            focus_object,
            status,
            notes
        } = req.body;

        const result = await pool.query(
            `INSERT INTO mind_sessions 
                (user_id, target_duration_sec, actual_duration_sec, distraction_count, focus_object, status, notes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [userId, target_duration_sec, actual_duration_sec, distraction_count || 0, focus_object, status, notes]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error saving mind session:', err);
        res.status(500).json({ error: 'Server error saving session' });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM mind_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching mind history:', err);
        res.status(500).json({ error: 'Server error fetching history' });
    }
};

// --- Configuration Methods ---

const getConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM mind_configurations WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // Return defaults if no config exists
            return res.json({
                default_focus_object: 'candle',
                default_duration_sec: 300,
                bg_sounds: true,
                transition_sounds: true,
                micro_shift: true
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error getting mind config:', err);
        res.status(500).json({ error: 'Server error fetching config' });
    }
};

const saveConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            default_focus_object,
            default_duration_sec,
            bg_sounds,
            transition_sounds,
            micro_shift
        } = req.body;

        const result = await pool.query(
            `INSERT INTO mind_configurations 
                (user_id, default_focus_object, default_duration_sec, bg_sounds, transition_sounds, micro_shift, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
                default_focus_object = EXCLUDED.default_focus_object,
                default_duration_sec = EXCLUDED.default_duration_sec,
                bg_sounds = EXCLUDED.bg_sounds,
                transition_sounds = EXCLUDED.transition_sounds,
                micro_shift = EXCLUDED.micro_shift,
                updated_at = NOW()
             RETURNING *`,
            [userId, default_focus_object, default_duration_sec, bg_sounds, transition_sounds, micro_shift]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error saving mind config:', err);
        res.status(500).json({ error: 'Server error saving config' });
    }
};

module.exports = {
    saveSession,
    getHistory,
    getConfig,
    saveConfig
};
