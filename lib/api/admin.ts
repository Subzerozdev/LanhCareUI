import api from '../api';

// Types
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// User Management
export interface AdminUserResponse {
  id: number;
  email: string;
  fullname: string;
  role: string;
  status: string;
  transactionCount: number;
  totalSpent: number;
}

export interface AdminUserDetailResponse {
  id: number;
  email: string;
  fullname: string;
  role: string;
  status: string;
  healthProfile?: {
    heightCm?: number;
    currentWeightKg?: number;
    bmi?: number;
    activityLevel?: string;
    // Handle any unexpected fields gracefully
    [key: string]: any;
  };
  recentTransactions?: Array<{
    id: number;
    amount: number;
    status: string;
    transactionDate: string;
    [key: string]: any;
  }>;
  totalTransactionCount: number;
  totalSpent: number;
  mealLogCount: number;
}

export interface AdminCreateUserRequest {
  email: string;
  fullname: string;
  password: string;
  role: string;
  status: string;
}

export interface AdminUpdateUserRequest {
  fullname?: string;
  role?: string;
  status?: string;
}

export const adminApi = {
  // Users
  users: {
    getAll: async (params?: any) => {
      try {
        // Backend có thể throw 500 nếu có enum value không hợp lệ trong healthProfile
        // Thử request với params đơn giản hơn
        const response = await api.get<ApiResponse<PageResponse<AdminUserResponse>>>('/api/admin/users', { params });
        if (process.env.NODE_ENV === 'development') {
          console.log('Users getAll response:', response.data);
        }
        // Backend trả về ApiResponse<T>, response.data là ApiResponse
        // response.data.data là PageResponse<AdminUserResponse>
        return response;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Users getAll error:', error);
        }
        
        // Nếu là 500 error do enum parsing, thử lại với smaller page size
        if (error.response?.status === 500 && 
            error.response?.data?.message?.includes('No enum constant')) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Retrying with smaller page size due to enum parsing error');
          }
          try {
            const retryParams = { ...params, size: 10, page: 0 };
            const retryResponse = await api.get<ApiResponse<PageResponse<AdminUserResponse>>>('/api/admin/users', { params: retryParams });
            if (process.env.NODE_ENV === 'development') {
              console.log('Retry successful:', retryResponse.data);
            }
            return retryResponse;
          } catch (retryError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Retry also failed:', retryError);
            }
            throw error; // Throw original error
          }
        }
        
        throw error;
      }
    },
    getById: async (id: number) => {
      try {
        const response = await api.get<ApiResponse<AdminUserDetailResponse>>(`/api/admin/users/${id}`);
        if (process.env.NODE_ENV === 'development') {
          console.log('Users getById response:', response.data);
        }
        return response;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Users getById error:', error);
        }
        throw error;
      }
    },
    create: async (data: AdminCreateUserRequest) => {
      try {
        // Ensure enum values are strings
        const requestData = {
          ...data,
          role: data.role, // Should be string like "USER", "ADMIN", "STAFF"
          status: data.status || 'ACTIVE', // Should be string like "ACTIVE", "INACTIVE", etc.
        };
        if (process.env.NODE_ENV === 'development') {
          console.log('Users create request:', requestData);
        }
        const response = await api.post<ApiResponse<AdminUserResponse>>('/api/admin/users', requestData);
        if (process.env.NODE_ENV === 'development') {
          console.log('Users create response:', response.data);
        }
        return response;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Users create error:', error);
        }
        throw error;
      }
    },
    update: async (id: number, data: AdminUpdateUserRequest) => {
      try {
        // Ensure enum values are strings
        const requestData: any = {};
        if (data.fullname !== undefined) requestData.fullname = data.fullname;
        if (data.role !== undefined) requestData.role = data.role; // Should be string
        if (data.status !== undefined) requestData.status = data.status; // Should be string
        if (process.env.NODE_ENV === 'development') {
          console.log('Users update request:', requestData);
        }
        const response = await api.put<ApiResponse<AdminUserResponse>>(`/api/admin/users/${id}`, requestData);
        if (process.env.NODE_ENV === 'development') {
          console.log('Users update response:', response.data);
        }
        return response;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Users update error:', error);
        }
        throw error;
      }
    },
    changeStatus: async (id: number, status: string) => {
      try {
        const response = await api.patch<ApiResponse<AdminUserResponse>>(`/api/admin/users/${id}/status`, { status });
        return response;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Users changeStatus error:', error);
        }
        throw error;
      }
    },
    delete: async (id: number) => {
      try {
        const response = await api.delete<ApiResponse<void>>(`/api/admin/users/${id}`);
        return response;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Users delete error:', error);
        }
        throw error;
      }
    },
  },

  // Posts
  posts: {
    getAll: (params?: any) =>
      api.get<ApiResponse<PageResponse<any>>>('/api/admin/posts', { params }),
    getById: (id: number) =>
      api.get<ApiResponse<any>>(`/api/admin/posts/${id}`),
    approve: (id: number) =>
      api.patch<ApiResponse<any>>(`/api/admin/posts/${id}/approve`),
    reject: (id: number, reason: string) =>
      api.patch<ApiResponse<any>>(`/api/admin/posts/${id}/reject`, { rejectionReason: reason }),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/api/admin/posts/${id}`),
    restore: (id: number) =>
      api.patch<ApiResponse<any>>(`/api/admin/posts/${id}/restore`),
    getStats: (params?: any) =>
      api.get<ApiResponse<any>>('/api/admin/posts/stats', { params }),
  },

  // Comments
  comments: {
    getAll: (params?: any) =>
      api.get<ApiResponse<PageResponse<any>>>('/api/admin/comments', { params }),
    getById: (id: number) =>
      api.get<ApiResponse<any>>(`/api/admin/comments/${id}`),
    approve: (id: number) =>
      api.patch<ApiResponse<any>>(`/api/admin/comments/${id}/approve`),
    reject: (id: number, reason: string) =>
      api.patch<ApiResponse<any>>(`/api/admin/comments/${id}/reject`, { rejectionReason: reason }),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/api/admin/comments/${id}`),
    restore: (id: number) =>
      api.patch<ApiResponse<any>>(`/api/admin/comments/${id}/restore`),
  },

  // Service Plans
  servicePlans: {
    getAll: (params?: any) =>
      api.get<ApiResponse<PageResponse<any>>>('/api/admin/service-plans', { params }),
    getById: (id: number) =>
      api.get<ApiResponse<any>>(`/api/admin/service-plans/${id}`),
    create: (data: any) =>
      api.post<ApiResponse<any>>('/api/admin/service-plans', data),
    update: (id: number, data: any) =>
      api.put<ApiResponse<any>>(`/api/admin/service-plans/${id}`, data),
    changeStatus: (id: number, status: string) =>
      api.patch<ApiResponse<any>>(`/api/admin/service-plans/${id}/status`, { status }),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/api/admin/service-plans/${id}`),
  },

  // Revenue
  revenue: {
    getTransactions: (params?: any) =>
      api.get<ApiResponse<PageResponse<any>>>('/api/admin/revenue/transactions', { params }),
    getTransactionById: (id: number) =>
      api.get<ApiResponse<any>>(`/api/admin/revenue/transactions/${id}`),
    createTransaction: (data: any) =>
      api.post<ApiResponse<any>>('/api/admin/revenue/transactions', data),
    updateTransactionStatus: (id: number, status: string) =>
      api.patch<ApiResponse<any>>(`/api/admin/revenue/transactions/${id}/status`, { status }),
    getStatistics: (params?: any) =>
      api.get<ApiResponse<any>>('/api/admin/revenue/statistics', { params }),
    export: (format: string, params?: any) =>
      api.get(`/api/admin/revenue/export?format=${format}`, { params, responseType: 'blob' }),
  },

  // Hospitals
  hospitals: {
    getAll: (params?: any) =>
      api.get<ApiResponse<PageResponse<any>>>('/api/admin/hospitals', { params }),
    getById: (id: number) =>
      api.get<ApiResponse<any>>(`/api/admin/hospitals/${id}`),
    create: (data: any) =>
      api.post<ApiResponse<any>>('/api/admin/hospitals', data),
    update: (id: number, data: any) =>
      api.put<ApiResponse<any>>(`/api/admin/hospitals/${id}`, data),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/api/admin/hospitals/${id}`),
  },

  // ICD-11
  icd11: {
    chapters: {
      getAll: (params?: any) =>
        api.get<ApiResponse<PageResponse<any>>>('/api/admin/icd11/chapters', { params }),
      getByUri: (uri: string) =>
        api.get<ApiResponse<any>>(`/api/admin/icd11/chapters/${encodeURIComponent(uri)}`),
      create: (data: any) =>
        api.post<ApiResponse<any>>('/api/admin/icd11/chapters', data),
      update: (uri: string, data: any) =>
        api.put<ApiResponse<any>>(`/api/admin/icd11/chapters/${encodeURIComponent(uri)}`, data),
    },
    codes: {
      getAll: (params?: any) =>
        api.get<ApiResponse<PageResponse<any>>>('/api/admin/icd11/codes', { params }),
      getByUri: (uri: string) =>
        api.get<ApiResponse<any>>(`/api/admin/icd11/codes/${encodeURIComponent(uri)}`),
      create: (data: any) =>
        api.post<ApiResponse<any>>('/api/admin/icd11/codes', data),
      update: (uri: string, data: any) =>
        api.put<ApiResponse<any>>(`/api/admin/icd11/codes/${encodeURIComponent(uri)}`, data),
    },
    translations: {
      getAll: (params?: any) =>
        api.get<ApiResponse<PageResponse<any>>>('/api/admin/icd11/translations', { params }),
      getById: (id: number) =>
        api.get<ApiResponse<any>>(`/api/admin/icd11/translations/${id}`),
      create: (data: any) =>
        api.post<ApiResponse<any>>('/api/admin/icd11/translations', data),
      update: (id: number, data: any) =>
        api.put<ApiResponse<any>>(`/api/admin/icd11/translations/${id}`, data),
    },
  },

  // Nutrition
  nutrition: {
    foodItems: {
      getAll: (params?: any) =>
        api.get<ApiResponse<PageResponse<any>>>('/api/admin/nutrition/food-items', { params }),
      getById: (id: number) =>
        api.get<ApiResponse<any>>(`/api/admin/nutrition/food-items/${id}`),
      create: (data: any) =>
        api.post<ApiResponse<any>>('/api/admin/nutrition/food-items', data),
      update: (id: number, data: any) =>
        api.put<ApiResponse<any>>(`/api/admin/nutrition/food-items/${id}`, data),
      delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/api/admin/nutrition/food-items/${id}`),
    },
    foodTypes: {
      getAll: () =>
        api.get<ApiResponse<any[]>>('/api/admin/nutrition/food-types'),
      create: (data: any) =>
        api.post<ApiResponse<any>>('/api/admin/nutrition/food-types', data),
      update: (id: number, data: any) =>
        api.put<ApiResponse<any>>(`/api/admin/nutrition/food-types/${id}`, data),
      delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/api/admin/nutrition/food-types/${id}`),
    },
    nutrients: {
      getAll: () =>
        api.get<ApiResponse<any[]>>('/api/admin/nutrition/nutrients'),
      getById: (id: number) =>
        api.get<ApiResponse<any>>(`/api/admin/nutrition/nutrients/${id}`),
      create: (data: any) =>
        api.post<ApiResponse<any>>('/api/admin/nutrition/nutrients', data),
      update: (id: number, data: any) =>
        api.put<ApiResponse<any>>(`/api/admin/nutrition/nutrients/${id}`, data),
      delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/api/admin/nutrition/nutrients/${id}`),
    },
  },

  // Dietary Restrictions
  dietaryRestrictions: {
    getAll: (params?: any) =>
      api.get<ApiResponse<PageResponse<any>>>('/api/admin/dietary-restrictions', { params }),
    getById: (id: number) =>
      api.get<ApiResponse<any>>(`/api/admin/dietary-restrictions/${id}`),
    create: (data: any) =>
      api.post<ApiResponse<any>>('/api/admin/dietary-restrictions', data),
    update: (id: number, data: any) =>
      api.put<ApiResponse<any>>(`/api/admin/dietary-restrictions/${id}`, data),
    changeStatus: (id: number, status: string) =>
      api.patch<ApiResponse<any>>(`/api/admin/dietary-restrictions/${id}/status?status=${status}`),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/api/admin/dietary-restrictions/${id}`),
  },

  // Exercise Types
  exerciseTypes: {
    getAll: (params?: any) =>
      api.get<ApiResponse<PageResponse<any>>>('/api/admin/exercise-types', { params }),
    getById: (id: number) =>
      api.get<ApiResponse<any>>(`/api/admin/exercise-types/${id}`),
    create: (data: any) =>
      api.post<ApiResponse<any>>('/api/admin/exercise-types', data),
    update: (id: number, data: any) =>
      api.put<ApiResponse<any>>(`/api/admin/exercise-types/${id}`, data),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/api/admin/exercise-types/${id}`),
    restore: (id: number) =>
      api.patch<ApiResponse<any>>(`/api/admin/exercise-types/${id}/restore`),
  },

  // Medical Specialties
  medicalSpecialties: {
    getAll: (params?: any) =>
      api.get<ApiResponse<PageResponse<any>>>('/api/admin/medical-specialties', { params }),
    getById: (id: number) =>
      api.get<ApiResponse<any>>(`/api/admin/medical-specialties/${id}`),
    create: (data: any) =>
      api.post<ApiResponse<any>>('/api/admin/medical-specialties', data),
    update: (id: number, data: any) =>
      api.put<ApiResponse<any>>(`/api/admin/medical-specialties/${id}`, data),
    changeStatus: (id: number, status: string) =>
      api.patch<ApiResponse<any>>(`/api/admin/medical-specialties/${id}/status?status=${status}`),
    delete: (id: number) =>
      api.delete<ApiResponse<void>>(`/api/admin/medical-specialties/${id}`),
  },
};
