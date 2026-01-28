
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BodyMeasurementsChart = ({ data, timeRange, onTimeRangeChange }) => {
    // data is expected to be an array of objects: { date, CHEST, WAIST, HIPS, THIGH, ... }

    const [activeSeries, setActiveSeries] = useState({
        CHEST: true,
        WAIST: true,
        HIPS: true,
        THIGH: true
    });

    const toggleSeries = (key) => {
        setActiveSeries(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const seriesConfig = {
        CHEST: { label: 'Pecho', color: '#38bdf8' }, // Sky Blue
        WAIST: { label: 'Cintura', color: '#eab308' }, // Yellow
        HIPS: { label: 'Caderas', color: '#f472b6' }, // Pink
        THIGH: { label: 'Muslo', color: '#4ade80' }  // Green
    };

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' });
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xl">📏</span>
                    <h3 className="text-white font-bold text-lg">Medidas Corporales</h3>
                </div>
                <div className="flex bg-slate-800/50 rounded-lg p-1">
                    {['Semana', 'Mes', 'Año'].map((range) => (
                        <button
                            key={range}
                            onClick={() => onTimeRangeChange(range)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeRange === range
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-2 mb-4">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mr-auto mt-1">Unidades: cm</span>
                {/* Legend / Toggles */}
                {Object.keys(seriesConfig).map(key => (
                    <button
                        key={key}
                        onClick={() => toggleSeries(key)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border transition-all ${activeSeries[key]
                            ? `border-${seriesConfig[key].color} text-white`
                            : 'border-slate-700 text-slate-500 hover:border-slate-500'
                            }`}
                        style={{
                            borderColor: activeSeries[key] ? seriesConfig[key].color : undefined,
                            backgroundColor: activeSeries[key] ? `${seriesConfig[key].color}20` : 'transparent'
                        }}
                    >
                        <span className={`inline-block w-2 h-2 rounded-full mr-1`} style={{ backgroundColor: seriesConfig[key].color }}></span>
                        {seriesConfig[key].label}
                    </button>
                ))}
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatXAxis}
                            stroke="#475569"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#475569"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                            labelStyle={{ color: '#94a3b8' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        />
                        {Object.keys(seriesConfig).map(key => (
                            activeSeries[key] && (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={seriesConfig[key].color}
                                    strokeWidth={3}
                                    dot={{ r: 3, fill: '#0f172a', strokeWidth: 2 }}
                                    activeDot={{ r: 5 }}
                                    connectNulls
                                />
                            )
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};

export default BodyMeasurementsChart;
