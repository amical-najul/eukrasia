
import React from 'react';
import { Plus, Play, Info } from 'lucide-react';

const FastingSummaryCard = ({ fastingData, onAddFasting }) => {
    // Determine progress percentage (capped at 100%)
    const percentage = Math.min((fastingData.hours_elapsed / fastingData.goal) * 100, 100);

    // Determine color based on phase/progress (simplified logic for UI demo)
    const activeColor = 'bg-blue-500';

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 z-10 relative">
                <div className="flex items-center gap-2">
                    <span className="text-xl">⏳</span>
                    <h3 className="text-white font-bold text-lg">Ayunos</h3>
                </div>
                <button
                    onClick={onAddFasting}
                    className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* Main Stats */}
            <div className="mb-4 z-10 relative">
                <div className="text-blue-400 text-sm font-medium mb-1">Total del día: {Math.floor(fastingData.hours_elapsed)}h {Math.round((fastingData.hours_elapsed % 1) * 60)}m</div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Current/Last Fast Details */}
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                            Ayuno de {fastingData.goal || 16}:8
                        </span>
                        <button className="text-slate-500 hover:text-slate-300"><Info size={12} /></button>
                    </div>
                    {/* Simplified timestamps logic for UI */}
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Play size={8} className="fill-current" />
                            {fastingData.start_time ? new Date(fastingData.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </div>
                        {/* Placeholder end time */}
                        {/* <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                             <Square size={8} className="fill-current" /> 
                             22:30 p. m.
                        </div> */}
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-slate-200 font-bold text-sm block">{Math.floor(fastingData.hours_elapsed)}h {Math.round((fastingData.hours_elapsed % 1) * 60)}m</span>
                </div>
            </div>
        </div>
    );
};

export default FastingSummaryCard;
