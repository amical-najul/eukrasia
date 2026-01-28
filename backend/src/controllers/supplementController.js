const pool = require('../config/db');

// Mapping of internal IDs to Display Names for the general log
const SUPPLEMENT_NAMES = {
    'vit_d_k_mg': 'Vitamina D + K + Magnesio',
    'omega_3': 'Omega 3',
    'minerales_mix': 'Minerales (Mix)',
    'triple_magnesium': 'Triple Magnesium',
    'coq10': 'Coenzima Q10',
    'vit_b12': 'Vitamina B12',
    'enzimas_digestivas': 'Enzimas Digestivas',
    'picolinato_cromo': 'Picolinato de Cromo',
    'creatina': 'Creatina',
    'complejo_b': 'Complejo B'
};

exports.getDailyLog = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date } = req.query; // YYYY-MM-DD

        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida' });
        }

        const query = `
            SELECT supplement_id, consumed_at 
            FROM supplement_logs 
            WHERE user_id = $1 AND date = $2
        `;

        const { rows } = await pool.query(query, [userId, date]);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.toggleLog = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { supplement_id, date } = req.body;

        if (!supplement_id || !date) {
            return res.status(400).json({ message: 'Supplement ID y fecha son requeridos' });
        }

        // Check if exists in supplement_logs (single source of truth)
        const checkQuery = `
            SELECT id FROM supplement_logs 
            WHERE user_id = $1 AND supplement_id = $2 AND date = $3
        `;
        const { rows } = await pool.query(checkQuery, [userId, supplement_id, date]);

        if (rows.length > 0) {
            // Delete (toggle off)
            await pool.query('DELETE FROM supplement_logs WHERE id = $1', [rows[0].id]);
            res.json({ status: 'removed', supplement_id });
        } else {
            // Insert (toggle on)
            await pool.query(
                'INSERT INTO supplement_logs (user_id, supplement_id, date) VALUES ($1, $2, $3)',
                [userId, supplement_id, date]
            );
            res.json({ status: 'added', supplement_id });
        }

    } catch (err) {
        next(err);
    }
};
