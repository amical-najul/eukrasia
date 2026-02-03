
import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ErrorBar } from 'recharts';

const BloodPressureChart = ({ data, timeRange, onTimeRangeChange }) => {
    // Data expected: { date, systolic, diastolic }
    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xl">❤️</span>
                    <h3 className="text-white font-bold text-lg">Presión Arterial</h3>
                </div>
                <div className="flex bg-slate-800/50 rounded-lg p-1">
                    {['week', 'month', 'year'].map((range) => (
                        <button
                            key={range}
                            onClick={() => onTimeRangeChange(range)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeRange === range
                                ? 'bg-indigo-500/20 text-indigo-400 shadow-sm'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {range === 'week' ? 'Sem' : range === 'month' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-center mb-2">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">mmHg</span>
            </div>

            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            domain={[40, 180]}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                            labelStyle={{ color: '#94a3b8' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            formatter={(value, name) => [value, name === 'systolic' ? 'Sistólica' : 'Diastólica']}
                        />

                        {/* Systolic Line */}
                        <Line
                            type="monotone"
                            dataKey="systolic"
                            stroke="#818cf8"
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#818cf8' }}
                            connectNulls
                        />

                        {/* Diastolic Line */}
                        <Line
                            type="monotone"
                            dataKey="diastolic"
                            stroke="#c084fc"
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#c084fc' }}
                            connectNulls
                        />

                        {/* Range Bar (Optional visual aid to connect them?) */}
                        {/* For simplicity just lines for now, or we can add a 'range' area if we process the data */}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BloodPressureChart;
