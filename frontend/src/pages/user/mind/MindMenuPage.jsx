import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import FocusObject from '../../../components/mind/FocusObject';
import MindSettingsModal from '../../../components/mind/MindSettingsModal';
import mindService from '../../../services/mindService';

/**
 * MindMenuPage - Home screen for Trataka Focus practice
 * Features: Focus object carousel, duration selector, settings
 */
const MindMenuPage = () => {
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = useState(false);
    const [selectedObject, setSelectedObject] = useState('candle');
    const [selectedDuration, setSelectedDuration] = useState(300); // 5 minutes default
    const [isLoading, setIsLoading] = useState(true);

    const focusObjects = [
        { id: 'candle', name: 'Vela', description: 'Llama suave y calmante' },
        { id: 'moon', name: 'Luna', description: 'Luz lunar serena' },
        { id: 'yantra', name: 'Yantra', description: 'Geometría sagrada' },
        { id: 'dot', name: 'Punto', description: 'Simplicidad absoluta' }
    ];

    const durations = [
        { value: 60, label: '1', unit: 'min' },
        { value: 180, label: '3', unit: 'min' },
        { value: 300, label: '5', unit: 'min' },
        { value: 600, label: '10', unit: 'min' },
        { value: 900, label: '15', unit: 'min' }
    ];

    // Load user config
    useEffect(() => {
        mindService.getConfig()
            .then(data => {
                if (data.default_focus_object) setSelectedObject(data.default_focus_object);
                if (data.default_duration_sec) setSelectedDuration(data.default_duration_sec);
            })
            .catch(err => console.error('Error loading config:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const handleStart = () => {
        navigate('/dashboard/mind/session', {
            state: {
                focusObject: selectedObject,
                durationSec: selectedDuration
            }
        });
    };

    const currentObjectIndex = focusObjects.findIndex(o => o.id === selectedObject);

    const selectPrev = () => {
        const newIndex = (currentObjectIndex - 1 + focusObjects.length) % focusObjects.length;
        setSelectedObject(focusObjects[newIndex].id);
    };

    const selectNext = () => {
        const newIndex = (currentObjectIndex + 1) % focusObjects.length;
        setSelectedObject(focusObjects[newIndex].id);
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center bg-black text-white overflow-hidden">
            {/* Header */}
            <header className="w-full flex items-center justify-between p-4 absolute top-0 left-0 z-20">
                <BackButton onClick={() => navigate('/dashboard')} />
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </header>

            {/* Main Content */}
            <div className="flex-1 w-full flex flex-col items-center justify-center px-6 pt-20 pb-8">

                {/* Title */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-3xl font-light tracking-[0.3em] text-amber-400/90 uppercase">Trataka</h1>
                    <p className="text-sm text-gray-500 mt-2 tracking-wide">Enfoque y claridad mental</p>
                </div>

                {/* Focus Object Carousel */}
                <div className="relative w-full max-w-sm flex items-center justify-center mb-10">
                    {/* Prev Button */}
                    <button
                        onClick={selectPrev}
                        className="absolute left-0 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Focus Object Display */}
                    <div className="flex flex-col items-center">
                        <div className="transition-all duration-500 ease-out transform">
                            <FocusObject type={selectedObject} opacity={1} />
                        </div>
                        <div className="mt-6 text-center animate-fade-in">
                            <h3 className="text-xl font-medium text-white/90 tracking-wide">
                                {focusObjects[currentObjectIndex].name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {focusObjects[currentObjectIndex].description}
                            </p>
                        </div>
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={selectNext}
                        className="absolute right-0 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Object Indicators */}
                <div className="flex gap-2 mb-8">
                    {focusObjects.map((obj, idx) => (
                        <button
                            key={obj.id}
                            onClick={() => setSelectedObject(obj.id)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentObjectIndex
                                    ? 'bg-amber-500 w-6'
                                    : 'bg-white/20 hover:bg-white/40'
                                }`}
                        />
                    ))}
                </div>

                {/* Duration Selector */}
                <div className="w-full max-w-xs mb-10">
                    <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-4">Duración</p>
                    <div className="flex justify-between">
                        {durations.map(dur => (
                            <button
                                key={dur.value}
                                onClick={() => setSelectedDuration(dur.value)}
                                className={`flex flex-col items-center p-3 rounded-xl transition-all ${selectedDuration === dur.value
                                        ? 'bg-amber-500/20 border border-amber-500/50'
                                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                                    }`}
                            >
                                <span className={`text-lg font-bold ${selectedDuration === dur.value ? 'text-amber-400' : 'text-white/70'}`}>
                                    {dur.label}
                                </span>
                                <span className={`text-[10px] uppercase ${selectedDuration === dur.value ? 'text-amber-400/70' : 'text-gray-500'}`}>
                                    {dur.unit}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    className="w-full max-w-xs py-4 bg-amber-500 text-black font-bold text-sm tracking-[0.2em] uppercase rounded-2xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-95"
                >
                    Iniciar
                </button>
            </div>

            {/* Settings Modal */}
            <MindSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    );
};

export default MindMenuPage;
