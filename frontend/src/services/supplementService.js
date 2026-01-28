import api from './api';

const supplementService = {
    getDailyLog: async (date) => {
        const response = await api.get(`/supplements/log?date=${date}`);
        return response.data;
    },

    toggleLog: async (data) => {
        // data: { supplement_id, date }
        const response = await api.post('/supplements/log', data);
        return response.data;
    }
};

export default supplementService;
