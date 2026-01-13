import React from 'react';

const AdminTabs = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                                ${isActive
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {Icon && (
                                <Icon
                                    className={`
                                        -ml-0.5 mr-2 h-5 w-5
                                        ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                                    `}
                                />
                            )}
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default AdminTabs;
