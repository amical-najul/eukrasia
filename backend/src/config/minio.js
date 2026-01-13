const Minio = require('minio');
require('dotenv').config();

if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY) {
    console.log('DEBUG: MinIO Config Failed. Endpoint:', process.env.MINIO_ENDPOINT);
    console.error('❌ FATAL: MinIO Configuration missing (MINIO_ENDPOINT, MINIO_ACCESS_KEY). Exiting.');
    process.exit(1);
    // console.warn('⚠️ MinIO Config Missing - Tests continuing in "Weak Mode"');
}
console.log('DEBUG: MinIO Config Check Passed');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || ''
});

module.exports = minioClient;
