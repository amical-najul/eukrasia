import React from 'react';
import { PLACEHOLDERS } from './constants';

const TemplateEditor = ({ selectedTemplate, formData, handleChange, saving, handleSaveTemplate, setEditMode, error, success, settings }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setEditMode(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{selectedTemplate?.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTemplate?.description}</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveTemplate}
                    disabled={saving}
                    className="px-4 py-2 bg-[#008a60] text-white rounded-lg font-medium hover:bg-[#007a55] disabled:opacity-50"
                >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Form */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del remitente</label>
                            <input
                                type="text"
                                value={formData.sender_name}
                                onChange={(e) => handleChange('sender_name', e.target.value)}
                                placeholder="Mi App"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email remitente</label>
                            <input
                                type="email"
                                value={formData.sender_email}
                                onChange={(e) => handleChange('sender_email', e.target.value)}
                                placeholder="noreply@app.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responder a</label>
                        <input
                            type="text"
                            value={formData.reply_to}
                            onChange={(e) => handleChange('reply_to', e.target.value)}
                            placeholder="noreply"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                        <textarea
                            value={formData.body_html}
                            onChange={(e) => handleChange('body_html', e.target.value)}
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#008a60] focus:border-[#008a60] font-mono text-sm"
                        />
                    </div>

                    {/* Variables */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Variables disponibles</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {PLACEHOLDERS.map(p => (
                                <div key={p.var} className="flex items-center gap-2">
                                    <code className="bg-[#008a60] text-white px-2 py-0.5 rounded text-xs font-semibold">{p.var}</code>
                                    <span className="text-gray-600 dark:text-gray-400 text-xs">{p.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Preview */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vista Previa</label>
                    <div className="border border-gray-200 rounded-lg bg-white p-4 min-h-[400px]">
                        <div className="border-b pb-3 mb-3">
                            <p className="text-xs text-gray-500">De: {formData.sender_name || 'Remitente'} &lt;{formData.sender_email || 'email@example.com'}&gt;</p>
                            <p className="text-xs text-gray-500">Responder a: {formData.reply_to || 'noreply'}</p>
                            <p className="text-sm font-semibold mt-2">
                                {(formData.subject || 'Sin asunto')
                                    .replace(/%DISPLAY_NAME%/g, 'Juan Pérez')
                                    .replace(/%APP_NAME%/g, settings.app_name || 'Mi Aplicación')
                                    .replace(/%EMPRESA_NAME%/g, settings.company_name || 'Mi Empresa')
                                    .replace(/%SUPPORT_EMAIL%/g, settings.support_email || 'soporte@example.com')
                                }
                            </p>
                        </div>
                        <div className="whitespace-pre-wrap text-sm text-gray-700">
                            {formData.body_html
                                .replace(/%DISPLAY_NAME%/g, 'Juan Pérez')
                                .replace(/%APP_NAME%/g, settings.app_name || 'Mi Aplicación')
                                .replace(/%EMPRESA_NAME%/g, settings.company_name || 'Mi Empresa')
                                .replace(/%SUPPORT_EMAIL%/g, settings.support_email || 'soporte@example.com')
                                .replace(/%EMAIL%/g, 'juan@example.com')
                                .replace(/%NEW_EMAIL%/g, 'nuevo@example.com')
                                .replace(/%LINK%/g, 'https://app.example.com/action?mode=verify&code=abc123')
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateEditor;
