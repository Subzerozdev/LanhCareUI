'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { adminApi, AdminUserResponse, AdminCreateUserRequest, AdminUpdateUserRequest } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface UserModalProps {
  user: AdminUserResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface UserForm {
  email: string;
  fullname: string;
  password?: string;
  role: string;
  status: string;
}

export default function UserModal({ user, onClose, onSuccess }: UserModalProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserForm>();

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        status: user.status,
      });
    } else {
      reset({
        email: '',
        fullname: '',
        password: '',
        role: 'USER',
        status: 'ACTIVE',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UserForm) => {
    setLoading(true);
    try {
      if (user) {
        // Update
        const updateData: AdminUpdateUserRequest = {
          fullname: data.fullname,
          role: data.role,
          status: data.status,
        };
        await adminApi.users.update(user.id, updateData);
        toast.success('Cập nhật người dùng thành công');
      } else {
        // Create
        if (!data.password) {
          toast.error('Vui lòng nhập mật khẩu');
          setLoading(false);
          return;
        }
        const createData: AdminCreateUserRequest = {
          email: data.email,
          fullname: data.fullname,
          password: data.password,
          role: data.role,
          status: data.status,
        };
        await adminApi.users.create(createData);
        toast.success('Tạo người dùng thành công');
      }
      onSuccess();
    } catch (error: any) {
      console.error('User modal error:', error);
      let errorMsg = 'Có lỗi xảy ra';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle enum parsing errors
        if (errorData.message?.includes('No enum constant')) {
          errorMsg = 'Lỗi định dạng dữ liệu. Vui lòng kiểm tra lại vai trò và trạng thái.';
        } else {
          errorMsg = errorData.message || 
                    errorData.error || 
                    `Lỗi ${error.response.status}: ${error.response.statusText}` ||
                    errorMsg;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {!user && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ',
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: !user ? 'Mật khẩu là bắt buộc' : false,
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự',
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('fullname', { required: 'Họ và tên là bắt buộc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
            {errors.fullname && (
              <p className="mt-1 text-sm text-red-600">{errors.fullname.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              {...register('role', { required: 'Vai trò là bắt buộc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            >
              <option value="USER">Người dùng</option>
              <option value="STAFF">Nhân viên</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              {...register('status', { required: 'Trạng thái là bắt buộc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
              <option value="SUSPENDED">Tạm khóa</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : user ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
