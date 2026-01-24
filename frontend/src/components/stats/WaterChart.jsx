
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WaterChart = ({ data, timeRange, onTimeRangeChange }) => {
    // Helper to format days
    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        return date.toLocaleDateString('es-ES', { weekday: 'narrow' }); // L, M, X...
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xl">💧</span>
                    <h3 className="text-white font-bold text-lg">Agua</h3>
                </div>

                <button className="flex items-center gap-1 text-xs text-blue-400 font-bold uppercase tracking-wider hover:text-blue-300">
                    Todo <span className="text-lg">›</span>
                </button>
            </div>

            <div className="flex justify-center mb-6">
                <div className="flex bg-slate-800/50 rounded-full p-1">
                    {['Semana', 'Mes', 'Año'].map((range) => (
                        <button
                            key={range}
                            onClick={() => onTimeRangeChange(range)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${timeRange === range
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-center mb-2">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Unidades: L</span>
            </div>

            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(56, 189, 248, 0.05)' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                            itemStyle={{ color: '#38bdf8' }}
                            labelStyle={{ color: '#94a3b8' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                        />
                        <Bar dataKey="amount" radius={[4, 4, 4, 4]} barSize={8}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.isToday ? '#38bdf8' : '#1e293b'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WaterChart;
