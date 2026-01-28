
import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FastingChart = ({ data, timeRange, onTimeRangeChange }) => {
    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem || new Date()); // Fallback if invalid
        // For 'Year', maybe show Month? For 'Month', show Day?
        // Let's stick to short date for now
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' });
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xl">⏳</span>
                    <h3 className="text-white font-bold text-lg">Ayunos</h3>
                </div>
                <div className="flex bg-slate-800/50 rounded-lg p-1">
                    {['Semana', 'Mes', 'Año'].map((range) => (
                        <button
                            key={range}
                            onClick={() => onTimeRangeChange(range)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeRange === range
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-center mb-2">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Horas por Día</span>
            </div>

            <div className="h-64 w-full">
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
                            tickFormatter={(val) => `${val}h`}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            formatter={(value) => [`${value} horas`, 'Ayuno']}
                        />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.value >= 16 ? '#84cc16' : '#3b82f6'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-between items-center text-sm px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-slate-400 text-xs">Ayuno &lt; 16h</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-lime-500"></div>
                    <span className="text-slate-400 text-xs">Ayuno 16h+</span>
                </div>
            </div>
        </div>
    );
};

export default FastingChart;
