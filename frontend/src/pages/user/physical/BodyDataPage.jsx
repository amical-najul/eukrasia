import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Plus, Activity, Calendar, Scale, Edit2, Info, ArrowRight, TrendingUp, AlertCircle, Check, Trash2 } from 'lucide-react';
import BloodPressureChart from '../../../components/stats/BloodPressureChart';
import SingleMetricChart from '../../../components/stats/SingleMetricChart';
import bodyService from '../../../services/bodyService';
import { NavigationHeader } from '../../../components/MetabolicComponents';

// Validation ranges for health metrics
const VALIDATION_RULES = {
    BP_SYS: { min: 70, max: 250, label: 'Sistólica' },
    BP_DIA: { min: 40, max: 150, label: 'Diastólica' },
    HEART_RATE: { min: 30, max: 220, label: 'Ritmo Cardíaco' },
    GLUCOSE: { min: 20, max: 600, label: 'Glucosa' },
    WEIGHT: { min: 20, max: 350, label: 'Peso' },
    HEIGHT: { min: 50, max: 250, label: 'Altura' },
};

const validateValue = (type, value) => {
    if (!value || value === '') return { valid: true, error: null }; // Empty is ok (optional)
    const numVal = parseFloat(value);
    const rule = VALIDATION_RULES[type];
    if (!rule) return { valid: true, error: null };
    if (isNaN(numVal)) return { valid: false, error: 'Valor inválido' };
    if (numVal < rule.min || numVal > rule.max) {
        return { valid: false, error: `${rule.label}: ${rule.min}-${rule.max}` };
    }
    return { valid: true, error: null };
};

// Toast Component for feedback
const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300
            ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm">{message}</span>
        </div>
    );
};

// Confirmation Modal Component to replace native window.confirm
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">{title || '¿Estás seguro?'}</h3>
                <p className="text-slate-400 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * BodyDataPage
 * Tracks Weight and Body Measurements
 */
const formatRelativeDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

    if (diffDays === 0) return `${dateStr}, hoy`;
    if (diffDays === 1) return `${dateStr}, ayer`;
    return `${dateStr}, hace ${diffDays} días`;
};

