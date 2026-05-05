import api from './api';

export const authService = {
  async register(data: any) {
    const response = await api.post('/api/v1/auth/register', data);
    return response.data;
  },
  
  async login(usernameOrEmail: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', usernameOrEmail);
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

  async loginGoogle(token: string) {
    const response = await api.post('/api/v1/auth/google', { token });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  async loginFacebook(token: string) {
    const response = await api.post('/api/v1/auth/facebook', { token });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/api/v1/users/me');
    return response.data;
  }
};
