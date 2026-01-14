import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Hexagon from '../../../components/Hexagon';
import AlertModal from '../../../components/AlertModal';
import BackButton from '../../../components/common/BackButton';
import { useTheme } from '../../../context/ThemeContext';
import breathingService from '../../../services/breathingService';

const RetentionTimerPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [rounds, setRounds] = useState([]);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const timerRef = useRef(null);
    const startTimeRef = useRef(0);

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
    };

    const formatRoundTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (isRunning) {
            startTimeRef.current = Date.now() - time;
            timerRef.current = setInterval(() => {
                setTime(Date.now() - startTimeRef.current);
            }, 10);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    const handleStart = () => setIsRunning(true);

    const handleStop = () => {
        setIsRunning(false);
        const newRound = { round: rounds.length + 1, time: time };
        setRounds([...rounds, newRound]);
    };

    const handleRestart = () => {
        setTime(0);
        setRounds([]);
        setIsRunning(false);
    };

    const handleStartNextRound = () => {
        setTime(0);
        setIsRunning(true);
    };

    const handleSave = async () => {
        try {
            const totalDuration = rounds.reduce((acc, r) => acc + (r.time / 1000), 0);

            await breathingService.saveSession({
                type: 'retention',
                duration_seconds: Math.floor(totalDuration),
                rounds_data: rounds.map(r => ({ round: r.round, duration: Math.floor(r.time / 1000) }))
            });

            setAlertConfig({
                isOpen: true,
                title: '¡Éxito!',
                message: 'Sesión guardada exitosamente',
                type: 'success'
            });

            // Auto-close and redirect after 3 seconds
            setTimeout(() => {
                setAlertConfig(prev => ({ ...prev, isOpen: false }));
                navigate('/dashboard/breathing');
            }, 3000);

        } catch (err) {
            console.error('Error saving session:', err);
            setAlertConfig({
                isOpen: true,
                title: 'Error',
                message: err.response?.data?.message || 'Hubo un problema al guardar la sesión',
                type: 'error'
            });
        }
    };

    const averageTime = rounds.length > 0
        ? rounds.reduce((acc, r) => acc + r.time, 0) / rounds.length
        : 0;

    return (
        <div className={`w-full h-full flex flex-col items-center p-6 overflow-hidden transition-colors duration-300 ${isLight ? 'bg-white text-gray-900' : 'bg-[#0f172a] text-white'}`}>
            <header className="w-full max-w-lg flex items-center relative mb-4">
                <div className="absolute left-0">
                    <BackButton
                        onClick={() => navigate('/dashboard/breathing')}
                        className={isLight ? "!text-gray-600 hover:!text-gray-900 hover:!bg-black/5" : ""}
                    />
                </div>
                <h1 className="w-full text-center text-lg font-bold">Temporizador de tiempo</h1>
            </header>

            {/* --- Main Content Card --- */}
            <div className={`w-full max-w-lg flex flex-col items-center flex-grow justify-center relative py-6 px-4 rounded-3xl border shadow-sm transition-colors duration-300
                ${isLight
                    ? 'bg-white border-gray-200 shadow-gray-200/50'
                    : 'bg-[#1e293b]/50 border-white/5 shadow-black/20'
                }
            `}>
                <div className="flex-grow flex flex-col justify-center items-center w-full relative py-2 mb-6">
                    <Hexagon
                        color={isLight ? "#ffffff" : "#1e293b"} // White (Light) / Slate-800 (Dark) Fill
                        borderColor={isLight ? "#2563eb" : "#84cc16"} // Blue-600 (Light) / Lime-500 (Dark) Border
                        strokeWidth={5} // Discreet Border (Reduced from 15)
                        size={250}
                        style={{ pointerEvents: 'none' }}
                        innerStyle={{ color: isLight ? '#1f2937' : '#ffffff' }} // Dark text on light, White on dark
                        label={rounds.length > 0 && !isRunning && time !== 0 ? `Ronda ${rounds.length}` : (isRunning ? `Ronda ${rounds.length + 1}` : "")}
                        icon={
                            <div className="text-4xl font-mono tracking-tighter font-black">
                                {formatTime(time)}
                            </div>
                        }
                    />
                </div>

                <div className="w-full flex flex-col items-center gap-4 mb-6">
                    {!isRunning && rounds.length === 0 && time === 0 && (
                        <Hexagon
                            color={isLight ? "#2563eb" : "#84cc16"} // Solid Blue (Light) / Lime (Dark) Fill
                            label="Iniciar"
                            size={90}
                            // No override for strokeWidth/borderColor -> Uses default or fill color (Solid look)
                            innerStyle={{ color: isLight ? '#ffffff' : '#0f172a', fontWeight: 'bold' }} // White text on Blue
                            onClick={handleStart}
                        />
                    )}

                    {isRunning && (
                        <Hexagon
                            color="#ef4444" // Red for Stop - High Contrast
                            label="Parar"
                            size={90}
                            strokeWidth={24} // Thicker border
                            innerStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                            onClick={handleStop}
                        />
                    )}

                    {!isRunning && rounds.length > 0 && (
                        <div className="flex gap-6 justify-center items-center">

                            <Hexagon
                                color="#06b6d4" // Cyan-500 (Vivid Cyan) for Restart
                                label="Reiniciar"
                                size={85}
                                strokeWidth={24} // Thicker border
                                innerStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                                onClick={handleRestart}
                            />
                            <Hexagon
                                color={isLight ? "#2563eb" : "#84cc16"} // Solid Blue (Same as initial Start)
                                label="Iniciar"
                                size={85}
                                // Default strokeWidth for Solid Look
                                innerStyle={{ color: isLight ? '#ffffff' : '#0f172a', fontWeight: 'bold' }}
                                onClick={handleStartNextRound}
                            />
                        </div>
                    )}
                </div>

                <div className="w-full px-2">
                    {rounds.length >= 2 && (
                        <div className={`flex justify-between items-center mb-2 border-b pb-1 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                            <span className={`font-semibold text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Tiempo promedio</span>
                            <span className="text-lg font-mono">{formatRoundTime(averageTime)}</span>
                        </div>
                    )}

                    <div className="space-y-1 max-h-[120px] overflow-y-auto scrollbar-hide">
                        {rounds.map((r, idx) => (
                            <div key={idx} className={`flex justify-between items-center text-xs border-b py-1 ${isLight ? 'text-gray-600 border-gray-200' : 'text-gray-400 border-white/5'}`}>
                                <span>Ronda {r.round}</span>
                                <span className="font-mono">{formatRoundTime(r.time)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {rounds.length > 0 && (
                    <button
                        onClick={handleSave}
                        className="btn-primary w-full mt-6 py-3 font-black text-md shadow-lg"
                    >
                        Guardar
                    </button>
                )}
            </div>

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => {
                    setAlertConfig({ ...alertConfig, isOpen: false });
                    if (alertConfig.type === 'success') navigate('/dashboard/breathing');
                }}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
};

export default RetentionTimerPage;
