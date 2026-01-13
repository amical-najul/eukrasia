const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ENV_PATH = path.join(__dirname, '../../../.env');
const PORTAINER_ENV_PATH = path.join(__dirname, '../../../portainer.env');

// Defaults
const defaults = {
    PORT: '3001',
    NODE_ENV: 'production',
    DB_HOST: 'db', // Portainer internal service name
    DB_PORT: '5432',
    DB_USER: 'postgres',
    DB_NAME: 'app_db',
    DB_PASSWORD: '',
    MINIO_ENDPOINT: 'minio',
    MINIO_PORT: '9000',
    MINIO_BUCKET_NAME: 'app-files',
    MINIO_USE_SSL: 'false',
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '587',
    FRONTEND_URL: '',
    VITE_APP_NAME: 'Mi Nueva App',
    DOMAIN_NAME: ''
};

const questions = [
    { key: 'VITE_APP_NAME', question: '📛 Nombre del Proyecto (e.g. "Mi App"): ' },
    { key: 'DOMAIN_NAME', question: '🌐 Dominio de Producción (e.g. "miapp.com"): ' },
    { key: 'DB_HOST', question: '🗄️  Host de BD (default: db para Docker, IP externa para Portainer): ' },
    { key: 'DB_NAME', question: '🗄️  Nombre de la BD (default: app_db): ' },
    { key: 'DB_USER', question: '🗄️  Usuario de BD (default: postgres): ' },
    { key: 'DB_PASSWORD', question: '🔐 Password de BD (vacío = generar uno seguro): ' },
    { key: 'MINIO_ENDPOINT', question: '📦 Endpoint MinIO (IP o dominio, e.g. "files.miapp.com"): ' },
    { key: 'MINIO_ACCESS_KEY', question: '📦 MinIO Access Key (vacío = generar): ' },
    { key: 'MINIO_SECRET_KEY', question: '📦 MinIO Secret Key (vacío = generar): ' },
    { key: 'ADMIN_EMAIL', question: '👤 Email del Admin inicial (default: admin@local.com): ' },
    { key: 'ADMIN_PASSWORD', question: '👤 Password del Admin (vacío = "admin123"): ' },
    { key: 'SMTP_USER', question: '✉️  Usuario SMTP (email para enviar correos): ' },
    { key: 'SMTP_PASS', question: '✉️  Password SMTP (app password de Gmail, etc.): ' }
];

const answers = { ...defaults };

const generateSecret = (length = 32) => crypto.randomBytes(length).toString('hex');
const generateMinioKey = () => crypto.randomBytes(10).toString('hex').toUpperCase();

const ask = (index) => {
    if (index >= questions.length) {
        finish();
        return;
    }

    const q = questions[index];
    rl.question(q.question, (answer) => {
        if (answer.trim()) {
            answers[q.key] = answer.trim();
        }
        ask(index + 1);
    });
};

