import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  token?: string; // Fallback for compatibility
  userId?: number;
  id?: number; // Fallback for compatibility
  email: string;
  fullname: string;
  role: string;
  tokenType?: string | null;
}

export interface AccountResponse {
  id: number;
  email: string;
  fullname: string;
  role: string;
  status: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', data);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error.response?.data || error.message);
      throw error;
    }
  },

  getCurrentAccount: async (): Promise<AccountResponse> => {
    try {
      const response = await api.get<AccountResponse>('/api/accounts/me');
      console.log('Get current account response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get current account API error:', error.response?.data || error.message);
      throw error;
    }
  },
};
