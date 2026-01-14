import { useState, useEffect, useRef, useCallback } from 'react';

// Fases de la sesión
export const SESSION_PHASE = {
    IDLE: 'idle',           // Esperando iniciar
    BREATHING: 'breathing', // Fase activa (Inhala/Exhala loop)
    RETENTION: 'retention', // Retención sin aire (Cronómetro sube)
    RECOVERY: 'recovery',   // Retención con aire (15s cuenta atrás)
    FINISHED: 'finished'    // Sesión completada
};

// Configuración Wim Hof Standard
const CONFIG = {
    ROUNDS: 3,
    BREATHS_PER_ROUND: 30, // Default 30
    BREATH_DURATION: 4000, // 4s total cycle (approx)
    RECOVERY_DURATION: 15, // 15 seconds
};

export const useBreathingSession = () => {
    // Estado Principal
    const [phase, setPhase] = useState(SESSION_PHASE.IDLE);
    const [round, setRound] = useState(1);
    const [breathCount, setBreathCount] = useState(1); // 1 a 30
    const [isInhaling, setIsInhaling] = useState(false); // Para guiar animación y texto
    const [retentionTime, setRetentionTime] = useState(0); // Segundos en retención
    const [recoveryTime, setRecoveryTime] = useState(CONFIG.RECOVERY_DURATION);

    // Refs para timers
    const breathTimer = useRef(null);
    const retentionTimer = useRef(null);

    // Iniciar Sesión
    const startSession = useCallback(() => {
        setPhase(SESSION_PHASE.BREATHING);
        setRound(1);
        setBreathCount(1);
        setIsInhaling(true);
        runBreathingCycle(1);
    }, []);

    // Ciclo de Respiración (Core Logic)
    // Usamos timeouts recursivos para sincronizar con precisión
    const runBreathingCycle = (currentBreath) => {
        if (currentBreath > CONFIG.BREATHS_PER_ROUND) {
            // Fin de la ronda -> Ir a Retención
            startRetention();
            return;
        }

        // INHALA (Expandir)
        setIsInhaling(true);
        // Duración de inhalación un poco más corta que exhalación (1.6s vs 2.4s aprox)

        breathTimer.current = setTimeout(() => {
            // EXHALA (Contraer)
            setIsInhaling(false);

            breathTimer.current = setTimeout(() => {
                // Siguiente ciclo
                setBreathCount(prev => prev + 1);
                runBreathingCycle(currentBreath + 1);
            }, 2200); // Exhale duration

        }, 1800); // Inhale duration
    };

    // Fase Retención (Aguantar aire vacío)
    const startRetention = () => {
        setPhase(SESSION_PHASE.RETENTION);
        setRetentionTime(0);
        setIsInhaling(false); // Mantener contraído

        retentionTimer.current = setInterval(() => {
            setRetentionTime(prev => prev + 1);
        }, 1000);
    };

    // Terminar Retención -> Ir a Recuperación (Inhalar profundo y aguantar 15s)
    const endRetention = useCallback(() => {
        clearInterval(retentionTimer.current);
        setPhase(SESSION_PHASE.RECOVERY);
        setRecoveryTime(CONFIG.RECOVERY_DURATION);
        setIsInhaling(true); // Expandir al máximo
    }, []);

    // Timer de Recuperación (15s)
    useEffect(() => {
        let interval = null;
        if (phase === SESSION_PHASE.RECOVERY) {
            interval = setInterval(() => {
                setRecoveryTime(prev => {
                    if (prev <= 1) {
                        // Fin de Recuperación -> Siguiente Ronda o Fin
                        completeRound();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [phase]);

    const completeRound = () => {
        if (round >= CONFIG.ROUNDS) {
            setPhase(SESSION_PHASE.FINISHED);
        } else {
            // Siguiente Ronda
            setRound(prev => prev + 1);
            setBreathCount(1);
            setPhase(SESSION_PHASE.BREATHING);
            // Pequeña pausa antes de empezar
            setTimeout(() => {
                runBreathingCycle(1);
            }, 1000);
        }
    };

    // Limpieza
    useEffect(() => {
        return () => {
            clearTimeout(breathTimer.current);
            clearInterval(retentionTimer.current);
        };
    }, []);

    return {
        phase,
        round,
        breathCount,
        isInhaling,
        retentionTime,
        recoveryTime,
        startSession,
        endRetention,
        totalBreaths: CONFIG.BREATHS_PER_ROUND
    };
};
