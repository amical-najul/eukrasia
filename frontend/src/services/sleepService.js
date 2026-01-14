import api from './api';

const sleepService = {
    startSleep: async () => {
        const response = await api.post('/sleep/start');
        return response;
    },

    getStatus: async () => {
        const response = await api.get('/sleep/status');
        return response;
    },

    endSleep: async (data) => {
        const response = await api.put('/sleep/end', data);
        return response;
    },

    getHistory: async (limit = 10) => {
        const response = await api.get(`/sleep/history?limit=${limit}`);
        return response;
    }
};

export default sleepService;
