import React from 'react';

const GeneralSettings = ({ settings, handleSettingsChange, handleFaviconUpload, handleFaviconDelete, settingsSaving, handleSaveSettings, error, success }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-8">
            {/* Branding Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Personalización de Marca</h3>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Aplicación</label>
                        <input
                            type="text"
                            value={settings.app_name}
                            onChange={(e) => handleSettingsChange('app_name', e.target.value)}
                            placeholder="Mi Increíble App"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                        />
                        <p className="mt-1 text-xs text-gray-500">Este nombre aparecerá en la pestaña del navegador y en los correos electrónicos.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Empresa</label>
                        <input
                            type="text"
                            value={settings.company_name || ''}
                            onChange={(e) => handleSettingsChange('company_name', e.target.value)}
                            placeholder="Mi Empresa S.A."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                        />
                        <p className="mt-1 text-xs text-gray-500">Este nombre se usará en variables de plantillas (%EMPRESA_NAME%).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email de Soporte</label>
                        <input
                            type="email"
                            value={settings.support_email || ''}
                            onChange={(e) => handleSettingsChange('support_email', e.target.value)}
                            placeholder="soporte@miempresa.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                        />
                        <p className="mt-1 text-xs text-gray-500">Este email se usará en variables de plantillas (%SUPPORT_EMAIL%).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Favicon del Proyecto</label>
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative group">
                                {settings.app_favicon_url ? (
                                    <>
                                        <img src={settings.app_favicon_url} alt="Favicon" className="w-full h-full object-contain p-2" />
                                    </>
                                ) : (
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFaviconUpload}
                                        className="hidden"
                                        id="favicon-upload"
                                    />
                                    <label
                                        htmlFor="favicon-upload"
                                        className="inline-block px-4 py-2 bg-[#008a60] text-white rounded-lg text-sm font-medium hover:bg-[#007a55] cursor-pointer"
                                    >
                                        Subir Nuevo
                                    </label>
                                    {settings.app_favicon_url && (
                                        <button
                                            onClick={handleFaviconDelete}
                                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">Se recomienda una imagen cuadrada (PNG/SVG/ICO, 32x32px idealmente).</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="px-6 py-2 bg-[#008a60] text-white rounded-lg font-medium hover:bg-[#007a55] disabled:opacity-50 shadow-sm"
                >
                    {settingsSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
    );
};

export default GeneralSettings;
