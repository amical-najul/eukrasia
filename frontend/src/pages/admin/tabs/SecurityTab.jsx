import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Lock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const SecurityTab = () => {
    const { token, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState({ hasCustomJwtSecret: false, lastUpdated: null });

    // Form State
    const [newSecret, setNewSecret] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // UI State
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/settings/security/jwt`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setInfo({
                    hasCustomJwtSecret: data.hasCustomJwtSecret,
                    lastUpdated: data.jwtSecretLastUpdated
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateSecureSecret = () => {
        const array = new Uint8Array(64);
        window.crypto.getRandomValues(array);
        const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
        setNewSecret(hex);
    };

    const handleUpdate = async () => {
        if (!newSecret || !adminPassword) return;

        setSaving(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/settings/security/jwt`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ newSecret, adminPassword })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Clave actualizada correctamente. Cerrando sesiones...');
                setTimeout(() => {
                    logout();
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError(data.message || 'Error al actualizar');
                setSaving(false); // Only stop saving if error, otherwise wait for redirect
            }
        } catch (err) {
            setError('Error de conexión');
            setSaving(false);
        }
    };

    const openModal = () => {
        setAdminPassword('');
        setConfirmModalOpen(true);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando seguridad...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    Seguridad de Sesiones (JWT)
                </h3>
            </div>

            <div className="p-6 space-y-8">
                {/* Warning Banner */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Acción Crítica
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    Cambiar el secreto JWT invalidará <strong>inmediatamente</strong> todas las sesiones activas.
                                    Todos los usuarios (incluido tú) serán desconectados y deberán iniciar sesión nuevamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">Estado Actual</h4>
                    <div className="flex items-center gap-2">
                        {info.hasCustomJwtSecret ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Clave Personalizada Activa
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Usando Clave por Defecto
                            </span>
                        )}
                        {/* Badges kept as is due to specific semantic colors, but date text update */}
                        {info.lastUpdated && <span className="text-xs text-gray-500 dark:text-gray-400">Actualizada: {new Date(info.lastUpdated).toLocaleDateString()}</span>}
                    </div>
                </div>

                {/* Generator Form */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nuevo Secreto JWT</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={newSecret}
                            placeholder="Genera un nuevo secreto para continuar..."
                            className="flex-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed font-mono px-3 py-2 border"
                        />
                        <button
                            onClick={generateSecureSecret}
                            className="inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-700 shadow-sm text-sm font-medium rounded-md text-blue-700 dark:text-blue-200 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Generar
                        </button>
                    </div>
                    {newSecret && <p className="text-xs text-green-600 font-medium">✨ Nueva clave generada y lista para aplicar.</p>}
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                    <button
                        onClick={openModal}
                        disabled={!newSecret}
                        className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Actualizar Claves y Cerrar Sesiones
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Confirmar Rotación de Claves
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 mb-4">
                                            Por favor, confirma tu contraseña de administrador para autorizar esta operación sensible.
                                        </p>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700">Tu Contraseña</label>
                                            <input
                                                type="password"
                                                value={adminPassword}
                                                onChange={(e) => setAdminPassword(e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        {error && (
                                            <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                                                {error}
                                            </div>
                                        )}
                                        {success && (
                                            <div className="mt-3 text-sm text-green-600 bg-green-50 p-2 rounded">
                                                {success}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    disabled={saving || !adminPassword}
                                    onClick={handleUpdate}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    {saving ? 'Verificando...' : 'Confirmar y Aplicar'}
                                </button>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => setConfirmModalOpen(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityTab;
