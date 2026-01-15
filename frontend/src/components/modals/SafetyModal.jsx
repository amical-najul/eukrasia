import React from 'react';

import { useTheme } from '../../context/ThemeContext';

const SafetyModal = ({ isOpen, onClose, onConfirm }) => {
    const { isDark } = useTheme();
    const isLight = !isDark;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`rounded-3xl p-8 max-w-sm w-full text-center relative border shadow-2xl animate-fade-in transition-colors ${isDark ? 'glass-modal border-white/10' : 'bg-white border-gray-200'
                }`}>

                {/* Icon (Bearded Man / Placeholder) */}
                <div className="flex justify-center mb-6">
                    <div className={`w-24 h-24 rounded-2xl flex items-center justify-center transform rotate-45 mb-2 ${isDark ? 'bg-lime-500/10' : 'bg-blue-600/10'}`}>
                        <div className="transform -rotate-45">
                            <img
                                src="/icons/breathing_guided_custom.png"
                                alt="Safety"
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                    </div>
                </div>

                <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Precauciones de seguridad para ejercicios de respiración
                </h2>

                <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm space-y-4 mb-8 leading-relaxed`}>
                    <p>
                        Por favor, siéntate en un entorno seguro.
                    </p>
                    <p>
                        No hagas ejercicios de respiración en una piscina, bajo el agua, en la ducha, conduciendo un vehículo o sin la supervisión adecuada.
                    </p>
                    <p>
                        Recuerda siempre hacer los ejercicios sin forzar y aumentar gradualmente.
                    </p>
                    <p className={`font-semibold mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ¡Amor, fuerza y felicidad para todos!
                    </p>
                </div>

                <button
                    onClick={onConfirm}
                    className={`w-full font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 uppercase tracking-widest text-sm ${isDark
                            ? 'bg-lime-500 hover:bg-lime-400 text-gray-900 shadow-lime-500/20'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                        }`}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default SafetyModal;
