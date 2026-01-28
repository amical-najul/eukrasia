
import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const FastingHistoryModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    // Data expected format: [{ day: 'L', date: '...', hours: 14.5, goal: 16 }]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="text-xl">📊</span> Historial de Ayunos
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Chart Container */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <button className="p-1 text-slate-500 hover:text-slate-300"><ChevronLeft size={20} /></button>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resumen Semanal</span>
                        <button className="p-1 text-slate-500 hover:text-white"><ChevronRight size={20} /></button>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="#475569"
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
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
                                    labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                                    formatter={(value) => [`${value} horas`, 'Ayuno']}
                                />
                                <Bar dataKey="hours" radius={[4, 4, 4, 4]} barSize={12}>
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.isToday ? '#3b82f6' : (entry.hours >= (entry.goal || 16) ? '#84cc16' : '#a3e635')}
                                            className="transition-all duration-300 hover:opacity-80"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend / Stats */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Promedio Semanal</span>
                            <span className="text-xl font-mono font-bold text-lime-400">
                                {data.length > 0 ? (data.reduce((acc, curr) => acc + curr.hours, 0) / data.length).toFixed(1) : 0}h
                            </span>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Racha Actual</span>
                            <span className="text-xl font-mono font-bold text-blue-400">
                                {data.filter(d => d.hours > 0).length} días
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FastingHistoryModal;
