import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Star, AlertTriangle, CheckCircle2, ChevronRight, Loader2, Home, ArrowLeft } from 'lucide-react';
import sleepService from '../../../services/sleepService';
import { NavigationHeader, ConfirmationModal } from '../../../components/MetabolicComponents';

const SleepTracker = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState('00:00');
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [lastSession, setLastSession] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Global Loading
    const [isStarting, setIsStarting] = useState(false); // Button Loading
    const [error, setError] = useState(null);

    // Modal States
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Morning Check-in State
    const [quality, setQuality] = useState(3);
    const [symptoms, setSymptoms] = useState([]);
    const [notes, setNotes] = useState('');
    const [editableDuration, setEditableDuration] = useState(0);

    const symptomOptions = [
        { id: 'BOCA_SECA', label: 'Boca seca / Sed intensa', icon: '🌵' },
        { id: 'DOLOR_CABEZA', label: 'Dolor de cabeza frontal', icon: '🤕' },
        { id: 'AHOGO', label: 'Desperté asustado / Falta de aire', icon: '😱' },
        { id: 'RONQUIDO_FUERTE', label: 'Ronquidos fuertes (según pareja)', icon: '📢' },
    ];

    const toggleSymptom = (id) => {
        setSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const fetchStatus = async () => {
        setIsLoading(true);
        try {
            const data = await sleepService.getStatus();
            console.log('[SleepTracker] Status fetched:', data);
            if (data.active) {
                const parsedStartTime = new Date(data.session.start_time);
                console.log('[SleepTracker] Active session detected. Start time:', parsedStartTime);
                setIsActive(true);
                setStartTime(parsedStartTime);
                setCurrentSessionId(data.session.id);
            } else {
                setIsActive(false);
                setLastSession(data.last_session);
            }
        } catch (err) {
            console.error('Failed to fetch sleep status', err);
            // Silent error for fetch status to avoid annoyance, unless it's critical
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        console.log('[SleepTracker] Timer effect triggered. isActive:', isActive, 'startTime:', startTime);

        if (!isActive || !startTime) {
            console.log('[SleepTracker] Timer not running - inactive or no start time');
            return;
        }

        const updateTimer = () => {
            const now = new Date();
            const diffMs = now.getTime() - startTime.getTime();

            console.log('[SleepTracker] Timer update - diffMs:', diffMs, 'now:', now, 'startTime:', startTime);

            // Protección contra valores negativos (por desincronización de timezone)
            if (diffMs < 0) {
                console.warn('[SleepTracker] Negative time difference detected!');
                setElapsedTime('00:00');
                setEditableDuration(0);
                return;
            }

            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);
            const diffSecs = Math.floor((diffMs / 1000) % 60);
            const timeStr = `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
            console.log('[SleepTracker] Elapsed time:', timeStr);
            setElapsedTime(timeStr);
            setEditableDuration(Math.floor(diffMs / (1000 * 60)));
        };

        updateTimer(); // Ejecutar inmediatamente al montar
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [isActive, startTime]);

    const handleStartSleep = async () => {
        setIsStarting(true);
        setError(null);
        try {
            const session = await sleepService.startSleep();
            setStartTime(new Date(session.start_time));
            setCurrentSessionId(session.id);
            setIsActive(true);
        } catch (err) {
            console.error('Start sleep failed', err);
            setError("No se pudo iniciar la sesión. Intenta de nuevo.");
        } finally {
            setIsStarting(false);
        }
    };

    const handleWakeUp = () => {
        setIsCheckingIn(true);
    };

    const handleCancelClick = () => {
        setCancelModalOpen(true);
    };

    const confirmCancelSleep = async () => {
        try {
            await sleepService.cancelSleep();
            setIsActive(false);
            setStartTime(null);
            setCurrentSessionId(null);
            setElapsedTime('00:00:00');
            setCancelModalOpen(false);
        } catch (err) {
            console.error('Cancel sleep failed', err);
            setError('No se pudo cancelar la sesión.');
            setCancelModalOpen(false);
        }
    };



    const handleSaveSession = async () => {
        try {
            await sleepService.endSleep({
                session_id: currentSessionId,
                quality_score: quality,
                symptoms,
                notes,
                manual_duration_minutes: editableDuration
            });
            setIsCheckingIn(false);
            setIsActive(false);
            setStartTime(null);
            fetchStatus();
        } catch (err) {
            console.error('End sleep failed', err);
            setModalMessage("Error al guardar sesión");
            setErrorModalOpen(true);
        }
    };

    if (isActive && !isCheckingIn) {
        return (
            <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-500">
                {/* Navigation Controls */}
                <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 active:scale-95 group"
                        title="Ir atrás"
                    >
                        <ArrowLeft size={24} className="text-white/60 group-hover:text-white" />
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 active:scale-95 group"
                        title="Ir al inicio"
                    >
                        <Home size={24} className="text-white/60 group-hover:text-white" />
                    </button>
                </div>

                <Moon size={80} className="text-violet-500 mb-8 animate-pulse" />
                <h2 className="text-gray-500 uppercase tracking-widest text-sm mb-2 text-center">Descansando...</h2>
                <div className="text-6xl md:text-8xl font-black tabular-nums">{elapsedTime}</div>
                <div className="mt-12 w-full max-w-sm px-4">
                    <button
                        onClick={handleWakeUp}
                        className="w-full py-6 bg-violet-600 border-2 border-violet-400 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-violet-500 hover:scale-105 transition-all shadow-[0_0_40px_rgba(139,92,246,0.6)] active:scale-95"
                    >
                        DESPERTAR ☀️
                    </button>

                    <button
                        onClick={handleCancelClick}
                        className="mt-6 text-sm text-gray-500 hover:text-red-400 transition-colors underline block mx-auto"
                    >
                        Cancelar sesión incorrecta
                    </button>
                </div>

                {/* Cancel Confirmation Modal - Must be inside this return block to render */}
                <ConfirmationModal
                    isOpen={cancelModalOpen}
                    onClose={() => setCancelModalOpen(false)}
                    title="¿Cancelar Sesión?"
                    message="Esta acción eliminará el registro actual y no se podrá deshacer. ¿Estás seguro?"
                    isDestructive={true}
                    onConfirm={confirmCancelSleep}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            {/* Header */}
            <NavigationHeader
                title="Sueño Reparador"
                subtitle="Monitoreo de Apnea y Descanso"
                icon={Moon}
            />

            <div className="p-6">
                {/* Main Card */}
                <div className="bg-gray-900 border border-violet-500/30 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

                    <div className="w-24 h-24 bg-violet-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                        <Moon size={48} className="text-violet-400" />
                    </div>

                    <h2 className="text-white text-xl font-bold mb-2">¿Listo para descansar?</h2>
                    <p className="text-gray-400 text-center text-sm mb-8 px-4 leading-relaxed">
                        Al despertar realizaremos tu <span className="text-violet-300">Morning Check-in</span> para evaluar posibles eventos de apnea.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}

                    <button
                        onClick={handleStartSleep}
                        disabled={isStarting || isLoading}
                        className={`w-full py-5 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3
                            ${isStarting
                                ? 'bg-gray-800 text-gray-400 cursor-wait'
                                : 'bg-violet-600 hover:bg-violet-500 shadow-violet-900/40'}
                        `}
                    >
                        {isStarting ? (
                            <>
                                <Loader2 size={24} className="animate-spin" /> INICIANDO...
                            </>
                        ) : (
                            <>
                                <Moon size={24} /> IR A DORMIR
                            </>
                        )}
                    </button>
                </div>

                {/* Summary */}
                {lastSession && (
                    <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className={`p-4 rounded-xl ${lastSession.apnea_flag ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                            {lastSession.apnea_flag ? <AlertTriangle className="text-rose-500" size={24} /> : <CheckCircle2 className="text-emerald-500" size={24} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-bold text-lg mb-1">Última noche</p>
                            <p className="text-gray-400 text-sm mb-1">{Math.floor(lastSession.duration_minutes / 60)}h {lastSession.duration_minutes % 60}m</p>
                            <p className={`text-xs font-medium px-2 py-1 rounded-md inline-block
                                ${lastSession.apnea_flag ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}
                            `}>
                                {lastSession.apnea_flag ? 'Síntomas de Apnea Detectados ⚠️' : 'Sueño Reparador ✅'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Check-in Modal */}
            {isCheckingIn && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
                    <div className="bg-gray-900 w-full max-w-md rounded-3xl border border-violet-500/30 p-8 space-y-6 shadow-2xl">
                        <div className="text-center">
                            <Sun size={48} className="text-yellow-500 mx-auto mb-2 animate-bounce-slow" />
                            <h2 className="text-2xl font-black text-white">¡Buenos días!</h2>
                            <p className="text-gray-400">¿Cómo te sientes esta mañana?</p>
                        </div>

                        {/* Quality Rating */}
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setQuality(star)} className="p-2 hover:scale-110 transition-transform">
                                    <Star size={36} fill={star <= quality ? '#8b5cf6' : 'transparent'} className={star <= quality ? 'text-violet-500' : 'text-gray-700'} />
                                </button>
                            ))}
                        </div>

                        {/* Symptoms */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">¿Detectaste algo inusual?</p>
                            <div className="grid grid-cols-1 gap-2">
                                {symptomOptions.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => toggleSymptom(opt.id)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left
                                            ${symptoms.includes(opt.id) ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/20' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'}
                                        `}
                                    >
                                        <span className="text-2xl">{opt.icon}</span>
                                        <span className="text-sm font-medium">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration Adjustment */}
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Confirmar tiempo</p>
                            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <span className="text-gray-400 text-sm">Calculamos:</span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={Math.floor(editableDuration / 60)}
                                        onChange={(e) => setEditableDuration(Number(e.target.value) * 60 + (editableDuration % 60))}
                                        className="w-12 bg-gray-700 text-white text-center rounded-lg font-bold py-1 border border-gray-600 focus:border-violet-500 outline-none"
                                    />
                                    <span className="text-gray-500 font-bold">h</span>
                                    <input
                                        type="number"
                                        value={editableDuration % 60}
                                        onChange={(e) => setEditableDuration(Math.floor(editableDuration / 60) * 60 + Number(e.target.value))}
                                        className="w-12 bg-gray-700 text-white text-center rounded-lg font-bold py-1 border border-gray-600 focus:border-violet-500 outline-none"
                                    />
                                    <span className="text-gray-500 font-bold">m</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveSession}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={20} /> GUARDAR SESIÓN
                        </button>
                        <div className="mt-6 text-center">
                            <button
                                onClick={handleWakeUp}
                                className="w-full py-5 bg-violet-600 hover:bg-violet-700 text-white font-black text-lg rounded-2xl transition-colors shadow-lg shadow-violet-500/30 border-2 border-violet-500 active:scale-95 hold-button"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <Moon size={24} />
                                    MANTENER PARA DESPERTAR 👋
                                </div>
                            </button>
                            <p className="text-xs text-gray-500 mt-3">Presiona por 2 segundos para finalizar</p>

                            {/* Cancel Button */}
                            <button
                                onClick={handleCancelClick}
                                className="mt-4 text-sm text-gray-500 hover:text-red-500 transition-colors underline"
                            >
                                Cancelar sesión incorrecta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal for Cancel */}
            <ConfirmationModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                title="¿Cancelar Sesión?"
                message="Esta acción eliminará el registro actual y no se podrá deshacer. ¿Estás seguro?"
                isDestructive={true}
                onConfirm={confirmCancelSleep}
            />

            {/* Generic Error Modal */}
            <ConfirmationModal
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                title="Error"
                message={modalMessage}
                isDestructive={false}
                onConfirm={() => setErrorModalOpen(false)}
            />
        </div>
    );
};

export default SleepTracker;
