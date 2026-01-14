import { useState, useEffect, useRef, useCallback } from 'react';

// Fases de la sesión
export const SESSION_PHASE = {
    IDLE: 'idle',           // Esperando iniciar
    BREATHING: 'breathing', // Fase activa (Inhala/Exhala loop)
    RETENTION: 'retention', // Retención sin aire (Cronómetro sube)
    RECOVERY_INHALE: 'recovery_inhale', // TRANSICIÓN: Inhala antes de aguantar (3s)
    RECOVERY: 'recovery',   // Retención con aire (15s cuenta atrás)
    RECOVERY_EXHALE: 'recovery_exhale', // TRANSICIÓN: Expulsa antes de siguiente ronda (3s)
    FINISHED: 'finished'    // Sesión completada
};

// Configuración Default
const DEFAULT_CONFIG = {
    rounds: 3,
    breathsPerRound: 30,
    speed: 'standard', // slow, standard, fast
    recoveryDuration: 15, // Segundos de "Aguanta"
};

const SPEED_DURATIONS = {
    slow: { inhale: 4000, exhale: 4000, hold: 0 },
    standard: { inhale: 2500, exhale: 2500, hold: 0 },
    fast: { inhale: 1500, exhale: 1500, hold: 0 },
};

export const useBreathingSession = (initialConfig = {}) => {
    // Merge defaults
    const config = { ...DEFAULT_CONFIG, ...initialConfig };

    // Estado Principal
    const [phase, setPhase] = useState(SESSION_PHASE.IDLE);
    const [round, setRound] = useState(1);
    const [breathCount, setBreathCount] = useState(1); // 1 a 30
    const [isInhaling, setIsInhaling] = useState(false);
    const [retentionTime, setRetentionTime] = useState(0);
    const [recoveryTime, setRecoveryTime] = useState(config.recoveryDuration);

    const [sessionResults, setSessionResults] = useState([]);

    // Refs para timers
    const breathTimer = useRef(null);
    const retentionTimer = useRef(null);
    const recoveryTimer = useRef(null);

    // Limpieza de timers
    const clearAllTimers = useCallback(() => {
        clearTimeout(breathTimer.current);
        clearInterval(retentionTimer.current);
        clearInterval(recoveryTimer.current);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => clearAllTimers();
    }, [clearAllTimers]);

    // Lógica de Respiración (Ciclo Inhala/Exhala)
    const runBreathingCycle = useCallback((currentBreath) => {
        if (currentBreath > config.breathsPerRound) {
            startRetention(); // Fin de la ronda -> Retención
            return;
        }

        const speeds = SPEED_DURATIONS[config.speed] || SPEED_DURATIONS.standard;
        const { inhale, exhale, hold } = speeds;

        // INHALA
        setIsInhaling(true);
        breathTimer.current = setTimeout(() => {
            // EXHALA
            setIsInhaling(false);
            breathTimer.current = setTimeout(() => {
                // HOLD (Opcional, 0 por defecto)
                if (hold > 0) {
                    breathTimer.current = setTimeout(() => {
                        setBreathCount(prev => prev + 1);
                        runBreathingCycle(currentBreath + 1);
                    }, hold);
                } else {
                    setBreathCount(prev => prev + 1);
                    runBreathingCycle(currentBreath + 1);
                }
            }, exhale);
        }, inhale);
    }, [config.breathsPerRound, config.speed]);

    // Transición a Retención (Empty Lungs)
    const startRetention = useCallback(() => {
        setPhase(SESSION_PHASE.RETENTION);
        setIsInhaling(false); // Mantener exhalación/vacío
        setRetentionTime(0);

        // Cronómetro de retención (Cuenta progresiva)
        retentionTimer.current = setInterval(() => {
            setRetentionTime(prev => prev + 1);
        }, 1000);
    }, []);

    // Transición Fin Retención -> Recovery Inhale (3s Prep)
    const endRetention = useCallback(() => {
        clearInterval(retentionTimer.current);

        // Guardar resultados de la ronda
        setSessionResults(prev => [...prev, {
            round: round,
            retentionTime: retentionTime
        }]);

        // Fase 1: Inhala Profundo (3s)
        setPhase(SESSION_PHASE.RECOVERY_INHALE);
        setRecoveryTime(3); // Usamos recoveryTime como contador genérico para transición
        setIsInhaling(true); // Visualmente expandir

    }, [round, retentionTime]);

    // Manejo de Timers de Recuperación y Transiciones
    useEffect(() => {
        let interval = null;

        if (phase === SESSION_PHASE.RECOVERY_INHALE) {
            // Cuenta regresiva 3s -> Ir a RECOVERY (Aguanta)
            interval = setInterval(() => {
                setRecoveryTime(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setPhase(SESSION_PHASE.RECOVERY);
                        setIsInhaling(true); // Mantener lleno
                        return config.recoveryDuration; // Reset a 15s para la siguiente fase
                    }
                    return prev - 1;
                });
            }, 1000);

        } else if (phase === SESSION_PHASE.RECOVERY) {
            // Cuenta regresiva 15s -> Ir a RECOVERY_EXHALE
            interval = setInterval(() => {
                setRecoveryTime(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setPhase(SESSION_PHASE.RECOVERY_EXHALE);
                        setIsInhaling(false); // Visualmente contraer (Expulsar)
                        return 3; // 3s para expulsar
                    }
                    return prev - 1;
                });
            }, 1000);

        } else if (phase === SESSION_PHASE.RECOVERY_EXHALE) {
            // Cuenta regresiva 3s -> Siguiente Ronda
            interval = setInterval(() => {
                setRecoveryTime(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        completeRound();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [phase, config.recoveryDuration]);


    // Completar Ronda y Decidir Siguiente Paso
    const completeRound = useCallback(() => {
        if (round >= config.rounds) {
            setPhase(SESSION_PHASE.FINISHED);
        } else {
            // Siguiente Ronda
            setRound(r => r + 1);
            setBreathCount(1);
            setPhase(SESSION_PHASE.BREATHING);
            setIsInhaling(true);
            runBreathingCycle(1);
        }
    }, [round, config.rounds, runBreathingCycle]);


    // Iniciar Sesión (Público)
    const startSession = useCallback(() => {
        clearAllTimers();
        setPhase(SESSION_PHASE.BREATHING);
        setRound(1);
        setBreathCount(1);
        setIsInhaling(true);
        setSessionResults([]);
        runBreathingCycle(1);
    }, [clearAllTimers, runBreathingCycle]);

    return {
        phase,
        round,
        breathCount,
        isInhaling,
        retentionTime,
        recoveryTime, // Se usa para Inhale(3s), Hold(15s) y Exhale(3s)
        startSession,
        endRetention,
        totalBreaths: config.breathsPerRound,
        totalRounds: config.rounds,
        sessionResults
    };
};
