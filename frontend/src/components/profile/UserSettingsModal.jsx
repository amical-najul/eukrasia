import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import DeleteAccountModal from './DeleteAccountModal';
import LegalContentModal from '../LegalContentModal';

const UserSettingsModal = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    const { appName, appVersion, footerText, appFaviconUrl } = useBranding();
    const { language, changeLanguage, availableLanguages, t } = useLanguage();

    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [legalModal, setLegalModal] = useState({ isOpen: false, type: null });

    // ... (keep state) ...

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        if (isOpen) {
            setProfileData({
                name: user?.name || '',
                email: user?.email || '',
            });
            setMessage({ type: '', text: '' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswords({ current: false, new: false, confirm: false });
        }
    }, [isOpen, user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const updatedUser = await userService.updateProfile({
                name: profileData.name,
                email: profileData.email
            });
            updateProfile({ ...user, name: profileData.name });
            setMessage({ type: 'success', text: 'Perfil actualizado' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error al actualizar perfil' });
        } finally {
            setIsLoading(false);
        }
    };

    // ... (keep password & delete handlers) ...

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await userService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error al cambiar contraseña' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccountClick = () => setIsDeleteModalOpen(true);

    const handleConfirmDeleteAccount = async (password) => {
        try {
            await userService.deleteOwnAccount(password);
            window.location.href = '/login';
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al eliminar cuenta');
        }
    };


    const fileInputRef = React.useRef(null);
    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen válido' });
            return;
        }

        if (file.size > 12 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'La imagen no debe superar los 12MB' });
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await userService.uploadAvatar(formData);
            updateProfile({ ...user, avatar_url: res.avatar_url });
            setMessage({ type: 'success', text: 'Foto actualizada correctamente' });
        } catch (error) {
            console.error("Avatar upload failed:", error);
            setMessage({ type: 'error', text: error.data?.message || error.message || 'Error al subir la imagen' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarDelete = async (e) => {
        e.stopPropagation(); // Prevent triggering upload click
        if (!window.confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) return;

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await userService.deleteAvatar();
            updateProfile({ ...user, avatar_url: null });
            setMessage({ type: 'success', text: 'Foto eliminada correctamente' });
        } catch (error) {
            setMessage({ type: 'error', text: error.data?.message || error.message || 'Error al eliminar la imagen' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLanguageChange = async (e) => {
        const newLang = e.target.value;
        changeLanguage(newLang);
        try {
            // Sync with backend (must send name/email to avoid nulling them)
            const updatedUser = await userService.updateProfile({
                name: profileData.name,
                email: profileData.email,
                language_preference: newLang
            });
            updateProfile(updatedUser);
        } catch (err) {
            console.error('Error syncing language preference:', err);
        }
    };

    if (!isOpen) return null;

    return (
        // ... (keep structure wrapper) ... 
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
                <div className="bg-white dark:bg-gray-800 w-full h-full sm:w-[420px] sm:h-[80vh] sm:max-h-[800px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out">

                    {/* Header & Tabs (Keep them as is in logic, assumed unchanged in replacement range unless included) */}
                    {/* ... Since I'm viewing lines 159-417, I'm replacing handleAvatarDelete and the JSX return logic ... */}

                    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 p-6 flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('settings.title')}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 px-6 shrink-0 overflow-x-auto scrollbar-hide">
                        {['profile', 'security', 'preferences', 'info'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2 capitalize ${activeTab === tab
                                    ? 'border-[#008a60] text-[#008a60]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab === 'profile' && t('settings.tabs.profile')}
                                {tab === 'security' && t('settings.tabs.security')}
                                {tab === 'preferences' && t('settings.tabs.preferences')}
                                {tab === 'info' && t('settings.tabs.info')}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                        {message.text && (
                            <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {message.text}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <div
                                            className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700 border-4 border-white dark:border-gray-800 shadow-lg cursor-pointer relative"
                                            onClick={handleAvatarClick}
                                        >
                                            {user?.avatar_url ? (
                                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover transition-opacity group-hover:opacity-75" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-slate-600 transition-colors">
                                                    {user?.name?.charAt(0) || user?.email?.charAt(0)}
                                                </div>
                                            )}

                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {user?.avatar_url && (
                                            <button
                                                type="button"
                                                onClick={handleAvatarDelete}
                                                className="absolute -top-1 -right-1 bg-red-100 text-red-600 rounded-full p-1.5 hover:bg-red-200 transition-colors shadow-sm z-10"
                                                title="Eliminar foto"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{user?.name || 'Usuario'}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
                                        <button
                                            type="button"
                                            onClick={handleAvatarClick}
                                            className="text-sm text-[#008a60] hover:underline mt-1 font-medium"
                                        >
                                            {t('settings.profile.change_photo')}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.profile.name_label')}</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#008a60] focus:border-transparent transition-shadow text-base"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.profile.email_label')}</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-base"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">{t('settings.profile.email_hint')}</p>
                                    </div>
                                </div>

                                <div className="pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full sm:w-auto px-6 py-3 bg-[#008a60] text-white rounded-lg font-medium hover:bg-[#00704e] transition-colors disabled:opacity-50 text-base shadow-sm"
                                    >
                                        {isLoading ? t('settings.profile.saving') : t('settings.profile.save')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-5">
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">{t('settings.security.change_password')}</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.security.current_password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? "text" : "password"}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => { setPasswordData({ ...passwordData, currentPassword: e.target.value }); setMessage({ type: '', text: '' }); }}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-[#008a60] focus:border-transparent text-base pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                            >
                                                {showPasswords.current ? (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.security.new_password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) => { setPasswordData({ ...passwordData, newPassword: e.target.value }); setMessage({ type: '', text: '' }); }}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-[#008a60] focus:border-transparent text-base pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                            >
                                                {showPasswords.new ? (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.security.confirm_password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => { setPasswordData({ ...passwordData, confirmPassword: e.target.value }); setMessage({ type: '', text: '' }); }}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-[#008a60] focus:border-transparent text-base pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                            >
                                                {showPasswords.confirm ? (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-[#008a60] text-white rounded-lg font-medium hover:bg-[#00704e] transition-colors disabled:opacity-50 text-base shadow-sm"
                                    >
                                        {isLoading ? t('settings.security.updating') : t('settings.security.update_btn')}
                                    </button>
                                </form>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-red-600 border-b border-red-100 dark:border-red-900/30 pb-2 mb-3">Zona de Peligro</h3>
                                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="font-semibold text-red-800">{t('settings.security.delete_account')}</h4>
                                            <p className="text-sm text-red-600 mt-1">{t('settings.security.delete_warning')}</p>
                                        </div>
                                        <button
                                            onClick={handleDeleteAccountClick}
                                            className="whitespace-nowrap px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all text-sm font-medium shadow-sm"
                                        >
                                            {t('settings.security.delete_btn')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600">
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{t('settings.darkMode')}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.darkMode_desc')}</p>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#008a60] focus:ring-offset-2 ${theme === 'dark' ? 'bg-[#008a60]' : 'bg-gray-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600">
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{t('settings.language')}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.language_desc')}</p>
                                    </div>
                                    <select
                                        value={language}
                                        onChange={handleLanguageChange}
                                        className="form-select block w-32 px-3 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-[#008a60] focus:border-[#008a60] sm:text-sm rounded-md dark:bg-slate-800 dark:text-white"
                                    >
                                        {availableLanguages.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.flag} {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'info' && (
                            <div className="space-y-6 text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl mx-auto flex items-center justify-center mb-4 overflow-hidden">
                                    {appFaviconUrl ? (
                                        <img src={appFaviconUrl} alt="App Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <span className="text-4xl">🚀</span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{appName || 'Mi Aplicación'}</h3>
                                <p className="text-gray-500 dark:text-gray-400">Versión {appVersion || '1.0.0'}</p>

                                <div className="flex justify-center gap-4 mt-8">
                                    <button
                                        onClick={() => setLegalModal({ isOpen: true, type: 'terms' })}
                                        className="text-[#008a60] hover:underline text-sm"
                                    >
                                        {t('settings.info.terms')}
                                    </button>
                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                    <button
                                        onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}
                                        className="text-[#008a60] hover:underline text-sm"
                                    >
                                        {t('settings.info.privacy')}
                                    </button>
                                </div>

                                <div className="mt-12 p-4 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 rounded-lg text-sm inline-block">
                                    {footerText || `© 2024 ${appName || 'Mi Aplicación'}. ${t('settings.info.footer')}`}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDeleteAccount}
            />

            <LegalContentModal
                isOpen={legalModal.isOpen}
                onClose={() => setLegalModal({ isOpen: false, type: null })}
                type={legalModal.type}
            />
        </>
    );
};

export default UserSettingsModal;
