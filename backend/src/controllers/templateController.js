const pool = require('../config/db');

// Get all templates
exports.getAllTemplates = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM email_templates ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener plantillas' });
    }
};

// Get template by key
exports.getTemplate = async (req, res) => {
    const { key } = req.params;
    try {
        const result = await pool.query('SELECT * FROM email_templates WHERE template_key = $1', [key]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Plantilla no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener plantilla' });
    }
};

// Update or create template
exports.updateTemplate = async (req, res) => {
    const { key } = req.params;
    const { sender_name, sender_email, reply_to, subject, body_html, body_text } = req.body;

    try {
        // Check if exists
        const existing = await pool.query('SELECT * FROM email_templates WHERE template_key = $1', [key]);

        if (existing.rows.length > 0) {
            // Update
            const result = await pool.query(
                `UPDATE email_templates 
                 SET sender_name = $1, sender_email = $2, reply_to = $3, subject = $4, body_html = $5, body_text = $6, updated_at = CURRENT_TIMESTAMP
                 WHERE template_key = $7 
                 RETURNING *`,
                [sender_name, sender_email, reply_to, subject, body_html, body_text || '', key]
            );
            res.json(result.rows[0]);
        } else {
            // Insert
            const result = await pool.query(
                `INSERT INTO email_templates (template_key, sender_name, sender_email, reply_to, subject, body_html, body_text) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) 
                 RETURNING *`,
                [key, sender_name, sender_email, reply_to, subject, body_html, body_text || '']
            );
            res.status(201).json(result.rows[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al guardar plantilla' });
    }
};
