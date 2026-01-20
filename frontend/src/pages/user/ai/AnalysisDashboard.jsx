import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../../services/api';

// Simple Mermaid Component
const Mermaid = ({ chart }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        // Load mermaid from CDN if not present
        if (!window.mermaid) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js';
            script.onload = () => {
                window.mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
                renderChart();
            };
            document.body.appendChild(script);
        } else {
            renderChart();
        }

        async function renderChart() {
            if (containerRef.current && window.mermaid) {
                try {
                    containerRef.current.innerHTML = '';
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await window.mermaid.render(id, chart);
                    containerRef.current.innerHTML = svg;
                } catch (error) {
                    console.error("Mermaid parsing failed", error);
                    containerRef.current.innerHTML = `<div class="text-red-500 text-xs p-2">Error renderizando gráfico.</div>`;
                }
            }
        }
    }, [chart]);

    return <div className="mermaid my-4 flex justify-center bg-white dark:bg-slate-700/50 p-4 rounded-lg overflow-x-auto" ref={containerRef} />;
};

const AnalysisDashboard = () => {
    const { t } = useLanguage();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationType, setGenerationType] = useState('weekly'); // 'weekly', 'monthly', 'custom'
    const [error, setError] = useState(null);

    // Custom date range state
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [customStartDate, setCustomStartDate] = useState(weekAgo);
    const [customEndDate, setCustomEndDate] = useState(today);

    // Chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isSendingChat, setIsSendingChat] = useState(false);

    // Set preset date ranges
    const setPreset = (type) => {
        setGenerationType(type);
        const now = new Date();
        const endDate = now.toISOString().split('T')[0];
        let startDate;

        if (type === 'weekly') {
            startDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        } else if (type === 'monthly') {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            startDate = monthAgo.toISOString().split('T')[0];
        } else {
            return; // custom - don't change dates
        }

        setCustomStartDate(startDate);
        setCustomEndDate(endDate);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/ai/reports');
            const data = res.data || [];
            setReports(data);
            if (data.length > 0) {
                // Auto-select most recent
                setSelectedReport(data[0]);
            }
        } catch (err) {
            console.error('Error fetching reports:', err);
            setReports([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null); // Clear previous errors
        try {
            // Use custom date range from state
            const startDate = new Date(customStartDate);
            const endDate = new Date(customEndDate);

            // Validate dates
            if (startDate >= endDate) {
                setError('La fecha de inicio debe ser anterior a la fecha de fin.');
                setIsGenerating(false);
                return;
            }

            const res = await api.post('/ai/analyze', {
                type: generationType,
                startDate,
                endDate
            });

            // Add new report to list and select it
            setReports([res.data, ...reports]);
            setSelectedReport(res.data);

        } catch (err) {
            console.error('Generation Error:', err);
            const errorMessage = err.response?.data?.message || 'Error generando análisis. Verifica tu configuración de IA.';
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleSendChat = async () => {
        if (!chatInput.trim() || !selectedReport?.id) return;

        const userMessage = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsSendingChat(true);

        try {
            const res = await api.post('/ai/chat', {
                reportId: selectedReport.id,
                question: userMessage
            });
            setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
        } catch (err) {
            console.error('Chat Error:', err);
            setChatMessages(prev => [...prev, {
                role: 'error',
                content: err.response?.data?.message || 'Error al procesar tu pregunta.'
            }]);
        } finally {
            setIsSendingChat(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: History & Actions */}
                    <div className="space-y-6">

                        {/* Actions Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generar Análisis</h2>

                            {/* Quick Presets */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <button
                                    onClick={() => setPreset('weekly')}
                                    className={`flex-1 min-w-[80px] py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${generationType === 'weekly'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-lime-900/30 dark:text-lime-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                                        }`}
                                >
                                    Semanal
                                </button>
                                <button
                                    onClick={() => setPreset('monthly')}
                                    className={`flex-1 min-w-[80px] py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${generationType === 'monthly'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-lime-900/30 dark:text-lime-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                                        }`}
                                >
                                    Mensual
                                </button>
                                <button
                                    onClick={() => setGenerationType('custom')}
                                    className={`flex-1 min-w-[100px] py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${generationType === 'custom'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                                        }`}
                                >
                                    Personalizado
                                </button>
                            </div>

                            {/* Date Range Inputs */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Desde</label>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => { setCustomStartDate(e.target.value); setGenerationType('custom'); }}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-lime-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Hasta</label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => { setCustomEndDate(e.target.value); setGenerationType('custom'); }}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-lime-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analizando...
                                    </span>
                                ) : '✨ Generar Ahora'}
                            </button>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
                                Requiere API Key configurada.
                            </p>
                            {error && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* History List */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historial</h2>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-8 text-center text-gray-400">Cargando...</div>
                                ) : reports.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">Sin reportes aún.</div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                                        {reports.filter(r => r && r.id).map((report) => (
                                            <button
                                                key={report.id}
                                                onClick={() => setSelectedReport(report)}
                                                className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${selectedReport?.id === report.id ? 'bg-blue-50 dark:bg-slate-700/80 border-l-4 border-blue-500' : ''
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${report.report_type === 'weekly' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                        }`}>
                                                        {report.report_type === 'weekly' ? 'SEMANAL' : report.report_type.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{formatDate(report.created_at)}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                    Análisis del {new Date(report.date_range_start).toLocaleDateString()} al {new Date(report.date_range_end).toLocaleDateString()}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Report Viewer */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 min-h-[600px] flex flex-col">
                            {selectedReport ? (
                                <>
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                📊 Reporte de Análisis
                                            </h1>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {formatDate(selectedReport.created_at)} • {selectedReport.report_type.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-8 prose dark:prose-invert max-w-none 
                                        prose-headings:text-blue-900 dark:prose-headings:text-lime-400 
                                        prose-a:text-blue-600 dark:prose-a:text-blue-400 
                                        prose-table:border-collapse prose-table:w-full prose-table:text-sm 
                                        prose-th:bg-gray-100 dark:prose-th:bg-slate-700 prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-600
                                        prose-td:p-3 prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-600
                                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-slate-700/30 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg">

                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    if (!inline && match && match[1] === 'mermaid') {
                                                        return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                                                    }
                                                    return (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                table: ({ children }) => (
                                                    <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                            {children}
                                                        </table>
                                                    </div>
                                                )
                                            }}
                                        >
                                            {selectedReport.content || selectedReport.analysisContent || 'Error: Sin contenido.'}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Chat Section */}
                                    <div className="border-t border-gray-200 dark:border-slate-700 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            💬 Pregunta sobre tu análisis
                                        </h3>

                                        {/* Chat Messages */}
                                        {chatMessages.length > 0 && (
                                            <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
                                                {chatMessages.map((msg, idx) => (
                                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                                            : msg.role === 'error'
                                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-bl-sm'
                                                                : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-sm'
                                                            }`}>
                                                            {msg.role === 'assistant' ? (
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    className="prose dark:prose-invert prose-sm max-w-none"
                                                                >
                                                                    {msg.content}
                                                                </ReactMarkdown>
                                                            ) : (
                                                                <p className="text-sm">{msg.content}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Chat Input */}
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && !isSendingChat && handleSendChat()}
                                                placeholder="Ej: ¿Cómo puedo mejorar mi sueño?"
                                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-lime-500 focus:border-transparent"
                                                disabled={isSendingChat}
                                            />
                                            <button
                                                onClick={handleSendChat}
                                                disabled={isSendingChat || !chatInput.trim()}
                                                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                            >
                                                {isSendingChat ? (
                                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/30 dark:bg-slate-900/10">
                                    <div className="w-24 h-24 bg-blue-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                                        <svg className="w-12 h-12 text-blue-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Comienza tu Análisis</h3>
                                    <p className="max-w-sm text-gray-500 dark:text-gray-400 mx-auto">
                                        Selecciona un reporte existente o genera uno nuevo para ver métricas detalladas, gráficos de progreso y recomendaciones.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AnalysisDashboard;
