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

const ActionGrid = ({ onLogItem, infoMode, onInfoClick, onOpenSupplements, categoryFilter }) => {
    return (
        <div className="w-full space-y-6">
            {(categoryFilter === 'ALL' || categoryFilter === 'HYDRATION') && (
                <Section
                    title="HIDRATACIÓN (Seguro)"
                    items={PREDEFINED_LISTS.HYDRATION}
                    category="HIDRATACION"
                    onLog={onLogItem}
                    breaker={false}
                    infoMode={infoMode}
                    onInfo={onInfoClick}
                    collapsible={categoryFilter === 'ALL'}
                    defaultOpen={true}
                />
            )}

            {categoryFilter === 'ALL' && <div className="bg-white/5 rounded-xl p-1 border border-white/10 my-4" />}

            {(categoryFilter === 'ALL' || categoryFilter === 'NUTRITION') && (
                <Section
                    title="NUTRICIÓN (Rompe Ayuno)"
                    items={PREDEFINED_LISTS.NUTRITION}
                    category="COMIDA_REAL"
                    onLog={onLogItem}
                    breaker={true}
                    infoMode={infoMode}
                    onInfo={onInfoClick}
                    collapsible={categoryFilter === 'ALL'}
                    defaultOpen={true}
                />
            )}
        </div>
    );
};

export default ActionGrid;
