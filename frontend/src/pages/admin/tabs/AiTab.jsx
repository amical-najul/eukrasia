import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Cpu, Shield, AlertTriangle, Server, Key } from 'lucide-react';
import { LLM_PROVIDERS } from '../../../constants/llmModels';

const AiTab = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // AI Settings State
    const [globalEnabled, setGlobalEnabled] = useState(true);
    const [limits, setLimits] = useState([]);
    const [settings, setSettings] = useState({
        llm_provider: 'openai',
        llm_model: '',
        llm_api_key: '',
        llm_provider_secondary: '',
        llm_model_secondary: '',
        llm_api_key_secondary: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchAiSettings();
    }, []);

    const fetchAiSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/settings/ai`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setGlobalEnabled(data.globalEnabled);
                setSettings({
                    llm_provider: data.llm_provider || 'openai',
                    llm_model: data.llm_model || '',
                    llm_api_key: data.llm_api_key || '',
                    llm_provider_secondary: data.llm_provider_secondary || '',
                    llm_model_secondary: data.llm_model_secondary || '',
                    llm_api_key_secondary: data.llm_api_key_secondary || ''
                });

                // Ensure we have entries for all roles
                const defaults = [
                    { role: 'admin', daily_token_limit: 100000, daily_request_limit: 1000, enabled: true },
                    { role: 'user', daily_token_limit: 10000, daily_request_limit: 50, enabled: true },
                    { role: 'guest', daily_token_limit: 1000, daily_request_limit: 10, enabled: true },
                ];

                const mergedLimits = defaults.map(def => {
                    const found = data.limits.find(l => l.role === def.role);
                    return found ? { ...found } : def;
                });

                setLimits(mergedLimits);
            }
        } catch (err) {
            console.error('Error fetching AI settings:', err);
            setError('Error al cargar configuración de IA');
        } finally {
            setLoading(false);
        }
    };

    const handleLimitChange = (index, field, value) => {
        const newLimits = [...limits];
        if (field === 'enabled') {
            newLimits[index][field] = value;
        } else {
            newLimits[index][field] = parseInt(value, 10) || 0;
        }
        setLimits(newLimits);
    };

    const handleSettingsChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    // Helper to get models for specific provider
    const getModelsForProvider = (providerId) => {
        const provider = LLM_PROVIDERS.find(p => p.id === providerId);
        return provider ? provider.models : { general: [], code: [] };
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_URL}/settings/ai`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    globalEnabled,
                    limits,
                    ...settings
                })
            });

            if (res.ok) {
                setSuccess('Configuración de IA guardada correctamente');
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

    // Translate role names for UI
    const getRoleName = (role) => {
        const map = {
            'admin': 'Administrador',
            'user': 'Usuario',
            'guest': 'Invitado'
        };
        return map[role] || role;
    };

    if (loading) return <div className="p-4">Cargando configuración de inteligencia artificial...</div>;

    return (
        <div className="space-y-8">
            {/* Global Switch */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Cpu className="w-5 h-5" />
                            Control Maestro
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Habilitar o deshabilitar toda la funcionalidad de IA en la plataforma.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={globalEnabled}
                            onChange={(e) => setGlobalEnabled(e.target.checked)}
                        />
                        <div className="w-14 h-7 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {globalEnabled ? 'IA Habilitada' : 'IA Deshabilitada'}
                        </span>
                    </label>
                </div>
            </div>

            <div className={`space-y-8 transition-opacity ${!globalEnabled ? 'opacity-50 pointer-events-none' : ''}`}>

                {/* Model Configuration */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Server className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            Proveedores y Modelos
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Provider */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 uppercase tracking-wide">Proveedor Principal</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
                                <select
                                    value={settings.llm_provider || 'openai'}
                                    onChange={(e) => {
                                        handleSettingsChange('llm_provider', e.target.value);
                                        handleSettingsChange('llm_model', '');
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                                >
                                    {LLM_PROVIDERS.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
                                <select
                                    value={settings.llm_model}
                                    onChange={(e) => handleSettingsChange('llm_model', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">Seleccionar modelo...</option>
                                    <optgroup label="Modelos Generales">
                                        {getModelsForProvider(settings.llm_provider || 'openai').general.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Modelos de Código">
                                        {getModelsForProvider(settings.llm_provider || 'openai').code.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                    <Key className="w-3 h-3" /> API Key
                                </label>
                                <input
                                    type="password"
                                    value={settings.llm_api_key}
                                    onChange={(e) => handleSettingsChange('llm_api_key', e.target.value)}
                                    placeholder={settings.llm_api_key ? '••••••••' : 'sk-...'}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Secondary Provider */}
                        <div className="space-y-4 bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                            <div className="flex justify-between">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wide">Proveedor Secundario (Backup)</h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Opcional</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
                                <select
                                    value={settings.llm_provider_secondary || ''}
                                    onChange={(e) => {
                                        handleSettingsChange('llm_provider_secondary', e.target.value);
                                        handleSettingsChange('llm_model_secondary', '');
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="">Desactivado</option>
                                    {LLM_PROVIDERS.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
                                <select
                                    value={settings.llm_model_secondary}
                                    onChange={(e) => handleSettingsChange('llm_model_secondary', e.target.value)}
                                    disabled={!settings.llm_provider_secondary}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-slate-900"
                                >
                                    <option value="">Seleccionar modelo...</option>
                                    {settings.llm_provider_secondary && (
                                        <>
                                            <optgroup label="Modelos Generales">
                                                {getModelsForProvider(settings.llm_provider_secondary).general.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Modelos de Código">
                                                {getModelsForProvider(settings.llm_provider_secondary).code.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </optgroup>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                    <Key className="w-3 h-3" /> API Key
                                </label>
                                <input
                                    type="password"
                                    value={settings.llm_api_key_secondary}
                                    onChange={(e) => handleSettingsChange('llm_api_key_secondary', e.target.value)}
                                    disabled={!settings.llm_provider_secondary}
                                    placeholder={settings.llm_api_key_secondary ? '••••••••' : 'sk-...'}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm disabled:bg-gray-100 dark:disabled:bg-slate-900 dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Limits Table */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            Límites y Cuotas por Rol
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Habilitado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tokens / Día</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peticiones / Día</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {limits.map((limit, idx) => (
                                    <tr key={limit.role} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                                                {getRoleName(limit.role)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={limit.enabled}
                                                onChange={(e) => handleLimitChange(idx, 'enabled', e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="number"
                                                value={limit.daily_token_limit}
                                                onChange={(e) => handleLimitChange(idx, 'daily_token_limit', e.target.value)}
                                                className="block w-32 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm dark:bg-slate-700 dark:text-white"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="number"
                                                value={limit.daily_request_limit}
                                                onChange={(e) => handleLimitChange(idx, 'daily_request_limit', e.target.value)}
                                                className="block w-32 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm dark:bg-slate-700 dark:text-white"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {saving ? 'Guardando...' : 'Guardar Configuración de IA'}
                </button>
            </div>
        </div>
    );
};

export default AiTab;
