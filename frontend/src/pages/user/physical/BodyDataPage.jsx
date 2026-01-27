import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Settings, Plus, Scale, Ruler, Activity, ChevronRight, Edit2, Info } from 'lucide-react';
import BloodPressureChart from '../../../components/stats/BloodPressureChart';
import SingleMetricChart from '../../../components/stats/SingleMetricChart';
import bodyService from '../../../services/bodyService';
import { NavigationHeader, ConfirmationModal } from '../../../components/MetabolicComponents';

/**
 * BodyDataPage
 * Tracks Weight and Body Measurements
 */
const BodyDataPage = () => {
    const [activeTab, setActiveTab] = useState('WEIGHT'); // 'WEIGHT' | 'MEASUREMENT' | 'HEALTH'
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [healthHistory, setHealthHistory] = useState({ bp: [], heartRate: [], glucose: [] });
    const [historyPeriod, setHistoryPeriod] = useState('month'); // week, month, year
    const [loading, setLoading] = useState(true);

    // Modals
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [editGoalModalOpen, setEditGoalModalOpen] = useState(false);
    const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
    const [healthLogModalOpen, setHealthLogModalOpen] = useState(false);
    const [selectedMeasurement, setSelectedMeasurement] = useState(null); // For logging specific part

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
                // We assume logs are close in time or we map by date. For simplicity, we map by date string.
                // A better approach: group by exact timestamp or close proximity. Here we trust date string for now.
                const bpMap = {};
                bpSysData.forEach(d => {
                    const dateStr = new Date(d.recorded_at).toDateString(); // Group by day for chart? Or full timestamp?
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

            } else {
                const data = await bodyService.getHistory({
                    period: historyPeriod,
                    type: activeTab === 'WEIGHT' ? 'weight' : 'measurement',
                    subtype: activeTab === 'MEASUREMENT' ? (selectedMeasurement || 'WAIST') : undefined
                });
                const formatted = data.map(d => ({
                    date: new Date(d.recorded_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                    value: parseFloat(d.value)
                }));
                setHistory(formatted);
            }
        } catch (err) {
            console.error(err);
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
            // Note: Gender handling would go here (e.g., update profile), for now we just log/calculate locally or ignore if no endpoint.
            // keeping focus on the requested metrics

            setLogModalOpen(false);
            fetchData();
            fetchHistory();
        } catch (error) {
            console.error("Error saving body metrics:", error);
        }
    };

    const handleSetGoal = async (target) => {
        // Use current weight as start if no goal exists, or keep existing start
        const startW = summary.goal?.start_weight || summary.weight?.weight || target;
        await bodyService.setGoal(startW, target, new Date(), null);
        setEditGoalModalOpen(false);
        fetchData();
    };

    const handleSaveHealthMetrics = async (bpSys, bpDia, heartRate, glucose, date) => {
        try {
            if (bpSys && bpDia) {
                await bodyService.logMeasurement('BP_SYS', bpSys, 'mmHg', '', date || new Date());
                await bodyService.logMeasurement('BP_DIA', bpDia, 'mmHg', '', date || new Date());
            }
            if (heartRate) await bodyService.logMeasurement('HEART_RATE', heartRate, 'bpm', '', date || new Date());
            if (glucose) await bodyService.logMeasurement('GLUCOSE', glucose, 'mg/dL', '', date || new Date());

            setHealthLogModalOpen(false);
            fetchData();
            fetchHistory(); // If needed
        } catch (error) {
            console.error("Error saving health metrics:", error);
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
                                    <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Último Peso</h3>
                                    <div className="text-5xl font-black text-white mb-4 tracking-tighter">
                                        {summary?.weight?.weight || '--'} <span className="text-2xl text-slate-500 font-bold">kg</span>
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
                                            <span>Meta: {summary.goal.target_weight}kg</span>
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
                            {summary?.bmi && (
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
                            )}

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
                                        <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${item.color.replace('text', 'bg')}`}></div>
                                            {item.label}
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
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-red-500/20 shadow-lg relative overflow-hidden">
                            <h3 className="text-red-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity size={16} /> Presión Arterial
                            </h3>
                            <div className="text-4xl font-black text-white">
                                {summary?.measurements['BP_SYS']?.value || '--'}
                                <span className="text-xl text-slate-500 mx-1">/</span>
                                {summary?.measurements['BP_DIA']?.value || '--'}
                            </div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">mmHg</span>
                        </div>

                        {/* Heart Rate Card */}
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-rose-500/20 shadow-lg relative overflow-hidden">
                            <h3 className="text-rose-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity size={16} /> Ritmo Cardíaco
                            </h3>
                            <div className="text-4xl font-black text-white">
                                {summary?.measurements['HEART_RATE']?.value || '--'}
                            </div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">BPM</span>
                        </div>

                        {/* Glucose Card */}
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-blue-500/20 shadow-lg relative overflow-hidden md:col-span-2">
                            <h3 className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity size={16} /> Glucosa en Sangre
                            </h3>
                            <div className="text-4xl font-black text-white">
                                {summary?.measurements['GLUCOSE']?.value || '--'}
                            </div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">mg/dL</span>
                        </div>
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
                    await bodyService.logMeasurement(selectedMeasurement, val, 'cm', '', new Date());
                    setMeasurementModalOpen(false);
                    fetchData();
                }}
            />

            {/* 4. Health Log Modal */}
            <HealthLogModal
                isOpen={healthLogModalOpen}
                onClose={() => setHealthLogModalOpen(false)}
                onConfirm={handleSaveHealthMetrics}
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
const SimpleInputModal = ({ isOpen, onClose, title, label, placeholder, initialValue, onConfirm }) => {
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
                <button
                    onClick={() => onConfirm(val)}
                    disabled={!val}
                    className="w-full py-4 bg-lime-500 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl uppercase tracking-widest text-sm transition-all active:scale-95"
                >
                    Guardar
                </button>
            </div>
        </div>
    );
};

const HealthLogModal = ({ isOpen, onClose, onConfirm }) => {
    const [bpSys, setBpSys] = useState('');
    const [bpDia, setBpDia] = useState('');
    const [heartRate, setHeartRate] = useState('');
    const [glucose, setGlucose] = useState('');

    useEffect(() => {
        if (isOpen) {
            setBpSys('');
            setBpDia('');
            setHeartRate('');
            setGlucose('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onConfirm(bpSys, bpDia, heartRate, glucose, new Date());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-slate-700 shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">&times;</div></button>

                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 text-center text-lime-500">Registro de Salud</h3>

                {/* Blood Pressure */}
                <div className="mb-6 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Presión Arterial</label>
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <input
                                type="number"
                                value={bpSys}
                                onChange={(e) => setBpSys(e.target.value)}
                                placeholder="120"
                                className="w-full bg-slate-800 border-b-2 border-slate-700 focus:border-red-500 text-white text-x font-bold text-center py-2 outline-none transition-colors placeholder-slate-700"
                            />
                            <span className="block text-[10px] text-slate-600 text-center mt-1 uppercase">Sistólica</span>
                        </div>
                        <span className="text-slate-600 text-xl">/</span>
                        <div className="flex-1">
                            <input
                                type="number"
                                value={bpDia}
                                onChange={(e) => setBpDia(e.target.value)}
                                placeholder="80"
                                className="w-full bg-slate-800 border-b-2 border-slate-700 focus:border-red-500 text-white text-xl font-bold text-center py-2 outline-none transition-colors placeholder-slate-700"
                            />
                            <span className="block text-[10px] text-slate-600 text-center mt-1 uppercase">Diastólica</span>
                        </div>
                    </div>
                </div>

                {/* Heart Rate */}
                <div className="mb-6 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ritmo Cardíaco (BPM)</label>
                    <input
                        type="number"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                        placeholder="70"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-lg font-bold focus:ring-2 focus:ring-rose-500 outline-none placeholder-slate-600"
                    />
                </div>

                {/* Glucose */}
                <div className="mb-8 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Glucosa (mg/dL)</label>
                    <input
                        type="number"
                        value={glucose}
                        onChange={(e) => setGlucose(e.target.value)}
                        placeholder="95"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600"
                    />
                </div>

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

export default BodyDataPage;
