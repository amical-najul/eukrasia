import React from 'react';

/**
 * FocusObject - Renders the visual focus object for Trataka meditation
 * 
 * @param {string} type - 'candle' | 'moon' | 'yantra' | 'dot'
 * @param {number} opacity - 0 to 1, for phase transitions
 * @param {boolean} showHalo - Show breathing halo animation
 * @param {number} haloScale - Scale of the halo (0 to 1.5)
 */
const FocusObject = ({ type = 'candle', opacity = 1, showHalo = false, haloScale = 0 }) => {
    // Shared container styles
    const containerStyle = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '200px',
        height: '200px',
        opacity: opacity,
        transition: 'opacity 2s ease-in-out'
    };

    // Halo effect (for distraction breathing)
    const HaloEffect = () => (
        <div
            className="absolute inset-0 rounded-full bg-amber-500/20 blur-3xl pointer-events-none"
            style={{
                transform: `scale(${haloScale})`,
                transition: 'transform 1.5s ease-in-out',
                opacity: showHalo ? 1 : 0
            }}
        />
    );

    // Candle - Animated flame using CSS
    if (type === 'candle') {
        return (
            <div style={containerStyle}>
                <HaloEffect />
                <div className="relative flex flex-col items-center">
                    {/* Flame */}
                    <div className="relative">
                        {/* Outer glow */}
                        <div className="absolute -inset-8 bg-amber-500/30 rounded-full blur-2xl animate-pulse" />

                        {/* Flame body */}
                        <div
                            className="relative w-8 h-16 rounded-full animate-flicker"
                            style={{
                                background: 'linear-gradient(to top, #ff6b35 0%, #f7c59f 30%, #FFB347 60%, #ffecd2 100%)',
                                boxShadow: '0 0 40px 8px rgba(255, 179, 71, 0.4), 0 0 80px 16px rgba(255, 107, 53, 0.2)',
                                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                                animation: 'flicker 3s ease-in-out infinite'
                            }}
                        />

                        {/* Inner bright core */}
                        <div
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-6 rounded-full"
                            style={{
                                background: 'linear-gradient(to top, #fff8e7, #fffef5)',
                                animation: 'flicker 2s ease-in-out infinite reverse'
                            }}
                        />
                    </div>

                    {/* Candle body */}
                    <div
                        className="w-6 h-2 rounded-b-sm mt-0"
                        style={{ background: 'linear-gradient(to bottom, #e8d4b8, #d4c4a8)' }}
                    />
                </div>

                <style>{`
                    @keyframes flicker {
                        0%, 100% { transform: scaleY(1) scaleX(1); }
                        25% { transform: scaleY(0.95) scaleX(1.02); }
                        50% { transform: scaleY(1.02) scaleX(0.98); }
                        75% { transform: scaleY(0.98) scaleX(1.01); }
                    }
                `}</style>
            </div>
        );
    }

    // Moon - High contrast static image simulation
    if (type === 'moon') {
        return (
            <div style={containerStyle}>
                <HaloEffect />
                <div className="relative">
                    {/* Moon glow */}
                    <div className="absolute -inset-12 bg-slate-300/20 rounded-full blur-3xl" />

                    {/* Moon body */}
                    <div
                        className="w-32 h-32 rounded-full relative overflow-hidden"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, #f5f5f5, #e0e0e0 50%, #bdbdbd)',
                            boxShadow: '0 0 60px 10px rgba(255, 255, 255, 0.15), inset -10px -10px 30px rgba(0,0,0,0.1)'
                        }}
                    >
                        {/* Craters */}
                        <div className="absolute w-8 h-8 rounded-full bg-gray-300/50 top-6 left-8" />
                        <div className="absolute w-5 h-5 rounded-full bg-gray-300/40 top-16 left-4" />
                        <div className="absolute w-6 h-6 rounded-full bg-gray-300/30 top-12 right-6" />
                        <div className="absolute w-4 h-4 rounded-full bg-gray-300/40 bottom-8 left-12" />
                    </div>
                </div>
            </div>
        );
    }

    // Yantra - Geometric pattern (Sri Yantra inspired)
    if (type === 'yantra') {
        return (
            <div style={containerStyle}>
                <HaloEffect />
                <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-[0_0_20px_rgba(255,179,71,0.3)]">
                    {/* Outer circle */}
                    <circle cx="80" cy="80" r="75" fill="none" stroke="#FFB347" strokeWidth="1.5" opacity="0.9" />

                    {/* Middle circles */}
                    <circle cx="80" cy="80" r="60" fill="none" stroke="#FFB347" strokeWidth="1" opacity="0.7" />
                    <circle cx="80" cy="80" r="45" fill="none" stroke="#FFB347" strokeWidth="1" opacity="0.6" />

                    {/* Central triangles pointing up */}
                    <polygon points="80,20 140,110 20,110" fill="none" stroke="#FFB347" strokeWidth="1.5" opacity="0.8" />
                    <polygon points="80,40 120,100 40,100" fill="none" stroke="#FFB347" strokeWidth="1" opacity="0.7" />

                    {/* Central triangles pointing down */}
                    <polygon points="80,140 20,50 140,50" fill="none" stroke="#FFB347" strokeWidth="1.5" opacity="0.8" />
                    <polygon points="80,120 40,60 120,60" fill="none" stroke="#FFB347" strokeWidth="1" opacity="0.7" />

                    {/* Inner circles */}
                    <circle cx="80" cy="80" r="25" fill="none" stroke="#FFB347" strokeWidth="1" opacity="0.5" />
                    <circle cx="80" cy="80" r="10" fill="none" stroke="#FFB347" strokeWidth="1.5" opacity="0.9" />

                    {/* Center dot (bindu) */}
                    <circle cx="80" cy="80" r="3" fill="#FFB347" />
                </svg>
            </div>
        );
    }

    // Dot (Bindu) - Simple point
    if (type === 'dot') {
        return (
            <div style={containerStyle}>
                <HaloEffect />
                <div className="relative">
                    {/* Subtle glow */}
                    <div className="absolute -inset-4 bg-white/5 rounded-full blur-xl" />

                    {/* The dot */}
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{
                            backgroundColor: '#ECECEC',
                            opacity: 0.9,
                            boxShadow: '0 0 10px 2px rgba(236, 236, 236, 0.2)'
                        }}
                    />
                </div>
            </div>
        );
    }

    // Fallback
    return <div style={containerStyle}><span className="text-gray-500">Unknown type</span></div>;
};

export default FocusObject;
