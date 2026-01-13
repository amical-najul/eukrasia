import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Eye, EyeOff, Save, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const OAuthTab = () => {
    const { token } = useAuth();
    const [settings, setSettings] = useState({
        google_client_id: '',
        google_client_secret: '',
        google_enabled: false
    });
    const [showSecret, setShowSecret] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch current settings on mount
    useState(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/settings/oauth`, {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        google_client_id: data.google_client_id || '',
                        google_client_secret: data.google_client_secret || '',
                        google_enabled: data.google_enabled || false
                    });
                }
            } catch (error) {
                console.error('Error fetching OAuth settings:', error);
            }
        };
        fetchSettings();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${API_URL}/settings/oauth`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Configuración de OAuth guardada correctamente' });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message || 'Error al guardar la configuración' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuración de OAuth (Google)</h2>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <h3 className="font-medium text-gray-900">Habilitar Google OAuth</h3>
                        <p className="text-sm text-gray-500">Permitir a los usuarios iniciar sesión con Google</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, google_enabled: !s.google_enabled }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.google_enabled ? 'bg-[#008a60]' : 'bg-gray-200'
                            }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.google_enabled ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                    </button>
                </div>

                {/* Client ID */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                    <input
                        type="text"
                        value={settings.google_client_id}
                        onChange={(e) => setSettings(s => ({ ...s, google_client_id: e.target.value }))}
                        placeholder="Tu Google Client ID"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a60] focus:border-transparent"
                    />
                </div>

                {/* Client Secret */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                    <div className="relative">
                        <input
                            type={showSecret ? 'text' : 'password'}
                            value={settings.google_client_secret}
                            onChange={(e) => setSettings(s => ({ ...s, google_client_secret: e.target.value }))}
                            placeholder="Tu Google Client Secret"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008a60] focus:border-transparent pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-[#008a60] text-white rounded-lg hover:bg-[#00704e] transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </form>
        </div>
    );
};

export default OAuthTab;
