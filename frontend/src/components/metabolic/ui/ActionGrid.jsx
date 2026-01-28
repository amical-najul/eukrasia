import React, { useState } from 'react';
import { Pill, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { PREDEFINED_LISTS } from '../../../data/metabolicData';

const Section = ({ title, items, category, onLog, breaker, infoMode, onInfo, collapsible = false, defaultOpen = false }) => {
    const [isExpanded, setIsExpanded] = useState(defaultOpen);

    return (
        <div className="bg-transparent">
            <div
                className={`flex justify-between items-center mb-3 px-2 ${collapsible ? 'cursor-pointer hover:bg-white/5 rounded-lg py-1 transition-colors' : ''}`}
                onClick={() => collapsible && setIsExpanded(!isExpanded)}
            >
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
                {collapsible && (
                    <div className="text-gray-500">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                )}
            </div>

            <div className={`grid grid-cols-2 lg:grid-cols-3 gap-3 transition-all duration-300 overflow-hidden ${(!collapsible || isExpanded) ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0'}`}>
                {items.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            // Add visual feedback animation
                            if (!infoMode && !breaker) {
                                e.currentTarget.classList.add('animate-pulse-green');
                                setTimeout(() => {
                                    e.currentTarget.classList.remove('animate-pulse-green');
                                }, 500);
                            }
                            infoMode ? onInfo(item) : onLog(item, category, breaker);
                        }}
                        className={`flex flex-col items-center justify-center p-5 rounded-3xl border transition-all duration-300 active:scale-95 relative overflow-hidden group shadow-lg
                            ${breaker
                                ? 'bg-slate-800/50 border-rose-500/10 hover:bg-rose-500/10 text-rose-100 hover:border-rose-500/40 shadow-rose-500/5'
                                : 'bg-slate-800/50 border-emerald-500/10 hover:bg-emerald-500/10 text-emerald-100 hover:border-emerald-500/40 shadow-emerald-500/5'}
                        `}
                    >
                        <span className="text-3xl mb-2 filter drop-shadow-md">{item.icon}</span>
                        <span className="text-xs font-bold text-center leading-tight opacity-90">{item.name}</span>

                        {/* Info Mode Indicator Overlay (optional) */}
                        {infoMode && (
                            <div className="absolute top-2 right-2 opacity-50 text-indigo-400">
                                <HelpCircle size={12} />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ActionGrid = ({ onLogItem, infoMode, onInfoClick, onOpenSupplements }) => {
    return (
        <div className="w-full space-y-6">
            <Section
                title="HIDRATACIÓN (Seguro)"
                items={PREDEFINED_LISTS.HYDRATION}
                category="HIDRATACION"
                onLog={onLogItem}
                breaker={false}
                infoMode={infoMode}
                onInfo={onInfoClick}
                collapsible={true}
            />
            <div className="bg-white/5 rounded-xl p-1 border border-white/10 my-4" /> {/* Divider */}

            {/* Supplements Section */}
            <div className="bg-transparent">
                <div className="flex justify-between items-center mb-3 px-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">SUPLEMENTACIÓN</h3>
                </div>
                <button
                    onClick={onOpenSupplements}
                    className="w-full flex items-center justify-between p-5 rounded-3xl border border-blue-500/10 bg-slate-800/50 hover:bg-blue-500/10 text-blue-100 hover:border-blue-500/40 shadow-blue-500/5 transition-all duration-300 active:scale-95 group"
                >
                    <div className="flex items-center gap-4">
                        <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform"><Pill size={32} /></span>
                        <div className="text-left">
                            <span className="block text-sm font-bold leading-tight">Checklist de Suplementos</span>
                            <span className="text-[10px] text-slate-400 font-medium">Gestionar tomas diarias</span>
                        </div>
                    </div>
                    <ChevronDown size={20} className="text-slate-500 -rotate-90" />
                </button>
            </div>

            <div className="bg-white/5 rounded-xl p-1 border border-white/10 my-4" /> {/* Divider */}

            <Section
                title="NUTRICIÓN (Rompe Ayuno)"
                items={PREDEFINED_LISTS.NUTRITION}
                category="COMIDA_REAL"
                onLog={onLogItem}
                breaker={true}
                // Nutrition typically always requires flow (camera), so infoMode might not apply or just show description.
                // Assuming Nutrition always opens Camera Modal for now.
                collapsible={true}
                defaultOpen={true}
            />
        </div>
    );
};

export default ActionGrid;
