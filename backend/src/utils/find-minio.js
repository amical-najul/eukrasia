const Minio = require('minio');

const configs = [
    { endPoint: '136.112.251.204', port: 9000, useSSL: false, name: 'IP:9000' },
    { endPoint: '136.112.251.204', port: 80, useSSL: false, name: 'IP:80' },
    { endPoint: 'files.n8nprueba.shop', port: 443, useSSL: true, name: 'Domain:443 (SSL)' },
    { endPoint: 'files.n8nprueba.shop', port: 80, useSSL: false, name: 'Domain:80' },
    { endPoint: 'files.n8nprueba.shop', port: 9000, useSSL: false, name: 'Domain:9000' }
];

const testConnection = async (config) => {
    console.log(`\nTesting: ${config.name} -> ${config.endPoint}:${config.port} (SSL: ${config.useSSL})`);
    try {
        const client = new Minio.Client({
            endPoint: config.endPoint,
            port: config.port,
            useSSL: config.useSSL,
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY
        });

        // Try to list buckets with a timeout
        const buckets = await Promise.race([
            client.listBuckets(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout 5s')), 5000))
        ]);

        console.log('✅ SUCCESS!');
        console.log(`   Buckets found: ${buckets && buckets.length}`);
        return true;
    } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
        return false;
    }
};

const run = async () => {
    console.log(`Using credentials AccessKey: ${process.env.MINIO_ACCESS_KEY ? '*****' : 'MISSING'}`);

    for (const config of configs) {
        const success = await testConnection(config);
        if (success) {
            console.log(`\n🎉 FOUND WORKING CONFIGURATION: ${config.name}`);
            console.log('--- Config to Apply ---');
            console.log(`MINIO_ENDPOINT=${config.endPoint}`);
            console.log(`MINIO_PORT=${config.port}`);
            console.log(`MINIO_USE_SSL=${config.useSSL}`);
            return; // Stop after finding the first working one
        }
    }
    console.log('\n❌ No working configuration found.');
};

run();
