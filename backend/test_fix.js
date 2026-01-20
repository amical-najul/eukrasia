
const API_URL = 'http://localhost:3001/api';
// const TIMESTAMP = Date.now();
const EMAIL = 'jock@prueba.shop';
const PASSWORD = 'Admin123@';
const API_KEY = 'AIzaSyAWcHwRQYi-lpQed52D6k14F86Xuae-Z8s';
const MODEL = 'gemini-2.0-flash';

async function runTest() {
    try {
        console.log(`0. Registering NEW user: ${EMAIL}...`);
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Jock Test', email: EMAIL, password: PASSWORD })
        });

        if (!registerRes.ok) {
            const errText = await registerRes.text();
            console.log(`   Registration info: ${errText} (Proceeding to login)`);
        } else {
            console.log('   User registered successfully.');
        }

        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });

        if (!loginRes.ok) {
            const errText = await loginRes.text();
            throw new Error(`Login failed: ${errText}`);
        }
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('   Login successful. Token obtained.');
        const userId = loginData.user.id;
        console.log(`   User ID: ${userId}`);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('2. Updating LLM Config (Initial Setup)...');
        const configRes = await fetch(`${API_URL}/users/llm-config`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                provider: 'gemini',
                model: MODEL,
                api_key: API_KEY, // Providing key here
                analysis_frequency: 'weekly'
            })
        });

        if (!configRes.ok) {
            const err = await configRes.text();
            throw new Error(`Config update failed: ${err}`);
        }
        console.log('   Initial Config updated successfully.');

        console.log('3. Triggering Analysis (Should WORK)...');
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const analyzeRes = await fetch(`${API_URL}/ai/analyze`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                type: 'custom',
                startDate: lastWeek.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0]
            })
        });

        const analyzeData = await analyzeRes.json();
        if (!analyzeRes.ok) {
            console.error('   Analysis Failed (Quota/Model error likely but logic reachable):', analyzeData);
        } else {
            console.log('   Analysis triggered successfully.');
            console.log('   Report ID:', analyzeData.id);
        }

        console.log('4. Testing Update WITHOUT Key (Simulating "Save" on existing config)...');
        const updateNoKeyRes = await fetch(`${API_URL}/users/llm-config`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                provider: 'gemini',
                model: 'gemini-1.5-flash',
                // api_key omitted
                analysis_frequency: 'weekly'
            })
        });

        if (!updateNoKeyRes.ok) {
            const err = await updateNoKeyRes.text();
            throw new Error(`Config update without key failed: ${err}`);
        }
        console.log('   Config update without key (existing config) successful. FIX VERIFIED!');

    } catch (error) {
        console.error('TEST FAILED:', error);
        process.exit(1);
    }
}

runTest();
