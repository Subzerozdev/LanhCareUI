import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lanhcare.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        // Đảm bảo token không có khoảng trắng thừa
        const cleanToken = token.trim();
        config.headers.Authorization = `Bearer ${cleanToken}`;
        
        // Log token info (chỉ trong dev)
        if (process.env.NODE_ENV === 'development') {
          try {
            // Simple JWT decode (không verify)
            const base64Url = cleanToken.split('.')[1];
            if (base64Url) {
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const decoded = JSON.parse(jsonPayload);
              console.log('✅ Request with token:', {
                url: config.url,
                method: config.method,
                email: decoded?.sub || decoded?.email,
                role: decoded?.role,
                exp: decoded?.exp ? new Date(decoded.exp * 1000).toLocaleString() : 'N/A',
                tokenLength: cleanToken.length,
                authorizationHeader: `Bearer ${cleanToken.substring(0, 20)}...`,
              });
            }
          } catch (e) {
            console.log('⚠️ Request with token (could not decode):', config.url);
          }
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.error('❌ Request WITHOUT token:', {
          url: config.url,
          method: config.method,
          localStorageToken: 'NULL',
        });
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => {
    // Try to handle enum parsing errors in response data
    try {
      if (response.data && typeof response.data === 'object') {
        // Recursively sanitize enum values that might cause issues
        sanitizeEnumValues(response.data);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error sanitizing response data:', e);
      }
    }
    return response;
  },
  (error) => {
    // Log lỗi để debug (chỉ trong dev)
    if (error.response && process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
      
      // Handle enum parsing errors (500 from backend)
      if (error.response.status === 500) {
        if (error.response.data?.message?.includes('No enum constant') || 
            error.response.data?.message?.includes('HealthGoal')) {
          console.error('❌ Enum parsing error detected:', error.response.data.message);
          // Extract enum name from error message
          const enumMatch = error.response.data.message?.match(/No enum constant (.+?)\.(.+)/);
          if (enumMatch) {
            const enumClass = enumMatch[1];
            const invalidValue = enumMatch[2];
            console.error('Invalid enum value:', {
              enumClass,
              invalidValue,
              suggestion: 'Cần sửa dữ liệu trong database hoặc cập nhật enum definition',
            });
          }
          // Provide user-friendly error message
          error.response.data.userFriendlyMessage = 'Lỗi dữ liệu trong database: Có giá trị enum không hợp lệ. Vui lòng liên hệ quản trị viên để sửa dữ liệu.';
        }
      }
    } else if (error.request) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Network Error:', error.request);
      }
      // Network error - có thể do timeout hoặc backend không phản hồi
      if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout. Vui lòng thử lại sau.';
      } else {
        error.message = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error.message);
    }

    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      if (process.env.NODE_ENV === 'development') {
        console.error('401 Unauthorized - Token invalid or expired');
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Chỉ redirect nếu không phải đang ở trang login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.response?.status === 403 && process.env.NODE_ENV === 'development') {
      // Forbidden - Không có quyền truy cập (chỉ log trong dev)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const errorData = error.response?.data;
      
      console.error('❌ 403 Forbidden - Access denied', {
        url: error.config?.url,
        method: error.config?.method,
        token: token ? token.substring(0, 30) + '...' : 'No token in localStorage',
        response: errorData,
      });
    }
    return Promise.reject(error);
  }
);

// Helper function to sanitize enum values in response data
function sanitizeEnumValues(obj: any): void {
  if (!obj || typeof obj !== 'object') return;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      // If value looks like an enum but might be invalid, try to handle it
      if (typeof value === 'string' && (value.includes('HealthGo') || value.includes('No enum constant'))) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Potentially invalid enum value detected: ${key} = ${value}`);
        }
        // Don't modify, just log - let backend handle validation
      }
      
      // Recursively process nested objects and arrays
      if (Array.isArray(value)) {
        value.forEach(item => sanitizeEnumValues(item));
      } else if (typeof value === 'object' && value !== null) {
        sanitizeEnumValues(value);
      }
    }
  }
}

export default api;
