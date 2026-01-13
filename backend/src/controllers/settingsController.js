const pool = require('../config/db');
const minioClient = require('../config/minio');
const sharp = require('sharp');

// Get SMTP & General settings
exports.getSmtpSettings = async (req, res) => {
    try {
        const keys = [
            'smtp_enabled', 'smtp_sender_email', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_secure',
            'app_name', 'company_name', 'support_email', 'app_favicon_url', 'app_version', 'footer_text',
            'llm_provider', 'llm_model', 'llm_api_key',
            'llm_provider_secondary', 'llm_model_secondary', 'llm_api_key_secondary',
            'rate_limit_avatar_enabled', 'rate_limit_password_enabled', 'rate_limit_login_enabled',
            'terms_conditions', 'privacy_policy'
        ];
        const result = await pool.query(
            'SELECT setting_key, setting_value FROM app_settings WHERE setting_key = ANY($1)',
            [keys]
        );

        const settings = {
            enabled: false,
            sender_email: '',
            smtp_host: '',
            smtp_port: '587',
            smtp_user: '',
            smtp_pass: '',
            smtp_secure: 'tls',
            app_name: process.env.VITE_APP_NAME,
            company_name: '',
            support_email: '',
            app_favicon_url: process.env.VITE_APP_FAVICON_URL,
            app_version: '1.0.0',
            footer_text: '© 2024 Mi Aplicación. Todos los derechos reservados.',
            llm_provider: 'openai',
            llm_model: '',
            llm_api_key: '',
            llm_provider_secondary: '',
            llm_model_secondary: '',
            llm_api_key_secondary: '',
            rate_limit_avatar_enabled: true,
            rate_limit_password_enabled: true,
            rate_limit_avatar_enabled: true,
            rate_limit_password_enabled: true,
            rate_limit_login_enabled: true,
            terms_content: '',
            privacy_content: ''
        };

        result.rows.forEach(row => {
            switch (row.setting_key) {
                case 'smtp_enabled':
                    settings.enabled = row.setting_value === 'true';
                    break;
                case 'smtp_sender_email':
                    settings.sender_email = row.setting_value;
                    break;
                case 'smtp_host':
                    settings.smtp_host = row.setting_value;
                    break;
                case 'smtp_port':
                    settings.smtp_port = row.setting_value;
                    break;
                case 'smtp_user':
                    settings.smtp_user = row.setting_value;
                    break;
                case 'smtp_pass':
                    settings.smtp_pass = row.setting_value ? '••••••••' : '';
                    break;
                case 'smtp_secure':
                    settings.smtp_secure = row.setting_value;
                    break;
                case 'app_name':
                    settings.app_name = row.setting_value;
                    break;
                case 'company_name':
                    settings.company_name = row.setting_value;
                    break;
                case 'support_email':
                    settings.support_email = row.setting_value;
                    break;
                case 'app_favicon_url':
                    settings.app_favicon_url = row.setting_value;
                    break;
                case 'app_version':
                    settings.app_version = row.setting_value;
                    break;
                case 'footer_text':
                    settings.footer_text = row.setting_value;
                    break;
                case 'llm_provider':
                    settings.llm_provider = row.setting_value;
                    break;
                case 'llm_model':
                    settings.llm_model = row.setting_value;
                    break;
                case 'llm_api_key':
                    settings.llm_api_key = row.setting_value ? '••••••••' : '';
                    break;
                case 'llm_provider_secondary':
                    settings.llm_provider_secondary = row.setting_value;
                    break;
                case 'llm_model_secondary':
                    settings.llm_model_secondary = row.setting_value;
                    break;
                case 'llm_api_key_secondary':
                    settings.llm_api_key_secondary = row.setting_value ? '••••••••' : '';
                    break;
                case 'rate_limit_avatar_enabled':
                    settings.rate_limit_avatar_enabled = row.setting_value !== 'false';
                    break;
                case 'rate_limit_password_enabled':
                    settings.rate_limit_password_enabled = row.setting_value !== 'false';
                    break;
                case 'rate_limit_login_enabled':
                    settings.rate_limit_login_enabled = row.setting_value !== 'false';
                    break;
                case 'terms_conditions':
                    settings.terms_content = row.setting_value;
                    break;
                case 'privacy_policy':
                    settings.privacy_content = row.setting_value;
                    break;
            }
        });

        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener configuración' });
    }
};

