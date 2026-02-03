const pool = require('../config/db');
const minioClient = require('../config/minio');
const sharp = require('sharp');

// --- Helper: MinIO Upload ---
const uploadToMinio = async (fileBuffer, userId) => {
    const timestamp = Date.now();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Path structure: {user_id}/{year}/{month}/{day}/{timestamp}.jpg
    const filename = `${userId}/${year}/${month}/${day}/${timestamp}.jpg`;
    const bucketName = process.env.S3_BUCKET_NAME || 'metabolic-tracking';

    // Compress with Sharp
    const compressedBuffer = await sharp(fileBuffer)
        .resize(1024, 1024, { fit: 'inside' }) // Max 1024px
        .jpeg({ quality: 80 }) // 80% JPEG quality
        .toBuffer();

    // Upload
    await minioClient.putObject(bucketName, filename, compressedBuffer, compressedBuffer.length, {
        'Content-Type': 'image/jpeg'
    });

    // Return URL (Assuming public bucket or handle presigned generation elsewhere)
    // For now, storing relative path or full internal URL. ideally, we store the relative path and public endpoint is handled by frontend or proxy.
    // Let's store the full public URL if possible, or just the path. 
    // Given previous context, let's look at how avatar is handled. Users generally prefer simple URLs.
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    const endpoint = process.env.MINIO_PUBLIC_ENDPOINT || `localhost:${process.env.MINIO_PORT || 9000}`;
    return `${protocol}://${endpoint}/${bucketName}/${filename}`;
};

// --- Controller Methods ---

