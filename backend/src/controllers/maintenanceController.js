const pool = require('../config/db');
const minioClient = require('../config/minio');
const bcrypt = require('bcrypt');

// Helper to scan for orphans
const scanForOrphans = async () => {
    const bucketName = process.env.MINIO_BUCKET_NAME;
    if (!bucketName) throw new Error('MinIO bucket not configured');

    const client = await pool.connect();
    try {
        // 1. Get all valid Avatar URLs from Database (users + history)
        const validFiles = new Set();
        const usersResult = await client.query('SELECT avatar_url FROM users WHERE avatar_url IS NOT NULL');
        const historyResult = await client.query('SELECT avatar_url FROM avatar_history');

        const extractKey = (url) => {
            if (!url) return null;
            const index = url.indexOf('/avatars/');
            if (index !== -1) return url.substring(index + 1);
            return null;
        };

        usersResult.rows.forEach(row => { const key = extractKey(row.avatar_url); if (key) validFiles.add(key); });
        historyResult.rows.forEach(row => { const key = extractKey(row.avatar_url); if (key) validFiles.add(key); });

        // 2. Scan MinIO
        const orphans = [];
        let totalSize = 0;
        const objectsStream = minioClient.listObjects(bucketName, 'avatars/', true);

        await new Promise((resolve, reject) => {
            objectsStream.on('data', obj => {
                if (!validFiles.has(obj.name)) {
                    orphans.push(obj.name);
                    totalSize += obj.size;
                }
            });
            objectsStream.on('error', err => reject(err));
            objectsStream.on('end', () => resolve());
        });

        // 3. Discover Folders (Prefixes at root)
        const folders = new Set();
        try {
            const rootStream = minioClient.listObjects(bucketName, '', false); // Non-recursive
            await new Promise((resolve, reject) => {
                rootStream.on('data', obj => {
                    if (obj.prefix) folders.add(obj.prefix);
                });
                rootStream.on('error', err => reject(err));
                rootStream.on('end', () => resolve());
            });
        } catch (e) {
            console.warn('Error listing root folders:', e);
        }

        // 4. Endpoint Info
        const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
        const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || 'localhost';
        const port = process.env.MINIO_PORT;
        const portStr = (port === '80' || port === '443') ? '' : `:${port}`;
        const endpoint = `${protocol}://${publicEndpoint}${portStr}`;

        return { orphans, totalSize, validCount: validFiles.size, bucketName, endpoint, folders: Array.from(folders) };
    } finally {
        client.release();
    }
};

exports.analyzeOrphanedFiles = async (req, res) => {
    try {
        const { orphans, totalSize, validCount, bucketName, endpoint, folders } = await scanForOrphans();
        res.json({
            info: {
                endpoint,
                bucket: bucketName,
                folders
            },
            stats: {
                total_db_files: validCount,
                orphans_found: orphans.length,
                reclaimable_space_bytes: totalSize
            }
        });
    } catch (err) {
        console.error('Analysis Error:', err);
        res.status(500).json({ message: 'Error durante el análisis', error: err.message });
    }
};

exports.cleanupOrphanedFiles = async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!password) {
        return res.status(400).json({ message: 'Se requiere contraseña para confirmar.' });
    }

    const client = await pool.connect();

    try {
        // 1. Verify Password
        const userRes = await client.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        const valid = await bcrypt.compare(password, userRes.rows[0].password_hash);
        if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta' });

        // 2. Scan again (to be safe and stateless)
        const { orphans, bucketName } = await scanForOrphans();

        // 3. Delete Orphans
        let deletedCount = 0;
        let errorsCount = 0;

        for (const orphan of orphans) {
            try {
                await minioClient.removeObject(bucketName, orphan);
                deletedCount++;
            } catch (err) {
                console.error(`Failed to delete ${orphan}:`, err);
                errorsCount++;
            }
        }

        res.json({
            message: 'Limpieza completada',
            stats: {
                orphans_found: orphans.length,
                deleted: deletedCount,
                errors: errorsCount
            }
        });

    } catch (err) {
        console.error('Cleanup Error:', err);
        res.status(500).json({ message: 'Error durante la limpieza', error: err.message });
    } finally {
        client.release();
    }
};
