import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FocusObject from '../../../components/mind/FocusObject';
import mindService from '../../../services/mindService';

/**
 * TratakaSessionPage - Core meditation session with focus tracking
 * 
 * Features:
 * - Two phases: Visual (80%) + Antar/Internal (20%)
 * - Distraction tracking with touch events
 * - Breathing reset animation on distraction
 * - Micro-shift for OLED protection
 * - KeepAwake + Immersive mode
 */

// Format seconds to MM:SS
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Session phases
const PHASE = {
    IDLE: 'idle',
    VISUAL: 'visual',      // 80% - Looking at object
    ANTAR: 'antar',        // 20% - Eyes closed, internal focus
    BREATHING: 'breathing', // 3s breathing reset after distraction
    FINISHED: 'finished'
};

const TratakaSessionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Session config from navigation state
    const { focusObject = 'candle', durationSec = 300 } = location.state || {};

    // Session state
    const [phase, setPhase] = useState(PHASE.IDLE);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [distractionCount, setDistractionCount] = useState(0);
    const [distractionEvents, setDistractionEvents] = useState([]);
    const [objectOpacity, setObjectOpacity] = useState(1);
    const [showHalo, setShowHalo] = useState(false);
    const [haloScale, setHaloScale] = useState(0);
    const [microShiftOffset, setMicroShiftOffset] = useState({ x: 0, y: 0 });
    const [showExitModal, setShowExitModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notes, setNotes] = useState('');

    // Refs
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const bgAudioRef = useRef(null);

    // Calculated values
    const visualPhaseDuration = Math.floor(durationSec * 0.8);
    const antarPhaseDuration = durationSec - visualPhaseDuration;
    const isActive = phase === PHASE.VISUAL || phase === PHASE.ANTAR;

    // Phase transition logic
    useEffect(() => {
        if (phase === PHASE.VISUAL && elapsedTime >= visualPhaseDuration) {
            // Transition to Antar phase
            setPhase(PHASE.ANTAR);
            setObjectOpacity(0.2); // Fade object to almost invisible
            playTransitionSound();
        } else if (phase === PHASE.ANTAR && elapsedTime >= durationSec) {
            // Session complete
            setPhase(PHASE.FINISHED);
            playGongSound();
            stopBackgroundAudio();
        }
    }, [elapsedTime, phase, visualPhaseDuration, durationSec]);

    // Main timer
    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive]);

    // Micro-shift for OLED protection (every 60 seconds)
    useEffect(() => {
        if (!isActive) return;

        if (elapsedTime > 0 && elapsedTime % 60 === 0) {
            const offsetX = (Math.random() - 0.5) * 4; // -2 to +2 px
            const offsetY = (Math.random() - 0.5) * 4;
            setMicroShiftOffset({ x: offsetX, y: offsetY });
        }
    }, [elapsedTime, isActive]);

    // Keep screen awake (using visibility API as fallback)
    useEffect(() => {
        if (isActive) {
            // Request wake lock if available
            let wakeLock = null;
            const requestWakeLock = async () => {
                try {
                    if ('wakeLock' in navigator) {
                        wakeLock = await navigator.wakeLock.request('screen');
                    }
                } catch (err) {
                    console.log('Wake Lock error:', err);
                }
            };
            requestWakeLock();

            return () => {
                if (wakeLock) wakeLock.release();
            };
        }
    }, [isActive]);

    // Audio functions
    const playTransitionSound = () => {
        if (audioRef.current) {
            audioRef.current.src = '/audio/ting.mp3';
            audioRef.current.volume = 0.6;
            audioRef.current.play().catch(() => { });
        }
    };

    const playGongSound = () => {
        if (audioRef.current) {
            audioRef.current.src = '/audio/gong.mp3';
            audioRef.current.volume = 0.8;
            audioRef.current.play().catch(() => { });
        }
    };

    const startBackgroundAudio = () => {
        if (bgAudioRef.current) {
            bgAudioRef.current.src = '/audio/brown_noise.mp3';
            bgAudioRef.current.loop = true;
            bgAudioRef.current.volume = 0.3;
            bgAudioRef.current.play().catch(() => { });
        }
    };

    const stopBackgroundAudio = () => {
        if (bgAudioRef.current) {
            bgAudioRef.current.pause();
            bgAudioRef.current.currentTime = 0;
        }
    };

    // Start session
    const handleStart = () => {
        setPhase(PHASE.VISUAL);
        setElapsedTime(0);
        setDistractionCount(0);
        setDistractionEvents([]);
        setObjectOpacity(1);
        startBackgroundAudio();
    };

    // Handle distraction (touch event)
    const handleDistraction = useCallback(() => {
        if (phase !== PHASE.VISUAL && phase !== PHASE.ANTAR) return;
        if (phase === PHASE.BREATHING) return; // Already in breathing reset

        // Pause timer
        if (timerRef.current) clearInterval(timerRef.current);

        // Record distraction
        setDistractionCount(prev => prev + 1);
        setDistractionEvents(prev => [...prev, { timestamp: formatTime(elapsedTime), type: 'distraction' }]);

        // Play ting sound
        playTransitionSound();

        // Start breathing reset (3 seconds)
        setPhase(PHASE.BREATHING);
        setObjectOpacity(0.3);
        setShowHalo(true);

        // Breathing animation: Inhale (1.5s) -> Exhale (1.5s)
        setHaloScale(0);
        setTimeout(() => setHaloScale(1.5), 50); // Start inhale
        setTimeout(() => setHaloScale(0), 1500); // Start exhale

        // Resume after 3 seconds
        setTimeout(() => {
            setShowHalo(false);
            setHaloScale(0);
            setObjectOpacity(elapsedTime >= visualPhaseDuration ? 0.2 : 1);
            setPhase(elapsedTime >= visualPhaseDuration ? PHASE.ANTAR : PHASE.VISUAL);
        }, 3000);
    }, [phase, elapsedTime, visualPhaseDuration]);

    // Early exit handlers
    const handleResume = () => {
        setShowExitModal(false);
    };

    const handleSaveAndExit = async () => {
        setIsSaving(true);
        try {
            await mindService.saveSession({
                target_duration_sec: durationSec,
                actual_duration_sec: elapsedTime,
                distraction_count: distractionCount,
                focus_object: focusObject,
                status: elapsedTime >= durationSec ? 'completed' : 'partial',
                notes: notes
            });
        } catch (err) {
            console.error('Error saving session:', err);
        } finally {
            setIsSaving(false);
            stopBackgroundAudio();
            navigate('/dashboard/mind');
        }
    };

    // Complete session
    const handleComplete = async () => {
        setIsSaving(true);
        try {
            await mindService.saveSession({
                target_duration_sec: durationSec,
                actual_duration_sec: elapsedTime,
                distraction_count: distractionCount,
                focus_object: focusObject,
                status: 'completed',
                notes: notes
            });
        } catch (err) {
            console.error('Error saving session:', err);
        } finally {
            setIsSaving(false);
            navigate('/dashboard/mind');
        }
    };

    // Progress percentage
    const progressPercent = Math.min((elapsedTime / durationSec) * 100, 100);

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none"
            onClick={isActive ? handleDistraction : undefined}
        >
            {/* Hidden audio elements */}
            <audio ref={audioRef} preload="auto" />
            <audio ref={bgAudioRef} preload="auto" />

            {/* Exit button (top-right) */}
            {phase !== PHASE.FINISHED && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isActive) {
                            setShowExitModal(true);
                            if (timerRef.current) clearInterval(timerRef.current);
                        } else {
                            navigate('/dashboard/mind');
                        }
                    }}
                    className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {/* IDLE State - Start screen */}
            {phase === PHASE.IDLE && (
                <div className="flex flex-col items-center animate-fade-in">
                    <FocusObject type={focusObject} opacity={0.8} />
                    <p className="mt-8 text-gray-500 text-sm tracking-widest uppercase">
                        {formatTime(durationSec)} minutos
                    </p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStart();
                        }}
                        className="mt-8 px-12 py-4 bg-amber-500 text-black font-bold text-sm tracking-[0.2em] uppercase rounded-2xl hover:bg-amber-400 transition-all"
                    >
                        Comenzar
                    </button>
                </div>
            )}

            {/* ACTIVE States (Visual, Antar, Breathing) */}
            {(isActive || phase === PHASE.BREATHING) && (
                <div
                    className="relative flex flex-col items-center justify-center transition-transform duration-1000"
                    style={{
                        transform: `translate(${microShiftOffset.x}px, ${microShiftOffset.y}px)`
                    }}
                >
                    {/* Focus Object */}
                    <FocusObject
                        type={focusObject}
                        opacity={objectOpacity}
                        showHalo={showHalo}
                        haloScale={haloScale}
                    />

                    {/* Timer (subtle, bottom) */}
                    <div className="absolute bottom-[-80px] text-center">
                        <span className="text-4xl font-light text-gray-600/50 tabular-nums tracking-widest">
                            {formatTime(elapsedTime)}
                        </span>
                        <p className={`text-xs uppercase tracking-[0.3em] mt-2 ${phase === PHASE.ANTAR ? 'text-gray-600' : 'text-gray-700'
                            }`}>
                            {phase === PHASE.BREATHING ? 'Respira...' :
                                phase === PHASE.ANTAR ? 'Cierra los ojos' :
                                    'Fija la mirada'}
                        </p>
                    </div>

                    {/* Distraction counter (very subtle) */}
                    {distractionCount > 0 && (
                        <div className="absolute top-[-60px] text-center">
                            <span className="text-xs text-gray-700 tracking-widest">
                                {distractionCount} {distractionCount === 1 ? 'distracción' : 'distracciones'}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Progress bar (bottom of screen) */}
            {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900">
                    <div
                        className="h-full bg-amber-500/50 transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}

            {/* FINISHED State - Results */}
            {phase === PHASE.FINISHED && (
                <div className="flex flex-col items-center w-full max-w-sm px-6 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-light text-white mb-2">Sesión Completada</h1>
                    <p className="text-gray-500 text-sm mb-8">Tu mente está más clara</p>

                    {/* Stats */}
                    <div className="w-full bg-white/5 rounded-2xl p-5 mb-6 border border-white/10">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                            <span className="text-gray-400 text-sm">Tiempo de enfoque</span>
                            <span className="text-white font-mono text-lg">{formatTime(elapsedTime)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Distracciones</span>
                            <span className="text-white font-mono text-lg">{distractionCount}</span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="w-full mb-6">
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                            rows="2"
                            placeholder="Añadir nota (opcional)..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Save button */}
                    <button
                        onClick={handleComplete}
                        disabled={isSaving}
                        className="w-full py-4 bg-amber-500 text-black font-bold text-sm tracking-[0.2em] uppercase rounded-2xl hover:bg-amber-400 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Sesión'}
                    </button>

                    <button
                        onClick={() => navigate('/dashboard/mind')}
                        className="mt-4 text-gray-500 text-sm hover:text-white transition-colors"
                    >
                        Salir sin guardar
                    </button>
                </div>
            )}

            {/* Exit Modal */}
            {showExitModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-full max-w-xs bg-slate-900 border border-white/10 rounded-2xl p-6 mx-4">
                        <h3 className="text-lg font-medium text-white mb-2">¿Terminar sesión?</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Llevas {formatTime(elapsedTime)} de {formatTime(durationSec)}
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={handleResume}
                                className="w-full py-3 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors"
                            >
                                Continuar
                            </button>
                            <button
                                onClick={handleSaveAndExit}
                                disabled={isSaving}
                                className="w-full py-3 bg-white/10 text-white font-medium text-sm rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar y salir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TratakaSessionPage;
