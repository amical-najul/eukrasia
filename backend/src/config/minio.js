const Minio = require('minio');
require('dotenv').config();

if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY) {
    console.log('DEBUG: MinIO Config Failed. Endpoint:', process.env.MINIO_ENDPOINT);
    console.error('❌ FATAL: MinIO Configuration missing (MINIO_ENDPOINT, MINIO_ACCESS_KEY). Exiting.');
    process.exit(1);
}
console.log('DEBUG: MinIO Config Check Passed');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || ''
});

/**
 * Initialize MinIO Bucket and Set Public Policy (Once on Startup)
 * This replaces the per-request policy setting in userController.uploadAvatar
 */
const initMinIOBucket = async () => {
    const bucketName = process.env.MINIO_BUCKET_NAME;
    if (!bucketName) {
        console.warn('⚠️ MINIO_BUCKET_NAME not configured, skipping bucket init.');
        return;
    }

    try {
        // Ensure bucket exists
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            console.log(`📦 Creating MinIO bucket: ${bucketName}`);
            await minioClient.makeBucket(bucketName, 'us-east-1');
        }

        // Set Public Read Policy (Idempotent)
        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${bucketName}/*`]
                }
            ]
        };
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`✅ MinIO bucket "${bucketName}" initialized with public read policy.`);
    } catch (err) {
        console.error('❌ Failed to initialize MinIO bucket:', err.message);
    }
};

module.exports = minioClient;
module.exports.initMinIOBucket = initMinIOBucket;
