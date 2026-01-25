import { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import api from '../services/api';
import Storage from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { changeLanguage } = useLanguage();

    // Validate session on mount - uses Capacitor Preferences for persistent storage on mobile
    useEffect(() => {
        const validateSession = async () => {
            try {
                // Use persistent Storage (Capacitor Preferences on mobile, localStorage on web)
                const savedToken = await Storage.get('token');
                const savedUser = await Storage.get('user');

                console.log('[Auth] Checking stored session...', { hasToken: !!savedToken, hasUser: !!savedUser });

                // If we have both token and user cached, try to validate
                if (savedToken && savedUser) {
                    try {
                        // Validate the token is still valid
                        const data = await api.get('/auth/me');
                        if (data.user) {
                            setUser(data.user);
                            await Storage.set('user', JSON.stringify(data.user));
                            if (data.user.language_preference) {
                                changeLanguage(data.user.language_preference);
                            }
                            console.log('[Auth] Session restored successfully');
                            return; // Session valid, we're done
                        }
                    } catch (tokenError) {
                        // Token expired or invalid, continue to try cookie auth
                        console.log('[Auth] Saved token invalid, trying cookie auth...', tokenError.message);
                    }
                }

                // Fallback: Try cookie-based auth (for web browsers)
                try {
                    const data = await api.get('/auth/me');
                    if (data.user) {
                        setUser(data.user);
                        await Storage.set('user', JSON.stringify(data.user));
                        if (data.user.language_preference) {
                            changeLanguage(data.user.language_preference);
                        }
                        console.log('[Auth] Session restored via cookie');
                    }
                } catch (cookieError) {
                    // No valid session, user needs to login
                    console.log('[Auth] No valid session found');
                }
            } catch (e) {
                // Session invalid or expired, clear any stale data
                console.error('[Auth] Session validation error:', e);
                await Storage.remove('user');
                await Storage.remove('token');
            } finally {
                setLoading(false);
            }
        };
        validateSession();
    }, []);

    const login = async (userData, token = null) => {
        setUser(userData);
        if (userData.language_preference) {
            changeLanguage(userData.language_preference);
        }
        // Store user data using persistent Storage
        await Storage.set('user', JSON.stringify(userData));
        // Store token if provided (CRITICAL for mobile apps)
        if (token) {
            await Storage.set('token', token);
            console.log('[Auth] Token saved to persistent storage');
        } else {
            console.warn('[Auth] No token provided to login() - session will not persist on mobile!');
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (e) {
            console.error('Logout API call failed:', e);
        }
        setUser(null);
        await Storage.remove('user');
        await Storage.remove('token');
        window.location.href = '/';
    };

    const updateProfile = async (updatedUser) => {
        setUser(updatedUser);
        await Storage.set('user', JSON.stringify(updatedUser));
        if (updatedUser.language_preference) {
            changeLanguage(updatedUser.language_preference);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
