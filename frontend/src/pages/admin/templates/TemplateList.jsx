import React from 'react';
import { TEMPLATES_CONFIG } from './constants';

const TemplateList = ({ templates, handleSelectTemplate }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEMPLATES_CONFIG.map(config => {
                const template = templates.find(t => t.template_key === config.key);
                return (
                    <div
                        key={config.key}
                        onClick={() => handleSelectTemplate(config.key)}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#008a60] transition-all cursor-pointer"
                    >
                        <div className="text-3xl mb-3">{config.icon}</div>
                        <h3 className="font-semibold text-gray-900 mb-1">{config.name}</h3>
                        <p className="text-sm text-gray-500">{config.description}</p>
                        {template && (
                            <span className="inline-block mt-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Personalizada
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default TemplateList;
