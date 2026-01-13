import React from 'react';

const GoogleOAuthSettings = ({ settings, handleSettingsChange, handleSaveSettings, settingsSaving, error, success }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Autenticación con Google</h3>
                    <p className="text-sm text-gray-500">Configura las credenciales de OAuth 2.0 para permitir inicio de sesión con Google.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-gray-600">Habilitar</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={settings.oauth_enabled}
                            onChange={(e) => handleSettingsChange('oauth_enabled', e.target.checked)}
                            className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${settings.oauth_enabled ? 'bg-[#008a60]' : 'bg-gray-300'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.oauth_enabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                    </div>
                </label>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

            <div className={`space-y-4 ${!settings.oauth_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client ID</label>
                    <input
                        type="text"
                        value={settings.oauth_client_id}
                        onChange={(e) => handleSettingsChange('oauth_client_id', e.target.value)}
                        placeholder="xxxxx-xxxxx.apps.googleusercontent.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60] font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Obtenido desde Google Cloud Console → APIs & Services → Credentials</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Secret (Opcional)</label>
                    <input
                        type="password"
                        value={settings.oauth_client_secret}
                        onChange={(e) => handleSettingsChange('oauth_client_secret', e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                    />
                    <p className="mt-1 text-xs text-gray-500">Solo necesario para flujos server-side. Dejar vacío si no se requiere.</p>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">📋 Cómo obtener las credenciales</h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Ve a <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                        <li>Crea un proyecto o selecciona uno existente</li>
                        <li>Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth"</li>
                        <li>Selecciona "Aplicación web"</li>
                        <li>Agrega tus URLs de origen y redirección</li>
                        <li>Copia el Client ID aquí</li>
                    </ol>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving || !settings.oauth_enabled}
                    className="px-6 py-2 bg-[#008a60] text-white rounded-lg font-medium hover:bg-[#007a55] disabled:opacity-50"
                >
                    {settingsSaving ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </div>
    );
};

export default GoogleOAuthSettings;
