// Servicio para gestionar Protocolos
import api from './api';

const protocolService = {
    // Obtener todos los protocolos disponibles
    getProtocols: async () => {
        const response = await api.get('/protocols');
        return response;
    },

    // Obtener detalle de un protocolo
    getProtocolById: async (id) => {
        const response = await api.get(`/protocols/${id}`);
        return response;
    },

    // Obtener protocolo activo del usuario
    getActiveProtocol: async () => {
        const response = await api.get('/protocols/active');
        return response;
    },

    // Iniciar un protocolo
    startProtocol: async (protocolId, options = {}) => {
        const response = await api.post(`/protocols/${protocolId}/start`, {
            duration_days: options.duration_days,
            start_date: options.start_date
        });
        return response;
    },

    // Marcar tarea como completada
    logTask: async (taskId) => {
        const response = await api.post('/protocols/active/log', { task_id: taskId });
        return response;
    },

    // Desmarcar tarea
    unlogTask: async (taskId) => {
        const response = await api.post('/protocols/active/unlog', { task_id: taskId });
        return response;
    },

    // Abandonar protocolo activo
    abandonProtocol: async () => {
        const response = await api.put('/protocols/active/abandon');
        return response;
    },

    // Completar protocolo
    completeProtocol: async () => {
        const response = await api.put('/protocols/active/complete');
        return response;
    }
};

export default protocolService;
