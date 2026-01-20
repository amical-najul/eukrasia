const http = require('http');

const API_CONFIG = {
    hostname: 'localhost',
    port: 3001
};

const USER = {
    email: 'jock@prueba.shop',
    password: 'Admin123@'
};

const NEW_API_KEY = 'AIzaSyC7Qt6crFB1As3VvfAYm6qw7lXrE_5zYYA'; // Provided by user

// Helper for requests
function request(method, path, data, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            ...API_CONFIG,
            path: `/api${path}`,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const response = {
                    statusCode: res.statusCode,
                    body: body ? JSON.parse(body) : {}
                };
                resolve(response);
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTest() {
    try {
        console.log('🔑 Testing New API Key...\n');

        // 1. Login
        console.log('1️⃣  Logging in...');
        const loginRes = await request('POST', '/auth/login', USER);
        if (loginRes.statusCode !== 200) throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
        const token = loginRes.body.token;
        console.log('   ✅ Login successful');

        // 2. Initial Config Check
        console.log('2️⃣  Checking current config...');
        const configRes = await request('GET', '/users/llm-config', null, token);
        console.log(`   Current Config: ${configRes.body.provider} / ${configRes.body.model}`);

        // 3. Update with NEW Key (and set to gemini-2.5-flash)
        console.log('3️⃣  Updating to New API Key & Gemini 2.5 Flash...');
        const updateRes = await request('PUT', '/users/llm-config', {
            provider: 'gemini',
            model: 'gemini-2.5-flash', // Using lighter model
            api_key: NEW_API_KEY,
            analysis_frequency: 'weekly'
        }, token);

        if (updateRes.statusCode !== 200) throw new Error(`Update failed: ${JSON.stringify(updateRes.body)}`);
        console.log('   ✅ Key updated successfully');

        // 4. Trigger Analysis
        console.log('4️⃣  Generating Analysis...');
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const analyzeRes = await request('POST', '/ai/analyze', {
            type: 'custom',
            startDate: lastWeek.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        }, token);

        if (analyzeRes.statusCode === 200) {
            console.log('\n🎉 SUCCESS! Analysis Generated.');
            console.log(`   Report ID: ${analyzeRes.body.id}`);
            console.log(`   Preview: ${analyzeRes.body.content.substring(0, 100)}...`);
        } else {
            console.error('\n❌ ANALYSIS FAILED');
            console.error(`   Status: ${analyzeRes.statusCode}`);
            console.error(`   Error: ${JSON.stringify(analyzeRes.body)}`);

            if (analyzeRes.statusCode === 429) {
                console.log('\n⚠️  DIAGNOSIS: Quota Exceeded (429)');
                console.log('   Even with the new key, the quota limit is hit.');
                console.log('   Recommendation: Wait a few minutes or verify billing/free tier limits.');
            }
        }

    } catch (error) {
        console.error('\n❌ TEST SCRIPT ERROR:', error.message);
    }
}

runTest();
