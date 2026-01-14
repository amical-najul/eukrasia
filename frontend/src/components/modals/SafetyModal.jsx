import React from 'react';

import { useTheme } from '../../context/ThemeContext';

const SafetyModal = ({ isOpen, onClose, onConfirm }) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
            <div className="bg-[#1a1f25] rounded-3xl p-8 max-w-sm w-full text-center relative border border-gray-700 shadow-2xl animate-fade-in">

                {/* Icon (Bearded Man / Placeholder) */}
                <div className="flex justify-center mb-6">
                    <div className={`w-24 h-24 rounded-2xl flex items-center justify-center transform rotate-45 mb-2 ${isLight ? 'bg-blue-900/50' : 'bg-[#84cc16]/20'}`}>
                        <div className="transform -rotate-45">
                            {/* Using the meditation icon as a proxy for the 'bearded man' / guru figure */}
                            <img
                                src="/icons/breathing_guided_custom.png"
                                alt="Safety"
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-6">
                    Precauciones de seguridad para ejercicios de respiración
                </h2>

                <div className="text-gray-300 text-sm space-y-4 mb-8 leading-relaxed">
                    <p>
                        Por favor, siéntate en un entorno seguro.
                    </p>
                    <p>
                        No hagas ejercicios de respiración en una piscina, bajo el agua, en la ducha, conduciendo un vehículo o sin la supervisión adecuada.
                    </p>
                    <p>
                        Recuerda siempre hacer los ejercicios sin forzar y aumentar gradualmente.
                    </p>
                    <p className="font-semibold text-white mt-4">
                        ¡Amor, fuerza y felicidad para todos!
                    </p>
                </div>

                <button
                    onClick={onConfirm}
                    className={`w-full font-bold py-3 rounded-xl transition duration-200 ${isLight
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-[#84cc16] hover:bg-[#65a30d] text-slate-900'
                        }`}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default SafetyModal;
