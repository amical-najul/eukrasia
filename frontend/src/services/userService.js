import api from './api';

const userService = {
    // Get all users (Admin)
    getAllUsers: async (params) => {
        const response = await api.get('/users', { params });
        return response;
    },

    // Create user (Admin)
    createUser: async (userData) => {
        const response = await api.post('/users', userData);
        return response;
    },

    // Update user (Admin)
    updateUser: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response;
    },

    // Delete user (Admin)
    deleteUser: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response;
    },

    // Update Profile (Self)
    updateProfile: async (userData) => {
        const response = await api.put('/users/profile/me', userData);
        return response;
    },

    // Upload Avatar
    uploadAvatar: async (formData) => {
        const response = await api.post('/users/avatar', formData);
        return response;
    },

    // Delete Avatar
    deleteAvatar: async () => {
        const response = await api.delete('/users/avatar');
        return response;
    },

    // Change Password
    changePassword: async (passwordData) => {
        const response = await api.put('/users/change-password', passwordData);
        return response;
    },

    // Delete Own Account
    deleteOwnAccount: async (password) => {
        // Axios delete accepts body in 'data' field
        const response = await api.delete('/users/me', {
            data: { password }
        });
        return response;
    }
};

export default userService;
