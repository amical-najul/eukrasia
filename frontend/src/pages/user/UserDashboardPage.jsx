import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import HexagonButton from '../../components/dashboard/HexagonButton';

// Icons (Simple SVG inline for verified look)
const Icons = {
    Breathing: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Cold: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    Mind: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    Fasting: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Exercise: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    Sleep: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
    )
};

const UserDashboardPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    const welcomeName = user?.name || user?.email?.split('@')[0] || user?.email || 'Usuario';

    const menuItems = [
        { title: 'Ejercicios de Respiración', icon: Icons.Breathing, color: 'bg-[#407B8F]', delay: 100 }, // Teal
        { title: 'Exposición al Frío', icon: Icons.Cold, color: 'bg-[#A6D1D6]', delay: 200 }, // Light Blue
        { title: 'Poder de la Mente', icon: Icons.Mind, color: 'bg-[#E5A938]', delay: 300 }, // Gold/Yellow
        { title: 'Ayuno', icon: Icons.Fasting, color: 'bg-[#6366f1]', delay: 400 }, // Indigo
        { title: 'Ejercicio', icon: Icons.Exercise, color: 'bg-[#ef4444]', delay: 500 }, // Red
        { title: 'Sueño', icon: Icons.Sleep, color: 'bg-[#1e293b]', delay: 600 }, // Slate
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh] flex flex-col items-center">
            {/* Header Text */}
            <div className="text-center mb-12 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    Bienvenido,
                    <span className="block text-[#84cc16] mt-2">{welcomeName}</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {t('dashboard.subtitle') || 'Prepara tu cuerpo y mente'}
                </p>
            </div>

            {/* Hexagon Grid - Honeycomb Layout Calculation 
                Mobile: Flex Wrap / Stack
                Desktop: 3-item rows? or Pyramid?
                For simplicity and strict 6-item look, a 2x3 or 3x2 grid works well.
            */}
            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto pb-10">
                {menuItems.map((item, index) => (
                    <div key={index} className={index % 2 !== 0 ? "md:mt-12" : ""}>
                        {/* Stagger every other item on desktop for honeycomb effect */}
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

        </div>
    );
};

export default UserDashboardPage;
