import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hexagon from '../Hexagon'; // Corrected path to components/Hexagon
import BackButton from '../common/BackButton';

import { useTheme } from '../../context/ThemeContext';

const BreathingSettingsModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isLight = theme === 'light';

    // ... (rest of state logic)

    // Configuration State
    const [config, setConfig] = useState({
        speed: 'standard', // slow, standard, fast
        rounds: 3,
        breathsPerRound: 30,
        bgMusic: true,
        phaseMusic: true,
        retentionMusic: true,
        voiceGuide: true,
        breathingGuide: true,
        retentionGuide: true,
        pingGong: true,
        breathSounds: true,
    });

    // Speed constants for animation
    const SPEED_DURATIONS = {
        slow: 10000,     // 10s total (inhale 5, exhale 5)
        standard: 8000,  // 8s total (inhale 4, exhale 4)
        fast: 4000,      // 4s total (inhale 2, exhale 2)
    };

    const currentDuration = SPEED_DURATIONS[config.speed] || 8000;

    // Load config on open
    React.useEffect(() => {
        if (isOpen) {
            import('../../services/api').then(module => {
                const api = module.default;
                api.get('/breathing/config')
                    .then(data => {
                        // API returns data directly, not wrapped in res.data
                        if (data) {
                            setConfig({
                                speed: data.speed || 'standard',
                                rounds: data.rounds || 3,
                                breathsPerRound: data.breaths_per_round || 30,
                                bgMusic: data.bg_music ?? true,
                                phaseMusic: data.phase_music ?? true,
                                retentionMusic: data.retention_music ?? true,
                                voiceGuide: data.voice_guide ?? true,
                                breathingGuide: data.breathing_guide ?? true,
                                retentionGuide: data.retention_guide ?? true,
                                pingGong: data.ping_gong ?? true,
                                breathSounds: data.breath_sounds ?? true,
                            });
                        }
                    })
                    .catch(err => console.error('Error loading config:', err));
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        try {
            const api = (await import('../../services/api')).default;
            await api.post('/breathing/config', {
                rounds: config.rounds,
                breaths_per_round: config.breathsPerRound,
                speed: config.speed,
                bg_music: config.bgMusic,
                phase_music: config.phaseMusic,
                retention_music: config.retentionMusic,
                voice_guide: config.voiceGuide,
                breathing_guide: config.breathingGuide,
                retention_guide: config.retentionGuide,
                ping_gong: config.pingGong,
                breath_sounds: config.breathSounds,
            });
            onClose(); // Just close after saving
        } catch (err) {
            console.error('Error saving config:', err);
        }
    };

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#1a202c] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header with Back Arrow */}
                <div className="flex items-center w-full mb-8 shrink-0">
                    <BackButton onClick={onClose} />
                    <h2 className="text-white font-bold text-lg mx-auto">Respiración Guiada</h2>
                    <div className="w-8"></div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6">



                    {/* Speed Indicator (Dynamic Hexagon) */}
                    <div className="flex flex-col items-center py-4">
                        <div className="relative w-[140px] h-[140px] flex items-center justify-center">
                            {/* Inhale/Exhale Animation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                    className="bg-amber-500/10 rounded-full blur-3xl transition-all duration-300 pointer-events-none"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        animation: `breathing-glow ${currentDuration}ms ease-in-out infinite`
                                    }}
                                />
                            </div>

                            <div
                                className="relative z-10 transform-gpu transition-transform"
                                style={{
                                    animation: `breathing-scale ${currentDuration}ms ease-in-out infinite`
                                }}
                            >
                                <Hexagon
                                    size={120}
                                    color="#d97706"
                                    innerStyle={{ color: '#fff' }}
                                    icon={
                                        <div className="text-xs uppercase font-black tracking-tighter opacity-40">
                                            Preview
                                        </div>
                                    }
                                />
                            </div>

                            {/* Animation Styles */}
                            <style>{`
                                @keyframes breathing-scale {
                                    0%, 100% { transform: scale(0.85); }
                                    50% { transform: scale(1.15); }
                                }
                                @keyframes breathing-glow {
                                    0%, 100% { opacity: 0.1; }
                                    50% { opacity: 0.8; }
                                }
                            `}</style>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">Ritmo sugerido</div>
                    </div>

                    {/* Speed Control */}
                    <div className="bg-white/5 p-1 rounded-xl flex">
                        {[{ id: 'slow', label: 'Lento' }, { id: 'standard', label: 'Estándar' }, { id: 'fast', label: 'Rápido' }].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => updateConfig('speed', item.id)}
                                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${config.speed === item.id
                                    ? (isLight ? 'bg-blue-600 text-white shadow-md' : 'bg-[#84cc16] text-black shadow-md')
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Rounds Selector (Slider) */}
                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-gray-300 font-medium text-sm italic opacity-80 uppercase tracking-widest text-[10px]">Rondas</span>
                            <span className="text-white font-bold font-mono text-xl">{config.rounds}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={config.rounds}
                            onChange={(e) => updateConfig('rounds', parseInt(e.target.value))}
                            className={`w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer ${isLight ? 'accent-blue-500' : 'accent-[#84cc16]'}`}
                        />
                    </div>

                    {/* Breaths Slider (5-60) */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-gray-300 font-medium text-sm">Respiraciones por ronda</span>
                            <span className="text-white font-bold font-mono text-xl">{config.breathsPerRound}</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="60"
                            step="5"
                            value={config.breathsPerRound}
                            onChange={(e) => updateConfig('breathsPerRound', parseInt(e.target.value))}
                            className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${isLight ? 'accent-blue-500' : 'accent-[#84cc16]'}`}
                        />
                        <div className="flex justify-between text-xs text-gray-500 px-1">
                            <span>5</span>
                            <span>30</span>
                            <span>60</span>
                        </div>
                    </div>

                    {/* Extended Toggles Options */}
                    <div className="space-y-4 pt-2 pb-4">
                        <div className={`text-xs font-bold tracking-wider uppercase mb-2 ${isLight ? 'text-blue-500' : 'text-[#84cc16]'}`}>Audio y Guía</div>

                        {/* Background Music */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Música de fondo</span>
                            <Toggle checked={config.bgMusic} onChange={() => updateConfig('bgMusic', !config.bgMusic)} isLight={isLight} />
                        </div>

                        {/* Breathing Phase Music */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Música fase respiración</span>
                            <Toggle checked={config.phaseMusic} onChange={() => updateConfig('phaseMusic', !config.phaseMusic)} isLight={isLight} />
                        </div>

                        {/* Retention Phase Music (New) */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Música fase retención</span>
                            <Toggle checked={config.retentionMusic} onChange={() => updateConfig('retentionMusic', !config.retentionMusic)} isLight={isLight} />
                        </div>

                        {/* Guidance Toggles (Visual only for now as requested by UI task) */}
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-gray-300 text-sm">Guía de voz</span>
                            <Toggle checked={config.voiceGuide} onChange={() => updateConfig('voiceGuide', !config.voiceGuide)} isLight={isLight} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Guía fase respiración</span>
                            <Toggle checked={config.breathingGuide} onChange={() => updateConfig('breathingGuide', !config.breathingGuide)} isLight={isLight} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Guía fase retención</span>
                            <Toggle checked={config.retentionGuide} onChange={() => updateConfig('retentionGuide', !config.retentionGuide)} isLight={isLight} />
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <span className="text-gray-300 text-sm">Ping y Gong</span>
                            <Toggle checked={config.pingGong} onChange={() => updateConfig('pingGong', !config.pingGong)} isLight={isLight} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Sonidos de respiración</span>
                            <Toggle checked={config.breathSounds} onChange={() => updateConfig('breathSounds', !config.breathSounds)} isLight={isLight} />
                        </div>

                    </div>
                </div>

                {/* Start Button Fixed at Bottom */}
                <div className="pt-4 shrink-0">
                    <button
                        onClick={handleSave}
                        className={`w-full font-bold py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all text-lg tracking-wide ${isLight
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-[#84cc16] hover:bg-[#65a30d] text-slate-900'
                            }`}
                    >
                        Guardar Configuración
                    </button>
                </div>

            </div>
        </div>
    );
};

// Simple reusable Toggle component for cleaner code
const Toggle = ({ checked, onChange, isLight }) => (
    <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${checked
            ? (isLight ? 'bg-blue-600' : 'bg-[#84cc16]')
            : 'bg-gray-700'
            }`}
    >
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

export default BreathingSettingsModal;
