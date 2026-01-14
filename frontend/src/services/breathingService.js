import api from './api';

const breathingService = {
    // Save a completed session
    saveSession: async (sessionData) => {
        const response = await api.post('/breathing/session', sessionData);
        return response.data;
    },

    // Get session history
    getHistory: async () => {
        const response = await api.get('/breathing/history');
        return response.data;
    },

    // Get user configuration
    getConfig: async () => {
        const response = await api.get('/breathing/config');
        return response.data;
    },

    // Save user configuration
    saveConfig: async (configData) => {
        const response = await api.post('/breathing/config', configData);
        return response.data;
    }
};

export default breathingService;