const finish = () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧  Generando Configuración Segura...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Auto-generate secrets if empty
    if (!answers.JWT_SECRET) answers.JWT_SECRET = generateSecret(64);
    if (!answers.DB_PASSWORD) answers.DB_PASSWORD = generateSecret(24);
    if (!answers.MINIO_ACCESS_KEY) answers.MINIO_ACCESS_KEY = generateMinioKey();
    if (!answers.MINIO_SECRET_KEY) answers.MINIO_SECRET_KEY = generateSecret(32);
    if (!answers.ADMIN_EMAIL) answers.ADMIN_EMAIL = 'admin@local.com';
    if (!answers.ADMIN_PASSWORD) answers.ADMIN_PASSWORD = 'admin123';
    if (!answers.SMTP_USER) answers.SMTP_USER = '';
    if (!answers.SMTP_PASS) answers.SMTP_PASS = '';

    // Derived URLs
    const isLocal = !answers.DOMAIN_NAME || answers.DOMAIN_NAME === 'localhost';
    answers.FRONTEND_URL = isLocal ? 'http://localhost:8080' : `https://${answers.DOMAIN_NAME}`;
    answers.VITE_API_URL = isLocal ? 'http://localhost:3001/api' : `https://api.${answers.DOMAIN_NAME}/api`;
    answers.ACME_EMAIL = answers.ADMIN_EMAIL;

    // === 1. Generate .env (for local development) ===
    let envContent = `# Generado por Setup Wizard - ${new Date().toISOString()}\n\n`;
    envContent += `# Servidor\nPORT=${answers.PORT}\nNODE_ENV=development\n\n`;
    envContent += `# Base de Datos\nDB_HOST=localhost\nDB_PORT=${answers.DB_PORT}\nDB_USER=${answers.DB_USER}\nDB_PASSWORD=${answers.DB_PASSWORD}\nDB_NAME=${answers.DB_NAME}\n\n`;
    envContent += `# Seguridad\nJWT_SECRET=${answers.JWT_SECRET}\n\n`;
    envContent += `# Admin\nADMIN_EMAIL=${answers.ADMIN_EMAIL}\nADMIN_PASSWORD=${answers.ADMIN_PASSWORD}\n\n`;
    envContent += `# MinIO\nMINIO_ENDPOINT=${answers.MINIO_ENDPOINT}\nMINIO_PORT=${answers.MINIO_PORT}\nMINIO_USE_SSL=${answers.MINIO_USE_SSL}\nMINIO_BUCKET_NAME=${answers.MINIO_BUCKET_NAME}\nMINIO_ACCESS_KEY=${answers.MINIO_ACCESS_KEY}\nMINIO_SECRET_KEY=${answers.MINIO_SECRET_KEY}\n\n`;
    envContent += `# Email\nSMTP_HOST=${answers.SMTP_HOST}\nSMTP_PORT=${answers.SMTP_PORT}\nSMTP_USER=${answers.SMTP_USER}\nSMTP_PASS=${answers.SMTP_PASS}\n\n`;
    envContent += `# Frontend\nFRONTEND_URL=http://localhost:8080\nVITE_APP_NAME=${answers.VITE_APP_NAME}\n\n`;
    envContent += `# Producción\nDOMAIN_NAME=${answers.DOMAIN_NAME}\nACME_EMAIL=${answers.ACME_EMAIL}\n`;

    fs.writeFileSync(ENV_PATH, envContent);

    // === 2. Generate portainer.env (for Portainer Stack) ===
    let portainerContent = `# Variables para Portainer Stack - ${new Date().toISOString()}\n`;
    portainerContent += `# Copiar estas líneas en "Environment variables" del Stack en Portainer\n\n`;

    const portainerVars = {
        // Backend
        PORT: answers.PORT,
        NODE_ENV: 'production',
        DB_HOST: answers.DB_HOST,
        DB_PORT: answers.DB_PORT,
        DB_USER: answers.DB_USER,
        DB_PASSWORD: answers.DB_PASSWORD,
        DB_NAME: answers.DB_NAME,
        JWT_SECRET: answers.JWT_SECRET,
        ADMIN_EMAIL: answers.ADMIN_EMAIL,
        ADMIN_PASSWORD: answers.ADMIN_PASSWORD,
        MINIO_ENDPOINT: answers.MINIO_ENDPOINT,
        MINIO_PORT: answers.MINIO_PORT,
        MINIO_USE_SSL: 'true', // Production should use SSL
        MINIO_BUCKET_NAME: answers.MINIO_BUCKET_NAME,
        MINIO_ACCESS_KEY: answers.MINIO_ACCESS_KEY,
        MINIO_SECRET_KEY: answers.MINIO_SECRET_KEY,
        SMTP_HOST: answers.SMTP_HOST,
        SMTP_PORT: answers.SMTP_PORT,
        SMTP_USER: answers.SMTP_USER,
        SMTP_PASS: answers.SMTP_PASS,
        FRONTEND_URL: answers.FRONTEND_URL,
        VITE_APP_NAME: answers.VITE_APP_NAME,
        VITE_API_URL: answers.VITE_API_URL,
        DOMAIN_NAME: answers.DOMAIN_NAME,
        ACME_EMAIL: answers.ACME_EMAIL
    };

    for (const [key, value] of Object.entries(portainerVars)) {
        portainerContent += `${key}=${value}\n`;
    }

    fs.writeFileSync(PORTAINER_ENV_PATH, portainerContent);

    // === Output Summary ===
    console.log('✅ Archivos generados:\n');
    console.log(`   📄 ${ENV_PATH}`);
    console.log(`      └─ Para desarrollo local (docker-compose up)\n`);
    console.log(`   📄 ${PORTAINER_ENV_PATH}`);
    console.log(`      └─ Para Portainer (copiar variables al Stack)\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 CREDENCIALES GENERADAS (GUARDAR EN LUGAR SEGURO)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`   DB_PASSWORD    : ${answers.DB_PASSWORD}`);
    console.log(`   MINIO_ACCESS_KEY: ${answers.MINIO_ACCESS_KEY}`);
    console.log(`   MINIO_SECRET_KEY: ${answers.MINIO_SECRET_KEY}`);
    console.log(`   JWT_SECRET     : [Guardado en archivos]\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 INSTRUCCIONES PARA PORTAINER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('1. Sube docker-compose.prod.yml a tu repo o Portainer');
    console.log('2. En Portainer → Stacks → Add Stack');
    console.log('3. Pega el contenido de docker-compose.prod.yml');
    console.log('4. En "Environment variables", pega el contenido de:');
    console.log(`   ${PORTAINER_ENV_PATH}`);
    console.log('5. Deploy the Stack\n');

    rl.close();
};

console.log('');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║     🔮 SETUP WIZARD - Configuración de Nuevo Proyecto     ║');
console.log('╠═══════════════════════════════════════════════════════════╣');
console.log('║  Este asistente generará:                                 ║');
console.log('║  • .env para desarrollo local                             ║');
console.log('║  • portainer.env para despliegue en Portainer             ║');
console.log('║  • Credenciales seguras auto-generadas                    ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');
console.log('Presiona ENTER para usar los valores por defecto.\n');

ask(0);
