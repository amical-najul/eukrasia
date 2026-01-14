import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Hexagon from '../../../components/Hexagon';
import AlertModal from '../../../components/AlertModal';
import BackButton from '../../../components/common/BackButton';

const RetentionTimerPage = () => {
    const navigate = useNavigate();
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
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL;

        try {
            const totalDuration = rounds.reduce((acc, r) => acc + (r.time / 1000), 0);
            const res = await fetch(`${API_URL}/breathing/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: 'retention',
                    duration_seconds: Math.floor(totalDuration),
                    rounds_data: rounds.map(r => ({ round: r.round, duration: Math.floor(r.time / 1000) }))
                })
            });

            if (res.ok) {
                setAlertConfig({
                    isOpen: true,
                    title: '¡Éxito!',
                    message: 'Sesión guardada exitosamente',
                    type: 'success'
                });
            } else {
                setAlertConfig({
                    isOpen: true,
                    title: 'Error',
                    message: 'Hubo un problema al guardar la sesión',
                    type: 'error'
                });
            }
        } catch (err) {
            setAlertConfig({
                isOpen: true,
                title: 'Error de conexión',
                message: 'No se pudo conectar con el servidor',
                type: 'error'
            });
        }
    };

    const averageTime = rounds.length > 0
        ? rounds.reduce((acc, r) => acc + r.time, 0) / rounds.length
        : 0;

    return (
        <div className="w-full h-full flex flex-col items-center bg-[#0f172a] text-white p-6 overflow-hidden">
            <header className="w-full max-w-lg flex items-center relative mb-4">
                <div className="absolute left-0">
                    <BackButton onClick={() => navigate('/dashboard/breathing')} />
                </div>
                <h1 className="w-full text-center text-lg font-bold">Temporizador de tiempo</h1>
                <button className="absolute right-0 text-xl font-light opacity-60">?</button>
            </header>

            <div className="flex-grow flex flex-col justify-center items-center w-full max-w-lg relative py-2">
                <Hexagon
                    color="#f8f9fa"
                    size={230}
                    style={{ pointerEvents: 'none' }}
                    innerStyle={{ color: '#002633' }}
                    label={rounds.length > 0 && !isRunning && time !== 0 ? `Ronda ${rounds.length}` : (isRunning ? `Ronda ${rounds.length + 1}` : "")}
                    icon={
                        <div className="text-4xl font-mono tracking-tighter font-black">
                            {formatTime(time)}
                        </div>
                    }
                />
            </div>

            <div className="w-full max-w-lg flex flex-col items-center gap-4 mb-4">
                {!isRunning && rounds.length === 0 && time === 0 && (
                    <Hexagon
                        color="#1e88e5" // Vivid Blue
                        label="Iniciar"
                        size={90}
                        innerStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                        onClick={handleStart}
                    />
                )}

                {isRunning && (
                    <Hexagon
                        color="#ffffff"
                        label="Parar"
                        size={90}
                        style={{ border: '4px solid #fff' }}
                        innerStyle={{ color: '#000', fontWeight: 'bold' }}
                        onClick={handleStop}
                    />
                )}

                {!isRunning && rounds.length > 0 && (
                    <div className="flex gap-6 justify-center items-center">
                        <Hexagon
                            color="#ffffff"
                            label="Reiniciar"
                            size={85}
                            innerStyle={{ color: '#1e88e5', fontWeight: 'black' }}
                            style={{ border: '2px solid #1e88e5' }}
                            onClick={handleRestart}
                        />
                        <Hexagon
                            color="#1e88e5"
                            label="Iniciar"
                            size={85}
                            innerStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                            onClick={handleStartNextRound}
                        />
                    </div>
                )}
            </div>

            <div className="w-full max-w-lg px-2">
                <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1">
                    <span className="font-semibold text-gray-400 text-sm">Tiempo promedio</span>
                    <span className="text-lg font-mono">{formatRoundTime(averageTime)}</span>
                </div>

                <div className="space-y-1 max-h-[120px] overflow-y-auto scrollbar-hide">
                    {rounds.map((r, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-gray-400 border-b border-white/5 py-1">
                            <span>Ronda {r.round}</span>
                            <span className="font-mono">{formatRoundTime(r.time)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {rounds.length > 0 && (
                <button
                    onClick={handleSave}
                    className="w-full max-w-lg mt-4 bg-[#00695c] hover:bg-[#00796b] active:scale-95 text-white font-black py-3 rounded-xl text-md transition-all shadow-lg"
                >
                    Guardar
                </button>
            )}

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
