import api from './api';

export const authService = {
  async register(data: any) {
    const response = await api.post('/api/v1/auth/register', data);
    return response.data;
  },
  
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  async getCurrentUser() {
    const response = await api.get('/api/v1/users/me');
    return response.data;
  }
};
