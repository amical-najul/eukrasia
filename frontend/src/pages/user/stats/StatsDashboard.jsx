import React, { useState, useEffect } from 'react';
import { ChevronLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import metabolicService from '../../../services/metabolicService';
import bodyService from '../../../services/bodyService';

// Import Components
import WeightChart from '../../../components/stats/WeightChart';
import FastingChart from '../../../components/stats/FastingChart';
import BodyMeasurementsChart from '../../../components/stats/BodyMeasurementsChart';
import GlucoseChart from '../../../components/stats/GlucoseChart';
import BloodPressureChart from '../../../components/stats/BloodPressureChart';

const StatsDashboard = () => {
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);

    // Data States
    const [fastingChartData, setFastingChartData] = useState([]);
    const [weightData, setWeightData] = useState([]);
    const [measurementsData, setMeasurementsData] = useState([]);
    const [glucoseData, setGlucoseData] = useState([]);
    const [bpData, setBpData] = useState([]);

    // Range States
    const [fastingRange, setFastingRange] = useState('Mes');
    const [weightRange, setWeightRange] = useState('Mes');
    const [glucoseRange, setGlucoseRange] = useState('Mes');
    const [bpRange, setBpRange] = useState('Mes');

    // Data Fetching
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Deep History
                const logs = await metabolicService.getHistory(500);
                const allMeasurements = await bodyService.getHistory({ type: 'measurement', period: 'year' });
                const weightHist = await bodyService.getHistory({ type: 'weight', period: 'year' });

                console.log("StatsDashboard Debug:", {
                    logsCount: logs?.length,
                    measurementsCount: allMeasurements?.length,
                    weightCount: weightHist?.length,
                    firstLog: logs?.[0],
                    firstMeasurement: allMeasurements?.[0]
                });

                // 2. Process Fasting History
                const fHistory = processFastingHistory(logs);
                const filteredFasting = filterDataByRange(fHistory, fastingRange);
                console.log("Fasting Data:", { raw: fHistory, filtered: filteredFasting, range: fastingRange });
                setFastingChartData(filteredFasting);

                // 3. Process Weight
                const processedWeight = weightHist.map(wm => ({
                    date: wm.recorded_at,
                    weight: parseFloat(wm.value)
                }));
                const filteredWeight = filterDataByRange(processedWeight, weightRange);
                console.log("Weight Data:", { raw: processedWeight, filtered: filteredWeight, range: weightRange });
                setWeightData(filteredWeight);

                // 4. Process Glucose
                const glucoseRaw = allMeasurements
                    .filter(m => m.measurement_type === 'GLUCOSE')
                    .map(m => ({ date: m.recorded_at, value: parseFloat(m.value) }))
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
                setGlucoseData(filterDataByRange(glucoseRaw, glucoseRange));

                // 5. Process Blood Pressure
                const bpMap = {};
                allMeasurements.forEach(m => {
                    if (['BP_SYS', 'BP_DIA'].includes(m.measurement_type)) {
                        const dateObj = new Date(m.recorded_at);
                        const timeKey = dateObj.toISOString().slice(0, 16);
                        if (!bpMap[timeKey]) bpMap[timeKey] = { date: m.recorded_at };
                        if (m.measurement_type === 'BP_SYS') bpMap[timeKey].systolic = parseFloat(m.value);
                        if (m.measurement_type === 'BP_DIA') bpMap[timeKey].diastolic = parseFloat(m.value);
                    }
                });
                const processedBP = Object.values(bpMap).sort((a, b) => new Date(a.date) - new Date(b.date));
                setBpData(filterDataByRange(processedBP, bpRange));

                // 6. Process Body Measurements
                const measureMap = {};
                allMeasurements.forEach(m => {
                    if (['CHEST', 'WAIST', 'HIPS', 'THIGH'].includes(m.measurement_type)) {
                        const mDate = new Date(m.recorded_at).toLocaleDateString();
                        if (!measureMap[mDate]) measureMap[mDate] = { date: m.recorded_at };
                        measureMap[mDate][m.measurement_type] = parseFloat(m.value);
                    }
                });
                setMeasurementsData(Object.values(measureMap).sort((a, b) => new Date(a.date) - new Date(b.date)));


            } catch (error) {
                console.error("Error loading stats", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [fastingRange, weightRange, glucoseRange, bpRange]); // Re-run when filters change


    const filterDataByRange = (data, range) => {
        if (!data || data.length === 0) return [];
        const now = new Date();
        const pastDate = new Date();

        if (range === 'Semana') pastDate.setDate(now.getDate() - 7);
        else if (range === 'Mes') pastDate.setMonth(now.getMonth() - 1);
        else if (range === 'Año') pastDate.setFullYear(now.getFullYear() - 1);

        // Handle 'date' property which might be named differently? 
        // We normalized everything to have 'date' property in processing steps above.
        // Except FastingHistory which I need to check.

        return data.filter(item => new Date(item.date) >= pastDate);
    };


    const processFastingHistory = (logs) => {
        // Fasting durations are INFERRED: 
        // Time between one fast-breaking event and the next = fasting duration
        // Sort logs ASC
        const sortedLogs = [...logs]
            .filter(log => log.is_fasting_breaker) // Only fast-breaking events
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        const daysMap = {}; // 'YYYY-MM-DD': hours

        for (let i = 1; i < sortedLogs.length; i++) {
            const prevBreak = new Date(sortedLogs[i - 1].created_at);
            const currentBreak = new Date(sortedLogs[i].created_at);
            const durationHours = (currentBreak - prevBreak) / (1000 * 60 * 60);

            // Ignore unrealistic durations (< 4h probably same meal, > 168h probably missed data)
            if (durationHours < 4 || durationHours > 168) continue;

            // Assign to the day the fast ENDED (the current break)
            const dayKey = currentBreak.toISOString().split('T')[0]; // YYYY-MM-DD
            // Take the longest fast for each day if multiple
            if (!daysMap[dayKey] || durationHours > daysMap[dayKey]) {
                daysMap[dayKey] = durationHours;
            }
        }

        // Convert Map to Array format for Chart [{ date: 'ISO', value: 16.5 }]
        return Object.entries(daysMap).map(([dateStr, hours]) => ({
            date: dateStr, // Chart expects 'date' for filtering
            value: parseFloat(hours.toFixed(1))
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // Handlers
    const handleBack = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] text-white pb-20 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-2">
                <button onClick={handleBack} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-xl font-bold">Panel de Estadísticas</div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Content Grid */}
            <div className="px-6 space-y-4 mt-6">

                {/* 1. Fasting (Histogram) */}
                <FastingChart
                    data={fastingChartData}
                    timeRange={fastingRange}
                    onTimeRangeChange={setFastingRange}
                />

                {/* 2. Weight */}
                <WeightChart
                    data={weightData}
                    timeRange={weightRange}
                    onTimeRangeChange={setWeightRange}
                />

                {/* 3. Glucose & BP Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GlucoseChart
                        data={glucoseData}
                        timeRange={glucoseRange}
                        onTimeRangeChange={setGlucoseRange}
                    />
                    <BloodPressureChart
                        data={bpData}
                        timeRange={bpRange}
                        onTimeRangeChange={setBpRange}
                    />
                </div>

                {/* 4. Body Measurements (Bottom) */}
                <BodyMeasurementsChart
                    data={measurementsData}
                    timeRange="Año"
                    onTimeRangeChange={() => { }}
                />

            </div>
        </div>
    );
};

export default StatsDashboard;
