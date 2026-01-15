import React, { useState, useEffect } from 'react';
import mindService from '../../services/mindService';

/**
 * MindSettingsModal - Configuration modal for Trataka sessions
 */
const MindSettingsModal = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState({
        default_focus_object: 'candle',
        default_duration_sec: 300,
        bg_sounds: true,
        transition_sounds: true,
        micro_shift: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load config on mount
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            mindService.getConfig()
                .then(data => {
                    setConfig(prev => ({ ...prev, ...data }));
                })
                .catch(err => console.error('Error loading mind config:', err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await mindService.saveConfig(config);
            onClose();
        } catch (err) {
            console.error('Error saving mind config:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const focusObjects = [
        { value: 'candle', label: 'Vela', emoji: '🕯️' },
        { value: 'moon', label: 'Luna', emoji: '🌕' },
        { value: 'yantra', label: 'Yantra', emoji: '✡️' },
        { value: 'dot', label: 'Punto', emoji: '⚪' }
    ];

    const durations = [
        { value: 60, label: '1 min' },
        { value: 180, label: '3 min' },
        { value: 300, label: '5 min' },
        { value: 600, label: '10 min' },
        { value: 900, label: '15 min' }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white tracking-wide">Ajustes de Enfoque</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Focus Object Selection */}
                        <div>
                            <label className="text-sm font-medium text-white/70 mb-3 block">Objeto de Enfoque</label>
                            <div className="grid grid-cols-4 gap-2">
                                {focusObjects.map(obj => (
                                    <button
                                        key={obj.value}
                                        onClick={() => setConfig(prev => ({ ...prev, default_focus_object: obj.value }))}
                                        className={`flex flex-col items-center p-3 rounded-xl border transition-all ${config.default_focus_object === obj.value
                                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                            }`}
                                    >
                                        <span className="text-2xl mb-1">{obj.emoji}</span>
                                        <span className="text-[10px] font-medium uppercase tracking-wide">{obj.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration Selection */}
                        <div>
                            <label className="text-sm font-medium text-white/70 mb-3 block">Duración Predeterminada</label>
                            <div className="flex gap-2 flex-wrap">
                                {durations.map(dur => (
                                    <button
                                        key={dur.value}
                                        onClick={() => setConfig(prev => ({ ...prev, default_duration_sec: dur.value }))}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${config.default_duration_sec === dur.value
                                                ? 'bg-amber-500 text-slate-900'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                            }`}
                                    >
                                        {dur.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Audio Toggles */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white/70 block">Sonidos</label>

                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <span className="text-sm text-white/80">Sonido de fondo</span>
                                <button
                                    onClick={() => setConfig(prev => ({ ...prev, bg_sounds: !prev.bg_sounds }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${config.bg_sounds ? 'bg-amber-500' : 'bg-white/20'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${config.bg_sounds ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <span className="text-sm text-white/80">Sonidos de transición</span>
                                <button
                                    onClick={() => setConfig(prev => ({ ...prev, transition_sounds: !prev.transition_sounds }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${config.transition_sounds ? 'bg-amber-500' : 'bg-white/20'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${config.transition_sounds ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <span className="text-sm text-white/80">Protección de pantalla</span>
                                <button
                                    onClick={() => setConfig(prev => ({ ...prev, micro_shift: !prev.micro_shift }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${config.micro_shift ? 'bg-amber-500' : 'bg-white/20'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${config.micro_shift ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-3 bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Ajustes'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MindSettingsModal;
