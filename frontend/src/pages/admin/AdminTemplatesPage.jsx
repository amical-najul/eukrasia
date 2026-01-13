import { useState, useEffect } from 'react';
import { TEMPLATES_CONFIG } from './templates/constants';
import GeneralSettings from './templates/GeneralSettings';
import SmtpSettings from './templates/SmtpSettings';
import GoogleOAuthSettings from './templates/GoogleOAuthSettings';
import TemplateList from './templates/TemplateList';
import TemplateEditor from './templates/TemplateEditor';
import { useAuth } from '../../context/AuthContext';

const AdminTemplatesPage = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('templates'); // 'templates', 'smtp', 'general'
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Template form state
    const [formData, setFormData] = useState({
        sender_name: '',
        sender_email: '',
        reply_to: '',
        subject: '',
        body_html: ''
    });

    // SMTP & General Settings state
    const [settings, setSettings] = useState({
        enabled: false,
        sender_email: '',
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_pass: '',
        smtp_secure: 'tls',
        app_name: '',
        company_name: '',
        support_email: '',
        app_favicon_url: '',
        // OAuth settings
        oauth_enabled: false,
        oauth_client_id: '',
        oauth_client_secret: ''
    });
    const [settingsSaving, setSettingsSaving] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    // Fetch templates
    const fetchTemplates = async () => {
        try {
            const res = await fetch(`${API_URL}/templates`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) setTemplates(data);
        } catch (err) {
            console.error('Error fetching templates:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch settings
    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/settings/smtp`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    // Fetch OAuth settings
    const fetchOAuthSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/settings/oauth`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({
                    ...prev,
                    oauth_enabled: data.enabled,
                    oauth_client_id: data.client_id,
                    oauth_client_secret: data.client_secret
                }));
            }
        } catch (err) {
            console.error('Error fetching OAuth settings:', err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTemplates();
            fetchSettings();
            fetchOAuthSettings();
        }
    }, [token]);

    const handleSelectTemplate = (templateKey) => {
        const template = templates.find(t => t.template_key === templateKey);
        const config = TEMPLATES_CONFIG.find(c => c.key === templateKey);

        if (template) {
            setFormData({
                sender_name: template.sender_name || '',
                sender_email: template.sender_email || '',
                reply_to: template.reply_to || '',
                subject: template.subject || '',
                body_html: template.body_html || ''
            });
        } else {
            setFormData({
                sender_name: '',
                sender_email: 'noreply@example.com',
                reply_to: 'noreply',
                subject: templateKey === 'email_verification'
                    ? 'Verifica tu correo electrónico para %APP_NAME%'
                    : templateKey === 'password_reset'
                        ? 'Restablece tu contraseña para %APP_NAME%'
                        : 'Confirma tu cambio de correo en %APP_NAME%',
                body_html: getDefaultBody(templateKey)
            });
        }

        setSelectedTemplate({ ...config, key: templateKey, data: template });
        setEditMode(true);
        setError('');
        setSuccess('');
    };

    const getDefaultBody = (key) => {
        if (key === 'email_verification') {
            return `Hola, %DISPLAY_NAME%:

Visita este vínculo para verificar tu dirección de correo electrónico.

%LINK%

Si no solicitaste la verificación de esta dirección, ignora este correo electrónico.

Gracias.

El equipo de %APP_NAME%`;
        }
        if (key === 'password_reset') {
            return `Hola, %DISPLAY_NAME%:

Haz clic en el siguiente enlace para restablecer tu contraseña.

%LINK%

Si no solicitaste restablecer tu contraseña, ignora este correo.

Gracias.

El equipo de %APP_NAME%`;
        }
        return `Hola, %DISPLAY_NAME%:

Has solicitado cambiar tu correo electrónico a %NEW_EMAIL%.

Haz clic en el siguiente enlace para confirmar el cambio.

%LINK%

Si no solicitaste este cambio, ignora este correo.

Gracias.

El equipo de %APP_NAME%`;
    };

    const handleSaveTemplate = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_URL}/templates/${selectedTemplate.key}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Plantilla guardada correctamente');
                fetchTemplates();
            } else {
                setError(data.message || 'Error al guardar');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSettings = async () => {
        setSettingsSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_URL}/settings/smtp`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(settings)
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Configuración guardada correctamente');
                if (settings.app_name) document.title = settings.app_name;
            } else {
                setError(data.message || 'Error al guardar configuración');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSettingsSaving(false);
        }
    };

    const handleSaveOAuthSettings = async () => {
        setSettingsSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_URL}/settings/oauth`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    enabled: settings.oauth_enabled,
                    client_id: settings.oauth_client_id,
                    client_secret: settings.oauth_client_secret
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Configuración OAuth guardada correctamente');
            } else {
                setError(data.message || 'Error al guardar configuración OAuth');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSettingsSaving(false);
        }
    };



    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSettingsChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Personalización y Plantillas</h2>
                <p className="text-gray-500">Configura la identidad de tu aplicación y las comunicaciones por email.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
                <button
                    onClick={() => { setActiveTab('general'); setEditMode(false); }}
                    className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'general'
                        ? 'text-[#008a60] border-[#008a60]'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                >
                    Ajustes Generales
                </button>
                <button
                    onClick={() => { setActiveTab('oauth'); setEditMode(false); }}
                    className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'oauth'
                        ? 'text-[#008a60] border-[#008a60]'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                >
                    Google Auth
                </button>
                <button
                    onClick={() => { setActiveTab('templates'); setEditMode(false); }}
                    className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'templates'
                        ? 'text-[#008a60] border-[#008a60]'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                >
                    Plantillas de Email
                </button>
                <button
                    onClick={() => { setActiveTab('smtp'); setEditMode(false); }}
                    className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'smtp'
                        ? 'text-[#008a60] border-[#008a60]'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                >
                    Configuración SMTP
                </button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : activeTab === 'general' ? (
                <GeneralSettings
                    settings={settings}
                    handleSettingsChange={handleSettingsChange}
                    handleSaveSettings={handleSaveSettings}
                    settingsSaving={settingsSaving}
                    error={error}
                    success={success}
                />
            ) : activeTab === 'oauth' ? (
                <GoogleOAuthSettings
                    settings={settings}
                    handleSettingsChange={handleSettingsChange}
                    handleSaveSettings={handleSaveOAuthSettings}
                    settingsSaving={settingsSaving}
                    error={error}
                    success={success}
                />
            ) : activeTab === 'smtp' ? (
                <SmtpSettings
                    settings={settings}
                    handleSettingsChange={handleSettingsChange}
                    handleSaveSettings={handleSaveSettings}
                    settingsSaving={settingsSaving}
                    error={error}
                    success={success}
                />
            ) : editMode ? (
                <TemplateEditor
                    selectedTemplate={selectedTemplate}
                    formData={formData}
                    handleChange={handleChange}
                    saving={saving}
                    handleSaveTemplate={handleSaveTemplate}
                    setEditMode={setEditMode}
                    error={error}
                    success={success}
                    settings={settings}
                />
            ) : (
                <TemplateList
                    templates={templates}
                    handleSelectTemplate={handleSelectTemplate}
                />
            )}
        </div>
    );
};

export default AdminTemplatesPage;
