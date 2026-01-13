import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

/**
 * UserDashboardPage - Responsive Layout
 * 
 * Desktop (md+): Original 4+2 wave layout with HexagonButton component.
 * Mobile (<md): Honeycomb 2-3-2 layout with cut-off hexagons.
 * Background: Transparent (uses app theme).
 */

// SVG Icons matching the reference image (outline style)
const Icons = {
    Lungs: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v6m0 0c0 2-1.5 4-4 5.5C5 17 4 19 4 20h6m2-10c0 2 1.5 4 4 5.5 3 1.5 4 3.5 4 4.5h-6m-2-10V4" />
            <circle cx="12" cy="3" r="1" fill="currentColor" />
        </svg>
    ),
    SunSnow: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
            <path strokeLinecap="round" d="M15 9l-2 2m0 0l-2-2m2 2V7" />
        </svg>
    ),
    AppleLeaf: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 8c3 0 5 3 5 7s-2 7-5 7c-1.5 0-2.5-1-3-1s-1.5 1-3 1c-3 0-5-3-5-7s2-7 5-7c1 0 2 .5 3 .5s2-.5 3-.5z" />
            <path strokeLinecap="round" d="M12 2c1 1 2 2 4 2" />
        </svg>
    ),
    Brain: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    Running: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="14" cy="4" r="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l4-4 2 2 4-6 2 2 4-4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l2-6-3-2 2-4" />
        </svg>
    ),
    Moon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    ),
    MoonStars: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            <path strokeLinecap="round" d="M16 4l.5 1.5L18 6l-1.5.5L16 8l-.5-1.5L14 6l1.5-.5L16 4z" />
        </svg>
    ),
    Clock: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 6v6l4 2" />
        </svg>
    )
};

// SVG Hexagon for Mobile Layout (rounded corners)
const HexagonSVG = ({ color, icon, label, textColor = '#fff', style = {} }) => {
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
                color: textColor,
                padding: '15px',
                boxSizing: 'border-box',
                zIndex: 1,
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                <div style={{ marginBottom: '6px' }}>{icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>{label}</div>
            </div>
        </div>
    );
};

// Desktop Hexagon Button (original style with CSS clip-path)
const HexagonButton = ({ title, icon, colorClass, delay = 0, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`
                ${colorClass}
                w-[140px] h-[160px] sm:w-48 sm:h-52
                flex flex-col items-center justify-center
                text-white font-semibold text-center
                cursor-pointer transition-all duration-300
                hover:scale-105 hover:shadow-xl active:scale-95
                animate-fade-in shadow-lg
            `}
            style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                animationDelay: `${delay}ms`,
            }}
        >
            <div className="mb-2">{icon}</div>
            <span className="text-sm px-2">{title}</span>
        </div>
    );
};

const UserDashboardPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    const welcomeName = user?.name || user?.email?.split('@')[0] || 'Usuario';

    // Desktop menu items (original 6)
    const desktopItems = [
        { title: 'Ejercicios de Respiración', icon: Icons.Lungs, color: 'bg-[#407B8F]', delay: 100 },
        { title: 'Exposición al Frío', icon: Icons.SunSnow, color: 'bg-[#A6D1D6]', delay: 200 },
        { title: 'Poder de la Mente', icon: Icons.Brain, color: 'bg-[#E5A938]', delay: 300 },
        { title: 'Ayuno', icon: Icons.Clock, color: 'bg-[#6366f1]', delay: 400 },
        { title: 'Ejercicio', icon: Icons.Running, color: 'bg-[#ef4444]', delay: 500 },
        { title: 'Sueño', icon: Icons.Moon, color: 'bg-[#1e293b]', delay: 600 },
    ];

    // Mobile layout constants
    const gap = 6;
    const rowOffset = -38;
    const cutAmount = 70;

    return (
        <div className="min-h-[80vh] w-full flex flex-col items-center">
            {/* HEADER - Shared */}
            <div className="text-center mb-8 md:mb-12 animate-fade-in px-4 pt-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 md:mb-4">
                    Bienvenido,
                    <span className="block text-[#84cc16] mt-1 md:mt-2">{welcomeName}</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg hidden md:block">
                    {t('dashboard.subtitle') || 'Bienvenido a tu panel de usuario. Aquí podrás acceder a tus cursos y progreso próximamente.'}
                </p>
            </div>

            {/* ========== DESKTOP LAYOUT (md+) ========== */}
            <div className="hidden md:flex flex-wrap justify-center gap-x-12 gap-y-16 max-w-6xl mx-auto pb-32 px-4">
                {desktopItems.map((item, index) => (
                    <div
                        key={index}
                        className={`transition-all duration-300 ${index % 2 !== 0 ? 'mt-12' : ''}`}
                    >
                        <HexagonButton
                            title={item.title}
                            icon={item.icon}
                            colorClass={item.color}
                            delay={item.delay}
                            onClick={() => console.log(`Clicked ${item.title}`)}
                        />
                    </div>
                ))}
            </div>

            {/* ========== MOBILE LAYOUT (<md) ========== */}
            <div className="flex md:hidden flex-col items-center w-full overflow-x-hidden pb-20">
                {/* FILA 1: Respiración + Frío */}
                <div style={{ display: 'flex', gap: `${gap}px` }}>
                    <HexagonSVG color="#3d6b7a" icon={Icons.Lungs} label="Ejercicios de respiración" />
                    <HexagonSVG color="#b5d6d6" icon={Icons.SunSnow} label="Exposición al frío" textColor="#222" />
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
                    <HexagonSVG color="#7fb158" icon={Icons.AppleLeaf} label="Nutrición Balanceada" />
                    <HexagonSVG color="#f4b41a" icon={Icons.Brain} label="Poder de la mente" textColor="#222" />
                    <HexagonSVG color="#d14949" icon={Icons.Running} label="Actividad Física" />
                </div>

                {/* FILA 3: Ayuno + Sueño (Centered like Row 1) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: `${gap}px`,
                    marginTop: `${rowOffset}px`
                }}>
                    <HexagonSVG color="#6a3d9a" icon={Icons.MoonStars} label="Ayuno" />
                    <HexagonSVG color="#7c3aed" icon={Icons.Moon} label="Sueño Reparador" />
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;
