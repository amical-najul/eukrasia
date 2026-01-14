import React, { useEffect, useRef, useCallback } from 'react';
import Lottie from 'lottie-react';

/**
 * BreathingLottie - Animation-Controlled Timing
 * 
 * This component controls the breathing phase timing.
 * It plays from frame 0 to the calculated stopFrame based on targetBreaths,
 * then calls onComplete to signal the parent to transition to the next phase.
 * 
 * Each animation file contains 60 breaths at ~165 frames per breath (9900 total frames).
 */
const BreathingLottie = ({
    animationData,
    speed = 1, // Added speed prop
    targetBreaths = 30,
    onComplete,
    onBreathComplete, // Called after each breath for counter update
    isPlaying = true
}) => {
    const lottieRef = useRef(null);
    const frameListenerRef = useRef(null);
    const lastBreathRef = useRef(0);

    // Animation constants (based on analysis)
    const TOTAL_BREATHS = 60;
    const TOTAL_FRAMES = 9900;
    const FRAMES_PER_BREATH = TOTAL_FRAMES / TOTAL_BREATHS; // 165 frames

    // Calculate stop frame based on user's target breaths
    const stopFrame = Math.min(targetBreaths * FRAMES_PER_BREATH, TOTAL_FRAMES);

    // Handle animation frame updates to track breath count
    const handleEnterFrame = useCallback((event) => {
        if (!lottieRef.current) return;

        const currentFrame = event.currentTime || 0;
        const currentBreath = Math.floor(currentFrame / FRAMES_PER_BREATH) + 1;

        // Fire callback when breath changes
        if (currentBreath !== lastBreathRef.current && currentBreath <= targetBreaths) {
            lastBreathRef.current = currentBreath;
            if (onBreathComplete) {
                onBreathComplete(currentBreath);
            }
        }

        // Check if we've reached the stop point
        if (currentFrame >= stopFrame - 1) {
            lottieRef.current.pause();
            if (onComplete) {
                onComplete();
            }
        }
    }, [stopFrame, targetBreaths, onComplete, onBreathComplete]);

    useEffect(() => {
        if (!lottieRef.current || !isPlaying) {
            if (lottieRef.current) {
                lottieRef.current.pause();
            }
            return;
        }

        const animation = lottieRef.current;

        // Reset state
        lastBreathRef.current = 0;

        // Play from start to stop frame
        animation.setSpeed(speed); // Apply speed
        animation.goToAndPlay(0, true);

        // Listen for frame updates
        if (animation.animationContainerRef?.current) {
            const lottieInstance = animation.animationItem;
            if (lottieInstance) {
                lottieInstance.addEventListener('enterFrame', handleEnterFrame);
                frameListenerRef.current = handleEnterFrame;
            }
        }

        return () => {
            // Cleanup listener
            if (animation.animationItem && frameListenerRef.current) {
                animation.animationItem.removeEventListener('enterFrame', frameListenerRef.current);
            }
        };
    }, [isPlaying, handleEnterFrame]);

    return (
        <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full h-full">
                <Lottie
                    lottieRef={lottieRef}
                    animationData={animationData}
                    loop={false}
                    autoplay={false}
                    className="w-full h-full"
                    rendererSettings={{
                        preserveAspectRatio: 'xMidYMid slice'
                    }}
                />
            </div>
        </div>
    );
};

export default BreathingLottie;
