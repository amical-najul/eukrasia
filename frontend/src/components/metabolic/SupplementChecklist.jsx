import React, { useState, useEffect } from 'react';
import { SUPPLEMENTS, BLOCKS } from '../../constants/supplements';
import supplementService from '../../services/supplementService';
import { CheckCircle, Circle, AlertTriangle, Droplet, Utensils, Sun, Moon, CloudSun, Zap } from 'lucide-react';

const SupplementChecklist = ({ onToggle }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [date] = useState(new Date().toISOString().split('T')[0]); // Today YYYY-MM-DD

    useEffect(() => {
        fetchLogs();
    }, [date]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await supplementService.getDailyLog(date);
            setLogs(data.map(l => l.supplement_id));
        } catch (error) {
            console.error('Error fetching supplement logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            // Optimistic update
            const isChecked = logs.includes(id);
            setLogs(prev => isChecked ? prev.filter(l => l !== id) : [...prev, id]);

            await supplementService.toggleLog({ supplement_id: id, date });

            // Notify parent to refresh history
            if (onToggle) onToggle();
        } catch (error) {
            console.error('Error toggling log:', error);
            fetchLogs(); // Revert on error
        }
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'sun': return <Sun size={14} className="text-amber-500" />;
            case 'moon': return <Moon size={14} className="text-indigo-400" />;
            case 'sun_cloud': return <CloudSun size={14} className="text-orange-400" />;
            case 'meal': return <Utensils size={14} className="text-emerald-500" />;
            default: return null;
        }
    };

    // Group supplements by block
    const grouped = SUPPLEMENTS.reduce((acc, supp) => {
        const block = supp.block || 'any';
        if (!acc[block]) acc[block] = [];
        acc[block].push(supp);
        return acc;
    }, {});

    // Ordered blocks keys
    const blockKeys = ['morning', 'mid', 'night', 'any'];

    return (
        <div className="space-y-6">
            {blockKeys.map(blockKey => {
                const items = grouped[blockKey];
                if (!items) return null;
                const blockInfo = BLOCKS[blockKey];

                return (
                    <div key={blockKey} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span>{blockInfo.icon}</span> {blockInfo.label}
                        </h4>

                        <div className="space-y-2">
                            {items.map(supp => {
                                const isChecked = logs.includes(supp.id);
                                return (
                                    <div
                                        key={supp.id}
                                        onClick={() => handleToggle(supp.id)}
                                        className={`
                                            flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border
                                            ${isChecked
                                                ? 'bg-lime-500/10 border-lime-500/30 shadow-[0_0_10px_rgba(132,204,22,0.1)]'
                                                : 'bg-slate-800 border-transparent hover:bg-slate-700 hover:border-slate-600'}
                                        `}
                                    >
                                        <div className={`mt-0.5 transition-transform ${isChecked ? 'scale-110 text-lime-500' : 'text-slate-600'}`}>
                                            {isChecked ? <CheckCircle size={20} className="fill-current" /> : <Circle size={20} />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h5 className={`font-bold text-sm ${isChecked ? 'text-lime-100' : 'text-slate-300'}`}>
                                                    {supp.name}
                                                </h5>
                                                <div className="flex gap-1">
                                                    {supp.icons.map(ic => <span key={ic}>{getIcon(ic)}</span>)}
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-500 mt-1 leading-snug">{supp.details}</p>

                                            {/* Warnings / Badges */}
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {supp.warning === 'requires_fat' && (
                                                    <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-amber-500/20">
                                                        <Droplet size={10} className="fill-current" /> Requiere Grasa
                                                    </span>
                                                )}
                                                {supp.warning === 'with_meal' && (
                                                    <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-emerald-500/20">
                                                        <Utensils size={10} className="fill-current" /> Con Comida
                                                    </span>
                                                )}
                                                {supp.warning === 'dose_2_caps' && (
                                                    <span className="flex items-center gap-1 text-[10px] bg-slate-600 text-slate-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                        2 Cápsulas
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SupplementChecklist;
