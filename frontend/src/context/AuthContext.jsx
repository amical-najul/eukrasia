import { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const { changeLanguage } = useLanguage();

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');

            if (storedUser && storedToken) {
                const parsedUser = JSON.parse(storedUser);
                // Validate minimal structure
                if (parsedUser && typeof parsedUser === 'object' && parsedUser.email) {
                    setUser(parsedUser);
                    setToken(storedToken);
                    if (parsedUser.language_preference) {
                        changeLanguage(parsedUser.language_preference);
                    }
                } else {
                    console.warn('Invalid user structure in localStorage, clearing...');
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            }
        } catch (e) {
            console.error('Error parsing stored user data:', e);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData, authToken) => {
        console.log('Login called:', userData);
        setUser(userData);
        setToken(authToken);
        if (userData.language_preference) {
            console.log('Setting language from login:', userData.language_preference);
            changeLanguage(userData.language_preference);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
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
        <AuthContext.Provider value={{ user, token, login, logout, updateProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
