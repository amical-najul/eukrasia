const fs = require('fs');

const API_URL = 'http://localhost:3000/api';

async function testCurrentFlow() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'jock.alcantara@gmail.com',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login Success. Token length:', token.length);

        console.log('2. Preparing upload...');
        const dummyImage = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRA==', 'base64');
        const blob = new Blob([dummyImage], { type: 'image/gif' });

        const formData = new FormData();
        formData.append('avatar', blob, 'test-avatar.gif');

        console.log('3. Uploading...');
        const uploadRes = await fetch(`${API_URL}/users/avatar`, {
            method: 'POST',
            headers: {
                'x-auth-token': token
            },
            body: formData
        });

        console.log('Upload Status:', uploadRes.status);
        const text = await uploadRes.text();
        console.log('Upload Response Body:', text);

    } catch (err) {
        console.error('FAIL:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
    }
}

testCurrentFlow();