// Update SMTP & General settings
exports.updateSmtpSettings = async (req, res) => {
    const {
        enabled, sender_email, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure,
        app_name, company_name, support_email, app_favicon_url, app_version, footer_text,
        terms_content, privacy_content,
        llm_provider, llm_model, llm_api_key,
        llm_provider_secondary, llm_model_secondary, llm_api_key_secondary,
        rate_limit_avatar_enabled, rate_limit_password_enabled, rate_limit_login_enabled
    } = req.body;

    try {
        const upsert = async (key, value) => {
            if (value === undefined) return;
            await pool.query(
                `INSERT INTO app_settings (setting_key, setting_value, updated_at) 
                 VALUES ($1, $2, CURRENT_TIMESTAMP) 
                 ON CONFLICT (setting_key) 
                 DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
                [key, value]
            );
        };

        if (enabled !== undefined) await upsert('smtp_enabled', String(enabled));
        if (sender_email !== undefined) await upsert('smtp_sender_email', sender_email);
        if (smtp_host !== undefined) await upsert('smtp_host', smtp_host);
        if (smtp_port !== undefined) await upsert('smtp_port', String(smtp_port));
        if (smtp_user !== undefined) await upsert('smtp_user', smtp_user);

        if (smtp_pass && smtp_pass !== '••••••••') {
            await upsert('smtp_pass', smtp_pass);
        }

        if (smtp_secure !== undefined) await upsert('smtp_secure', smtp_secure);
        if (app_name !== undefined) await upsert('app_name', app_name);
        if (company_name !== undefined) await upsert('company_name', company_name);
        if (support_email !== undefined) await upsert('support_email', support_email);
        if (app_favicon_url !== undefined) await upsert('app_favicon_url', app_favicon_url);
        if (app_version !== undefined) await upsert('app_version', app_version);
        if (footer_text !== undefined) await upsert('footer_text', footer_text);
        if (terms_content !== undefined) await upsert('terms_conditions', terms_content);
        if (privacy_content !== undefined) await upsert('privacy_policy', privacy_content);

        if (llm_provider !== undefined) await upsert('llm_provider', llm_provider);
        if (llm_model !== undefined) await upsert('llm_model', llm_model);
        if (llm_api_key && llm_api_key !== '••••••••') {
            await upsert('llm_api_key', llm_api_key);
        }

        if (llm_provider_secondary !== undefined) await upsert('llm_provider_secondary', llm_provider_secondary);
        if (llm_model_secondary !== undefined) await upsert('llm_model_secondary', llm_model_secondary);
        if (llm_api_key_secondary && llm_api_key_secondary !== '••••••••') {
            await upsert('llm_api_key_secondary', llm_api_key_secondary);
        }

        // Rate limit settings
        if (rate_limit_avatar_enabled !== undefined) await upsert('rate_limit_avatar_enabled', String(rate_limit_avatar_enabled));
        if (rate_limit_password_enabled !== undefined) await upsert('rate_limit_password_enabled', String(rate_limit_password_enabled));
        if (rate_limit_login_enabled !== undefined) await upsert('rate_limit_login_enabled', String(rate_limit_login_enabled));

        res.json({ message: 'Configuración guardada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al guardar configuración' });
    }
};

// Get public settings (no auth required) - only branding info
exports.getPublicSettings = async (req, res) => {
    try {
        const keys = ['app_name', 'company_name', 'app_favicon_url', 'app_version', 'footer_text'];
        const result = await pool.query(
            'SELECT setting_key, setting_value FROM app_settings WHERE setting_key = ANY($1)',
            [keys]
        );

        const settings = {
            app_name: process.env.VITE_APP_NAME || 'Mi Aplicación',
            company_name: '',
            app_favicon_url: process.env.VITE_APP_FAVICON_URL || '/favicon.ico',
            app_version: '1.0.0',
            footer_text: '© 2024 Mi Aplicación. Todos los derechos reservados.'
        };

        result.rows.forEach(row => {
            if (row.setting_key === 'app_name') settings.app_name = row.setting_value;
            if (row.setting_key === 'company_name') settings.company_name = row.setting_value;
            if (row.setting_key === 'app_favicon_url') settings.app_favicon_url = row.setting_value;
            if (row.setting_key === 'app_version') settings.app_version = row.setting_value;
            if (row.setting_key === 'footer_text') settings.footer_text = row.setting_value;
        });

        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener configuración pública' });
    }
};

// Get OAuth settings (admin only)
exports.getOAuthSettings = async (req, res) => {
    try {
        const keys = ['google_oauth_enabled', 'google_client_id', 'google_client_secret'];
        const result = await pool.query(
            'SELECT setting_key, setting_value FROM app_settings WHERE setting_key = ANY($1)',
            [keys]
        );

        const settings = {
            enabled: false,
            client_id: '',
            client_secret: ''
        };

        result.rows.forEach(row => {
            switch (row.setting_key) {
                case 'google_oauth_enabled':
                    settings.enabled = row.setting_value === 'true';
                    break;
                case 'google_client_id':
                    settings.client_id = row.setting_value || '';
                    break;
                case 'google_client_secret':
                    settings.client_secret = row.setting_value ? '••••••••' : '';
                    break;
            }
        });

        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener configuración OAuth' });
    }
};

// Update OAuth settings (admin only)
exports.updateOAuthSettings = async (req, res) => {
    const { enabled, client_id, client_secret } = req.body;

    try {
        const upsert = async (key, value) => {
            if (value === undefined) return;
            await pool.query(
                `INSERT INTO app_settings (setting_key, setting_value, updated_at) 
                 VALUES ($1, $2, CURRENT_TIMESTAMP) 
                 ON CONFLICT (setting_key) 
                 DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
                [key, value]
            );
        };

        if (enabled !== undefined) await upsert('google_oauth_enabled', String(enabled));
        if (client_id !== undefined) await upsert('google_client_id', client_id);

        // Only update secret if it's not the masked placeholder
        if (client_secret && client_secret !== '••••••••') {
            await upsert('google_client_secret', client_secret);
        }

        res.json({ message: 'Configuración OAuth guardada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al guardar configuración OAuth' });
    }
};

