import { useState } from 'react';
import { Layout, Mail, Shield, Bot, FileText, Database } from 'lucide-react';
import GeneralTab from './tabs/GeneralTab';
import SmtpTab from './tabs/SmtpTab';
import SecurityTab from './tabs/SecurityTab';
import AiTab from './tabs/AiTab';
import LegalTab from './tabs/LegalTab';
import StorageTab from './tabs/StorageTab';

const AdminGeneralSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: Layout },
        { id: 'smtp', label: 'Email (SMTP)', icon: Mail },
        { id: 'security', label: 'Seguridad', icon: Shield },
        { id: 'ai', label: 'Inteligencia Artificial', icon: Bot },
        { id: 'legal', label: 'Legales', icon: FileText },
        { id: 'storage', label: 'Almacenamiento', icon: Database },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ajustes del Sistema</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-[#008a60] text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'general' && <GeneralTab />}
                    {activeTab === 'smtp' && <SmtpTab />}
                    {activeTab === 'security' && <SecurityTab />}
                    {activeTab === 'ai' && <AiTab />}
                    {activeTab === 'legal' && <LegalTab />}
                    {activeTab === 'storage' && <StorageTab />}
                </div>
            </div>
        </div>
    );
};

export default AdminGeneralSettingsPage;

