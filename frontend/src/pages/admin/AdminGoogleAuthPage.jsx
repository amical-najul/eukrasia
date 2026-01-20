import { useState, useEffect } from 'react';
import { TEMPLATES_CONFIG } from './templates/constants';
import SmtpSettings from './templates/SmtpSettings';
import GoogleOAuthSettings from './templates/GoogleOAuthSettings';
import TemplateList from './templates/TemplateList';
import TemplateEditor from './templates/TemplateEditor';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminGoogleAuthPage = () => {
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

    // --- Data Fetching ---
    const fetchData = async () => {
        try {
            // Fetch SMTP
            const smtpData = await api.get('/settings/smtp');
            if (smtpData) {
                setSettings(prev => ({ ...prev, ...smtpData }));
            }
        } catch (e) { /* Silent */ }

        try {
            // Fetch OAuth
            const oauthData = await api.get('/settings/oauth');
            if (oauthData) {
                setSettings(prev => ({
                    ...prev,
                    oauth_enabled: oauthData.enabled,
                    oauth_client_id: oauthData.client_id,
                    oauth_client_secret: oauthData.client_secret
                }));
            }
        } catch (e) { /* Silent */ }

        try {
            // Fetch Templates
            const tplData = await api.get('/templates');
            if (tplData) {
                setTemplates(tplData);
            }
        } catch (e) { /* Silent */ }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            await api.put('/settings/smtp', payload);
            setSuccess('Configuración SMTP guardada');
        } catch (err) {
            setError(err.message || 'Error al guardar SMTP');
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
            await api.put('/settings/oauth', {
                enabled: settings.oauth_enabled,
                client_id: settings.oauth_client_id,
                client_secret: settings.oauth_client_secret
            });
            setSuccess('Configuración OAuth guardada');
        } catch (err) {
            setError(err.message || 'Error al guardar OAuth');
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
            await api.put(`/templates/${selectedTemplate.key}`, formData);
            setSuccess('Plantilla guardada');
            fetchData(); // Refresh templates
        } catch (err) {
            setError(err.message || 'Error al guardar plantilla');
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
                    className={`pb-3 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'oauth' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                    Google Auth
                </button>
                <button
                    onClick={() => { setActiveTab('templates'); setEditMode(false); }}
                    className={`pb-3 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'templates' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                    Plantillas de Email
                </button>
                <button
                    onClick={() => { setActiveTab('smtp'); setEditMode(false); }}
                    className={`pb-3 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'smtp' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                    Configuración SMTP
                </button>
            </div>

            {loading ? (
                <div className="p-4 flex justify-center"><div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
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
