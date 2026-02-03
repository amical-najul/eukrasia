const pool = require('../config/db');

/**
 * BODY DATA CONTROLLER
 * Handles Weight tracking, BMI calculation, and Body Measurements
 */

// --- UTILS ---
const calculateBMI = (weightKg, heightCm) => {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(2);
};

const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { category: 'Bajo peso', color: 'blue' };
    if (bmi < 25) return { category: 'Normal', color: 'green' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'yellow' };
    if (bmi < 35) return { category: 'Obesidad I', color: 'orange' };
    if (bmi < 40) return { category: 'Obesidad II', color: 'red' };
    if (bmi < 40) return { category: 'Obesidad II', color: 'red' };
    return { category: 'Obesidad III', color: 'darkred' };
};

const ALLOWED_MEASUREMENT_TYPES = [
    'BP_SYS', 'BP_DIA', 'HEART_RATE', 'GLUCOSE',
    'HEIGHT', 'WEIGHT', // Though WEIGHT usually has its own table, keeping for robustness
    'CHEST', 'WAIST', 'HIPS', 'THIGH', 'ABDOMEN', 'NECK', 'BICEP'
];

// --- CONTROLLERS ---

// GET /api/body/summary
// Returns latest weight, active goal, BMI, and latest measurements
exports.getSummary = async (req, res) => {
    try {
        const userId = req.user.id; // From Auth Middleware

        // 1. Get User Profile (for Height) -> inferred from user settings or defaults
        // Note: Assuming 'height_cm' might be in a future 'user_profiles' table or we just store it in settings.
        // For now, let's look for it in 'advanced_settings' if exists, or return null.
        // TODO: Add height to user profile. for now returning null if not found.

        // 2. Get Latest Weight
        const weightQuery = `
            SELECT id, weight, recorded_at 
            FROM body_weight_logs 
            WHERE user_id = $1 
            ORDER BY recorded_at DESC 
            LIMIT 1
        `;
        const weightRes = await pool.query(weightQuery, [userId]);
        const currentWeight = weightRes.rows[0] || null;

        // 3. Get Active Goal
        const goalQuery = `
            SELECT start_weight, target_weight, start_date, target_date
            FROM body_weight_goals
            WHERE user_id = $1 AND is_active = TRUE
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const goalRes = await pool.query(goalQuery, [userId]);
        const currentGoal = goalRes.rows[0] || null;

        // 4. Get Latest Measurements (One per type)
        const measurementsQuery = `
            SELECT DISTINCT ON (measurement_type) 
                id, measurement_type, value, unit, recorded_at 
            FROM body_measurements 
            WHERE user_id = $1
            ORDER BY measurement_type, recorded_at DESC
        `;
        const measRes = await pool.query(measurementsQuery, [userId]);

        // Transform measurements to object map
        const measurements = {};
        measRes.rows.forEach(row => {
            measurements[row.measurement_type] = row;
        });

        // 5. Calculate BMI
        // Fetch latest HEIGHT measurement
        const heightQuery = `
            SELECT value 
            FROM body_measurements 
            WHERE user_id = $1 AND measurement_type = 'HEIGHT'
            ORDER BY recorded_at DESC 
            LIMIT 1
        `;
        const heightRes = await pool.query(heightQuery, [userId]);
        const heightVal = heightRes.rows[0]?.value || null; // Height in cm

        const bmiVal = (currentWeight && heightVal) ? calculateBMI(currentWeight.weight, heightVal) : null;
        const bmiData = bmiVal ? { value: bmiVal, ...getBMICategory(bmiVal) } : null;

        res.json({
            weight: currentWeight,
            goal: currentGoal,
            bmi: bmiData,
            measurements: measurements,
            height: heightVal // Return height so frontend can display it
        });

    } catch (err) {
        console.error('Error fetching body summary:', err);
        res.status(500).json({ error: 'Server error fetching body data' });
    }
};

// GET /api/body/history
// Query Params: period (day, week, month, all), type (weight, measurement), subtype (waist, chest...)
exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = 'weight', subtype, period = 'month' } = req.query;

        let query = '';
        let params = [userId];

        // Date Filter Logic
        let dateFilter = '';
        if (period === 'week') dateFilter = "AND recorded_at >= NOW() - INTERVAL '7 days'";
        if (period === 'month') dateFilter = "AND recorded_at >= NOW() - INTERVAL '30 days'";
        if (period === 'year') dateFilter = "AND recorded_at >= NOW() - INTERVAL '1 year'";

        if (type === 'weight') {
            query = `
                SELECT id, weight as value, recorded_at 
                FROM body_weight_logs 
                WHERE user_id = $1 ${dateFilter}
                ORDER BY recorded_at ASC
            `;
        } else if (type === 'measurement') {
            query = `
                SELECT value, recorded_at, measurement_type 
                FROM body_measurements 
                WHERE user_id = $1 ${dateFilter}
            `;

            if (subtype) {
                query += ` AND measurement_type = $2`;
                params.push(subtype);
            }

            query += ` ORDER BY recorded_at ASC`;
        } else {
            return res.status(400).json({ error: 'Invalid parameters' });
        }

        const result = await pool.query(query, params);
        res.json(result.rows);

    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Server error fetching history' });
    }
};

// POST /api/body/log/weight
exports.logWeight = async (req, res) => {
    try {
        const userId = req.user.id;
        const { weight, note, date } = req.body; // Date optional

        if (!weight) return res.status(400).json({ error: 'Weight is required' });

        const recordedAt = date ? new Date(date) : new Date();

        // One weight per day constraint: delete any existing weight for this date
        const startOfDay = new Date(recordedAt);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(recordedAt);
        endOfDay.setHours(23, 59, 59, 999);

        await pool.query(
            `DELETE FROM body_weight_logs WHERE user_id = $1 AND recorded_at >= $2 AND recorded_at <= $3`,
            [userId, startOfDay, endOfDay]
        );

        const insertQuery = `
            INSERT INTO body_weight_logs (user_id, weight, note, recorded_at)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(insertQuery, [userId, weight, note, recordedAt]);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('Error logging weight:', err);
        res.status(500).json({ error: 'Server error logging weight' });
    }
};

