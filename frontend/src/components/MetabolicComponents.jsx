import React, { useState } from 'react';
import { X, Camera, Send, Check, ChevronLeft, Home, AlertTriangle, Info, HelpCircle, Droplets, Zap, Ban, ClipboardCheck, Clock, ChevronDown, ChevronUp, ArrowLeftRight, Calendar, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Configuration Lists ---
export const PREDEFINED_LISTS = {
    HYDRATION: [
        { name: 'Agua con Vinagre', icon: '💧', description: 'Mezcla 1-2 cucharadas de vinagre de sidra de manzana en un vaso grande de agua. Tómalo antes de las comidas para mejorar la sensibilidad a la insulina.' },
        { name: 'Agua con Sal/Electrolitos', icon: '🧂', description: 'Añade una pizca de sal marina o del Himalaya a tu agua, o usa un sobre de electrolitos sin azúcar. Crucial durante el ayuno para evitar dolores de cabeza.' },
        { name: 'Té Verde/Negro + Jengibre', icon: '🍵', description: 'Infusión caliente o fría. El jengibre ayuda a la digestión y el té aporta antioxidantes. No añadas azúcar ni endulzantes calóricos.' },
        { name: 'Café Negro + Aceite Coco', icon: '☕', description: 'Café solo (sin leche ni azúcar). Opcional: añade 1 cucharadita de aceite de coco o MCT para energía rápida (cetonas).' },
        { name: 'Infusión Orégano/Menta', icon: '🌿', description: 'Hierve agua con orégano o menta. Excelente para la salud intestinal y digestión.' }
    ],
    NUTRITION: [
        { name: 'Caldo de Huesos', icon: '🥘', isBreaker: true },
        { name: 'Hígado Encebollado', icon: '🥩', isBreaker: true },
        { name: 'Proteína + Ensalada', icon: '🥗', isBreaker: true },
        { name: 'Huevos Cocidos', icon: '🥚', isBreaker: true },
        { name: 'Fruta (Manzana/Pera)', icon: '🍏', isBreaker: true },
        { name: 'OTRO (Crear Plato)', icon: '📸', isBreaker: true }
    ]
    // Note: Nutrition items are always breakers and use Camera, so description is less critical for "consumption" but good for consistency.
};

// --- Helper Components ---

export const NavigationHeader = ({ title, subtitle, icon: Icon }) => {
    const navigate = useNavigate();
    return (
        <div className="px-6 pt-8 pb-4 flex items-center justify-between">
            <div className="flex-1">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={28} />
                </button>
            </div>

            <div className="flex flex-col items-center">
                <h1 className="text-xl font-black text-slate-50 uppercase tracking-tighter flex items-center gap-2 font-ui">
                    {Icon && <Icon className="text-lime-500" size={24} />}
                    {title}
                </h1>
                {subtitle && <p className="text-slate-400 text-xs font-medium">{subtitle}</p>}
            </div>

            <div className="flex-1 flex justify-end">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors"
                >
                    <Home size={24} />
                </button>
            </div>
        </div>
    );
};

export const StatusCircle = ({ statusData, onClick, onEditStartTime }) => {
    const { status, phase, phaseColor, hours_elapsed, start_time } = statusData;
    const [showTotalHours, setShowTotalHours] = useState(false);
    const [fastingGoal, setFastingGoal] = useState(16); // Default 16h goal
    const [selectedPhase, setSelectedPhase] = useState(null); // For phase info modal

    // --- Circular Progress Logic ---
    const radius = 120; // SVG radius
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
            <div className="relative w-72 h-72 flex items-center justify-center">

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

export const ActionGrid = ({ onLogItem, infoMode, onInfoClick }) => {
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

// --- Modals ---

// 1. Info Modal (Instructions)
export const InfoModal = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-slate-900/90 w-full max-w-sm rounded-[2.5rem] border border-slate-700 shadow-2xl p-8 text-center relative backdrop-blur-xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                <div className="text-6xl mb-6 filter drop-shadow-lg">{item.icon}</div>
                <h3 className="text-2xl font-black text-slate-50 mb-2 font-ui uppercase tracking-tight">{item.name}</h3>
                <div className="w-12 h-1.5 bg-lime-500 mx-auto mb-6 rounded-full shadow-[0_0_15px_rgba(132,204,22,0.4)]"></div>
                <p className="text-slate-300 text-base leading-relaxed mb-8 font-medium">
                    {item.description || "No hay instrucciones específicas para este item."}
                </p>
                <button onClick={onClose} className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-lime-500/20 uppercase tracking-widest text-sm">
                    ENTENDIDO
                </button>
                {/* Recipe Link Button */}
                {item.recipeAvailable && (
                    <button
                        onClick={item.onOpenRecipe}
                        className="w-full mt-3 py-4 bg-slate-800 hover:bg-slate-700 text-lime-500 font-black rounded-2xl transition-all active:scale-95 border border-lime-500/30 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                        <Zap size={16} /> VER PREPARACIÓN
                    </button>
                )}
            </div>
        </div>
    );
};

// 2. Camera Modal (Optional Photo with Toggle)
export const CameraModal = ({ isOpen, onClose, initialItem, onConfirm }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [includePhoto, setIncludePhoto] = useState(false);
    const [notes, setNotes] = useState('');
    const [customName, setCustomName] = useState(''); // New state for custom dish name

    if (!isOpen) return null;

    const isCustomDish = initialItem?.name?.includes('OTRO') || initialItem?.name?.includes('Crear Plato') || initialItem?.name?.includes('Describir');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        // Validation for Photo
        if (includePhoto && !image) {
            alert("Activaste la foto, por favor tómala o desactiva la opción.");
            return;
        }

        // Validation for Custom Name
        if (isCustomDish && !customName.trim()) {
            alert("Por favor escribe el nombre del plato.");
            return;
        }

        onConfirm({
            ...initialItem,
            // If custom dish, replace the generic 'OTRO...' name with the user's input
            name: isCustomDish ? customName : initialItem.name,
            image: includePhoto ? image : null,
            notes: notes
        });

        // Reset state
        setImage(null);
        preview && URL.revokeObjectURL(preview);
        setPreview(null);
        setIncludePhoto(false);
        setNotes('');
        setCustomName('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 w-full max-w-md rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-slate-50 font-black uppercase tracking-tight flex items-center gap-2 font-ui">
                        <Camera size={24} className="text-lime-500" /> Registro de Consumo
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                    <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-bold">{initialItem?.category}</p>
                        <p className="text-3xl font-black text-slate-50 font-ui uppercase tracking-tighter">
                            {isCustomDish ? 'Crear Plato' : initialItem?.name}
                        </p>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-center gap-4 bg-slate-800/50 p-4 rounded-[1.5rem] border border-slate-700">
                        <span className={`text-xs font-black uppercase tracking-widest ${!includePhoto ? 'text-slate-300' : 'text-slate-500'}`}>Sin Foto</span>
                        <button
                            onClick={() => setIncludePhoto(!includePhoto)}
                            className={`w-14 h-7 rounded-full flex items-center transition-all duration-300 px-1 ${includePhoto ? 'bg-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.3)]' : 'bg-slate-600'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${includePhoto ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-xs font-black uppercase tracking-widest ${includePhoto ? 'text-lime-500' : 'text-slate-500'}`}>Incluir Foto</span>
                    </div>

                    {/* Camera Input - Conditional Display */}
                    {includePhoto && (
                        <label className="block w-full cursor-pointer group relative animate-in fade-in zoom-in-95 duration-200">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            <div className={`w-full aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300
                                ${preview ? 'border-lime-500 bg-black' : 'border-slate-600 bg-slate-800/50 hover:border-lime-400 hover:bg-slate-800 shadow-inner'}`}>
                                {preview ? (
                                    <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-xl" />
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Camera size={40} className="text-slate-400 group-hover:text-lime-500 transition-colors" />
                                        </div>
                                        <span className="text-xs text-slate-400 font-black uppercase tracking-widest group-hover:text-lime-400">Tocar para TOMAR FOTO</span>
                                    </>
                                )}
                            </div>
                        </label>
                    )}

                    {/* Custom Dish Name Input */}
                    {isCustomDish && (
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-lime-500 pl-1">Nombre del Plato</label>
                            <input
                                type="text"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                placeholder="Ej: Arroz con pollo, Pizza..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-slate-50 font-bold text-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition-all placeholder:text-slate-600"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Notes Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-1">
                            {isCustomDish ? 'Detalles / Cantidad (Opcional)' : 'Notas (Opcional)'}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={isCustomDish ? "Ej: 500g, con papas, sin salsa..." : "Ej: 3 huevos cocidos, ensalada grande..."}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-slate-100 text-sm focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 outline-none transition-all placeholder:text-slate-600 resize-none"
                            rows="3"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={includePhoto && !image}
                        className={`w-full py-5 rounded-2xl font-black tracking-widest shadow-lg transition-all active:scale-95 flex justify-center items-center gap-3 uppercase text-sm
                            ${(includePhoto && !image)
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                                : 'bg-lime-500 hover:bg-lime-400 text-slate-900 shadow-lime-500/20'}
                        `}
                    >
                        <Send size={20} /> CONFIRMAR CONSUMO
                    </button>
                </div>
            </div>
        </div>
    );
};

// 3. Status Note Modal
export const NoteModal = ({ isOpen, onClose, onConfirm }) => {
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!notes.trim()) return onClose();
        onConfirm(notes);
        setNotes('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 w-full max-w-sm rounded-[2.5rem] border border-slate-700 shadow-2xl p-8 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-50 font-ui uppercase tracking-tight">¿Cómo te sientes?</h3>
                    <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe síntomas, energía, hambre, dolor de cabeza..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-5 text-slate-100 text-base focus:ring-2 focus:ring-lime-500 focus:border-transparent focus:outline-none placeholder-slate-500 min-h-[180px] resize-none mb-8 transition-all"
                    autoFocus
                />

                <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl shadow-lg shadow-lime-500/20 transition-all active:scale-95 uppercase tracking-widest text-sm"
                >
                    GUARDAR NOTA
                </button>
            </div>
        </div>
    );
};

// 4. Generic Confirmation Modal
export const ConfirmationModal = ({ isOpen, onClose, title, message, onConfirm, isDestructive = false }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900/90 w-full max-w-xs rounded-[2.5rem] border border-slate-700 p-8 text-center shadow-2xl backdrop-blur-xl">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${isDestructive ? 'bg-rose-500/10 text-rose-500' : 'bg-lime-500/10 text-lime-500'}`}>
                    <AlertTriangle size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-50 mb-3 font-ui uppercase tracking-tight">{title}</h3>
                <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">{message}</p>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={onConfirm}
                        className={`w-full py-4 font-black rounded-2xl shadow-lg transition-all active:scale-95 text-sm uppercase tracking-widest
                            ${isDestructive ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20' : 'bg-lime-500 hover:bg-lime-400 text-slate-900 shadow-lime-500/20'}
                        `}
                    >
                        CONFIRMAR
                    </button>
                    <button onClick={onClose} className="w-full py-3 bg-transparent hover:bg-white/5 text-slate-400 font-bold rounded-2xl transition-colors text-xs uppercase tracking-widest">
                        CANCELAR
                    </button>
                </div>
            </div>
        </div>
    );
};

// 5. Edit Event Modal (Time + Notes)
export const EditEventModal = ({ isOpen, onClose, event, onSave, isLoading = false }) => {
    const [notes, setNotes] = React.useState('');
    const [time, setTime] = React.useState('');
    const [date, setDate] = React.useState('');

    const [error, setError] = React.useState(null);

    // Initialize values when modal opens or event changes
    React.useEffect(() => {
        if (event?.created_at) {
            const d = new Date(event.created_at);
            // Local Time Formatting
            const hours = d.getHours().toString().padStart(2, '0');
            const minutes = d.getMinutes().toString().padStart(2, '0');
            const year = d.getFullYear();
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');

            setTime(`${hours}:${minutes}`);
            setDate(`${year}-${month}-${day}`); // YYYY-MM-DD local
        }
        setNotes(event?.notes || '');
        setError(null);
    }, [event]);

    if (!isOpen || !event) return null;

    const handleSubmit = () => {
        setError(null);

        // Build new timestamp from date + time using local constructor
        const [hours, minutes] = time.split(':').map(Number);
        const [year, month, day] = date.split('-').map(Number);

        // Month is 0-indexed in Date constructor
        const newDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
        const now = new Date();
        const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));

        // 1. Check for Future Date
        if (newDate > now) {
            setError("No puedes registrar un evento en el futuro.");
            return;
        }

        // 2. Check for > 72h older
        if (newDate < seventyTwoHoursAgo) {
            setError("Solo puedes editar eventos de las últimas 72 horas.");
            return;
        }

        onSave({
            id: event.id,
            notes: notes,
            created_at: newDate.toISOString()
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 w-full max-w-sm rounded-[2.5rem] border border-slate-700 shadow-2xl p-8 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-100 font-ui uppercase tracking-tight">Editar Evento</h3>
                    <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                {/* Event Info */}
                <div className="bg-slate-800/50 rounded-2xl p-5 mb-8 border border-slate-700">
                    <p className="text-slate-50 font-black text-2xl font-ui leading-tight mb-1">{event.item_name}</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{event.category}</p>
                </div>

                {/* Date Input */}
                <div className="mb-6">
                    <label className="block text-[10px] text-slate-500 uppercase mb-2 font-black tracking-widest ml-1">Fecha</label>
                    <input
                        type="date"
                        value={date}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 text-base focus:ring-2 focus:ring-lime-500 focus:outline-none transition-all"
                    />
                </div>

                {/* Time Input */}
                <div className="mb-6">
                    <label className="block text-[10px] text-slate-500 uppercase mb-2 font-black tracking-widest ml-1">Hora</label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 text-base focus:ring-2 focus:ring-lime-500 focus:outline-none transition-all"
                    />
                </div>

                {/* Notes Input */}
                <div className="mb-8">
                    <label className="block text-[10px] text-slate-500 uppercase mb-2 font-black tracking-widest ml-1">Notas</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Añade notas o comentarios..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none placeholder-slate-600 min-h-[120px] resize-none transition-all"
                    />
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <AlertTriangle size={20} className="text-rose-500 shrink-0" />
                        <p className="text-rose-200 text-xs font-bold leading-tight">{error}</p>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl shadow-lg shadow-lime-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                    >
                        {isLoading ? (
                            <span className="animate-spin text-lg">⏳</span>
                        ) : (
                            <>
                                <Check size={16} /> Guardar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// 6. Edit Start Time Modal
export const EditTimeModal = ({ isOpen, onClose, currentStartTime, onSave, isLoading }) => {
    const [date, setDate] = React.useState('');
    const [time, setTime] = React.useState('');
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (currentStartTime) {
            const d = new Date(currentStartTime);
            setDate(d.toLocaleDateString('en-CA')); // YYYY-MM-DD
            setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        }
        setError(null);
    }, [currentStartTime, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        setError(null);
        if (!date || !time) {
            setError("Por favor completa fecha y hora.");
            return;
        }

        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = new Date(year, month - 1, day, hours, minutes);
        const now = new Date();

        if (newDate > now) {
            setError("No puedes iniciar un ayuno en el futuro.");
            return;
        }

        // Prevent editing beyond reasonable past (e.g., 7 days) if needed, otherwise allow flexibility
        // For now, no strict past limit for start time fix, assuming user knows best.

        onSave(newDate.toISOString());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 w-full max-w-sm rounded-[2.5rem] border border-slate-700 shadow-2xl p-8 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-100 font-ui uppercase tracking-tight">Editar Inicio Ayuno</h3>
                    <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <div className="space-y-6 mb-8">
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-2 font-black tracking-widest ml-1">Fecha de Inicio</label>
                        <input
                            type="date"
                            value={date}
                            max={new Date().toLocaleDateString('en-CA')}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 text-base focus:ring-2 focus:ring-lime-500 focus:outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-2 font-black tracking-widest ml-1">Hora de Inicio</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 text-base focus:ring-2 focus:ring-lime-500 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-300 text-xs font-bold">
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black rounded-2xl uppercase tracking-widest text-[10px]">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 py-4 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl shadow-lg shadow-lime-500/20 uppercase tracking-widest text-[10px] disabled:opacity-50"
                    >
                        {isLoading ? 'Guardando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const FastingInfoModal = ({ isOpen, onClose, currentPhase, hoursElapsed }) => {
    if (!isOpen) return null;

    const phaseContent = {
        'Fase 1: Fase Anabólica / Digestión': {
            title: 'Fase Anabólica',
            icon: '🍽️',
            color: 'text-blue-400',
            description: 'Tu cuerpo digiere tu última comida (caldo/huevos).',
            effects: [
                'La insulina sube, la glucosa entra a las células.',
                'Te sientes saciado y con energía directa.',
                'Suspensión temporal de la quema de grasas.',
                'Procesamiento activo de nutrientes.'
            ]
        },
        'Fase 1: Fase Catabólica Temprana': {
            title: 'Catabolismo Temprano',
            icon: '📉',
            color: 'text-cyan-400',
            description: 'La insulina baja drásticamente. El hígado libera glucógeno.',
            effects: [
                'El hígado libera azúcar almacenada para el cerebro.',
                'Sensación: Aquí es donde sientes el hambre habitual.',
                'Inicio de la transición metabólica.',
                'Estabilización de niveles de glucosa.'
            ]
        },
        'Fase 1: Inicio de la Quema de Grasa': {
            title: 'Quema de Grasa',
            icon: '🔥',
            color: 'text-teal-400',
            description: 'Tus reservas de glucógeno bajan al 50%. Comienza la lipólisis.',
            effects: [
                'Rotura de tejido graso para obtener energía.',
                'Beneficio: Empieza a bajar la inflamación del lado derecho.',
                'Aumento inicial de cuerpos cetónicos.',
                'Mayor enfoque mental.'
            ]
        },
        'Fase 1: Autofagia Leve': {
            title: 'Autofagia Leve',
            icon: '♻️',
            color: 'text-emerald-400',
            description: 'Se activa la limpieza celular básica.',
            effects: [
                'Reciclaje de proteínas viejas para energía.',
                'Proceso de gluconeogénesis activa.',
                'Descenso significativo de la insulina basal.',
                'Limpieza de restos metabólicos.'
            ]
        },
        'Fase 2: Agotamiento de Glucógeno': {
            title: 'Valle de la Muerte',
            icon: '⚠️',
            color: 'text-green-600',
            description: 'El hígado se vacía casi por completo. Tu cerebro entra en pánico.',
            effects: [
                'Síntomas: Niebla mental, irritabilidad o dolor de cabeza.',
                'Acción Vital: Es fundamental tomar agua con sal ahora.',
                'El cerebro debe aprender a usar cetonas.',
                'Agotamiento de reservas de azúcar.'
            ]
        },
        'Fase 2: Pico de Ghrelina': {
            title: 'Hambre Máxima',
            icon: '📈',
            color: 'text-yellow-400',
            description: 'La hormona del hambre llega a su punto más alto y luego cae en picada.',
            effects: [
                'Si superas este punto, el hambre desaparece.',
                'Cuerpo estresado buscando activamente combustible.',
                'Aumento de la noradrenalina y cortisol.',
                'Preparación para la cetosis profunda.'
            ]
        },
        'Fase 2: Entrada en Cetosis Profunda': {
            title: 'Cetosis Profunda',
            icon: '🧠',
            color: 'text-orange-500',
            description: 'El hígado produce Cuerpos Cetónicos masivamente.',
            effects: [
                'El cerebro acepta las cetonas como combustible premium.',
                'La niebla mental se disipa y el ánimo mejora.',
                'Quema directa de grasa corporal como fuente principal.',
                'Energía constante sin picos de azúcar.'
            ]
        },
        'Fase 3: Autofagia Máxima e Inmunidad': {
            title: 'Zona de Sanación',
            icon: '🛡️',
            color: 'text-red-500',
            description: 'Aquí ocurre la "magia" médica. Autofagia máxima e inmunidad.',
            effects: [
                'HGH (Hormona Crecimiento) sube un 500%: protege músculo.',
                'Células "comen" virus, bacterias y proteínas defectuosas.',
                'Reducción de nódulos y componentes celulares dañados.',
                'Restauración completa de la sensibilidad a la insulina.'
            ]
        },
        'Fase 3: Limpieza Hepática Profunda': {
            title: 'Limpieza Hepática',
            icon: '🧼',
            color: 'text-rose-400',
            description: 'Quema acelerada de grasa visceral alrededor de tu hígado.',
            effects: [
                'Mejora la molestia del lado derecho radicalmente.',
                'BDNF aumenta: Se crean nuevas neuronas en el cerebro.',
                'Concentración y agudeza mental extraordinaria.',
                'Reducción masiva de grasa interna.'
            ]
        },
        'Fase 3: La Euforia del Ayunante': {
            title: 'Euforia Activa',
            icon: '✨',
            color: 'text-pink-500',
            description: 'Niveles de noradrenalina suben. Te sientes energético y ligero.',
            effects: [
                'Sin hambre física y con mente muy clara.',
                'Inflamación sistémica (dolor articular) al mínimo.',
                'Mejora en la respiración y apnea por desinflamación.',
                'Sensación de ligereza muscular y mental.'
            ]
        },
        'Fase 4: Regeneración Células Madre': {
            title: 'Reinicio Inmune',
            icon: '🧬',
            color: 'text-purple-500',
            description: 'Regeneración celular a nivel genético. Células madre activas.',
            effects: [
                'Descomposición de glóbulos blancos viejos e innecesarios.',
                'Se activa la regeneración de un sistema inmune nuevo.',
                'Cuerpo se prepara genéticamente para ser "reconstruido".',
                'Autofagia extrema en tejidos profundos.'
            ]
        },
        'Fase 4: Piel y Tejido Cicatrizado': {
            title: 'Renovación Dérmica',
            icon: '💎',
            color: 'text-violet-600',
            description: 'La piel mejora notablemente y los tejidos fibróticos sanan.',
            effects: [
                'La piel se limpia y recupera elasticidad.',
                'Tejidos cicatrizados empiezan a suavizarse.',
                'Expresión de genes de longevidad al máximo.',
                'Rejuvenecimiento visible de los órganos.'
            ]
        },
        'Fase 5: Ayuno Terapéutico Profundo': {
            title: 'Ayuno Terapéutico',
            icon: '🕊️',
            color: 'text-amber-500',
            description: 'Territorio avanzado. Solo bajo supervisión. Crisis de curación.',
            effects: [
                'Pérdida de peso: casi 100% grasa pura (300g-500g día).',
                'Claridad espiritual y estado de calma absoluta.',
                'Crisis de curación: posible sabor metálico o lengua blanca.',
                'Reseteo total del sistema biológico.'
            ]
        }
    };

    const content = phaseContent[currentPhase] || {
        title: 'Estado del Ayuno',
        icon: '🕒',
        color: 'text-white',
        description: 'Continuando con el proceso metabólico beneficioso.',
        effects: ['Cargando información detallada...']
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900/95 w-full max-w-md rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-xl">
                {/* Header with Background Glow */}
                <div className={`relative py-12 px-8 flex flex-col items-center justify-center text-center overflow-hidden`}>
                    <div className="text-7xl mb-6 animate-bounce-slow drop-shadow-2xl">{content.icon}</div>
                    <h3 className={`text-4xl font-black uppercase tracking-tighter ${content.color} font-ui`}>{content.title}</h3>
                    <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">{hoursElapsed?.toFixed(1) || '0.0'} HORAS EN AYUNO</p>
                </div>

                <div className="px-10 pb-12">
                    <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 mb-8 text-center shadow-inner">
                        <p className="text-slate-200 text-lg font-medium leading-tight">
                            {content.description}
                        </p>
                    </div>

                    <div className="space-y-5">
                        <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">Efectos Fisiológicos</h4>
                        {content.effects.map((effect, idx) => (
                            <div key={idx} className="flex gap-4 items-start group">
                                <div className={`w-2 h-2 rounded-full mt-1.5 transition-all group-hover:scale-150 shadow-[0_0_8px_currentColor] ${content.color.replace('text-', 'bg-')}`}></div>
                                <p className="text-slate-400 text-sm leading-snug group-hover:text-white transition font-medium">{effect}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-12 py-5 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl shadow-lg shadow-lime-500/20 transition-all active:scale-95 tracking-widest uppercase text-xs"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ElectrolyteAlert = ({ onClick }) => (
    <div
        onClick={onClick}
        className="mx-6 mt-4 p-5 bg-slate-800/50 border border-amber-500/20 rounded-3xl flex items-center gap-5 animate-pulse backdrop-blur-sm shadow-lg shadow-amber-500/5 cursor-pointer hover:bg-slate-800 transition-colors group"
    >
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
            <Zap size={24} />
        </div>
        <div className="flex-1">
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 font-ui flex justify-between items-center">
                Alerta de Electrolitos
                <span className="bg-amber-500 text-slate-900 text-[8px] px-2 py-0.5 rounded-full">VER RECETA</span>
            </p>
            <p className="text-slate-300 text-xs leading-snug font-medium">Fase profunda: Bebe agua con sal y magnesio para evitar niebla mental.</p>
        </div>
    </div>
);

export const RecoveryStatusCard = ({ refeedStatus }) => {
    if (!refeedStatus) return null;

    const { fast_duration, protocol_id, refeed_hours_left, total_refeed_window } = refeedStatus;
    const progress = ((total_refeed_window - refeed_hours_left) / total_refeed_window) * 100;

    return (
        <div className="mx-6 mt-6 p-6 bg-slate-800/50 border border-slate-700 rounded-[2.5rem] relative overflow-hidden group backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <ClipboardCheck size={100} className="text-lime-500" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-lime-500 animate-pulse shadow-[0_0_8px_rgba(132,204,22,0.6)]"></span>
                    <p className="text-lime-400 text-[10px] font-black uppercase tracking-widest font-ui">Recuperación Activa</p>
                </div>

                <h3 className="text-slate-50 text-2xl font-black mb-1 font-ui uppercase tracking-tight">Protocolo #{protocol_id}</h3>
                <p className="text-slate-500 text-xs mb-6 font-medium">Ayuno de {fast_duration}h completado.</p>

                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span>Progreso de Realimentación</span>
                        <span className="text-lime-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                        <div
                            className="h-full bg-lime-500 transition-all duration-1000 shadow-[0_0_15px_rgba(132,204,22,0.4)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-slate-300 bg-slate-900/50 px-4 py-2 rounded-full w-fit border border-slate-700/30">
                    <Clock size={14} className="text-lime-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Faltan aprox. {Math.ceil(refeed_hours_left)}h</span>
                </div>
            </div>
        </div>
    );
};

export const RefeedProtocolModal = ({ isOpen, onClose, protocolId, fastDuration }) => {
    if (!isOpen) return null;

    const protocols = {
        1: {
            title: 'Ayunos Cortos (24-48h)',
            state: 'Intestino descansado, enzimas activas.',
            steps: [
                { t: 'Paso 1 (Romper)', d: '1 taza de Caldo de Huesos caliente con una pizca de sal.' },
                { t: 'Paso 2 (Esperar)', d: '30 a 45 minutos.' },
                { t: 'Paso 3 (Comida)', d: 'Comida normal pero Baja en Carbohidratos (Keto).' }
            ],
            example: '2-3 Huevos revueltos con espinacas.',
            warning: 'Evitar pan, arroz o frutas muy dulces inmediatamente.'
        },
        2: {
            title: 'Ayuno de Autofagia (72h)',
            state: 'Mucosa renovada. Sensibilidad extrema a la insulina.',
            steps: [
                { t: 'Paso 1 (Romper)', d: 'Caldo de Huesos + 1 cda pequeña de Vinagre de Manzana.' },
                { t: 'Paso 2 (Esperar)', d: '1 hora estricta.' },
                { t: 'Paso 3 (Vital)', d: 'Probióticos: porción pequeña de chucrut o pepinillos.' },
                { t: 'Paso 4 (Proteína)', d: 'Huevos o Pescado blanco. NADA de carnes rojas pesadas.' }
            ],
            example: 'Pescado blanco con aguacate o aceite de oliva.',
            warning: 'Si comes carbohidratos, te hincharás (edema) y dolerá la cabeza.'
        },
        3: {
            title: 'Ayunos Medios (5-7 Días)',
            state: 'Producción mínima de enzimas. Estómago encogido.',
            steps: [
                { t: 'Día 1 (Mañana)', d: 'Solo líquidos. Caldo de huesos + colágeno.' },
                { t: 'Día 1 (Tarde)', d: 'Crema de verduras muy cocidas (calabacín/auyama).' },
                { t: 'Día 1 (Noche)', d: 'Pescado al vapor o huevos pasados por agua.' },
                { t: 'Día 2', d: 'Ya puedes introducir ensaladas crudas y pollo poco a poco.' }
            ],
            example: 'Aguacate triturado (nada de fibra dura hoy).',
            warning: 'Continúa con Magnesio para evitar calambres al reintroducir glucosa.'
        },
        4: {
            title: 'Ayuno Profundo (10 Días)',
            state: 'ALERTA MÉDICA. Riesgo de Síndrome de Realimentación.',
            steps: [
                { t: 'Día 1 (Líquidos)', d: 'Caldo de huesos cada 3h. Opcional: aceite MCT.' },
                { t: 'Día 2 (Purés)', d: 'Puré de aguacate/coliflor. Kéfir o Chucrut.' },
                { t: 'Día 3 (Sólidos)', d: 'Vegetales al vapor. Pollo desmenuzado.' },
                { t: 'Día 4', d: 'Regreso a tu dieta normal Keto/Carnívora.' }
            ],
            example: 'No tengas prisa. Necesitas 4 días para comer normal.',
            warning: 'Baja brusca de fósforo/potasio si comes rápido. CRÍTICO.'
        }
    };

    const protocol = protocols[protocolId] || protocols[1];

    const Blacklist = () => (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mt-6">
            <h4 className="text-rose-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                <Ban size={14} /> Lista Negra (Prohibido Romper con esto)
            </h4>
            <div className="grid grid-cols-2 gap-2">
                {['Jugos de Fruta', 'Alcohol', 'Frutos Secos', 'Lácteos'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-rose-200/60 text-[10px] font-bold">
                        <div className="w-1 h-1 bg-rose-500 rounded-full" /> {item}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900/95 w-full max-w-md rounded-[3rem] border border-slate-700 shadow-2xl flex flex-col max-h-[95vh] backdrop-blur-xl">
                <div className="p-10 pb-6 text-center">
                    <div className="w-20 h-20 bg-lime-500/10 rounded-full flex items-center justify-center text-lime-500 mx-auto mb-6 border border-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.1)]">
                        <Droplets size={40} />
                    </div>
                    <p className="text-lime-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 font-ui">Retorno Metabólico Safe</p>
                    <h2 className="text-3xl font-black text-slate-50 uppercase tracking-tighter font-ui">{protocol.title}</h2>
                    <p className="text-slate-400 text-xs mt-3 italic px-6 leading-relaxed bg-slate-800/50 py-2 rounded-xl border border-slate-700/50">{protocol.state}</p>
                </div>

                <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
                    <div className="space-y-4">
                        {protocol.steps.map((step, idx) => (
                            <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:bg-slate-800 transition-colors group">
                                <p className="text-lime-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-lime-500/20 flex items-center justify-center text-[8px]">{idx + 1}</span>
                                    {step.t}
                                </p>
                                <p className="text-slate-100 text-sm font-medium leading-snug">{step.d}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-start gap-4 p-5 bg-lime-500/5 rounded-2xl border border-lime-500/10 shadow-inner">
                        <div className="text-2xl mt-0.5 opacity-80">💡</div>
                        <div>
                            <p className="text-lime-500 text-[10px] font-black uppercase tracking-widest mb-1">Tip de Oro</p>
                            <p className="text-slate-300 text-xs font-medium leading-relaxed">{protocol.example}</p>
                        </div>
                    </div>

                    {protocol.warning && (
                        <div className="mt-4 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4">
                            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-amber-200/80 text-xs leading-relaxed font-medium">{protocol.warning}</p>
                        </div>
                    )}

                    <Blacklist />

                    <button
                        onClick={onClose}
                        className="w-full mt-10 py-5 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black rounded-2xl shadow-lg shadow-lime-500/20 transition-all active:scale-95 tracking-widest uppercase text-xs"
                    >
                        Entiendo los pasos
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ProtocolScheduleModal = ({ isOpen, onClose }) => {
    // 1. Definicón del Schedule (Static)
    const schedule = [
        { id: 'morning_fast', time: 'Ayuno (Mañana)', item: 'Agua con Sal Light + Té Verde/Negro + Gotas de Limón.', goal: 'Electrolitos y Metabolismo.', icon: '💧', color: 'border-cyan-500 text-cyan-400' },
        { id: 'pre_meal', time: '30 min Antes de Comer', item: 'Agua + Vinagre de Manzana.', goal: 'Preparar Insulina.', icon: '🌅', color: 'border-lime-500 text-lime-400' },
        { id: 'break_fast', time: 'Romper Ayuno', item: 'Caldo de Huesos + Vitamina C + Creatina.', goal: 'La Sinergia: Vitamina C activa colágeno. Creatina protege músculo.', icon: '🥣', color: 'border-amber-500 text-amber-400' },
        { id: 'first_bite', time: '1er Bocado', item: 'Enzimas Digestivas + Inulina.', goal: 'Digestión.', icon: '💊', color: 'border-rose-500 text-rose-400' },
        { id: 'main_meal', time: 'PLATO FUERTE', item: 'Comida sazonada con Cúrcuma + Pimienta + Jengibre.', goal: 'Antiinflamatorio potente.', icon: '🍛', color: 'border-orange-500 text-orange-400' },
        { id: 'supplements', time: 'Durante Comida', item: 'Tus Suplementos (Forged, Omega 3, CoQ10, B12).', goal: 'Absorción de nutrientes.', icon: '💊', color: 'border-blue-500 text-blue-400' },
        { id: 'dessert', time: 'Postre / Cierre', item: 'Café/Té con Canela + Minerales (Zn/Se/Cu).', goal: 'Control de azúcar final.', icon: '☕', color: 'border-purple-500 text-purple-400' },
        { id: 'night', time: 'Noche (Antes de dormir)', item: 'Triple Magnesium.', goal: 'Descanso profundo.', icon: '🌙', color: 'border-indigo-500 text-indigo-400' },
    ];

    // 2. Estado del Checklist
    const [checkedItems, setCheckedItems] = useState({});

    // 3. Cargar estado desde LocalStorage al montar
    React.useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
            const storageKey = `schedule_checks_${today}`;

            try {
                const savedChecks = localStorage.getItem(storageKey);
                if (savedChecks) {
                    setCheckedItems(JSON.parse(savedChecks));
                } else {
                    setCheckedItems({}); // Reset si es un nuevo día
                }
            } catch (e) {
                console.error("Error loading schedule checks", e);
            }
        }
    }, [isOpen]);

    // 4. Manejador del Toggle
    const toggleItem = (itemId) => {
        setCheckedItems(prev => {
            const newState = { ...prev, [itemId]: !prev[itemId] };

            // Persistir inmediatamente
            const today = new Date().toISOString().split('T')[0];
            const storageKey = `schedule_checks_${today}`;
            localStorage.setItem(storageKey, JSON.stringify(newState));

            return newState;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300" onClick={onClose}>
            <div className="bg-slate-900/95 w-full max-w-md rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="relative py-8 bg-slate-800/50 flex flex-col items-center justify-center text-center border-b border-slate-700/50 shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"><X size={20} /></button>
                    <div className="w-16 h-16 bg-lime-500/10 rounded-full flex items-center justify-center text-lime-400 mb-3 border border-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.2)]">
                        <Calendar size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-50 uppercase tracking-tighter font-ui">Cronograma Integrado</h3>
                    <p className="text-lime-500 text-[10px] font-black uppercase tracking-[0.2em] bg-lime-500/10 px-3 py-1 rounded-full mt-2 border border-lime-500/20">Tu Rutina Diaria</p>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-6 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-800 z-0"></div>

                        {schedule.map((step, idx) => {
                            const isChecked = checkedItems[step.id] || false;

                            return (
                                <div
                                    key={idx}
                                    className={`relative z-10 flex gap-4 group cursor-pointer ${isChecked ? 'opacity-60 saturate-50' : ''} transition-all duration-300`}
                                    onClick={() => toggleItem(step.id)}
                                >
                                    {/* Timeline Node / Checkbox */}
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0 transition-all duration-300 border-2
                                        ${isChecked
                                            ? 'bg-lime-500 border-lime-500 text-slate-900 scale-95'
                                            : `bg-slate-900 ${step.color} group-hover:scale-110`
                                        }
                                    `}>
                                        {isChecked ? <Check size={28} strokeWidth={3} /> : step.icon}
                                    </div>

                                    <div className={`flex-1 rounded-2xl p-4 border transition-all select-none
                                        ${isChecked
                                            ? 'bg-slate-900/20 border-slate-800'
                                            : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                                        }
                                    `}>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isChecked ? 'text-slate-500' : step.color.split(' ')[1]}`}>
                                                {step.time}
                                            </p>
                                            {/* Checkbox circle visual */}
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                                ${isChecked ? 'bg-lime-500 border-lime-500' : 'border-slate-600 bg-transparent'}
                                            `}>
                                                {isChecked && <Check size={12} className="text-slate-900" strokeWidth={4} />}
                                            </div>
                                        </div>
                                        <p className={`text-sm font-bold leading-snug mb-2 ${isChecked ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                            {step.item}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-slate-600' : step.color.replace('text-', 'bg-')}`}></div>
                                            <p className={`text-xs font-medium italic ${isChecked ? 'text-slate-600' : 'text-slate-500'}`}>
                                                {step.goal}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-black rounded-2xl border border-slate-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        Cerrar Cronograma
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ElectrolyteRecipeModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300" onClick={onClose}>
            <div className="bg-slate-900/95 w-full max-w-md rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-xl" onClick={e => e.stopPropagation()}>
                <div className="p-8 text-center relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-slate-700"><X size={20} /></button>
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-4 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <Droplets size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-50 uppercase tracking-tighter font-ui">Receta de Electrolitos</h3>
                    <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 inline-block">Hidratación Maestra</p>
                </div>

                <div className="px-8 pb-10 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {/* Ingredients */}
                    <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
                        <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="text-lg">🧪</span> Ingredientes (Botella 2L)
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm text-slate-200">
                                <span className="text-blue-500 font-bold">•</span>
                                <span>Agua: <strong className="text-white">2 Litros</strong> (fría sabe mejor).</span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-200">
                                <span className="text-blue-500 font-bold">•</span>
                                <div>Sodio y Potasio: <strong className="text-white">2 cucharaditas</strong> (tamaño té) de <span className="text-blue-300">Sal Light Lebre</span>.</div>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-200">
                                <span className="text-blue-500 font-bold">•</span>
                                <div>Magnesio: <strong className="text-white">1/2 cucharadita</strong> de <span className="text-purple-300">Sal Amargo</span>.</div>
                            </li>
                        </ul>
                    </div>

                    {/* Preparation */}
                    <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
                        <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="text-lg">🥣</span> Preparación
                        </h4>
                        <p className="text-slate-200 text-sm leading-relaxed">
                            Mezcla todo en la botella y <strong className="text-white">agita hasta disolver bien</strong>.
                        </p>
                    </div>

                    {/* Golden Rule */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                        <h4 className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertTriangle size={14} /> Regla de Oro
                        </h4>
                        <p className="text-amber-200 text-sm leading-relaxed font-medium">
                            Tómala a <strong className="text-white">sorbos pequeños</strong> a lo largo de todo el día.
                        </p>
                        <p className="text-amber-200/60 text-xs mt-2 italic">
                            ⚠️ NUNCA de golpe: Si te la tomas rápido, el Sal Amargo te provocará diarrea urgente.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 tracking-widest uppercase text-xs"
                    >
                        Entendido, a mezclar
                    </button>
                </div>
            </div>
        </div>
    );
};
