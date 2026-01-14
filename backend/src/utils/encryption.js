const crypto = require('crypto');

// Algoritmo AES-256-GCM (Autenticado, seguro)
const ALGORITHM = 'aes-256-gcm';

// Encryption key management
// Priority: 1. ENCRYPTION_KEY (pre-computed 64 hex chars = 32 bytes)
//           2. Derive from APP_MASTER_KEY/JWT_SECRET using scrypt (slower but secure)
const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY;
const INITIAL_SECRET = process.env.APP_MASTER_KEY || process.env.JWT_SECRET;

let MASTER_KEY_BUFFER;
let LEGACY_KEY_BUFFER = null; // For backwards compatibility with SHA-256 derived keys

if (ENCRYPTION_KEY_HEX && ENCRYPTION_KEY_HEX.length === 64) {
    // Use pre-computed key directly (recommended for production)
    MASTER_KEY_BUFFER = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');
    console.log('🔐 Encryption: Using pre-computed ENCRYPTION_KEY');
} else if (INITIAL_SECRET) {
    // Derive key using scrypt (CPU-intensive but secure)
    MASTER_KEY_BUFFER = crypto.scryptSync(INITIAL_SECRET, 'eukrasia-secure-salt-v1', 32);
    // Also generate legacy key for backwards compatibility with old encrypted data
    LEGACY_KEY_BUFFER = crypto.createHash('sha256').update(INITIAL_SECRET).digest();
    console.log('🔐 Encryption: Derived key using scryptSync (with SHA-256 legacy fallback)');
} else {
    throw new Error('Encryption Configuration Error: ENCRYPTION_KEY or APP_MASTER_KEY/JWT_SECRET must be set.');
}

function getMasterKey() {
    return MASTER_KEY_BUFFER;
}

function getLegacyKey() {
    return LEGACY_KEY_BUFFER;
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
 * Tries primary key first, then falls back to legacy SHA-256 key if available
 */
function decrypt(encryptedData) {
    if (!encryptedData) return null;

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
        console.error('Decryption error: Invalid format');
        return null;
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];

    // Try primary key first
    try {
        const key = getMasterKey();
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (primaryError) {
        // Primary key failed, try legacy key if available
        const legacyKey = getLegacyKey();
        if (legacyKey) {
            try {
                const decipher = crypto.createDecipheriv(ALGORITHM, legacyKey, iv);
                decipher.setAuthTag(authTag);

                let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                console.log('🔐 Decryption: Used legacy SHA-256 key (consider re-encrypting data)');
                return decrypted;
            } catch (legacyError) {
                console.error('Decryption error: Both primary and legacy keys failed');
                return null;
            }
        } else {
            console.error('Decryption error:', primaryError.message);
            return null;
        }
    }
}

module.exports = { encrypt, decrypt };
