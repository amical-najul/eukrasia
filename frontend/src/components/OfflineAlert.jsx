import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const OfflineAlert = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const { t } = useLanguage();

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Function to manually check connection (sometimes events fire before actual connectivity)
    const handleRetry = () => {
        if (navigator.onLine) {
            setIsOffline(false);
        } else {
            // Optional: Shake animation or toast
            alert('Aún sin conexión');
        }
    };

    if (!isOffline) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none p-4 sm:p-0">
            {/* Backdrop (Optional: could serve as a blocking layer) */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-100 transition-opacity pointer-events-auto"></div>

            {/* Modal Card */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm pointer-events-auto animate-bounce-subtle border border-red-100 dark:border-red-900/30">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /> {/* Exclamation/Cross overlay */}
                            <line x1="2" y1="2" x2="22" y2="22" /> {/* Custom strike-through */}
                        </svg>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Sin Conexión
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Parece que has perdido la conexión a Internet. La aplicación requiere conexión para guardar tus datos.
                        </p>
                    </div>

                    <button
                        onClick={handleRetry}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg active:scale-95"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OfflineAlert;
