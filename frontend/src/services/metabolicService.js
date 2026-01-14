import api from './api';

const metabolicService = {
    logEvent: async (formData) => {
        // api.js handles FormData properly and returns response directly
        const response = await api.post('/metabolic/log', formData);
        return response;
    },

    getStatus: async () => {
        const response = await api.get('/metabolic/status');
        return response;
    },

    getHistory: async (limit = 20) => {
        const response = await api.get(`/metabolic/history?limit=${limit}`);
        return response;
    },

    deleteEvent: async (eventId) => {
        const response = await api.delete(`/metabolic/log/${eventId}`);
        return response;
    }
};

export default metabolicService;
