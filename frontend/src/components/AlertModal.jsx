import React from 'react';
import { useTheme } from '../context/ThemeContext';

const AlertModal = ({ isOpen, onClose, title, message, type = 'info', buttonText = 'Entendido' }) => {
    const { isDark } = useTheme();
    const isLight = !isDark;

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'error':
                return (
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'success':
                return (
                    <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${isLight ? 'bg-green-100' : 'bg-[#84cc16]/20'}`}>
                        <svg className={`h-6 w-6 ${isLight ? 'text-green-600' : 'text-[#84cc16]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'safety':
                return (
                    <div className="flex flex-col items-center mb-6">
                        {/* Custom Icon: Meditating Person in Yellow Sun inside Rotated Square */}
                        <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                            {/* Rotated Dark Diamond Background */}
                            <div className={`absolute w-20 h-20 rounded-xl transform rotate-45 shadow-lg border border-white/5 ${isLight ? 'bg-blue-900' : 'bg-[#84cc16]/20'}`}></div>

                            {/* Inner Yellow Sun */}
                            <div className="relative z-10 w-16 h-16 bg-gradient-to-b from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-inner">
                                {/* Simple Meditating Silhouette (SVG) */}
                                <svg className="w-10 h-10 text-[#0f3d4a]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4a2 2 0 100-4 2 2 0 000 4zm6 6.5a2.5 2.5 0 00-2-2.45V8h-2v1.5a2.5 2.5 0 00-2 2.45v2.8a2.5 2.5 0 002 2.45V19h-1v2h6v-2h-1v-1.8a2.5 2.5 0 002-2.45v-2.8z" opacity={0.8} />
                                    <path d="M12 7c-2.21 0-4 1.79-4 4v3h8v-3c0-2.21-1.79-4-4-4z" />
                                    <circle cx="12" cy="4" r="2.5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                );
            default: // info
                return (
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    // Determine styles based on theme (overriding specifically for Dark Mode to match SafetyModal)
    // In Dark Mode, we use the SafetyModal background (#1a1f25) for ALL types to keep it consistent as requested.
    const containerClasses = isLight
        ? "bg-white border-gray-200"
        : "glass-modal border-white/10";

    const titleClasses = isLight
        ? "text-gray-900 text-lg font-bold mb-2"
        : "text-white text-lg font-bold mb-4";

    const messageClasses = isLight
        ? "text-gray-500 text-sm font-light leading-relaxed mb-6 whitespace-pre-line"
        : "text-gray-300 text-sm font-light leading-relaxed mb-6 whitespace-pre-line";

    // Dynamic Button Color:
    // Light Mode -> Blue (unless error)
    // Dark Mode -> Lime (unless error)
    const getButtonColor = () => {
        if (type === 'error') return 'bg-red-600 hover:bg-red-700 text-white';

        if (isLight) {
            return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20';
        } else {
            return 'bg-lime-500 hover:bg-lime-400 text-gray-900 shadow-lime-500/20';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`${containerClasses} rounded-2xl shadow-2xl max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200 overflow-hidden text-center p-6 lg:p-8 relative`}>

                {/* Decorative background for Safety or Dark Mode generic */}
                {!isLight && <div className="absolute inset-0 bg-[#0f3d4a]/10 pointer-events-none" />}

                <div className="relative z-10">
                    {getIcon()}

                    <h3 className={titleClasses}>{title}</h3>
                    <p className={messageClasses}>{message}</p>

                    <button
                        onClick={onClose}
                        className={`w-full inline-flex justify-center rounded-xl border border-transparent px-4 py-3 text-base font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-all transform active:scale-95 uppercase tracking-wide
                            ${getButtonColor()}
                        `}
                    >
                        {buttonText || 'Entendido'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
