// Test E2E con la nueva Interactions API
const EMAIL = 'jock@prueba.shop';
const PASSWORD = 'Admin123@';

async function testWithNewAPI() {
    const http = require('http');

    function request(method, path, data) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 3001,
                path: `/api${path}`,
                method,
                headers: { 'Content-Type': 'application/json' }
            };

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 400) {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    } else {
                        resolve(JSON.parse(body));
                    }
                });
            });

            req.on('error', reject);
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    }

    try {
        console.log('🧪 Testing Gemini Interactions API\n');

        // 1. Login
        console.log('1. Login...');
        const { token } = await request('POST', '/auth/login', { email: EMAIL, password: PASSWORD });
        console.log('   ✅ Login exitoso\n');

        const authRequest = (method, path, data) => {
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: 'localhost',
                    port: 3001,
                    path: `/api${path}`,
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                };
                const req = http.request(options, (res) => {
                    let body = '';
                    res.on('data', chunk => body += chunk);
                    res.on('end', () => {
                        if (res.statusCode >= 400) {
                            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                        } else {
                            resolve(JSON.parse(body));
                        }
                    });
                });
                req.on('error', reject);
                if (data) req.write(JSON.stringify(data));
                req.end();
            });
        };

        // 2. Generar análisis
        console.log('2. Generando análisis con Gemini Interactions API...');
        const report = await authRequest('POST', '/ai/analyze', {
            type: 'weekly',
            startDate: '2026-01-13',
            endDate: '2026-01-20'
        });
        console.log(`   ✅ Análisis generado (ID: ${report.id})`);
        console.log(`   📝 Preview: ${report.content.substring(0, 150)}...\n`);

        // 3. Chat interactivo
        console.log('3. Probando chat con contexto...');
        const chat = await authRequest('POST', '/ai/chat', {
            reportId: report.id,
            question: '¿Cuáles son las 3 recomendaciones principales?'
        });
        console.log(`   ✅ Respuesta recibida:`);
        console.log(`   💬 ${chat.answer.substring(0, 200)}...\n`);

        console.log('✅ ¡MIGRACIÓN EXITOSA!');
        console.log('   Sistema usando Gemini Interactions API oficial');
        console.log('   Chat funcional con contexto de reportes\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testWithNewAPI();
