// Componente principal del Sistema de Protocolos
import React, { useState, useEffect } from 'react';
import protocolService from '../../services/protocolService';
import {
    Shield, Play, CheckSquare, Square, AlertTriangle,
    Droplet, Clock, Calendar, Trophy, X, ChevronRight,
    Loader2
} from 'lucide-react';
import { ConfirmationModal } from '../MetabolicComponents';

// Selector de protocolos (cuando no hay uno activo)
const ProtocolSelector = ({ protocols, onStart, loading }) => {
    const [selectedProtocol, setSelectedProtocol] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [configOptions, setConfigOptions] = useState({
        duration_days: 15,
        start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Mañana por defecto
    });

    const handleViewDetails = (protocol) => {
        setSelectedProtocol(protocol);
        setShowDetails(true);
    };

    const handleConfigureAndStart = () => {
        // Set appropriate default duration based on protocol
        let defaultDuration = selectedProtocol.duration_days;
        if (selectedProtocol.name === 'Anti-Cándida') {
            defaultDuration = 15;
        } else if (selectedProtocol.name === 'Repoblación e Intestino') {
            defaultDuration = 30;
        } else if (selectedProtocol.name === 'Limpieza Hepática Profunda') {
            defaultDuration = 2; // Fixed duration
        }
        setConfigOptions(prev => ({ ...prev, duration_days: defaultDuration }));
        setShowConfig(true);
    };

    const handleConfirmStart = () => {
        onStart(selectedProtocol.id, configOptions);
    };

    // Calcular fases dinámicas para preview
    const getPreviewPhases = (duration) => {
        const phase1End = Math.ceil(duration * 0.33);
        const phase2End = Math.ceil(duration * 0.66);
        return [
            { name: 'Inicial', days_start: 1, days_end: phase1End, oregano_drops: 2 },
            { name: 'Intermedia', days_start: phase1End + 1, days_end: phase2End, oregano_drops: 4 },
            { name: 'Intensiva', days_start: phase2End + 1, days_end: duration, oregano_drops: 5 }
        ];
    };

    if (showDetails && selectedProtocol) {
        return (
            <div className="space-y-6">
                {/* Header con botón volver */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowDetails(false)}
                        className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                    <h2 className="text-xl font-black text-white">
                        {selectedProtocol.icon} {selectedProtocol.name}
                    </h2>
                </div>

                {/* Descripción */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {selectedProtocol.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-lime-500">
                        <Calendar size={16} />
                        <span className="text-sm font-bold">{selectedProtocol.duration_days} días</span>
                    </div>
                </div>

                {/* Fases */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fases del Protocolo</h3>
                    {selectedProtocol.phases?.map((phase, idx) => (
                        <div key={idx} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex justify-between items-center">
                                <span className="text-white font-bold">{phase.name}</span>
                                <span className="text-slate-400 text-sm">Días {phase.days_start}-{phase.days_end}</span>
                            </div>
                            {phase.oregano_drops && (
                                <p className="text-amber-400 text-sm mt-1">
                                    🌿 {phase.oregano_drops} gotas de orégano
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Tareas diarias */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tareas Diarias</h3>
                    {selectedProtocol.daily_tasks?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((task, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
                            <span className="text-2xl">{task.icon}</span>
                            <div>
                                <p className="text-white font-bold text-sm">{task.name}</p>
                                <p className="text-slate-400 text-xs">{task.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reglas */}
                {selectedProtocol.rules?.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reglas de Seguridad</h3>
                        {selectedProtocol.rules.map((rule, idx) => (
                            <div key={idx} className={`flex items-center gap-2 p-3 rounded-xl ${rule.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                                rule.type === 'restriction' ? 'bg-rose-500/10 text-rose-400' :
                                    'bg-blue-500/10 text-blue-400'
                                }`}>
                                <span>{rule.icon}</span>
                                <span className="text-sm font-medium">{rule.message}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Configuración o Botón Iniciar */}
                {showConfig ? (
                    <div className="space-y-4 bg-slate-800/50 rounded-2xl p-5 border border-lime-500/30">
                        <h3 className="text-white font-black text-center">⚙️ Configurar Protocolo</h3>

                        {/* Duración */}
                        {selectedProtocol.name === 'Anti-Cándida' && (
                            <div className="space-y-2">
                                <label className="text-slate-300 text-sm font-bold">Duración: {configOptions.duration_days} días</label>
                                <input
                                    type="range"
                                    min="7"
                                    max="15"
                                    value={configOptions.duration_days}
                                    onChange={(e) => setConfigOptions(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lime-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>7 días (rápido)</span>
                                    <span>15 días (completo)</span>
                                </div>
                            </div>
                        )}

                        {selectedProtocol.name === 'Repoblación e Intestino' && (
                            <div className="space-y-2">
                                <label className="text-slate-300 text-sm font-bold">Duración: {configOptions.duration_days} días</label>
                                <input
                                    type="range"
                                    min="7"
                                    max="30"
                                    value={Math.min(30, Math.max(7, configOptions.duration_days))}
                                    onChange={(e) => setConfigOptions(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lime-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>7 días (mínimo)</span>
                                    <span>30 días (completo)</span>
                                </div>
                            </div>
                        )}

                        {selectedProtocol.name === 'Limpieza Hepática Profunda' && (
                            <div className="bg-slate-700/50 p-3 rounded-xl">
                                <p className="text-slate-300 text-sm">
                                    <span className="text-amber-400 font-bold">⏱️ Duración fija: 2 días</span>
                                    <br />
                                    <span className="text-slate-400 text-xs">Este protocolo tiene una duración establecida que no puede modificarse.</span>
                                </p>
                            </div>
                        )}

                        {/* Fecha de inicio */}
                        <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-bold">Fecha de inicio</label>
                            <input
                                type="date"
                                value={configOptions.start_date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setConfigOptions(prev => ({ ...prev, start_date: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                            />
                        </div>

                        {/* Preview de fases */}
                        {selectedProtocol.name === 'Anti-Cándida' && (
                            <div className="space-y-2">
                                <label className="text-slate-400 text-xs font-bold uppercase">Fases con esta duración:</label>
                                {getPreviewPhases(configOptions.duration_days).map((phase, idx) => (
                                    <div key={idx} className="flex justify-between text-sm bg-slate-700/50 p-2 rounded-lg">
                                        <span className="text-white">{phase.name} (Días {phase.days_start}-{phase.days_end})</span>
                                        <span className="text-amber-400">🌿 {phase.oregano_drops} gotas</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleConfirmStart}
                            disabled={loading}
                            className="w-full py-4 bg-lime-500 text-slate-900 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-lime-400 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <Play size={20} />
                                    Confirmar e Iniciar
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleConfigureAndStart}
                        disabled={loading}
                        className="w-full py-4 bg-lime-500 text-slate-900 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-lime-400 transition-colors disabled:opacity-50"
                    >
                        <Play size={20} />
                        Configurar e Iniciar
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-lg font-black text-white mb-2">🧪 Protocolos Disponibles</h2>
                <p className="text-slate-400 text-sm">Selecciona un protocolo para comenzar tu transformación</p>
            </div>

            {protocols.map((protocol) => (
                <div
                    key={protocol.id}
                    className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-5 border border-slate-700 hover:border-lime-500/50 transition-all"
                >
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">{protocol.icon}</div>
                        <div className="flex-1">
                            <h3 className="text-white font-black text-lg">{protocol.name}</h3>
                            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{protocol.description}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="text-lime-500 text-sm font-bold flex items-center gap-1">
                                    <Calendar size={14} />
                                    {protocol.duration_days} días
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => handleViewDetails(protocol)}
                        className="w-full mt-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                        Ver Detalles
                        <ChevronRight size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

// Dashboard del protocolo activo
const ProtocolDashboard = ({ protocol, onTaskToggle, onAbandon, loading }) => {
    const [localTasksCompleted, setLocalTasksCompleted] = useState([]);
    const [togglingTask, setTogglingTask] = useState(null);

    // Sync local state with protocol data
    useEffect(() => {
        setLocalTasksCompleted(protocol.today_log?.tasks_completed || []);
    }, [protocol.today_log?.tasks_completed]);

    const progressPercent = (protocol.current_day / protocol.duration_days) * 100;

    // Calculate task progress
    const totalTasks = protocol.daily_tasks?.length || 0;
    const completedCount = localTasksCompleted.length;
    const taskProgressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    // Handle optimistic toggle
    const handleToggle = async (taskId, isCompleted) => {
        // Optimistic update
        setTogglingTask(taskId);
        if (isCompleted) {
            setLocalTasksCompleted(prev => prev.filter(id => id !== taskId));
        } else {
            setLocalTasksCompleted(prev => [...prev, taskId]);
        }

        try {
            await onTaskToggle(taskId, isCompleted);
        } catch (error) {
            // Revert on error
            if (isCompleted) {
                setLocalTasksCompleted(prev => [...prev, taskId]);
            } else {
                setLocalTasksCompleted(prev => prev.filter(id => id !== taskId));
            }
        } finally {
            setTogglingTask(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header del protocolo */}
            <div className="bg-gradient-to-br from-lime-500/20 to-emerald-500/10 rounded-2xl p-5 border border-lime-500/30">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        {protocol.icon} {protocol.name}
                    </h2>
                    <span className="text-lime-500 font-black">
                        DÍA {protocol.current_day} de {protocol.duration_days}
                    </span>
                </div>

                {/* Barra de progreso de días */}
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Fase actual */}
                {protocol.current_phase && (
                    <div className="mt-3 flex items-center gap-2 text-amber-400">
                        <Shield size={16} />
                        <span className="text-sm font-bold">
                            Fase {protocol.current_phase.name} - {protocol.current_phase.oregano_drops} gotas de orégano
                        </span>
                    </div>
                )}
            </div>

            {/* Reglas recordatorio */}
            {protocol.rules?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {protocol.rules.map((rule, idx) => (
                        <div key={idx} className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${rule.type === 'hydration' ? 'bg-blue-500/20 text-blue-400' :
                            rule.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-rose-500/20 text-rose-400'
                            }`}>
                            {rule.icon} {rule.message}
                        </div>
                    ))}
                </div>
            )}

            {/* Checklist de tareas con progreso */}
            <div className="space-y-4">
                {/* Header con progreso de tareas */}
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tareas del Día</h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${completedCount === totalTasks ? 'text-lime-400' : 'text-slate-400'}`}>
                            {completedCount}/{totalTasks}
                        </span>
                        {completedCount === totalTasks && totalTasks > 0 && (
                            <span className="text-lime-400 animate-pulse">✓</span>
                        )}
                    </div>
                </div>

                {/* Barra de progreso de tareas */}
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${completedCount === totalTasks && totalTasks > 0
                                ? 'bg-gradient-to-r from-lime-400 to-emerald-400'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                            }`}
                        style={{ width: `${taskProgressPercent}%` }}
                    />
                </div>

                {/* Lista de tareas */}
                <div className="space-y-3">
                    {protocol.daily_tasks?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((task) => {
                        const isCompleted = localTasksCompleted.includes(task.id);
                        const isToggling = togglingTask === task.id;

                        return (
                            <button
                                key={task.id}
                                onClick={() => handleToggle(task.id, isCompleted)}
                                disabled={loading || isToggling}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${isCompleted
                                        ? 'bg-lime-500/10 border-lime-500/30 hover:bg-lime-500/15'
                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/70'
                                    } ${isToggling ? 'opacity-70 scale-[0.98]' : ''}`}
                            >
                                {/* Checkbox animado */}
                                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${isCompleted
                                        ? 'bg-lime-500 border-lime-500 scale-100'
                                        : 'border-slate-600 hover:border-lime-500/50'
                                    }`}>
                                    {isCompleted && (
                                        <CheckSquare size={18} className="text-slate-900" />
                                    )}
                                    {isToggling && !isCompleted && (
                                        <Loader2 size={16} className="text-lime-500 animate-spin" />
                                    )}
                                </div>

                                <div className="flex-1 text-left">
                                    <p className={`font-bold transition-all duration-200 ${isCompleted ? 'text-lime-400' : 'text-white'
                                        }`}>
                                        {task.icon} {task.name}
                                    </p>
                                    <p className={`text-xs transition-all duration-200 ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-500'
                                        }`}>
                                        {task.description}
                                    </p>
                                </div>

                                {/* Estado */}
                                {task.required && (
                                    <span className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 ${isCompleted ? 'text-lime-500' : 'text-amber-500'
                                        }`}>
                                        {isCompleted ? 'HECHO' : 'REQUERIDO'}
                                    </span>
                                )}
                                {!task.required && isCompleted && (
                                    <span className="text-xs font-bold text-lime-500 uppercase tracking-wider">
                                        HECHO
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mensaje de tareas completas */}
            {completedCount === totalTasks && totalTasks > 0 && (
                <div className="bg-gradient-to-br from-lime-500/20 to-emerald-500/10 rounded-2xl p-4 border border-lime-500/30 text-center">
                    <p className="text-lime-400 font-bold flex items-center justify-center gap-2">
                        <Trophy size={20} />
                        ¡Excelente! Completaste todas las tareas de hoy
                    </p>
                </div>
            )}

            {/* Verificar si el protocolo está completo */}
            {protocol.current_day >= protocol.duration_days && (
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-2xl p-5 border border-amber-500/30 text-center">
                    <Trophy size={48} className="text-amber-400 mx-auto mb-3" />
                    <h3 className="text-xl font-black text-white">¡Último Día!</h3>
                    <p className="text-slate-300 text-sm mt-2">
                        Completa todas las tareas para finalizar el protocolo
                    </p>
                </div>
            )}

            {/* Botón abandonar */}
            <button
                onClick={onAbandon}
                className="w-full py-3 bg-slate-800 text-rose-400 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-700 transition-colors"
            >
                Abandonar Protocolo
            </button>
        </div>
    );
};

// Componente principal
const ProtocolSystem = () => {
    const [protocols, setProtocols] = useState([]);
    const [activeProtocol, setActiveProtocol] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [abandonModalOpen, setAbandonModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [protocolsList, active] = await Promise.all([
                protocolService.getProtocols(),
                protocolService.getActiveProtocol()
            ]);
            setProtocols(protocolsList);
            setActiveProtocol(active);
        } catch (error) {
            console.error('Error fetching protocols:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartProtocol = async (protocolId, options = {}) => {
        try {
            setActionLoading(true);
            await protocolService.startProtocol(protocolId, options);
            await fetchData();
        } catch (error) {
            console.error('Error starting protocol:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleTaskToggle = async (taskId, isCompleted) => {
        try {
            setActionLoading(true);
            if (isCompleted) {
                await protocolService.unlogTask(taskId);
            } else {
                await protocolService.logTask(taskId);
            }
            await fetchData();
        } catch (error) {
            console.error('Error toggling task:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const confirmAbandon = async () => {
        try {
            setActionLoading(true);
            await protocolService.abandonProtocol();
            await fetchData();
            setAbandonModalOpen(false);
        } catch (error) {
            console.error('Error abandoning protocol:', error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={40} className="text-lime-500 animate-spin" />
            </div>
        );
    }

    if (activeProtocol) {
        return (
            <>
                <ProtocolDashboard
                    protocol={activeProtocol}
                    onTaskToggle={handleTaskToggle}
                    onAbandon={() => setAbandonModalOpen(true)}
                    loading={actionLoading}
                />
                <ConfirmationModal
                    isOpen={abandonModalOpen}
                    onClose={() => setAbandonModalOpen(false)}
                    onConfirm={confirmAbandon}
                    title="¿Abandonar Protocolo?"
                    message="Tu progreso actual se perderá y tendrás que empezar desde el día 1 si decides retomarlo."
                    isDestructive={true}
                />
            </>
        );
    }

    return (
        <ProtocolSelector
            protocols={protocols}
            onStart={handleStartProtocol}
            loading={actionLoading}
        />
    );
};

export default ProtocolSystem;
