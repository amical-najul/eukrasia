const pool = require('../config/db');

// --- Session History Methods ---

const saveSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, duration_seconds, rounds_data } = req.body;

        const result = await pool.query(
            'INSERT INTO breathing_exercises (user_id, type, duration_seconds, rounds_data) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, type, duration_seconds, JSON.stringify(rounds_data)]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error saving session:', err);
        res.status(500).json({ error: 'Server error saving session' });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM breathing_exercises WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Server error fetching history' });
    }
};

// --- Configuration Methods ---

const getBreathingConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM breathing_configurations WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // Fetch system defaults
            const defaultsResult = await pool.query(
                "SELECT setting_value FROM app_settings WHERE setting_key = 'hexagon_breathing_defaults'"
            );

            let defaults = {
                rounds: 3,
                breaths_per_round: 30,
                speed: 'standard',
                bg_music: true,
                phase_music: true,
                retention_music: true,
                voice_guide: true,
                breathing_guide: true,
                retention_guide: true,
                ping_gong: true,
                breath_sounds: true
            };

            if (defaultsResult.rows.length > 0) {
                try {
                    const sysDefaults = JSON.parse(defaultsResult.rows[0].setting_value);
                    defaults = { ...defaults, ...sysDefaults };
                } catch (e) {
                    console.error('Error parsing system defaults', e);
                }
            }

            return res.json(defaults);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error getting config:', err);
        res.status(500).json({ error: 'Server error fetching config' });
    }
};

const saveBreathingConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            rounds, breaths_per_round, speed,
            bg_music, phase_music, retention_music,
            voice_guide, breathing_guide, retention_guide,
            ping_gong, breath_sounds
        } = req.body;

        const result = await pool.query(
            `INSERT INTO breathing_configurations (
                user_id, rounds, breaths_per_round, speed,
                bg_music, phase_music, retention_music,
                voice_guide, breathing_guide, retention_guide,
                ping_gong, breath_sounds, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                rounds = EXCLUDED.rounds,
                breaths_per_round = EXCLUDED.breaths_per_round,
                speed = EXCLUDED.speed,
                bg_music = EXCLUDED.bg_music,
                phase_music = EXCLUDED.phase_music,
                retention_music = EXCLUDED.retention_music,
                voice_guide = EXCLUDED.voice_guide,
                breathing_guide = EXCLUDED.breathing_guide,
                retention_guide = EXCLUDED.retention_guide,
                ping_gong = EXCLUDED.ping_gong,
                breath_sounds = EXCLUDED.breath_sounds,
                updated_at = NOW()
            RETURNING *`,
            [
                userId, rounds, breaths_per_round, speed,
                bg_music, phase_music, retention_music,
                voice_guide, breathing_guide, retention_guide,
                ping_gong, breath_sounds
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error saving config:', err);
        res.status(500).json({ error: 'Server error saving config' });
    }
};

module.exports = {
    saveSession,
    getHistory,
    getBreathingConfig,
    saveBreathingConfig
};
