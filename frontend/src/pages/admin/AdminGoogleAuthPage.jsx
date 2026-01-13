import { useState, useEffect } from 'react';
import { TEMPLATES_CONFIG } from './templates/constants';
import SmtpSettings from './templates/SmtpSettings';
import GoogleOAuthSettings from './templates/GoogleOAuthSettings';
import TemplateList from './templates/TemplateList';
import TemplateEditor from './templates/TemplateEditor';
import { useAuth } from '../../context/AuthContext';

const AdminGoogleAuthPage = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('oauth'); // 'oauth', 'templates', 'smtp'
    const [loading, setLoading] = useState(true);

    // Settings State
    const [settings, setSettings] = useState({
        // SMTP
        enabled: false,
        sender_email: '',
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_pass: '',
        smtp_secure: 'tls',
        // OAuth
        oauth_enabled: false,
        oauth_client_id: '',
        oauth_client_secret: ''
    });

    // Templates State
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        sender_name: '',
        sender_email: '',
        reply_to: '',
        subject: '',
        body_html: ''
    });

    // UX State
    const [saving, setSaving] = useState(false); // For templates
    const [settingsSaving, setSettingsSaving] = useState(false); // For settings
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    // --- Data Fetching ---
    const fetchData = async () => {
        try {
            // Fetch SMTP
            const smtpRes = await fetch(`${API_URL}/settings/smtp`, { headers: { 'x-auth-token': token } });
            if (smtpRes.ok) {
                const smtpData = await smtpRes.json();
                setSettings(prev => ({ ...prev, ...smtpData }));
            }

            // Fetch OAuth
            const oauthRes = await fetch(`${API_URL}/settings/oauth`, { headers: { 'x-auth-token': token } });
            if (oauthRes.ok) {
                const oauthData = await oauthRes.json();
                setSettings(prev => ({
                    ...prev,
                    oauth_enabled: oauthData.enabled,
                    oauth_client_id: oauthData.client_id,
                    oauth_client_secret: oauthData.client_secret
                }));
            }

            // Fetch Templates
            const tplRes = await fetch(`${API_URL}/templates`, { headers: { 'x-auth-token': token } });
            if (tplRes.ok) {
                const tplData = await tplRes.json();
                setTemplates(tplData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    // --- Handlers ---

    const handleSettingsChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    // Save SMTP - Payload Isolation
    const handleSaveSmtpSettings = async () => {
        setSettingsSaving(true);
        setError('');
        setSuccess('');

        const payload = {
            enabled: settings.enabled,
            sender_email: settings.sender_email,
            smtp_host: settings.smtp_host,
            smtp_port: settings.smtp_port,
            smtp_user: settings.smtp_user,
            smtp_pass: settings.smtp_pass,
            smtp_secure: settings.smtp_secure
        };

        try {
            const res = await fetch(`${API_URL}/settings/smtp`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(payload)
            });
            if (res.ok) setSuccess('Configuración SMTP guardada');
            else setError('Error al guardar SMTP');
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSettingsSaving(false);
        }
    };

    // Save OAuth
    const handleSaveOAuthSettings = async () => {
        setSettingsSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_URL}/settings/oauth`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    enabled: settings.oauth_enabled,
                    client_id: settings.oauth_client_id,
                    client_secret: settings.oauth_client_secret
                })
            });
            if (res.ok) setSuccess('Configuración OAuth guardada');
            else setError('Error al guardar OAuth');
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSettingsSaving(false);
        }
    };

    // --- Template Logic ---
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
                subject: '',
                body_html: getDefaultBody(templateKey)
            });
        }

        setSelectedTemplate({ ...config, key: templateKey, data: template });
        setEditMode(true);
        setError('');
        setSuccess('');
    };

    const handleSaveTemplate = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`${API_URL}/templates/${selectedTemplate.key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setSuccess('Plantilla guardada');
                fetchData(); // Refresh templates
            } else {
                setError('Error al guardar plantilla');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const getDefaultBody = (key) => {
        // Simple defaults helper
        return `Hola, %DISPLAY_NAME%:\n\nAquí tienes tu enlace: %LINK%\n\nSaludos,\n%APP_NAME%`;
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Autenticación Google</h2>
                <p className="text-gray-500">Configuración técnica de autenticación y correos.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
                <button
                    onClick={() => { setActiveTab('oauth'); setEditMode(false); }}
                    className={`pb-3 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'oauth' ? 'text-[#008a60] border-[#008a60]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                    Google Auth
                </button>
                <button
                    onClick={() => { setActiveTab('templates'); setEditMode(false); }}
                    className={`pb-3 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'templates' ? 'text-[#008a60] border-[#008a60]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                    Plantillas de Email
                </button>
                <button
                    onClick={() => { setActiveTab('smtp'); setEditMode(false); }}
                    className={`pb-3 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'smtp' ? 'text-[#008a60] border-[#008a60]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                    Configuración SMTP
                </button>
            </div>

            {loading ? (
                <div className="p-4 flex justify-center"><div className="w-8 h-8 border-3 border-[#008a60] border-t-transparent rounded-full animate-spin"></div></div>
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
                    handleSaveSettings={handleSaveSmtpSettings}
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

export default AdminGoogleAuthPage;
