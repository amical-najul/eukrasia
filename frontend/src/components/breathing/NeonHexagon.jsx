import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const HexagonPath = ({ color, ...props }) => (
    <motion.path
        d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    />
);

const FilledHexagon = ({ color, ...props }) => (
    <motion.path
        d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
        fill={color}
        stroke="none"
        {...props}
    />
);

const NeonHexagon = ({ phase, isInhaling }) => {
    const controls = useAnimation();

    // Configuración de Colores según Fase
    // Breathing: Oro/Amarillo (Active)
    // Retention: Cyan/Azul (Calm)
    // Recovery: Blanco/Brillante (Power)
    const getColors = () => {
        if (phase === 'breathing') return { stroke: '#FFD700', fill: '#FFD700', glow: '#FFA500' }; // Gold
        if (phase === 'retention') return { stroke: '#00E5FF', fill: '#00E5FF', glow: '#00B8D4' }; // Cyan
        if (phase === 'recovery') return { stroke: '#FFFFFF', fill: '#FFFFFF', glow: '#E0F7FA' }; // White
        return { stroke: '#26a69a', fill: '#26a69a', glow: '#00695c' }; // Idle Teal
    };

    const colors = getColors();

    const variants = {
        inhale: {
            scale: 1.3,
            filter: `drop-shadow(0 0 20px ${colors.glow})`,
            opacity: 1,
            transition: { duration: 1.8, ease: [0.25, 0.1, 0.25, 1.0] } // Ease-Out Explosive
        },
        exhale: {
            scale: 0.85,
            filter: `drop-shadow(0 0 5px ${colors.glow})`,
            opacity: 0.8,
            transition: { duration: 2.2, ease: [0.42, 0, 0.58, 1.0] } // Ease-In Relaxed
        },
        holdEmpty: { // Fase B: Retención
            scale: 0.8,
            filter: `drop-shadow(0 0 2px ${colors.glow})`,
            opacity: 0.6,
            transition: { duration: 1 }
        },
        holdFull: { // Fase C: Recuperación
            scale: 1.4,
            filter: `drop-shadow(0 0 30px ${colors.glow})`,
            opacity: 1,
            transition: { duration: 0.5 }
        },
        idle: {
            scale: 1,
            opacity: 0.8,
            filter: `drop-shadow(0 0 10px ${colors.glow})`,
            transition: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 2
            }
        }
    };

    return (
        <div className="relative w-40 h-40 md:w-80 md:h-80 flex items-center justify-center">
            {/* Capa Halo/Glow (Blurry Background) */}
            <motion.svg
                viewBox="0 0 100 100"
                className="absolute w-full h-full opacity-50 blur-xl"
                animate={
                    phase === 'breathing' ? (isInhaling ? 'inhale' : 'exhale') :
                        phase === 'retention' ? 'holdEmpty' :
                            phase === 'recovery' ? 'holdFull' : 'idle'
                }
                variants={variants}
            >
                <FilledHexagon color={colors.glow} />
            </motion.svg>

            {/* Capa Principal (Defined Edge) */}
            <motion.svg
                viewBox="0 0 100 100"
                className="absolute w-full h-full z-10"
                animate={
                    phase === 'breathing' ? (isInhaling ? 'inhale' : 'exhale') :
                        phase === 'retention' ? 'holdEmpty' :
                            phase === 'recovery' ? 'holdFull' : 'idle'
                }
                variants={variants}
            >
                {/* Stroke Outline */}
                <HexagonPath color={colors.stroke} strokeWidth="3" />
                {/* Posible Inner Fill Opacity */}
                <FilledHexagon color={colors.fill} style={{ opacity: 0.2 }} />
            </motion.svg>

            {/* Capa 'Ghost' (Pequeño retraso para efecto vapor) */}
            <motion.svg
                viewBox="0 0 100 100"
                className="absolute w-full h-full opacity-30 mix-blend-screen"
                animate={
                    phase === 'breathing' ? (isInhaling ? 'inhale' : 'exhale') :
                        phase === 'retention' ? 'holdEmpty' :
                            phase === 'recovery' ? 'holdFull' : 'idle'
                }
                variants={{
                    ...variants,
                    inhale: { ...variants.inhale, transition: { delay: 0.1, duration: 1.8 } },
                    exhale: { ...variants.exhale, transition: { delay: 0.1, duration: 2.2 } }
                }}
            >
                <HexagonPath color={colors.stroke} strokeWidth="1" />
            </motion.svg>
        </div>
    );
};

export default NeonHexagon;
