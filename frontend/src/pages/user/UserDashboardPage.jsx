import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

/**
 * UserDashboardPage - Responsive Dashboard with Layout Toggle
 * 
 * - Hexagon View: Original honeycomb design
 * - List View: Gradient cards with icons (mobile-optimized)
 * - Layout preference stored in localStorage
 */

// Custom SVG Icons (Outline high-fidelity replicas)
const DashboardIcons = {
    Lungs: (
        <img src="/icons/breathing_custom.png" alt="Respiración" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
    ),
    Snowflake: (
        <img src="/icons/cold_custom.png" alt="Frío" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
    ),
    Nutrition: (
        <img src="/icons/nutrition_custom.png" alt="Nutrición" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
    ),
    Brain: (
        <img src="/icons/brain_custom.png" alt="Mente" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
    ),
    Running: (
        <img src="/icons/activity_custom.png" alt="Actividad" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
    ),
    Clock: (
        <img src="/icons/fasting_custom.png" alt="Ayuno" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
    ),
    MoonStar: (
        <img src="/icons/sleep_custom.png" alt="Sueño" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
    )
};

import Hexagon from '../../components/Hexagon';

const UserDashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const name = user?.name || user?.email?.split('@')[0] || 'Ana';

    // Layout state from localStorage
    const [layout, setLayout] = useState(() => {
        return localStorage.getItem('dashboard_layout') || 'hexagon';
    });

    // Listen for layout changes from settings modal
    useEffect(() => {
        const handleLayoutChange = (e) => {
            setLayout(e.detail);
        };
        window.addEventListener('dashboardLayoutChange', handleLayoutChange);
        return () => window.removeEventListener('dashboardLayoutChange', handleLayoutChange);
    }, []);

    // Gradient colors for list view (matching reference image 2)
    const items = [
        { id: 'breath', label: 'Ejercicios de Respiración', subtitle: 'Respiración guiada', color: '#3d6b7a', gradient: 'from-teal-600 to-cyan-500', icon: DashboardIcons.Lungs, path: '/dashboard/breathing' },
        { id: 'cold', label: 'Exposición al Frío', subtitle: 'Exposición al frío', color: '#b5d6d6', gradient: 'from-cyan-400 to-teal-300', icon: DashboardIcons.Snowflake },
        { id: 'nutri', label: 'Nutrición Balanceada', subtitle: 'Alimentación saludable', color: '#7fb158', gradient: 'from-green-500 to-emerald-400', icon: DashboardIcons.Nutrition, path: '/dashboard/metabolic', state: { tab: 'NUTRITION' } },
        { id: 'mind', label: 'Poder de la Mente', subtitle: 'Poder de la mente', color: '#f4b41a', gradient: 'from-amber-500 to-yellow-400', icon: DashboardIcons.Brain, path: '/dashboard/mind' },
        { id: 'phys', label: 'Actividad Física', subtitle: 'Actividad física', color: '#d14949', gradient: 'from-red-500 to-orange-400', icon: DashboardIcons.Running },
        { id: 'fast', label: 'Ayuno', subtitle: 'Practica del ayuno', color: '#6a3d9a', gradient: 'from-purple-600 to-violet-500', icon: DashboardIcons.Clock, path: '/dashboard/metabolic', state: { tab: 'FASTING' } },
        { id: 'sleep', label: 'Sueño Reparador', subtitle: 'Sueño y reparador', color: '#7c3aed', gradient: 'from-violet-600 to-purple-500', icon: DashboardIcons.MoonStar, path: '/dashboard/sleep' },
    ];

    // Responsive Config for Hexagon view
    const mobileGap = 6;
    const mobileRowOffset = -40;
    const desktopGap = 16;
    const desktopRowOffset = -48;

    // ========== LIST VIEW COMPONENT ==========
    const ListView = () => (
        <div className="w-full max-w-md mx-auto px-4 pb-24 space-y-3 animate-fade-in">
            {items.map((item) => (
                <div
                    key={item.id}
                    onClick={item.path ? () => navigate(item.path, { state: item.state }) : undefined}
                    className={`relative overflow-hidden rounded-2xl p-5 flex items-center justify-between bg-gradient-to-r ${item.gradient} shadow-lg transition-all duration-300 ${item.path ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl active:scale-95' : 'opacity-70 cursor-not-allowed'}`}
                >
                    {/* Text Content */}
                    <div className="flex-1">
                        <h3 className="text-white font-bold text-lg uppercase tracking-tight leading-tight">
                            {item.label}
                        </h3>
                        <p className="text-white/70 text-xs mt-0.5 font-light">
                            {item.subtitle}
                        </p>
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ml-4 shrink-0">
                        {item.icon}
                    </div>

                    {/* Decorative shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
            ))}
        </div>
    );

    // ========== HEXAGON VIEW COMPONENT ==========
    const HexagonView = () => (
        <>
            {/* DESKTOP LAYOUT (md+) - Symmetric 4-3 Honeycomb */}
            <div className="hidden md:flex flex-col items-center pb-40">
                <div className="flex" style={{ gap: `${desktopGap}px` }}>
                    {items.slice(0, 4).map(item => (
                        <Hexagon
                            key={item.id}
                            color={item.color}
                            icon={item.icon}
                            label={item.label}
                            size={180}
                            onClick={item.path ? () => navigate(item.path, { state: item.state }) : undefined}
                        />
                    ))}
                </div>
                <div className="flex" style={{ gap: `${desktopGap}px`, marginTop: `${desktopRowOffset}px` }}>
                    {items.slice(4, 7).map(item => (
                        <Hexagon key={item.id} color={item.color} icon={item.icon} label={item.label} size={180}
                            onClick={item.path ? () => navigate(item.path, { state: item.state }) : undefined}
                        />
                    ))}
                </div>
            </div>

            {/* MOBILE LAYOUT (<md) - Authentic 2-3-2 Honeycomb */}
            <div className="flex md:hidden flex-col items-center w-full overflow-x-hidden pb-24">
                <div className="flex" style={{ gap: `${mobileGap}px` }}>
                    <Hexagon color={items[0].color} icon={items[0].icon} label={items[0].label}
                        onClick={items[0].path ? () => navigate(items[0].path, { state: items[0].state }) : undefined}
                    />
                    <Hexagon color={items[1].color} icon={items[1].icon} label={items[1].label}
                        onClick={items[1].path ? () => navigate(items[1].path, { state: items[1].state }) : undefined}
                    />
                </div>
                <div className="flex justify-center" style={{
                    gap: `${mobileGap}px`,
                    marginTop: `${mobileRowOffset}px`,
                    width: 'calc(100% + 140px)',
                    marginLeft: '-70px',
                    marginRight: '-70px'
                }}>
                    <Hexagon color={items[2].color} icon={items[2].icon} label={items[2].label} innerStyle={{ paddingLeft: '35px' }}
                        onClick={items[2].path ? () => navigate(items[2].path, { state: items[2].state }) : undefined}
                    />
                    <Hexagon color={items[3].color} icon={items[3].icon} label={items[3].label}
                        onClick={items[3].path ? () => navigate(items[3].path, { state: items[3].state }) : undefined}
                    />
                    <Hexagon color={items[4].color} icon={items[4].icon} label={items[4].label} innerStyle={{ paddingRight: '35px' }}
                        onClick={items[4].path ? () => navigate(items[4].path, { state: items[4].state }) : undefined}
                    />
                </div>
                <div className="flex" style={{ gap: `${mobileGap}px`, marginTop: `${mobileRowOffset}px` }}>
                    <Hexagon color={items[5].color} icon={items[5].icon} label={items[5].label}
                        onClick={items[5].path ? () => navigate(items[5].path, { state: items[5].state }) : undefined}
                    />
                    <Hexagon color={items[6].color} icon={items[6].icon} label={items[6].label}
                        onClick={items[6].path ? () => navigate(items[6].path, { state: items[6].state }) : undefined}
                    />
                </div>
            </div>
        </>
    );

    return (
        <div className="w-full flex flex-col items-center">
            {/* WELCOME HEADER */}
            <div className="w-full max-w-5xl px-6 md:px-10 pt-6 md:pt-10 pb-6 md:pb-8 animate-fade-in text-left">
                <div className="text-lg md:text-xl font-light text-gray-800 dark:text-gray-400">Bienvenido,</div>
                <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mt-1 uppercase tracking-tight">{name}</div>
            </div>

            {/* RENDER BASED ON LAYOUT PREFERENCE */}
            {layout === 'list' ? <ListView /> : <HexagonView />}

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

