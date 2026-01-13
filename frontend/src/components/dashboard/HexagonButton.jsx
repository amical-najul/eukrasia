import React from 'react';

const HexagonButton = ({ title, icon, colorClass, onClick, delay = 0, className = "" }) => {
    return (
        <button
            onClick={onClick}
            className={`group relative w-[140px] h-[160px] sm:w-48 sm:h-52 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none animate-fade-in-up ${className}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Hexagon Shape Background */}
            <div
                className={`absolute inset-0 ${colorClass} shadow-xl transition-all duration-300 group-hover:brightness-110 group-active:brightness-90`}
                style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                }}
            />

            {/* Content (Centered) */}
            <div className="relative z-10 flex flex-col items-center text-center px-3">
                <div className="text-white mb-2 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                    {icon}
                </div>
                <span className="text-white font-bold text-xs sm:text-base leading-tight max-w-[90%] drop-shadow-sm">
                    {title}
                </span>
            </div>
        </button>
    );
};

export default HexagonButton;
