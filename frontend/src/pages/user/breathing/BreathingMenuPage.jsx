import React, { useState } from 'react';
import Hexagon from '../../../components/Hexagon';
import { useNavigate } from 'react-router-dom';

import AlertModal from '../../../components/AlertModal';

const BreathingMenuPage = () => {
    const navigate = useNavigate();
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '' });

    const handleRetentionClick = () => {
        navigate('/dashboard/breathing/retention');
    };

    const showInfo = (title, message) => {
        setAlertConfig({ isOpen: true, title, message });
    };

    return (
        <div className="w-full flex flex-col items-center min-h-screen text-white p-6 overflow-hidden">
            <header className="w-full max-w-lg mb-12 flex items-center relative">
                <button onClick={() => navigate('/dashboard')} className="absolute left-0 text-2xl p-2 hover:bg-white/10 rounded-full transition">
                    &lt;
                </button>
                <h1 className="w-full text-center text-xl font-bold font-['Outfit']">Ejercicios de respiración</h1>
            </header>

            <div className="w-full max-w-lg mb-16 text-center text-sm px-6 text-gray-400 leading-relaxed font-light">
                <p>No hay acción humana más fundamental que respirar. ¡Estos ejercicios ayudan a desarrollar y controlar tu ritmo respiratorio, mientras te conectas y moldeas con tu cuerpo al mismo tiempo!</p>
            </div>

            <div className="w-full max-w-lg text-left mb-8 px-4">
                <h3 className="font-bold text-lg text-white flex items-center gap-3">
                    <span className="text-cyan-500">⚙️</span> Herramientas
                </h3>
            </div>

            <div className="flex gap-10 justify-center w-full max-w-lg py-4">
                {/* Guided Breathing Hexagon Link */}
                <div className="flex flex-col items-center gap-4">
                    <Hexagon
                        color="#26a69a" // Vivid Teal/Aqua
                        size={155}
                        innerStyle={{ color: '#ffffff' }}
                        icon={
                            <img src="/icons/breathing_guided_custom.png" alt="Guided" className="w-14 h-14 object-contain filter drop-shadow-lg" />
                        }
                        onClick={() => navigate('/dashboard/breathing/guided')}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Respiración Guiada</span>
                </div>

                {/* Retention Timer Hexagon Link */}
                <div className="flex flex-col items-center gap-4">
                    <Hexagon
                        color="#1e88e5" // Vivid Blue
                        size={155}
                        innerStyle={{ color: '#ffffff' }}
                        icon={
                            <img src="/icons/breathing_retention_custom.png" alt="Retention" className="w-14 h-14 object-contain filter drop-shadow-lg" />
                        }
                        onClick={handleRetentionClick}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 text-center">Temporizador de<br />Retención</span>
                </div>
            </div>

            {/* Safety Reminder Section */}
            <div className="w-full max-w-lg mt-14 bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <p className="text-cyan-500 font-black mb-4 uppercase tracking-[0.3em] text-[10px] opacity-70">Recordatorio de seguridad</p>
                <div className="text-gray-400 text-[11px] leading-relaxed font-light italic px-4 space-y-2.5 opacity-80">
                    <p>Por favor, realiza estos ejercicios sentado en un entorno seguro.</p>
                    <p>No practicar en agua, conduciendo o sin la debida supervisión.</p>
                    <p>Aumenta la intensidad gradualmente y escucha a tu cuerpo.</p>
                </div>
                <p className="text-white/90 font-bold mt-6 text-[10px] tracking-widest uppercase opacity-90">¡Amor, fuerza y felicidad para todos!</p>
            </div>

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type="info"
            />
        </div>
    );
};

export default BreathingMenuPage;
