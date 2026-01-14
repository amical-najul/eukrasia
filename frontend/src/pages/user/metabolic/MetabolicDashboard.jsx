import React, { useState, useEffect } from 'react';
import metabolicService from '../../../services/metabolicService';
import { StatusCircle, ActionGrid, CameraModal, NoteModal, ConfirmationModal, NavigationHeader, InfoModal } from '../../../components/MetabolicComponents';
import { Activity, Clock, Utensils, ClipboardList, Info, HelpCircle, Trash2 } from 'lucide-react';

import { useLocation } from 'react-router-dom';

const MetabolicDashboard = () => {
    const location = useLocation();
    const [statusData, setStatusData] = useState({
        status: 'UNKNOWN',
        phase: 'Cargando...',
        phaseColor: 'gray',
        hours_elapsed: 0
    });
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'NUTRITION');
    const [infoMode, setInfoMode] = useState(false); // Toggle for Info Mode

    // Modals State
    const [cameraModalOpen, setCameraModalOpen] = useState(false);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false); // Generic Error Alert
    const [error, setError] = useState(null); // Specific error message for modals

    const [selectedItem, setSelectedItem] = useState(null);
    const [history, setHistory] = useState([]);

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
        setSelectedItem({ ...item, category, is_fasting_breaker: breaker });

        if (category === 'COMIDA_REAL') {
            // Nutrition always needs Camera
            setCameraModalOpen(true);
        } else {
            // Hydration/Supplements -> Immediate Log
            // We can confirm silently or show a mini toast. For now, just log.
            await handleConfirmLog({
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
            await metabolicService.logEvent({
                event_type: 'NOTA_ESTADO',
                notes: note
            });
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

    return (
        <div className="min-h-screen bg-gray-900 pb-20">
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
                    className={`flex-1 pb-4 text-sm font-bold tracking-widest uppercase transition-colors ${activeTab === 'NUTRITION' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-600'}`}
                >
                    <span className="flex items-center justify-center gap-2"><Utensils size={16} /> Nutrición</span>
                </button>
                <button
                    onClick={() => setActiveTab('FASTING')}
                    className={`flex-1 pb-4 text-sm font-bold tracking-widest uppercase transition-colors ${activeTab === 'FASTING' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-600'}`}
                >
                    <span className="flex items-center justify-center gap-2"><Clock size={16} /> Estado Ayuno</span>
                </button>
            </div>

            {/* Content */}
            <div className="p-6 relative">
                {activeTab === 'FASTING' ? (
                    <StatusCircle statusData={statusData} />
                ) : (
                    <>
                        {/* Info Mode Toggle */}
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setInfoMode(!infoMode)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                                    ${infoMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-800 text-gray-400 hover:text-white'}
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
                                className="flex items-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-full text-gray-300 font-bold hover:bg-gray-700 transition-colors"
                            >
                                <ClipboardList size={18} />
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
                        <div key={item.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3 border border-gray-700/50 group">
                            {item.image_url ? (
                                <img src={item.image_url} alt="Log" className="w-10 h-10 rounded-md object-cover bg-gray-700" />
                            ) : (
                                <div className="w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center text-xs text-gray-500 border border-gray-700">
                                    {(item.item_name || 'Event').substring(0, 2)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{item.item_name}</p>
                                <p className="text-gray-500 text-xs flex items-center gap-2">
                                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {item.notes && <span className="text-gray-400 italic truncate max-w-[150px]">- {item.notes}</span>}
                                </p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${item.is_fasting_breaker ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                            <button
                                onClick={() => handleDeleteEvent(item.id)}
                                className="p-1.5 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Eliminar evento"
                            >
                                <Trash2 size={16} />
                            </button>
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
                title="Error"
                message="No se pudo registrar el evento. Por favor intenta de nuevo."
                isDestructive={true}
                onConfirm={() => setErrorModalOpen(false)}
            />
        </div>
    );
};

export default MetabolicDashboard;
