const Minio = require('minio');
require('dotenv').config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

async function checkMinio() {
    console.log('Checking MinIO Connection...');
    console.log('Endpoint:', process.env.MINIO_ENDPOINT);
    console.log('Port:', process.env.MINIO_PORT);
    console.log('Bucket:', process.env.MINIO_BUCKET_NAME);

    try {
        const buckets = await minioClient.listBuckets();
        console.log('✅ Connection Successful. Buckets:', buckets.map(b => b.name));

        const bucketName = process.env.MINIO_BUCKET_NAME || 'public-assets';
        const exists = await minioClient.bucketExists(bucketName);
        console.log(`Bucket '${bucketName}' exists? ${exists}`);

        if (!exists) {
            console.log('Attempts to create bucket...');
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log('Bucket created.');
        }

    } catch (err) {
        console.error('❌ MinIO Error:', err);
    }
}

checkMinio();
