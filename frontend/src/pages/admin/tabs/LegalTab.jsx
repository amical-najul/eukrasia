import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FileText } from 'lucide-react';
import api from '../../../services/api';

const LegalTab = () => {
    // const { token } = useAuth(); // token removed
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [legal, setLegal] = useState({
        terms_content: '',
        privacy_content: ''
    });

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await api.get('/settings/smtp'); // Keeping legacy endpoint
            if (data) {
                setLegal({
                    terms_content: data.terms_content || '',
                    privacy_content: data.privacy_content || ''
                });
            }
        } catch (err) {
            console.error('Error fetching legal settings:', err);
            setError('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await api.put('/settings/smtp', legal); // Keeping legacy endpoint
            setSuccess('Textos legales guardados correctamente');
        } catch (err) {
            setError(err.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Cargando...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 max-w-4xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Plantillas Legales
            </h3>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

            {/* Variables Info Box */}
            <div className="mb-6 bg-blue-50 dark:bg-slate-700/50 p-4 rounded-lg border border-blue-100 dark:border-slate-600">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-lime-300 mb-2">Variables Dinámicas Disponibles:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                        <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-blue-200 dark:border-slate-600">%APP_NAME%</code>
                        <span>→ Nombre de la Aplicación</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-blue-200 dark:border-slate-600">%EMPRESA_NAME%</code>
                        <span>→ Nombre de la Empresa</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-blue-200 dark:border-slate-600">%SUPPORT_EMAIL%</code>
                        <span>→ Email de Soporte</span>
                    </li>
                </ul>
            </div>

            <div className="space-y-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Términos y Condiciones</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Acepta formato Markdown básico.</p>
                    <textarea
                        value={legal.terms_content}
                        onChange={(e) => setLegal({ ...legal, terms_content: e.target.value })}
                        rows="10"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm dark:bg-slate-700 dark:text-white"
                        placeholder="# Términos y Condiciones..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Política de Privacidad</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Acepta formato Markdown básico.</p>
                    <textarea
                        value={legal.privacy_content}
                        onChange={(e) => setLegal({ ...legal, privacy_content: e.target.value })}
                        rows="10"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm dark:bg-slate-700 dark:text-white"
                        placeholder="# Política de Privacidad..."
                    />
                </div>

                <div className="pt-4 border-t">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 dark:bg-lime-500 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-lime-600 disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalTab;
