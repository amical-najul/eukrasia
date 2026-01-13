import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Layout, Shield } from 'lucide-react';

const GeneralTab = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Branding + Security Settings
    const [settings, setSettings] = useState({
        app_name: '',
        company_name: '',
        app_favicon_url: '',
        app_version: '',
        footer_text: '',
        support_email: '',
        rate_limit_avatar_enabled: true,
        rate_limit_password_enabled: true,
        rate_limit_login_enabled: true
    });

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const resAuth = await fetch(`${API_URL}/settings/smtp`, {
                headers: { 'x-auth-token': token }
            });

            if (resAuth.ok) {
                const data = await resAuth.json();
                setSettings({
                    app_name: data.app_name || '',
                    company_name: data.company_name || '',
                    app_favicon_url: data.app_favicon_url || '',
                    app_version: data.app_version || '',
                    footer_text: data.footer_text || '',
                    support_email: data.support_email || '',
                    rate_limit_avatar_enabled: data.rate_limit_avatar_enabled !== false,
                    rate_limit_password_enabled: data.rate_limit_password_enabled !== false,
                    rate_limit_login_enabled: data.rate_limit_login_enabled !== false
                });
            }
        } catch (err) {
            console.error('Error fetching general settings:', err);
            setError('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSettingsSaving(true);
        setError('');
        setSuccess('');

        const payload = {
            app_name: settings.app_name,
            company_name: settings.company_name,
            app_favicon_url: settings.app_favicon_url,
            app_version: settings.app_version,
            footer_text: settings.footer_text,
            support_email: settings.support_email,
            rate_limit_avatar_enabled: settings.rate_limit_avatar_enabled,
            rate_limit_password_enabled: settings.rate_limit_password_enabled,
            rate_limit_login_enabled: settings.rate_limit_login_enabled
        };

        try {
            const res = await fetch(`${API_URL}/settings/smtp`, { // Legacy endpoint writes everything passed
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSuccess('Ajustes guardados correctamente');
                if (settings.app_name) document.title = settings.app_name;
            } else {
                const data = await res.json();
                setError(data.message || 'Error al guardar');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSettingsSaving(false);
        }
    };

    const handleFaviconUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('favicon', file);

        setSettingsSaving(true);
        try {
            // Reusing user avatar upload endpoint? Or a specific one?
            // The original code used /users/avatar which updates USER avatar, not APP favicon.
            // Wait, looking at original code... it updated app_favicon_url state with data.avatar_url.
            // This means it was uploading to user profile but using that URL as global favicon? 
            // Probably fine for now as a hack.
            const res = await fetch(`${API_URL}/settings/favicon`, {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setSettings(prev => ({ ...prev, app_favicon_url: data.favicon_url }));
                setSuccess('Imagen subida. Guarda para aplicar como Favicon.');
            } else {
                setError(data.message || 'Error al subir imagen');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSettingsSaving(false);
        }
    };

    const handleFaviconDelete = () => {
        setSettings(prev => ({ ...prev, app_favicon_url: '' }));
    };

    if (loading) return <div className="p-4">Cargando...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700/30 p-6 max-w-4xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <Layout className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Identidad y Branding
            </h3>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Aplicación</label>
                    <input
                        type="text"
                        value={settings.app_name}
                        onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                        placeholder="Mi Aplicación"
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500">Nombre visible en el navegador y correos.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Empresa</label>
                    <input
                        type="text"
                        value={settings.company_name}
                        onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                        placeholder="Mi Empresa S.A."
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Usado en plantillas legales y variables (%EMPRESA_NAME%).</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email de Soporte</label>
                    <input
                        type="email"
                        value={settings.support_email}
                        onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                        placeholder="soporte@miempresa.com"
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email de contacto para soporte (%SUPPORT_EMAIL%).</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Favicon / Logo</label>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative group">
                            {settings.app_favicon_url ? (
                                <img src={settings.app_favicon_url} alt="Favicon" className="w-full h-full object-contain p-2" />
                            ) : (
                                <Layout className="w-8 h-8 text-gray-300" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <label className="cursor-pointer bg-[#008a60] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#007a55] transition-colors">
                                    Subir Imagen
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFaviconUpload} />
                                </label>
                                {settings.app_favicon_url && (
                                    <button
                                        onClick={handleFaviconDelete}
                                        className="px-3 py-2 border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50"
                                    >
                                        Eliminar
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">Recomendado: 64x64px PNG o ICO.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Versión de la App</label>
                        <input
                            type="text"
                            value={settings.app_version}
                            onChange={(e) => setSettings({ ...settings, app_version: e.target.value })}
                            placeholder="1.0.0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto del Pie de Página (Footer)</label>
                    <textarea
                        value={settings.footer_text}
                        onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                        placeholder="© 2024 Mi Aplicación. Todos los derechos reservados."
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                </div>

                {/* Security Rate Limits Section */}
                <div className="pt-6 border-t dark:border-slate-700">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        Limites de Seguridad
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Estos limites aplican solo a usuarios, no a administradores.</p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-200">Limite de cambios de foto</p>
                                <p className="text-xs text-gray-500">Max 2 cambios de avatar cada 24 horas</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings(prev => ({ ...prev, rate_limit_avatar_enabled: !prev.rate_limit_avatar_enabled }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.rate_limit_avatar_enabled ? 'bg-[#008a60]' : 'bg-gray-200 dark:bg-slate-600'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.rate_limit_avatar_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-200">Limite de cambios de contraseña</p>
                                <p className="text-xs text-gray-500">Max 3 cambios cada 24 horas + no reutilizar ultimas 5</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings(prev => ({ ...prev, rate_limit_password_enabled: !prev.rate_limit_password_enabled }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.rate_limit_password_enabled ? 'bg-[#008a60]' : 'bg-gray-200 dark:bg-slate-600'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.rate_limit_password_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-200">Limite de intentos de login</p>
                                <p className="text-xs text-gray-500">Bloqueo temporal tras intentos fallidos</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings(prev => ({ ...prev, rate_limit_login_enabled: !prev.rate_limit_login_enabled }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.rate_limit_login_enabled ? 'bg-[#008a60]' : 'bg-gray-200 dark:bg-slate-600'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.rate_limit_login_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t dark:border-slate-700">
                    <button
                        onClick={handleSaveSettings}
                        disabled={settingsSaving}
                        className="px-6 py-2 bg-[#008a60] text-white rounded-lg font-medium hover:bg-[#007a55] disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {settingsSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneralTab;
