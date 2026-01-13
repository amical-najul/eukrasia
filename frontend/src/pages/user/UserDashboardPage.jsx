import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

/**
 * UserDashboardPage - Responsive Honeycomb Design
 * 
 * - Desktop: 4上 / 3下 Symmetric Honeycomb (Balanced & Elegant).
 * - Mobile: 2-3-2 Honeycomb with side cut-offs (Ref 2 style).
 * - Icons: Precise SVG Outlines (No emojis).
 * - Color: Pure White Typography (#FFFFFF) globally.
 */

// Custom SVG Icons (Outline high-fidelity replicas)
const DashboardIcons = {
    // 🫁 Pulmones (Respiración) - CUSTOM
    Lungs: (
        <img src="/icons/breathing_custom.png" alt="Respiración" className="w-10 h-10 object-contain" />
    ),
    // ❄️ Copo de nieve (Frío) - CUSTOM
    Snowflake: (
        <img src="/icons/cold_custom.png" alt="Frío" className="w-10 h-10 object-contain" />
    ),
    // 🍎 Nutrición - CUSTOM
    Nutrition: (
        <img src="/icons/nutrition_custom.png" alt="Nutrición" className="w-10 h-10 object-contain" />
    ),
    // 🧠 Cerebro (Mente) - CUSTOM
    Brain: (
        <img src="/icons/brain_custom.png" alt="Mente" className="w-10 h-10 object-contain" />
    ),
    // 🏃 Corredor (Actividad) - CUSTOM
    Running: (
        <img src="/icons/activity_custom.png" alt="Actividad" className="w-10 h-10 object-contain" />
    ),
    // 🕒 Reloj (Ayuno) - CUSTOM
    Clock: (
        <img src="/icons/fasting_custom.png" alt="Ayuno" className="w-10 h-10 object-contain" />
    ),
    // 🌙 Luna (Sueño) - CUSTOM
    MoonStar: (
        <img src="/icons/sleep_custom.png" alt="Sueño" className="w-10 h-10 object-contain" />
    )
};

// Internal Hexagon Render Logic (SVG)
const Hexagon = ({ color, icon, label, size = 145, style = {}, innerStyle = {} }) => {
    const w = size;
    const h = size * 1.13;
    const pts = `${w / 2},8 ${w - 8},${h * 0.27} ${w - 8},${h * 0.73} ${w / 2},${h - 8} 8,${h * 0.73} 8,${h * 0.27}`;

    return (
        <div style={{
            width: `${w}px`,
            height: `${h}px`,
            position: 'relative',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            ...style
        }} className="hover:scale-110 active:scale-95">
            <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
                <polygon
                    points={pts}
                    fill={color}
                    stroke={color}
                    strokeWidth="12"
                    strokeLinejoin="round"
                />
            </svg>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: '#FFFFFF',
                padding: '15px',
                boxSizing: 'border-box',
                zIndex: 1,
                fontFamily: "system-ui, -apple-system, sans-serif",
                ...innerStyle
            }}>
                <div style={{ marginBottom: '8px' }}>{icon}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </div>
            </div>
        </div>
    );
};

const UserDashboardPage = () => {
    const { user } = useAuth();
    const name = user?.name || user?.email?.split('@')[0] || 'Ana';

    const items = [
        { id: 'breath', label: 'Ejercicios de respiración', color: '#3d6b7a', icon: DashboardIcons.Lungs },
        { id: 'cold', label: 'Exposición al frío', color: '#b5d6d6', icon: DashboardIcons.Snowflake },
        { id: 'nutri', label: 'Nutrición Balanceada', color: '#7fb158', icon: DashboardIcons.Nutrition },
        { id: 'mind', label: 'Poder de la mente', color: '#f4b41a', icon: DashboardIcons.Brain },
        { id: 'phys', label: 'Actividad Física', color: '#d14949', icon: DashboardIcons.Running },
        { id: 'fast', label: 'Ayuno', color: '#6a3d9a', icon: DashboardIcons.Clock },
        { id: 'sleep', label: 'Sueño Reparador', color: '#7c3aed', icon: DashboardIcons.MoonStar },
    ];

    // Responsive Config
    const mobileGap = 6;
    const mobileRowOffset = -40;
    const desktopGap = 16;
    const desktopRowOffset = -48;

    return (
        <div className="w-full flex flex-col items-center">
            {/* WELCOME HEADER */}
            <div className="w-full max-w-5xl px-10 pt-10 pb-8 animate-fade-in text-left">
                <div className="text-xl font-light text-gray-800 dark:text-gray-400">Bienvenido,</div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mt-1 uppercase tracking-tight">{name}</div>
            </div>

            {/* ========== DESKTOP LAYOUT (md+) - Symmetric 4-3 Honeycomb ========== */}
            <div className="hidden md:flex flex-col items-center pb-40">
                {/* Row 1: 4 hexes */}
                <div className="flex" style={{ gap: `${desktopGap}px` }}>
                    {items.slice(0, 4).map(item => (
                        <Hexagon key={item.id} color={item.color} icon={item.icon} label={item.label} size={180} />
                    ))}
                </div>
                {/* Row 2: 3 hexes (Balanced Center) */}
                <div className="flex" style={{
                    gap: `${desktopGap}px`,
                    marginTop: `${desktopRowOffset}px`
                }}>
                    {items.slice(4, 7).map(item => (
                        <Hexagon key={item.id} color={item.color} icon={item.icon} label={item.label} size={180} />
                    ))}
                </div>
            </div>

            {/* ========== MOBILE LAYOUT (<md) - Authentic 2-3-2 Honeycomb ========== */}
            <div className="flex md:hidden flex-col items-center w-full overflow-x-hidden pb-24">
                {/* Row 1: 2 items */}
                <div className="flex" style={{ gap: `${mobileGap}px` }}>
                    <Hexagon color={items[0].color} icon={items[0].icon} label={items[0].label} />
                    <Hexagon color={items[1].color} icon={items[1].icon} label={items[1].label} />
                </div>
                {/* Row 2: 3 items (Cut Sides) */}
                <div className="flex justify-center" style={{
                    gap: `${mobileGap}px`,
                    marginTop: `${mobileRowOffset}px`,
                    width: 'calc(100% + 140px)',
                    marginLeft: '-70px',
                    marginRight: '-70px'
                }}>
                    <Hexagon color={items[2].color} icon={items[2].icon} label={items[2].label} innerStyle={{ paddingLeft: '35px' }} />
                    <Hexagon color={items[3].color} icon={items[3].icon} label={items[3].label} />
                    <Hexagon color={items[4].color} icon={items[4].icon} label={items[4].label} innerStyle={{ paddingRight: '35px' }} />
                </div>
                {/* Row 3: 2 items */}
                <div className="flex" style={{
                    gap: `${mobileGap}px`,
                    marginTop: `${mobileRowOffset}px`
                }}>
                    <Hexagon color={items[5].color} icon={items[5].icon} label={items[5].label} />
                    <Hexagon color={items[6].color} icon={items[6].icon} label={items[6].label} />
                </div>
            </div>

            {/* Decorative Element */}
            <div className="fixed bottom-10 right-10 opacity-20 dark:text-white pointer-events-none animate-pulse">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
                </svg>
            </div>
        </div>
    );
};

export default UserDashboardPage;
