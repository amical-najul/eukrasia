import { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = import.meta.env.VITE_API_URL;

const LegalContentModal = ({ isOpen, onClose, type }) => {
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
        <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {loading ? 'Cargando...' : title}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading && (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-8 h-8 border-3 border-[#008a60] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-500 dark:text-red-400 py-8">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
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
