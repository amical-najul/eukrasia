const AiAnalysisService = require('../services/aiAnalysisService');
const pool = require('../config/db');

exports.triggerAnalysis = async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, type = 'on-demand' } = req.body;

    // Validate dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default last 7 days
    const end = endDate ? new Date(endDate) : new Date();

    try {
        const result = await AiAnalysisService.generateAnalysis(userId, type, start, end);
        res.json(result);
    } catch (err) {
        console.error('Analysis Error:', err);
        res.status(500).json({ message: err.message || 'Error generating analysis' });
    }
};

exports.getReports = async (req, res) => {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    try {
        const result = await pool.query(
            `SELECT id, report_type, date_range_start, date_range_end, created_at 
             FROM ai_analysis_reports 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ message: 'Error retrieving reports' });
    }
};

exports.getReportById = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM ai_analysis_reports WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching report:', err);
        res.status(500).json({ message: 'Error retrieving report' });
    }
};
