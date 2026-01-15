import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import { Play, Pause, RotateCcw, Thermometer } from 'lucide-react';

const ColdExposurePage = () => {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setSeconds(0);
    };

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="min-h-screen bg-cyan-900 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-800 to-blue-900 opacity-50" />
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-cyan-500 rounded-full blur-[100px] opacity-20 animate-pulse" />

            <header className="absolute top-6 left-6 z-10">
                <BackButton onClick={() => navigate('/dashboard/breathing')} />
            </header>

            <div className="z-10 flex flex-col items-center">
                <div className="mb-8 p-6 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm shadow-xl shadow-cyan-500/20">
                    <Thermometer size={64} className="text-cyan-300" />
                </div>

                <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-center">Exposición al Frío</h1>
                <p className="text-cyan-200 text-sm mb-12 text-center max-w-xs">
                    Registra tu tiempo bajo el agua fría. Respira profundo y mantén la calma.
                </p>

                {/* Timer Display */}
                <div className="text-8xl font-black tabular-nums tracking-tighter mb-12 drop-shadow-lg text-cyan-50">
                    {formatTime(seconds)}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    {!isActive ? (
                        <button
                            onClick={toggleTimer}
                            className="w-20 h-20 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                        >
                            <Play size={32} fill="currentColor" />
                        </button>
                    ) : (
                        <button
                            onClick={toggleTimer}
                            className="w-20 h-20 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                        >
                            <Pause size={32} fill="currentColor" />
                        </button>
                    )}

                    <button
                        onClick={resetTimer}
                        className="w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-transform active:scale-95"
                    >
                        <RotateCcw size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColdExposurePage;
