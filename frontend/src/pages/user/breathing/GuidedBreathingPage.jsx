import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBreathingSession, SESSION_PHASE } from '../../../hooks/useBreathingSession';
import NeonHexagon from '../../../components/breathing/NeonHexagon';
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

    return (
        <div className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center font-['Outfit']">
            {/* Background Texture Logic (CSS Gradient approx) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-[#001e36] to-black opacity-80 z-0" />

            {/* Optional Overlay Pattern */}
            <div className="absolute inset-0 bg-[url('/patterns/noise.png')] opacity-10 mix-blend-overlay z-0 pointer-events-none" />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-50">
                <BackButton onClick={() => navigate('/dashboard/breathing')} />
            </div>

            {/* UI Layer */}
            <div className="relative z-10 w-full max-w-md h-full flex flex-col items-center justify-between py-12">

                {/* Header: Rounds */}
                <div className="flex flex-col items-center mt-8">
                    {/* Box Style 'RONDA X' inspired by Image 0 */}
                    <div className="border border-white/20 px-6 py-4 rounded-sm flex flex-col items-center backdrop-blur-sm">
                        <span className="text-cyan-300 text-[10px] tracking-widest uppercase font-bold mb-1">RONDA</span>
                        <span className="text-white text-4xl font-light leading-none">{round}</span>
                    </div>
                </div>

                {/* Center: Animation & Counters */}
                <div className="relative flex items-center justify-center">
                    <NeonHexagon phase={phase} isInhaling={isInhaling} />

                    {/* Central Overlay Text (Inside Hexagon) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* Breathing Count */}
                        {phase === SESSION_PHASE.BREATHING && (
                            <span className="text-5xl font-bold text-white drop-shadow-md">
                                {breathCount}
                            </span>
                        )}

                        {/* Retention Timer */}
                        {phase === SESSION_PHASE.RETENTION && (
                            <div className="flex flex-col items-center">
                                <span className="text-5xl font-mono text-cyan-400 drop-shadow-lg tracking-widest">
                                    {formatTime(retentionTime)}
                                </span>
                            </div>
                        )}

                        {/* Recovery Timer */}
                        {phase === SESSION_PHASE.RECOVERY && (
                            <span className="text-5xl font-bold text-yellow-400 drop-shadow-xl">
                                {recoveryTime}
                            </span>
                        )}

                        {/* Idle Start Icon/Text */}
                        {phase === SESSION_PHASE.IDLE && (
                            <div className="text-white/80 animate-pulse text-6xl">
                                ▶
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer: Instructions & Controls */}
                <div className="flex flex-col items-center gap-6 mb-10 w-full px-8">
                    {/* Status Text */}
                    <div className="text-center">
                        <h2 className={`text-3xl font-bold tracking-wide uppercase transition-colors duration-500
                            ${isInhaling ? 'text-yellow-400' : 'text-blue-300'}
                            ${phase === SESSION_PHASE.RETENTION ? 'text-cyan-500' : ''}
                        `}>
                            {getInstructionText()}
                        </h2>
                        {phase === SESSION_PHASE.BREATHING && (
                            <p className="text-white/40 text-sm mt-2">Sigue el ritmo de la luz</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {phase === SESSION_PHASE.IDLE && (
                        <button
                            onClick={startSession}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-12 rounded-full shadow-lg shadow-cyan-500/30 transition transform hover:scale-105"
                        >
                            INICIAR SESIÓN
                        </button>
                    )}

                    {phase === SESSION_PHASE.RETENTION && (
                        <button
                            onClick={endRetention}
                            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-4 px-10 rounded-xl backdrop-blur-md transition w-full animate-fade-in"
                        >
                            TERMINAR RETENCIÓN
                        </button>
                    )}

                    {phase === SESSION_PHASE.FINISHED && (
                        <button
                            onClick={() => navigate('/dashboard/breathing')}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-full shadow-lg transition"
                        >
                            VOLVER AL MENÚ
                        </button>
                    )}
                </div>

                {/* Abandon Button (Top Right / Discreet) */}
                <div className="absolute top-6 right-6 z-50">
                    <button
                        onClick={() => navigate('/dashboard/breathing')}
                        className="text-white/40 hover:text-white/90 transition-colors flex flex-col items-center"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-[10px] uppercase tracking-tighter mt-1">Abandonar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuidedBreathingPage;
