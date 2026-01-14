import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBreathingSession, SESSION_PHASE } from '../../../hooks/useBreathingSession';
import NeonHexagon from '../../../components/breathing/NeonHexagon';
import BreathingLottie from '../../../components/breathing/BreathingLottie';
import powerBreathingAnim from '../../../animation/power_breathing.json';
import fastBreathingAnim from '../../../animation/fast_breathing.json'; // Import Fast Animation
import slowBreathingAnim from '../../../animation/slow_breathing.json'; // Import Slow Animation
import BackButton from '../../../components/common/BackButton';

// Formatea segundos a MM:SS
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const GuidedBreathingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get config from navigation state or use defaults
    const config = useMemo(() => location.state?.config || {}, [location.state]);

    const {
        phase,
        round,
        breathCount,
        isInhaling,
        retentionTime,
        recoveryTime,
        startSession,
        endRetention,
        totalBreaths
    } = useBreathingSession(config);

    // Textos de Ayuda
    const getInstructionText = () => {
        if (phase === SESSION_PHASE.IDLE) return "Toca para iniciar";
        if (phase === SESSION_PHASE.BREATHING) return isInhaling ? "Inhala" : "Exhala";
        if (phase === SESSION_PHASE.RETENTION) return "Mantén (Sin Aire)";
        if (phase === SESSION_PHASE.RECOVERY) return "Recuperación (Aguanta 15s)";
        if (phase === SESSION_PHASE.FINISHED) return "Sesión Completada";
        return "";
    };

    // Determine visual mode
    // Default to 'standard' if speed is not explicitly set
    const currentSpeed = config.speed || 'standard';

    // Select Animation Data and Speed based on config
    let animData = null;
    let animSpeed = 1;

    if (phase === SESSION_PHASE.BREATHING) {
        if (currentSpeed === 'standard') {
            animData = powerBreathingAnim;
            animSpeed = 0.55; // 5s cycle
        } else if (currentSpeed === 'fast') {
            animData = fastBreathingAnim;
            animSpeed = 0.917; // 3s cycle (2.75 / 3.0)
        } else if (currentSpeed === 'slow') {
            animData = slowBreathingAnim;
            animSpeed = 0.625; // 8s cycle (5.0s native / 8.0s target)
        }
    }

    const showLottie = !!animData;

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#020617] flex flex-col items-center justify-center font-['Outfit']">
            {/* Deep Ocean Background: Radial Gradient for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0f172a] to-[#020617] opacity-100 z-0" />

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 bg-[url('/patterns/noise.png')] opacity-5 mix-blend-overlay z-0 pointer-events-none" />

            {/* Header: Minimalist Controls */}
            {/* Back/Close Button (Glassmorphic) */}
            <div className="absolute top-8 right-8 z-50">
                <button
                    onClick={() => navigate('/dashboard/breathing')}
                    className="group w-12 h-12 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 active:scale-95"
                    title="Salir"
                >
                    <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* UI Layer */}
            <div className="relative z-10 w-full max-w-md h-full flex flex-col items-center justify-between py-12">

                {/* Round Indicator (Floating & Elegant) */}
                <div className="flex flex-col items-center mt-10 animate-fade-in-down">
                    <span className="text-cyan-400/80 text-[10px] tracking-[0.4em] uppercase font-bold mb-2">Ronda</span>
                    <div className="flex items-baseline gap-2 text-white/90">
                        <span className="text-3xl font-light tabular-nums tracking-widest">
                            {round < 10 ? `0${round}` : round}
                        </span>
                        <span className="text-sm font-light text-white/30 tracking-widest">/ 0{config.rounds || 3}</span>
                    </div>
                </div>

                {/* Center: Animation & Counters */}
                <div className="relative flex items-center justify-center flex-1 w-full">
                    
                    {/* Breathing Animation Container */}
                    <div className={`relative transition-all duration-1000 ${phase === SESSION_PHASE.IDLE ? 'scale-95 opacity-80 hover:scale-100 hover:opacity-100 cursor-pointer' : 'scale-100'}`} onClick={phase === SESSION_PHASE.IDLE ? startSession : undefined}>
                        
                        {/* Render Visual: Lottie OR NeonHexagon */}
                        {showLottie ? (
                            <BreathingLottie
                                animationData={animData}
                                speed={animSpeed}
                                targetBreaths={totalBreaths} // from useBreathingSession
                                isPlaying={phase === SESSION_PHASE.BREATHING}
                            />
                        ) : (
                            <NeonHexagon phase={phase} isInhaling={isInhaling} />
                        )}

                        {/* Central Overlay Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {/* Breathing Count - Hidden if Lottie is active */}
                            {phase === SESSION_PHASE.BREATHING && !showLottie && (
                                <span className="text-6xl font-light text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-scale-in">
                                    {breathCount}
                                </span>
                            )}

                            {/* Retention Timer */}
                            {phase === SESSION_PHASE.RETENTION && (
                                <div className="flex flex-col items-center">
                                    <span className="text-6xl font-light text-cyan-200 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] tracking-wider font-mono tabular-nums">
                                        {formatTime(retentionTime)}
                                    </span>
                                </div>
                            )}

                            {/* Recovery Timer */}
                            {phase === SESSION_PHASE.RECOVERY && (
                                <span className="text-5xl font-light text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.4)]">
                                    {recoveryTime}
                                </span>
                            )}

                            {/* Idle Play Icon (Subtle Pulse) */}
                            {phase === SESSION_PHASE.IDLE && (
                                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10 transition-all duration-500">
                                    <svg className="w-8 h-8 text-white/80 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer: Instructions & Controls */}
                <div className="flex flex-col items-center w-full px-8 pb-8 space-y-8">
                    
                    {/* Status Text (Minimalist) */}
                    <div className="text-center h-16 flex flex-col items-center justify-center">
                        <h2 className={`text-2xl font-light tracking-[0.2em] uppercase transition-all duration-700
                            ${isInhaling ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-blue-200/80'}
                            ${phase === SESSION_PHASE.RETENTION ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]' : ''}
                        `}>
                            {phase === SESSION_PHASE.IDLE ? (
                                <span className="opacity-70 text-sm tracking-[0.3em]">Preparado para comenzar</span>
                            ) : (
                                getInstructionText()
                            )}
                        </h2>
                        {phase === SESSION_PHASE.BREATHING && (
                            <p className="text-white/30 text-xs tracking-widest mt-2 uppercase animate-pulse">Sigue el ritmo</p>
                        )}
                    </div>

                    {/* Primary Actions (Glassmorphism Buttons) */}
                    <div className="w-full max-w-xs transition-all duration-500 transform">
                        {phase === SESSION_PHASE.IDLE && (
                            <button
                                onClick={startSession}
                                className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white text-sm font-bold tracking-[0.2em] transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-1"
                            >
                                COMENZAR
                            </button>
                        )}

                        {phase === SESSION_PHASE.RETENTION && (
                            <button
                                onClick={endRetention}
                                className="w-full py-4 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-md border border-cyan-500/30 text-cyan-100 text-sm font-bold tracking-[0.2em] transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] animate-fade-in-up"
                            >
                                TERMINAR RETENCIÓN
                            </button>
                        )}

                        {phase === SESSION_PHASE.FINISHED && (
                            <button
                                onClick={() => navigate('/dashboard/breathing')}
                                className="w-full py-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-md border border-emerald-500/30 text-emerald-100 text-sm font-bold tracking-[0.2em] transition-all duration-300 shadow-lg"
                            >
                                FINALIZAR SESIÓN
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuidedBreathingPage;
