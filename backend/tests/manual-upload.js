require('dotenv').config();
const minioClient = require('../src/config/minio');

async function testUpload() {
    console.log('--- MinIO Manual Upload Test ---');
    const bucketName = process.env.MINIO_BUCKET_NAME || 'pruebas';
    console.log('Bucket:', bucketName);
    console.log('Endpoint:', process.env.MINIO_ENDPOINT);

    try {
        console.log('Checking bucket exists...');
        const exists = await minioClient.bucketExists(bucketName);
        console.log('Bucket exists:', exists);

        if (!exists) {
            console.log('Creating bucket...');
            await minioClient.makeBucket(bucketName, 'us-east-1');
        }

        console.log('Uploading test object...');
        await minioClient.putObject(bucketName, 'debug-test.txt', Buffer.from('Hello World'), { 'Content-Type': 'text/plain' });
        console.log('Upload SUCCESS');

        console.log('Removing test object...');
        await minioClient.removeObject(bucketName, 'debug-test.txt');
        console.log('Cleanup SUCCESS');

    } catch (err) {
        console.error('FAIL:', err);
    }
}

testUpload();
