'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, Filter, Eye } from 'lucide-react';

export default function DietaryRestrictionsPage() {
  const [restrictions, setRestrictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingRestriction, setEditingRestriction] = useState<any>(null);
  const [selectedRestriction, setSelectedRestriction] = useState<any>(null);

  const fetchRestrictions = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await adminApi.dietaryRestrictions.getAll(params);
      console.log('Dietary restrictions API response:', response);
      
      const apiResponse = response.data;
      if (apiResponse && apiResponse.data) {
        const pageResponse = apiResponse.data;
        setRestrictions(pageResponse.content || []);
        setTotalPages(pageResponse.pageable?.totalPages || 0);
        setTotalElements(pageResponse.pageable?.totalElements || 0);
      } else {
        console.error('Unexpected response structure:', response);
        setRestrictions([]);
      }
    } catch (error: any) {
      console.error('Error fetching dietary restrictions:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error ||
                      `Lỗi ${error.response?.status}: ${error.response?.statusText}` ||
                      'Lỗi khi tải danh sách hạn chế dinh dưỡng';
      toast.error(errorMsg);
      setRestrictions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestrictions();
  }, [page, search, statusFilter]);

  const handleCreate = () => {
    setEditingRestriction(null);
    setShowModal(true);
  };

  const handleEdit = (restriction: any) => {
    setEditingRestriction(restriction);
    setShowModal(true);
  };

  const handleViewDetail = async (id: number) => {
    try {
      const response = await adminApi.dietaryRestrictions.getById(id);
      setSelectedRestriction(response.data.data);
      setShowDetailModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải chi tiết');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hạn chế dinh dưỡng này?')) return;

    try {
      await adminApi.dietaryRestrictions.delete(id);
      toast.success('Xóa hạn chế dinh dưỡng thành công');
      fetchRestrictions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa hạn chế dinh dưỡng');
    }
  };

  const handleChangeStatus = async (id: number, status: string) => {
    try {
      await adminApi.dietaryRestrictions.changeStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchRestrictions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'TEMPORARY':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'INACTIVE':
        return 'Ngừng hoạt động';
      case 'TEMPORARY':
        return 'Tạm thời';
      case 'EXPIRED':
        return 'Hết hạn';
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Quản lý {'>'} Hạn chế dinh dưỡng</div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Hạn chế Dinh dưỡng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý các hạn chế dinh dưỡng của người dùng trong hệ thống.
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
                  placeholder="Tìm kiếm theo tên hoặc mô tả..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
                <option value="TEMPORARY">Tạm thời</option>
                <option value="EXPIRED">Hết hạn</option>
              </select>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Thêm hạn chế
              </button>
            </div>
          </div>
        </div>

        {/* Restrictions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên hạn chế
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại hạn chế
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : restrictions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  restrictions.map((restriction) => (
                    <tr key={restriction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{restriction.name || 'Chưa có tên'}</div>
                          <div className="text-sm text-gray-500">{restriction.description || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{restriction.accountEmail || 'N/A'}</div>
                        <div className="text-xs text-gray-500">ID: {restriction.accountId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {restriction.limitType || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {restriction.limitValue ? `${restriction.limitValue} ${restriction.limitUnit || ''}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(String(restriction.status || ''))}`}>
                          {getStatusLabel(String(restriction.status || ''))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(restriction.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(restriction)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(restriction.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
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
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Restriction Modal */}
        {showModal && (
          <RestrictionModal
            restriction={editingRestriction}
            onClose={() => {
              setShowModal(false);
              setEditingRestriction(null);
            }}
            onSuccess={() => {
              fetchRestrictions();
              setShowModal(false);
              setEditingRestriction(null);
            }}
          />
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedRestriction && (
          <DetailModal
            restriction={selectedRestriction}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedRestriction(null);
            }}
            onChangeStatus={handleChangeStatus}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Restriction Modal Component
function RestrictionModal({ restriction, onClose, onSuccess }: { restriction: any; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userHealthProfileId: restriction?.userHealthProfileId || '',
    nutrientId: restriction?.nutrientId || '',
    icdUri: restriction?.icdUri || '',
    name: restriction?.name || '',
    description: restriction?.description || '',
    limitType: restriction?.limitType || 'MAX',
    limitValue: restriction?.limitValue?.toString() || '',
    limitUnit: restriction?.limitUnit || '',
    frequency: restriction?.frequency || 'DAILY',
    status: restriction?.status || 'ACTIVE',
    sourceOfAdvice: restriction?.sourceOfAdvice || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = {
        userHealthProfileId: parseInt(formData.userHealthProfileId),
        name: formData.name,
        description: formData.description || null,
        limitType: formData.limitType,
        limitUnit: formData.limitUnit || null,
        frequency: formData.frequency,
        status: formData.status,
        sourceOfAdvice: formData.sourceOfAdvice || null,
      };
      
      if (formData.limitValue) {
        data.limitValue = parseFloat(formData.limitValue);
      }
      if (formData.nutrientId) {
        data.nutrientId = parseInt(formData.nutrientId);
      }
      if (formData.icdUri) {
        data.icdUri = formData.icdUri;
      }

      if (restriction) {
        await adminApi.dietaryRestrictions.update(restriction.id, data);
        toast.success('Cập nhật hạn chế dinh dưỡng thành công');
      } else {
        await adminApi.dietaryRestrictions.create(data);
        toast.success('Tạo hạn chế dinh dưỡng thành công');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {restriction ? 'Chỉnh sửa hạn chế dinh dưỡng' : 'Thêm hạn chế dinh dưỡng mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Hồ sơ sức khỏe <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.userHealthProfileId}
                onChange={(e) => setFormData({ ...formData, userHealthProfileId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Dinh dưỡng
              </label>
              <input
                type="number"
                value={formData.nutrientId}
                onChange={(e) => setFormData({ ...formData, nutrientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URI ICD-11
            </label>
            <input
              type="text"
              value={formData.icdUri}
              onChange={(e) => setFormData({ ...formData, icdUri: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên hạn chế
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại hạn chế
              </label>
              <select
                value={formData.limitType}
                onChange={(e) => setFormData({ ...formData, limitType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="MAX">Tối đa</option>
                <option value="MIN">Tối thiểu</option>
                <option value="AVOID">Tránh</option>
                <option value="RECOMMENDED">Khuyến nghị</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá trị
              </label>
              <input
                type="number"
                step="any"
                value={formData.limitValue}
                onChange={(e) => setFormData({ ...formData, limitValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị
              </label>
              <input
                type="text"
                value={formData.limitUnit}
                onChange={(e) => setFormData({ ...formData, limitUnit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tần suất
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="DAILY">Hàng ngày</option>
                <option value="WEEKLY">Hàng tuần</option>
                <option value="MONTHLY">Hàng tháng</option>
                <option value="PER_MEAL">Mỗi bữa ăn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
                <option value="TEMPORARY">Tạm thời</option>
                <option value="EXPIRED">Hết hạn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nguồn tư vấn
            </label>
            <input
              type="text"
              value={formData.sourceOfAdvice}
              onChange={(e) => setFormData({ ...formData, sourceOfAdvice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
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
              {loading ? 'Đang xử lý...' : restriction ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Detail Modal Component
function DetailModal({ restriction, onClose, onChangeStatus }: { restriction: any; onClose: () => void; onChangeStatus: (id: number, status: string) => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết Hạn chế Dinh dưỡng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <div className="text-sm text-gray-900">{restriction.id}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Tên</label>
              <div className="text-sm text-gray-900">{restriction.name || 'N/A'}</div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Mô tả</label>
              <div className="text-sm text-gray-900">{restriction.description || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Loại hạn chế</label>
              <div className="text-sm text-gray-900">{restriction.limitType || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Giá trị</label>
              <div className="text-sm text-gray-900">
                {restriction.limitValue ? `${restriction.limitValue} ${restriction.limitUnit || ''}` : 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Tần suất</label>
              <div className="text-sm text-gray-900">{restriction.frequency || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
              <div className="text-sm text-gray-900">{restriction.status || 'N/A'}</div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Nguồn tư vấn</label>
              <div className="text-sm text-gray-900">{restriction.sourceOfAdvice || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email người dùng</label>
              <div className="text-sm text-gray-900">{restriction.accountEmail || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ID Dinh dưỡng</label>
              <div className="text-sm text-gray-900">{restriction.nutrientId || 'N/A'}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Thay đổi trạng thái</label>
            <select
              onChange={(e) => {
                onChangeStatus(restriction.id, e.target.value);
                onClose();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            >
              <option value="">Chọn trạng thái...</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
              <option value="TEMPORARY">Tạm thời</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
