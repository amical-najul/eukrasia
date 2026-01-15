import api from './api';

const mindService = {
    // Save a completed or partial session
    saveSession: async (sessionData) => {
        return api.post('/mind/session', sessionData);
    },

    // Get user's session history
    getHistory: async () => {
        return api.get('/mind/history');
    },

    // Get user's configuration
    getConfig: async () => {
        return api.get('/mind/config');
    },

    // Save user's configuration
    saveConfig: async (configData) => {
        return api.post('/mind/config', configData);
    }
};

export default mindService;
