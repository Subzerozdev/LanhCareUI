import { create } from 'zustand';
import { authApi, AccountResponse } from '@/lib/auth';

interface AuthState {
  token: string | null;
  user: AccountResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('Calling login API...');
          }
          const response = await authApi.login({ email, password });
          if (process.env.NODE_ENV === 'development') {
            console.log('Login API response:', response);
          }
          
          // Kiểm tra role phải là ADMIN
          if (response.role !== 'ADMIN') {
            set({ isLoading: false });
            throw new Error('Chỉ quản trị viên mới được phép truy cập');
          }

          // Lấy token từ accessToken hoặc token (fallback)
          const token = response.accessToken || response.token;
          if (!token) {
            throw new Error('Token không tồn tại trong response');
          }

          // Tạo account object từ login response
          const account: AccountResponse = {
            id: response.userId || response.id || 0,
            email: response.email,
            fullname: response.fullname,
            role: response.role,
            status: 'ACTIVE', // Mặc định ACTIVE, có thể lấy từ API sau
          };

          // Lưu token và user vào localStorage TRƯỚC khi set state
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(account));
          }
          
          // Set state
          set({
            token: token,
            user: account,
            isAuthenticated: true,
            isLoading: false,
          });

          if (process.env.NODE_ENV === 'development') {
            console.log('Login successful, state updated');
          }
          
          // Không cần gọi getCurrentAccount vì endpoint có thể có vấn đề
          // Thông tin từ login response đã đủ
        } catch (error: any) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Login error:', error);
          }
          set({ isLoading: false, isAuthenticated: false, token: null, user: null });
          // Xóa token nếu có lỗi
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          throw error;
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      },

      checkAuth: async () => {
        if (typeof window === 'undefined') return;
        
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        try {
          // Parse user từ localStorage
          const user = JSON.parse(userStr);
          
          // Kiểm tra role
          if (user.role !== 'ADMIN') {
            throw new Error('Không có quyền truy cập');
          }
          
          // Set state từ localStorage (không cần gọi API)
          set({
            token,
            user,
            isAuthenticated: true,
          });
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Auth check successful from localStorage');
          }
        } catch (error: any) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Check auth error:', error);
          }
          set({ isAuthenticated: false, user: null, token: null });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      },
    })
  );
