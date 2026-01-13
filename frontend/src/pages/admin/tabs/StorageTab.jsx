import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const StorageTab = () => {
    const { token } = useAuth();

    // Steps: 'idle' | 'analyzing' | 'review' | 'cleaning' | 'done'
    const [step, setStep] = useState('idle');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [cleanupResult, setCleanupResult] = useState(null);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    // Helper to format bytes
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const runAnalysis = async () => {
        setStep('analyzing');
        setError('');
        setAnalysisResult(null);

        try {
            const res = await fetch(`${API_URL}/settings/maintenance/analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            const data = await res.json();
            if (res.ok) {
                setAnalysisResult(data); // Stores full object: { info, stats }
                setStep('review');
            } else {
                setError(data.message || 'Error al analizar almacenamiento');
                setStep('idle');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            setStep('idle');
        }
    };

    const confirmCleanup = async (e) => {
        e.preventDefault();
        if (!password) {
            setError('Ingresa tu contraseña para confirmar.');
            return;
        }

        setStep('cleaning');
        setError('');

        try {
            const res = await fetch(`${API_URL}/settings/maintenance/cleanup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ password })
            });

            const data = await res.json();
            if (res.ok) {
                setCleanupResult(data.stats);
                setStep('done');
                setPassword('');
            } else {
                setError(data.message || 'Error al ejecutar limpieza');
                setStep('review');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            setStep('review');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mantenimiento de Almacenamiento (S3/MinIO)</h3>

                {/* Warning Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">Cuidado</h3>
                            <div className="mt-2 text-sm text-amber-700">
                                <p>
                                    La herramienta escaneará el bucket de avatares en busca de archivos que no estén referenciados en la base de datos.
                                    Se requerirá confirmación antes de eliminar permanentemente cualquier archivo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Action Area */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-6">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Escáner de Archivos Huérfanos</h4>
                        <p className="text-sm text-gray-500">Detecta y elimina archivos residuales para liberar espacio.</p>
                    </div>

                    {step === 'idle' && (
                        <button
                            onClick={runAnalysis}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Analizar Almacenamiento
                        </button>
                    )}

                    {step === 'analyzing' && (
                        <button disabled className="px-4 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-wait flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Analizando...
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                        {error}
                    </div>
                )}

                {/* Analysis Report */}
                {step === 'review' && analysisResult && (
                    <div className="mt-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 animate-fadeIn">

                        {/* Bucket Info Section */}
                        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-600">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                Información del Bucket
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">Endpoint</span>
                                    <code className="block bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-blue-600 dark:text-blue-400 break-all border border-gray-200 dark:border-gray-600">
                                        {analysisResult.info.endpoint}
                                    </code>
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">Nombre del Bucket</span>
                                    <code className="block bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-purple-600 dark:text-purple-400 font-mono border border-gray-200 dark:border-gray-600">
                                        {analysisResult.info.bucket}
                                    </code>
                                </div>
                            </div>

                            {analysisResult.info.folders && analysisResult.info.folders.length > 0 && (
                                <div className="mt-4">
                                    <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold mb-2">Carpetas (Prefixes)</span>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.info.folders.map(f => (
                                            <span key={f} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs font-mono">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Estadísticas de Limpieza</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-lg">
                                <span className="block text-sm text-gray-500 dark:text-gray-400">Archivos Legítimos</span>
                                <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{analysisResult.stats.total_db_files}</span>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-lg">
                                <span className="block text-sm text-gray-500 dark:text-gray-400">Archivos Huérfanos</span>
                                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analysisResult.stats.orphans_found}</span>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-slate-800 rounded-lg">
                                <span className="block text-sm text-gray-500 dark:text-gray-400">Espacio Recuperable</span>
                                <span className="text-2xl font-bold text-green-700 dark:text-green-400">{formatBytes(analysisResult.stats.reclaimable_space_bytes)}</span>
                            </div>
                        </div>

                        {analysisResult.stats.orphans_found > 0 ? (
                            <form onSubmit={confirmCleanup} className="border-t border-gray-100 dark:border-gray-600 pt-6">
                                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Confirmar Limpieza</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    Para proceder con la eliminación permanente de {analysisResult.stats.orphans_found} archivos, por favor ingresa tu contraseña de administrador.
                                </p>

                                <div className="flex gap-4">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Contraseña del admin"
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none dark:bg-gray-800"
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        Eliminar Archivos
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                                ✅ Tu almacenamiento está limpio. No se encontraron archivos huérfanos.
                            </div>
                        )}
                    </div>
                )}

                {/* Final Result */}
                {(step === 'cleaning' || step === 'done') && (
                    <div className="mt-6">
                        {step === 'cleaning' ? (
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Ejecutando limpieza y liberando espacio...</span>
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 animate-fadeIn">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h4 className="text-lg font-semibold text-green-800">¡Limpieza Exitosa!</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 uppercase text-xs font-bold">Archivos Eliminados</span>
                                        <p className="text-2xl font-bold text-gray-800">{cleanupResult?.deleted || 0}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 uppercase text-xs font-bold">Errores</span>
                                        <p className="text-2xl font-bold text-gray-800">{cleanupResult?.errors || 0}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setStep('idle'); setPassword(''); setAnalysisResult(null); }}
                                    className="mt-6 text-green-700 hover:text-green-900 font-medium text-sm underline"
                                >
                                    Volver al inicio
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StorageTab;
