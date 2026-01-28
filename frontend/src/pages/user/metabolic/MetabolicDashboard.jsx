import React, { useState, useEffect } from 'react';
import metabolicService from '../../../services/metabolicService';
// ... imports
import { StatusCircle, ActionGrid, CameraModal, NoteModal, ConfirmationModal, NavigationHeader, InfoModal, EditEventModal, FastingInfoModal, ElectrolyteAlert, RecoveryStatusCard, RefeedProtocolModal, ElectrolyteRecipeModal, ProtocolScheduleModal, EditTimeModal } from '../../../components/MetabolicComponents';
import { Activity, Clock, ClipboardList, Info, HelpCircle, Trash2, Pencil, Droplet, Pill, Apple, Brain, Calendar, Shield, ChevronDown, ChevronUp, BookOpen, X } from 'lucide-react';
import DailyTimeline from '../../../components/metabolic/DailyTimeline';
import ProtocolSystem from '../../../components/metabolic/ProtocolSystem';
import SupplementChecklist from '../../../components/metabolic/SupplementChecklist';

import { useLocation } from 'react-router-dom';

const MetabolicDashboard = () => {
    const location = useLocation();
    const [statusData, setStatusData] = useState({
        status: 'UNKNOWN',
        phase: 'Cargando...',
        phaseColor: 'gray',
        hours_elapsed: 0,
        needs_electrolytes: false,
        refeed_status: null
    });

    // UI State
    const [infoMode, setInfoMode] = useState(false);
    const [filterType, setFilterType] = useState('ALL');
    const [showProtocols, setShowProtocols] = useState(false); // Modal for Protocol Management
    const [timelineOpen, setTimelineOpen] = useState(true); // Collapsible Timeline

    // Modals State
    const [cameraModalOpen, setCameraModalOpen] = useState(false);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [fastingInfoOpen, setFastingInfoOpen] = useState(false);
    const [refeedModalOpen, setRefeedModalOpen] = useState(false);
    const [pendingItem, setPendingItem] = useState(null);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [electrolyteRecipeOpen, setElectrolyteRecipeOpen] = useState(false);
    const [protocolScheduleOpen, setProtocolScheduleOpen] = useState(false);

    const [editTimeModalOpen, setEditTimeModalOpen] = useState(false);
    const [supplementModalOpen, setSupplementModalOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);
    const [history, setHistory] = useState([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, eventId: null });

    // --- NEW: Protocol Data State ---
    const [activeProtocol, setActiveProtocol] = useState(null);
    const [protocolTasks, setProtocolTasks] = useState([]);

    // --- NEW: Protocol Task Helper ---
    const processProtocolTasks = (protocol) => {
        if (!protocol || !protocol.daily_tasks) return [];
        let todaysTasks = protocol.daily_tasks;
        const hasDaySpecifics = protocol.daily_tasks.some(t => t.day);
        if (hasDaySpecifics) {
            todaysTasks = protocol.daily_tasks.filter(t => t.day === protocol.current_day);
        }
        return todaysTasks.map(task => ({
            ...task,
            completed: protocol.today_log?.tasks_completed?.includes(task.id) || false
        })).sort((a, b) => a.order - b.order);
    };

    // Fetch Initial Data
    const fetchData = async () => {
        try {
            const [status, hist, protocol] = await Promise.all([
                metabolicService.getStatus(),
                metabolicService.getHistory(20),
                import('../../../services/protocolService').then(m => m.default.getActiveProtocol())
            ]);

            setStatusData(status);
            setHistory(hist);
            setActiveProtocol(protocol);
            if (protocol) {
                setProtocolTasks(processProtocolTasks(protocol));
            } else {
                setProtocolTasks([]);
            }

        } catch (err) {
            console.error('Failed to fetch metabolic data', err);
            setError('No se pudieron cargar los datos iniciales.');
            setErrorModalOpen(true);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Handlers
    const handleLogClick = async (item, category, breaker) => {
        if (breaker && statusData.hours_elapsed > 24) {
            setPendingItem({ item, category, breaker });
            setRefeedModalOpen(true);
            return;
        }

        setSelectedItem({ ...item, category, is_fasting_breaker: breaker });

        if (category === 'COMIDA_REAL') {
            setCameraModalOpen(true);
        } else {
            await handleConfirmLog({
                name: item.name,
                category,
                is_fasting_breaker: breaker,
                image: null,
                notes: ''
            });
        }
    };

    const handleContinueAfterRefeed = () => {
        if (!pendingItem) return;
        const { item, category, breaker } = pendingItem;
        setSelectedItem({ ...item, category, is_fasting_breaker: breaker });
        setRefeedModalOpen(false);
        setPendingItem(null);

        if (category === 'COMIDA_REAL') {
            setCameraModalOpen(true);
        } else {
            handleConfirmLog({
                name: item.name,
                category,
                is_fasting_breaker: breaker,
                image: null,
                notes: ''
            });
        }
    };

    const handleInfoClick = (item) => {
        setSelectedItem({
            ...item,
            recipeAvailable: item.name.includes('Agua con Sal') || item.name.includes('Electrolitos'),
            onOpenRecipe: () => {
                setInfoModalOpen(false);
                setElectrolyteRecipeOpen(true);
            }
        });
        setInfoModalOpen(true);
    };

    const handleConfirmLog = async (data) => {
        try {
            const formData = new FormData();
            formData.append('event_type', 'CONSUMO');
            formData.append('category', data.category);
            formData.append('item_name', data.name || data.item_name);
            formData.append('is_fasting_breaker', data.is_fasting_breaker);
            if (data.notes) formData.append('notes', data.notes);
            if (data.image) formData.append('image', data.image);

            await metabolicService.logEvent(formData);
            await fetchData();
        } catch (err) {
            console.error('Log failed', err);
            setError('No se pudo registrar el evento.');
            setErrorModalOpen(true);
        }
    };

    // Protocol Task Handler
    const handleProtocolTaskClick = async (task) => {
        try {
            const protocolService = (await import('../../../services/protocolService')).default;
            if (task.completed) {
                await protocolService.unlogTask(task.id);
            } else {
                await protocolService.logTask(task.id);
            }
            await fetchData();
        } catch (err) {
            console.error('Protocol Log failed', err);
            setError('Error al actualizar tarea del protocolo.');
            setErrorModalOpen(true);
        }
    };

    const handleStatusNote = async (note) => {
        try {
            const formData = new FormData();
            formData.append('event_type', 'SINTOMA');
            formData.append('item_name', 'Estado Subjetivo');
            formData.append('category', 'ESTADO');
            formData.append('is_fasting_breaker', 'false');
            formData.append('notes', note);

            await metabolicService.logEvent(formData);
            setNoteModalOpen(false);
            await fetchData();
        } catch (err) {
            console.error('Note log failed', err);
            setError('No se pudo registrar la nota.');
            setErrorModalOpen(true);
        }
    };


    const handleStartTimeUpdate = async (newDateISO) => {
        if (!statusData.last_event) {
            setError("No hay un evento de inicio para editar.");
            setErrorModalOpen(true);
            return;
        }
        setIsEditing(true);
        try {
            await metabolicService.updateEvent(statusData.last_event.id, {
                created_at: newDateISO
            });
            await fetchData();
            setEditTimeModalOpen(false);
        } catch (err) {
            console.error('Time update failed', err);
            setError('No se pudo actualizar la hora.');
            setErrorModalOpen(true);
        } finally {
            setIsEditing(false);
        }
    };

    const handleDeleteClick = (eventId) => {
        setDeleteConfirmation({ isOpen: true, eventId });
    };

    const handleConfirmDelete = async () => {
        const eventId = deleteConfirmation.eventId;
        setDeleteConfirmation({ isOpen: false, eventId: null });

        try {
            await metabolicService.deleteEvent(eventId);
            await fetchData();
        } catch (err) {
            console.error('Delete failed', err);
            setError('No se pudo eliminar el evento.');
            setErrorModalOpen(true);
        }
    };

    const handleEditClick = (event) => {
        setEditingEvent(event);
        setEditModalOpen(true);
    };

    const handleEditSave = async (data) => {
        setIsEditing(true);
        try {
            await metabolicService.updateEvent(data.id, {
                notes: data.notes,
                created_at: data.created_at
            });
            await fetchData();
            setEditModalOpen(false);
            setEditingEvent(null);
        } catch (err) {
            console.error('Edit failed', err);
            setError('No se pudo actualizar el evento.');
            setErrorModalOpen(true);
        } finally {
            setIsEditing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 pb-20 font-ui transition-colors duration-300">
            {/* Header w/ Navigation */}
            <NavigationHeader
                title="Laboratorio Metabólico"
                subtitle="One Flow System"
                icon={Activity}
            />

            {/* UNIFIED DASHBOARD CONTENT */}
            <div className="p-6 relative space-y-8">

                {/* 1. HERO: Fasting Circle & Protocol Status */}
                <div className="flex flex-col items-center">
                    <StatusCircle
                        statusData={statusData}
                        onClick={() => setFastingInfoOpen(true)}
                        onEditStartTime={() => setEditTimeModalOpen(true)}
                    />

                    {/* Active Protocol Banner */}
                    {activeProtocol ? (
                        <div
                            className="mt-8 w-full bg-slate-800/50 border border-slate-700 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-lime-500/30 transition-all cursor-pointer"
                            onClick={() => setShowProtocols(true)}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-transparent opacity-50"></div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-lime-500 flex items-center gap-1">
                                    <Shield size={12} /> PROTOCOLO ACTIVO
                                </span>
                                <span className="text-xs font-bold text-slate-400">DÍA {activeProtocol.current_day} DE {activeProtocol.duration_days}</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight mb-1">{activeProtocol.name}</h3>
                            <p className="text-xs text-slate-400 font-medium">{activeProtocol.current_phase?.name || 'Fase General'}</p>

                            {/* Detailed Icon */}
                            <div className="absolute right-4 bottom-4 p-2 bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
                                <Info size={16} />
                            </div>
                        </div>
                    ) : (
                        // No Protocol - Call to Action
                        <button
                            onClick={() => setShowProtocols(true)}
                            className="mt-8 w-full bg-slate-800/30 border border-slate-700/50 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-slate-800/50 hover:border-lime-500/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-lime-500 transition-colors">
                                <BookOpen size={24} />
                            </div>
                            <span className="text-sm font-bold text-slate-400 group-hover:text-lime-400 uppercase tracking-wider">Explorar Biblioteca de Protocolos</span>
                        </button>
                    )}
                </div>

                {statusData.needs_electrolytes && (
                    <ElectrolyteAlert onClick={() => setElectrolyteRecipeOpen(true)} />
                )}

                {/* 2. DAILY TIMELINE (New Collapsible Design) */}
                <div>
                    <div
                        className="flex items-center justify-between mb-2 px-2 cursor-pointer hover:bg-slate-800/30 rounded-lg p-2 transition-colors"
                        onClick={() => setTimelineOpen(!timelineOpen)}
                    >
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={16} /> Línea de Tiempo
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="text-[10px] text-slate-600 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                                HOY
                            </div>
                            <div className="text-slate-500">
                                {timelineOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                        </div>
                    </div>

                    <div className={`transition-all duration-300 overflow-hidden ${timelineOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <DailyTimeline
                            history={history}
                            protocolTasks={protocolTasks}
                            onTaskClick={handleProtocolTaskClick}
                            onLogEdit={handleEditClick}
                            onLogDelete={handleDeleteClick}
                        />
                    </div>
                </div>

                {/* 3. QUICK ACTIONS (Grid) */}
                <div>
                    {/* Simplified Header - just a divider/label */}
                    <div className="flex items-center justify-between mb-2 px-2 mt-4">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            Acciones Rápidas
                        </span>
                        {/* Info Toggle */}
                        <button
                            onClick={() => setInfoMode(!infoMode)}
                            className={`p-2 rounded-full transition-all ${infoMode ? 'text-lime-500 bg-lime-500/10' : 'text-slate-600'}`}
                        >
                            <HelpCircle size={16} />
                        </button>
                    </div>

                    <ActionGrid
                        onLogItem={handleLogClick}
                        infoMode={infoMode}
                        onInfoClick={handleInfoClick}
                        onOpenSupplements={() => setSupplementModalOpen(true)}
                    />
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setNoteModalOpen(true)}
                    className="w-14 h-14 bg-lime-500 rounded-full shadow-[0_0_20px_rgba(132,204,22,0.4)] flex items-center justify-center text-slate-900 hover:scale-105 active:scale-95 transition-all"
                >
                    <ClipboardList size={24} strokeWidth={2.5} />
                </button>
            </div>

            {/* --- MODALS --- */}

            {/* Protocol System Modal (Full Screen) */}
            {showProtocols && (
                <div className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto animate-in fade-in duration-200">
                    <div className="max-w-md mx-auto min-h-screen bg-slate-900 relative shadow-2xl">
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
                                <Shield size={20} className="text-lime-500" />
                                Protocolos
                            </h2>
                            <button
                                onClick={() => { setShowProtocols(false); fetchData(); /* Refresh on close */ }}
                                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        {/* Content */}
                        <div className="p-4 pb-20">
                            <ProtocolSystem />
                        </div>
                    </div>
                </div>
            )}

            <CameraModal
                isOpen={cameraModalOpen}
                onClose={() => setCameraModalOpen(false)}
                initialItem={selectedItem}
                onConfirm={handleConfirmLog}
            />

            <InfoModal
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                item={selectedItem}
            />

            <NoteModal
                isOpen={noteModalOpen}
                onClose={() => setNoteModalOpen(false)}
                onConfirm={handleStatusNote}
            />

            <ConfirmationModal
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                title="Atención"
                message={error}
                confirmText="ENTENDIDO"
                onConfirm={() => setErrorModalOpen(false)}
            />

            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, eventId: null })}
                title="¿Eliminar Evento?"
                message="Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este registro?"
                onConfirm={handleConfirmDelete}
                isDestructive={true}
            />

            <EditEventModal
                isOpen={editModalOpen}
                onClose={() => { setEditModalOpen(false); setEditingEvent(null); }}
                event={editingEvent}
                onSave={handleEditSave}
                onDelete={() => handleDeleteClick(editingEvent.id)}
                isLoading={isEditing}
            />

            {/* Refeed Protocol Modal */}
            <RefeedProtocolModal
                isOpen={refeedModalOpen}
                onClose={handleContinueAfterRefeed}
                protocolId={getProtocolId(statusData.hours_elapsed)}
                fastDuration={Math.round(statusData.hours_elapsed)}
            />

            {/* Electrolyte Recipe Modal */}
            <ElectrolyteRecipeModal
                isOpen={electrolyteRecipeOpen}
                onClose={() => setElectrolyteRecipeOpen(false)}
            />

            {/* Protocol Schedule Modal */}
            <ProtocolScheduleModal
                isOpen={protocolScheduleOpen}
                onClose={() => setProtocolScheduleOpen(false)}
            />

            {/* Start Time Edit Modal */}
            <EditTimeModal
                isOpen={editTimeModalOpen}
                onClose={() => setEditTimeModalOpen(false)}
                currentStartTime={statusData.start_time}
                onSave={handleStartTimeUpdate}
                isLoading={isEditing}
            />

            {/* Supplement Checklist Modal */}
            {supplementModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setSupplementModalOpen(false)}>
                    <div className="bg-slate-900/90 w-full max-w-md rounded-[2.5rem] border border-slate-700 shadow-2xl p-6 backdrop-blur-xl relative" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                            <h3 className="text-xl font-black text-slate-50 uppercase tracking-tight flex items-center gap-2">
                                <Pill size={24} className="text-lime-500" /> Suplementación
                            </h3>
                            <button onClick={() => setSupplementModalOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                            <SupplementChecklist onToggle={fetchData} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper for protocol calculation
const getProtocolId = (hours) => {
    if (hours > 168) return 4;
    if (hours > 120) return 3;
    if (hours > 48) return 2;
    if (hours > 24) return 1;
    return null;
};

export default MetabolicDashboard;
