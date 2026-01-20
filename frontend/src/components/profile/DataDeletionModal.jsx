import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Trash2, AlertTriangle, Check, X } from 'lucide-react';
import userService from '../../services/userService';

const DataDeletionModal = ({ isOpen, onClose, type, title, description, requirePassword = false, onSuccess }) => {
    const { isDark } = useTheme();
    const { t } = useLanguage(); // Using t for translations if available, or fallbacks
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1); // 1: Confirmation, 2: Password (if needed), 3: Success

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (requirePassword && step === 1) {
            setStep(2);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await userService.deleteData(type.toLowerCase(), password);
            setStep(3);
            if (onSuccess) onSuccess();
            setTimeout(() => {
                onClose();
                // Reset state after close animation
                setTimeout(() => {
                    setStep(1);
                    setPassword('');
                }, 300);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al eliminar datos');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border ${isDark ? 'bg-slate-800 border-red-900/50' : 'bg-white border-red-100'
                }`}>

                {/* Header */}
                <div className={`p-4 border-b flex items-center gap-3 ${isDark ? 'bg-red-900/20 border-red-900/30' : 'bg-red-50 border-red-100'
                    }`}>
                    <div className={`p-2 rounded-full ${isDark ? 'bg-red-900/50 text-red-500' : 'bg-red-100 text-red-600'}`}>
                        <Trash2 size={20} />
                    </div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                        Eliminar Datos
                    </h3>
                </div>

                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {title}
                            </h4>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {description}
                            </p>

                            <div className={`flex items-start gap-3 p-3 rounded-lg text-sm ${isDark ? 'bg-amber-900/20 text-amber-200 border border-amber-900/30' : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}>
                                <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                                <p>Esta acción es permanente y no se puede deshacer.</p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Confirmar con Contraseña
                            </h4>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Para continuar con esta acción destructiva, por favor ingresa tu contraseña.
                            </p>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña actual"
                                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none transition-all ${isDark
                                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-4 space-y-3">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                                <Check size={32} />
                            </div>
                            <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ¡Datos Eliminados!
                            </h4>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg flex items-center gap-2">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    {step !== 3 && (
                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${isDark
                                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading || (step === 2 && !password)}
                                className={`flex-1 py-2.5 rounded-lg font-medium text-white transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${isLoading
                                        ? 'bg-red-800'
                                        : 'bg-red-600 hover:bg-red-700 active:scale-95'
                                    }`}
                            >
                                {isLoading ? 'Procesando...' : (step === 2 ? 'Confirmar' : 'Eliminar')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataDeletionModal;
