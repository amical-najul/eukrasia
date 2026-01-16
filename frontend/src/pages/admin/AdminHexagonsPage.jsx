import { useState, useEffect } from 'react';
import api from '../../services/api';
import AlertModal from '../../components/AlertModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminHexagonsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('breathing');
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [config, setConfig] = useState({
        breathing: {
            rounds: 3,
            breaths_per_round: 30,
            speed: 'standard',
            speed_durations: { slow: 10000, standard: 8000, fast: 4000 },
            bg_music: true,
            phase_music: true,
            retention_music: true,
            voice_guide: true,
            breathing_guide: true,
            retention_guide: true,
            ping_gong: true,
            breath_sounds: true,
            inhale_prompt: true,
            exhale_prompt: true,
            sound_urls: {},
            sound_metadata: {},
            volumes: {
                bg_music: 0.5,
                phase_music: 0.8,
                retention_music: 0.8,
                voice_guide: 1.0,
                breathing_guide: 1.0,
                retention_guide: 1.0,
                ping_gong: 0.8,
                breathing_sound_slow: 0.8,
                breathing_sound_standard: 0.8,
                breathing_sound_fast: 0.8,
                inhale_prompt: 0.8,
                exhale_prompt: 0.8
            }
        }
    });

    // Speed constants for animation (using config durations)
    // Speed constants for animation (using config durations)
    const getDuration = () => {
        const d = (config.breathing.speed_durations && config.breathing.speed_durations[config.breathing.speed]);
        if (!d) return 8000;
        if (typeof d === 'number') return d;
        // Check if values are seconds (<100) or MS
        const i = d.inhale < 100 ? d.inhale * 1000 : d.inhale;
        const e = d.exhale < 100 ? d.exhale * 1000 : d.exhale;
        const h = (d.hold || 0) < 100 ? (d.hold || 0) * 1000 : (d.hold || 0);
        return (i + e + h);
    };
    const currentDuration = getDuration();

    // Duration Configuration Visibility and Locking
    const [isDurationExpanded, setIsDurationExpanded] = useState(false);
    const [isDurationLocked, setIsDurationLocked] = useState(true);

    // Logic for Rhythm Preview Text
    const [previewText, setPreviewText] = useState('INHALA');

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, soundKey: null });

    useEffect(() => {
        const duration = getDuration();
        const toggleInterval = duration / 2;

        setPreviewText('INHALA'); // Reset on config change

        const interval = setInterval(() => {
            setPreviewText(prev => prev === 'INHALA' ? 'EXHALA' : 'INHALA');
        }, toggleInterval);

        return () => clearInterval(interval);
    }, [config.breathing.speed, config.breathing.speed_durations]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await api.get('/settings/hexagons');
                if (data && data.breathing) {
                    setConfig(prev => ({
                        ...prev,
                        breathing: {
                            ...prev.breathing,
                            ...data.breathing,
                            speed_durations: data.breathing.speed_durations || { slow: 10000, standard: 8000, fast: 4000 },
                            sound_urls: data.breathing.sound_urls || {},
                            sound_metadata: data.breathing.sound_metadata || {},
                            volumes: data.breathing.volumes || prev.breathing.volumes
                        }
                    }));
                }
            } catch (error) {
                console.error("Error fetching hexagon settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Note: We are NO LONGER enforcing synchronized defaults on save if values were customized.
            // We save exactly what is in the config state.

            const configToSave = {
                ...config,
                breathing: {
                    ...config.breathing,
                    // Ensure we save the current state of durations, even if modified manually
                }
            };

            await api.put('/settings/hexagons', configToSave);
            setAlertConfig({
                isOpen: true,
                title: '¡Éxito!',
                message: 'Configuración guardada correctamente',
                type: 'success'
            });

            // Update local state to reflect what was saved
            setConfig(configToSave);
        } catch (error) {
            console.error("Error saving hexagon settings", error);
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'No se pudo guardar la configuración',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const updateBreathing = (key, value) => {
        setConfig(prev => ({
            ...prev,
            breathing: { ...prev.breathing, [key]: value }
        }));
    };

    const updateVolume = (key, value) => {
        setConfig(prev => ({
            ...prev,
            breathing: {
                ...prev.breathing,
                volumes: {
                    ...(prev.breathing.volumes || {}),
                    [key]: parseFloat(value)
                }
            }
        }));
    };

    const updateSpeedGranular = (speedKey, phase, ms) => {
        const val = parseInt(ms) || 0;
        setConfig(prev => {
            let currentSpeedConfig = prev.breathing.speed_durations[speedKey];

            // Normalize current config to object if needed
            if (typeof currentSpeedConfig === 'number') {
                const half = currentSpeedConfig / 2;
                currentSpeedConfig = { inhale: half, hold: 0, exhale: half };
            }
            // Or if undefined fallback
            if (!currentSpeedConfig) currentSpeedConfig = { inhale: 4000, hold: 0, exhale: 4000 };

            // Legacy check: If previous values were in seconds (<100), convert them ALL to MS now to stay consistent
            // Note: We are only updating ONE phase here ('val' is the new MS value). 
            // Better to normalize the whole object to MS if it looks like seconds.
            const normalize = (v) => (v < 100 ? v * 1000 : v);

            const newConfig = {
                inhale: normalize(currentSpeedConfig.inhale),
                exhale: normalize(currentSpeedConfig.exhale),
                hold: normalize(currentSpeedConfig.hold || 0)
            };

            // Apply new value (it is already MS from input)
            newConfig[phase] = val;

            return {
                ...prev,
                breathing: {
                    ...prev.breathing,
                    speed_durations: {
                        ...prev.breathing.speed_durations,
                        [speedKey]: newConfig
                    }
                }
            };
        });
    };

    const handleSoundUpload = async (key, file) => {
        const formData = new FormData();
        formData.append('category', key); // Send the key as the category FIRST
        formData.append('sound', file);

        try {
            const res = await api.post('/settings/hexagons/sound', formData);

            // API wrapper already extracts .data, so access properties directly
            if (res && res.sound_url) {
                setConfig(prev => ({
                    ...prev,
                    breathing: {
                        ...prev.breathing,
                        sound_urls: {
                            ...prev.breathing.sound_urls,
                            [key]: res.sound_url
                        },
                        sound_metadata: {
                            ...prev.breathing.sound_metadata,
                            [key]: {
                                name: res.original_name,
                                url: res.sound_url
                            }
                        }
                    }
                }));

                setAlertConfig({
                    isOpen: true,
                    title: '¡Audio Subido!',
                    message: `Archivo para ${key} subido correctamente`,
                    type: 'success'
                });
            }
        } catch (error) {
            console.error("Error uploading sound", error);
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'No se pudo subir el archivo de audio',
                type: 'error'
            });
        }
    };

    const handleSoundDeleteRequest = (key) => {
        setConfirmModal({ isOpen: true, soundKey: key });
    };

    const confirmSoundDelete = async () => {
        const key = confirmModal.soundKey;
        if (!key) return;

        try {
            await api.delete(`/settings/hexagons/sound/${key}`);

            setConfig(prev => {
                const newUrls = { ...prev.breathing.sound_urls };
                delete newUrls[key];
                const newMetadata = { ...prev.breathing.sound_metadata };
                delete newMetadata[key];

                return {
                    ...prev,
                    breathing: {
                        ...prev.breathing,
                        sound_urls: newUrls,
                        sound_metadata: newMetadata
                    }
                };
            });

            setAlertConfig({
                isOpen: true,
                title: 'Eliminado',
                message: 'Audio eliminado correctamente',
                type: 'success'
            });

        } catch (error) {
            console.error("Error deleting sound", error);
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: 'No se pudo eliminar el archivo',
                type: 'error'
            });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando ajustes...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Ajustes de las Apps</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex flex-col space-y-2">
                    <TabButton active={activeTab === 'breathing'} onClick={() => setActiveTab('breathing')}>Respiración</TabButton>
                    <TabButton inactive>Exposición al Frío</TabButton>
                    <TabButton inactive>Nutrición Balanceada</TabButton>
                    <TabButton inactive>Poder de la Mente</TabButton>
                    <TabButton active={activeTab === 'physical'} onClick={() => setActiveTab('physical')}>Actividad Física</TabButton>
                    <TabButton inactive>Ayuno</TabButton>
                    <TabButton inactive>Sueño Reparador</TabButton>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    {activeTab === 'breathing' && (
                        <div>
                            <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Respiración Guiada - Valores Por Defecto</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Estos valores se aplicarán a los usuarios nuevos o que no hayan personalizado su configuración.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Rounds */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rondas por defecto</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="1" max="10"
                                            value={config.breathing.rounds}
                                            onChange={(e) => updateBreathing('rounds', parseInt(e.target.value))}
                                            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-lime-500"
                                        />
                                        <span className="text-lg font-bold text-gray-900 dark:text-white w-8 text-center">{config.breathing.rounds}</span>
                                    </div>
                                </div>

                                {/* Speed Preview (Dynamic Hexagon) */}
                                <div className="flex flex-col items-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50 mb-6">
                                    <div className="relative w-[140px] h-[140px] flex items-center justify-center">
                                        {/* Glow Effect */}
                                        <div className={`absolute inset-0 rounded-full blur-3xl opacity-30 transition-colors duration-500 ${config.breathing.speed === 'slow' ? 'bg-blue-400' : config.breathing.speed === 'fast' ? 'bg-purple-600' : 'bg-lime-500'}`}></div>

                                        {/* Hexagon Shape */}
                                        <div
                                            className="hexagon-preview w-full h-full flex items-center justify-center shadow-lg transition-transform"
                                            style={{
                                                backgroundColor: config.breathing.speed === 'slow' ? '#60a5fa' : config.breathing.speed === 'fast' ? '#c026d3' : '#84cc16',
                                                animation: `admin-breathing-scale ${currentDuration / 2000}s ease-in-out infinite alternate, admin-breathing-glow ${currentDuration / 2000}s ease-in-out infinite alternate`,
                                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                                            }}
                                        >
                                            <span className="text-white font-bold text-xs tracking-wider transform z-10 animate-fade-in key-{previewText}">
                                                {previewText}
                                            </span>
                                        </div>

                                        {/* Animation Styles */}
                                        <style>{`
                                            @keyframes admin-breathing-scale {
                                                0% { transform: scale(0.85); }
                                                100% { transform: scale(1.15); }
                                            }
                                            @keyframes admin-breathing-glow {
                                                0%, 100% { opacity: 0.2; }
                                                50% { opacity: 0.6; }
                                            }
                                        `}</style>
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-4 uppercase tracking-widest font-bold">Vista previa del ritmo</div>
                                </div>

                                {/* Default Speed Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Velocidad por defecto</label>
                                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                        {['slow', 'standard', 'fast'].map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => updateBreathing('speed', speed)}
                                                className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-colors ${config.breathing.speed === speed
                                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-lime-400 shadow-sm'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                                    }`}
                                            >
                                                {speed === 'slow' ? 'Lento' : speed === 'standard' ? 'Estándar' : 'Rápido'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Speed Durations - Collapsible & Lockable */}
                                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    {/* Header / Toggle */}
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                        onClick={() => setIsDurationExpanded(!isDurationExpanded)}
                                    >
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                            Configuración de Duraciones (milisegundos)
                                        </label>
                                        <div className="flex items-center gap-3">
                                            {/* Lock Button (always visible when expanded, or just in header?) -> Header is better to unlock before expanding? No, unlock is for editing. Let's put lock inside or separate. User asked specifically for "expandir y contraer" and "desactivar candado para hacer ajuste fino". */}
                                            {/* Let's keep the lock button here to allow global unlock */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsDurationLocked(!isDurationLocked);
                                                }}
                                                className={`p-1.5 rounded-lg transition-colors ${isDurationLocked ? 'text-gray-500 hover:text-gray-700 dark:text-gray-400' : 'text-blue-600 bg-blue-50 dark:text-lime-400 dark:bg-gray-600'}`}
                                                title={isDurationLocked ? "Desbloquear edición" : "Bloquear edición"}
                                            >
                                                {isDurationLocked ? (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                                )}
                                            </button>

                                            {/* Chevron */}
                                            <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isDurationExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    {isDurationExpanded && (
                                        <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-down">
                                            {['slow', 'standard', 'fast'].map((speedKey) => {
                                                const speedConfig = config.breathing.speed_durations?.[speedKey] || { inhale: 4000, hold: 0, exhale: 4000 };

                                                // Determine values to display
                                                let currentValues = { ...speedConfig };

                                                // Normalize legacy
                                                if (typeof speedConfig === 'number') currentValues = { inhale: speedConfig / 2, hold: 0, exhale: speedConfig / 2 };
                                                if (currentValues.inhale < 100) currentValues = {
                                                    inhale: currentValues.inhale * 1000,
                                                    exhale: currentValues.exhale * 1000,
                                                    hold: (currentValues.hold || 0) * 1000
                                                };

                                                return (
                                                    <div key={speedKey} className={`space-y-2 p-3 rounded-lg border transition-all ${isDurationLocked ? 'bg-gray-100/50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-600' : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-lime-500/30'}`}>
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-bold text-blue-600 dark:text-lime-400 capitalize">{speedKey === 'slow' ? 'Lento' : speedKey === 'standard' ? 'Estándar' : 'Rápido'}</h4>
                                                            {isDurationLocked && (
                                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-3">
                                                            <div>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <label className="text-xs uppercase text-gray-500 font-semibold">Inhala</label>
                                                                    <span className="text-[10px] text-gray-400">ms</span>
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    step="100"
                                                                    value={currentValues.inhale}
                                                                    onChange={(e) => !isDurationLocked && updateSpeedGranular(speedKey, 'inhale', e.target.value)}
                                                                    disabled={isDurationLocked}
                                                                    className={`w-full px-3 py-2 text-base border-2 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors text-right font-mono font-medium
                                                                        ${isDurationLocked
                                                                            ? 'bg-transparent text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                                                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                                                                        }`}
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <label className="text-xs uppercase text-gray-500 font-semibold">Exhala</label>
                                                                    <span className="text-[10px] text-gray-400">ms</span>
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    step="100"
                                                                    value={currentValues.exhale}
                                                                    onChange={(e) => !isDurationLocked && updateSpeedGranular(speedKey, 'exhale', e.target.value)}
                                                                    disabled={isDurationLocked}
                                                                    className={`w-full px-3 py-2 text-base border-2 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors text-right font-mono font-medium
                                                                        ${isDurationLocked
                                                                            ? 'bg-transparent text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                                                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                                                                        }`}
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <label className="text-xs uppercase text-gray-500 font-semibold">Pausa</label>
                                                                    <span className="text-[10px] text-gray-400">ms</span>
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    step="100"
                                                                    value={currentValues.hold || 0}
                                                                    onChange={(e) => !isDurationLocked && updateSpeedGranular(speedKey, 'hold', e.target.value)}
                                                                    disabled={isDurationLocked}
                                                                    className={`w-full px-3 py-2 text-base border-2 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors text-right font-mono font-medium
                                                                        ${isDurationLocked
                                                                            ? 'bg-transparent text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                                                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                                                                        }`}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Breaths */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Respiraciones por ronda</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="5" max="60" step="5"
                                            value={config.breathing.breaths_per_round}
                                            onChange={(e) => updateBreathing('breaths_per_round', parseInt(e.target.value))}
                                            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-lime-500"
                                        />
                                        <span className="text-lg font-bold text-gray-900 dark:text-white w-8 text-center">{config.breathing.breaths_per_round}</span>
                                    </div>
                                </div>

                                {/* Toggles Grid with Uploads */}
                                <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <SoundConfigRow label="Música de fondo" configKey="bg_music" checked={config.breathing.bg_music} onChange={() => updateBreathing('bg_music', !config.breathing.bg_music)} onUpload={handleSoundUpload} onDelete={handleSoundDeleteRequest} soundUrl={config.breathing.sound_urls?.bg_music} metadata={config.breathing.sound_metadata?.bg_music} volume={config.breathing.volumes?.bg_music} onVolumeChange={(val) => updateVolume('bg_music', val)} />
                                    <SoundConfigRow label="Música fase respiración" configKey="phase_music" checked={config.breathing.phase_music} onChange={() => updateBreathing('phase_music', !config.breathing.phase_music)} onUpload={handleSoundUpload} onDelete={handleSoundDeleteRequest} soundUrl={config.breathing.sound_urls?.phase_music} metadata={config.breathing.sound_metadata?.phase_music} volume={config.breathing.volumes?.phase_music} onVolumeChange={(val) => updateVolume('phase_music', val)} />
                                    <SoundConfigRow label="Música fase retención" configKey="retention_music" checked={config.breathing.retention_music} onChange={() => updateBreathing('retention_music', !config.breathing.retention_music)} onUpload={handleSoundUpload} onDelete={handleSoundDeleteRequest} soundUrl={config.breathing.sound_urls?.retention_music} metadata={config.breathing.sound_metadata?.retention_music} volume={config.breathing.volumes?.retention_music} onVolumeChange={(val) => updateVolume('retention_music', val)} />
                                    <SoundConfigRow label="Guía de voz" configKey="voice_guide" checked={config.breathing.voice_guide} onChange={() => updateBreathing('voice_guide', !config.breathing.voice_guide)} onUpload={handleSoundUpload} onDelete={handleSoundDeleteRequest} soundUrl={config.breathing.sound_urls?.voice_guide} metadata={config.breathing.sound_metadata?.voice_guide} volume={config.breathing.volumes?.voice_guide} onVolumeChange={(val) => updateVolume('voice_guide', val)} />
                                    <SoundConfigRow label="Guía fase respiración" configKey="breathing_guide" checked={config.breathing.breathing_guide} onChange={() => updateBreathing('breathing_guide', !config.breathing.breathing_guide)} onUpload={handleSoundUpload} onDelete={handleSoundDeleteRequest} soundUrl={config.breathing.sound_urls?.breathing_guide} metadata={config.breathing.sound_metadata?.breathing_guide} volume={config.breathing.volumes?.breathing_guide} onVolumeChange={(val) => updateVolume('breathing_guide', val)} />
                                    <SoundConfigRow label="Guía fase retención" configKey="retention_guide" checked={config.breathing.retention_guide} onChange={() => updateBreathing('retention_guide', !config.breathing.retention_guide)} onUpload={handleSoundUpload} onDelete={handleSoundDeleteRequest} soundUrl={config.breathing.sound_urls?.retention_guide} metadata={config.breathing.sound_metadata?.retention_guide} volume={config.breathing.volumes?.retention_guide} onVolumeChange={(val) => updateVolume('retention_guide', val)} />
                                    <SoundConfigRow label="Ping y Gong" configKey="ping_gong" checked={config.breathing.ping_gong} onChange={() => updateBreathing('ping_gong', !config.breathing.ping_gong)} onUpload={handleSoundUpload} onDelete={handleSoundDeleteRequest} soundUrl={config.breathing.sound_urls?.ping_gong} metadata={config.breathing.sound_metadata?.ping_gong} volume={config.breathing.volumes?.ping_gong} onVolumeChange={(val) => updateVolume('ping_gong', val)} />
                                    <SoundConfigRow label="Una Inhalación" configKey="inhale_prompt" checked={config.breathing.inhale_prompt} onChange={() => updateBreathing('inhale_prompt', !config.breathing.inhale_prompt)} onUpload={handleSoundUpload} onDelete={handleSoundDeleteRequest} soundUrl={config.breathing.sound_urls?.inhale_prompt} metadata={config.breathing.sound_metadata?.inhale_prompt} volume={config.breathing.volumes?.inhale_prompt} onVolumeChange={(val) => updateVolume('inhale_prompt', val)} />
                                    <SoundConfigRow label="Una Exhalación" configKey="exhale_prompt" checked={config.breathing.exhale_prompt} onChange={() => updateBreathing('exhale_prompt', !config.breathing.exhale_prompt)} onUpload={handleSoundUpload} onDelete={handleSoundDeleteRequest} soundUrl={config.breathing.sound_urls?.exhale_prompt} metadata={config.breathing.sound_metadata?.exhale_prompt} volume={config.breathing.volumes?.exhale_prompt} onVolumeChange={(val) => updateVolume('exhale_prompt', val)} />

                                    {/* Sonidos de Respiración - Expanded Section */}
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sonidos de respiración</span>
                                            <button
                                                onClick={() => updateBreathing('breath_sounds', !config.breathing.breath_sounds)}
                                                className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${config.breathing.breath_sounds ? 'bg-blue-600 dark:bg-lime-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${config.breathing.breath_sounds ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>

                                        {config.breathing.breath_sounds && (
                                            <div className="space-y-2 mt-2 pl-2 border-l-2 border-gray-200 dark:border-gray-600 ml-1">
                                                {['slow', 'standard', 'fast'].map(speed => {
                                                    const key = `breathing_sound_${speed}`;
                                                    const url = config.breathing.sound_urls?.[key];
                                                    const metadata = config.breathing.sound_metadata?.[key];
                                                    const fileName = metadata?.name || (url ? 'Archivo activo' : null);
                                                    const label = speed === 'slow' ? 'Lento' : speed === 'standard' ? 'Estándar' : 'Rápido';

                                                    return (
                                                        <div key={speed} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
                                                            <div className="flex flex-col flex-1 mr-2">
                                                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Sonido {label}</span>
                                                                {fileName ? (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-sm font-medium text-blue-500 truncate" title={fileName}>
                                                                            {fileName}
                                                                        </div>
                                                                        {url && (
                                                                            <audio controls className="h-8 w-48 max-w-full">
                                                                                <source src={url} type="audio/mpeg" />
                                                                                Your browser does not support the audio element.
                                                                            </audio>
                                                                        )}
                                                                        <div className="mt-2">
                                                                            <VolumeSlider
                                                                                label="Volumen"
                                                                                value={config.breathing.volumes?.[key] ?? 0.8}
                                                                                onChange={(val) => updateVolume(key, val)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-gray-400 italic">Sin audio cargado</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {fileName && (
                                                                    <button
                                                                        onClick={() => handleSoundDeleteRequest(key)}
                                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Eliminar sonido"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                                <label className="cursor-pointer p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-300 group shadow-sm flex items-center justify-center" title={`Subir audio para ${label}`}>
                                                                    <input
                                                                        type="file"
                                                                        accept="audio/*"
                                                                        className="hidden"
                                                                        onChange={(e) => e.target.files[0] && handleSoundUpload(key, e.target.files[0])}
                                                                    />
                                                                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                    </svg>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'physical' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Seguimiento de Actividad Física</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                                El módulo de seguimiento corporal (Peso y Medidas) está <span className="text-green-600 font-bold">ACTIVO</span>.
                                <br />
                                <br />
                                Actualmente no existen configuraciones globales para esta sección, ya que los datos son privados y específicos para cada usuario.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-lime-500 dark:hover:bg-lime-600 text-white dark:text-gray-900 font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmSoundDelete}
                title="Eliminar Audio"
                message="¿Estás seguro de que deseas eliminar este audio? Esta acción no se puede deshacer y borrará el archivo permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div >
    );
};

const SoundConfigRow = ({ label, configKey, checked, onChange, onUpload, onDelete, soundUrl, metadata, volume, onVolumeChange }) => {
    const fileName = metadata?.name;

    let statusText;
    let statusClass = "text-gray-400 italic text-sm";

    if (!checked) {
        statusText = "Desactivado";
    } else if (fileName) {
        statusText = null; // We render the specialized filename block
    } else if (soundUrl) {
        statusText = "Archivo legado activo";
        statusClass = "text-blue-500 text-sm";
    } else {
        statusText = "Audio predeterminado";
        statusClass = "text-blue-500/70 text-sm";
    }

    return (
        <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors gap-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col max-w-[65%]">
                    <span className="text-base font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                    {fileName ? (
                        <div className="mt-2 flex flex-col gap-2">
                            <div className="text-sm font-medium text-blue-500 truncate" title={fileName}>
                                {fileName}
                            </div>
                            {soundUrl && (
                                <audio controls className="h-8 w-48 max-w-full rounded-md bg-gray-100 dark:bg-gray-800">
                                    <source src={soundUrl} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                        </div>
                    ) : (
                        <span className={`mt-1 ${statusClass}`}>{statusText}</span>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* Delete Button */}
                    {checked && fileName && (
                        <button
                            onClick={() => onDelete(configKey)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            title="Eliminar audio personalizado"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}

                    {/* Upload Button */}
                    <label className="cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-400" title={`Subir ${label}`}>
                        <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => e.target.files[0] && onUpload(configKey, e.target.files[0])}
                        />
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </label>

                    {/* Toggle */}
                    <button
                        onClick={onChange}
                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-blue-600 dark:bg-lime-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {/* Volume Control */}
            {checked && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <VolumeSlider
                        label="Intensidad de volumen"
                        value={volume ?? 0.8}
                        onChange={onVolumeChange}
                    />
                </div>
            )}
        </div>
    );
};

const VolumeSlider = ({ label, value, onChange }) => {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-lime-400">{Math.round(value * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-lime-500"
                />
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                </svg>
            </div>
        </div>
    );
};

const TabButton = ({ children, active, onClick, inactive }) => {
    if (inactive) {
        return (
            <button disabled className="text-left px-4 py-3 rounded-lg font-medium bg-gray-100 dark:bg-gray-800/50 text-gray-400 cursor-not-allowed">
                {children} (Próximamente)
            </button>
        );
    }
    return (
        <button
            onClick={onClick}
            className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${active
                ? 'bg-blue-600/10 text-blue-600 dark:bg-lime-500/10 dark:text-lime-400 border-l-4 border-blue-600 dark:border-lime-500'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
        >
            {children}
        </button>
    );
};

export default AdminHexagonsPage;
