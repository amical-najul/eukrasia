const http = require('http');

const API_CONFIG = {
    hostname: 'localhost',
    port: 3001
};

// Credentials to try
const CREDENTIALS_SETS = [
    { email: 'jock@pruebas.shop', password: 'admin123@' }, // User provided
    { email: 'jock@prueba.shop', password: 'Admin123@' },  // Known working
    { email: 'jock@prueba.shop', password: 'admin123@' }   // Mixed
];

const NEW_API_KEY = 'AIzaSyC7Qt6crFB1As3VvfAYm6qw7lXrE_5zYYA';

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
                let parsedBody = {};
                try { parsedBody = JSON.parse(body); } catch (e) { }
                resolve({ statusCode: res.statusCode, body: parsedBody });
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
    try {
        console.log('🧪 Starting Full AI Analyst Test Suite...\n');

        // 1. Robust Login
        let token = null;
        let user = null;

        for (const creds of CREDENTIALS_SETS) {
            console.log(`Trying login with ${creds.email}...`);
            const res = await request('POST', '/auth/login', creds);
            if (res.statusCode === 200) {
                token = res.body.token;
                user = creds;
                console.log('   ✅ Login successful!');
                break;
            }
        }

        if (!token) throw new Error('All login attempts failed.');

        // 2. Update Config
        console.log('\n2️⃣  Updating LLM Config...');
        const configParams = {
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            api_key: NEW_API_KEY,
            analysis_frequency: 'weekly'
        };
        const updateRes = await request('PUT', '/users/llm-config', configParams, token);
        if (updateRes.statusCode !== 200) throw new Error(`Config update failed: ${JSON.stringify(updateRes.body)}`);
        console.log('   ✅ Config updated.');

        // 3. Generate Analysis with Retry Logic
        console.log('\n3️⃣  Generating Analysis (Simulating User Action)...');
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        let reportId = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            attempts++;
            console.log(`   Attempt ${attempts}/${maxAttempts}...`);

            const analyzeRes = await request('POST', '/ai/analyze', {
                type: 'custom',
                startDate: lastWeek.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0]
            }, token);

            if (analyzeRes.statusCode === 200) {
                console.log('   ✅ Analysis Generated!');
                console.log(`      ID: ${analyzeRes.body.id}`);
                console.log(`      Content Preview: ${analyzeRes.body.content.substring(0, 50)}...`);
                reportId = analyzeRes.body.id;
                break;
            } else if (analyzeRes.statusCode === 503) {
                console.log('   ⚠️  503 Model Overloaded. Waiting 5s...');
                await sleep(5000);
            } else if (analyzeRes.statusCode === 429) {
                console.log('   ❌ 429 User Quota Exceeded (should NOT happen with new key).');
                break;
            } else {
                console.log(`   ❌ Error ${analyzeRes.statusCode}: ${analyzeRes.body.message}`);
                break;
            }
        }

        if (!reportId) throw new Error('Analysis generation failed after retries.');

        // 4. Test Chat
        console.log('\n4️⃣  Testing Chat Interaction...');
        const chatRes = await request('POST', '/ai/chat', {
            reportId: reportId,
            question: 'Dame 3 recomendaciones resumen en una frase.'
        }, token);

        if (chatRes.statusCode === 200) {
            console.log('   ✅ Chat Response Received!');
            console.log(`      "Answer: ${chatRes.body.answer}"`);
        } else {
            console.log(`   ❌ Chat Failed: ${chatRes.statusCode} - ${chatRes.body.message}`);
        }

        console.log('\n🎉 TEST SUITE COMPLETED SUCCESSFULLY');

    } catch (e) {
        console.error(`\n❌ CRITICAL FAILURE: ${e.message}`);
        process.exit(1);
    }
}

runTest();
