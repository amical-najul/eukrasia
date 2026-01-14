/**
 * AudioDebugger Component
 * 
 * Diagnóstico completo para problemas de reproducción de audio en navegadores.
 * Verifica:
 * 1. Políticas de Autoplay del navegador
 * 2. Rutas de activos (404 errors)
 * 3. Ciclo de vida de objetos Audio
 * 4. Permisos y estado del contexto de audio
 */

import React, { useState, useRef, useEffect } from 'react';

// URL del ping desde la configuración actual
const DEFAULT_PING_URL = 'https://minio.n8nprueba.shop/eukrasia/breathing-sounds/1768379574236-timer_ping.mp3';

const AudioDebugger = () => {
    const [logs, setLogs] = useState([]);
    const [audioStatus, setAudioStatus] = useState('idle');
    const [audioUrl, setAudioUrl] = useState(DEFAULT_PING_URL);

    // Ref persistente para evitar garbage collection
    const audioRef = useRef(null);

    const log = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        const entry = { timestamp, message, type };
        setLogs(prev => [...prev, entry]);

        // También log a consola con colores
        const style = type === 'error' ? 'color: red'
            : type === 'success' ? 'color: green'
                : type === 'warning' ? 'color: orange'
                    : 'color: cyan';
        console.log(`%c[AudioDebugger ${timestamp}] ${message}`, style);
    };

    // ==========================================
    // 1. PRUEBA MANUAL (Click del usuario)
    // ==========================================
    const testManualPlay = async () => {
        log('🖱️ Prueba MANUAL iniciada (clic del usuario)');
        setAudioStatus('loading');

        try {
            // Crear nuevo objeto Audio para esta prueba
            const audio = new Audio();
            audioRef.current = audio; // Guardar referencia para evitar GC

            // Escuchar eventos de error de carga
            audio.addEventListener('error', (e) => {
                const errorCode = audio.error?.code;
                const errorMessages = {
                    1: 'MEDIA_ERR_ABORTED - Carga abortada',
                    2: 'MEDIA_ERR_NETWORK - Error de red (posible CORS o 404)',
                    3: 'MEDIA_ERR_DECODE - Error de decodificación',
                    4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Formato no soportado'
                };
                log(`❌ Error de carga: ${errorMessages[errorCode] || 'Desconocido'}`, 'error');
                setAudioStatus('error');
            });

            audio.addEventListener('loadeddata', () => {
                log(`✅ Audio cargado correctamente (duración: ${audio.duration.toFixed(2)}s)`, 'success');
            });

            audio.addEventListener('canplaythrough', () => {
                log('✅ Audio listo para reproducir sin buffering', 'success');
            });

            // Establecer URL
            log(`📡 Cargando audio desde: ${audioUrl}`);
            audio.src = audioUrl;
            audio.currentTime = 0;

            // Intentar reproducir
            log('▶️ Intentando reproducir...');
            await audio.play();

            log('🎵 ¡ÉXITO! El audio se está reproduciendo.', 'success');
            setAudioStatus('playing');

            // Evento cuando termine
            audio.addEventListener('ended', () => {
                log('⏹️ Reproducción completada', 'info');
                setAudioStatus('idle');
            });

        } catch (error) {
            log(`❌ FALLO: ${error.name} - ${error.message}`, 'error');

            // Diagnóstico específico
            if (error.name === 'NotAllowedError') {
                log('🚫 DIAGNÓSTICO: El navegador bloqueó el audio (política de autoplay)', 'warning');
                log('💡 SOLUCIÓN: Requiere interacción del usuario primero', 'warning');
            } else if (error.name === 'NotSupportedError') {
                log('🚫 DIAGNÓSTICO: Formato de audio no soportado', 'warning');
            } else if (error.name === 'AbortError') {
                log('🚫 DIAGNÓSTICO: La carga fue interrumpida (posible 404 o CORS)', 'warning');
            }

            setAudioStatus('error');
        }
    };

    // ==========================================
    // 2. PRUEBA AUTOMÁTICA (Sin interacción)
    // ==========================================
    useEffect(() => {
        log('🔄 Componente montado - Iniciando prueba AUTOMÁTICA (sin clic)');

        const testAutoPlay = async () => {
            const audio = new Audio();
            audioRef.current = audio;

            audio.addEventListener('error', () => {
                log('❌ [AUTO] Error de carga del audio', 'error');
            });

            audio.src = audioUrl;

            try {
                log('▶️ [AUTO] Intentando reproducir automáticamente...');
                await audio.play();
                log('🎵 [AUTO] ¡ÉXITO! Autoplay permitido', 'success');
                audio.pause();
                audio.currentTime = 0;
            } catch (error) {
                log(`⚠️ [AUTO] Autoplay bloqueado: ${error.name}`, 'warning');

                if (error.name === 'NotAllowedError') {
                    log('💡 Esto es NORMAL. Los navegadores bloquean audio sin interacción del usuario.', 'info');
                    log('💡 Usa el botón "Probar Audio" para verificar que el audio funciona con clic.', 'info');
                }
            }
        };

        // Pequeño delay para permitir que el componente se renderice
        setTimeout(testAutoPlay, 500);

        return () => {
            // Cleanup
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // ==========================================
    // 3. VERIFICAR RUTA (Fetch HEAD)
    // ==========================================
    const testAssetPath = async () => {
        log(`🔍 Verificando existencia del archivo: ${audioUrl}`);

        try {
            const response = await fetch(audioUrl, { method: 'HEAD', mode: 'cors' });

            if (response.ok) {
                log(`✅ Archivo existe (Status: ${response.status})`, 'success');
                log(`   Content-Type: ${response.headers.get('content-type')}`, 'info');
                log(`   Content-Length: ${response.headers.get('content-length')} bytes`, 'info');
            } else {
                log(`❌ Error HTTP: ${response.status} ${response.statusText}`, 'error');
            }
        } catch (error) {
            log(`❌ Error de red/CORS: ${error.message}`, 'error');
            log('💡 Posible problema de CORS. Verifica la configuración de MinIO.', 'warning');
        }
    };

    // ==========================================
    // 4. VERIFICAR AUDIO CONTEXT STATE
    // ==========================================
    const checkAudioContext = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();

            log(`🔊 AudioContext State: ${ctx.state}`, ctx.state === 'running' ? 'success' : 'warning');

            if (ctx.state === 'suspended') {
                log('⚠️ AudioContext suspendido. Requiere interacción del usuario.', 'warning');
                ctx.resume().then(() => {
                    log('✅ AudioContext resumido manualmente', 'success');
                });
            }

            ctx.close();
        } catch (e) {
            log(`❌ Error creando AudioContext: ${e.message}`, 'error');
        }
    };

    const clearLogs = () => setLogs([]);

    return (
        <div className="fixed inset-0 bg-black/90 z-[9999] overflow-auto p-4 font-mono text-sm">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-white">🔊 Audio Debugger</h1>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                    >
                        Cerrar
                    </button>
                </div>

                {/* URL Input */}
                <div className="mb-4">
                    <label className="text-gray-400 text-xs block mb-1">URL del Audio:</label>
                    <input
                        type="text"
                        value={audioUrl}
                        onChange={(e) => setAudioUrl(e.target.value)}
                        className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 text-xs"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={testManualPlay}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold"
                    >
                        ▶️ Probar Audio (Click)
                    </button>
                    <button
                        onClick={testAssetPath}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                    >
                        🔍 Verificar Ruta
                    </button>
                    <button
                        onClick={checkAudioContext}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded"
                    >
                        🔊 Check AudioContext
                    </button>
                    <button
                        onClick={clearLogs}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                    >
                        🗑️ Limpiar Logs
                    </button>
                </div>

                {/* Status Indicator */}
                <div className={`mb-4 p-3 rounded ${audioStatus === 'playing' ? 'bg-green-900 text-green-300' :
                        audioStatus === 'error' ? 'bg-red-900 text-red-300' :
                            audioStatus === 'loading' ? 'bg-yellow-900 text-yellow-300' :
                                'bg-gray-800 text-gray-400'
                    }`}>
                    Estado: <strong>{audioStatus.toUpperCase()}</strong>
                </div>

                {/* Logs Panel */}
                <div className="bg-gray-900 border border-gray-700 rounded p-3 h-96 overflow-auto">
                    {logs.length === 0 ? (
                        <p className="text-gray-500">Los logs aparecerán aquí...</p>
                    ) : (
                        logs.map((entry, idx) => (
                            <div
                                key={idx}
                                className={`py-1 border-b border-gray-800 ${entry.type === 'error' ? 'text-red-400' :
                                        entry.type === 'success' ? 'text-green-400' :
                                            entry.type === 'warning' ? 'text-yellow-400' :
                                                'text-cyan-300'
                                    }`}
                            >
                                <span className="text-gray-500 mr-2">[{entry.timestamp}]</span>
                                {entry.message}
                            </div>
                        ))
                    )}
                </div>

                {/* Help Section */}
                <div className="mt-4 p-4 bg-gray-800 rounded text-gray-300 text-xs">
                    <h3 className="font-bold text-white mb-2">📋 Guía de Diagnóstico:</h3>
                    <ul className="list-disc pl-4 space-y-1">
                        <li><strong>NotAllowedError:</strong> El navegador bloquea audio sin interacción del usuario. Esto es NORMAL.</li>
                        <li><strong>Error 404/CORS:</strong> La URL del audio no es accesible. Verifica la ruta o la política de MinIO.</li>
                        <li><strong>MEDIA_ERR_DECODE:</strong> El archivo existe pero no es un audio válido.</li>
                        <li><strong>El botón funciona pero el código no:</strong> El audio se dispara antes de cualquier clic del usuario.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AudioDebugger;
