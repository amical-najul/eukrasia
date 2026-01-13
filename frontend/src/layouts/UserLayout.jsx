import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import UserProfileMenu from '../components/layout/UserProfileMenu';

const UserLayout = () => {
    const { user, logout } = useAuth();
    const { appName, appFaviconUrl } = useBranding();
    const isAdmin = user?.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-inter transition-colors duration-300">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <img src={appFaviconUrl} alt="Logo" className="w-8 h-8 rounded-full" />
                            <span className="text-xl font-bold text-[#008a60]">{appName}</span>
                        </div>
                        <div className="flex items-center">
                            <UserProfileMenu user={user} logout={logout} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Admin Return Button (Floating) */}
            {isAdmin && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
                    <Link
                        to="/admin/users"
                        className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg hover:bg-black transition-all transform hover:scale-105"
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
