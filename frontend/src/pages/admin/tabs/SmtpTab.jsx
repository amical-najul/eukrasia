import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Mail, Save, AlertCircle } from 'lucide-react';

const SmtpTab = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        smtp_enabled: false,
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_pass: '',
        smtp_secure: 'tls',
        sender_email: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // Nota: Usamos el endpoint legacy /smtp que devuelve todo, pero solo usamos lo de SMTP
            const res = await fetch(`${API_URL}/settings/smtp`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    smtp_enabled: data.enabled || false, // Mapping legacy 'enabled' to smtp_enabled
                    smtp_host: data.smtp_host || '',
                    smtp_port: data.smtp_port || '587',
                    smtp_user: data.smtp_user || '',
                    smtp_pass: data.smtp_pass || '',
                    smtp_secure: data.smtp_secure || 'tls',
                    sender_email: data.sender_email || ''
                });
            }
        } catch (err) {
            console.error('Error fetching SMTP settings:', err);
            setError('Error al cargar configuración de correo');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        // Map back to legacy payload structure expect by settingsController
        const payload = {
            enabled: settings.smtp_enabled,
            smtp_host: settings.smtp_host,
            smtp_port: settings.smtp_port,
            smtp_user: settings.smtp_user,
            smtp_pass: settings.smtp_pass,
            smtp_secure: settings.smtp_secure,
            sender_email: settings.sender_email
        };

        try {
            const res = await fetch(`${API_URL}/settings/smtp`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSuccess('Configuración de correo guardada');
            } else {
                const data = await res.json();
                setError(data.message || 'Error al guardar');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Cargando configuración SMTP...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Configuración de Correo (SMTP)
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="flex items-center cursor-pointer mb-4">
                        <input
                            type="checkbox"
                            checked={settings.smtp_enabled}
                            onChange={(e) => handleChange('smtp_enabled', e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-200 font-medium">Habilitar envío de correos</span>
                    </label>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!settings.smtp_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Host SMTP</label>
                        <input
                            type="text"
                            value={settings.smtp_host}
                            onChange={(e) => handleChange('smtp_host', e.target.value)}
                            placeholder="smtp.gmail.com"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Puerto</label>
                        <input
                            type="number"
                            value={settings.smtp_port}
                            onChange={(e) => handleChange('smtp_port', e.target.value)}
                            placeholder="587"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
                        <input
                            type="text"
                            value={settings.smtp_user}
                            onChange={(e) => handleChange('smtp_user', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={settings.smtp_pass}
                            placeholder={settings.smtp_pass ? '••••••••' : ''}
                            onChange={(e) => handleChange('smtp_pass', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seguridad</label>
                        <select
                            value={settings.smtp_secure}
                            onChange={(e) => handleChange('smtp_secure', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                        >
                            <option value="false">Ninguna</option>
                            <option value="tls">TLS (STARTTLS)</option>
                            <option value="ssl">SSL</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email remitente (From)</label>
                        <input
                            type="email"
                            value={settings.sender_email}
                            onChange={(e) => handleChange('sender_email', e.target.value)}
                            placeholder="no-reply@midominio.com"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                </div>

                {error && <div className="text-red-600 bg-red-50 p-3 rounded flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
                {success && <div className="text-green-600 bg-green-50 p-3 rounded">{success}</div>}

                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmtpTab;
