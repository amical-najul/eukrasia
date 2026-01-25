import { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { changeLanguage } = useLanguage();

    // Validate session on mount - check localStorage token first (for mobile/Capacitor)
    useEffect(() => {
        const validateSession = async () => {
            try {
                // For mobile apps (Capacitor), cookies don't persist between sessions
                // So we check if there's a saved token in localStorage first
                const savedToken = localStorage.getItem('token');
                const savedUser = localStorage.getItem('user');

                // If we have both token and user cached, try to validate
                if (savedToken && savedUser) {
                    try {
                        // Validate the token is still valid
                        const data = await api.get('/auth/me');
                        if (data.user) {
                            setUser(data.user);
                            localStorage.setItem('user', JSON.stringify(data.user));
                            if (data.user.language_preference) {
                                changeLanguage(data.user.language_preference);
                            }
                            return; // Session valid, we're done
                        }
                    } catch (tokenError) {
                        // Token expired or invalid, continue to try cookie auth
                        console.log('Saved token invalid, trying cookie auth...');
                    }
                }

                // Fallback: Try cookie-based auth (for web browsers)
                const data = await api.get('/auth/me');
                if (data.user) {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    if (data.user.language_preference) {
                        changeLanguage(data.user.language_preference);
                    }
                }
            } catch (e) {
                // Session invalid or expired, clear any stale data
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        validateSession();
    }, []);

    const login = (userData, token = null) => {
        setUser(userData);
        if (userData.language_preference) {
            changeLanguage(userData.language_preference);
        }
        // Store user data in localStorage for UI purposes
        localStorage.setItem('user', JSON.stringify(userData));
        // Store token if provided (CRITICAL for mobile apps where cookies don't persist)
        if (token) {
            localStorage.setItem('token', token);
            console.log('[Auth] Token saved to localStorage:', token.substring(0, 20) + '...');
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
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Also remove token
        window.location.href = '/';
    };

    const updateProfile = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
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