exports.logEvent = async (req, res, next) => {
    try {
        const userId = req.user.id; // From Auth Middleware
        const { event_type, category, item_name, is_fasting_breaker, notes } = req.body;

        let imageUrl = null;

        // Handle Image Upload if present
        if (req.file) {
            try {
                imageUrl = await uploadToMinio(req.file.buffer, userId);
            } catch (err) {
                console.error('MinIO Upload Error:', err);
                return res.status(500).json({ message: 'Error subiendo la imagen' });
            }
        }

        // Insert into DB
        const query = `
            INSERT INTO metabolic_logs 
            (user_id, event_type, category, item_name, is_fasting_breaker, image_url, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            userId,
            event_type,
            category,
            item_name,
            is_fasting_breaker === 'true' || is_fasting_breaker === true, // handle multipart string 'true'
            imageUrl,
            notes
        ];

        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]);

    } catch (err) {
        next(err);
    }
};

exports.getStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Find the last 2 events that broke the fast (is_fasting_breaker = true)
        const lastBreakersQuery = `
            SELECT * FROM metabolic_logs 
            WHERE user_id = $1 
            AND is_fasting_breaker = TRUE
            ORDER BY created_at DESC 
            LIMIT 2
        `;

        const { rows: breakerRows } = await pool.query(lastBreakersQuery, [userId]);
        const lastBreaker = breakerRows[0];
        const prevBreaker = breakerRows[1];

        if (!lastBreaker) {
            return res.json({
                status: 'UNKNOWN',
                phase: 'Fase Inicial (Sin registros)',
                phaseColor: 'gray',
                hours_elapsed: 0,
                last_event: null
            });
        }

        // Determine State
        const now = new Date();
        const lastBreakerTime = new Date(lastBreaker.created_at);
        const hoursSinceLastMeal = (now - lastBreakerTime) / (1000 * 60 * 60);

        let status = 'AYUNANDO';
        let phase = '';
        let phaseColor = '';
        let refeedStatus = null;

        // 1. Calculate REFEEDING logic if applicable
        if (prevBreaker) {
            const prevBreakerTime = new Date(prevBreaker.created_at);
            const fastDurationHours = (lastBreakerTime - prevBreakerTime) / (1000 * 60 * 60);

            // Determine if the user is in the recovery window of that fast
            // Refeed window rules:
            let refeedWindow = 0;
            let protocolId = 0;

            if (fastDurationHours > 168) { // > 7 days
                refeedWindow = 96; // 4 days recovery
                protocolId = 4;
            } else if (fastDurationHours > 120) { // 5-7 days
                refeedWindow = 48; // 2 days
                protocolId = 3;
            } else if (fastDurationHours > 48) { // 2-5 days (including 72h)
                refeedWindow = 24; // 1 day
                protocolId = 2;
            } else if (fastDurationHours > 16) { // 16-24h (Intermittent Fasting)
                refeedWindow = 2; // 2 hours gentle refeed
                protocolId = 0; // Light protocol
            }

            if (hoursSinceLastMeal < refeedWindow) {
                status = 'RECUPERANDO';
                refeedStatus = {
                    fast_duration: parseFloat(fastDurationHours.toFixed(1)),
                    protocol_id: protocolId,
                    refeed_hours_left: parseFloat((refeedWindow - hoursSinceLastMeal).toFixed(1)),
                    total_refeed_window: refeedWindow
                };
            }
        }

        // 2. Calculate Fasting Phase logic
        if (hoursSinceLastMeal < 4) {
            phase = 'Fase 1: Fase Anabólica / Digestión';
            phaseColor = 'blue';
        } else if (hoursSinceLastMeal < 12) {
            phase = 'Fase 1: Fase Catabólica Temprana';
            phaseColor = 'cyan';
        } else if (hoursSinceLastMeal < 18) {
            phase = 'Fase 1: Inicio de la Quema de Grasa';
            phaseColor = 'teal';
        } else if (hoursSinceLastMeal < 24) {
            phase = 'Fase 1: Autofagia Leve';
            phaseColor = 'green-light';
        } else if (hoursSinceLastMeal < 36) {
            phase = 'Fase 2: Agotamiento de Glucógeno';
            phaseColor = 'green-intense';
        } else if (hoursSinceLastMeal < 48) {
            phase = 'Fase 2: Pico de Ghrelina';
            phaseColor = 'yellow';
        } else if (hoursSinceLastMeal < 72) {
            phase = 'Fase 2: Entrada en Cetosis Profunda';
            phaseColor = 'orange';
        } else if (hoursSinceLastMeal < 96) {
            phase = 'Fase 3: Autofagia Máxima e Inmunidad';
            phaseColor = 'red';
        } else if (hoursSinceLastMeal < 120) {
            phase = 'Fase 3: Limpieza Hepática Profunda';
            phaseColor = 'rose';
        } else if (hoursSinceLastMeal < 144) {
            phase = 'Fase 3: La Euforia del Ayunante';
            phaseColor = 'pink';
        } else if (hoursSinceLastMeal < 168) {
            phase = 'Fase 4: Regeneración Células Madre';
            phaseColor = 'purple';
        } else if (hoursSinceLastMeal < 192) {
            phase = 'Fase 4: Piel y Tejido Cicatrizado';
            phaseColor = 'violet';
        } else {
            phase = 'Fase 5: Ayuno Terapéutico Profundo';
            phaseColor = 'gold';
        }

        res.json({
            status,
            phase,
            phaseColor,
            hours_elapsed: parseFloat(hoursSinceLastMeal.toFixed(2)),
            start_time: lastBreaker.created_at,
            last_event: lastBreaker,
            refeed_status: refeedStatus,
            needs_electrolytes: hoursSinceLastMeal > 24
        });

    } catch (err) {
        next(err);
    }
};

exports.getHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        const query = `
            SELECT * FROM metabolic_logs 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2
        `;

        const { rows } = await pool.query(query, [userId, limit]);
        res.json(rows);

    } catch (err) {
        next(err);
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const eventId = req.params.id;

        // Delete only if owned by user
        const query = `
            DELETE FROM metabolic_logs 
            WHERE id = $1 AND user_id = $2
            RETURNING id
        `;

        const result = await pool.query(query, [eventId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado o no autorizado.' });
        }

        res.json({ message: 'Evento eliminado exitosamente', id: result.rows[0].id });

    } catch (err) {
        next(err);
    }
};

exports.updateEvent = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const eventId = req.params.id;
        const { notes, created_at } = req.body;

        // Validate ownership
        const checkQuery = 'SELECT * FROM metabolic_logs WHERE id = $1 AND user_id = $2';
        const checkResult = await pool.query(checkQuery, [eventId, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado o no autorizado.' });
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (notes !== undefined) {
            updates.push(`notes = $${paramIndex++}`);
            values.push(notes);
        }
        if (created_at) {
            const newDate = new Date(created_at);
            const now = new Date();
            const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));

            if (newDate > now) {
                return res.status(400).json({ message: 'No puedes registrar un evento en el futuro.' });
            }

            // Removed 72h restriction based on user audit request
            updates.push(`created_at = $${paramIndex++}`);
            values.push(newDate);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No hay campos para actualizar.' });
        }

        values.push(eventId, userId);
        const updateQuery = `
            UPDATE metabolic_logs 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
            RETURNING *
        `;

        const result = await pool.query(updateQuery, values);
        res.json(result.rows[0]);

    } catch (err) {
        next(err);
    }
};
