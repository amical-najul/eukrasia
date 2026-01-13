import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'es');
    const [translations, setTranslations] = useState({});
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Load available languages
        fetch(`${API_URL}/translations/languages`)
            .then(res => res.json())
            .then(data => {
                setAvailableLanguages(data.languages || []);
            })
            .catch(err => console.error('Error loading languages:', err));
    }, []);

    useEffect(() => {
        // Load translations when language changes
        setLoading(true);
        fetch(`${API_URL}/translations/${language}`)
            .then(res => res.json())
            .then(data => {
                setTranslations(data.translations || {});
                setLoading(false);
                localStorage.setItem('language', language);
            })
            .catch(err => {
                console.error('Error loading translations:', err);
                setLoading(false);
            });
    }, [language]);

    const changeLanguage = (lang) => {
        if (availableLanguages.find(l => l.code === lang)) {
            setLanguage(lang);
        }
    };

    const t = (key, fallback = '') => {
        return translations[key] || fallback || key;
    };

    return (
        <LanguageContext.Provider value={{
            language,
            changeLanguage,
            t,
            availableLanguages,
            loading
        }}>
            {children}
        </LanguageContext.Provider>
    );
};
