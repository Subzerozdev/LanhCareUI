'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  // Không cần useEffect này nữa vì sẽ redirect sau khi login thành công

  const onSubmit = async (data: LoginForm) => {
    try {
      console.log('Bắt đầu đăng nhập với email:', data.email);
      await login(data.email, data.password);
      
      // Kiểm tra state sau khi login
      const state = useAuthStore.getState();
      if (process.env.NODE_ENV === 'development') {
        console.log('State sau khi login:', {
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          token: state.token ? 'Có token' : 'Không có token',
        });
      }
      
      if (state.isAuthenticated && state.user?.role === 'ADMIN') {
        toast.success('Đăng nhập thành công!');
        // Redirect ngay lập tức (không cần router.refresh)
        router.push('/dashboard');
      } else {
        throw new Error('Đăng nhập thành công nhưng không có quyền truy cập');
      }
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (error.response) {
        // Server trả về lỗi
        console.error('Response error:', error.response.data);
        errorMessage = error.response.data?.message || 
                     error.response.data?.error || 
                     `Lỗi ${error.response.status}: ${error.response.statusText}` ||
                     errorMessage;
      } else if (error.message) {
        // Lỗi từ code
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo và Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập Admin</h1>
          <p className="text-gray-500 text-sm">Hệ thống quản trị LanhCare</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                {...register('email', {
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ',
                  },
                })}
                placeholder="admin@lanhcare.com"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                  },
                })}
                placeholder="••••••••••"
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="flex items-center justify-end">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Lock className="h-4 w-4 mr-2" />
            <span>Bảo mật chuẩn y tế HIPAA</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-xs text-gray-400">
          © 2024 LanhCare Systems. Đã đăng ký bản quyền.
        </div>
      </div>
    </div>
  );
}
