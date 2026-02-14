import { apiService } from './api';
import { LoginRequest, LoginResponse } from '@/types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.login(credentials);
    
    // Store token in localStorage
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }
    
    return response;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};