// POST /api/body/log/measurement
exports.logMeasurement = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, value, unit = 'cm', note, date, is_fasting } = req.body;

        if (!type || !value) return res.status(400).json({ error: 'Type and Value are required' });

        if (!ALLOWED_MEASUREMENT_TYPES.includes(type)) {
            return res.status(400).json({ error: `Invalid measurement type. Allowed: ${ALLOWED_MEASUREMENT_TYPES.join(', ')}` });
        }

        const recordedAt = date ? new Date(date) : new Date();
        let fastingDuration = null;

        // Calculate Fasting Duration if requested
        if (is_fasting) {
            // Find the last event that broke the fast (is_fasting_breaker = true) BEFORE the measurement time
            const lastBreakerQuery = `
                SELECT created_at FROM metabolic_logs 
                WHERE user_id = $1 
                AND is_fasting_breaker = TRUE
                AND created_at < $2
                ORDER BY created_at DESC 
                LIMIT 1
            `;
            const breakerRes = await pool.query(lastBreakerQuery, [userId, recordedAt]);

            if (breakerRes.rows.length > 0) {
                const lastMealTime = new Date(breakerRes.rows[0].created_at);
                const diffMs = recordedAt - lastMealTime;
                fastingDuration = (diffMs / (1000 * 60 * 60)).toFixed(2); // Duration in hours
            } else {
                // Determine if we should treat no log as 0 or null. 
                // Logic: If they say they are fasting but we have no log, maybe they assume we know since ever?
                // For safety, let's leave it null but log "is_fasting" as true, meaning "user said so".
                fastingDuration = null;
            }
        }

        const insertQuery = `
            INSERT INTO body_measurements (user_id, measurement_type, value, unit, recorded_at, note, is_fasting, fasting_duration)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const result = await pool.query(insertQuery, [
            userId,
            type,
            value,
            unit,
            recordedAt,
            note,
            is_fasting || false,
            fastingDuration
        ]);

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('Error logging measurement:', err);
        res.status(500).json({ error: 'Server error logging measurement' });
    }
};

// POST /api/body/goal
exports.setGoal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start_weight, target_weight, start_date, target_date } = req.body;

        if (!start_weight || !target_weight) return res.status(400).json({ error: 'Start and Target weight required' });

        // Deactivate old goals
        await pool.query('UPDATE body_weight_goals SET is_active = FALSE WHERE user_id = $1', [userId]);

        const insertQuery = `
            INSERT INTO body_weight_goals (user_id, start_weight, target_weight, start_date, target_date, is_active)
            VALUES ($1, $2, $3, $4, $5, TRUE)
            RETURNING *
        `;

        const result = await pool.query(insertQuery, [
            userId,
            start_weight,
            target_weight,
            start_date || new Date(),
            target_date
        ]);

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('Error setting goal:', err);
        res.status(500).json({ error: 'Server error setting goal' });
    }
};

// PUT /api/body/weight/:id
exports.updateWeight = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { weight, note, date } = req.body;

        if (!weight) return res.status(400).json({ error: 'Weight is required' });

        // Verify ownership
        const checkQuery = 'SELECT id FROM body_weight_logs WHERE id = $1 AND user_id = $2';
        const checkResult = await pool.query(checkQuery, [id, userId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        const updateQuery = `
            UPDATE body_weight_logs 
            SET weight = $1, note = $2, recorded_at = COALESCE($3, recorded_at)
            WHERE id = $4 AND user_id = $5
            RETURNING *
        `;
        const result = await pool.query(updateQuery, [weight, note, date, id, userId]);
        res.json(result.rows[0]);

    } catch (err) {
        console.error('Error updating weight:', err);
        res.status(500).json({ error: 'Server error updating weight' });
    }
};

// PUT /api/body/measurement/:id
exports.updateMeasurement = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { value, note, date, is_fasting } = req.body;

        if (!value) return res.status(400).json({ error: 'Value is required' });

        // Verify ownership
        const checkQuery = 'SELECT id, recorded_at, note FROM body_measurements WHERE id = $1 AND user_id = $2';
        const checkResult = await pool.query(checkQuery, [id, userId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        const currentRecordedAt = checkResult.rows[0].recorded_at;
        const currentNote = checkResult.rows[0].note;

        const newRecordedAt = date ? new Date(date) : currentRecordedAt;
        const newNote = note !== undefined ? note : currentNote;

        let fastingDuration = null;
        let updateFasting = false;

        // Recalculate fasting duration if is_fasting is explicitly true provided
        if (is_fasting !== undefined) {
            updateFasting = true;
            if (is_fasting) {
                const lastBreakerQuery = `
                    SELECT created_at FROM metabolic_logs 
                    WHERE user_id = $1 
                    AND is_fasting_breaker = TRUE
                    AND created_at < $2
                    ORDER BY created_at DESC 
                    LIMIT 1
                `;
                const breakerRes = await pool.query(lastBreakerQuery, [userId, newRecordedAt]);

                if (breakerRes.rows.length > 0) {
                    const lastMealTime = new Date(breakerRes.rows[0].created_at);
                    const diffMs = newRecordedAt - lastMealTime;
                    fastingDuration = (diffMs / (1000 * 60 * 60)).toFixed(2);
                }
            }
        }

        let query = `UPDATE body_measurements SET value = $1, note = $2, recorded_at = $3`;
        const params = [value, newNote, newRecordedAt];
        let pIdx = 4;

        if (updateFasting) {
            query += `, is_fasting = $${pIdx++}, fasting_duration = $${pIdx++}`;
            params.push(is_fasting, fastingDuration);
        }

        query += ` WHERE id = $${pIdx++} AND user_id = $${pIdx} RETURNING *`;
        params.push(id, userId);

        const result = await pool.query(query, params);
        res.json(result.rows[0] || { success: true });

    } catch (err) {
        console.error('Error updating measurement:', err);
        res.status(500).json({ error: 'Server error updating measurement' });
    }
};

// DELETE /api/body/weight/:id
exports.deleteWeight = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const deleteQuery = `
            DELETE FROM body_weight_logs 
            WHERE id = $1 AND user_id = $2
            RETURNING id
        `;
        const result = await pool.query(deleteQuery, [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.json({ success: true, message: 'Weight record deleted' });

    } catch (err) {
        console.error('Error deleting weight:', err);
        res.status(500).json({ error: 'Server error deleting weight' });
    }
};

// DELETE /api/body/measurement/:id
exports.deleteMeasurement = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const deleteQuery = `
            DELETE FROM body_measurements 
            WHERE id = $1 AND user_id = $2
            RETURNING id
        `;
        const result = await pool.query(deleteQuery, [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.json({ success: true, message: 'Measurement record deleted' });

    } catch (err) {
        console.error('Error deleting measurement:', err);
        res.status(500).json({ error: 'Server error deleting measurement' });
    }
};
