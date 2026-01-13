const nodemailer = require('nodemailer');
const pool = require('../config/db');

/**
 * Email Service
 * Uses templates from DB and SMTP settings to send authentication emails.
 */

// Get SMTP & General configuration from database
const getSmtpConfig = async () => {
    const keys = [
        'smtp_enabled', 'smtp_sender_email', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_secure',
        'app_name', 'company_name', 'support_email', 'app_favicon_url'
    ];
    const result = await pool.query(
        'SELECT setting_key, setting_value FROM app_settings WHERE setting_key = ANY($1)',
        [keys]
    );

    const config = {
        enabled: false,
        sender_email: '',
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_pass: '',
        smtp_secure: 'tls',
        app_name: 'Mi Aplicación',
        company_name: '',
        support_email: '',
        app_favicon_url: ''
    };

    result.rows.forEach(row => {
        switch (row.setting_key) {
            case 'smtp_enabled':
                config.enabled = row.setting_value === 'true';
                break;
            case 'smtp_sender_email':
                config.sender_email = row.setting_value;
                break;
            case 'smtp_host':
                config.smtp_host = row.setting_value;
                break;
            case 'smtp_port':
                config.smtp_port = parseInt(row.setting_value) || 587;
                break;
            case 'smtp_user':
                config.smtp_user = row.setting_value;
                break;
            case 'smtp_pass':
                config.smtp_pass = row.setting_value;
                break;
            case 'smtp_secure':
                config.smtp_secure = row.setting_value;
                break;
            case 'app_name':
                config.app_name = row.setting_value;
                break;
            case 'company_name':
                config.company_name = row.setting_value;
                break;
            case 'support_email':
                config.support_email = row.setting_value;
                break;
            case 'app_favicon_url':
                config.app_favicon_url = row.setting_value;
                break;
        }
    });

    return config;
};

// Get email template from database
const getTemplate = async (templateKey) => {
    const result = await pool.query(
        'SELECT * FROM email_templates WHERE template_key = $1',
        [templateKey]
    );
    return result.rows[0] || null;
};

// Replace placeholders in template
const replacePlaceholders = (text, data) => {
    if (!text) return '';
    const appName = data.appName || 'Mi Aplicación';
    const companyName = data.companyName || appName;
    const supportEmail = data.supportEmail || data.email; // Fallback to user email if no support email? Maybe empty string

    return text
        .replace(/%DISPLAY_NAME%/g, data.displayName || '')
        .replace(/%APP_NAME%/g, appName)
        .replace(/%EMPRESA_NAME%/g, companyName)
        .replace(/%SUPPORT_EMAIL%/g, supportEmail)
        .replace(/%LINK%/g, data.link || '')
        .replace(/%EMAIL%/g, data.email || '')
        .replace(/%NEW_EMAIL%/g, data.newEmail || '');
};

// Create nodemailer transporter
const createTransporter = async () => {
    const config = await getSmtpConfig();

    if (!config.enabled) {
        console.log('SMTP not enabled. Emails will only be logged to console.');
        return null;
    }

    const transportOptions = {
        host: config.smtp_host,
        port: config.smtp_port,
        auth: {
            user: config.smtp_user,
            pass: config.smtp_pass
        }
    };

    // Configure security
    if (config.smtp_secure === 'ssl') {
        transportOptions.secure = true;
    } else if (config.smtp_secure === 'tls') {
        transportOptions.secure = false;
        transportOptions.requireTLS = true;
    } else {
        transportOptions.secure = false;
    }

    return nodemailer.createTransport(transportOptions);
};

/**
 * Send authentication email
 * @param {string} templateKey - 'email_verification', 'password_reset', or 'email_change'
 * @param {object} recipient - { email, name }
 * @param {object} data - { link, newEmail (optional) }
 */
const sendAuthEmail = async (templateKey, recipient, data) => {
    try {
        // Get template and settings
        const [templateInDb, smtpConfig] = await Promise.all([
            getTemplate(templateKey),
            getSmtpConfig()
        ]);

        // Use default if no template found
        const template = templateInDb || getDefaultTemplate(templateKey);

        const placeholderData = {
            displayName: recipient.name || recipient.email.split('@')[0],
            email: recipient.email,
            link: data.link,
            newEmail: data.newEmail,
            appName: data.appName || smtpConfig.app_name || 'Mi Aplicación',
            companyName: smtpConfig.company_name || smtpConfig.app_name || 'Mi Empresa',
            supportEmail: smtpConfig.support_email || 'support@example.com'
        };

        const subject = replacePlaceholders(template.subject, placeholderData);
        const body = replacePlaceholders(template.body_html, placeholderData);

        const transporter = await createTransporter();

        const mailOptions = {
            from: `"${template.sender_name || placeholderData.appName}" <${template.sender_email || smtpConfig.smtp_sender_email || 'noreply@example.com'}>`,
            to: recipient.email,
            subject: subject,
            text: body, // Plain text version
            html: body.replace(/\n/g, '<br>') // Basic HTML conversion
        };

        if (transporter) {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${recipient.email}: ${templateKey}`);
            return { success: true };
        } else {
            // Log to console if SMTP not configured
            console.log('=== EMAIL (Console Mode) ===');
            console.log(`To: ${recipient.email}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body:\n${body}`);
            console.log('============================');
            return { success: true, mode: 'console' };
        }
    } catch (err) {
        console.error('Error sending email:', err);
        return { success: false, error: err.message };
    }
};

// Default templates if none in DB
const getDefaultTemplate = (key) => {
    const defaults = {
        email_verification: {
            sender_name: 'Mi App',
            sender_email: 'noreply@example.com',
            subject: 'Verifica tu correo electrónico para %APP_NAME%',
            body_html: `Hola, %DISPLAY_NAME%:

Visita este vínculo para verificar tu dirección de correo electrónico.

%LINK%

Si no solicitaste la verificación de esta dirección, ignora este correo electrónico.

Gracias.

El equipo de %APP_NAME%`
        },
        password_reset: {
            sender_name: 'Mi App',
            sender_email: 'noreply@example.com',
            subject: 'Restablece tu contraseña para %APP_NAME%',
            body_html: `Hola, %DISPLAY_NAME%:

Haz clic en el siguiente enlace para restablecer tu contraseña.

%LINK%

Si no solicitaste restablecer tu contraseña, ignora este correo.

Gracias.

El equipo de %APP_NAME%`
        },
        email_change: {
            sender_name: 'Mi App',
            sender_email: 'noreply@example.com',
            subject: 'Confirma tu cambio de correo en %APP_NAME%',
            body_html: `Hola, %DISPLAY_NAME%:

Has solicitado cambiar tu correo electrónico a %NEW_EMAIL%.

Haz clic en el siguiente enlace para confirmar el cambio.

%LINK%

Si no solicitaste este cambio, ignora este correo.

Gracias.

El equipo de %APP_NAME%`
        }
    };
    return defaults[key] || defaults.email_verification;
};

// Export functions
module.exports = {
    sendAuthEmail,
    getSmtpConfig,
    getTemplate
};
