require('dotenv').config();

const API_URL = 'http://localhost:3001/api';

async function testBreathingAPI() {
    try {
        console.log('1. Autenticando (Login)...');
        const resLogin = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD
            })
        });

        if (!resLogin.ok) throw new Error(`Login falló: ${resLogin.statusText}`);
        const loginData = await resLogin.json();
        const token = loginData.token;
        console.log('✅ Login exitoso. Token obtenido.');

        console.log('2. Guardando sesión de respiración...');
        const resSave = await fetch(`${API_URL}/breathing/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                type: 'retention',
                duration_seconds: 60,
                rounds_data: [{ round: 1, duration: 30 }, { round: 2, duration: 30 }]
            })
        });

        if (resSave.ok) {
            const savedData = await resSave.json();
            console.log('✅ Sesión guardada exitosamente:', savedData);
        } else {
            console.error('❌ Error guardando sesión:', await resSave.text());
        }

        console.log('3. Consultando historial...');
        const resHistory = await fetch(`${API_URL}/breathing/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resHistory.ok) {
            const history = await resHistory.json();
            console.log(`✅ Historial obtenido. ${history.length} registros encontrados.`);
        } else {
            console.error('❌ Error obteniendo historial:', await resHistory.text());
        }

    } catch (err) {
        console.error('❌ Error en el test:', err);
    }
}

testBreathingAPI();
