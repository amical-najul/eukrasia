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
import { useTheme } from '../../../context/ThemeContext';


// Formatea segundos a MM:SS
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Default audio fallbacks
const DEFAULT_PING_URL = 'https://files.n8nprueba.shop/eukrasia/breathing-sounds/1768379574236-timer_ping.mp3';
const DEFAULT_RETENTION_URL = 'https://files.n8nprueba.shop/eukrasia/breathing-sounds/1768436662487-breathing_recovery_music_30s.mp3';
const DEFAULT_BG_URL = 'https://files.n8nprueba.shop/eukrasia/breathing-sounds/1768443184570-Flata%20tibetana%20musica%20de%20fondo%2010min.mp3';
const DEFAULT_BREATH_URLS = {
    fast: 'https://files.n8nprueba.shop/eukrasia/breathing-sounds/1768379623064-breathing_cycle_fast_breathing.mp3',
    standard: 'https://files.n8nprueba.shop/eukrasia/breathing-sounds/1768379637003-breathing_cycle_medium_breathing.mp3',
    slow: 'https://files.n8nprueba.shop/eukrasia/breathing-sounds/1768379645369-breathing_cycle_slow_breathing.mp3'
};
const DEFAULT_PROMPTS = {
    inhale: 'https://files.n8nprueba.shop/eukrasia/breathing-sounds/1768445364993-Una_inhalacion.mp3',
    exhale: 'https://files.n8nprueba.shop/eukrasia/breathing-sounds/1768445379420-una_exhalacion.mp3'
};

const GuidedBreathingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark } = useTheme();

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
                                inhale_prompt: data.inhale_prompt,
                                exhale_prompt: data.exhale_prompt,
                                sound_urls: data.sound_urls || {},
                                volumes: data.volumes || {}
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
                console.log('[Hexagon Settings] Raw API response:', res);
                if (res && res.breathing) {
                    setConfig(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            sound_urls: { ...prev.sound_urls, ...res.breathing.sound_urls },
                            volumes: { ...prev.volumes, ...res.breathing.volumes },
                            // Sync toggles if they were missing in user config
                            bgMusic: prev.bgMusic ?? res.breathing.bg_music,
                            phaseMusic: prev.phaseMusic ?? res.breathing.phase_music,
                            retentionMusic: prev.retentionMusic ?? res.breathing.retention_music,
                            inhale_prompt: prev.inhale_prompt ?? res.breathing.inhale_prompt,
                            exhale_prompt: prev.exhale_prompt ?? res.breathing.exhale_prompt
                        };
                    });
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
        startPreparation,
        startRetention,
        endRetention,
        prepareTime,
        totalBreaths,
        sessionResults
    } = useBreathingSession({
        ...config,
        useLottie: !!config?.speed
    });

    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Results editing state
    const [localResults, setLocalResults] = useState([]);
    const [editingIdx, setEditingIdx] = useState(null);
    const [editValue, setEditValue] = useState('');

    // Sync sessionResults to localResults when phase becomes FINISHED
    useEffect(() => {
        if (phase === SESSION_PHASE.FINISHED && localResults.length === 0) {
            setLocalResults(sessionResults);
        } else if (phase !== SESSION_PHASE.FINISHED && localResults.length > 0) {
            // Clear local results if we start a new session
            setLocalResults([]);
        }
    }, [phase, sessionResults]);

    const handleDeleteRound = (idx) => {
        setLocalResults(prev => prev.filter((_, i) => i !== idx));
    };

    const startEditing = (idx, currentVal) => {
        setEditingIdx(idx);
        setEditValue(currentVal.toString());
    };

    const saveEdit = () => {
        if (editingIdx === null) return;
        const newVal = parseInt(editValue, 10);
        if (!isNaN(newVal)) {
            setLocalResults(prev => {
                const updated = [...prev];
                updated[editingIdx] = { ...updated[editingIdx], retentionTime: newVal };
                return updated;
            });
        }
        setEditingIdx(null);
    };

    // --- Audio Refs (Dedicated channels) ---
    const bgMusicRef = useRef(new Audio());
    const breathingSoundRef = useRef(new Audio());
    const retentionMusicRef = useRef(new Audio());
    const pingGongSoundRef = useRef(new Audio());
    const voiceGuideRef = useRef(new Audio());
    const phaseMusicRef = useRef(new Audio());
    const inhalePromptRef = useRef(new Audio());
    const exhalePromptRef = useRef(new Audio());

    const allAudioRefs = [bgMusicRef, breathingSoundRef, retentionMusicRef, pingGongSoundRef, voiceGuideRef, phaseMusicRef, inhalePromptRef, exhalePromptRef];

    // --- Global Audio Setup & Cleanup ---
    useEffect(() => {
        // Initialize all audios with common properties
        allAudioRefs.forEach(ref => {
            const audio = ref.current;
            audio.crossOrigin = "anonymous";
        });

        // MASTER CLEANUP: Stop EVERYTHING when leaving the page
        return () => {
            console.log('[Audio System] Cleanup: Stopping all sounds on unmount');
            allAudioRefs.forEach(ref => {
                const audio = ref.current;
                audio.pause();
                audio.src = "";
                audio.load();
            });
        };
    }, []);

    // Helper to play/stop audio with logging
    const setAudioSourceAndPlay = (audio, url, shouldPlay, loop = false) => {
        if (!url) {
            if (!audio.paused) audio.pause();
            return;
        }

        if (shouldPlay) {
            if (audio.src !== url) {
                audio.src = url;
                audio.load();
            }
            audio.loop = loop;
            if (audio.paused) {
                audio.play().catch(e => console.warn('[Audio] Play blocked:', e));
            }
        } else {
            if (!audio.paused) {
                console.log(`[Audio System] Stopping: ${url || 'unknown'}`);
                audio.pause();
                audio.currentTime = 0;
            }
        }
    };

    // --- 1. Background Music (Continuous throughout session) ---
    // Special handling: Only start once, never restart on phase changes
    useEffect(() => {
        const safeConfig = config || {};
        const url = safeConfig.sound_urls?.bg_music || DEFAULT_BG_URL;
        const audio = bgMusicRef.current;

        // Should stop only when FINISHED or IDLE
        const shouldStop = phase === SESSION_PHASE.FINISHED || phase === SESSION_PHASE.IDLE || safeConfig.bgMusic === false;

        console.log(`[Audio BG] Phase: ${phase}, ShouldStop: ${shouldStop}, IsPlaying: ${!audio.paused}`);

        if (shouldStop) {
            // Stop the music
            if (!audio.paused) {
                console.log('[Audio BG] Stopping background music');
                audio.pause();
                audio.currentTime = 0;
            }
        } else {
            // Only start if not already playing (prevents restart on phase change)
            if (audio.paused) {
                if (audio.src !== url) {
                    audio.src = url;
                    audio.load();
                }
                audio.loop = true;
                console.log('[Audio BG] Starting background music');
                audio.play().catch(e => console.warn('[Audio BG] Play blocked:', e));
            }
            // If already playing, do nothing - let it continue
        }
    }, [config, phase]);

    // --- 2. Breathing Sounds (Loop during BREATHING phase) ---
    useEffect(() => {
        const safeConfig = config || {};
        const speedKey = safeConfig.speed || 'standard';
        const soundKey = `breathing_sound_${speedKey}`;
        const url = safeConfig.sound_urls?.[soundKey] || DEFAULT_BREATH_URLS[speedKey];

        const shouldPlay = phase === SESSION_PHASE.BREATHING && safeConfig.breath_sounds !== false;
        setAudioSourceAndPlay(breathingSoundRef.current, url, shouldPlay, true);
    }, [phase, config]);

    // --- 2.5 Phase Music (Loop during BREATHING phase) ---
    useEffect(() => {
        const safeConfig = config || {};
        const url = safeConfig.sound_urls?.phase_music;
        const shouldPlay = phase === SESSION_PHASE.BREATHING && safeConfig.phase_music !== false;
        setAudioSourceAndPlay(phaseMusicRef.current, url, shouldPlay, true);
    }, [phase, config]);

    // --- 3. Retention Music (Loop during RETENTION + RECOVERY) ---
    useEffect(() => {
        const safeConfig = config || {};
        const url = safeConfig.sound_urls?.retention_music || DEFAULT_RETENTION_URL;

        // REY REQUIREMENT: Play during RETENTION, RECOVERY_INHALE, and RECOVERY
        // Stop only when starting to exhale (RECOVERY_EXHALE) or when finished
        const isActivePhase =
            phase === SESSION_PHASE.RETENTION ||
            phase === SESSION_PHASE.RECOVERY_INHALE ||
            phase === SESSION_PHASE.RECOVERY;

        const shouldPlay = isActivePhase && safeConfig.retentionMusic !== false;

        console.log(`[Retention Music] Phase: ${phase}, ShouldPlay: ${shouldPlay}, URL: ${url}`);
        setAudioSourceAndPlay(retentionMusicRef.current, url, shouldPlay, true);
    }, [phase, config]);

    // --- 4. Transition Sounds (Ping/Gong) ---
    // Triggers logic remains similar but uses the dedicated ref
    const prevPhaseRef = useRef(phase);
    useEffect(() => {
        const safeConfig = config || {};
        if (safeConfig.pingGong === false) return;

        const currentPhase = phase;
        const previousPhase = prevPhaseRef.current;
        const pingAudio = pingGongSoundRef.current;
        const pingUrl = safeConfig.sound_urls?.ping_gong || DEFAULT_PING_URL;

        const triggerPing = () => {
            if (pingAudio.src !== pingUrl) pingAudio.src = pingUrl;
            pingAudio.currentTime = 0;
            pingAudio.play().catch(e => console.warn('[Ping] Play blocked:', e));
        };

        // Transitions logic
        if (previousPhase === SESSION_PHASE.BREATHING && currentPhase === SESSION_PHASE.RETENTION) {
            triggerPing();
        } else if (previousPhase === SESSION_PHASE.RECOVERY && currentPhase === SESSION_PHASE.RECOVERY_EXHALE) {
            triggerPing();
        } else if (previousPhase !== SESSION_PHASE.FINISHED && currentPhase === SESSION_PHASE.FINISHED) {
            triggerPing();
        }

        // Minute marker logic
        if (phase === SESSION_PHASE.RETENTION && retentionTime > 0 && retentionTime % 60 === 0) {
            triggerPing();
        }

        prevPhaseRef.current = currentPhase;
    }, [phase, retentionTime, config]);

    // --- 5. Voice Guides (Specific for each phase) ---
    useEffect(() => {
        const safeConfig = config || {};
        if (safeConfig.voiceGuide === false) return;

        let guideKey = null;
        if (phase === SESSION_PHASE.BREATHING) guideKey = 'breathing_guide';
        if (phase === SESSION_PHASE.RETENTION) guideKey = 'retention_guide';
        // Note: We could add recovery_guide if it exists in the future

        const url = safeConfig.sound_urls?.[guideKey];
        setAudioSourceAndPlay(voiceGuideRef.current, url, !!guideKey, false); // Voice guides usually don't loop
    }, [phase, config]);

    // --- 6. Volume Synchronization ---
    useEffect(() => {
        const safeConfig = config || {};
        const vols = safeConfig.volumes || {};

        console.log('[Volume Sync] Config volumes:', JSON.stringify(vols));

        // Apply Volumes to each channel
        if (bgMusicRef.current) bgMusicRef.current.volume = vols.bg_music ?? 0.5;
        if (phaseMusicRef.current) phaseMusicRef.current.volume = vols.phase_music ?? 0.8;
        if (retentionMusicRef.current) retentionMusicRef.current.volume = vols.retention_music ?? 0.8;
        if (pingGongSoundRef.current) pingGongSoundRef.current.volume = vols.ping_gong ?? 0.8;
        if (voiceGuideRef.current) {
            // Determines which guide volume to use based on phase
            let guideVol = vols.voice_guide ?? 1.0;
            if (phase === SESSION_PHASE.BREATHING) guideVol = vols.breathing_guide ?? 1.0;
            if (phase === SESSION_PHASE.RETENTION) guideVol = vols.retention_guide ?? 1.0;
            voiceGuideRef.current.volume = guideVol;
        }
        if (breathingSoundRef.current) {
            const speedKey = safeConfig.speed || 'standard';
            const volumeKey = `breathing_sound_${speedKey}`;
            breathingSoundRef.current.volume = vols[volumeKey] ?? 0.8;
        }
        if (inhalePromptRef.current) inhalePromptRef.current.volume = vols.inhale_prompt ?? 0.8;
        if (exhalePromptRef.current) exhalePromptRef.current.volume = vols.exhale_prompt ?? 0.8;
    }, [config, phase]);

    // Re-sync audio on every breath to prevent drift (WATCHER APPROACH)
    useEffect(() => {
        // Only sync if breathing sounds are enabled and we are in BREATHING phase
        if (phase === SESSION_PHASE.BREATHING && breathCount > 1) {
            const safeConfig = config || {};
            if (safeConfig.breath_sounds !== false && breathingSoundRef.current) {
                // Sync audio to start of loop
                breathingSoundRef.current.currentTime = 0;
                breathingSoundRef.current.play().catch(e => { });
            }
        }
    }, [breathCount, phase, config]);

    // --- 7. Inhale/Exhale Prompts (Deep transitions) ---
    useEffect(() => {
        const safeConfig = config || {};

        // Deep Inhale: During the 3s countdown BEFORE the 15s hold
        if (phase === SESSION_PHASE.RECOVERY_INHALE && recoveryTime === 2) {
            console.log(`[Prompt Trigger] Checking Inhale. Enabled: ${safeConfig.inhale_prompt}, RecoveryTime: ${recoveryTime}`);
            if (safeConfig.inhale_prompt !== false) {
                const url = safeConfig.sound_urls?.inhale_prompt || DEFAULT_PROMPTS.inhale;
                console.log(`[Prompt Trigger] Inhale URL: ${url}`);
                if (url) {
                    inhalePromptRef.current.src = url;
                    inhalePromptRef.current.currentTime = 0;
                    console.log(`[Prompt Play] Playing Deep Inhale: ${url}`);
                    inhalePromptRef.current.play().catch(e => console.warn('[Prompt] Deep Inhale blocked:', e));
                }
            }
        }

        // Exhale Transition: During the 3s countdown AFTER the 15s hold
        if (phase === SESSION_PHASE.RECOVERY_EXHALE && recoveryTime === 2) {
            console.log(`[Prompt Trigger] Checking Exhale. Enabled: ${safeConfig.exhale_prompt}, RecoveryTime: ${recoveryTime}`);
            if (safeConfig.exhale_prompt !== false) {
                const url = safeConfig.sound_urls?.exhale_prompt || DEFAULT_PROMPTS.exhale;
                console.log(`[Prompt Trigger] Exhale URL: ${url}`);
                if (url) {
                    exhalePromptRef.current.src = url;
                    exhalePromptRef.current.currentTime = 0;
                    console.log(`[Prompt Play] Playing Exhale: ${url}`);
                    exhalePromptRef.current.play().catch(e => console.warn('[Prompt] Exhale blocked:', e));
                }
            }
        }
    }, [phase, recoveryTime, config]);

    const handleSaveSession = async () => {
        setIsSaving(true);
        try {
            // Calculate total duration using edited results
            const totalDuration = localResults.reduce((acc, curr) => acc + curr.retentionTime, 0);

            await breathingService.saveSession({
                type: 'guided',
                duration_seconds: totalDuration,
                rounds_data: localResults,
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
        if (phase === SESSION_PHASE.PREPARE) return "PREPÁRATE";
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
        if (phase === SESSION_PHASE.PREPARE) return 'breathing'; // Same color as breathing for prep
        return 'idle';
    };

    // Calculamos clases dinámicas para la animación
    const getAnimationClass = () => {
        const base = "relative transition-all ease-linear";

        if (phase === SESSION_PHASE.IDLE) return `${base} scale-100 opacity-80 hover:scale-105 hover:opacity-100 cursor-pointer duration-500`;
        if (phase === SESSION_PHASE.PREPARE) return `${base} scale-100 opacity-100 duration-500 animate-pulse`;
        if (phase === SESSION_PHASE.RETENTION) return `${base} scale-100 md:scale-100 opacity-95 duration-1000`; // Removed reduction (was scale-90)
        if (phase === SESSION_PHASE.RECOVERY_INHALE) return `${base} scale-105 md:scale-110 duration-[3000ms]`;
        if (phase === SESSION_PHASE.RECOVERY) return `${base} scale-105 md:scale-110 duration-500`;
        if (phase === SESSION_PHASE.RECOVERY_EXHALE) return `${base} scale-75 md:scale-75 opacity-90 duration-[3000ms]`;
        return `${base} scale-100 md:scale-105`; // Default slightly larger
    };

    return (
        <div className={`relative w-full h-full overflow-hidden flex flex-col items-center justify-center font-['Outfit'] transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-gray-100'}`}>
            {/* Background: Radial Gradient */}
            <div className={`absolute inset-0 opacity-100 z-0 transition-opacity duration-700 ${isDark
                ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0f172a] to-[#020617]'
                : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-gray-100 to-gray-200'
                }`} />

            {/* Subtle Texture Overlay - Removed (asset not found) */}

            {/* Header: Minimalist Controls */}
            {/* Back/Close Button (Glassmorphic) */}
            <div className="absolute top-8 right-8 z-50">
                <button
                    onClick={() => navigate('/dashboard/breathing')}
                    className={`group w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 active:scale-95 ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'
                        }`}
                    title="Salir"
                >
                    <svg className={`w-5 h-5 transition-colors ${isDark ? 'text-white/70 group-hover:text-white' : 'text-black/70 group-hover:text-black'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${isDark ? 'bg-emerald-500/30' : 'bg-emerald-500/10'}`}></div>
                            <div className={`relative z-10 p-4 rounded-2xl border shadow-xl ${isDark ? 'bg-slate-800/80 border-white/10' : 'bg-white border-gray-200'}`}>
                                <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
                                    <rect x="4" y="36" width="8" height="20" rx="2" fill="#4DD0E1" />
                                    <rect x="16" y="24" width="8" height="32" rx="2" fill="#FFD54F" />
                                    <rect x="28" y="12" width="8" height="44" rx="2" fill="#81C784" />
                                    <rect x="40" y="20" width="8" height="36" rx="2" fill="#EF5350" />
                                    <circle cx="48" cy="16" r="10" stroke="#64B5F6" strokeWidth="3" fill="none" />
                                    <line x1="55" y1="23" x2="60" y2="28" stroke="#64B5F6" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx="48" cy="16" r="5" fill="#64B5F6" fillOpacity="0.3" />
                                </svg>
                            </div>
                        </div>

                        <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-lime-400' : 'text-blue-600'}`}>¡Excelente!</h2>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center text-sm mb-6 px-4 leading-relaxed`}>
                            Recupera tu ritmo de respiración normal.<br />
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Aquí están tus resultados:</span>
                        </p>

                        {/* Stats Box - Enhanced */}
                        <div className={`w-full border rounded-2xl p-5 mb-5 shadow-xl backdrop-blur-sm ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white border-gray-200'}`}>
                            {/* Average Time - Highlighted */}
                            <div className={`flex justify-between items-center mb-4 pb-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-lime-400' : 'bg-blue-500'}`}></div>
                                    <span className={`font-medium text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Tiempo promedio</span>
                                </div>
                                <span className={`text-2xl font-bold tabular-nums tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {localResults.length > 0
                                        ? formatTime(Math.round(localResults.reduce((acc, curr) => acc + curr.retentionTime, 0) / localResults.length))
                                        : "00:00"}
                                </span>
                            </div>

                            {/* Round Results */}
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {localResults.map((res, idx) => (
                                    <div key={idx} className={`flex justify-between items-center py-2 px-3 rounded-lg transition-colors group ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            {/* Delete Button - Always Semi-visible for usability */}
                                            <button
                                                onClick={() => handleDeleteRound(idx)}
                                                className={`transition-all p-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                                                title="Eliminar ronda"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                            <span className={`font-medium text-sm ${isDark ? 'text-lime-400' : 'text-blue-600'}`}>Ronda {res.round}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {editingIdx === idx ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={saveEdit}
                                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                        className={`w-16 px-2 py-1 text-sm rounded border focus:outline-none focus:ring-1 ${isDark ? 'bg-slate-700 border-white/20 text-white focus:ring-lime-500/50' : 'bg-gray-100 border-gray-300 text-gray-900 focus:ring-blue-500/50'}`}
                                                    />
                                                    <span className="text-[10px] uppercase font-bold text-gray-500">seg</span>
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex items-center gap-2 cursor-pointer group/time"
                                                    onClick={() => startEditing(idx, res.retentionTime)}
                                                >
                                                    <span className={`font-mono text-sm tabular-nums group-hover/time:underline ${isDark ? 'text-white/90' : 'text-gray-700'}`}>
                                                        {formatTime(res.retentionTime)}
                                                    </span>
                                                    <svg className={`w-3 h-3 transition-opacity ${isDark ? 'text-white/30 group-hover/time:text-lime-400' : 'text-black/20 group-hover/time:text-blue-500'}`} fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes Input - Enhanced */}
                        <div className="w-full mb-6">
                            <label className={`flex items-center gap-2 mb-2 cursor-pointer transition-colors group ${isDark ? 'text-lime-400 hover:text-lime-300' : 'text-blue-600 hover:text-blue-500'}`}>
                                <span className="text-lg font-bold group-hover:scale-110 transition-transform">+</span>
                                <span className="font-bold text-xs tracking-wide uppercase">Agregar Nota</span>
                            </label>
                            <textarea
                                className={`w-full border rounded-xl p-4 text-sm transition-all resize-none ${isDark ? 'bg-slate-900/50 border-white/10 text-gray-300 placeholder-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20' : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:ring-blue-100'}`}
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
                                className={`w-full py-4 text-white text-sm font-bold tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-50 uppercase ${isDark ? 'bg-lime-600 hover:bg-lime-500 hover:shadow-lime-500/30' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/30'}`}
                            >
                                {isSaving ? "Guardando..." : "Guardar Sesión"}
                            </button>

                            <button
                                onClick={startSession}
                                className={`w-full py-3 text-xs font-medium tracking-widest transition-colors uppercase rounded-lg ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-black/5'}`}
                            >
                                Reiniciar
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Round Indicator (Floating & Elegant) */}
                        <div className="flex flex-col items-center mt-12 animate-fade-in-down">
                            <span className={`text-sm tracking-[0.5em] uppercase font-bold mb-3 drop-shadow-sm ${isDark ? 'text-lime-400/80 shadow-lime-500/20' : 'text-blue-600/80 shadow-blue-500/20'}`}>Ronda</span>
                            <div className="flex items-baseline gap-3">
                                <span className={`text-6xl font-light tabular-nums tracking-widest drop-shadow-md ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {round < 10 ? `0${round}` : round}
                                </span>
                                <span className={`text-2xl font-light tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>/ 0{config.rounds || 3}</span>
                            </div>
                        </div>

                        {/* Center: Animation & Counters */}
                        <div className="relative flex items-center justify-center flex-1 w-full">

                            {/* Breathing Animation Container */}
                            <div
                                className={getAnimationClass()}
                                onClick={phase === SESSION_PHASE.IDLE ? startPreparation : undefined}
                            >

                                {/* Render Visual: Lottie OR NeonHexagon */}
                                {showLottie ? (
                                    <BreathingLottie
                                        animationData={animData}
                                        speed={animSpeed}
                                        targetBreaths={totalBreaths}
                                        onComplete={startRetention}
                                        onBreathComplete={setBreathCount}
                                        isPlaying={phase === SESSION_PHASE.BREATHING}
                                    />
                                ) : (
                                    <NeonHexagon phase={getHexagonPhase()} isInhaling={isInhaling || phase === SESSION_PHASE.PREPARE} />
                                )}

                                {/* Central Overlay Text */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    {/* Breathing Count - Hidden if Lottie is active */}
                                    {phase === SESSION_PHASE.BREATHING && !showLottie && (
                                        <span className={`text-6xl font-light drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-scale-in ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {breathCount}
                                        </span>
                                    )}

                                    {/* Preparation Countdown */}
                                    {phase === SESSION_PHASE.PREPARE && (
                                        <span className={`text-7xl font-bold animate-ping ${isDark ? 'text-lime-400' : 'text-blue-600'}`}>
                                            {prepareTime}
                                        </span>
                                    )}

                                    {/* Retention Timer */}
                                    {phase === SESSION_PHASE.RETENTION && (
                                        <div className="flex flex-col items-center">
                                            <span className={`text-6xl font-light drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] tracking-wider font-mono tabular-nums ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                                                {formatTime(retentionTime)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Recovery & Transitions - Shared Timer Display */}
                                    {(phase === SESSION_PHASE.RECOVERY ||
                                        phase === SESSION_PHASE.RECOVERY_INHALE ||
                                        phase === SESSION_PHASE.RECOVERY_EXHALE) && (
                                            <span className="text-7xl md:text-9xl font-black text-slate-900/80 drop-shadow-lg animate-pulse tabular-nums font-mono tracking-tight">
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
                                    ${isInhaling ? (isDark ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-gray-900') : (isDark ? 'text-blue-200/80' : 'text-blue-700/80')}
                                    ${phase === SESSION_PHASE.RETENTION ? (isDark ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'text-cyan-700') : ''}
                                    ${phase === SESSION_PHASE.PREPARE ? (isDark ? 'text-lime-400' : 'text-blue-600') : ''}
                                `}>
                                    {phase === SESSION_PHASE.IDLE ? (
                                        <span className={`opacity-70 text-sm tracking-[0.3em] font-bold ${isDark ? 'text-white' : 'text-gray-500'}`}>Preparado para comenzar</span>
                                    ) : (
                                        getInstructionText()
                                    )}
                                </h2>
                                {phase === SESSION_PHASE.BREATHING && (
                                    <p className={`${isDark ? 'text-white/30' : 'text-gray-400'} text-xs tracking-widest mt-2 uppercase animate-pulse`}>Sigue el ritmo</p>
                                )}
                            </div>

                            {/* Primary Actions (Glassmorphism Buttons) */}
                            <div className="w-full max-w-xs transition-all duration-500 transform">
                                {phase === SESSION_PHASE.IDLE && (
                                    <button
                                        onClick={startPreparation}
                                        className={`w-full py-4 rounded-2xl text-sm font-black tracking-[0.2em] transition-all duration-300 shadow-lg hover:-translate-y-1 uppercase ${isDark
                                            ? 'bg-lime-500 text-gray-900 hover:bg-lime-400 shadow-lime-500/20'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                                            }`}
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
        </div >
    );
};

export default GuidedBreathingPage;
