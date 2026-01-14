import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBreathingSession, SESSION_PHASE } from '../../../hooks/useBreathingSession';
import NeonHexagon from '../../../components/breathing/NeonHexagon';
import BreathingLottie from '../../../components/breathing/BreathingLottie';
import powerBreathingAnim from '../../../animation/power_breathing.json';
import fastBreathingAnim from '../../../animation/fast_breathing.json'; // Import Fast Animation
import slowBreathingAnim from '../../../animation/slow_breathing.json'; // Import Slow Animation
import BackButton from '../../../components/common/BackButton';
import breathingService from '../../../services/breathingService';


// Formatea segundos a MM:SS
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const GuidedBreathingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State for config, initialized from navigation state or empty to be filled by API
    const [config, setConfig] = useState(location.state?.config || null);

    // Fetch config if not passed in state
    useEffect(() => {
        if (!config) {
            import('../../../services/api').then(module => {
                const api = module.default;
                api.get('/breathing/config')
                    .then(data => {
                        // API returns data directly, not wrapped in res.data
                        if (data) {
                            setConfig({
                                speed: data.speed,
                                rounds: data.rounds,
                                breathsPerRound: data.breaths_per_round || 30,
                                bgMusic: data.bg_music,
                                phaseMusic: data.phase_music,
                                retentionMusic: data.retention_music,
                                voiceGuide: data.voice_guide,
                                breathingGuide: data.breathing_guide,
                                retentionGuide: data.retention_guide,
                                pingGong: data.ping_gong,
                                breath_sounds: data.breath_sounds,
                                sound_urls: data.sound_urls || {}
                            });
                        } else {
                            setConfig({}); // Fallback to defaults
                        }
                    })
                    .catch(err => {
                        console.error("Error fetching config, using defaults", err);
                        setConfig({}); // Fallback on error
                    });
            });
        }
    }, [config]);

    // Fetch Hexagon Defaults and merge
    useEffect(() => {
        import('../../../services/api').then(module => {
            const api = module.default;
            api.get('/settings/hexagons').then(res => {
                if (res.data && res.data.breathing && res.data.breathing.sound_urls) {
                    setConfig(prev => prev ? ({ ...prev, sound_urls: res.data.breathing.sound_urls }) : prev);
                }
            }).catch(err => console.error("Error fetching hexagon defaults", err));
        });
    }, []);

    const {
        phase,
        round,
        breathCount,
        setBreathCount,
        isInhaling,
        retentionTime,
        recoveryTime,
        startSession,
        startRetention,
        endRetention,
        totalBreaths,
        sessionResults
    } = useBreathingSession({ ...config, useLottie: !!config?.speed });

    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // --- Audio Logic ---
    const breathingSoundRef = useRef(new Audio());
    const pingGongSoundRef = useRef(new Audio());

    // Ping Gong Logic
    // Triggers:
    // 1. Transition Breathing -> Retention (Start Retention)
    // 2. Retention Minute Marker (60s, 120s...)
    // 3. End of Recovery (Recovery -> Finished/Breathing)
    const prevPhaseRef = useRef(phase);

    // Default ping sound fallback (MinIO public URL)
    const DEFAULT_PING_URL = 'https://minio.n8nprueba.shop/eukrasia/breathing-sounds/1768379574236-timer_ping.mp3';

    useEffect(() => {
        // Init Audio
        const safeConfig = config || {};
        if (safeConfig.pingGong !== false) {
            // Use uploaded URL or fallback to default
            const pingUrl = safeConfig.sound_urls?.ping_gong || DEFAULT_PING_URL;
            pingGongSoundRef.current.src = pingUrl;
        }
    }, [config]);

    useEffect(() => {
        const safeConfig = config || {};
        // Skip only if explicitly disabled
        if (safeConfig.pingGong === false) return;

        const currentPhase = phase;
        const previousPhase = prevPhaseRef.current;
        const pingAudio = pingGongSoundRef.current;

        const playPing = () => {
            // Ensure audio source is set (may use fallback)
            if (!pingAudio.src) {
                pingAudio.src = safeConfig.sound_urls?.ping_gong || DEFAULT_PING_URL;
            }
            pingAudio.currentTime = 0;
            pingAudio.play().catch(e => console.warn("Ping play blocked:", e));
        };

        // Trigger 1: Transition Breathing -> Retention
        if (previousPhase === SESSION_PHASE.BREATHING && currentPhase === SESSION_PHASE.RETENTION) {
            playPing();
        }

        // Trigger 3: End of Recovery (Recovery -> Idle (Finished) or Breathing (Next Round))
        // Note: useBreathingSession transitions: Recovery -> Recovery_Exhale -> Breathing or Finished
        if (previousPhase === SESSION_PHASE.RECOVERY && currentPhase !== SESSION_PHASE.RECOVERY) {
            // To be precise: End of 15s hold. 
            // Logic enters RECOVERY_EXHALE after RECOVERY.
            if (currentPhase === SESSION_PHASE.RECOVERY_EXHALE) {
                playPing();
            }
        }

        // Final Session End
        if (previousPhase !== SESSION_PHASE.FINISHED && currentPhase === SESSION_PHASE.FINISHED) {
            playPing();
        }

        prevPhaseRef.current = currentPhase;
    }, [phase, config]);

    // Trigger 2: Minute Marker
    useEffect(() => {
        const safeConfig = config || {};
        if (safeConfig.pingGong === false || !safeConfig.sound_urls?.ping_gong) return;

        if (phase === SESSION_PHASE.RETENTION && retentionTime > 0 && retentionTime % 60 === 0) {
            const pingAudio = pingGongSoundRef.current;
            pingAudio.currentTime = 0;
            pingAudio.play().catch(e => console.warn("Minute Ping play blocked:", e));
        }
    }, [retentionTime, phase, config]);


    // Audio Ref for direct control
    const audioRef = breathingSoundRef;

    // Re-sync audio on every breath to prevent drift (CRITICAL FIX)
    const handleBreathComplete = (count) => {
        setBreathCount(count);
        // Reset audio to start of loop to ensure sync with visual
        if (audioRef.current && phase === SESSION_PHASE.BREATHING) {
            const safeConfig = config || {};
            // Only if breathing sounds are enabled
            if (safeConfig.breath_sounds !== false) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => { }); // Ignore overlapping play errors
            }
        }
    };

    useEffect(() => {
        // Breathing Sound Logic
        const safeConfig = config || {};
        // If feature is disabled globally or locally, stop.
        if (safeConfig.breath_sounds === false) {
            audioRef.current.pause();
            return;
        }

        const speedKey = safeConfig.speed || 'standard';
        const soundKey = `breathing_sound_${speedKey}`;
        const soundUrl = safeConfig.sound_urls?.[soundKey];

        const audio = audioRef.current;

        if (phase === SESSION_PHASE.BREATHING && soundUrl) {
            if (audio.src !== soundUrl) {
                audio.src = soundUrl;
                audio.loop = true; // Loop is backup, but we manually re-sync
                audio.load();
            }
            // Enforce Playback Rate if needed (Optional if files are pre-timed)
            // But we trust the files for now. 
            // If we wanted to force sync: audio.playbackRate = NATIVE_FILE_DURATION / targetDuration;

            if (audio.paused) {
                audio.play().catch(e => console.warn("Breathing Audio play blocked:", e));
            }
        } else {
            // Stop sound immediately when leaving breathing phase
            if (!audio.paused || audio.currentTime > 0) {
                audio.pause();
                audio.currentTime = 0;
            }
        }

        return () => {
            // Cleanup on unmount or phase change
            // Don't pause here to allow transition sounds if needed, but for breathing loop we stop.
        };
    }, [phase, config]);

    const handleSaveSession = async () => {
        setIsSaving(true);
        try {
            // Calculate total duration (approximate or sum of retention)
            const totalDuration = sessionResults.reduce((acc, curr) => acc + curr.retentionTime, 0);

            await breathingService.saveSession({
                type: 'guided',
                duration_seconds: totalDuration,
                rounds_data: sessionResults,
                notes: notes
            });
            // Navigate back without popup
            navigate('/breathing');
        } catch (error) {
            console.error('Error saving session:', error);
            // Still navigate back - don't block user with error popup
            navigate('/breathing');
        } finally {
            setIsSaving(false);
        }
    };

    // Textos de Ayuda
    const getInstructionText = () => {
        if (phase === SESSION_PHASE.IDLE) return "Toca para iniciar";
        if (phase === SESSION_PHASE.BREATHING) return isInhaling ? "INHALA" : "EXHALA";
        if (phase === SESSION_PHASE.RETENTION) return "MANTÉN (SIN AIRE)";
        if (phase === SESSION_PHASE.RECOVERY_INHALE) return "INHALA PROFUNDO";
        if (phase === SESSION_PHASE.RECOVERY) return "AGUANTA (15s)";
        if (phase === SESSION_PHASE.RECOVERY_EXHALE) return "EXPULSA";
        if (phase === SESSION_PHASE.FINISHED) return "SESIÓN COMPLETADA";
        return "";
    };

    // While loading, show nothing or loader
    // MOVED CHECK HERE to respect Rules of Hooks (all hooks must run before return)
    const effectiveConfig = config || { speed: 'standard' };
    if (!config) return <div className="w-full h-full flex items-center justify-center text-white">Cargando...</div>;

    // Determine visual mode
    const currentSpeed = effectiveConfig.speed || 'standard';

    // Target duration per breath cycle (should match useBreathingSession logic)
    // Fast: 3s, Standard: 5s, Slow: 8s
    const TARGET_DURATIONS = {
        fast: 3.0,
        standard: 5.0,
        slow: 8.0
    };
    const targetDuration = TARGET_DURATIONS[currentSpeed] || 5.0;

    // Animation Data
    let animData = null;
    let animSpeed = 1;

    if (phase === SESSION_PHASE.BREATHING) {
        // Native Animation Duration is ~2.75 seconds (165 frames / 60fps)
        const NATIVE_DURATION = 2.75;

        if (currentSpeed === 'standard') {
            animData = powerBreathingAnim;
        } else if (currentSpeed === 'fast') {
            animData = fastBreathingAnim;
        } else if (currentSpeed === 'slow') {
            animData = slowBreathingAnim;
        }

        // Calculate precise speed multiplier to match target duration
        animSpeed = NATIVE_DURATION / targetDuration;
    }

    // Enable Lottie animation when we have animation data
    const showLottie = !!animData && phase === SESSION_PHASE.BREATHING;

    // Helper to map complex phases to NeonHexagon simple phases
    const getHexagonPhase = () => {
        if (phase === SESSION_PHASE.BREATHING) return 'breathing';
        if (phase === SESSION_PHASE.RETENTION) return 'retention';
        // Map all recovery sub-phases to 'recovery' so it stays White
        if (phase === SESSION_PHASE.RECOVERY ||
            phase === SESSION_PHASE.RECOVERY_INHALE ||
            phase === SESSION_PHASE.RECOVERY_EXHALE) return 'recovery';
        return 'idle';
    };

    // Calculamos clases dinámicas para la animación
    const getAnimationClass = () => {
        const base = "relative transition-all ease-linear";

        if (phase === SESSION_PHASE.IDLE) return `${base} scale-100 opacity-80 hover:scale-105 hover:opacity-100 cursor-pointer duration-500`;

        // Retention (Empty) -> Slightly contracted but still visible
        if (phase === SESSION_PHASE.RETENTION) return `${base} scale-90 opacity-95 duration-1000`;

        // Inhale Prep (3s) -> Expand to Full
        if (phase === SESSION_PHASE.RECOVERY_INHALE) return `${base} scale-110 duration-[3000ms]`;

        // Recovery Hold (15s) -> Stay Full
        if (phase === SESSION_PHASE.RECOVERY) return `${base} scale-110 duration-500`;

        // Exhale Prep (3s) -> Contract
        if (phase === SESSION_PHASE.RECOVERY_EXHALE) return `${base} scale-75 opacity-90 duration-[3000ms]`;

        return `${base} scale-105`; // Default slightly larger
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#020617] flex flex-col items-center justify-center font-['Outfit']">
            {/* Deep Ocean Background: Radial Gradient for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0f172a] to-[#020617] opacity-100 z-0" />

            {/* Subtle Texture Overlay - Removed (asset not found) */}

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
                {phase === SESSION_PHASE.FINISHED ? (
                    <div className="flex flex-col items-center w-full animate-fade-in-up md:px-6">
                        {/* Summary Icon - Chart Analytics */}
                        <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
                            <div className="relative z-10 p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 shadow-xl">
                                <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
                                    {/* Bar chart with magnifying glass */}
                                    <rect x="4" y="36" width="8" height="20" rx="2" fill="#4DD0E1" />
                                    <rect x="16" y="24" width="8" height="32" rx="2" fill="#FFD54F" />
                                    <rect x="28" y="12" width="8" height="44" rx="2" fill="#81C784" />
                                    <rect x="40" y="20" width="8" height="36" rx="2" fill="#EF5350" />
                                    {/* Magnifying glass */}
                                    <circle cx="48" cy="16" r="10" stroke="#64B5F6" strokeWidth="3" fill="none" />
                                    <line x1="55" y1="23" x2="60" y2="28" stroke="#64B5F6" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx="48" cy="16" r="5" fill="#64B5F6" fillOpacity="0.3" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-lime-400 mb-2">¡Excelente!</h2>
                        <p className="text-gray-400 text-center text-sm mb-6 px-4 leading-relaxed">
                            Recupera tu ritmo de respiración normal.<br />
                            <span className="text-gray-500">Aquí están tus resultados:</span>
                        </p>

                        {/* Stats Box - Enhanced */}
                        <div className="w-full bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-white/10 rounded-2xl p-5 mb-5 shadow-xl backdrop-blur-sm">
                            {/* Average Time - Highlighted */}
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
                                    <span className="text-gray-300 font-medium text-sm">Tiempo promedio</span>
                                </div>
                                <span className="text-2xl font-bold text-white tabular-nums tracking-wider">
                                    {sessionResults.length > 0
                                        ? formatTime(Math.round(sessionResults.reduce((acc, curr) => acc + curr.retentionTime, 0) / sessionResults.length))
                                        : "00:00"}
                                </span>
                            </div>

                            {/* Round Results */}
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 scrollbar-hide">
                                {sessionResults.map((res, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <span className="text-lime-400 font-medium text-sm">Ronda {res.round}</span>
                                        <span className="text-white/90 font-mono text-sm tabular-nums">{formatTime(res.retentionTime)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes Input - Enhanced */}
                        <div className="w-full mb-6">
                            <label className="flex items-center gap-2 text-lime-400 mb-2 cursor-pointer hover:text-lime-300 transition-colors group">
                                <span className="text-lg font-bold group-hover:scale-110 transition-transform">+</span>
                                <span className="font-bold text-xs tracking-wide uppercase">Agregar Nota</span>
                            </label>
                            <textarea
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none placeholder-gray-600"
                                rows="2"
                                placeholder="Escribe tus observaciones..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        {/* Actions - Enhanced */}
                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={handleSaveSession}
                                disabled={isSaving}
                                className="w-full py-4 bg-lime-600 hover:bg-lime-500 text-white text-sm font-bold tracking-widest rounded-xl transition-all shadow-lg hover:shadow-lime-500/30 disabled:opacity-50 uppercase"
                            >
                                {isSaving ? "Guardando..." : "Guardar Sesión"}
                            </button>

                            <button
                                onClick={startSession}
                                className="w-full py-3 text-gray-500 hover:text-white text-xs font-medium tracking-widest transition-colors uppercase hover:bg-white/5 rounded-lg"
                            >
                                Reiniciar
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Round Indicator (Floating & Elegant) */}
                        <div className="flex flex-col items-center mt-12 animate-fade-in-down">
                            <span className="text-cyan-400/80 text-sm tracking-[0.5em] uppercase font-bold mb-3 shadow-cyan-500/20 drop-shadow-sm">Ronda</span>
                            <div className="flex items-baseline gap-3 text-white/90">
                                <span className="text-6xl font-light tabular-nums tracking-widest drop-shadow-md">
                                    {round < 10 ? `0${round}` : round}
                                </span>
                                <span className="text-2xl font-light text-white/40 tracking-widest">/ 0{config.rounds || 3}</span>
                            </div>
                        </div>

                        {/* Center: Animation & Counters */}
                        <div className="relative flex items-center justify-center flex-1 w-full">

                            {/* Breathing Animation Container */}
                            <div
                                className={getAnimationClass()}
                                onClick={phase === SESSION_PHASE.IDLE ? startSession : undefined}
                            >

                                {/* Render Visual: Lottie OR NeonHexagon */}
                                {showLottie ? (
                                    <BreathingLottie
                                        animationData={animData}
                                        speed={animSpeed}
                                        targetBreaths={totalBreaths}
                                        onComplete={startRetention}
                                        onBreathComplete={handleBreathComplete} // Use new handler
                                        isPlaying={phase === SESSION_PHASE.BREATHING}
                                    />
                                ) : (
                                    <NeonHexagon phase={getHexagonPhase()} isInhaling={isInhaling} />
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

                                    {/* Recovery & Transitions - Shared Timer Display */}
                                    {(phase === SESSION_PHASE.RECOVERY ||
                                        phase === SESSION_PHASE.RECOVERY_INHALE ||
                                        phase === SESSION_PHASE.RECOVERY_EXHALE) && (
                                            <span className="text-9xl font-bold text-amber-300 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse tabular-nums">
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
                    </>
                )}
            </div>
        </div>
    );
};

export default GuidedBreathingPage;
