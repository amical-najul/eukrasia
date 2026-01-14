import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import UserProfileMenu from '../components/layout/UserProfileMenu';

const UserLayout = () => {
    const { user, logout } = useAuth();
    const { appName, appFaviconUrl } = useBranding();
    const location = useLocation();
    const isAdmin = user?.role === 'admin';

    // Check if we are in an immersive session (breathing or timer)
    const isImmersive = location.pathname.includes('/breathing/guided') ||
        location.pathname.includes('/breathing/retention');

    return (
        <div className="h-screen bg-gray-50 dark:bg-[#0f172a] flex flex-col font-inter transition-colors duration-300 overflow-hidden">
            {/* Navbar */}
            <nav className="bg-white dark:bg-[#1e293b] shadow-sm border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <img src={appFaviconUrl} alt="Logo" className="w-8 h-8 rounded-full" />
                            <span className="text-xl font-bold text-blue-600 dark:text-[#84cc16] transition-colors">{appName}</span>
                        </div>
                        <div className="flex items-center">
                            <UserProfileMenu user={user} logout={logout} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className={`flex-grow overflow-y-auto ${isImmersive ? 'p-0' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
                <Outlet />
            </main>

            {/* Admin Return Button (Floating) */}
            {isAdmin && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
                    <Link
                        to="/admin/users"
                        className="flex items-center gap-2 bg-gray-900 dark:bg-[#84cc16] text-white dark:text-gray-900 px-5 py-3 rounded-full shadow-lg hover:bg-black dark:hover:bg-[#65a30d] transition-all transform hover:scale-105"
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
