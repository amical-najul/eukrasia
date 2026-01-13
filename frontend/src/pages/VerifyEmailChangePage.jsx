import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function VerifyEmailChangePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token inválido');
            setLoading(false);
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch(`${API_URL}/users/verify-email-change`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await res.json();

                if (res.ok) {
                    setSuccess(true);
                    // Logout user (email changed, need to login again)
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setTimeout(() => navigate('/'), 3000);
                } else {
                    setError(data.message || 'Error al verificar cambio de email');
                }
            } catch (err) {
                setError('Error de conexión');
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 light-forced">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008a60] mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando cambio de email...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 light-forced">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Email Actualizado!</h2>
                    <p className="text-gray-600 mb-6">
                        Tu dirección de email ha sido cambiada exitosamente. Por seguridad, debes iniciar sesión nuevamente.
                    </p>
                    <p className="text-sm text-gray-500">Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 light-forced">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                <p className="text-red-600 mb-6">{error}</p>
                <Link to="/" className="text-[#008a60] font-semibold hover:underline">
                    Volver al Login
                </Link>
            </div>
        </div>
    );
}

export default VerifyEmailChangePage;
