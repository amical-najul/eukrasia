import { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL;

const LegalContentModal = ({ isOpen, onClose, type }) => {
    const { isDark } = useTheme();
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && type) {
            setLoading(true);
            setError('');

            fetch(`${API_URL}/settings/legal/${type}`)
                .then(res => {
                    if (!res.ok) throw new Error('Error fetching content');
                    return res.json();
                })
                .then(data => {
                    setContent(data.content);
                    setTitle(data.title);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error loading legal content:', err);
                    setError('Error al cargar el contenido');
                    setLoading(false);
                });
        }
    }, [isOpen, type]);

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[60] flex flex-col transition-colors duration-500 overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b transition-colors shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'
                }`}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                            }`}
                    >
                        <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                    </button>
                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {loading ? 'Cargando...' : title}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                        }`}
                >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-y-auto p-6 sm:p-10 ${isDark ? 'bg-slate-950/30' : 'bg-white'}`}>
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className={`w-10 h-10 border-4 rounded-full animate-spin ${isDark ? 'border-lime-500 border-t-transparent' : 'border-blue-600 border-t-transparent'
                            }`}></div>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cargando documento...</span>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                        <div className="text-red-500 bg-red-500/10 p-4 rounded-full">
                            <X className="w-8 h-8" />
                        </div>
                        <p className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className={`prose max-w-4xl mx-auto transition-colors ${isDark ? 'prose-invert prose-p:text-gray-300 prose-headings:text-white' : 'prose-slate prose-p:text-gray-600'
                        }`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LegalContentModal;
