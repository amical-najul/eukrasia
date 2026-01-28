import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import UserProfileMenu from '../components/layout/UserProfileMenu';

const UserLayout = () => {
    const { user, logout } = useAuth();
    const { appName, appFaviconUrl } = useBranding();
    const location = useLocation();
    const isAdmin = user?.role === 'admin';

    // Check if we are in an immersive session (breathing, meditation, or timer)
    const isImmersive = location.pathname.includes('/breathing') ||
        location.pathname.includes('/metabolic') ||
        location.pathname.includes('/mind') ||
        location.pathname.includes('/body') ||
        location.pathname.includes('/sleep') ||
        location.pathname.includes('/stats');

    return (
        <div className="h-screen bg-gray-50 dark:bg-[#0f172a] flex flex-col font-inter transition-colors duration-300 overflow-hidden">
            {/* Navbar - Hidden in Immersive Mode */}
            {!isImmersive && (
                <nav className="bg-white dark:bg-[#1e293b] shadow-sm border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <img src={appFaviconUrl} alt="Logo" className="w-8 h-8 rounded-full" />
                                <span className="text-xl font-bold text-blue-600 dark:text-[#84cc16] transition-colors">{appName}</span>
                            </Link>
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/dashboard/ai"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border border-purple-200 dark:border-purple-800 transition-all group"
                                    title="Analista de Salud IA"
                                >
                                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                    <span className="hidden sm:block text-sm font-medium text-purple-700 dark:text-purple-300">
                                        Analista IA
                                    </span>
                                </Link>
                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                                <UserProfileMenu user={user} logout={logout} />
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* Content */}
            <main className={`flex-grow overflow-y-auto ${isImmersive ? 'p-0' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
                <Outlet />
            </main>

            {/* Admin Return Button (Floating) */}
            {isAdmin && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
                    <Link
                        to="/admin/users"
                        className="flex items-center gap-2 bg-blue-600 dark:bg-blue-600 text-white dark:text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all transform hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        <span className="font-medium">Volver al AdminPanel</span>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default UserLayout;
