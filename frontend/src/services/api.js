import Storage from './storage';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) console.warn('VITE_API_URL is missing!');

/**
 * Common fetch wrapper to handle Base URL and Headers
 * Uses credentials: 'include' for automatic cookie handling (httpOnly JWT)
 * Falls back to persistent Storage token for mobile apps (Capacitor Preferences)
 */

// Helper to get token from persistent storage
const getAuthToken = async (providedToken) => {
    if (providedToken) return providedToken;
    // Use persistent Storage (Capacitor Preferences on mobile, localStorage on web)
    return await Storage.get('token');
};

const api = {
    get: async (endpoint, token = null) => {
        const authToken = await getAuthToken(token);
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['x-auth-token'] = authToken;

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers,
            credentials: 'include'
        });
        return handleResponse(res);
    },

    post: async (endpoint, body, token = null) => {
        const authToken = await getAuthToken(token);
        const headers = {};

        if (!(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (authToken) headers['x-auth-token'] = authToken;

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
        return handleResponse(res);
    },

    put: async (endpoint, body, token = null) => {
        const authToken = await getAuthToken(token);
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['x-auth-token'] = authToken;

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            credentials: 'include',
            body: JSON.stringify(body)
        });
        return handleResponse(res);
    },

    patch: async (endpoint, body, token = null) => {
        const authToken = await getAuthToken(token);
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['x-auth-token'] = authToken;

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers,
            credentials: 'include',
            body: JSON.stringify(body)
        });
        return handleResponse(res);
    },

    delete: async (endpoint, options = {}, token = null) => {
        const authToken = await getAuthToken(token);
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['x-auth-token'] = authToken;

        const fetchOptions = {
            method: 'DELETE',
            headers,
            credentials: 'include'
        };

        // Handle Body in Delete (for password confirmation)
        if (options && typeof options === 'object' && options.data) {
            fetchOptions.body = JSON.stringify(options.data);
        }

        const res = await fetch(`${API_URL}${endpoint}`, fetchOptions);
        return handleResponse(res);
    }
};

async function handleResponse(res) {
    const data = await res.json();
    if (!res.ok) {
        const error = new Error(data.message || 'Error en la petición');
        error.data = data;
        throw error;
    }
    return data;
}

export default api;
