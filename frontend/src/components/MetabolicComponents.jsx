import React, { useState } from 'react';
import { X, Camera, Send, Check, ChevronLeft, Home, AlertTriangle, Info, HelpCircle } from 'lucide-react';
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
    SUPPLEMENTS: [
        { name: 'Bloque Mañana (B+CoQ10)', icon: '☀️', description: 'Tomar con el desayuno. Complejo B para energía y CoQ10 para salud mitocondrial.' },
        { name: 'Bloque Medio (Omega+Min)', icon: '🌤️', description: 'Tomar con la comida principal. Omega-3 y Minerales esenciales.' },
        { name: 'Bloque Noche (Mg+D3)', icon: '🌙', description: 'Tomar 30-60 min antes de dormir. Magnesio para relajar y Vitamina D3 para regulación hormonal.' }
    ],
    NUTRITION: [
        { name: 'Caldo de Huesos', icon: '🥘', isBreaker: true },
        { name: 'Hígado Encebollado', icon: '🥩', isBreaker: true },
        { name: 'Proteína + Ensalada', icon: '🥗', isBreaker: true },
        { name: 'Huevos Cocidos', icon: '🥚', isBreaker: true },
        { name: 'Fruta (Manzana/Pera)', icon: '🍏', isBreaker: true },
        { name: 'OTRO (Foto Obligatoria)', icon: '📸', isBreaker: true }
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
                <h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                    {Icon && <Icon className="text-indigo-500" size={24} />}
                    {title}
                </h1>
                {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
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

export const StatusCircle = ({ statusData }) => {
    const { status, phase, phaseColor, hours_elapsed } = statusData;

    const colorMap = {
        'blue': 'border-blue-500 text-blue-500',
        'green-light': 'border-green-400 text-green-400',
        'green-intense': 'border-green-600 text-green-600',
        'yellow': 'border-yellow-400 text-yellow-400',
        'orange': 'border-orange-500 text-orange-500',
        'red-gold': 'border-rose-500 text-rose-500',
        'gray': 'border-gray-400 text-gray-400'
    };

    const borderColor = colorMap[phaseColor] || 'border-gray-300';
    const textColor = colorMap[phaseColor] || 'text-gray-300';
    const isDeepFasting = hours_elapsed > 12;
    const ringPulse = isDeepFasting ? `shadow-[0_0_50px_-12px_${phaseColor === 'blue' ? 'rgba(59,130,246,0.5)' : 'rgba(16,185,129,0.5)'}]` : '';

    // Format time as days:hours:minutes
    const formatTime = (totalHours) => {
        if (!totalHours) return '0h 0m';

        const totalMinutes = Math.floor(totalHours * 60);
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className={`relative w-64 h-64 rounded-full border-8 ${borderColor} flex flex-col items-center justify-center bg-gray-900 ${ringPulse} transition-all duration-500`}>
                <div className="text-sm font-light text-gray-400 uppercase tracking-widest mb-1">TIEMPO DESDE COMIDA</div>
                <div className={`text-4xl font-black ${textColor} tabular-nums`}>
                    {formatTime(hours_elapsed)}
                </div>
                <div className="mt-2 px-4 text-center text-sm font-medium text-white opacity-80">{phase}</div>

                {/* Visual "Active" Indicator for deep fasting */}
                {isDeepFasting && (
                    <div className={`absolute inset-0 rounded-full border-4 ${borderColor} opacity-20 animate-ping`}></div>
                )}
            </div>

            <p className="mt-6 text-xs text-gray-500 max-w-xs text-center">
                El cronómetro se reinicia automáticamente al registrar una comida (Rompe Ayuno).
            </p>
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
            />
            <Section
                title="SUPLEMENTOS"
                items={PREDEFINED_LISTS.SUPPLEMENTS}
                category="SUPLEMENTO"
                onLog={onLogItem}
                breaker={false}
                infoMode={infoMode}
                onInfo={onInfoClick}
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
                infoMode={false}
            />
        </div>
    );
};

const Section = ({ title, items, category, onLog, breaker, infoMode, onInfo }) => (
    <div className="bg-transparent">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider px-2">{title}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 active:scale-95 relative overflow-hidden group
                        ${breaker
                            ? 'bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10 text-rose-200 hover:border-rose-500/30'
                            : 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 text-emerald-200 hover:border-emerald-500/30'}
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

// --- Modals ---

// 1. Info Modal (Instructions)
export const InfoModal = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-gray-900 w-full max-w-sm rounded-3xl border border-gray-700 shadow-xl p-8 text-center relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                <div className="text-6xl mb-6">{item.icon}</div>
                <h3 className="text-2xl font-black text-white mb-2">{item.name}</h3>
                <div className="w-12 h-1 bg-indigo-500 mx-auto mb-6 rounded-full"></div>
                <p className="text-gray-300 text-base leading-relaxed mb-6">
                    {item.description || "No hay instrucciones específicas para este item."}
                </p>
                <button onClick={onClose} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors">
                    ENTENDIDO
                </button>
            </div>
        </div>
    );
};

// 2. Camera Modal (Optional Photo with Toggle)
export const CameraModal = ({ isOpen, onClose, initialItem, onConfirm }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [includePhoto, setIncludePhoto] = useState(false); // Default: Photo not required

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        // Validation only if toggle is ON
        if (includePhoto && !image) {
            alert("Activaste la foto, por favor tómala o desactiva la opción.");
            return;
        }

        onConfirm({ ...initialItem, image: includePhoto ? image : null });

        // Reset state
        setImage(null);
        setPreview(null);
        setIncludePhoto(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gray-900 w-full max-w-md rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Camera size={20} className="text-indigo-400" /> Registro de Consumo
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white bg-gray-800 rounded-full"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="text-center">
                        <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">{initialItem?.category}</p>
                        <p className="text-2xl font-black text-white">{initialItem?.name}</p>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-center gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                        <span className={`text-sm font-bold ${!includePhoto ? 'text-gray-300' : 'text-gray-500'}`}>Sin Foto</span>
                        <button
                            onClick={() => setIncludePhoto(!includePhoto)}
                            className={`w-12 h-6 rounded-full flex items-center transition-colors duration-300 px-1 ${includePhoto ? 'bg-indigo-600' : 'bg-gray-600'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${includePhoto ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-sm font-bold ${includePhoto ? 'text-indigo-400' : 'text-gray-500'}`}>Incluir Foto</span>
                    </div>

                    {/* Camera Input - Conditional Display */}
                    {includePhoto && (
                        <label className="block w-full cursor-pointer group relative animate-in fade-in zoom-in-95 duration-200">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            <div className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300
                                ${preview ? 'border-indigo-500 bg-black' : 'border-gray-600 bg-gray-800/50 hover:border-indigo-400 hover:bg-gray-800'}`}>
                                {preview ? (
                                    <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-xl" />
                                ) : (
                                    <>
                                        <Camera size={48} className="text-gray-500 mb-4 group-hover:text-indigo-400 transition-colors" />
                                        <span className="text-sm text-gray-400 font-medium group-hover:text-indigo-300">Tocar para TOMAR FOTO</span>
                                    </>
                                )}
                            </div>
                        </label>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={includePhoto && !image}
                        className={`w-full py-4 rounded-xl font-black tracking-wide shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2
                            ${(includePhoto && !image)
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'}
                        `}
                    >
                        <Send size={18} /> CONFIRMAR CONSUMO
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gray-900 w-full max-w-sm rounded-3xl border border-gray-700 shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-white">¿Cómo te sientes?</h3>
                    <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-white" /></button>
                </div>

                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe síntomas, energía, hambre, dolor de cabeza..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500 min-h-[150px] resize-none mb-6"
                    autoFocus
                />

                <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in zoom-in-95 duration-200">
            <div className="bg-gray-900 w-full max-w-xs rounded-3xl border border-gray-700 p-6 text-center shadow-2xl">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${isDestructive ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-black text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">{message}</p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className={`w-full py-3 font-bold rounded-xl shadow-lg transition-transform active:scale-95 text-white
                            ${isDestructive ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'}
                        `}
                    >
                        CONFIRMAR
                    </button>
                    <button onClick={onClose} className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-400 font-bold rounded-xl transition-colors">
                        CANCELAR
                    </button>
                </div>
            </div>
        </div>
    );
};
