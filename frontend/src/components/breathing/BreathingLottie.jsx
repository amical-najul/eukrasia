import React, { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';

const BreathingLottie = ({ animationData, speed = 1, targetBreaths = 30, totalCycleBreaths = 60, isPlaying = true }) => {
    const lottieRef = useRef(null);

    // Calculate total frames in the animation
    // Based on analysis: 9902 frames for 60 breaths
    const TOTAL_FRAMES = 9902;

    // Calculate frames per single breath cycle
    const FRAMES_PER_BREATH = TOTAL_FRAMES / totalCycleBreaths;

    // Calculate the exact stop frame based on user's target breaths
    // Example: if target is 5, stop at ~825 frames (Total * 5/60)
    // We cap it at TOTAL_FRAMES - 1 to be safe
    const stopFrame = Math.min((targetBreaths / totalCycleBreaths) * TOTAL_FRAMES, TOTAL_FRAMES - 1);

    useEffect(() => {
        if (lottieRef.current) {
            // Set playback speed
            lottieRef.current.setSpeed(speed);

            if (isPlaying) {
                // Play from frame 0 to calculated stopFrame
                // playSegments(segments, forceFlag)
                // true = force immediate play
                lottieRef.current.playSegments([0, stopFrame], true);
            } else {
                lottieRef.current.pause();
            }
        }
    }, [speed, targetBreaths, isPlaying, stopFrame]);

    // Handle "Loop Complete" or just end of segment? 
    // playSegments DOES NOT loop by default unless strict 'loop' prop is true.
    // We want it to play ONCE from 0 to stopFrame and then stop.

    return (
        <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center relative">
            {/* Glow Effect matching the animation colors (optional/subtle) */}
            <div className="absolute inset-0 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full h-full">
                <Lottie
                    lottieRef={lottieRef}
                    animationData={animationData}
                    loop={false} // IMPORTANT: Do not loop indefinitely. We control the exact segment.
                    autoplay={false} // Controlled by useEffect
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
