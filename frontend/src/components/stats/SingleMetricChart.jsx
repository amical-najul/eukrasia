import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SingleMetricChart = ({ data, title, icon: Icon, color = '#84cc16', unit, timeRange, onTimeRangeChange }) => {

    const formatXAxis = (tickItem) => {
        try {
            const date = new Date(tickItem);
            return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        } catch (e) {
            return tickItem;
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={20} className="text-slate-400" />}
                    <h3 className="text-white font-bold text-lg">{title}</h3>
                </div>
                {onTimeRangeChange && (
                    <div className="flex bg-slate-800/50 rounded-lg p-1">
                        {['week', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => onTimeRangeChange(range)}
                                className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all ${timeRange === range
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {range === 'week' ? 'Sem' : range === 'month' ? 'Mes' : 'Año'}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="text-center mb-2">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{unit}</span>
            </div>

            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`color${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatXAxis}
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
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                            itemStyle={{ color: color, fontWeight: 'bold' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            formatter={(value) => [value, unit]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#color${title.replace(/\s+/g, '')})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="text-center mt-4 text-xs text-slate-500 font-medium">
                {data && data.length > 0
                    ? `Tendencia de ${timeRange === 'week' ? 'la semana' : timeRange === 'month' ? 'últimos 30 días' : 'último año'}`
                    : 'Sin datos suficientes para graficar'}
            </div>
        </div>
    );
};

export default SingleMetricChart;
