import React, { useState, useEffect } from 'react';
import metabolicService from '../../../services/metabolicService';
import { StatusCircle, ActionGrid, CameraModal, NoteModal, ConfirmationModal, NavigationHeader, InfoModal, EditEventModal, FastingInfoModal, ElectrolyteAlert, RecoveryStatusCard, RefeedProtocolModal } from '../../../components/MetabolicComponents';
import { Activity, Clock, Utensils, ClipboardList, Info, HelpCircle, Trash2, Pencil } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'NUTRITION');
    const [infoMode, setInfoMode] = useState(false); // Toggle for Info Mode

    // Modals State
    const [cameraModalOpen, setCameraModalOpen] = useState(false);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [fastingInfoOpen, setFastingInfoOpen] = useState(false);
    const [refeedModalOpen, setRefeedModalOpen] = useState(false);
    const [pendingItem, setPendingItem] = useState(null); // Item to log after protocol review
    const [errorModalOpen, setErrorModalOpen] = useState(false); // Generic Error Alert
    const [error, setError] = useState(null); // Specific error message for modals

    const [selectedItem, setSelectedItem] = useState(null);
    const [history, setHistory] = useState([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch Initial Data
    const fetchData = async () => {
        try {
            const status = await metabolicService.getStatus();
            setStatusData(status);

            const hist = await metabolicService.getHistory(5);
            setHistory(hist);
        } catch (err) {
            console.error('Failed to fetch metabolic data', err);
            setError('No se pudieron cargar los datos iniciales.');
            setErrorModalOpen(true);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    // Handlers
    const handleLogClick = async (item, category, breaker) => {
        // Intercept if breaking a long fast (>24h)
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
        setSelectedItem(item);
        setInfoModalOpen(true);
    };

    const handleConfirmLog = async (data) => {
        try {
            const formData = new FormData();
            formData.append('event_type', 'CONSUMO');
            formData.append('category', data.category);
            formData.append('item_name', data.name || data.item_name); // Handle if passed differently
            formData.append('is_fasting_breaker', data.is_fasting_breaker);
            if (data.notes) formData.append('notes', data.notes);
            if (data.image) formData.append('image', data.image);

            await metabolicService.logEvent(formData);
            await fetchData();
        } catch (err) {
            console.error('Log failed', err);
            setError('No se pudo registrar el evento. Por favor intenta de nuevo.');
            setErrorModalOpen(true);
        }
    };

    const handleStatusNote = async (note) => {
        try {
            const formData = new FormData();
            formData.append('event_type', 'SINTOMA'); // Changed from 'NOTA_ESTADO' which is not a valid DB enum
            formData.append('item_name', 'Estado Subjetivo');
            formData.append('category', 'ESTADO');
            formData.append('is_fasting_breaker', 'false'); // Send as string for FormData compatibility
            formData.append('notes', note);

            await metabolicService.logEvent(formData);
            setNoteModalOpen(false);
            await fetchData();
        } catch (err) {
            console.error('Note log failed', err);
            setError('No se pudo registrar la nota. Por favor intenta de nuevo.');
            setErrorModalOpen(true);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('¿Eliminar este evento?')) return;

        try {
            await metabolicService.deleteEvent(eventId);
            await fetchData(); // Refresh history
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
            await fetchData(); // Refresh history
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
                subtitle="Registro de alta precisión"
                icon={Activity}
            />

            {/* Tabs */}
            <div className="flex border-b border-gray-800 px-6">
                <button
                    onClick={() => setActiveTab('NUTRITION')}
                    className={`flex-1 pb-4 text-sm font-bold tracking-widest uppercase transition-colors ${activeTab === 'NUTRITION' ? 'text-white border-b-2 border-lime-500' : 'text-slate-500'}`}
                >
                    <span className="flex items-center justify-center gap-2"><Utensils size={16} /> Nutrición</span>
                </button>
                <button
                    onClick={() => setActiveTab('FASTING')}
                    className={`flex-1 pb-4 text-sm font-bold tracking-widest uppercase transition-colors ${activeTab === 'FASTING' ? 'text-white border-b-2 border-lime-500' : 'text-slate-500'}`}
                >
                    <span className="flex items-center justify-center gap-2"><Clock size={16} /> Estado Ayuno</span>
                </button>
            </div>

            {/* Content */}
            <div className="p-6 relative">
                {activeTab === 'FASTING' ? (
                    <>
                        <StatusCircle
                            statusData={statusData}
                            onClick={() => setFastingInfoOpen(true)}
                        />

                        {statusData.needs_electrolytes && <ElectrolyteAlert />}

                        {/* "Registrar Estado" Floating/Inline Action for Fasting */}
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => setNoteModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 rounded-full text-slate-300 font-black hover:bg-slate-700 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                            >
                                <ClipboardList size={18} className="text-lime-500" />
                                REGISTRAR NOTA / ESTADO
                            </button>
                        </div>

                        <FastingInfoModal
                            isOpen={fastingInfoOpen}
                            onClose={() => setFastingInfoOpen(false)}
                            currentPhase={statusData.phase}
                            hoursElapsed={statusData.hours_elapsed}
                        />
                    </>
                ) : (
                    <>
                        {statusData.refeed_status && (
                            <RecoveryStatusCard refeedStatus={statusData.refeed_status} />
                        )}

                        {/* Info Mode Toggle */}
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setInfoMode(!infoMode)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                                    ${infoMode ? 'bg-lime-600 text-slate-900 shadow-lg shadow-lime-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'}
                                `}
                            >
                                <HelpCircle size={14} />
                                {infoMode ? 'Modo Información ACTIVO' : 'Activar Ayuda'}
                            </button>
                        </div>

                        <ActionGrid
                            onLogItem={handleLogClick}
                            infoMode={infoMode}
                            onInfoClick={handleInfoClick}
                        />

                        {/* "Registrar Estado" Floating/Inline Action */}
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => setNoteModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 rounded-full text-slate-300 font-black hover:bg-slate-700 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                            >
                                <ClipboardList size={18} className="text-lime-500" />
                                REGISTRAR NOTA / ESTADO
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Recent History (Mini) */}
            <div className="px-6 mb-10">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 text-center">Últimos Eventos</h3>
                <div className="space-y-3">
                    {history.map(item => (
                        <div key={item.id} className="bg-slate-800/40 rounded-2xl p-4 flex items-center gap-4 border border-slate-700/30 group hover:bg-slate-800/60 transition-all backdrop-blur-sm shadow-lg">
                            {item.image_url ? (
                                <img src={item.image_url} alt="Log" className="w-12 h-12 rounded-xl object-cover bg-slate-700 ring-2 ring-slate-700/50" />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-700 uppercase tracking-tighter">
                                    {(item.item_name || 'EV').substring(0, 2)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-50 text-sm font-black font-ui truncate tracking-tight">{item.item_name}</p>
                                <p className="text-slate-500 text-[10px] font-bold flex items-center gap-2 tracking-wide">
                                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {item.notes && <span className="text-slate-400 italic font-medium truncate max-w-[150px]">- {item.notes}</span>}
                                </p>
                            </div>
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${item.is_fasting_breaker ? 'text-rose-500 bg-rose-500' : 'text-emerald-500 bg-emerald-500'}`}></div>
                            <div className="flex items-center transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                                <button
                                    onClick={() => handleEditClick(item)}
                                    className="p-2 text-slate-500 hover:text-lime-500 transition-colors"
                                    title="Editar evento"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteEvent(item.id)}
                                    className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                                    title="Eliminar evento"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && <p className="text-center text-gray-600 text-sm">Sin registros recientes.</p>}
                </div>
            </div>

            {/* Modals */}
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

            <EditEventModal
                isOpen={editModalOpen}
                onClose={() => { setEditModalOpen(false); setEditingEvent(null); }}
                event={editingEvent}
                onSave={handleEditSave}
                isLoading={isEditing}
            />

            {/* Refeed Protocol Modal */}
            <RefeedProtocolModal
                isOpen={refeedModalOpen}
                onClose={handleContinueAfterRefeed}
                protocolId={getProtocolId(statusData.hours_elapsed)}
                fastDuration={Math.round(statusData.hours_elapsed)}
            />
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
