import React from 'react';

const SmtpSettings = ({ settings, handleSettingsChange, handleSaveSettings, settingsSaving, error, success }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración del SMTP</h3>
                    <p className="text-sm text-gray-500">Usa tu propio servidor SMTP para el envío de correos electrónicos.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-gray-600">Habilitar</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
                            className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-[#008a60]' : 'bg-gray-300'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.enabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                    </div>
                </label>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email del remitente</label>
                    <input
                        type="email"
                        value={settings.sender_email}
                        onChange={(e) => handleSettingsChange('sender_email', e.target.value)}
                        placeholder="support@yourdomain.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Host del servidor SMTP</label>
                    <input
                        type="text"
                        value={settings.smtp_host}
                        onChange={(e) => handleSettingsChange('smtp_host', e.target.value)}
                        placeholder="smtp.host.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Puerto</label>
                    <input
                        type="text"
                        value={settings.smtp_port}
                        onChange={(e) => handleSettingsChange('smtp_port', e.target.value)}
                        placeholder="587"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modo de seguridad</label>
                    <select
                        value={settings.smtp_secure}
                        onChange={(e) => handleSettingsChange('smtp_secure', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                    >
                        <option value="none">Ninguno</option>
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de usuario</label>
                    <input
                        type="text"
                        value={settings.smtp_user}
                        onChange={(e) => handleSettingsChange('smtp_user', e.target.value)}
                        placeholder="username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                    <input
                        type="password"
                        value={settings.smtp_pass}
                        onChange={(e) => handleSettingsChange('smtp_pass', e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving || !settings.enabled}
                    className="px-6 py-2 bg-[#008a60] text-white rounded-lg font-medium hover:bg-[#007a55] disabled:opacity-50"
                >
                    {settingsSaving ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </div>
    );
};

export default SmtpSettings;
