require('dotenv').config();
console.log('Testing MinIO Load...');
try {
    const minioClient = require('../src/config/minio');
    console.log('MinIO Loaded Successfully');
} catch (err) {
    console.error('MinIO Load Failed:', err);
}
