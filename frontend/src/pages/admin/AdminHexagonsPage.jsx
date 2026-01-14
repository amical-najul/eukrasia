import { useState, useEffect } from 'react';
import api from '../../services/api';
import AlertModal from '../../components/AlertModal';

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
            sound_urls: {}
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
                            sound_urls: data.breathing.sound_urls || {}
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
            await api.put('/settings/hexagons', config);
            setAlertConfig({
                isOpen: true,
                title: '¡Éxito!',
                message: 'Configuración guardada correctamente',
                type: 'success'
            });
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
        formData.append('sound', file);

        try {
            const res = await api.post('/settings/hexagons/sound', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data && res.data.sound_url) {
                setConfig(prev => ({
                    ...prev,
                    breathing: {
                        ...prev.breathing,
                        sound_urls: {
                            ...prev.breathing.sound_urls,
                            [key]: res.data.sound_url
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
                    <TabButton inactive>Actividad Física</TabButton>
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
                                <div className="flex flex-col items-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                    <div className="relative w-[140px] h-[140px] flex items-center justify-center">
                                        {/* Inhale/Exhale Animation */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div
                                                className="bg-blue-500/10 dark:bg-lime-500/10 rounded-full blur-3xl transition-all duration-300 pointer-events-none"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    animation: `admin-breathing-glow ${currentDuration}ms ease-in-out infinite`
                                                }}
                                            />
                                        </div>

                                        <div
                                            className="relative z-10 transform-gpu transition-transform"
                                            style={{
                                                animation: `admin-breathing-scale ${currentDuration}ms ease-in-out infinite`
                                            }}
                                        >
                                            <div className="w-[100px] h-[100px] bg-blue-600 dark:bg-lime-500 rounded-2xl rotate-45 flex items-center justify-center shadow-lg">
                                                <div className="-rotate-45 text-white dark:text-gray-900 font-bold text-xs uppercase tracking-widest">
                                                    Ronda
                                                </div>
                                            </div>
                                        </div>

                                        {/* Animation Styles */}
                                        <style>{`
                                            @keyframes admin-breathing-scale {
                                                0%, 100% { transform: scale(0.8); }
                                                50% { transform: scale(1.2); }
                                            }
                                            @keyframes admin-breathing-glow {
                                                0%, 100% { opacity: 0.2; }
                                                50% { opacity: 0.6; }
                                            }
                                        `}</style>
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-widest font-bold">Vista previa del ritmo</div>
                                </div>

                                {/* Default Speed Selection */}
                                <div>
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

                                {/* Custom Speed Durations */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Configuración de Duraciones (milisegundos)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {['slow', 'standard', 'fast'].map((speedKey) => {
                                            const speedConfig = config.breathing.speed_durations?.[speedKey] || { inhale: 4000, hold: 0, exhale: 4000 };
                                            // Handle legacy number format if present
                                            let currentValues = typeof speedConfig === 'number'
                                                ? { inhale: speedConfig / 2, hold: 0, exhale: speedConfig / 2 }
                                                : speedConfig;

                                            // Heuristic: If values are small (< 60), assuming they are in seconds, convert to MS for display
                                            // This is purely for display/edit comfort if legacy data exists.
                                            // New saves will be in MS.
                                            if (currentValues.inhale < 100) currentValues = {
                                                inhale: currentValues.inhale * 1000,
                                                exhale: currentValues.exhale * 1000,
                                                hold: (currentValues.hold || 0) * 1000
                                            };

                                            return (
                                                <div key={speedKey} className="space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    <h4 className="font-bold text-blue-600 dark:text-lime-400 capitalize">{speedKey === 'slow' ? 'Lento' : speedKey === 'standard' ? 'Estándar' : 'Rápido'}</h4>
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
                                                                onChange={(e) => updateSpeedGranular(speedKey, 'inhale', e.target.value)}
                                                                className="w-full px-3 py-2 text-base border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-0 bg-transparent transition-colors text-right font-mono font-medium"
                                                                placeholder="0"
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
                                                                onChange={(e) => updateSpeedGranular(speedKey, 'exhale', e.target.value)}
                                                                className="w-full px-3 py-2 text-base border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-0 bg-transparent transition-colors text-right font-mono font-medium"
                                                                placeholder="0"
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
                                                                onChange={(e) => updateSpeedGranular(speedKey, 'hold', e.target.value)}
                                                                className="w-full px-3 py-2 text-base border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-0 bg-transparent transition-colors text-right font-mono font-medium"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
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
                                    <SoundConfigRow label="Música de Fondo" configKey="bg_music" checked={config.breathing.bg_music} onChange={() => updateBreathing('bg_music', !config.breathing.bg_music)} onUpload={handleSoundUpload} soundUrl={config.breathing.sound_urls?.bg_music} />
                                    <SoundConfigRow label="Música Fase Resp." configKey="phase_music" checked={config.breathing.phase_music} onChange={() => updateBreathing('phase_music', !config.breathing.phase_music)} onUpload={handleSoundUpload} soundUrl={config.breathing.sound_urls?.phase_music} />
                                    <SoundConfigRow label="Música Fase Ret." configKey="retention_music" checked={config.breathing.retention_music} onChange={() => updateBreathing('retention_music', !config.breathing.retention_music)} onUpload={handleSoundUpload} soundUrl={config.breathing.sound_urls?.retention_music} />
                                    <SoundConfigRow label="Guía de Voz" configKey="voice_guide" checked={config.breathing.voice_guide} onChange={() => updateBreathing('voice_guide', !config.breathing.voice_guide)} onUpload={handleSoundUpload} soundUrl={config.breathing.sound_urls?.voice_guide} />
                                    <SoundConfigRow label="Guía Fase Resp." configKey="breathing_guide" checked={config.breathing.breathing_guide} onChange={() => updateBreathing('breathing_guide', !config.breathing.breathing_guide)} onUpload={handleSoundUpload} soundUrl={config.breathing.sound_urls?.breathing_guide} />
                                    <SoundConfigRow label="Guía Fase Ret." configKey="retention_guide" checked={config.breathing.retention_guide} onChange={() => updateBreathing('retention_guide', !config.breathing.retention_guide)} onUpload={handleSoundUpload} soundUrl={config.breathing.sound_urls?.retention_guide} />
                                    <SoundConfigRow label="Ping y Gong" configKey="ping_gong" checked={config.breathing.ping_gong} onChange={() => updateBreathing('ping_gong', !config.breathing.ping_gong)} onUpload={handleSoundUpload} soundUrl={config.breathing.sound_urls?.ping_gong} />
                                    <SoundConfigRow label="Sonidos Resp." configKey="breath_sounds" checked={config.breathing.breath_sounds} onChange={() => updateBreathing('breath_sounds', !config.breathing.breath_sounds)} onUpload={handleSoundUpload} soundUrl={config.breathing.sound_urls?.breath_sounds} />
                                </div>
                            </div>
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
        </div >
    );
};

const SoundConfigRow = ({ label, configKey, checked, onChange, onUpload, soundUrl }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            {soundUrl && (
                <a href={soundUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline truncate max-w-[150px]">
                    Archivo personalizado activo
                </a>
            )}
        </div>

        <div className="flex items-center gap-3">
            {/* Upload Button */}
            <label className="cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-400" title="Subir audio personalizado">
                <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && onUpload(configKey, e.target.files[0])}
                />
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
);

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
