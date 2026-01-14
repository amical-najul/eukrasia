import React, { useState } from 'react';
import Hexagon from '../../../components/Hexagon';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../../../components/AlertModal';
import BreathingSettingsModal from '../../../components/breathing/BreathingSettingsModal';

import BackButton from '../../../components/common/BackButton';

const BreathingMenuPage = () => {
    const navigate = useNavigate();
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [showSettings, setShowSettings] = useState(false);

    const handleRetentionClick = () => {
        navigate('/dashboard/breathing/retention');
    };

    const showInfo = (title, message, type = 'info') => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    return (
        <div className="w-full h-full flex flex-col items-center p-2 overflow-hidden transition-colors duration-300">
            {/* --- HEADER COMPACTO --- */}
            <header className="w-full flex items-center justify-between pt-2 pb-4 px-2">
                <BackButton onClick={() => navigate('/dashboard')} />
            </header>

            {/* --- CONTENIDO PRINCIPAL (Flex Grow) --- */}
            <div className="flex-1 w-full flex flex-col items-center justify-center -mt-8"> {/* Negative margin to center vertically better */}

                {/* Títulos Simplificados */}
                <div className="text-center space-y-2 mb-8 animate-fade-in-down">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                        Ejercicios de<br />Respiración
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-light tracking-wide">
                        Conecta con tu ritmo y moldea tu mente.
                    </p>
                </div>

                {/* --- SECCIÓN HEXÁGONOS (LAYOUT TRIANGULAR / PANAL) --- */}
                {/* --- SECCIÓN HEXÁGONOS (LAYOUT TRIANGULAR / PANAL) --- */}
                <div className="flex flex-col items-center gap-2 relative w-full max-w-md mt-6">

                    {/* FILA SUPERIOR: Guiada + Retención */}
                    <div className="flex justify-center gap-8 md:gap-12 w-full z-10">
                        {/* Guided Breathing */}
                        <div className="flex flex-col items-center gap-3 transition transform hover:scale-105 duration-300 group cursor-pointer"
                            onClick={() => navigate('/dashboard/breathing/guided')}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />
                                <Hexagon
                                    color="#26a69a"
                                    size={145}
                                    innerStyle={{ color: '#ffffff' }}
                                    icon={
                                        <img src="/icons/breathing_guided_custom.png" alt="Guided" className="w-16 h-16 object-contain filter drop-shadow-md" />
                                    }
                                    onClick={() => navigate('/dashboard/breathing/guided')}
                                />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#26a69a] dark:text-teal-100/80 group-hover:text-[#26a69a] dark:group-hover:text-white transition text-center">Respiración<br />Guiada</span>
                        </div>

                        {/* Retention Timer */}
                        <div className="flex flex-col items-center gap-3 transition transform hover:scale-105 duration-300 group cursor-pointer"
                            onClick={handleRetentionClick}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />
                                <Hexagon
                                    color="#1e88e5"
                                    size={145}
                                    innerStyle={{ color: '#ffffff' }}
                                    icon={
                                        <img src="/icons/breathing_retention_custom.png" alt="Retention" className="w-16 h-16 object-contain filter drop-shadow-md" />
                                    }
                                    onClick={handleRetentionClick}
                                />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1e88e5] dark:text-blue-100/80 group-hover:text-[#1e88e5] dark:group-hover:text-white transition text-center">Temporizador<br />Retención</span>
                        </div>
                    </div>

                    {/* FILA INFERIOR (CENTRADA): Ajustes */}
                    <div className="flex justify-center z-0 -mt-10"> {/* Negative margin to tuck into the gap */}
                        <div className="flex flex-col items-center gap-3 transition transform hover:scale-105 duration-300 group cursor-pointer"
                            onClick={() => setShowSettings(true)}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-violet-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />
                                <Hexagon
                                    color="#5b21b6" // Deep Violet
                                    size={145} // Consistent Size
                                    innerStyle={{ color: '#ffffff' }}
                                    icon={
                                        <svg className="w-16 h-16 text-violet-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    }
                                    onClick={() => setShowSettings(true)}
                                />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#5b21b6] dark:text-violet-300/80 group-hover:text-[#5b21b6] dark:group-hover:text-white transition text-center">Ajustes</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- FOOTER: SEGURIDAD (PILL) --- */}
            <div className="mt-12 mb-6 w-full max-w-sm">
                <div
                    onClick={() => showInfo(
                        "Precauciones de seguridad para ejercicios de respiración",
                        "Por favor, siéntate en un entorno seguro.\n\nNo hagas ejercicios de respiración en una piscina, bajo el agua, en la ducha, conduciendo un vehículo o sin la supervisión adecuada.\n\nRecuerda siempre hacer los ejercicios sin forzar y aumentar gradualmente.\n\n¡Amor, fuerza y felicidad para todos!",
                        "safety"
                    )}
                    className="flex items-center justify-center gap-3 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/10 hover:bg-orange-200 dark:hover:bg-orange-900/30 active:scale-95 transition-all rounded-full py-3 px-6 cursor-pointer backdrop-blur-sm shadow-sm"
                >
                    <span className="text-orange-600 dark:text-orange-400 text-lg">🛡️</span>
                    <span className="text-orange-800 dark:text-orange-200/90 text-[11px] font-bold uppercase tracking-wider">
                        Recordatorio: Practica en entorno seguro.
                    </span>
                </div>
            </div>

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />

            {/* Ajustes Modal */}
            <BreathingSettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </div>
    );
};

export default BreathingMenuPage;
