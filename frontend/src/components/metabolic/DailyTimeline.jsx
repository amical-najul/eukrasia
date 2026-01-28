import React from 'react';
import { Droplet, Pill, Apple, Brain, CheckCircle, Circle, Clock } from 'lucide-react';

const DailyTimeline = ({ history, protocolTasks, onTaskClick, onLogEdit }) => {

    // 1. Fusionar Tasks (Futuro/Pendiente) y History (Pasado/Completado)
    // Para simplificar: Mostramos TODO lo del protocolo como "Plan del Día" 
    // y marcamos visualmente lo que ya se hizo cruzando con el history.

    // Agrupar tasks completados hoy del protocolo
    const completedTaskIds = new Set();
    // (Esta lógica idealmente vendría del backend, pero asumimos que protocolTasks trae el estado 'completed')
    // Nota: El backend de protocolSystem devuelve 'today_log.tasks_completed' que es un array de IDs.

    // Merge Logic:
    // Elements in timeline:
    // - Protocol Tasks (Fixed schedule)
    // - Extraneous Logs (Things logged outside protocol)

    // Vamos a renderizar una lista ordenada.
    // Los items de protocolo tienen prioridad de orden.

    const renderIcon = (category, isCompleted) => {
        const colorClass = isCompleted ? 'text-slate-900' : 'text-slate-400';
        switch (category) {
            case 'HIDRATACION': return <Droplet size={18} className={colorClass} />;
            case 'SUPLEMENTO': return <Pill size={18} className={colorClass} />;
            case 'COMIDA_REAL': return <Apple size={18} className={colorClass} />;
            case 'ESTADO': return <Brain size={18} className={colorClass} />;
            default: return <Circle size={18} className={colorClass} />;
        }
    };

    return (
        <div className="space-y-6 relative ml-4 font-ui">
            {/* Línea vertical conectora */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800 -z-10"></div>

            {/* Render Protocol Tasks (The "Plan") */}
            {protocolTasks && protocolTasks.map((task, index) => {
                const isCompleted = task.completed;
                return (
                    <div key={`task-${task.id}`} className="flex items-start gap-4 Group">
                        {/* Timeline Node */}
                        <div
                            onClick={() => onTaskClick(task)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all cursor-pointer z-10 shrink-0
                                ${isCompleted
                                    ? 'bg-lime-500 border-slate-900 shadow-[0_0_15px_rgba(132,204,22,0.4)] scale-105'
                                    : 'bg-slate-900 border-slate-700 hover:border-lime-500 hover:text-lime-500'
                                }
                            `}
                        >
                            {isCompleted ? <CheckCircle size={20} className="text-slate-900" /> : renderIcon(task.category || 'GENERIC', false)}
                        </div>

                        {/* Content Card */}
                        <div
                            onClick={() => onTaskClick(task)}
                            className={`flex-1 p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden
                                ${isCompleted
                                    ? 'bg-slate-800/50 border-lime-500/30'
                                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-black text-sm uppercase tracking-wide ${isCompleted ? 'text-lime-400' : 'text-slate-200'}`}>
                                    {task.name}
                                </h4>
                                {task.time && (
                                    <span className="text-[10px] font-bold bg-slate-950 px-2 py-1 rounded-full text-slate-500 flex items-center gap-1">
                                        <Clock size={10} /> {task.time}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                {task.description}
                            </p>

                            {/* Visual Indicator of "Pending" */}
                            {!isCompleted && (
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 to-transparent"></div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Extra Logs (Things that were not in the plan) */}
            {history && history.length > 0 && (
                <div className="pt-8">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4 pl-14">Registro Adicional</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                        {history.map(log => (
                            <div key={log.id} className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                                <div className="w-10 flex justify-center shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                </div>
                                <div
                                    className="flex-1 bg-slate-800/30 rounded-xl p-3 border border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition-all"
                                    onClick={() => onLogEdit(log)}
                                >
                                    <span className="text-xs text-slate-300 font-bold">{log.item_name}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyTimeline;
