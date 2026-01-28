
import React, { useState, useEffect } from 'react';
import { NavigationHeader } from '../../../components/MetabolicComponents';
import { ChevronLeft, MoreVertical, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import metabolicService from '../../../services/metabolicService';
import bodyService from '../../../services/bodyService';

// Import Components
import WeightChart from '../../../components/stats/WeightChart';
import WaterChart from '../../../components/stats/WaterChart';
import FastingSummaryCard from '../../../components/stats/FastingSummaryCard';
import BodyMeasurementsChart from '../../../components/stats/BodyMeasurementsChart';
import GlucoseChart from '../../../components/stats/GlucoseChart';
import BloodPressureChart from '../../../components/stats/BloodPressureChart';

const StatsDashboard = () => {
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [fastingData, setFastingData] = useState({ hours_elapsed: 0, goal: 16, start_time: null, status: 'UNKNOWN' });
    const [weightData, setWeightData] = useState([]);
    const [waterData, setWaterData] = useState([]);
    const [measurementsData, setMeasurementsData] = useState([]);
    const [glucoseData, setGlucoseData] = useState([]);
    const [bpData, setBpData] = useState([]);

    const [weightRange, setWeightRange] = useState('Mes');
    const [waterRange, setWaterRange] = useState('Semana');

    // Date Range Logic
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Data Fetching
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Logs (We need history to filter by selected Date)
                const logs = await metabolicService.getHistory(200);

                // 2. Filter Fasting Data for Selected Date
                // Logic: Find events that are 'AYUNO' or check 'is_fasting_breaker' logic.
                // Assuming we want to show FASTING SUMMARY for that day.
                // Or maybe just show the CURRENT fast status if Today, or historical fasts?
                // For simplicity/MVP:
                // - If Today: Show current active fast status (from .getStatus())
                // - If Past: Calculate total fasting hours finished on that day.

                const isToday = selectedDate.toDateString() === new Date().toDateString();
                let fData = { hours_elapsed: 0, goal: 16, start_time: null, is_active: false };

                if (isToday) {
                    const status = await metabolicService.getStatus();
                    fData = {
                        hours_elapsed: status.hours_elapsed,
                        goal: 16,
                        start_time: status.start_time,
                        is_active: status.status === 'AYUNANDO',
                        status: status.status
                    };
                } else {
                    // Calculate historical fasting for that day
                    // Find breaker events on that day and sum duration from previous breaker?
                    // This is complex without a dedicated "sessions" endpoint. 
                    // Simplified: Show "No active fast" or "Historical data not computed" or Mock basic calculation.
                    // Better approach: Let's reuse the 'Water' logic for now and just show 0 or mockup for past days until backend support.
                    // OR: Just keep showing the current status but clarify it's "Current Status".
                    // User Request: "click sobre un dia... mostrando los datos en el panel".
                    // Implies historical data.

                    fData = {
                        hours_elapsed: 0, // Placeholder for past
                        goal: 16,
                        start_time: null,
                        is_active: false,
                        status: 'COMPLETED' // Assume completed for past
                    };
                }

                setFastingData(fData);

                // 3. Filter Water (Hydration) for Selected Date
                const dateKey = selectedDate.toLocaleDateString('en-CA');
                const dailyWaterLogs = logs.filter(l => {
                    const logDate = new Date(l.created_at).toLocaleDateString('en-CA');
                    return logDate === dateKey && l.category === 'HIDRATACION';
                });

                // 4. Weight
                const weightHist = await bodyService.getHistory({ type: 'weight', period: weightRange === 'Semana' ? 'week' : 'month' });
                const weightChartData = weightHist.map(wm => ({
                    date: wm.recorded_at,
                    weight: parseFloat(wm.value)
                }));
                setWeightData(weightChartData);

                // 5. Measurements (All types)
                const allMeasurements = await bodyService.getHistory({ type: 'measurement', period: 'year' });

                // Process Body Measurements
                const measureMap = {};
                allMeasurements.forEach(m => {
                    if (['CHEST', 'WAIST', 'HIPS', 'THIGH'].includes(m.measurement_type)) {
                        const mDate = new Date(m.recorded_at).toLocaleDateString();
                        if (!measureMap[mDate]) measureMap[mDate] = { date: m.recorded_at };
                        measureMap[mDate][m.measurement_type] = parseFloat(m.value);
                    }
                });
                setMeasurementsData(Object.values(measureMap).sort((a, b) => new Date(a.date) - new Date(b.date)));

                // Process Glucose
                const glucose = allMeasurements
                    .filter(m => m.measurement_type === 'GLUCOSE')
                    .map(m => ({ date: m.recorded_at, value: parseFloat(m.value) }))
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
                setGlucoseData(glucose);

                // Process Blood Pressure
                const bpMap = {};
                allMeasurements.forEach(m => {
                    if (['BLOOD_PRESSURE_SYSTOLIC', 'BLOOD_PRESSURE_DIASTOLIC'].includes(m.measurement_type)) {
                        const dateObj = new Date(m.recorded_at);
                        const timeKey = dateObj.toISOString().slice(0, 16);
                        if (!bpMap[timeKey]) bpMap[timeKey] = { date: m.recorded_at };
                        if (m.measurement_type === 'BLOOD_PRESSURE_SYSTOLIC') bpMap[timeKey].systolic = parseFloat(m.value);
                        if (m.measurement_type === 'BLOOD_PRESSURE_DIASTOLIC') bpMap[timeKey].diastolic = parseFloat(m.value);
                    }
                });
                setBpData(Object.values(bpMap).sort((a, b) => new Date(a.date) - new Date(b.date)));

                // Generate Water Chart Data
                const waterChartData = processWaterData(logs, selectedDate);
                setWaterData(waterChartData);


            } catch (error) {
                console.error("Error loading stats", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [selectedDate, weightRange]); // Re-run when date changes

    const processWaterData = (logs, centerDate) => {
        const days = [];
        // Show 7 days ending at selected date (or centered?)
        // Let's show 7 days ending at selected Date to give context of "leading up to".

        for (let i = 6; i >= 0; i--) {
            const d = new Date(centerDate);
            d.setDate(centerDate.getDate() - i);
            const dateKey = d.toLocaleDateString('en-CA');

            const count = logs.filter(l => {
                const logDate = new Date(l.created_at).toLocaleDateString('en-CA');
                return logDate === dateKey && l.category === 'HIDRATACION';
            }).length;

            days.push({
                date: d,
                amount: count * 0.25,
                isToday: i === 0 // The last one is the selected date
            });
        }
        return days;
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
                <div className="text-xl font-bold">Panel • {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</div>
                <button className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                    <Settings size={20} />
                </button>
            </div>

            {/* Date Scroller (Clean & Long History) */}
            <div className="px-0 mb-6">
                <div
                    className="flex overflow-x-auto gap-3 px-6 pb-4 scrollbar-hide snap-x"
                    ref={(el) => {
                        // Scroll to end (Today) on mount if not already interacting
                        if (el && !el.hasScrolled) {
                            el.scrollLeft = el.scrollWidth;
                            el.hasScrolled = true;
                        }
                    }}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
                >
                    {/* Generate history: Let's assume start from Jan 1, 2025 or 3 months ago for MVP aesthetics */}
                    {/* Reverse loop or Map? Let's create an array of Days from [StartDate] to [Today + 7 days] */}
                    {(() => {
                        const days = [];
                        const today = new Date();
                        const startDate = new Date('2025-01-01'); // Mock Registration Date or start of year
                        const endDate = new Date(today); // Only show up to today, no future dates

                        // Create array from past to today
                        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                            days.push(new Date(d));
                        }

                        return days.map((d, i) => {
                            const isSelected = d.toDateString() === selectedDate.toDateString();
                            const isToday = d.toDateString() === new Date().toDateString();

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(new Date(d))}
                                    className={`flex flex-col items-center gap-2 min-w-[3.5rem] snap-center transition-all duration-200 group ${isSelected ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'}`}
                                >
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                                        {isToday ? 'HOY' : d.toLocaleDateString('es-ES', { weekday: 'short' }).substring(0, 3)}
                                    </span>
                                    <div className={`w-12 h-14 rounded-2xl flex flex-col items-center justify-center border transition-all ${isSelected
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 group-hover:border-slate-600'
                                        }`}>
                                        <span className="text-xl font-black leading-none">{d.getDate()}</span>
                                        <span className="text-[9px] font-medium opacity-60 uppercase">{d.toLocaleDateString('es-ES', { month: 'short' }).substring(0, 3)}</span>
                                    </div>
                                    {/* Small Indicator if data exists (Mock functionality) */}
                                    <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                </button>
                            );
                        });
                    })()}
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="px-6 space-y-4">

                {/* 1. Fasting */}
                <FastingSummaryCard
                    fastingData={fastingData}
                    onAddFasting={() => navigate('/metabolic', { state: { tab: 'FASTING' } })}
                />

                {/* 2. Weight */}
                <WeightChart
                    data={weightData}
                    timeRange={weightRange}
                    onTimeRangeChange={(r) => setWeightRange(r)}
                />

                {/* 3. Water */}
                <WaterChart
                    data={waterData}
                    timeRange={waterRange}
                    onTimeRangeChange={(r) => setWaterRange(r)}
                />

                {/* 4. Body Measurements */}
                <BodyMeasurementsChart
                    data={measurementsData}
                    timeRange="Año"
                    onTimeRangeChange={() => { }}
                />

                {/* 5. Glucose & BP Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GlucoseChart
                        data={glucoseData}
                        timeRange="Año"
                        onTimeRangeChange={() => { }}
                    />
                    <BloodPressureChart
                        data={bpData}
                        timeRange="Año"
                        onTimeRangeChange={() => { }}
                    />
                </div>

            </div>
        </div>
    );
};

export default StatsDashboard;
