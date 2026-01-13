import React from 'react';

const HexagonButton = ({ title, icon, colorClass, onClick, delay = 0 }) => {
    return (
        <button
            onClick={onClick}
            className={`group relative w-40 h-44 sm:w-48 sm:h-52 flex flex-col items-center justify-center transition-transform transform hover:scale-105 focus:outline-none animate-fade-in-up`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Hexagon Shape Background */}
            <div
                className={`absolute inset-0 ${colorClass} shadow-lg transition-all duration-300 group-hover:brightness-110`}
                style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                }}
            />

            {/* Content (Centered) */}
            <div className="relative z-10 flex flex-col items-center text-center p-2">
                <div className="text-white mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <span className="text-white font-bold text-sm sm:text-base leading-tight max-w-[80%]">
                    {title}
                </span>
            </div>
        </button>
    );
};

export default HexagonButton;
