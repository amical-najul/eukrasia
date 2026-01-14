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
                    .then(res => {
                        const data = res.data;
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
                                sound_urls: data.breathing?.sound_urls || {}
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
        isInhaling,
        retentionTime,
        recoveryTime,
        startSession,
        endRetention,
        totalBreaths,
        sessionResults
    } = useBreathingSession(config || {});

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

    useEffect(() => {
        // Init Audio
        const safeConfig = config || {};
        if (safeConfig.pingGong !== false && safeConfig.sound_urls?.ping_gong) {
            pingGongSoundRef.current.src = safeConfig.sound_urls.ping_gong;
        }
    }, [config]);

    useEffect(() => {
        const safeConfig = config || {};
        if (safeConfig.pingGong === false || !safeConfig.sound_urls?.ping_gong) return;

        const currentPhase = phase;
        const previousPhase = prevPhaseRef.current;
        const pingAudio = pingGongSoundRef.current;

        const playPing = () => {
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


    useEffect(() => {
        // Breathing Sound Logic
        const safeConfig = config || {};
        // If feature is disabled globally or locally, stop.
        if (safeConfig.breath_sounds === false) return;

        const speedKey = safeConfig.speed || 'standard';
        const soundKey = `breathing_sound_${speedKey}`;
        const soundUrl = safeConfig.sound_urls?.[soundKey];

        const audio = breathingSoundRef.current;

        if (phase === SESSION_PHASE.BREATHING && soundUrl) {
            if (audio.src !== soundUrl) {
                audio.src = soundUrl;
                audio.loop = true;
                audio.load();
            }
            if (audio.paused) {
                audio.play().catch(e => console.warn("Breathing Audio play blocked:", e));
            }
        } else {
            if (!audio.paused || audio.currentTime > 0) {
                audio.pause();
                audio.currentTime = 0;
            }
        }

        return () => {
            // Cleanup on unmount
            audio.pause();
        };
    }, [phase, config]);

    const handleSaveSession = async () => {
        setIsSaving(true);
        try {
            // Calculate total duration (approximate or sum of retention)
            // For now, let's sum retention times as a 'score'
            const totalDuration = sessionResults.reduce((acc, curr) => acc + curr.retentionTime, 0);

            await breathingService.saveSession({
                type: 'guided',
                duration_seconds: totalDuration,
                rounds_data: sessionResults,
                notes: notes
            });
            alert('Sesión guardada correctamente');
            navigate('/breathing');
        } catch (error) {
            console.error(error);
            alert('Error al guardar la sesión.');
        } finally {
            setIsSaving(false);
        }
    };

    // Textos de Ayuda
    const getInstructionText = () => {
        if (phase === SESSION_PHASE.IDLE) return "Toca para iniciar";
        if (phase === SESSION_PHASE.BREATHING) return isInhaling ? "Inhala" : "Exhala";
        if (phase === SESSION_PHASE.RETENTION) return "Mantén (Sin Aire)";
        if (phase === SESSION_PHASE.RECOVERY_INHALE) return "Inhala Profundo";
        if (phase === SESSION_PHASE.RECOVERY) return "Aguanta (15s)";
        if (phase === SESSION_PHASE.RECOVERY_EXHALE) return "Expulsa";
        if (phase === SESSION_PHASE.FINISHED) return "Sesión Completada";
        return "";
    };

    // While loading, show nothing or loader
    // MOVED CHECK HERE to respect Rules of Hooks (all hooks must run before return)
    const effectiveConfig = config || { speed: 'standard' };
    if (!config) return <div className="w-full h-full flex items-center justify-center text-white">Cargando...</div>;

    // Determine visual mode
    const currentSpeed = effectiveConfig.speed || 'standard';

    // Select Animation Data and Speed based on config
    let animData = null;
    let animSpeed = 1;

    if (phase === SESSION_PHASE.BREATHING) {
        // Native Animation Duration is ~3.5 seconds (210 frames / 60fps)
        const NATIVE_DURATION = 3.5;

        if (currentSpeed === 'standard') {
            animData = powerBreathingAnim;
            animSpeed = NATIVE_DURATION / 5.0; // ~0.7
        } else if (currentSpeed === 'fast') {
            animData = fastBreathingAnim;
            animSpeed = NATIVE_DURATION / 3.0; // ~1.16
        } else if (currentSpeed === 'slow') {
            animData = slowBreathingAnim;
            animSpeed = NATIVE_DURATION / 8.0; // ~0.4375
        }
    }

    const showLottie = !!animData;

    // Calculamos clases dinámicas para la animación
    const getAnimationClass = () => {
        const base = "relative transition-all ease-linear";

        if (phase === SESSION_PHASE.IDLE) return `${base} scale-95 opacity-80 hover:scale-100 hover:opacity-100 cursor-pointer duration-500`;

        // Retention (Empty) -> Small
        if (phase === SESSION_PHASE.RETENTION) return `${base} scale-75 opacity-90 duration-1000`; // Small-ish but visible

        // Inhale Prep (3s) -> Expand to Full
        if (phase === SESSION_PHASE.RECOVERY_INHALE) return `${base} scale-100 duration-[3000ms]`;

        // Recovery Hold (15s) -> Stay Full
        if (phase === SESSION_PHASE.RECOVERY) return `${base} scale-100 duration-500`;

        // Exhale Prep (3s) -> Contract
        if (phase === SESSION_PHASE.RECOVERY_EXHALE) return `${base} scale-50 opacity-90 duration-[3000ms]`;

        return `${base} scale-100`;
    };

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
                {phase === SESSION_PHASE.FINISHED ? (
                    <div className="flex flex-col items-center w-full animate-fade-in-up md:px-6">
                        {/* Summary Icon */}
                        <div className="w-20 h-20 mb-4 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                            <svg className="w-12 h-12 text-emerald-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-1">Well done!</h2>
                        <p className="text-gray-400 text-center text-sm mb-6 px-4">
                            Regain your normal breathing speed.<br />Here are your results:
                        </p>

                        {/* Stats Box */}
                        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                                <span className="text-gray-300 font-medium text-sm">Average time</span>
                                <span className="text-xl font-bold text-white tabular-nums">
                                    {sessionResults.length > 0
                                        ? formatTime(Math.round(sessionResults.reduce((acc, curr) => acc + curr.retentionTime, 0) / sessionResults.length))
                                        : "00:00"}
                                </span>
                            </div>

                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                {sessionResults.map((res, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="text-emerald-400/80 font-medium">Round {res.round}</span>
                                        <span className="text-white font-mono tabular-nums">{formatTime(res.retentionTime)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes Input */}
                        <div className="w-full mb-6">
                            <label className="flex items-center gap-2 text-cyan-400 mb-2 cursor-pointer hover:text-cyan-300 transition-colors">
                                <span className="text-lg font-bold">+</span>
                                <span className="font-bold text-xs tracking-wide uppercase">Add Note</span>
                            </label>
                            <textarea
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 transition-all resize-none placeholder-gray-600"
                                rows="2"
                                placeholder="..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={handleSaveSession}
                                disabled={isSaving}
                                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold tracking-widest rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50"
                            >
                                {isSaving ? "SAVING..." : "SAVE SESSION"}
                            </button>

                            <button
                                onClick={startSession}
                                className="w-full py-2 text-gray-500 hover:text-white text-xs font-medium tracking-widest transition-colors uppercase"
                            >
                                Restart
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
