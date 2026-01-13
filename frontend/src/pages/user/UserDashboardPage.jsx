import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const UserDashboardPage = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // Determine welcome name (Prioritize Name > Email username > Email)
    const welcomeName = user?.name || user?.email?.split('@')[0] || user?.email || 'Usuario';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg transition-colors">
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {t('dashboard.welcome_user').replace('{name}', welcomeName)}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        {t('dashboard.subtitle')}
                    </p>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Placeholder Stats */}
                        <div className="bg-[#f0fdf4] dark:bg-green-900/20 p-6 rounded-xl border border-[#008a60]/20 dark:border-[#008a60]/30 transition-colors">
                            <h3 className="font-semibold text-[#008a60] dark:text-[#00a876]">{t('dashboard.stats.level')}</h3>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">{t('dashboard.stats.level_value')}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700/50 transition-colors">
                            <h3 className="font-semibold text-blue-600 dark:text-blue-400">{t('dashboard.stats.lessons')}</h3>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">0</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700/50 transition-colors">
                            <h3 className="font-semibold text-purple-600 dark:text-purple-400">{t('dashboard.stats.streak')}</h3>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">0 {t('dashboard.stats.days')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;
