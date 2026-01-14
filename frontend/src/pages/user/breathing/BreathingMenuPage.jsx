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

    // View Mode State (Persisted)
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('breathing_menu_view_mode') || 'hexagon';
    });

    const toggleViewMode = () => {
        const newMode = viewMode === 'hexagon' ? 'list' : 'hexagon';
        setViewMode(newMode);
        localStorage.setItem('breathing_menu_view_mode', newMode);
    };

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

                {/* View Toggle Switch */}
                <button
                    onClick={toggleViewMode}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors border border-white/10"
                    title={viewMode === 'hexagon' ? "Cambiar a Lista" : "Cambiar a Hexágonos"}
                >
                    {viewMode === 'hexagon' ? (
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    )}
                </button>
            </header>

            {/* --- CONTENIDO PRINCIPAL (Flex Grow) --- */}
            <div className={`flex-1 w-full flex flex-col items-center ${viewMode === 'list' ? 'justify-start pt-4' : 'justify-center -mt-8'}`}>

                {/* Títulos Simplificados */}
                <div className="text-center space-y-2 mb-6 animate-fade-in-down">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                        Ejercicios de<br />Respiración
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-light tracking-wide">
                        Conecta con tu ritmo y moldea tu mente.
                    </p>
                </div>

                {viewMode === 'hexagon' ? (
                    /* --- VISTA HEXÁGONOS (Original) --- */
                    <div className="w-full max-w-md mt-6 animate-in zoom-in-95 duration-300">
                        <div className="bg-white dark:bg-[#1e293b]/50 border-2 border-gray-200 dark:border-white/5 shadow-sm shadow-gray-200/50 dark:shadow-black/20 rounded-3xl p-6 relative flex flex-col items-center gap-2">

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
                            <div className="flex justify-center z-0 -mt-10">
                                <div className="flex flex-col items-center gap-3 transition transform hover:scale-105 duration-300 group cursor-pointer"
                                    onClick={() => setShowSettings(true)}>
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-violet-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />
                                        <Hexagon
                                            color="#5b21b6"
                                            size={145}
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
                ) : (
                    /* --- VISTA LISTA (Nueva) --- */
                    <div className="w-full max-w-sm space-y-4 mt-2 px-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Card 1: Guided Breathing */}
                        <div
                            onClick={() => navigate('/dashboard/breathing/guided')}
                            className="relative overflow-hidden rounded-3xl h-28 cursor-pointer shadow-lg transform transition hover:scale-[1.02] active:scale-95 group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-600" />
                            <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
                                <div>
                                    <h3 className="text-white font-bold text-xl uppercase tracking-tight">Respiración<br />Guiada</h3>
                                    <p className="text-teal-100 text-xs mt-1 font-light">Respiración guiada</p>
                                </div>
                                <div className="w-20 h-20 opacity-90 group-hover:scale-110 transition-transform duration-500">
                                    <img src="/icons/breathing_guided_custom.png" alt="Meditating" className="w-full h-full object-contain drop-shadow-lg"
                                        onError={(e) => { e.target.onerror = null; e.target.parentElement.innerHTML = '<span class="text-4xl">🧘</span>'; }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Retention Timer */}
                        <div
                            onClick={handleRetentionClick}
                            className="relative overflow-hidden rounded-3xl h-28 cursor-pointer shadow-lg transform transition hover:scale-[1.02] active:scale-95 group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600" />
                            <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
                                <div>
                                    <h3 className="text-white font-bold text-xl uppercase tracking-tight">Temporizador<br />Retención</h3>
                                    <p className="text-blue-100 text-xs mt-1 font-light">Reces sanador y temporizador</p>
                                </div>
                                <div className="w-16 h-16 opacity-90 group-hover:rotate-12 transition-transform duration-500 flex items-center justify-center bg-white/10 rounded-full">
                                    <img src="/icons/breathing_retention_custom.png" alt="Timer" className="w-10 h-10 object-contain drop-shadow-md"
                                        onError={(e) => { e.target.onerror = null; e.target.parentElement.innerHTML = '<span class="text-4xl">⏱️</span>'; }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Settings */}
                        <div
                            onClick={() => setShowSettings(true)}
                            className="relative overflow-hidden rounded-3xl h-28 cursor-pointer shadow-lg transform transition hover:scale-[1.02] active:scale-95 group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600" />
                            <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
                                <div>
                                    <h3 className="text-white font-bold text-xl uppercase tracking-tight">Ajustes</h3>
                                    <p className="text-violet-100 text-xs mt-1 font-light">Personaliza ritmos y audio</p>
                                </div>
                                <div className="w-16 h-16 opacity-90 group-hover:rotate-90 transition-transform duration-700 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- FOOTER: SEGURIDAD (PILL) --- */}
            <div className={`mt-6 mb-6 w-full max-w-sm ${viewMode === 'list' ? 'bg-[#1e1a24] rounded-full border border-white/5 py-1' : ''}`}>
                <div
                    onClick={() => showInfo(
                        "Precauciones de seguridad para ejercicios de respiración",
                        "Por favor, siéntate en un entorno seguro.\n\nNo hagas ejercicios de respiración en una piscina, bajo el agua, en la ducha, conduciendo un vehículo o sin la supervisión adecuada.\n\nRecuerda siempre hacer los ejercicios sin forzar y aumentar gradualmente.\n\n¡Amor, fuerza y felicidad para todos!",
                        "safety"
                    )}
                    className={`flex items-center justify-center gap-3 cursor-pointer transition-all ${viewMode === 'list'
                        ? 'p-3 bg-blue-900/20 rounded-full border border-blue-500/30' // List Mode: Blue tint
                        : 'bg-blue-100 dark:bg-blue-900/30 border-[3px] border-blue-500/50 dark:border-blue-500/50 hover:bg-blue-200 dark:hover:bg-blue-900/50 active:scale-95 rounded-full py-3 px-6 backdrop-blur-sm shadow-sm'
                        }`}
                >
                    <span className={`${viewMode === 'list' ? 'text-blue-400' : 'text-blue-600 dark:text-blue-400'} text-lg`}>🛡️</span>
                    <span className={`${viewMode === 'list' ? 'text-blue-200' : 'text-blue-800 dark:text-blue-200/90'} text-[11px] font-bold uppercase tracking-wider`}>
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
