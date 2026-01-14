import { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { changeLanguage } = useLanguage();

    // Validate session on mount via httpOnly cookie
    useEffect(() => {
        const validateSession = async () => {
            try {
                // Call /me to validate session from cookie
                const data = await api.get('/auth/me');
                if (data.user) {
                    setUser(data.user);
                    // Also restore user to localStorage for non-sensitive data (avatar, name)
                    localStorage.setItem('user', JSON.stringify(data.user));
                    if (data.user.language_preference) {
                        changeLanguage(data.user.language_preference);
                    }
                }
            } catch (e) {
                // Session invalid or expired, clear any stale data
                console.log('Session validation failed:', e.message);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };
        validateSession();
    }, []);

    const login = (userData, token = null) => {
        console.log('Login called:', userData);
        setUser(userData);
        if (userData.language_preference) {
            console.log('Setting language from login:', userData.language_preference);
            changeLanguage(userData.language_preference);
        }
        // Store user data in localStorage for UI purposes
        localStorage.setItem('user', JSON.stringify(userData));
        // Store token if provided (for cross-origin dev where cookies don't work)
        if (token) {
            localStorage.setItem('token', token);
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
        window.location.href = '/';
    };

    const updateProfile = (updatedUser) => {
        console.log('updateProfile called:', updatedUser);
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (updatedUser.language_preference) {
            console.log('Updating language from profile update:', updatedUser.language_preference);
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
