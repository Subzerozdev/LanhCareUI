'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi, AdminUserResponse, AdminCreateUserRequest, AdminUpdateUserRequest } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, Eye, Filter, Download } from 'lucide-react';
import UserModal from '@/components/users/UserModal';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        size: 20,
        sortBy: 'id',
        sortDir: 'DESC',
      };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await adminApi.users.getAll(params);
      console.log('Users API response:', response);
      
      // Backend trả về: ApiResponse<PageResponse<AdminUserResponse>>
      // Axios response: { data: ApiResponse }
      // ApiResponse: { status: int, message: string, data: PageResponse }
      // PageResponse: { content: [], pageable: {...} }
      
      const apiResponse = response.data;
      if (apiResponse && apiResponse.data) {
        const pageResponse = apiResponse.data;
        setUsers(pageResponse.content || []);
        setTotalPages(pageResponse.pageable?.totalPages || 0);
        setTotalElements(pageResponse.pageable?.totalElements || 0);
      } else {
        console.error('Unexpected response structure:', {
          response,
          apiResponse,
          hasData: !!apiResponse?.data,
        });
        toast.error('Cấu trúc dữ liệu không đúng');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      let errorMsg = 'Lỗi khi tải danh sách người dùng';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle enum parsing errors (500 from backend)
        // Lỗi này xảy ra vì backend đang serialize healthProfile khi không cần thiết
        if (error.response.status === 500) {
          if (errorData.message?.includes('No enum constant') || 
              errorData.message?.includes('HealthGoal')) {
            // Extract invalid enum value from error message
            const enumMatch = errorData.message?.match(/No enum constant .+?\.(.+)/);
            const invalidValue = enumMatch ? enumMatch[1] : 'unknown';
            errorMsg = `Lỗi backend: Backend đang load healthProfile không cần thiết khi list users. Giá trị enum không hợp lệ trong database: "${invalidValue}". Vui lòng liên hệ quản trị viên backend để sửa.`;
            console.error('Backend issue: Loading healthProfile when listing users:', {
              invalidValue,
              suggestion: 'Backend should not load healthProfile in getAllUsers()',
            });
          } else {
            errorMsg = errorData.message || 
                      errorData.error || 
                      `Lỗi server (500): ${errorData.message || 'Lỗi không xác định'}`;
          }
        } else {
          errorMsg = errorData.message || 
                    errorData.error || 
                    errorData.userFriendlyMessage ||
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

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: AdminUserResponse) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      await adminApi.users.delete(id);
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
  };

  const handleChangeStatus = async (id: number, status: string) => {
    try {
      await adminApi.users.changeStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'USER':
        return 'bg-gray-100 text-gray-800';
      case 'STAFF':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'DELETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Trang chủ / Người dùng</div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý quyền truy cập, vai trò và trạng thái của tất cả người dùng trong hệ thống.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="">Tất cả vai trò</option>
                <option value="ADMIN">Quản trị</option>
                <option value="USER">Người dùng</option>
                <option value="STAFF">Nhân viên</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
                <option value="SUSPENDED">Tạm khóa</option>
                <option value="DELETED">Đã xóa</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Thêm người dùng
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giao dịch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng chi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold">
                              {user.fullname?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(String(user.role || ''))}`}>
                          {String(user.role || '').toUpperCase() === 'ADMIN' ? 'QUẢN TRỊ' : 
                           String(user.role || '').toUpperCase() === 'STAFF' ? 'NHÂN VIÊN' : 'NGƯỜI DÙNG'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(String(user.status || ''))}`}>
                          {String(user.status || '').toUpperCase() === 'ACTIVE' ? 'Hoạt động' : 
                           String(user.status || '').toUpperCase() === 'INACTIVE' ? 'Ngừng hoạt động' :
                           String(user.status || '').toUpperCase() === 'SUSPENDED' ? 'Tạm khóa' : 
                           String(user.status || '').toUpperCase() === 'DELETED' ? 'Đã xóa' : String(user.status || 'N/A')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.transactionCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.totalSpent ? new Intl.NumberFormat('vi-VN').format(user.totalSpent) : '0'} ₫
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {page * 20 + 1} đến {Math.min((page + 1) * 20, totalElements)} trong tổng số {totalElements} kết quả
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = page < 3 ? i : page > totalPages - 3 ? totalPages - 5 + i : page - 2 + i;
                  if (pageNum < 0 || pageNum >= totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 border rounded-lg ${
                        page === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Tiếp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}
    </AdminLayout>
  );
}
