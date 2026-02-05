import React, { useState, useEffect } from 'react';
import metabolicService from '../../../services/metabolicService';
// ... imports
import { CameraModal, NoteModal, ConfirmationModal, NavigationHeader, InfoModal, EditEventModal, FastingInfoModal, ElectrolyteAlert, RecoveryStatusCard, RefeedProtocolModal, ElectrolyteRecipeModal, EditTimeModal, HistoryModal } from '../../../components/MetabolicComponents';
import StatusCircle from '../../../components/metabolic/ui/StatusCircle';
import ActionGrid from '../../../components/metabolic/ui/ActionGrid';
import { Activity, Clock, ClipboardList, Info, HelpCircle, Trash2, Pencil, Droplet, Pill, Apple, Brain, Calendar, Shield, ChevronDown, ChevronUp, BookOpen, X, Plus } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState('PROTOCOLS'); // Active metabolic category tab

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

    const [editTimeModalOpen, setEditTimeModalOpen] = useState(false);
    const [supplementModalOpen, setSupplementModalOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);
    const [history, setHistory] = useState([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, eventId: null });
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

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
                metabolicService.getHistory(100),
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
                rightElement={
                    <button
                        onClick={() => handleLogClick({ name: 'Crear Plato', category: 'COMIDA_REAL' }, 'COMIDA_REAL', true)}
                        className="bg-lime-500 font-bold hover:bg-lime-400 text-slate-900 p-2 rounded-full transition-colors shadow-lg shadow-lime-500/20 active:scale-95 flex items-center justify-center"
                    >
                        <Plus size={24} />
                    </button>
                }
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

                    {/* 5. METABOLIC SECTIONS (New Tabbed Design) */}
                    <div className="space-y-6">
                        {/* Tab Bar */}
                        <div className="flex justify-between items-center bg-slate-800/20 p-2 rounded-[2rem] border border-slate-800/50 backdrop-blur-sm mx-1 shadow-inner">
                            {[
                                { id: 'PROTOCOLS', label: 'Protocolo', icon: Shield, color: 'text-lime-500', bg: 'bg-lime-500/10' },
                                { id: 'NUTRITION', label: 'Nutrición', icon: Apple, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                                { id: 'SUPPLEMENTS', label: 'Suplementos', icon: Pill, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                                { id: 'HYDRATION', label: 'Hidratación', icon: Droplet, color: 'text-amber-500', bg: 'bg-amber-500/10' }
                            ].map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative flex flex-col items-center justify-center py-4 rounded-3xl transition-all duration-300 gap-2 flex-1
                                        ${isActive ? `${tab.bg} ${tab.color} scale-100 shadow-lg` : 'text-slate-500 hover:text-slate-300 scale-90'}
                                    `}
                                    >
                                        <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                            {tab.label}
                                        </span>
                                        {isActive && (
                                            <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${tab.color.replace('text-', 'bg-')}`}></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[200px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {activeTab === 'PROTOCOLS' && (
                                <div className="space-y-4">
                                    {activeProtocol ? (
                                        <div
                                            className="bg-slate-800/40 border border-slate-700/50 rounded-[2rem] p-6 backdrop-blur-md relative overflow-hidden group hover:border-lime-500/30 transition-all cursor-pointer shadow-xl shadow-black/20"
                                            onClick={() => setShowProtocols(true)}
                                        >
                                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                                <Shield size={120} className="text-lime-500" />
                                            </div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500 flex items-center gap-2 bg-lime-500/10 px-3 py-1 rounded-full">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></div>
                                                    En Curso
                                                </span>
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">DÍA {activeProtocol.current_day}/{activeProtocol.duration_days}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-50 uppercase tracking-tight mb-2 line-clamp-1">{activeProtocol.name}</h3>
                                            <p className="text-xs text-slate-400 font-medium mb-6">{activeProtocol.current_phase?.name || 'Fase General'}</p>

                                            <div className="flex items-center gap-3">
                                                <button className="flex-1 py-3 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]">
                                                    Gestionar Protocolo
                                                </button>
                                                <button className="p-3 bg-slate-800 text-slate-400 rounded-2xl hover:text-white transition-colors">
                                                    <Info size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowProtocols(true)}
                                            className="w-full bg-slate-800/20 border border-slate-700/50 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 hover:bg-slate-800/40 hover:border-lime-500/30 transition-all group shadow-inner"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-lime-500 transition-all group-hover:scale-110 shadow-lg">
                                                <BookOpen size={32} />
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-sm font-black text-slate-300 uppercase tracking-widest mb-1">Biblioteca de Protocolos</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Explora y activa tu plan metabólico</span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            )}

                            {activeTab === 'NUTRITION' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center px-4">
                                        <h4 className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.2em]">Opciones Nutricionales</h4>
                                        <HelpCircle
                                            size={14}
                                            className={`${infoMode ? 'text-lime-500' : 'text-slate-600'} cursor-pointer hover:text-white transition-colors`}
                                            onClick={() => setInfoMode(!infoMode)}
                                        />
                                    </div>
                                    <ActionGrid
                                        onLogItem={handleLogClick}
                                        infoMode={infoMode}
                                        onInfoClick={handleInfoClick}
                                        categoryFilter="NUTRITION"
                                    />
                                </div>
                            )}

                            {activeTab === 'SUPPLEMENTS' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center px-4">
                                        <h4 className="text-[10px] font-black text-sky-500/60 uppercase tracking-[0.2em]">Suplementación Diaria</h4>
                                    </div>
                                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-[2.5rem] p-8 text-center backdrop-blur-sm">
                                        <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sky-500 shadow-lg shadow-sky-500/5">
                                            <Pill size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-50 uppercase tracking-tight mb-2">Checklist Activa</h3>
                                        <p className="text-xs text-slate-400 font-medium mb-8 max-w-[200px] mx-auto">Registra tus tomas de sales y suplementos del día.</p>
                                        <button
                                            onClick={() => setSupplementModalOpen(true)}
                                            className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-sky-500/20 uppercase tracking-widest text-[10px]"
                                        >
                                            Abrir Checklist
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'HYDRATION' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center px-4">
                                        <h4 className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.2em]">Hidratación y Sales</h4>
                                        <HelpCircle
                                            size={14}
                                            className={`${infoMode ? 'text-lime-500' : 'text-slate-600'} cursor-pointer hover:text-white transition-colors`}
                                            onClick={() => setInfoMode(!infoMode)}
                                        />
                                    </div>
                                    <ActionGrid
                                        onLogItem={handleLogClick}
                                        infoMode={infoMode}
                                        onInfoClick={handleInfoClick}
                                        categoryFilter="HYDRATION"
                                    />
                                </div>
                            )}
                        </div>
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
                {/* 7. History Modal */}
                <HistoryModal
                    isOpen={historyModalOpen}
                    onClose={() => setHistoryModalOpen(false)}
                    history={history}
                    onLogEdit={(log) => {
                        handleEditClick(log);
                        setHistoryModalOpen(false); // Close list to focus on edit
                    }}
                />
            </div>
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
