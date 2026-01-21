import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Star, AlertTriangle, CheckCircle2, ChevronRight, Loader2, Home, ArrowLeft, Trash2, Edit3, Clock, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import sleepService from '../../../services/sleepService';
import { NavigationHeader, ConfirmationModal } from '../../../components/MetabolicComponents';
import { useLanguage } from '../../../context/LanguageContext';

const SleepTracker = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState('00:00');
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [lastSession, setLastSession] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState(null);

    // History State
    const [history, setHistory] = useState([]);

    // Modal States
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editHours, setEditHours] = useState(0);
    const [editMinutes, setEditMinutes] = useState(0);

    // Morning Check-in State
    const [quality, setQuality] = useState(3);
    const [symptoms, setSymptoms] = useState([]);
    const [notes, setNotes] = useState('');
    const [editableDuration, setEditableDuration] = useState(0);
    const [showNote, setShowNote] = useState(false);
    const [isEditingDuration, setIsEditingDuration] = useState(false);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 2 && hour < 12) return t('sleep.good_morning', '¡Buenos días!');
        if (hour >= 12 && hour < 18) return t('sleep.good_afternoon', '¡Buenas tardes!');
        return t('sleep.good_evening', '¡Buenas noches!');
    };

    const symptomOptions = [
        { id: 'BOCA_SECA', label: t('sleep.dry_mouth', 'Boca seca / Sed intensa'), icon: '🌵' },
        { id: 'DOLOR_CABEZA', label: t('sleep.headache', 'Dolor de cabeza frontal'), icon: '🤕' },
        { id: 'AHOGO', label: t('sleep.scared_wake', 'Desperté asustado / Falta de aire'), icon: '😱' },
        { id: 'RONQUIDO_FUERTE', label: t('sleep.loud_snoring', 'Ronquidos fuertes (según pareja)'), icon: '📢' },
    ];

    const toggleSymptom = (id) => {
        setSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const fetchStatus = async () => {
        setIsLoading(true);
        try {
            const data = await sleepService.getStatus();
            if (data.active) {
                const parsedStartTime = new Date(data.session.start_time);
                setIsActive(true);
                setStartTime(parsedStartTime);
                setCurrentSessionId(data.session.id);
            } else {
                setIsActive(false);
                setLastSession(data.last_session);
            }
        } catch (err) {
            console.error('Failed to fetch sleep status', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const data = await sleepService.getHistory(10);
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch sleep history', err);
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchHistory();
    }, []);

    useEffect(() => {
        if (!isActive || !startTime) return;

        const updateTimer = () => {
            // Stop updating if user is checking in (modal is open)
            if (isCheckingIn) return;

            const now = new Date();
            const diffMs = now.getTime() - startTime.getTime();

            if (diffMs < 0) {
                setElapsedTime('00:00');
                setEditableDuration(0);
                return;
            }

            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);
            const diffSecs = Math.floor((diffMs / 1000) % 60);
            const timeStr = `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
            setElapsedTime(timeStr);
            setEditableDuration(Math.floor(diffMs / (1000 * 60)));
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [isActive, startTime, isCheckingIn]);

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
            navigate('/dashboard');
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
            fetchHistory();
        } catch (err) {
            console.error('End sleep failed', err);
            setModalMessage("Error al guardar sesión");
            setErrorModalOpen(true);
        }
    };

    // Edit & Delete Handlers
    const openEditModal = (record) => {
        setEditingRecord(record);
        setEditHours(Math.floor(record.duration_minutes / 60));
        setEditMinutes(record.duration_minutes % 60);
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingRecord) return;
        try {
            const newDuration = editHours * 60 + editMinutes;
            await sleepService.updateSleep(editingRecord.id, { duration_minutes: newDuration });
            setEditModalOpen(false);
            setEditingRecord(null);
            fetchHistory();
            fetchStatus();
        } catch (err) {
            console.error('Update sleep failed', err);
            setModalMessage("Error al actualizar registro");
            setErrorModalOpen(true);
        }
    };

    const openDeleteModal = (record) => {
        setRecordToDelete(record);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!recordToDelete) return;
        try {
            await sleepService.deleteSleep(recordToDelete.id);
            setDeleteModalOpen(false);
            setRecordToDelete(null);
            fetchHistory();
            fetchStatus();
        } catch (err) {
            console.error('Delete sleep failed', err);
            setModalMessage("Error al eliminar registro");
            setErrorModalOpen(true);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    };


    // Chart Data Processing
    const { chartData, maxSessions } = useMemo(() => {
        if (!history.length) return { chartData: [], maxSessions: 0 };

        const groups = {};
        let maxSess = 0;

        // Group by Date (YYYY-MM-DD) - using local time logic
        [...history].reverse().forEach(session => {
            const dateObj = new Date(session.start_time);
            const dateKey = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD format

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    date: dateObj,
                    totalMinutes: 0,
                    sessions: []
                };
            }

            const duration = session.duration_minutes;
            groups[dateKey].totalMinutes += duration;
            groups[dateKey].sessions.push(session);
        });

        const data = Object.values(groups).map(group => {
            const entry = {
                date: group.date,
                totalMinutes: group.totalMinutes,
                originalSessions: group.sessions
            };

            // Flatten sessions for Recharts stacking: session_0, session_1, ...
            group.sessions.forEach((sess, idx) => {
                entry[`session_${idx}`] = sess.duration_minutes;
            });

            if (group.sessions.length > maxSess) maxSess = group.sessions.length;

            return entry;
        });

        return { chartData: data, maxSessions: maxSess };
    }, [history]);

    // Calculate Date Range for Title
    const dateRangeTitle = useMemo(() => {
        if (!chartData.length) return '';
        const start = new Date(chartData[0].date);
        const end = new Date(chartData[chartData.length - 1].date);

        const fmt = (d) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        return `${fmt(start)} - ${fmt(end)}`;
    }, [chartData]);

    // Active Sleep Screen (Full-screen timer)
    if (isActive && !isCheckingIn) {
        return (
            <div className="fixed inset-0 bg-[#0b0e14] z-[100] flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-500">
                {/* Navigation Controls */}
                <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 active:scale-95 group"
                    >
                        <ArrowLeft size={24} className="text-white/60 group-hover:text-white" />
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 active:scale-95 group"
                    >
                        <Home size={24} className="text-white/60 group-hover:text-white" />
                    </button>
                </div>

                <Moon size={80} className="text-violet-500 mb-8 animate-pulse" />
                <h2 className="text-gray-500 uppercase tracking-widest text-sm mb-2 text-center">{t('sleep.resting_status', 'Descansando...')}</h2>
                <div className="text-6xl md:text-8xl font-black tabular-nums">{elapsedTime}</div>
                <div className="mt-12 w-full max-w-sm px-4">
                    <button
                        onClick={handleWakeUp}
                        className="w-full py-6 bg-violet-600 border-2 border-violet-400 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-violet-500 hover:scale-105 transition-all shadow-[0_0_40px_rgba(139,92,246,0.6)] active:scale-95"
                    >
                        {t('sleep.wake_up_button', 'DESPERTAR')} ☀️
                    </button>

                    <button
                        onClick={handleCancelClick}
                        className="mt-6 text-sm text-gray-500 hover:text-red-400 transition-colors underline block mx-auto"
                    >
                        {t('sleep.cancel_session', 'Cancelar sesión incorrecta')}
                    </button>
                </div>

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

    // Main Dashboard View
    return (
        <div className="h-screen bg-[#0b0e14] flex flex-col overflow-hidden">
            {/* Header - Fixed Height */}
            <div className="flex-shrink-0">
                <NavigationHeader
                    title={t('sleep.title', 'Sueño Reparador')}
                    subtitle={t('sleep.subtitle', 'Monitoreo de Apnea y Descanso')}
                    icon={Moon}
                />
            </div>

            {/* Content Area - Takes remaining height */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-4 sm:p-6">
                {/* Main Card - Fixed */}
                <div className="bg-gray-900/80 border border-violet-500/30 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-violet-500/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 ring-1 ring-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                        <Moon size={40} className="text-violet-400" />
                    </div>

                    <h2 className="text-white text-lg sm:text-xl font-bold mb-2">{t('sleep.ready_question', '¿Listo para descansar?')}</h2>
                    <p className="text-gray-400 text-center text-xs sm:text-sm mb-6 px-4 leading-relaxed">
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
                        className={`w-full py-4 sm:py-5 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3
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
                                <Moon size={24} /> {t('sleep.start_button', 'IR A DORMIR')}
                            </>
                        )}
                    </button>
                </div>


                {/* Visual Chart Section */}
                <div className="flex-shrink-0 mt-6 mb-2">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 px-1 text-center">
                        Resumen Semanal <span className="text-violet-400 ml-2">{dateRangeTitle}</span>
                    </h3>
                    <div className="h-48 w-full bg-gray-900/40 border border-gray-800 rounded-2xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { weekday: 'narrow' })}
                                    stroke="#9ca3af"
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${Math.floor(val / 60)}h`}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            const totalHours = Math.floor(data.totalMinutes / 60);
                                            const totalMins = data.totalMinutes % 60;

                                            // Sort sessions by time for display if needed, but originalSessions is array
                                            return (
                                                <div className="bg-gray-900 border border-violet-500/30 p-2 rounded-lg shadow-xl z-50">
                                                    <p className="text-violet-400 text-xs font-bold mb-1 border-b border-gray-800 pb-1">
                                                        {new Date(data.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                                                    </p>
                                                    <p className="text-white text-sm font-bold mb-2">
                                                        Total: {totalHours}h {totalMins}m
                                                    </p>
                                                    <div className="space-y-1">
                                                        {data.originalSessions.map((sess, idx) => (
                                                            <div key={sess.id} className="flex items-center gap-2 text-[10px]">
                                                                <div className={`w-2 h-2 rounded-full ${sess.apnea_flag ? 'bg-rose-500' : 'bg-violet-500'}`} />
                                                                <span className="text-gray-300">
                                                                    {new Date(sess.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                                    {Math.floor(sess.duration_minutes / 60)}h {sess.duration_minutes % 60}m
                                                                </span>
                                                                {sess.apnea_flag && <span className="text-rose-400">⚠️</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                {Array.from({ length: maxSessions }).map((_, i) => (
                                    <Bar
                                        key={`session_${i}`}
                                        dataKey={`session_${i}`}
                                        stackId="day"
                                        radius={[i === maxSessions - 1 ? 4 : 0, i === maxSessions - 1 ? 4 : 0, i === 0 ? 4 : 0, i === 0 ? 4 : 0]}
                                        stroke="#1f2937"
                                        strokeWidth={1}
                                    >
                                        {chartData.map((entry, index) => {
                                            const session = entry.originalSessions[i];
                                            if (!session) return <Cell key={`cell-${index}`} fill="transparent" />;

                                            // Color Logic: i=0 (Green #84cc16), i>0 (Blue #2563eb)
                                            const fillColor = i === 0 ? '#84cc16' : '#2563eb';

                                            return (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={fillColor}
                                                    fillOpacity={0.9}
                                                />
                                            );
                                        })}
                                    </Bar>
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* History Section - Scrollable */}
                <div className="flex-1 mt-4 overflow-y-auto scrollbar-hide">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 px-1">Historial de Sueño</h3>

                    {history.length === 0 ? (
                        <div className="text-center py-8 text-gray-600">
                            <Moon size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No hay registros de sueño todavía.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((record, idx) => (
                                <div
                                    key={record.id}
                                    className={`bg-gray-900/60 border rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-gray-900/80 ${record.apnea_flag ? 'border-rose-500/30' : 'border-gray-800'}`}
                                >
                                    <div className={`p-3 rounded-xl ${record.apnea_flag ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                                        {record.apnea_flag
                                            ? <AlertTriangle className="text-rose-500" size={20} />
                                            : <CheckCircle2 className="text-emerald-500" size={20} />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-sm flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-500" />
                                            {formatDate(record.start_time)}
                                        </p>
                                        <p className="text-gray-400 text-xs flex items-center gap-2 mt-1">
                                            <Clock size={12} className="text-gray-600" />
                                            {Math.floor(record.duration_minutes / 60)}h {record.duration_minutes % 60}m
                                        </p>
                                        <p className={`text-[10px] font-medium px-2 py-0.5 rounded-md inline-block mt-1 ${record.apnea_flag ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            {record.apnea_flag ? 'Síntomas Detectados ⚠️' : 'Sueño Reparador ✅'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(record)}
                                            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                                        >
                                            <Edit3 size={16} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(record)}
                                            className="p-2 bg-gray-800 hover:bg-red-900/50 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={16} className="text-gray-400 hover:text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Check-in Modal */}
            {isCheckingIn && (
                <div className="fixed inset-0 z-[100] bg-[#0b0e14]/95 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
                    <div className="bg-gray-900 w-full max-w-md rounded-3xl border border-violet-500/30 p-8 space-y-6 shadow-2xl">
                        <div className="text-center">
                            <Sun size={48} className="text-yellow-500 mx-auto mb-2" />
                            <h2 className="text-2xl font-black text-white">{getGreeting()}</h2>
                            <p className="text-gray-400">{t('sleep.how_slept', '¿Cómo ha sido tu descanso?')}</p>
                        </div>

                        {/* Quality Rating */}
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setQuality(star)} className="p-2 hover:scale-110 transition-transform">
                                    <Star size={36} fill={star <= quality ? '#8b5cf6' : 'transparent'} className={star <= quality ? 'text-violet-500' : 'text-gray-700'} />
                                </button>
                            ))}
                        </div>

                        {/* Duration Adjustment (Moved Up) */}
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">TIEMPO DORMIDO</p>
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                {isEditingDuration ? (
                                    <div className="flex items-center justify-between">
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
                                        <button
                                            onClick={() => setIsEditingDuration(false)}
                                            className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
                                        >
                                            <CheckCircle2 size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="text-gray-300">
                                            Has descansado <span className="text-white font-bold text-lg">{Math.floor(editableDuration / 60)}h {editableDuration % 60}m</span>
                                        </div>
                                        <button
                                            onClick={() => setIsEditingDuration(true)}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-gray-400 hover:text-white"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Symptoms */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">{t('sleep.unusual_detection', '¿DETECTASTE ALGO INUSUAL?')}</p>
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

                        {/* Collapsible Notes */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowNote(!showNote)}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wide w-full"
                            >
                                <span className="text-xl">📝</span>
                                {t('sleep.add_note', 'Añadir Nota')}
                                <ChevronRight size={16} className={`ml-auto transition-transform ${showNote ? 'rotate-90' : ''}`} />
                            </button>

                            {showNote && (
                                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={t('sleep.note_placeholder', 'Detalles sobre tu descanso...')}
                                        className="w-full bg-transparent text-white text-sm outline-none resize-none placeholder-gray-600 h-20"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSaveSession}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={20} /> {t('sleep.save_session', 'GUARDAR SESIÓN')}
                        </button>

                        <div className="mt-4 text-center">
                            <button
                                onClick={handleCancelClick}
                                className="text-sm text-gray-500 hover:text-red-500 transition-colors underline"
                            >
                                {t('sleep.cancel_session', 'Cancelar sesión incorrecta')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && editingRecord && (
                <div className="fixed inset-0 z-[100] bg-[#0b0e14]/95 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-900 w-full max-w-sm rounded-3xl border border-gray-700 p-6 space-y-6 shadow-2xl">
                        <div className="text-center">
                            <Edit3 size={32} className="text-violet-400 mx-auto mb-2" />
                            <h2 className="text-xl font-bold text-white">Editar Registro</h2>
                            <p className="text-gray-500 text-sm">{formatDate(editingRecord.start_time)}</p>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <div className="text-center">
                                <input
                                    type="number"
                                    value={editHours}
                                    onChange={(e) => setEditHours(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-20 bg-gray-800 text-white text-center text-3xl font-bold rounded-xl py-3 border border-gray-700 focus:border-violet-500 outline-none"
                                />
                                <p className="text-gray-500 text-xs mt-1 uppercase">Horas</p>
                            </div>
                            <span className="text-3xl text-gray-600 font-bold">:</span>
                            <div className="text-center">
                                <input
                                    type="number"
                                    value={editMinutes}
                                    onChange={(e) => setEditMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                    className="w-20 bg-gray-800 text-white text-center text-3xl font-bold rounded-xl py-3 border border-gray-700 focus:border-violet-500 outline-none"
                                />
                                <p className="text-gray-500 text-xs mt-1 uppercase">Minutos</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all"
                            >
                                Guardar
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

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="¿Eliminar Registro?"
                message="Esta acción eliminará permanentemente este registro de sueño. ¿Estás seguro?"
                isDestructive={true}
                onConfirm={confirmDelete}
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
