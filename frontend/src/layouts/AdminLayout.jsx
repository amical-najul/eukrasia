import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const AdminLayout = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const { t } = useLanguage();

    const handleLogout = () => {
        logout();
    };

    const isActive = (path) => location.pathname === path;

    // Guard: Don't render if user is not loaded yet
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
                <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-inter transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-xl min-h-screen flex flex-col fixed inset-y-0 left-0 z-10 transition-transform duration-300 transform md:relative md:translate-x-0">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-[#008a60] dark:text-emerald-400">AdminPanel</h1>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">{t('admin.system_management')}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/admin/profile"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/profile')
                            ? 'bg-[#f0fdf4] dark:bg-emerald-900/30 text-[#008a60] dark:text-emerald-400 font-semibold'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        {t('admin.menu.profile')}
                    </Link>

                    <Link
                        to="/admin/users"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/users')
                            ? 'bg-[#f0fdf4] dark:bg-emerald-900/30 text-[#008a60] dark:text-emerald-400 font-semibold'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        {t('admin.menu.users')}
                    </Link>

                    <Link
                        to="/admin/general"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/general')
                            ? 'bg-[#f0fdf4] dark:bg-emerald-900/30 text-[#008a60] dark:text-emerald-400 font-semibold'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {t('admin.menu.general')}
                    </Link>

                    <Link
                        to="/admin/google-auth"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/google-auth')
                            ? 'bg-[#f0fdf4] dark:bg-emerald-900/30 text-[#008a60] dark:text-emerald-400 font-semibold'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        {t('admin.menu.google')}
                    </Link>
                </nav>

                {/* Theme Toggle */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('admin.theme')}</span>
                        <button
                            onClick={toggleTheme}
                            className={`
                                relative w-14 h-7 rounded-full transition-all duration-500 ease-out
                                ${isDark
                                    ? 'bg-gradient-to-r from-slate-700 to-slate-800'
                                    : 'bg-gradient-to-r from-amber-100 to-amber-200'
                                }
                            `}
                        >
                            <span className={`
                                absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-sm
                                transition-all duration-500 transform
                                ${isDark
                                    ? 'translate-x-7 bg-slate-900'
                                    : 'translate-x-0.5 bg-amber-400'
                                }
                            `}>
                                {isDark ? '🌙' : '☀️'}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                        ) : (
                            <div className="w-10 h-10 bg-[#008a60] text-white rounded-full flex items-center justify-center font-bold">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name || 'Admin'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <Link
                        to="/dashboard"
                        className="w-full flex items-center gap-2 px-4 py-2 mb-2 bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        {t('admin.view_as_user')}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-500 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        {t('admin.logout')}
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
