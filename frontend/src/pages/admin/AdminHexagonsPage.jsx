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
            bg_music: true,
            phase_music: true,
            retention_music: true,
            voice_guide: true,
            breathing_guide: true,
            retention_guide: true,
            ping_gong: true,
            breath_sounds: true
        }
    });

    // Speed constants for animation
    const SPEED_DURATIONS = {
        slow: 10000,
        standard: 8000,
        fast: 4000,
    };

    const currentDuration = SPEED_DURATIONS[config.breathing.speed] || 8000;

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await api.get('/settings/hexagons');
                if (data && data.breathing) {
                    setConfig(prev => ({ ...prev, breathing: data.breathing }));
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

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando ajustes...</div>;

    return (
        <div className="max-w-4xl mx-auto">
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
                                                0%, 100% { transform: scale(0.9); }
                                                50% { transform: scale(1.1); }
                                            }
                                            @keyframes admin-breathing-glow {
                                                0%, 100% { opacity: 0.2; }
                                                50% { opacity: 0.6; }
                                            }
                                        `}</style>
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-widest font-bold">Vista previa del ritmo</div>
                                </div>

                                {/* Speed */}
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

                                {/* Toggles Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <Toggle label="Música de Fondo" checked={config.breathing.bg_music} onChange={() => updateBreathing('bg_music', !config.breathing.bg_music)} />
                                    <Toggle label="Música Fase Resp." checked={config.breathing.phase_music} onChange={() => updateBreathing('phase_music', !config.breathing.phase_music)} />
                                    <Toggle label="Música Fase Ret." checked={config.breathing.retention_music} onChange={() => updateBreathing('retention_music', !config.breathing.retention_music)} />
                                    <Toggle label="Guía de Voz" checked={config.breathing.voice_guide} onChange={() => updateBreathing('voice_guide', !config.breathing.voice_guide)} />
                                    <Toggle label="Guía Fase Resp." checked={config.breathing.breathing_guide} onChange={() => updateBreathing('breathing_guide', !config.breathing.breathing_guide)} />
                                    <Toggle label="Guía Fase Ret." checked={config.breathing.retention_guide} onChange={() => updateBreathing('retention_guide', !config.breathing.retention_guide)} />
                                    <Toggle label="Ping y Gong" checked={config.breathing.ping_gong} onChange={() => updateBreathing('ping_gong', !config.breathing.ping_gong)} />
                                    <Toggle label="Sonidos Resp." checked={config.breathing.breath_sounds} onChange={() => updateBreathing('breath_sounds', !config.breathing.breath_sounds)} />
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

const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <button
            onClick={onChange}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-blue-600 dark:bg-lime-500' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
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
