import React, { useState } from 'react';
import { ChevronDown, Edit3, Check } from 'lucide-react';

const StatusCircle = ({ statusData, onClick, onEditStartTime }) => {
    const { status, phase, phaseColor, hours_elapsed, start_time } = statusData;
    const [showTotalHours, setShowTotalHours] = useState(false);
    const [fastingGoal, setFastingGoal] = useState(16); // Default 16h goal
    const [selectedPhase, setSelectedPhase] = useState(null); // For phase info modal

    // --- Circular Progress Logic ---
    const radius = 138; // SVG radius (Increased ~15%)
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // Progress calculation based on goal
    const progressPercent = Math.min((hours_elapsed / fastingGoal) * 100, 100);
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    // Color Logic
    const colorMap = {
        'blue': '#3b82f6', // Anabólica
        'cyan': '#06b6d4', // Catabólica
        'teal': '#14b8a6', // Quema Grasa
        'green-light': '#34d399', // Autofagia Leve
        'green-intense': '#16a34a', // Agotamiento Glucógeno
        'yellow': '#eab308', // Pico Ghrelina
        'orange': '#f97316', // Cetosis Profunda
        'red': '#ef4444', // Autofagia Máxima
        'rose': '#fb7185', // Limpieza Hepática
        'pink': '#ec4899', // Euforia
        'purple': '#a855f7', // Células Madre
        'violet': '#7c3aed', // Piel
        'gold': '#f59e0b', // Terapéutico
        'gray': '#9ca3af'
    };

    const currentColor = colorMap[phaseColor] || colorMap['gray'];

    // Icons placement on the circle with detailed phase information
    const markers = [
        {
            hours: 12,
            icon: '🌱',
            color: '#34d399',
            label: '12h',
            name: 'Autofagia Leve',
            description: 'Tu cuerpo comienza el proceso de reciclaje celular. Las células empiezan a limpiar componentes dañados.',
            benefits: ['Inicio de limpieza celular', 'Reducción de inflamación', 'Mejora de sensibilidad insulínica']
        },
        {
            hours: 16,
            icon: '🔥',
            color: '#f97316',
            label: '16h',
            name: 'Quema de Grasa Intensa',
            description: 'El glucógeno hepático se agota. Tu cuerpo cambia a quemar grasa como combustible principal.',
            benefits: ['Cetosis leve iniciada', 'Máxima oxidación de grasa', 'Hormona de crecimiento elevada']
        },
        {
            hours: 18,
            icon: '🧠',
            color: '#a855f7',
            label: '18h',
            name: 'Cetosis y Claridad Mental',
            description: 'Niveles significativos de cetonas. Tu cerebro utiliza cetonas como combustible, mejorando la concentración.',
            benefits: ['Claridad mental óptima', 'BDNF elevado (factor neurotrópico)', 'Reducción de ansiedad por comida']
        },
        {
            hours: 24,
            icon: '♻️',
            color: '#ef4444',
            label: '24h',
            name: 'Autofagia Profunda',
            description: 'Autofagia máxima. Las células se reciclan intensamente, eliminando proteínas dañadas y organelos.',
            benefits: ['Regeneración celular máxima', 'Eliminación de células senescentes', 'Reset metabólico completo']
        },
        {
            hours: 36,
            icon: '🧬',
            color: '#06b6d4',
            label: '36h',
            name: 'Regeneración Celular',
            description: 'La autofagia alcanza niveles terapéuticos. Las células dañadas son recicladas y reemplazadas por nuevas.',
            benefits: ['Renovación del sistema inmune', 'Reducción de tumores benignos', 'Reparación de ADN acelerada']
        },
        {
            hours: 48,
            icon: '⚡',
            color: '#eab308',
            label: '48h',
            name: 'Hormona de Crecimiento x5',
            description: 'La hormona de crecimiento aumenta hasta 5 veces. Máxima preservación muscular y quema de grasa.',
            benefits: ['HGH elevada 500%', 'Protección muscular máxima', 'Rejuvenecimiento celular intenso']
        },
        {
            hours: 72,
            icon: '🛡️',
            color: '#ec4899',
            label: '72h',
            name: 'Reset Sistema Inmune',
            description: 'El cuerpo recicla células inmunes viejas y genera nuevas células madre. Reset completo del sistema inmunológico.',
            benefits: ['Células madre nuevas', 'Sistema inmune renovado', 'Reducción de autoinmunidad']
        },
        {
            hours: 96,
            icon: '✨',
            color: '#8b5cf6',
            label: '96h',
            name: 'Limpieza Profunda',
            description: 'Niveles máximos de cetosis y autofagia sostenida. El cuerpo elimina tejido dañado y células precancerosas.',
            benefits: ['Eliminación de células precancerosas', 'Reducción de inflamación sistémica', 'Claridad mental extraordinaria']
        },
        {
            hours: 120,
            icon: '🌟',
            color: '#f59e0b',
            label: '120h',
            name: 'Transformación Metabólica',
            description: 'Transformación metabólica completa. El cuerpo ha optimizado todos sus sistemas de reciclaje y reparación.',
            benefits: ['Flexibilidad metabólica total', 'Rejuvenecimiento visible', 'Reset hormonal completo']
        }
    ];

    // Helper to calculate position on circle
    const getPosition = (hours) => {
        const percentage = Math.min((hours / fastingGoal), 1);
        const angle = (percentage * 360) - 90; // -90 to start at top
        const radians = angle * (Math.PI / 180);
        const r = radius - 20; // Inner radius for icons
        const x = radius + r * Math.cos(radians);
        const y = radius + r * Math.sin(radians);
        return { x, y };
    };

    // Calculate End Time
    const calculateEndTime = () => {
        if (!start_time) return null;
        const start = new Date(start_time);
        const end = new Date(start.getTime() + fastingGoal * 60 * 60 * 1000);
        return end;
    };

    const endTime = calculateEndTime();

    // Format helpers
    const formatTime = (totalHours) => {
        if (!totalHours) return '0h 0m';
        if (showTotalHours) return `${totalHours.toFixed(1)}h`;
        const totalMinutes = Math.floor(totalHours * 60);
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="flex flex-col items-center justify-center py-4 relative">
            {/* Circular Progress Container */}
            <div className="relative w-80 h-80 flex items-center justify-center">

                {/* SVG Ring */}
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="absolute inset-0 rotate-0 transform"
                    style={{ filter: `drop-shadow(0 0 10px ${currentColor}40)` }}
                >
                    {/* Background Track */}
                    <circle
                        stroke="#1e293b"
                        strokeWidth={stroke}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    {/* Progress Track */}
                    <circle
                        stroke={currentColor}
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        transform={`rotate(-90 ${radius} ${radius})`}
                    />
                </svg>

                {/* Icons Markers on Track - CLICKABLE for phase info */}
                {markers.map(m => {
                    const pos = getPosition(m.hours);
                    const isActive = hours_elapsed >= m.hours;
                    if (m.hours > fastingGoal) return null;

                    return (
                        <div
                            key={m.hours}
                            onClick={() => setSelectedPhase(m)}
                            className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-lg border-2 transition-all z-20 cursor-pointer hover:scale-125
                                ${isActive ? 'bg-slate-900 border-white scale-110' : 'bg-slate-800 border-slate-600 grayscale opacity-70'}
                            `}
                            style={{
                                left: pos.x - 16,
                                top: pos.y - 16,
                                borderColor: isActive ? m.color : '#475569'
                            }}
                            title={`Click para ver info de ${m.name}`}
                        >
                            {m.icon}
                        </div>
                    );
                })}


                {/* Center Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-bold">Ayuno por</div>

                    <div
                        className="text-4xl font-black text-white tabular-nums tracking-tight cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setShowTotalHours(!showTotalHours)}
                    >
                        {formatTime(hours_elapsed)}
                    </div>

                    <div className="text-sm font-medium text-slate-400 mt-1 mb-4 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full`} style={{ background: currentColor }}></span>
                        {phase.split(':')[0]} {/* e.g. "Fase 1" */}
                    </div>

                    {/* Goal Selector (Mini) */}
                    <div className="flex items-center gap-2 bg-slate-800/50 rounded-full px-3 py-1 border border-slate-700">
                        <span className="text-[10px] text-slate-500 font-black uppercase">Meta</span>
                        <select
                            value={fastingGoal}
                            onChange={(e) => setFastingGoal(Number(e.target.value))}
                            className="bg-transparent text-xs font-bold text-lime-400 outline-none appearance-none cursor-pointer text-center"
                        >
                            <option value={12}>12h</option>
                            <option value={14}>14h</option>
                            <option value={16}>16h</option>
                            <option value={18}>18h</option>
                            <option value={20}>20h</option>
                            <option value={24}>24h</option>
                            <option value={36}>36h</option>
                            <option value={48}>48h</option>
                            <option value={72}>72h</option>
                            <option value={96}>96h</option>
                            <option value={120}>120h</option>
                        </select>
                        <ChevronDown size={10} className="text-slate-500" />
                    </div>
                </div>

                {/* Click overlay for Info */}
                <div onClick={onClick} className="absolute inset-0 z-0 cursor-pointer rounded-full" title="Ver información de fase"></div>
            </div>

            {/* Bottom Controls: Start/End Times */}
            <div className="w-full max-w-xs mt-6 flex justify-between items-center text-xs px-4">
                <div className="text-left">
                    <p className="text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        Inicio
                        <button onClick={(e) => { e.stopPropagation(); onEditStartTime(); }} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                            <Edit3 size={12} />
                        </button>
                    </p>
                    <p className="text-slate-300 font-mono">
                        {start_time ? new Date(start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                    <p className="text-slate-500 text-[10px]">
                        {start_time ? new Date(start_time).toLocaleDateString([], { weekday: 'short', day: 'numeric' }) : ''}
                    </p>
                </div>

                <div className="h-8 w-[1px] bg-slate-800"></div>

                <div className="text-right">
                    <p className="text-slate-500 font-bold uppercase tracking-widest mb-1">Fin Estimado</p>
                    <p className="text-lime-400 font-mono font-bold">
                        {endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                    <p className="text-slate-500 text-[10px]">
                        {endTime ? endTime.toLocaleDateString([], { weekday: 'short', day: 'numeric' }) : ''}
                    </p>
                </div>
            </div>

            {/* Progress Bar Label */}
            <div className="mt-4 w-full max-w-xs bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-lime-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">{Math.round(progressPercent)}% Completado</p>

            {/* Phase Info Modal */}
            {selectedPhase && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhase(null)}
                >
                    <div
                        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 max-w-sm w-full border shadow-2xl"
                        style={{ borderColor: selectedPhase.color }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                                style={{ backgroundColor: `${selectedPhase.color}20`, border: `2px solid ${selectedPhase.color}` }}
                            >
                                {selectedPhase.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">{selectedPhase.name}</h3>
                                <p className="text-sm font-bold" style={{ color: selectedPhase.color }}>
                                    A partir de {selectedPhase.hours} horas
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                            {selectedPhase.description}
                        </p>

                        {/* Benefits */}
                        <div className="space-y-2 mb-6">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Beneficios</h4>
                            {selectedPhase.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Check size={14} style={{ color: selectedPhase.color }} />
                                    <span className="text-slate-300 text-sm">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        {/* Status */}
                        <div
                            className={`text-center py-3 rounded-xl font-bold text-sm ${hours_elapsed >= selectedPhase.hours ? 'bg-lime-500/20 text-lime-400' : 'bg-slate-700/50 text-slate-400'}`}
                        >
                            {hours_elapsed >= selectedPhase.hours
                                ? `✅ ¡Alcanzada! Llevas ${Math.round(hours_elapsed - selectedPhase.hours)}h en esta fase`
                                : `⏳ Faltan ${Math.round(selectedPhase.hours - hours_elapsed)}h para alcanzar`
                            }
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedPhase(null)}
                            className="w-full mt-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StatusCircle;