// Get public OAuth settings (no auth) - only client_id and enabled
exports.getPublicOAuthSettings = async (req, res) => {
    try {
        const keys = ['google_oauth_enabled', 'google_client_id'];
        const result = await pool.query(
            'SELECT setting_key, setting_value FROM app_settings WHERE setting_key = ANY($1)',
            [keys]
        );

        const settings = {
            enabled: false,
            client_id: ''
        };

        result.rows.forEach(row => {
            switch (row.setting_key) {
                case 'google_oauth_enabled':
                    settings.enabled = row.setting_value === 'true';
                    break;
                case 'google_client_id':
                    settings.client_id = row.setting_value || '';
                    break;
            }
        });

        // Fallback to env vars if not in DB
        if (!settings.client_id && process.env.VITE_GOOGLE_CLIENT_ID) {
            settings.client_id = process.env.VITE_GOOGLE_CLIENT_ID;
            settings.enabled = process.env.VITE_GOOGLE_AUTH_ENABLED === 'true';
        }

        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener configuración OAuth pública' });
    }
};

// Get legal content (public - no auth required)
exports.getLegalContent = async (req, res) => {
    const { type } = req.params; // 'terms' | 'privacy'

    if (!['terms', 'privacy'].includes(type)) {
        return res.status(400).json({ message: 'Tipo de contenido legal inválido' });
    }

    const key = type === 'terms' ? 'terms_conditions' : 'privacy_policy';
    const title = type === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad';

    try {
        // Fetch legal content along with branding info for variable replacement
        const result = await pool.query(
            `SELECT setting_key, setting_value FROM app_settings WHERE setting_key = ANY($1)`,
            [[key, 'app_name', 'company_name', 'support_email']]
        );

        let content = '';
        let appName = process.env.VITE_APP_NAME || 'Mi Aplicación';
        let companyName = '';
        let supportEmail = process.env.VITE_SUPPORT_EMAIL || 'soporte@ejemplo.com';

        result.rows.forEach(row => {
            if (row.setting_key === key) content = row.setting_value || '';
            if (row.setting_key === 'app_name') appName = row.setting_value || appName;
            if (row.setting_key === 'company_name') companyName = row.setting_value || '';
            if (row.setting_key === 'support_email') supportEmail = row.setting_value || supportEmail;
        });

        if (!content) {
            return res.json({
                content: `<p>No hay ${title.toLowerCase()} disponibles.</p>`,
                title
            });
        }

        // Replace dynamic placeholders
        content = content
            .replace(/%APP_NAME%/g, appName)
            .replace(/%COMPANY_NAME%/g, companyName)
            .replace(/%EMPRESA_NAME%/g, companyName)
            .replace(/%SUPPORT_EMAIL%/g, supportEmail)
            .replace(/\[Nombre de tu App\]/g, appName)
            .replace(/\[Nombre de tu Empresa o Desarrollador\]/g, companyName);

        res.json({
            content,
            title
        });
    } catch (err) {
        console.error('Error fetching legal content:', err);
        res.status(500).json({ message: 'Error al obtener contenido legal' });
    }
};

// Upload Favicon (Admin Only)
exports.uploadFavicon = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No se subió imagen' });
    }

    try {
        const bucketName = process.env.MINIO_BUCKET_NAME;
        if (!bucketName) throw new Error('MINIO_BUCKET_NAME not configured');

        // Process image (favicon usually small, but keeping quality)
        let compressedBuffer;
        try {
            compressedBuffer = await sharp(req.file.buffer)
                .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png() // PNG is better for favicons (transparency)
                .toBuffer();
        } catch (sharpError) {
            console.error('Sharp processing error:', sharpError.message);
            return res.status(400).json({ message: 'Error procesando imagen', error: sharpError.message });
        }

        const objectName = `system/app-favicon-${Date.now()}.png`;

        // Ensure bucket exists
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
        }

        // Upload to MinIO
        await minioClient.putObject(bucketName, objectName, compressedBuffer, { 'Content-Type': 'image/png' });

        // Build URL
        const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
        const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || 'localhost';
        const port = process.env.MINIO_PORT;
        const portStr = (port === '80' || port === '443') ? '' : `:${port}`;
        const url = `${protocol}://${publicEndpoint}${portStr}/${bucketName}/${objectName}`;

        // Save URL to app_settings
        await pool.query(
            `INSERT INTO app_settings (setting_key, setting_value, updated_at) 
             VALUES ('app_favicon_url', $1, CURRENT_TIMESTAMP) 
             ON CONFLICT (setting_key) 
             DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP`,
            [url]
        );

        res.json({ favicon_url: url });

    } catch (err) {
        console.error('Error uploading favicon:', err);
        res.status(500).json({ message: 'Error subiendo favicon', error: err.message });
    }
};
