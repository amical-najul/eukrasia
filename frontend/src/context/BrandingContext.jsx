import { createContext, useContext, useState, useEffect } from 'react';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
    const [branding, setBranding] = useState({
        appName: import.meta.env.VITE_APP_NAME || 'Mi Aplicación',
        appFaviconUrl: import.meta.env.VITE_APP_FAVICON_URL || '/favicon.ico',
        appVersion: '1.0.0',
        footerText: '© 2024 Mi Aplicación. Todos los derechos reservados.',
        loading: true
    });

    const fetchBranding = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${API_URL}/settings/public`);
            if (res.ok) {
                const data = await res.json();
                setBranding(prev => ({
                    ...prev,
                    appName: data.app_name || prev.appName,
                    appFaviconUrl: data.app_favicon_url || prev.appFaviconUrl,
                    appVersion: data.app_version || prev.appVersion,
                    footerText: data.footer_text || prev.footerText,
                    loading: false
                }));
            }
        } catch (err) {
            console.error('Error fetching branding:', err);
            setBranding(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchBranding();
    }, []);

    // Effect to update DOM
    useEffect(() => {
        if (branding.appName) {
            document.title = branding.appName;
        }
        if (branding.appFaviconUrl) {
            // Remove ANY existing icon or apple-touch-icon
            const existingIcons = document.querySelectorAll("link[rel*='icon']");
            existingIcons.forEach(icon => icon.parentNode.removeChild(icon));

            // Create new standard favicon
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = branding.appFaviconUrl;
            document.getElementsByTagName('head')[0].appendChild(link);

            // Also update apple-touch-icon for mobile
            const appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            appleLink.href = branding.appFaviconUrl;
            document.getElementsByTagName('head')[0].appendChild(appleLink);
        }
    }, [branding.appName, branding.appFaviconUrl]);

    return (
        <BrandingContext.Provider value={{ ...branding, refreshBranding: fetchBranding }}>
            {children}
        </BrandingContext.Provider>
    );
};

export const useBranding = () => useContext(BrandingContext);
