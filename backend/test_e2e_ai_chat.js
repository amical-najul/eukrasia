const API_URL = 'http://localhost:3001/api';
const EMAIL = 'jock@prueba.shop';
const PASSWORD = 'Admin123@';

async function testCompleteFlow() {
    try {
        console.log('🧪 TEST E2E: Análisis IA + Chat Interactivo\n');

        // 1. Login
        console.log('1️⃣  Login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${await loginRes.text()}`);
        const { token, user } = await loginRes.json();
        console.log(`   ✅ Login exitoso (Usuario: ${user.name}, ID: ${user.id})\n`);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Verificar configuración LLM
        console.log('2️⃣  Verificando configuración de IA...');
        const configRes = await fetch(`${API_URL}/users/llm-config`, { headers });

        if (!configRes.ok) {
            console.log('   ⚠️  No hay configuración. Configurando Gemini...');
            await fetch(`${API_URL}/users/llm-config`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    provider: 'gemini',
                    model: 'gemini-2.5-flash',
                    api_key: 'AIzaSyAWcHwRQYi-lpQed52D6k14F86Xuae-Z8s',
                    analysis_frequency: 'weekly'
                })
            });
            console.log('   ✅ Configuración creada\n');
        } else {
            const config = await configRes.json();
            console.log(`   ✅ Configuración existente: ${config.provider} - ${config.model}\n`);
        }

        // 3. Generar análisis
        console.log('3️⃣  Generando análisis de salud...');
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

        if (!analyzeRes.ok) {
            const errData = await analyzeRes.json();
            console.error(`   ❌ Error en análisis: ${errData.message}`);
            console.log(`\n   💡 Posibles causas:`);
            console.log(`      - Cuota de API excedida (429)`);
            console.log(`      - Modelo inválido (404)`);
            console.log(`      - API Key incorrecta\n`);
            throw new Error(errData.message);
        }

        const report = await analyzeRes.json();
        console.log(`   ✅ Análisis generado exitosamente!`);
        console.log(`   📊 Report ID: ${report.id}`);
        console.log(`   📝 Contenido: ${report.content.substring(0, 100)}...\n`);

        // 4. Test Chat Interactivo
        console.log('4️⃣  Probando chat interactivo...');
        const question = '¿Cuáles son las principales recomendaciones del análisis?';
        console.log(`   ❓ Pregunta: "${question}"`);

        const chatRes = await fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                reportId: report.id,
                question: question
            })
        });

        if (!chatRes.ok) {
            const errData = await chatRes.json();
            console.error(`   ❌ Error en chat: ${errData.message}`);
            throw new Error(errData.message);
        }

        const chatData = await chatRes.json();
        console.log(`   ✅ Respuesta recibida:`);
        console.log(`   💬 ${chatData.answer.substring(0, 200)}...\n`);

        // 5. Verificar historial
        console.log('5️⃣  Consultando historial de reportes...');
        const historyRes = await fetch(`${API_URL}/ai/reports`, { headers });
        const history = await historyRes.json();
        console.log(`   ✅ Total de reportes: ${history.length}`);
        console.log(`   📅 Reporte más reciente: ${new Date(history[0].created_at).toLocaleString()}\n`);

        console.log('🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!\n');
        console.log('Sistema completamente funcional:');
        console.log('  ✅ Generación de análisis con LLM');
        console.log('  ✅ Visualización de reportes');
        console.log('  ✅ Chat interactivo con contexto');
        console.log('  ✅ Historial persistente\n');

    } catch (error) {
        console.error('\n❌ TEST FALLÓ:', error.message);
        process.exit(1);
    }
}

testCompleteFlow();
