import api from './api';

const authService = {
    login: async (email, password) => {
        return await api.post('/auth/login', { email, password });
    },

    register: async (email, password, name) => {
        // name is optional but can be passed
        return await api.post('/auth/register', { email, password, name });
    },

    verifyEmail: async (token) => {
        return await api.get(`/auth/verify-email?token=${token}`);
    },

    googleLogin: async (token) => {
        return await api.post('/auth/google', { token });
    }
};

export default authService;