const BodyDataPage = () => {
    const [activeTab, setActiveTab] = useState('WEIGHT'); // 'WEIGHT' | 'MEASUREMENT' | 'HEALTH'
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [healthHistory, setHealthHistory] = useState({ bp: [], heartRate: [], glucose: [] });
    const [historyPeriod, setHistoryPeriod] = useState('week'); // week, month, year
    const [correctWeightOpen, setCorrectWeightOpen] = useState(false);
    const [correctBPOpen, setCorrectBPOpen] = useState(false);
    const [correctHROpen, setCorrectHROpen] = useState(false);
    const [correctGlucoseOpen, setCorrectGlucoseOpen] = useState(false);
    const [weightHistoryModalOpen, setWeightHistoryModalOpen] = useState(false);
    const [healthHistoryModalOpen, setHealthHistoryModalOpen] = useState(false);
    const [historyMetric, setHistoryMetric] = useState(null); // 'GLUCOSE' | 'HEART_RATE' | 'BP'
    const [editingWeight, setEditingWeight] = useState(null);
    const [editingMeasurement, setEditingMeasurement] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [editGoalModalOpen, setEditGoalModalOpen] = useState(false);
    const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
    const [healthLogModalOpen, setHealthLogModalOpen] = useState(false);
    const [selectedMeasurement, setSelectedMeasurement] = useState(null); // For logging specific part

    // Measurement Chart State
    const [measurementHistory, setMeasurementHistory] = useState([]);
    const [visibleLines, setVisibleLines] = useState({ CHEST: true, WAIST: true, HIPS: false, THIGH: false });


    // Toast feedback
    const [toast, setToast] = useState(null); // { message, type }
    const showToast = (message, type = 'success') => setToast({ message, type });

    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
    const showConfirmModal = (title, message, onConfirm) => setConfirmModal({ open: true, title, message, onConfirm });
    const closeConfirmModal = () => setConfirmModal({ ...confirmModal, open: false });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [historyPeriod, activeTab]);

    const fetchData = async () => {
        try {
            const data = await bodyService.getSummary();
            setSummary(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        if (!summary) return;
        try {
            if (activeTab === 'HEALTH') {
                // Fetch datasets for BP, HR, Glucose
                const [bpSysData, bpDiaData, hrData, glData] = await Promise.all([
                    bodyService.getHistory({ period: historyPeriod, type: 'measurement', subtype: 'BP_SYS' }),
                    bodyService.getHistory({ period: historyPeriod, type: 'measurement', subtype: 'BP_DIA' }),
                    bodyService.getHistory({ period: historyPeriod, type: 'measurement', subtype: 'HEART_RATE' }),
                    bodyService.getHistory({ period: historyPeriod, type: 'measurement', subtype: 'GLUCOSE' })
                ]);

                // Proces BP Data (Merging Sys + Dia)
                const bpMap = {};
                bpSysData.forEach(d => {
                    const dateStr = new Date(d.recorded_at).toDateString();
                    if (!bpMap[dateStr]) bpMap[dateStr] = { date: d.recorded_at };
                    bpMap[dateStr].systolic = parseFloat(d.value);
                });
                bpDiaData.forEach(d => {
                    const dateStr = new Date(d.recorded_at).toDateString();
                    if (!bpMap[dateStr]) bpMap[dateStr] = { date: d.recorded_at };
                    bpMap[dateStr].diastolic = parseFloat(d.value);
                });

                setHealthHistory({
                    bp: Object.values(bpMap).sort((a, b) => new Date(a.date) - new Date(b.date)),
                    heartRate: hrData.map(d => ({ date: d.recorded_at, value: parseFloat(d.value) })),
                    glucose: glData.map(d => ({ date: d.recorded_at, value: parseFloat(d.value) }))
                });

            } else if (activeTab === 'MEASUREMENT') {
                const [chest, waist, hips, thigh] = await Promise.all([
                    bodyService.getHistory({ period: historyPeriod, type: 'measurement', subtype: 'CHEST' }),
                    bodyService.getHistory({ period: historyPeriod, type: 'measurement', subtype: 'WAIST' }),
                    bodyService.getHistory({ period: historyPeriod, type: 'measurement', subtype: 'HIPS' }),
                    bodyService.getHistory({ period: historyPeriod, type: 'measurement', subtype: 'THIGH' }),
                ]);

                // Merge data by date for Recharts
                const mergedData = {};
                [...chest, ...waist, ...hips, ...thigh].forEach(item => {
                    const date = new Date(item.recorded_at).toLocaleDateString();
                    if (!mergedData[date]) mergedData[date] = { date, originalDate: item.recorded_at };
                    mergedData[date][item.measurement_type] = parseFloat(item.value);
                });

                setMeasurementHistory(Object.values(mergedData).sort((a, b) => new Date(a.originalDate) - new Date(b.originalDate)));
            } else {
                // Weight History
                const data = await bodyService.getHistory({ period: historyPeriod, type: 'weight' });
                setHistory(data.map(d => ({ ...d, date: new Date(d.recorded_at).toLocaleDateString() })));
            }
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };


    // --- Helper Functions ---
    const getBMIColor = (cat) => {
        if (!cat) return 'bg-gray-500';
        const colorMap = {
            'blue': 'bg-blue-500', 'green': 'bg-emerald-500', 'yellow': 'bg-yellow-500',
            'orange': 'bg-orange-500', 'red': 'bg-rose-500', 'darkred': 'bg-red-800'
        };
        return colorMap[cat.color] || 'bg-gray-500';
    };

    const getBMIWidth = (val) => {
        // Map BMI 15-40 to 0-100%
        const min = 15, max = 40;
        let pct = ((val - min) / (max - min)) * 100;
        if (pct < 0) pct = 0; if (pct > 100) pct = 100;
        return `${pct}%`;
    };

    const handleSaveBodyMetrics = async (weight, height, date, gender) => {
        try {
            if (weight) await bodyService.logWeight(weight, '', date || new Date());
            if (height) await bodyService.logMeasurement('HEIGHT', height, 'cm', '', date || new Date());

            setLogModalOpen(false);
            showToast('Datos guardados correctamente');
            fetchData();
            fetchHistory();
        } catch (error) {
            console.error("Error saving body metrics:", error);
            showToast('Error al guardar datos', 'error');
        }
    };

    const handleCorrectWeight = async (newVal) => {
        try {
            if (!summary?.weight?.id) return;
            await bodyService.updateWeight(summary.weight.id, newVal, '', summary.weight.recorded_at);
            setCorrectWeightOpen(false);
            showToast('Peso corregido');
            fetchData();
        } catch (error) {
            console.error("Error updating weight:", error);
            showToast('Error al corregir peso', 'error');
        }
    };

    const handleDeleteWeight = async (weightId) => {
        try {
            await bodyService.deleteWeight(weightId);
            showToast('Registro eliminado');
            fetchData();
            fetchHistory();
        } catch (error) {
            console.error('Error deleting weight:', error);
            showToast('Error al eliminar', 'error');
        }
    };

    const handleUpdateWeight = async (id, value, date) => {
        try {
            await bodyService.updateWeight(id, value, '', date);
            setEditingWeight(null);
            showToast('Registro actualizado');
            fetchData();
            fetchHistory();
        } catch (error) {
            console.error('Error updating weight:', error);
            showToast('Error al actualizar', 'error');
        }
    };

    const handleCorrectBP = async (sysVal, diaVal) => {
        try {
            const sysId = summary?.measurements['BP_SYS']?.id;
            const diaId = summary?.measurements['BP_DIA']?.id;
            if (!sysId || !diaId) return;

            await Promise.all([
                bodyService.updateMeasurement(sysId, String(sysVal).replace(',', '.')),
                bodyService.updateMeasurement(diaId, String(diaVal).replace(',', '.'))
            ]);

            setCorrectBPOpen(false);
            setSummary(prev => ({
                ...prev,
                measurements: {
                    ...prev.measurements,
                    BP_SYS: { ...prev.measurements.BP_SYS, value: sysVal },
                    BP_DIA: { ...prev.measurements.BP_DIA, value: diaVal }
                }
            }));
            fetchHistory();
            showToast('Presión arterial corregida');
        } catch (error) {
            console.error('Error correcting BP:', error);
            showToast('Error al corregir', 'error');
        }
    };

    const handleCorrectHR = async (val) => {
        try {
            const id = summary?.measurements['HEART_RATE']?.id;
            if (!id) return;
            const cleanVal = String(val).replace(',', '.');
            await bodyService.updateMeasurement(id, cleanVal);
            setCorrectHROpen(false);
            setSummary(prev => ({
                ...prev,
                measurements: {
                    ...prev.measurements,
                    HEART_RATE: { ...prev.measurements.HEART_RATE, value: val }
                }
            }));
            fetchHistory();
            showToast('Ritmo cardíaco corregido');
        } catch (error) {
            console.error('Error correcting HR:', error);
            showToast('Error al corregir', 'error');
        }
    };

    const handleCorrectGlucose = async (val) => {
        try {
            const id = summary?.measurements['GLUCOSE']?.id;
            if (!id) return;
            const cleanVal = String(val).replace(',', '.');
            await bodyService.updateMeasurement(id, cleanVal);
            setCorrectGlucoseOpen(false);
            setSummary(prev => ({
                ...prev,
                measurements: {
                    ...prev.measurements,
                    GLUCOSE: { ...prev.measurements.GLUCOSE, value: val }
                }
            }));
            fetchHistory();
            showToast('Glucosa corregida');
        } catch (error) {
            console.error('Error correcting Glucose:', error);
            showToast('Error al corregir', 'error');
        }
    };

    const handleDeleteBP = async () => {
        try {
            const sysId = summary?.measurements['BP_SYS']?.id;
            const diaId = summary?.measurements['BP_DIA']?.id;
            if (!sysId || !diaId) return;

            showConfirmModal(
                "¿Eliminar registro?",
                "¿Seguro que deseas eliminar el último registro de presión arterial?",
                async () => {
                    await Promise.all([
                        bodyService.deleteMeasurement(sysId),
                        bodyService.deleteMeasurement(diaId)
                    ]);
                    setCorrectBPOpen(false);
                    fetchData();
                    fetchHistory();
                    showToast('Registro eliminado');
                }
            );
        } catch (error) {
            console.error(error);
            showToast('Error al eliminar', 'error');
        }
    };

    const handleDeleteHR = async () => {
        try {
            const id = summary?.measurements['HEART_RATE']?.id;
            if (!id) return;

            showConfirmModal(
                "¿Eliminar registro?",
                "¿Seguro que deseas eliminar el último registro de ritmo cardíaco?",
                async () => {
                    await bodyService.deleteMeasurement(id);
                    setCorrectHROpen(false);
                    fetchData();
                    fetchHistory();
                    showToast('Registro eliminado');
                }
            );
        } catch (error) {
            console.error(error);
            showToast('Error al eliminar', 'error');
        }
    };

    const handleDeleteGlucose = async () => {
        try {
            const id = summary?.measurements['GLUCOSE']?.id;
            if (!id) return;

            showConfirmModal(
                "¿Eliminar registro?",
                "¿Seguro que deseas eliminar el último registro de glucosa?",
                async () => {
                    await bodyService.deleteMeasurement(id);
                    setCorrectGlucoseOpen(false);
                    fetchData();
                    fetchHistory();
                    showToast('Registro eliminado');
                }
            );
        } catch (error) {
            console.error(error);
            showToast('Error al eliminar', 'error');
        }
    };

    const handleDeleteBodyMeasurement = async () => {
        if (!selectedMeasurement) return;
        const measurementId = summary?.measurements[selectedMeasurement]?.id;
        if (!measurementId) {
            showToast('No hay registro para eliminar', 'error');
            return;
        }
        try {
            await bodyService.deleteMeasurement(measurementId);
            setMeasurementModalOpen(false);
            showToast('Registro eliminado');
            fetchData();
        } catch (error) {
            console.error('Error deleting measurement:', error);
            showToast('Error al eliminar', 'error');
        }
    };

    const handleSetGoal = async (target) => {
        try {
            const startW = summary.goal?.start_weight || summary.weight?.weight || target;
            await bodyService.setGoal(startW, target, new Date(), null);
            setEditGoalModalOpen(false);
            showToast('Objetivo actualizado');
            fetchData();
        } catch (error) {
            console.error("Error setting goal:", error);
            showToast('Error al guardar objetivo', 'error');
        }
    };

    const handleSaveHealthMetrics = async (bpSys, bpDia, heartRate, glucose, date, isFasting) => {
        try {
            if (bpSys && bpDia) {
                await bodyService.logMeasurement('BP_SYS', bpSys, 'mmHg', '', date || new Date());
                await bodyService.logMeasurement('BP_DIA', bpDia, 'mmHg', '', date || new Date());
            }
            if (heartRate) await bodyService.logMeasurement('HEART_RATE', heartRate, 'bpm', '', date || new Date(), isFasting);
            if (glucose) await bodyService.logMeasurement('GLUCOSE', glucose, 'mg/dL', '', date || new Date(), isFasting);

            setHealthLogModalOpen(false);
            showToast('Datos de salud guardados');
            fetchData();
            fetchHistory();
        } catch (error) {
            console.error("Error saving health metrics:", error);
            showToast('Error al guardar datos de salud', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-20 font-ui text-slate-100 selection:bg-lime-500/30">
            <NavigationHeader title="Datos del Cuerpo" subtitle="Seguimiento Biométrico" icon={Activity} />

            {/* TABS */}
            <div className="px-6 mb-6">
                <div className="bg-slate-900/50 p-1 rounded-2xl flex border border-slate-800 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('WEIGHT')}
                        className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'WEIGHT' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Peso
                    </button>
                    <button
                        onClick={() => setActiveTab('MEASUREMENT')}
                        className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'MEASUREMENT' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Medición
                    </button>
                    <button
                        onClick={() => setActiveTab('HEALTH')}
                        className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'HEALTH' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Salud
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500 animate-pulse">Cargando datos...</div>
            ) : (
                <div className="px-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* === WEIGHT TAB === */}
                    {activeTab === 'WEIGHT' && (
                        <>
                            {/* Latest Weight Card */}
                            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <Scale size={100} className="text-slate-800/50 -rotate-12 transform translate-x-4 -translate-y-4" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 flex justify-between items-center">
                                        <span>Último Peso</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setWeightHistoryModalOpen(true)}
                                                className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all flex items-center gap-1.5 border border-slate-700"
                                            >
                                                <Calendar size={12} className="text-lime-500" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Historial</span>
                                            </button>
                                            <span className="text-[10px] font-medium text-slate-500 lowercase tracking-normal bg-slate-800/50 px-2 py-1 rounded-full">
                                                {formatRelativeDate(summary?.weight?.recorded_at)}
                                            </span>
                                        </div>
                                    </h3>
                                    <div
                                        onClick={() => summary?.weight?.id && setCorrectWeightOpen(true)}
                                        className="text-5xl font-black text-white mb-4 tracking-tighter cursor-pointer hover:scale-105 transition-transform origin-left decoration-lime-500/30 decoration-2 underline-offset-4 hover:underline"
                                        title="Click para corregir"
                                    >
                                        {summary?.weight?.weight || '--'} <span className="text-2xl text-slate-500 font-bold">kg</span>
                                        {summary?.weight?.id && <Edit2 size={16} className="inline ml-3 text-slate-600 mb-4" />}
                                    </div>
                                    <div className="bg-slate-800/80 rounded-2xl p-4 mb-6 backdrop-blur-sm border border-slate-700/50">
                                        <p className="text-slate-300 text-sm font-medium leading-relaxed">
                                            "El progreso no es lineal, pero la consistencia sí lo es. ¡Sigue así!"
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setLogModalOpen(true)}
                                        className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl transition-all shadow-lg shadow-lime-500/20 active:scale-95 uppercase tracking-widest text-sm"
                                    >
                                        Actualizar Peso
                                    </button>
                                </div>
                            </div>

                            {/* Goal Card */}
                            <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-lg">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-slate-100 font-bold text-lg">Objetivo</h3>
                                    <button onClick={() => setEditGoalModalOpen(true)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                </div>

                                {summary?.goal ? (
                                    <>
                                        {/* Progress Bar */}
                                        <div className="relative h-4 bg-slate-800 rounded-full mb-2 overflow-hidden">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000"
                                                style={{ width: `${Math.max(0, Math.min(100, ((summary.goal.start_weight - summary?.weight?.weight) / (summary.goal.start_weight - summary.goal.target_weight)) * 100))}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                                            <span>Inicio: {summary.goal.start_weight}kg</span>
                                            <div className="text-right">
                                                <span>Meta: {summary.goal.target_weight}kg</span>
                                                {summary.goal.target_date && <span className="block text-[8px] text-slate-600 font-medium normal-case tracking-normal">para el {new Date(summary.goal.target_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-slate-500 text-sm mb-4">No has definido un objetivo.</p>
                                        <button onClick={() => setEditGoalModalOpen(true)} className="text-amber-500 text-xs font-black uppercase tracking-widest border-b border-amber-500 pb-0.5">Definir Meta</button>
                                    </div>
                                )}
                            </div>

                            {/* BMI Card */}
                            {summary?.bmi ? (
                                <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">IMC (kg/m²)</h3>
                                            <div className="text-4xl font-black text-white">{summary.bmi.value}</div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${getBMIColor(summary.bmi)} text-white shadow-lg`}>
                                            {summary.bmi.category}
                                        </div>
                                    </div>
                                    {/* BMI Scale Visual */}
                                    <div className="relative h-2 bg-slate-800 rounded-full mt-4 overflow-hidden flex gap-1">
                                        <div className="flex-1 bg-blue-500 opacity-30"></div>
                                        <div className="flex-1 bg-emerald-500 opacity-30"></div>
                                        <div className="flex-1 bg-yellow-500 opacity-30"></div>
                                        <div className="flex-1 bg-orange-500 opacity-30"></div>
                                        <div className="flex-1 bg-rose-500 opacity-30"></div>
                                        {/* Marker */}
                                        <div
                                            className="absolute top-0 w-1 h-full bg-white shadow-[0_0_10px_white] z-10 transition-all duration-1000"
                                            style={{ left: getBMIWidth(summary.bmi.value) }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                                        <span>15</span><span>18.5</span><span>25</span><span>30</span><span>35</span><span>40</span>
                                    </div>
                                </div>
                            ) : !summary?.height ? (
                                <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/50 transition-colors group"
                                    onClick={() => setLogModalOpen(true)}>
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Info size={24} className="text-amber-500" />
                                    </div>
                                    <h3 className="text-slate-300 font-bold mb-1">Configurar Altura</h3>
                                    <p className="text-xs text-slate-500 max-w-[200px]">
                                        Ingresa tu altura para calcular tu Índice de Masa Corporal (IMC).
                                    </p>
                                </div>
                            ) : null}

                            {/* History Chart */}
                            <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-lg">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-slate-100 font-bold text-lg">Historial</h3>
                                    <div className="flex bg-slate-800 rounded-lg p-0.5">
                                        {['week', 'month', 'year'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setHistoryPeriod(p)}
                                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${historyPeriod === p ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                {p === 'week' ? 'Sem' : p === 'month' ? 'Mes' : 'Año'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={history}>
                                            <defs>
                                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 10 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                hide
                                                domain={['dataMin - 2', 'dataMax + 2']}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                                itemStyle={{ color: '#84cc16', fontWeight: 'bold' }}
                                                labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px' }}
                                                formatter={(value) => [`${value} kg`, 'Peso']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#84cc16"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorWeight)"
                                            />
                                            {summary?.goal?.target_weight && (
                                                <ReferenceLine y={summary.goal.target_weight} stroke="#64748b" strokeDasharray="3 3" />
                                            )}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="text-center mt-2 text-xs text-slate-500 font-medium">
                                    {history.length > 0 ? `Tendencia de ${historyPeriod === 'week' ? 'la semana' : historyPeriod === 'month' ? 'últimos 30 días' : 'último año'}` : 'Sin datos suficientes'}
                                </div>
                            </div>

                        </>
                    )}

                    {/* === MEASUREMENT TAB === */}
                    {activeTab === 'MEASUREMENT' && (
                        <div className="space-y-6">

                            {/* Measurement Chart */}
                            <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-lg">
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-slate-100 font-bold text-lg">Historial de Medidas</h3>
                                        <div className="flex bg-slate-800 rounded-lg p-0.5">
                                            {['week', 'month', 'year'].map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => setHistoryPeriod(p)}
                                                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${historyPeriod === p ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    {p === 'week' ? 'Sem' : p === 'month' ? 'Mes' : 'Año'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Line Toggles */}
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { key: 'CHEST', label: 'Pecho', color: '#2dd4bf' },  // teal-400
                                            { key: 'WAIST', label: 'Cintura', color: '#60a5fa' }, // blue-400
                                            { key: 'HIPS', label: 'Cadera', color: '#818cf8' },   // indigo-400
                                            { key: 'THIGH', label: 'Muslo', color: '#c084fc' }    // purple-400
                                        ].map(metric => (
                                            <button
                                                key={metric.key}
                                                onClick={() => setVisibleLines(prev => ({ ...prev, [metric.key]: !prev[metric.key] }))}
                                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${visibleLines[metric.key]
                                                    ? `bg-slate-800 text-white border-transparent`
                                                    : `bg-transparent text-slate-500 border-slate-700 opacity-50`
                                                    }`}
                                                style={{ boxShadow: visibleLines[metric.key] ? `0 0 10px ${metric.color}20` : 'none' }}
                                            >
                                                <span className="w-2 h-2 rounded-full inline-block mr-2" style={{ backgroundColor: metric.color }}></span>
                                                {metric.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={measurementHistory}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 10 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                hide
                                                domain={['dataMin - 5', 'dataMax + 5']}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                                labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '10px' }}
                                                formatter={(value, name) => [`${value} cm`, name]}
                                            />
                                            {visibleLines.CHEST && <Line type="monotone" dataKey="CHEST" stroke="#2dd4bf" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Pecho" connectNulls />}
                                            {visibleLines.WAIST && <Line type="monotone" dataKey="WAIST" stroke="#60a5fa" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Cintura" connectNulls />}
                                            {visibleLines.HIPS && <Line type="monotone" dataKey="HIPS" stroke="#818cf8" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Cadera" connectNulls />}
                                            {visibleLines.THIGH && <Line type="monotone" dataKey="THIGH" stroke="#c084fc" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Muslo" connectNulls />}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Body Visual (Abstract) */}
                            <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col items-center justify-center relative min-h-[300px]">
                                <h3 className="absolute top-6 left-6 text-slate-400 text-xs font-black uppercase tracking-widest">Tus Medidas</h3>

                                {/* Realistic Body Graphic */}
                                <div className="relative w-48 h-[350px] mx-auto my-4 opacity-90">
                                    <img
                                        src="/body_silhouette.png"
                                        alt="Body Silhouette"
                                        className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(132,204,22,0.1)]"
                                    />

                                    {/* Indicators - Positioned for the new silhouette */}
                                    <div className="absolute top-[22%] left-[-20%] w-[140%] flex justify-between px-2">
                                        <div className="text-[10px] text-teal-400 font-bold bg-slate-900/90 px-2 py-0.5 rounded-full border border-teal-500/30 backdrop-blur-sm shadow-sm transition-all hover:scale-105">
                                            Pecho: {summary?.measurements['CHEST']?.value || '--'}
                                        </div>
                                    </div>
                                    <div className="absolute top-[38%] right-[-35%]">
                                        <div className="text-[10px] text-blue-400 font-bold bg-slate-900/90 px-2 py-0.5 rounded-full border border-blue-500/30 backdrop-blur-sm shadow-sm transition-all hover:scale-105">
                                            Cintura: {summary?.measurements['WAIST']?.value || '--'}
                                        </div>
                                    </div>
                                    <div className="absolute top-[48%] left-[-35%]">
                                        <div className="text-[10px] text-indigo-400 font-bold bg-slate-900/90 px-2 py-0.5 rounded-full border border-indigo-500/30 backdrop-blur-sm shadow-sm transition-all hover:scale-105">
                                            Cadera: {summary?.measurements['HIPS']?.value || '--'}
                                        </div>
                                    </div>
                                    <div className="absolute top-[65%] right-[-25%]">
                                        <div className="text-[10px] text-purple-400 font-bold bg-slate-900/90 px-2 py-0.5 rounded-full border border-purple-500/30 backdrop-blur-sm shadow-sm transition-all hover:scale-105">
                                            Muslo: {summary?.measurements['THIGH']?.value || '--'}
                                        </div>
                                    </div>
                                </div>

                                <button className="flex items-center gap-2 text-slate-400 text-xs hover:text-white mt-4 bg-slate-800 px-4 py-2 rounded-full transition-colors">
                                    <Info size={14} /> ¿Cómo medir correctamente?
                                </button>
                            </div>

                            {/* Measurement Cards List */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Pecho', key: 'CHEST', color: 'text-teal-400', border: 'border-teal-500/20' },
                                    { label: 'Cintura', key: 'WAIST', color: 'text-blue-400', border: 'border-blue-500/20' },
                                    { label: 'Cadera', key: 'HIPS', color: 'text-indigo-400', border: 'border-indigo-500/20' },
                                    { label: 'Muslo', key: 'THIGH', color: 'text-purple-400', border: 'border-purple-500/20' },
                                ].map(item => (
                                    <div key={item.key} className={`bg-slate-900/50 p-5 rounded-[2rem] border ${item.border} hover:bg-slate-800/50 transition-colors`}>
                                        <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${item.color.replace('text', 'bg')}`}></div>
                                                {item.label}
                                            </div>
                                            <span className="text-[9px] font-medium text-slate-600 lowercase tracking-normal">
                                                {formatRelativeDate(summary?.measurements[item.key]?.recorded_at)}
                                            </span>
                                        </h4>
                                        <div className="text-2xl font-black text-white mb-2">
                                            {summary?.measurements[item.key]?.value || '--'} <span className="text-sm font-medium text-slate-600">cm</span>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedMeasurement(item.key); setMeasurementModalOpen(true); }}
                                            className={`w-full py-2 bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest ${item.color} hover:bg-slate-700 transition-colors`}
                                        >
                                            Actualizar
                                        </button>
                                    </div>
                                ))}
                            </div>




                        </div>
                    )}

                </div>
            )}

            {activeTab === 'HEALTH' && !loading && (
                <div className="px-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Blood Pressure Card */}
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-red-500/20 shadow-lg relative overflow-hidden group">
                            <h3 className="text-red-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Activity size={16} /> Presión Arterial</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setHistoryMetric('BP'); setHealthHistoryModalOpen(true); }}
                                        className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all flex items-center gap-1 border border-slate-700"
                                    >
                                        <Calendar size={10} className="text-red-500" />
                                        <span className="text-[9px] font-black uppercase tracking-wider">Historial</span>
                                    </button>
                                    <span className="text-[10px] font-medium text-slate-500 lowercase tracking-normal bg-slate-800/50 px-2 py-1 rounded-full">
                                        {formatRelativeDate(summary?.measurements['BP_SYS']?.recorded_at)}
                                    </span>
                                </div>
                            </h3>
                            <div
                                onClick={() => (summary?.measurements['BP_SYS']?.id && summary?.measurements['BP_DIA']?.id) && setCorrectBPOpen(true)}
                                className="text-4xl font-black text-white cursor-pointer hover:scale-105 transition-transform origin-left decoration-red-500/30 decoration-2 underline-offset-4 hover:underline"
                                title="Click para corregir"
                            >
                                {summary?.measurements['BP_SYS']?.value || '--'}
                                <span className="text-xl text-slate-500 mx-1">/</span>
                                {summary?.measurements['BP_DIA']?.value || '--'}
                                {(summary?.measurements['BP_SYS']?.id && summary?.measurements['BP_DIA']?.id) && <Edit2 size={16} className="inline ml-3 text-slate-600 mb-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">mmHg</span>
                        </div>

                        {/* Heart Rate Card */}
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-rose-500/20 shadow-lg relative overflow-hidden group">
                            <h3 className="text-rose-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Activity size={16} /> Ritmo Cardíaco</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setHistoryMetric('HEART_RATE'); setHealthHistoryModalOpen(true); }}
                                        className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all flex items-center gap-1 border border-slate-700"
                                    >
                                        <Calendar size={10} className="text-rose-500" />
                                        <span className="text-[9px] font-black uppercase tracking-wider">Historial</span>
                                    </button>
                                    <span className="text-[10px] font-medium text-slate-500 lowercase tracking-normal bg-slate-800/50 px-2 py-1 rounded-full">
                                        {formatRelativeDate(summary?.measurements['HEART_RATE']?.recorded_at)}
                                    </span>
                                </div>
                            </h3>
                            <div
                                onClick={() => summary?.measurements['HEART_RATE']?.id && setCorrectHROpen(true)}
                                className="text-4xl font-black text-white cursor-pointer hover:scale-105 transition-transform origin-left decoration-rose-500/30 decoration-2 underline-offset-4 hover:underline"
                                title="Click para corregir"
                            >
                                {summary?.measurements['HEART_RATE']?.value || '--'}
                                {(summary?.measurements['HEART_RATE']?.id) && <Edit2 size={16} className="inline ml-3 text-slate-600 mb-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">BPM</span>
                        </div>

                        {/* Glucose Card */}
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-blue-500/20 shadow-lg relative overflow-hidden md:col-span-2 group">
                            <h3 className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Activity size={16} /> Glucosa en Sangre</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setHistoryMetric('GLUCOSE'); setHealthHistoryModalOpen(true); }}
                                        className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all flex items-center gap-1 border border-slate-700"
                                    >
                                        <Calendar size={10} className="text-blue-500" />
                                        <span className="text-[9px] font-black uppercase tracking-wider">Historial</span>
                                    </button>
                                    <span className="text-[10px] font-medium text-slate-500 lowercase tracking-normal bg-slate-800/50 px-2 py-1 rounded-full">
                                        {formatRelativeDate(summary?.measurements['GLUCOSE']?.recorded_at)}
                                    </span>
                                </div>
                            </h3>
                            <div
                                onClick={() => summary?.measurements['GLUCOSE']?.id && setCorrectGlucoseOpen(true)}
                                className="text-4xl font-black text-white cursor-pointer hover:scale-105 transition-transform origin-left decoration-blue-500/30 decoration-2 underline-offset-4 hover:underline"
                                title="Click para corregir"
                            >
                                {summary?.measurements['GLUCOSE']?.value || '--'}
                                {(summary?.measurements['GLUCOSE']?.id) && <Edit2 size={16} className="inline ml-3 text-slate-600 mb-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">mg/dL</span>
                        </div>
                    </div>

                    {/* Quick Action Button - Discrete */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setHealthLogModalOpen(true)}
                            className="w-12 h-12 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black rounded-full transition-all shadow-lg shadow-lime-500/20 active:scale-95 flex items-center justify-center group relative"
                            title="Registrar datos de salud"
                        >
                            <Plus size={24} strokeWidth={3} />
                            <span className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Registrar datos
                            </span>
                        </button>
                    </div>

                    {/* --- HISTORICAL CHARTS --- */}
                    <div className="space-y-6 pt-4 border-t border-slate-800/50">
                        <h3 className="text-slate-400 text-sm font-black uppercase tracking-widest mb-4">Tendencias de Salud</h3>

                        {/* BP Chart */}
                        <BloodPressureChart
                            data={healthHistory.bp}
                            timeRange={historyPeriod}
                            onTimeRangeChange={setHistoryPeriod}
                        />

                        {/* Heart Rate Chart */}
                        <SingleMetricChart
                            title="Ritmo Cardíaco"
                            data={healthHistory.heartRate}
                            unit="BPM"
                            color="#f43f5e" // Rose-500
                            icon={Activity}
                            timeRange={historyPeriod}
                            onTimeRangeChange={setHistoryPeriod}
                        />

                        {/* Glucose Chart */}
                        <SingleMetricChart
                            title="Glucosa"
                            data={healthHistory.glucose}
                            unit="mg/dL"
                            color="#3b82f6" // Blue-500
                            icon={Activity}
                            timeRange={historyPeriod}
                            onTimeRangeChange={setHistoryPeriod}
                        />
                    </div>

                    <button
                        onClick={() => setHealthLogModalOpen(true)}
                        className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl transition-all shadow-lg shadow-lime-500/20 active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Registrar Datos de Salud
                    </button>

                    <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800 text-center">
                        <p className="text-slate-500 text-xs italic">
                            Estos datos son informativos. Consulta siempre a un profesional de la salud.
                        </p>
                    </div>
                </div>
            )}

            {/* --- INPUT MODALS --- */}

            {/* 1. Body Metrics Log Modal (Weight, Height, Sex, Date) */}
            <BodyMetricsModal
                isOpen={logModalOpen}
                onClose={() => setLogModalOpen(false)}
                initialWeight={summary?.weight?.weight}
                initialHeight={summary?.height}
                onConfirm={handleSaveBodyMetrics}
            />

            {/* 2. Goal Set Modal */}
            <SimpleInputModal
                isOpen={editGoalModalOpen}
                onClose={() => setEditGoalModalOpen(false)}
                title="Definir Objetivo"
                label="Peso Meta (kg)"
                placeholder="0.0"
                initialValue={summary?.goal?.target_weight}
                onConfirm={handleSetGoal}
            />

            {/* 3. Measurement Log Modal */}
            <SimpleInputModal
                isOpen={measurementModalOpen}
                onClose={() => setMeasurementModalOpen(false)}
                title={`Registrar ${selectedMeasurement}`}
                label="Medida (cm)"
                placeholder="0.0"
                onConfirm={async (val) => {
                    try {
                        await bodyService.logMeasurement(selectedMeasurement, val, 'cm', '', new Date());
                        setMeasurementModalOpen(false);
                        showToast('Medida guardada');
                        fetchData();
                    } catch (error) {
                        console.error("Error saving measurement:", error);
                        showToast('Error al guardar medida', 'error');
                    }
                }}
                onDelete={summary?.measurements[selectedMeasurement]?.id ? handleDeleteBodyMeasurement : undefined}
            />


            {/* 5. Correction Modals */}
            <SimpleInputModal
                isOpen={correctWeightOpen}
                onClose={() => setCorrectWeightOpen(false)}
                title="Corregir Peso"
                label="Peso Real (kg)"
                placeholder="Ej: 99.5"
                initialValue={summary?.weight?.weight}
                onConfirm={handleCorrectWeight}
            />

            <DoubleInputModal
                isOpen={correctBPOpen}
                onClose={() => setCorrectBPOpen(false)}
                title="Corregir Presión"
                label1="Sistólica"
                label2="Diastólica"
                placeholder1="120"
                placeholder2="80"
                initialValue1={summary?.measurements['BP_SYS']?.value}
                initialValue2={summary?.measurements['BP_DIA']?.value}
                onConfirm={handleCorrectBP}
                onDelete={handleDeleteBP}
            />

            <SimpleInputModal
                isOpen={correctHROpen}
                onClose={() => setCorrectHROpen(false)}
                title="Corregir Ritmo"
                label="BPM"
                placeholder="70"
                initialValue={summary?.measurements['HEART_RATE']?.value}
                onConfirm={handleCorrectHR}
                onDelete={handleDeleteHR}
            />

            <SimpleInputModal
                isOpen={correctGlucoseOpen}
                onClose={() => setCorrectGlucoseOpen(false)}
                title="Corregir Glucosa"
                label="mg/dL"
                placeholder="95"
                initialValue={summary?.measurements['GLUCOSE']?.value}
                onConfirm={handleCorrectGlucose}
                onDelete={handleDeleteGlucose}
            />

            {/* 6. Health Log Modal */}
            <HealthLogModal
                isOpen={healthLogModalOpen}
                onClose={() => setHealthLogModalOpen(false)}
                onConfirm={handleSaveHealthMetrics}
            />

            {/* 7. Weight History Modal */}
            <WeightHistoryModal
                isOpen={weightHistoryModalOpen}
                onClose={() => setWeightHistoryModalOpen(false)}
                history={history}
                onEdit={(entry) => setEditingWeight(entry)}
                onDelete={(id) => showConfirmModal(
                    'Eliminar Registro',
                    '¿Estás seguro de que quieres eliminar este registro de peso?',
                    () => handleDeleteWeight(id)
                )}
            />

            {/* 7.1 Health History Modal */}
            <HealthHistoryModal
                isOpen={healthHistoryModalOpen}
                onClose={() => setHealthHistoryModalOpen(false)}
                metric={historyMetric}
                onEdit={(entry) => setEditingMeasurement(entry)}
                onDelete={(entry) => {
                    const title = "¿Eliminar registro?";
                    const msg = `¿Seguro que deseas eliminar este registro de ${historyMetric === 'BP' ? 'presión arterial' : historyMetric === 'GLUCOSE' ? 'glucosa' : 'ritmo cardíaco'}?`;

                    showConfirmModal(title, msg, async () => {
                        try {
                            if (historyMetric === 'BP') {
                                await Promise.all([
                                    bodyService.deleteMeasurement(entry.id_sys),
                                    bodyService.deleteMeasurement(entry.id_dia)
                                ]);
                            } else {
                                await bodyService.deleteMeasurement(entry.id);
                            }
                            showToast('Registro eliminado');
                            fetchData();
                            fetchHistory();
                        } catch (error) {
                            console.error(error);
                            showToast('Error al eliminar', 'error');
                        }
                    });
                }}
            />

            {/* 8. Edit Weight Modal (from history) */}
            <SimpleInputModal
                isOpen={!!editingWeight}
                onClose={() => setEditingWeight(null)}
                title="Editar Peso"
                label="Peso (kg)"
                placeholder="0.0"
                initialValue={editingWeight?.value || editingWeight?.weight}
                onConfirm={(newVal) => handleUpdateWeight(editingWeight.id, newVal, editingWeight.recorded_at)}
            />

            {/* 9. Edit Health Modal (from history) */}
            {historyMetric === 'BP' ? (
                <DoubleInputModal
                    isOpen={!!editingMeasurement}
                    onClose={() => setEditingMeasurement(null)}
                    title="Editar Presión"
                    label1="Sistólica"
                    label2="Diastólica"
                    placeholder1="120"
                    placeholder2="80"
                    initialValue1={editingMeasurement?.systolic}
                    initialValue2={editingMeasurement?.diastolic}
                    onConfirm={async (sys, dia) => {
                        try {
                            await Promise.all([
                                bodyService.updateMeasurement(editingMeasurement.id_sys, sys, '', editingMeasurement.date),
                                bodyService.updateMeasurement(editingMeasurement.id_dia, dia, '', editingMeasurement.date)
                            ]);
                            setEditingMeasurement(null);
                            showToast('Registro actualizado');
                            fetchData();
                            fetchHistory();
                        } catch (error) {
                            console.error(error);
                            showToast('Error al actualizar', 'error');
                        }
                    }}
                />
            ) : (
                <SimpleInputModal
                    isOpen={!!editingMeasurement}
                    onClose={() => setEditingMeasurement(null)}
                    title={`Editar ${historyMetric === 'GLUCOSE' ? 'Glucosa' : 'Ritmo'}`}
                    label={historyMetric === 'GLUCOSE' ? 'mg/dL' : 'BPM'}
                    placeholder="0"
                    initialValue={editingMeasurement?.value}
                    onConfirm={async (val) => {
                        try {
                            await bodyService.updateMeasurement(editingMeasurement.id, val, '', editingMeasurement.date);
                            setEditingMeasurement(null);
                            showToast('Registro actualizado');
                            fetchData();
                            fetchHistory();
                        } catch (error) {
                            console.error(error);
                            showToast('Error al actualizar', 'error');
                        }
                    }}
                />
            )}

            {/* Toast Feedback */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Custom Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.open}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />

        </div>
    );
};

const BodyMetricsModal = ({ isOpen, onClose, initialWeight, initialHeight, onConfirm }) => {
    const [weight, setWeight] = useState('');
    const [heightCm, setHeightCm] = useState(''); // Used for metric
    const [heightFt, setHeightFt] = useState(''); // Used for imperial (feet)
    const [heightIn, setHeightIn] = useState(''); // Used for imperial (inches)
    const [unit, setUnit] = useState('metric'); // metric (kg/cm) | imperial (lb/ft)

    useEffect(() => {
        if (isOpen) {
            // Initialize with metric values
            const w = parseFloat(initialWeight) || '';
            const h = parseFloat(initialHeight) || '';

            if (unit === 'metric') {
                setWeight(w);
                setHeightCm(h);
            } else {
                // Convert kg to lb, cm to ft/in
                setWeight(w ? (w * 2.20462).toFixed(2) : '');
                if (h) {
                    const totalInches = h / 2.54;
                    setHeightFt(Math.floor(totalInches / 12).toString());
                    setHeightIn(Math.round(totalInches % 12).toString());
                }
            }
        }
    }, [isOpen, initialWeight, initialHeight, unit]);

    if (!isOpen) return null;

    const handleUnitChange = (newUnit) => {
        if (newUnit === unit) return;

        // Convert values when switching units
        if (newUnit === 'imperial') {
            // kg -> lb
            if (weight) setWeight((parseFloat(weight) * 2.20462).toFixed(2));
            // cm -> ft/in
            if (heightCm) {
                const totalInches = parseFloat(heightCm) / 2.54;
                setHeightFt(Math.floor(totalInches / 12).toString());
                setHeightIn(Math.round(totalInches % 12).toString());
            }
        } else {
            // lb -> kg
            if (weight) setWeight((parseFloat(weight) * 0.453592).toFixed(1));
            // ft/in -> cm
            const ft = parseFloat(heightFt) || 0;
            const inches = parseFloat(heightIn) || 0;
            const totalCm = (ft * 12 + inches) * 2.54;
            if (totalCm > 0) setHeightCm(totalCm.toFixed(1));
        }
        setUnit(newUnit);
    };

    const handleSave = () => {
        let finalWeight = parseFloat(weight);
        let finalHeight;

        if (unit === 'imperial') {
            // Convert lb to kg
            if (weight) finalWeight = finalWeight * 0.453592;
            // Convert ft/in to cm
            const ft = parseFloat(heightFt) || 0;
            const inches = parseFloat(heightIn) || 0;
            finalHeight = (ft * 12 + inches) * 2.54;
        } else {
            finalHeight = parseFloat(heightCm);
        }

        onConfirm(
            weight ? finalWeight.toFixed(2) : null,
            (unit === 'metric' ? heightCm : (heightFt || heightIn)) ? finalHeight.toFixed(2) : null,
            new Date(),
            null // gender removed from this modal
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-xs rounded-3xl border border-slate-800 shadow-2xl p-6 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <div className="bg-slate-800/80 rounded-full w-7 h-7 flex items-center justify-center border border-slate-700">
                        <span className="text-lg leading-none">&times;</span>
                    </div>
                </button>

                {/* Title */}
                <h3 className="text-white text-lg font-semibold text-center mb-8">Peso & Altura</h3>

                {/* Weight Input */}
                <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-slate-400 text-base font-medium">Peso :</span>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="bg-transparent text-4xl font-bold text-white w-28 text-right outline-none border-b-2 border-slate-700 focus:border-emerald-500 transition-colors"
                            placeholder="0.0"
                        />
                        <span className="text-slate-400 text-lg">{unit === 'metric' ? 'kg' : 'lb'}</span>
                    </div>
                </div>

                {/* Height Input */}
                <div className="mb-8">
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-slate-400 text-base font-medium">Altura :</span>

                        {unit === 'metric' ? (
                            <>
                                <input
                                    type="number"
                                    value={heightCm}
                                    onChange={(e) => setHeightCm(e.target.value)}
                                    className="bg-transparent text-4xl font-bold text-emerald-400 w-28 text-right outline-none border-b-2 border-slate-700 focus:border-emerald-500 transition-colors"
                                    placeholder="0.0"
                                />
                                <span className="text-slate-400 text-lg">cm</span>
                            </>
                        ) : (
                            <>
                                <input
                                    type="number"
                                    value={heightFt}
                                    onChange={(e) => setHeightFt(e.target.value)}
                                    className="bg-transparent text-4xl font-bold text-white w-12 text-right outline-none border-b-2 border-slate-700 focus:border-emerald-500 transition-colors"
                                    placeholder="0"
                                />
                                <span className="text-slate-400 text-base">ft</span>
                                <input
                                    type="number"
                                    value={heightIn}
                                    onChange={(e) => setHeightIn(e.target.value)}
                                    className="bg-transparent text-4xl font-bold text-emerald-400 w-12 text-right outline-none border-b-2 border-slate-700 focus:border-emerald-500 transition-colors"
                                    placeholder="0"
                                />
                                <span className="text-slate-400 text-base">in</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Unit Toggle */}
                <div className="flex justify-center mb-6">
                    <div className="bg-slate-800 p-1 rounded-full flex">
                        <button
                            onClick={() => handleUnitChange('metric')}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${unit === 'metric' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500'}`}
                        >
                            cm/kg
                        </button>
                        <button
                            onClick={() => handleUnitChange('imperial')}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${unit === 'imperial' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}
                        >
                            ft/lb
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-full text-base transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    Guardar
                </button>
            </div>
        </div>
    );
};

// Simple reusable modal for single input
const SimpleInputModal = ({ isOpen, onClose, title, label, placeholder, initialValue, onConfirm, onDelete }) => {
    const [val, setVal] = useState('');

    useEffect(() => {
        if (isOpen && initialValue) setVal(initialValue);
        else if (isOpen) setVal('');
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-slate-700 shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
                    <button onClick={onClose}><span className="text-slate-500 text-2xl">&times;</span></button>
                </div>
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</label>
                    <input
                        type="number"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-2xl font-black focus:ring-2 focus:ring-lime-500 outline-none"
                        autoFocus
                    />
                </div>
                <div className="space-y-3">
                    <button
                        onClick={() => onConfirm(val)}
                        disabled={!val}
                        className="w-full py-4 bg-lime-500 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl uppercase tracking-widest text-sm transition-all active:scale-95"
                    >
                        Guardar
                    </button>
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl uppercase tracking-widest text-xs transition-all active:scale-95 border border-red-500/20"
                        >
                            Eliminar Registro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const DoubleInputModal = ({ isOpen, onClose, title, label1, label2, placeholder1, placeholder2, initialValue1, initialValue2, onConfirm, onDelete }) => {
    const [val1, setVal1] = useState('');
    const [val2, setVal2] = useState('');

    useEffect(() => {
        if (isOpen) {
            setVal1(initialValue1 || '');
            setVal2(initialValue2 || '');
        }
    }, [isOpen, initialValue1, initialValue2]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-slate-700 shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
                    <button onClick={onClose}><span className="text-slate-500 text-2xl">&times;</span></button>
                </div>
                <div className="mb-6 flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{label1}</label>
                        <input
                            type="number"
                            value={val1}
                            onChange={(e) => setVal1(e.target.value)}
                            placeholder={placeholder1}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-2xl font-black focus:ring-2 focus:ring-lime-500 outline-none text-center"
                            autoFocus
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{label2}</label>
                        <input
                            type="number"
                            value={val2}
                            onChange={(e) => setVal2(e.target.value)}
                            placeholder={placeholder2}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-2xl font-black focus:ring-2 focus:ring-lime-500 outline-none text-center"
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <button
                        onClick={() => onConfirm(val1, val2)}
                        disabled={!val1 || !val2}
                        className="w-full py-4 bg-lime-500 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl uppercase tracking-widest text-sm transition-all active:scale-95"
                    >
                        Guardar
                    </button>
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl uppercase tracking-widest text-xs transition-all active:scale-95 border border-red-500/20"
                        >
                            Eliminar Registro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const HealthLogModal = ({ isOpen, onClose, onConfirm }) => {
    const [bpSys, setBpSys] = useState('');
    const [bpDia, setBpDia] = useState('');
    const [heartRate, setHeartRate] = useState('');
    const [glucose, setGlucose] = useState('');
    const [isFasting, setIsFasting] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setBpSys('');
            setBpDia('');
            setHeartRate('');
            setGlucose('');
            setIsFasting(false);
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const validateAll = () => {
        const newErrors = {};

        const sysCheck = validateValue('BP_SYS', bpSys);
        const diaCheck = validateValue('BP_DIA', bpDia);
        const hrCheck = validateValue('HEART_RATE', heartRate);
        const glCheck = validateValue('GLUCOSE', glucose);

        if (!sysCheck.valid) newErrors.bpSys = sysCheck.error;
        if (!diaCheck.valid) newErrors.bpDia = diaCheck.error;
        if (!hrCheck.valid) newErrors.heartRate = hrCheck.error;
        if (!glCheck.valid) newErrors.glucose = glCheck.error;

        // Special validation: if one BP is filled, both should be
        if ((bpSys && !bpDia) || (!bpSys && bpDia)) {
            newErrors.bpSys = 'Completa ambos valores';
            newErrors.bpDia = 'Completa ambos valores';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateAll()) return;

        // Check if at least one field is filled
        if (!bpSys && !bpDia && !heartRate && !glucose) {
            setErrors({ general: 'Ingresa al menos un valor' });
            return;
        }

        const date = new Date(selectedDate + 'T12:00:00');
        onConfirm(bpSys, bpDia, heartRate, glucose, date, isFasting);
    };

    const getInputClass = (errorKey) => {
        const base = "w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-lg font-bold outline-none transition-colors placeholder-slate-600";
        return errors[errorKey]
            ? `${base} border-red-500 focus:ring-2 focus:ring-red-500`
            : `${base} focus:ring-2 focus:ring-lime-500`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-slate-700 shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">&times;</div></button>

                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 text-center text-lime-500">Registro de Salud</h3>



                {/* Blood Pressure */}
                <div className="mb-6 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Presión Arterial</label>
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <input
                                type="number"
                                value={bpSys}
                                onChange={(e) => { setBpSys(e.target.value); setErrors(prev => ({ ...prev, bpSys: null })); }}
                                placeholder="120"
                                className={`w-full bg-slate-800 border-b-2 ${errors.bpSys ? 'border-red-500' : 'border-slate-700'} focus:border-red-500 text-white text-xl font-bold text-center py-2 outline-none transition-colors placeholder-slate-700`}
                            />
                            <span className="block text-[10px] text-slate-600 text-center mt-1 uppercase">Sistólica</span>
                        </div>
                        <span className="text-slate-600 text-xl">/</span>
                        <div className="flex-1">
                            <input
                                type="number"
                                value={bpDia}
                                onChange={(e) => { setBpDia(e.target.value); setErrors(prev => ({ ...prev, bpDia: null })); }}
                                placeholder="80"
                                className={`w-full bg-slate-800 border-b-2 ${errors.bpDia ? 'border-red-500' : 'border-slate-700'} focus:border-red-500 text-white text-xl font-bold text-center py-2 outline-none transition-colors placeholder-slate-700`}
                            />
                            <span className="block text-[10px] text-slate-600 text-center mt-1 uppercase">Diastólica</span>
                        </div>
                    </div>
                    {(errors.bpSys || errors.bpDia) && (
                        <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} /> {errors.bpSys || errors.bpDia}</p>
                    )}
                    <p className="text-slate-600 text-[10px] mt-2">Rango válido: 70-250 / 40-150 mmHg</p>
                </div>

                {/* Heart Rate */}
                <div className="mb-6 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ritmo Cardíaco (BPM)</label>
                    <input
                        type="number"
                        value={heartRate}
                        onChange={(e) => { setHeartRate(e.target.value); setErrors(prev => ({ ...prev, heartRate: null })); }}
                        placeholder="70"
                        className={getInputClass('heartRate').replace('focus:ring-lime-500', 'focus:ring-rose-500')}
                    />
                    {errors.heartRate && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.heartRate}</p>}
                    <p className="text-slate-600 text-[10px] mt-1">Rango válido: 30-220 BPM</p>
                </div>

                {/* Glucose */}
                <div className="mb-6 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Glucosa (mg/dL)</label>
                    <input
                        type="number"
                        value={glucose}
                        onChange={(e) => { setGlucose(e.target.value); setErrors(prev => ({ ...prev, glucose: null })); }}
                        placeholder="95"
                        className={getInputClass('glucose').replace('focus:ring-lime-500', 'focus:ring-blue-500')}
                    />
                    {errors.glucose && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.glucose}</p>}
                    <p className="text-slate-600 text-[10px] mt-1">Rango válido: 20-600 mg/dL</p>
                </div>

                {/* Fasting Toggle */}
                <div className="mb-6 bg-slate-800/30 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Estado de Ayuno</label>
                        <p className="text-xs text-slate-400">¿Esta medición es en ayunas?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isFasting}
                            onChange={(e) => setIsFasting(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                    </label>
                </div>

                {errors.general && (
                    <p className="text-red-400 text-sm mb-4 text-center flex items-center justify-center gap-1"><AlertCircle size={14} /> {errors.general}</p>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-slate-800 text-slate-400 font-bold rounded-2xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl shadow-lg shadow-lime-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        Guardar
                    </button>
                </div>
            </div>

        </div>
    );
};

// Weight History Modal
const WeightHistoryModal = ({ isOpen, onClose, history, onDelete, onEdit }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-slate-700 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Scale size={20} className="text-lime-500" /> Registros de Peso
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">&times;</div>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                    {history && history.length > 0 ? (
                        history.slice().reverse().map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between bg-slate-800/30 rounded-2xl px-5 py-4 border border-slate-800/50 group hover:border-slate-700 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-lime-500/10 flex items-center justify-center text-lime-500">
                                        <Scale size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-white font-black text-lg leading-tight">
                                            {parseFloat(entry.value || entry.weight).toFixed(2)} <span className="text-xs text-slate-500 font-bold">kg</span>
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                            {new Date(entry.recorded_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => onEdit(entry)}
                                        className="p-2 text-slate-600 hover:text-lime-500 hover:bg-lime-500/10 rounded-xl transition-all"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(entry.id)}
                                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-slate-500 font-bold">No hay registros</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

// Health History Modal
const HealthHistoryModal = ({ isOpen, onClose, metric, onEdit, onDelete }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && metric) {
            fetchRawHistory();
        }
    }, [isOpen, metric]);

    const fetchRawHistory = async () => {
        setLoading(true);
        try {
            if (metric === 'BP') {
                const [sys, dia] = await Promise.all([
                    bodyService.getHistory({ period: 'month', type: 'measurement', subtype: 'BP_SYS' }),
                    bodyService.getHistory({ period: 'month', type: 'measurement', subtype: 'BP_DIA' })
                ]);

                // Merge by timestamp exactly
                const bpMap = {};
                sys.forEach(s => {
                    const ts = s.recorded_at;
                    if (!bpMap[ts]) bpMap[ts] = { date: ts };
                    bpMap[ts].systolic = parseFloat(s.value);
                    bpMap[ts].id_sys = s.id;
                });
                dia.forEach(d => {
                    const ts = d.recorded_at;
                    if (!bpMap[ts]) bpMap[ts] = { date: ts };
                    bpMap[ts].diastolic = parseFloat(d.value);
                    bpMap[ts].id_dia = d.id;
                });
                setData(Object.values(bpMap).sort((a, b) => new Date(b.date) - new Date(a.date)));
            } else {
                const res = await bodyService.getHistory({ period: 'month', type: 'measurement', subtype: metric });
                setData(res.map(d => ({ id: d.id, value: parseFloat(d.value), date: d.recorded_at })).reverse());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const titles = {
        'BP': 'Presión Arterial',
        'HEART_RATE': 'Ritmo Cardíaco',
        'GLUCOSE': 'Glucosa'
    };

    const icons = {
        'BP': <Activity size={20} className="text-red-500" />,
        'HEART_RATE': <Activity size={20} className="text-rose-500" />,
        'GLUCOSE': <Activity size={20} className="text-blue-500" />
    };

    const unit = {
        'BP': 'mmHg',
        'HEART_RATE': 'BPM',
        'GLUCOSE': 'mg/dL'
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-slate-700 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        {icons[metric]} {titles[metric]}
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">&times;</div>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500 animate-pulse font-bold uppercase tracking-widest text-xs">Cargando registros...</div>
                    ) : data.length > 0 ? (
                        data.map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-800/30 rounded-2xl px-5 py-4 border border-slate-800/50 group hover:border-slate-700 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <p className="text-white font-black text-lg leading-tight">
                                            {metric === 'BP' ? `${entry.systolic}/${entry.diastolic}` : entry.value}
                                            <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">{unit[metric]}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                            {new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => onEdit(entry)}
                                        className="p-2 text-slate-600 hover:text-lime-500 hover:bg-lime-500/10 rounded-xl transition-all"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(entry)}
                                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-slate-500 font-bold">No hay registros</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BodyDataPage;
