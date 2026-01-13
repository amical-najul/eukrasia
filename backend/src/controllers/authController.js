const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../config/db');
const emailService = require('../services/emailService');

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// Registro
exports.register = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        // Verificar si existe
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return res.status(400).json({ message: 'La contraseña debe contener mayúsculas, minúsculas y un número' });
        }

        // Hash contraseña
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Generar token de verificación seguro
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, is_verified, verification_token, name) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, is_verified, name',
            [email, hash, false, verificationToken, name || null]
        );

        // Build verification link
        const baseUrl = process.env.FRONTEND_URL;
        if (!baseUrl) throw new Error('FRONTEND_URL is not defined');
        const verificationLink = `${baseUrl}/?verify=${verificationToken}`;

        // Send verification email using template
        await emailService.sendAuthEmail('email_verification',
            { email, name: name || email.split('@')[0] },
            { link: verificationLink }
        );

        res.status(201).json({
            message: 'Usuario creado. Verifica tu email.',
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Verificar email confirmado
        if (!user.is_verified) {
            return res.status(403).json({ message: 'Debes verificar tu email antes de iniciar sesión.' });
        }

        // Block deleted or inactive users
        if (user.status === 'deleted') {
            return res.status(403).json({ message: 'Esta cuenta ha sido eliminada.' });
        }

        if (!user.active || user.status === 'inactive') {
            return res.status(403).json({ message: 'Tu cuenta está suspendida. Contacta al administrador.' });
        }

        // Generar Token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user.id, email: user.email, role: user.role, name: user.name, language_preference: user.language_preference, avatar_url: user.avatar_url }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Verificar Email
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
        const result = await pool.query(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id, email',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        res.json({ message: 'Email verificado correctamente', user: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Google Login
exports.googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        // Verificar Token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.VITE_GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email } = payload;

        // Verificar usuario existente
        let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = result.rows[0];

        if (!user) {
            // Crear usuario si no existe
            const randomPass = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(randomPass, salt);

            // Asumiendo que la columna 'role' ya existe por migracion anterior
            const newUser = await pool.query(
                "INSERT INTO users (email, password_hash, is_verified, role, status, active) VALUES ($1, $2, $3, 'user', 'active', true) RETURNING *",
                [email, hash, true]
            );
            user = newUser.rows[0];
        }

        // Check Status
        if (user.status === 'deleted') {
            return res.status(403).json({ message: 'Esta cuenta ha sido eliminada.' });
        }
        if (!user.active || user.status === 'inactive') {
            return res.status(403).json({ message: 'Tu cuenta está suspendida.' });
        }

        // Generar JWT
        const jwtToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login con Google exitoso',
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                language_preference: user.language_preference,
                avatar_url: user.avatar_url
            }
        });

    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(401).json({ message: 'Falló la autenticación con Google: ' + err.message });
    }
};

// ==========================================
// PASSWORD RESET FLOW
// ==========================================

/**
 * Forgot Password - Send reset email
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Validar email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Email inválido' });
        }

        // Buscar usuario
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            // Por seguridad, no revelar si el email existe
            return res.json({
                message: 'Si el email existe, recibirás un correo con instrucciones'
            });
        }

        const user = result.rows[0];

        // Generar token seguro
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hora

        // Guardar token en BD
        await pool.query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
             VALUES ($1, $2, $3)`,
            [user.id, resetToken, expiresAt]
        );

        // Build reset link
        const baseUrl = process.env.FRONTEND_URL;
        if (!baseUrl) throw new Error('FRONTEND_URL not configured');
        const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

        // Send email using template
        await emailService.sendAuthEmail('password_reset',
            { email: user.email, name: user.name || user.email.split('@')[0] },
            { link: resetLink }
        );

        res.json({
            message: 'Si el email existe, recibirás un correo con instrucciones'
        });

    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

/**
 * Reset Password - Change password with token
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Validar inputs
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token y contraseña son requeridos' });
        }

        // Validar contraseña
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            return res.status(400).json({
                message: 'La contraseña debe contener mayúsculas, minúsculas y números'
            });
        }

        // Buscar token válido
        const tokenResult = await pool.query(
            `SELECT * FROM password_reset_tokens 
             WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        const resetToken = tokenResult.rows[0];

        // Hash nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // Actualizar contraseña
        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [hash, resetToken.user_id]
        );

        // Marcar token como usado
        await pool.query(
            'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1',
            [resetToken.id]
        );

        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
