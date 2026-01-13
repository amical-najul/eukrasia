import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import AlertModal from '../../components/AlertModal';

const AdminProfilePage = () => {
    const { user, token, updateProfile } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Alert State
    const [alertData, setAlertData] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info' // info, success, error
    });

    const fileInputRef = useRef(null);

    const closeAlert = () => setAlertData(prev => ({ ...prev, isOpen: false }));

    const showAlert = (title, message, type = 'info') => {
        setAlertData({ isOpen: true, title, message, type });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSaveStatus('saving');
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!data.password) delete data.password;

        try {
            const res = await fetch(`${API_URL}/users/profile/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                updateProfile(updatedUser);
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (err) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);
        setAvatarLoading(true);

        try {
            const res = await fetch(`${API_URL}/users/avatar`, {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                updateProfile({ ...user, avatar_url: data.avatar_url });
                // Optional: success alert or just let the UI update silently as requested before
            } else {
                showAlert('Error', 'No se pudo subir la imagen. Inténtalo de nuevo.', 'error');
            }
        } catch (err) {
            showAlert('Error', 'Error de conexión al subir la imagen.', 'error');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleDeleteAvatar = async () => {
        setAvatarLoading(true);
        try {
            const res = await fetch(`${API_URL}/users/avatar`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                updateProfile({ ...user, avatar_url: null });
            } else {
                showAlert('Error', 'Error eliminando avatar.', 'error');
            }
        } catch (err) {
            showAlert('Error', 'Error de conexión al eliminar avatar.', 'error');
        } finally {
            setAvatarLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Mi Perfil</h2>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                        <div
                            className="cursor-pointer relative"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 group-hover:border-[#008a60] transition-colors shadow-sm"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = ''; // Force error state to show fallback if broken url
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex'; // Show fallback div
                                    }}
                                />
                            ) : null}

                            {/* Fallback Initials (Visible if no URL or Error) */}
                            <div
                                className={`w-32 h-32 bg-[#e0f2f1] text-[#008a60] rounded-full flex items-center justify-center text-4xl font-bold transition-colors ${user?.avatar_url ? 'hidden' : 'flex'}`}
                            >
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                        </div>

                        {avatarLoading && (
                            <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center z-10">
                                <div className="w-8 h-8 border-3 border-[#008a60] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* Delete Button (Icon) */}
                        {user?.avatar_url && !avatarLoading && (
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="absolute bottom-0 right-0 p-2 bg-white text-red-500 rounded-full shadow-md border border-gray-100 hover:bg-red-50 hover:text-red-700 transition-colors z-20"
                                title="Eliminar foto de perfil"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">Haz clic en la foto para cambiarla</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                            <input name="name" type="text" defaultValue={user?.name} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#008a60] focus:border-transparent outline-none transition-shadow bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                            <input name="email" type="email" defaultValue={user?.email} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#008a60] focus:border-transparent outline-none transition-shadow bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Contraseña (Opcional)</label>
                            <input name="password" type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#008a60] focus:border-transparent outline-none transition-shadow bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || saveStatus === 'success'}
                            className={`
                                px-6 py-2.5 font-medium rounded-lg transition-all duration-200 flex items-center gap-2
                                ${saveStatus === 'success' ? 'bg-green-600 text-white' : ''}
                                ${saveStatus === 'error' ? 'bg-red-600 text-white' : ''}
                                ${saveStatus === 'saving' ? 'bg-gray-400 text-white cursor-wait' : ''}
                                ${saveStatus === 'idle' ? 'bg-[#008a60] text-white hover:bg-[#007a55] shadow-sm hover:shadow' : ''}
                                disabled:opacity-90
                            `}
                        >
                            {saveStatus === 'idle' && 'Guardar Cambios'}
                            {saveStatus === 'saving' && (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            )}
                            {saveStatus === 'success' && (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    ¡Guardado!
                                </>
                            )}
                            {saveStatus === 'error' && 'Error al Guardar'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Email Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cambiar Email</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Se enviará un correo de confirmación a la nueva dirección de email.
                </p>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const newEmail = e.target.newEmail.value;

                    try {
                        const res = await fetch(`${API_URL}/users/change-email`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-auth-token': token
                            },
                            body: JSON.stringify({ newEmail })
                        });

                        const data = await res.json();

                        if (res.ok) {
                            showAlert('Email Enviado', data.message, 'success');
                            e.target.reset();
                        } else {
                            showAlert('Error', data.message || 'Error al solicitar cambio de email', 'error');
                        }
                    } catch (err) {
                        showAlert('Error', 'Error de conexión', 'error');
                    }
                }}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nuevo Email
                        </label>
                        <input
                            type="email"
                            name="newEmail"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#008a60] focus:border-transparent outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                            required
                            placeholder="nuevo@email.com"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#008a60] text-white font-medium rounded-lg hover:bg-[#007a55] transition-colors"
                    >
                        Solicitar Cambio de Email
                    </button>
                </form>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAvatar}
                title="Eliminar Foto de Perfil"
                message="¿Estás seguro de que quieres eliminar tu foto de perfil? Esta acción no se puede deshacer."
                confirmText="Sí, eliminar"
            />

            <AlertModal
                isOpen={alertData.isOpen}
                onClose={closeAlert}
                title={alertData.title}
                message={alertData.message}
                type={alertData.type}
            />
        </div>
    );
};

export default AdminProfilePage;
