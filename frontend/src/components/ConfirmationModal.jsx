import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
    const { isDark } = useTheme();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`rounded-2xl shadow-2xl max-w-md w-full transform scale-100 animate-in zoom-in-95 duration-200 overflow-hidden border transition-colors ${isDark ? 'glass-modal border-white/10' : 'bg-white border-gray-100'
                }`}>
                {/* Header */}
                <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'
                    }`}>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                    <button
                        onClick={onClose}
                        className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className={`px-5 py-2.5 rounded-xl font-medium transition-all ${isDark
                                ? 'text-gray-300 hover:bg-white/10'
                                : 'text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`px-5 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wide text-sm ${isDark
                                ? 'bg-red-500 hover:bg-red-400 shadow-red-500/20'
                                : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
