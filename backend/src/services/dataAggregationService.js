const pool = require('../config/db');

class DataAggregationService {
    // Helper to format date for SQL
    static formatDate(date) {
        return date.toISOString();
    }

    static async getUserData(userId, startDate, endDate) {
        const client = await pool.connect();
        try {
            const data = {};

            // 1. User Profile & Goals
            const userRes = await client.query(
                'SELECT name, email FROM users WHERE id = $1',
                [userId]
            );
            data.profile = userRes.rows[0];
            data.range = { startDate, endDate };

            // 2. Breathing Sessions
            const breathingRes = await client.query(
                `SELECT type, duration_seconds, created_at, notes 
                 FROM breathing_exercises 
                 WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
                 ORDER BY created_at ASC`,
                [userId, this.formatDate(startDate), this.formatDate(endDate)]
            );
            data.breathing = breathingRes.rows;

            // 3. Nutrition & Symptoms (Metabolic Logs)
            const metabolicRes = await client.query(
                `SELECT event_type, category, item_name, is_fasting_breaker, created_at, notes
                 FROM metabolic_logs 
                 WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
                 ORDER BY created_at ASC`,
                [userId, this.formatDate(startDate), this.formatDate(endDate)]
            );

            data.nutrition = metabolicRes.rows.filter(r => r.event_type === 'CONSUMO');
            data.fasting = metabolicRes.rows.filter(r => r.event_type === 'INICIO_AYUNO');
            data.symptoms = metabolicRes.rows.filter(r => r.event_type === 'SINTOMA');

            // 4. Sleep
            const sleepRes = await client.query(
                `SELECT start_time, end_time, duration_minutes, quality_score, symptoms, notes
                 FROM sleep_sessions 
                 WHERE user_id = $1 AND start_time BETWEEN $2 AND $3
                 ORDER BY start_time ASC`,
                [userId, this.formatDate(startDate), this.formatDate(endDate)]
            );
            data.sleep = sleepRes.rows;

            // Add Sleep Symptoms to main symptoms list
            sleepRes.rows.forEach(session => {
                if (session.symptoms) {
                    data.symptoms.push({
                        event_type: 'SINTOMA_SUENO',
                        item_name: session.symptoms,
                        created_at: session.end_time,
                        source: 'Sleep Tracker'
                    });
                }
            });

            // 5. Body (Weight & Measurements)
            const weightRes = await client.query(
                `SELECT weight, recorded_at, note FROM body_weight_logs 
                 WHERE user_id = $1 AND recorded_at BETWEEN $2 AND $3 
                 ORDER BY recorded_at ASC`,
                [userId, this.formatDate(startDate), this.formatDate(endDate)]
            );

            const measurementsRes = await client.query(
                `SELECT measurement_type, value, unit, recorded_at, note 
                 FROM body_measurements
                 WHERE user_id = $1 AND recorded_at BETWEEN $2 AND $3
                 ORDER BY recorded_at ASC`,
                [userId, this.formatDate(startDate), this.formatDate(endDate)]
            );

            // Latest Weight Goal
            const goalRes = await client.query(
                `SELECT target_weight FROM body_weight_goals 
                  WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1`,
                [userId]
            );

            data.body = {
                weight_logs: weightRes.rows,
                measurements: measurementsRes.rows,
                weight_goal: goalRes.rows[0] || null
            };

            // 6. Mind (Sessions)
            try {
                const mindRes = await client.query(
                    `SELECT type, duration_seconds, created_at 
                     FROM mind_sessions 
                     WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
                     ORDER BY created_at ASC`,
                    [userId, this.formatDate(startDate), this.formatDate(endDate)]
                );
                data.mind = mindRes.rows;
            } catch (e) {
                console.warn('Mind sessions table might be missing or empty', e.message);
                data.mind = [];
            }

            return data;

        } catch (err) {
            console.error('Error aggregating user data:', err);
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = DataAggregationService;
