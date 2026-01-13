const crypto = require('crypto');

// Algoritmo AES-256-GCM (Autenticado, seguro)
const ALGORITHM = 'aes-256-gcm';

// Encryption key management
const INITIAL_SECRET = process.env.APP_MASTER_KEY || process.env.JWT_SECRET;
if (!INITIAL_SECRET) {
    throw new Error('Encryption Configuration Error: APP_MASTER_KEY or JWT_SECRET must be set.');
}
const MASTER_KEY_BUFFER = crypto.createHash('sha256').update(INITIAL_SECRET).digest();

function getMasterKey() {
    return MASTER_KEY_BUFFER;
}

/**
 * Encripta un texto plano
 * Retorna: "iv:authTag:encryptedContent" (hex)
 */
function encrypt(text) {
    if (!text) return null;

    try {
        const iv = crypto.randomBytes(16); // IV aleatorio cada vez
        const key = getMasterKey();
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        // Formato: IV + AuthTag + Contenido
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Error encriptando datos');
    }
}

/**
 * Desencripta el formato "iv:authTag:encryptedContent"
 */
function decrypt(encryptedData) {
    if (!encryptedData) return null;

    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) throw new Error('Formato de datos encriptados invÃ¡lido');

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encryptedText = parts[2];

        const key = getMasterKey();
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error file:', error);
        // No retornar error detallado por seguridad
        return null;
    }
}

module.exports = { encrypt, decrypt };
