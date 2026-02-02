import api from './api'; // Correct import of default export

const BASE_URL = '/body';

const bodyService = {
    // GET
    getSummary: async () => {
        try {
            return await api.get(`${BASE_URL}/summary`);
        } catch (error) {
            console.error("Error getting body summary:", error);
            throw error;
        }
    },

    getHistory: async ({ period, type, subtype }) => {
        try {
            const params = new URLSearchParams();
            if (period) params.append('period', period);
            if (type) params.append('type', type);
            if (subtype) params.append('subtype', subtype);

            return await api.get(`${BASE_URL}/history?${params.toString()}`);
        } catch (error) {
            console.error("Error getting history:", error);
            throw error;
        }
    },

    // POST
    logWeight: async (weight, note, date) => {
        return await api.post(`${BASE_URL}/log/weight`, { weight, note, date });
    },

    logMeasurement: async (type, value, unit, note, date) => {
        return await api.post(`${BASE_URL}/log/measurement`, { type, value, unit, note, date });
    },

    setGoal: async (start_weight, target_weight, start_date, target_date) => {
        return await api.post(`${BASE_URL}/goal`, { start_weight, target_weight, start_date, target_date });
    },

    // PUT (Update)
    updateWeight: async (id, weight, note, date) => {
        return await api.put(`${BASE_URL}/weight/${id}`, { weight, note, date });
    },

    updateMeasurement: async (id, value, note, date) => {
        return await api.put(`${BASE_URL}/measurement/${id}`, { value, note, date });
    },

    // DELETE
    deleteWeight: async (id) => {
        return await api.delete(`${BASE_URL}/weight/${id}`);
    },

    deleteMeasurement: async (id) => {
        return await api.delete(`${BASE_URL}/measurement/${id}`);
    }
};

export default bodyService;
