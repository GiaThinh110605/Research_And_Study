import api from './api';

export const userService = {
  getUsers: async (skip = 0, limit = 100) => {
    const response = await api.get(`/api/v1/users/?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  getUser: async (userId: number) => {
    const response = await api.get(`/api/v1/users/${userId}`);
    return response.data;
  },
  
  updateUser: async (userId: number, data: any) => {
    const response = await api.put(`/api/v1/users/${userId}`, data);
    return response.data;
  },
  
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/api/v1/users/${userId}`);
    return response.data;
  },
  
  updateMe: async (data: any) => {
    const response = await api.put('/api/v1/users/me', data);
    return response.data;
  }
};
