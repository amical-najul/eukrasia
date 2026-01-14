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

        // Find the last event that broke the fast (is_fasting_breaker = true)
        // This is the anchor for the "Fasting Timer".
        const lastBreakerQuery = `
            SELECT * FROM metabolic_logs 
            WHERE user_id = $1 
            AND is_fasting_breaker = TRUE
            ORDER BY created_at DESC 
            LIMIT 1
        `;

        const { rows } = await pool.query(lastBreakerQuery, [userId]);
        const lastBreaker = rows[0];

        if (!lastBreaker) {
            // No history, default state
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
        const eventTime = new Date(lastBreaker.created_at);
        const diffMs = now - eventTime;
        const hoursElapsed = diffMs / (1000 * 60 * 60);

        // Status is technically always counting up from last meal.
        const status = 'AYUNANDO';
        let phase = '';
        let phaseColor = '';

        // Calculate Phase logic
        if (hoursElapsed < 4) {
            phase = 'Digestión / Elevación Insulina';
            phaseColor = 'blue';
        } else if (hoursElapsed < 12) {
            phase = 'Anabólica / Descenso Insulina';
            phaseColor = 'blue';
        } else if (hoursElapsed < 16) {
            phase = 'Cetosis Ligera / Quema Grasa';
            phaseColor = 'green-light';
        } else if (hoursElapsed < 24) {
            phase = 'Autofagia Temprana';
            phaseColor = 'green-intense';
        } else if (hoursElapsed < 48) {
            phase = 'Pico HGH / Quema Profunda';
            phaseColor = 'yellow';
        } else if (hoursElapsed < 72) {
            phase = 'Reinicio Inmunitario';
            phaseColor = 'orange';
        } else {
            phase = 'Regeneración Celular Sistémica';
            phaseColor = 'red-gold';
        }

        res.json({
            status,
            phase,
            phaseColor,
            hours_elapsed: parseFloat(hoursElapsed.toFixed(2)),
            start_time: lastBreaker.created_at,
            last_event: lastBreaker
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
