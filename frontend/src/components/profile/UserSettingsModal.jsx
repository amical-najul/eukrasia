// Force Git Update
import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import DeleteAccountModal from './DeleteAccountModal';
import DataDeletionModal from './DataDeletionModal';
import LegalContentModal from '../LegalContentModal';

const PROVIDER_MODELS = {
    openai: [
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
    ],
    anthropic: [
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
    ],
    gemini: [
        { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Preview)' },
        { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
        { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Legacy)' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Legacy)' }
    ],
    deepseek: [
        { value: 'deepseek-chat', label: 'DeepSeek Chat (V3)' },
        { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner (R1)' }
    ],
    xai: [
        { value: 'grok-beta', label: 'Grok Beta' }
    ]
};

const UserSettingsModal = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    const { appName, appVersion, footerText, appFaviconUrl } = useBranding();
    const { language, changeLanguage, availableLanguages, t } = useLanguage();

    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [legalModal, setLegalModal] = useState({ isOpen: false, type: null });
    const [dataDeletion, setDataDeletion] = useState({ isOpen: false, type: null, title: '', desc: '', requirePassword: false });

    // AI Config State
    const [llmConfig, setLlmConfig] = useState({ provider: 'openai', model: '', api_key: '', analysis_frequency: 'weekly' });
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        if (activeTab === 'preferences') {
            const fetchLlmConfig = async () => {
                try {
                    const config = await userService.getUserLlmConfig();
                    setLlmConfig(config);
                } catch (err) {
                    console.error('Error fetching LLM config', err);
                }
            };
            fetchLlmConfig();
        }
    }, [activeTab]);

    const handleLlmUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await userService.saveUserLlmConfig(llmConfig);
            setMessage({ type: 'success', text: 'Configuración de IA guardada correctamente' });
            // Clear API key from state if it was entered, to show masked again? 
            // Better re-fetch or just keep as is.
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al actualizar configuración' });
        } finally {
            setIsLoading(false);
        }
    };

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

    const { theme, toggleTheme, isDark } = useTheme();

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
                <div className={`w-full h-full sm:w-[420px] sm:h-[80vh] sm:max-h-[800px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out border ${isDark ? 'glass-modal border-white/10' : 'bg-white border-gray-100'
                    }`}>

                    {/* Header & Tabs */}
                    <div className={`border-b p-6 flex justify-between items-center shrink-0 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'
                        }`}>
                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('settings.title')}</h2>
                        <button onClick={onClose} className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors`}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className={`flex border-b px-6 shrink-0 overflow-x-auto scrollbar-hide ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                        {['profile', 'security', 'preferences', 'info'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2 capitalize ${activeTab === tab
                                    ? (isDark ? 'border-lime-500 text-lime-500' : 'border-blue-600 text-blue-600')
                                    : (isDark ? 'border-transparent text-gray-500 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700')}`}
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
                                            className="text-sm text-blue-600 hover:underline mt-1 font-medium"
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
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow text-base"
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
                                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 dark:bg-lime-500 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-lime-600 transition-colors disabled:opacity-50 text-base shadow-sm"
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
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base pr-10"
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
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base pr-10"
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
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base pr-10"
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
                                        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 dark:bg-lime-500 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-lime-600 transition-colors disabled:opacity-50 text-base shadow-sm"
                                    >
                                        {isLoading ? t('settings.security.updating') : t('settings.security.update_btn')}
                                    </button>
                                </form>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gestión de Datos</h3>
                                    <div className="space-y-3">
                                        {[
                                            { type: 'breathing', label: 'Datos de Respiración', desc: 'Eliminar todas las sesiones de respiración.', reqPwd: false },
                                            { type: 'nutrition', label: 'Datos de Nutrición', desc: 'Eliminar registros de alimentos y ayuno.', reqPwd: false },
                                            { type: 'mind', label: 'Poder de la Mente', desc: 'Eliminar sesiones de enfoque y configuración.', reqPwd: false },
                                            { type: 'body', label: 'Actividad Física (Body)', desc: 'Eliminar peso, medidas y metas.', reqPwd: false },
                                            { type: 'sleep', label: 'Sueño Reparador', desc: 'Eliminar registros de sueño.', reqPwd: false },
                                            { type: 'all', label: 'Todos los Datos', desc: 'Resetear cuenta a estado inicial (Mantiene perfil).', reqPwd: true }
                                        ].map(item => (
                                            <div key={item.type} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700">
                                                <div className="mb-3 sm:mb-0">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">{item.label}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                                                </div>
                                                <button
                                                    onClick={() => setDataDeletion({
                                                        isOpen: true,
                                                        type: item.type,
                                                        title: `Eliminar ${item.label}`,
                                                        desc: item.desc,
                                                        requirePassword: item.reqPwd
                                                    })}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${item.type === 'all'
                                                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-600 hover:dark:bg-slate-700'
                                                        }`}
                                                >
                                                    {item.type === 'all' ? 'Resetear Cuenta' : 'Eliminar'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

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
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'bg-lime-500 focus:ring-lime-500' : 'bg-blue-600 focus:ring-blue-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
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
                                        className="form-select block w-32 px-3 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm rounded-md dark:bg-slate-800 dark:text-white"
                                    >
                                        {availableLanguages.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.flag} {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dashboard Layout Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600">
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{t('settings.dashboardLayout', 'Visualización Vertical dashboard')}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.dashboardLayout_desc', 'Cambiar entre vista de hexágonos y lista.')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-medium ${localStorage.getItem('dashboard_layout') !== 'list' ? (isDark ? 'text-lime-400' : 'text-blue-600') : 'text-gray-400'}`}>
                                            ⬡
                                        </span>
                                        <button
                                            onClick={() => {
                                                const current = localStorage.getItem('dashboard_layout') || 'hexagon';
                                                const newLayout = current === 'hexagon' ? 'list' : 'hexagon';
                                                localStorage.setItem('dashboard_layout', newLayout);
                                                // Force re-render by dispatching a custom event
                                                window.dispatchEvent(new CustomEvent('dashboardLayoutChange', { detail: newLayout }));
                                                // Force component re-render
                                                setMessage({ type: 'success', text: `Vista cambiada a ${newLayout === 'list' ? 'lista' : 'hexágonos'}` });
                                            }}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${localStorage.getItem('dashboard_layout') === 'list' ? (isDark ? 'bg-lime-500 focus:ring-lime-500' : 'bg-blue-600 focus:ring-blue-600') : 'bg-gray-300 dark:bg-slate-500'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${localStorage.getItem('dashboard_layout') === 'list' ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <span className={`text-xs font-medium ${localStorage.getItem('dashboard_layout') === 'list' ? (isDark ? 'text-lime-400' : 'text-blue-600') : 'text-gray-400'}`}>
                                            ☰
                                        </span>
                                    </div>
                                </div>


                                {/* AI Configuration Section */}
                                <div className="border-t border-gray-100 dark:border-slate-600 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inteligencia Artificial</h3>
                                    <form onSubmit={handleLlmUpdate} className="space-y-6 bg-gray-50 dark:bg-slate-700/50 p-6 rounded-xl border border-gray-100 dark:border-slate-600">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa</label>
                                                <select
                                                    value={llmConfig.provider}
                                                    onChange={(e) => {
                                                        const newProvider = e.target.value;
                                                        // Set default model for the new provider
                                                        const defaultModel = PROVIDER_MODELS[newProvider]?.[0]?.value || '';
                                                        setLlmConfig({ ...llmConfig, provider: newProvider, model: defaultModel });
                                                    }}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base"
                                                >
                                                    <option value="openai">OpenAI</option>
                                                    <option value="anthropic">Anthropic</option>
                                                    <option value="gemini">Google Gemini</option>
                                                    <option value="deepseek">DeepSeek</option>
                                                    <option value="xai">Grok (xAI)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
                                                <select
                                                    value={llmConfig.model}
                                                    onChange={(e) => setLlmConfig({ ...llmConfig, model: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base"
                                                >
                                                    {PROVIDER_MODELS[llmConfig.provider]?.map(model => (
                                                        <option key={model.value} value={model.value}>
                                                            {model.label}
                                                        </option>
                                                    ))}
                                                    <option value="custom">Otro (Manual)</option>
                                                </select>
                                                {llmConfig.model === 'custom' && (
                                                    <input
                                                        type="text"
                                                        value={llmConfig.customModel || ''}
                                                        onChange={(e) => setLlmConfig({ ...llmConfig, customModel: e.target.value })}
                                                        placeholder="Nombre del modelo es pecifico"
                                                        className="mt-2 w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia de Análisis</label>
                                                <select
                                                    value={llmConfig.analysis_frequency || 'weekly'}
                                                    onChange={(e) => setLlmConfig({ ...llmConfig, analysis_frequency: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base"
                                                >
                                                    <option value="daily">Diario (Cada 24h)</option>
                                                    <option value="weekly">Semanal (Lunes)</option>
                                                    <option value="monthly">Mensual (1° de mes)</option>
                                                    <option value="manual_only">Solo Manual</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                                                <div className="relative">
                                                    <input
                                                        type={showApiKey ? "text" : "password"}
                                                        value={llmConfig.api_key || ''}
                                                        onChange={(e) => setLlmConfig({ ...llmConfig, api_key: e.target.value })}
                                                        placeholder="sk-..."
                                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowApiKey(!showApiKey)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                    >
                                                        {showApiKey ? (
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
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Tu clave se guarda encriptada de forma segura.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 dark:bg-lime-500 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-lime-600 transition-colors disabled:opacity-50 text-base shadow-sm"
                                        >
                                            {isLoading ? 'Guardando...' : 'Guardar Configuración'}
                                        </button>
                                    </form>
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
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        {t('settings.info.terms')}
                                    </button>
                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                    <button
                                        onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        {t('settings.info.privacy')}
                                    </button>
                                </div>

                                <div className="mt-12 p-4 bg-blue-50 text-blue-800 dark:bg-lime-900/20 dark:text-lime-200 rounded-lg text-sm inline-block">
                                    {footerText || `© 2024 ${appName || 'Mi Aplicación'}. ${t('settings.info.footer')}`}
                                </div>

                                {/* Install Options Grid */}
                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                                    {/* PWA Install */}
                                    {window.deferredPrompt ? (
                                        <button
                                            onClick={async () => {
                                                const promptEvent = window.deferredPrompt;
                                                if (!promptEvent) return;
                                                promptEvent.prompt();
                                                const { outcome } = await promptEvent.userChoice;
                                                console.log(`User response to the install prompt: ${outcome}`);
                                                window.deferredPrompt = null;
                                                setActiveTab('info'); // Force update
                                            }}
                                            className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            <span className="text-sm">Instalar Web App</span>
                                            <span className="text-[10px] font-normal opacity-70">Para cualquier dispositivo</span>
                                        </button>
                                    ) : (
                                        // Placeholder or "Installed" state could go here, for now empty to keep grid balance if we want
                                        <div className="hidden sm:flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gray-100 dark:bg-slate-800 text-gray-400 rounded-xl border border-gray-200 dark:border-slate-700 dashed border-2">
                                            <span className="text-sm font-medium">Web App Instalada</span>
                                        </div>
                                    )}

                                    {/* Android APK Download */}
                                    <a
                                        href="https://github.com/amical-najul/eukrasia/releases/latest/download/app-debug.apk"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Descargar última versión desde GitHub"
                                        className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform"
                                    >
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.523 15.3414C17.523 15.3414 17.564 15.3414 17.597 15.3414C19.341 14.4754 20.264 12.3394 19.398 10.5954C18.991 9.77441 18.261 9.17241 17.391 8.87841L18.498 6.96041C18.577 6.82441 18.531 6.64941 18.396 6.57041C18.259 6.49141 18.085 6.53741 18.006 6.67341L16.858 8.66541C15.433 8.01341 13.782 7.64141 12 7.64141C10.218 7.64141 8.567 8.01341 7.142 8.66541L5.994 6.67341C5.915 6.53741 5.741 6.49141 5.604 6.57041C5.469 6.64941 5.423 6.82441 5.502 6.96041L6.609 8.87841C4.469 9.60141 3.003 11.6964 3.167 14.1204H3.141C3.125 14.7394 3.327 15.3124 3.737 15.7764L3.639 15.8254C2.529 16.3814 2 17.4334 2 18.5914C2 20.3524 3.535 21.8014 5.378 21.6144C6.208 22.3884 7.29 22.8484 8.502 22.8484H15.498C16.711 22.8484 17.792 22.3884 18.622 21.6144C20.465 21.8014 22 20.3524 22 18.5914C22 17.4334 21.471 16.3814 20.361 15.8254L20.263 15.7764C20.673 15.3124 20.875 14.7394 20.859 14.1204H20.833C20.833 14.0754 20.833 14.0304 20.833 13.9854C20.67 15.4614 19.261 16.3474 17.523 15.3414ZM7.5 13C6.948 13 6.5 12.552 6.5 12C6.5 11.448 6.948 11 7.5 11C8.052 11 8.5 11.448 8.5 12C8.5 12.552 8.052 13 7.5 13ZM16.5 13C15.948 13 15.5 12.552 15.5 12C15.5 11.448 15.948 11 16.5 11C17.052 11 17.5 11.448 17.5 12C17.5 12.552 17.052 13 16.5 13Z" />
                                        </svg>
                                        <span className="text-sm">Descargar APK</span>
                                        <div className="flex flex-col items-center leading-tight">
                                            <span className="text-[10px] font-normal opacity-70">Android Nativo (Piloto)</span>
                                            <span className="text-[9px] font-bold opacity-90 underline">Requiere instalación manual</span>
                                        </div>
                                    </a>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div >

            <DataDeletionModal
                isOpen={dataDeletion.isOpen}
                onClose={() => setDataDeletion({ ...dataDeletion, isOpen: false })}
                type={dataDeletion.type}
                title={dataDeletion.title}
                description={dataDeletion.desc}
                requirePassword={dataDeletion.requirePassword}
                onSuccess={() => {
                    // Refresh data if needed or show global toast
                    // user context might stay valid as we only deleted aux data
                }}
            />

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
