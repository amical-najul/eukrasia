import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

/**
 * UserDashboardPage - Responsive Layout
 * 
 * Desktop (md+): Wave layout.
 * Mobile (<md): Honeycomb 2-3-2 layout.
 * Icons: Exact SVG replicas of reference photo (Inline SVGs to avoid build errors).
 * Typography: Global White text on hexagons.
 * Background: Transparent (inherits app theme).
 */

// Exact SVG Replicas matching the reference image style
const MyIcons = {
    // 🫁 Pulmones Outline
    Lungs: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4c-3 0-4 3-4 5s1 8 4 8c1 0 2-1 2-3V4zM17 4c3 0 4 3 4 5s-1 8-4 8c-1 0-2-1-2-3V4z" />
            <path d="M9 4v16M15 4v16" />
            <path d="M12 4v4m-3 0h6" />
        </svg>
    ),
    // ❄️ Copo de nieve complejo
    Snowflake: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
            <path d="M8 4l4 4 4-4M8 20l4-4 4 4M4 8l4 4-4 4M20 8l-4 4 4 4" />
        </svg>
    ),
    // 🍎 Manzana + Tenedor (Nutrición)
    Nutrition: (
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Tenedor a la izquierda */}
            <path d="M3 2v6c0 1.1.9 2 2 2h0a2 2 0 002-2V2M5 2v8M5 14v6" />
            {/* Manzana a la derecha */}
            <path d="M15 9c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5z" />
            <path d="M15 9V7c0-1 1-2 2-2" />
        </svg>
    ),
    // 🧠 Cerebro (Círculos concéntricos/curvas)
    Brain: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2a2.5 2.5 0 010 5M14.5 2a2.5 2.5 0 010 5" />
            <path d="M12 7v1M12 15a5 5 0 110-10 5 5 0 010 10z" />
            <path d="M7 12h1M16 12h1M12 18v2" />
            <path d="M8.5 16.5c-.5.5-1.5 1.5-1.5 1.5M15.5 16.5c.5.5 1.5 1.5 1.5 1.5" />
        </svg>
    ),
    // 🏃 Persona Corriendo
    Running: (
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="15" cy="5" r="2" />
            <path d="M13 13l-4-4 2-2 4 4 2-2 4-4" />
            <path d="M4 18l4-4 2 2 4-6" />
            <path d="M12 21l-2-6-3-2" />
        </svg>
    ),
    // 🕒 Reloj (Ayuno)
    Clock: (
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    // 🌙 Luna + Estrella (Sueño)
    MoonStar: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            <path d="M15 6l1 1 1-1-1-1-1 1z" fill="currentColor" />
        </svg>
    )
};

// SVG Hexagon for Mobile Layout (rounded corners)
const HexagonSVG = ({ color, icon, label, style = {} }) => {
    const w = 145;
    const h = 165;
    const pts = `${w / 2},8 ${w - 8},${h * 0.27} ${w - 8},${h * 0.73} ${w / 2},${h - 8} 8,${h * 0.73} 8,${h * 0.27}`;

    return (
        <div style={{
            width: `${w}px`,
            height: `${h}px`,
            position: 'relative',
            flexShrink: 0,
            cursor: 'pointer',
            ...style
        }}>
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
                fontFamily: "system-ui, -apple-system, sans-serif"
            }}>
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    lineHeight: 1.1
                }}>
                    {label}
                </div>
            </div>
        </div>
    );
};

// Desktop Hexagon Button (original style with CSS clip-path)
const HexagonButton = ({ title, icon, color, delay = 0, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="w-[160px] h-[180px] sm:w-52 sm:h-56 flex flex-col items-center justify-center text-white font-bold text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 animate-fade-in shadow-lg"
            style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                animationDelay: `${delay}ms`,
                backgroundColor: color
            }}
        >
            <div className="mb-3">{icon}</div>
            <span className="text-sm px-4 leading-tight">{title}</span>
        </div>
    );
};

const UserDashboardPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    const welcomeName = user?.name || user?.email?.split('@')[0] || 'Usuario';

    // Shared Items for Grid
    const items = [
        { id: 'breathing', title: 'Ejercicios de respiración', icon: MyIcons.Lungs, color: '#3d6b7a', delay: 100 },
        { id: 'cold', title: 'Exposición al frío', icon: MyIcons.Snowflake, color: '#b5d6d6', delay: 200 },
        { id: 'nutrition', title: 'Nutrición Balanceada', icon: MyIcons.Nutrition, color: '#7fb158', delay: 300 },
        { id: 'mind', title: 'Poder de la mente', icon: MyIcons.Brain, color: '#f4b41a', delay: 400 },
        { id: 'activity', title: 'Actividad Física', icon: MyIcons.Running, color: '#d14949', delay: 500 },
        { id: 'fasting', title: 'Ayuno', icon: MyIcons.Clock, color: '#6a3d9a', delay: 600 },
        { id: 'sleep', title: 'Sueño Reparador', icon: MyIcons.MoonStar, color: '#7c3aed', delay: 700 },
    ];

    // Mobile layout constants
    const gap = 6;
    const rowOffset = -38;
    const cutAmount = 70;

    return (
        <div className="w-full flex flex-col items-center pb-20">
            {/* HEADER */}
            <div className="w-full max-w-lg px-6 pt-10 mb-8 animate-fade-in text-left">
                <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-300">
                    Bienvenido,
                </h1>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {welcomeName}
                </div>
            </div>

            {/* ========== DESKTOP LAYOUT (md+) ========== */}
            <div className="hidden md:flex flex-wrap justify-center gap-x-12 gap-y-16 max-w-6xl mx-auto px-4 mt-8">
                {items.slice(0, 6).map((item, index) => (
                    <div
                        key={item.id}
                        className={`transition-all duration-300 ${index % 2 !== 0 ? 'mt-12' : ''}`}
                    >
                        <HexagonButton
                            title={item.title}
                            icon={item.icon}
                            color={item.color}
                            delay={item.delay}
                            onClick={() => console.log(`Clicked ${item.title}`)}
                        />
                    </div>
                ))}
            </div>

            {/* ========== MOBILE LAYOUT (<md) ========== */}
            <div className="flex md:hidden flex-col items-center w-full overflow-x-hidden">
                {/* FILA 1: Respiración + Frío */}
                <div style={{ display: 'flex', gap: `${gap}px` }}>
                    <HexagonSVG color={items[0].color} icon={items[0].icon} label={items[0].title} />
                    <HexagonSVG color={items[1].color} icon={items[1].icon} label={items[1].title} />
                </div>

                {/* FILA 2: Nutrición (cut) + Mente + Actividad (cut) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: `${gap}px`,
                    marginTop: `${rowOffset}px`,
                    width: `calc(100% + ${cutAmount * 2}px)`,
                    marginLeft: `-${cutAmount}px`,
                    marginRight: `-${cutAmount}px`
                }}>
                    <HexagonSVG color={items[2].color} icon={items[2].icon} label={items[2].title} />
                    <HexagonSVG color={items[3].color} icon={items[3].icon} label={items[3].title} />
                    <HexagonSVG color={items[4].color} icon={items[4].icon} label={items[4].title} />
                </div>

                {/* FILA 3: Ayuno + Sueño */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: `${gap}px`,
                    marginTop: `${rowOffset}px`
                }}>
                    <HexagonSVG color={items[5].color} icon={items[5].icon} label={items[5].title} />
                    <HexagonSVG color={items[6].color} icon={items[6].icon} label={items[6].title} />
                </div>
            </div>

            {/* Sparkle Icon */}
            <div className="fixed bottom-6 right-6 opacity-40 dark:text-white pointer-events-none">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
                </svg>
            </div>
        </div>
    );
};

export default UserDashboardPage;
