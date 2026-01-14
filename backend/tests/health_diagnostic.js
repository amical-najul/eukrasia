const API_URL = 'http://localhost:3001/api';
let token = '';

async function login() {
    console.log('--- Identificando Usuario (Admin) ---');
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'jock.alcantara@gmail.com',
                password: 'admin123'
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Login failed with status ${res.status}`);
        token = data.token;
        console.log('✅ Login exitoso');
    } catch (err) {
        console.error('❌ Login fallido:', err.message);
        process.exit(1);
    }
}

async function cleanupSleep() {
    console.log('\n--- Limpieza de Sesiones Previas ---');
    try {
        const res = await fetch(`${API_URL}/sleep/status`, {
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (data.active) {
            console.log('   ⚠️ Sesión activa detectada. Finalizando...');
            await fetch(`${API_URL}/sleep/end`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    session_id: data.session.id,
                    quality_score: 3,
                    symptoms: [],
                    notes: 'Cleanup auto'
                })
            });
            console.log('   ✅ Sesión previa cerrada.');
        } else {
            console.log('   ✅ No hay sesiones activas.');
        }
    } catch (err) {
        console.error('   ❌ Error en cleanup:', err.message);
    }
}

async function testSleep() {
    console.log('\n--- Pruebas Módulo Sueño ---');
    try {
        // 1. Start Sleep
        console.log('1. Iniciando Sesión de Sueño...');
        const startRes = await fetch(`${API_URL}/sleep/start`, {
            method: 'POST',
            headers: { 'x-auth-token': token }
        });
        const startData = await startRes.json();
        if (!startRes.ok) throw new Error(`Start failed: ${startData.message}`);

        const sessionId = startData.id;
        console.log('   ✅ Sesión iniciada:', sessionId);

        // 2. End Sleep with Apnea Symptoms
        console.log('2. Finalizando Sueño con síntomas de Apnea...');
        const endRes = await fetch(`${API_URL}/sleep/end`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                session_id: sessionId,
                quality_score: 1,
                symptoms: ['AHOGO', 'RONQUIDO_FUERTE'],
                notes: 'Prueba de diagnóstico de apnea'
            })
        });
        const endData = await endRes.json();
        if (!endRes.ok) throw new Error(`End failed: ${endData.message}`);

        console.log('   ✅ Sesión finalizada');
        console.log('   ✅ Apnea Flag:', endData.apnea_flag ? '⚠️ DETECTADA (Correcto)' : '❌ NO DETECTADA');

    } catch (err) {
        console.error('❌ Error en Sleep:', err.message);
    }
}

async function runDiagnostic() {
    await login();
    await cleanupSleep();
    // Metabolic test skipped for brevity since it worked, but I can keep it if needed.
    await testSleep();
    console.log('\n--- Diagnóstico Backend Finalizado ---');
}

runDiagnostic();
