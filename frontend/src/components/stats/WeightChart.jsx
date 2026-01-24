
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WeightChart = ({ data, timeRange, onTimeRangeChange }) => {
    // Helper to format ticks
    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xl">⚖️</span>
                    <h3 className="text-white font-bold text-lg">Peso</h3>
                </div>
                <div className="flex bg-slate-800/50 rounded-lg p-1">
                    {['Semana', 'Mes', 'Año'].map((range) => (
                        <button
                            key={range}
                            onClick={() => onTimeRangeChange(range)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeRange === range
                                    ? 'bg-yellow-500/20 text-yellow-500 shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                            </linearGradient>
                        </defs>
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
                            domain={['auto', 'auto']}
                            stroke="#475569"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                            itemStyle={{ color: '#eab308' }}
                            labelStyle={{ color: '#94a3b8' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        />
                        <Area
                            type="monotone"
                            dataKey="weight"
                            stroke="#eab308"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorWeight)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-between items-center text-sm">
                <div className="text-slate-500">
                    Meta: <span className="text-slate-300 font-bold">75 kg</span>
                </div>
                <div className="text-yellow-500 font-bold">
                    Actual: {data && data.length > 0 ? data[data.length - 1].weight : '--'} kg
                </div>
            </div>
        </div>
    );
};

export default WeightChart;
