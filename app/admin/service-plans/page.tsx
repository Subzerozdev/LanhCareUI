'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, Filter } from 'lucide-react';

export default function ServicePlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await adminApi.servicePlans.getAll(params);
      console.log('Service plans API response:', response);
      
      if (response.data && response.data.data) {
        const pageResponse = response.data.data;
        setPlans(pageResponse.content || []);
        setTotalPages(pageResponse.pageable?.totalPages || 0);
        setTotalElements(pageResponse.pageable?.totalElements || 0);
      } else {
        console.error('Unexpected response structure:', response);
        setPlans([]);
      }
    } catch (error: any) {
      console.error('Error fetching service plans:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error ||
                      `Lỗi ${error.response?.status}: ${error.response?.statusText}` ||
                      'Lỗi khi tải danh sách gói dịch vụ';
      toast.error(errorMsg);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [search, statusFilter, page]);

  const handleCreate = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) return;
    try {
      await adminApi.servicePlans.delete(id);
      toast.success('Xóa gói dịch vụ thành công');
      fetchPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa gói dịch vụ');
    }
  };

  const handleChangeStatus = async (id: number, status: string) => {
    try {
      await adminApi.servicePlans.changeStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchPlans();
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Cài đặt / Gói dịch vụ</div>
          <h1 className="text-3xl font-bold text-gray-900">Cấu hình gói dịch vụ</h1>
          <p className="text-gray-600 mt-1">
            Quản lý các gói đăng ký và mức giá cho bệnh nhân.
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
                  placeholder="vd: Gói cao cấp..."
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Trạng thái: Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
              </select>
              <button 
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tạo gói mới
              </button>
            </div>
          </div>
        </div>

        {/* Service Plans Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Không có gói dịch vụ nào</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {plan.status === 'ACTIVE' && (
                  <div className="bg-blue-600 text-white text-center py-1 text-xs font-semibold">
                    PHỔ BIẾN
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                      {plan.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat('vi-VN').format(plan.price)} ₫
                    </div>
                    <div className="text-sm text-gray-500">
                      / {plan.periodUnit === 'MONTH' ? 'Tháng' : 'Năm'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Thời hạn {plan.periodValue} {plan.periodUnit === 'MONTH' ? 'ngày' : 'ngày'}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button 
                      onClick={() => handleEdit(plan)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Chỉnh sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(plan.id)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
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

        {/* Service Plan Modal */}
        {showModal && (
          <ServicePlanModal
            plan={editingPlan}
            onClose={() => {
              setShowModal(false);
              setEditingPlan(null);
            }}
            onSuccess={() => {
              fetchPlans();
              setShowModal(false);
              setEditingPlan(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function ServicePlanModal({ plan, onClose, onSuccess }: { plan: any; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    price: plan?.price?.toString() || '',
    periodValue: plan?.periodValue?.toString() || '1',
    periodUnit: plan?.periodUnit || 'MONTH',
    status: plan?.status || 'ACTIVE',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        periodValue: parseInt(formData.periodValue),
        periodUnit: formData.periodUnit,
        status: formData.status,
      };

      if (plan) {
        await adminApi.servicePlans.update(plan.id, data);
        toast.success('Cập nhật gói dịch vụ thành công');
      } else {
        await adminApi.servicePlans.create(data);
        toast.success('Tạo gói dịch vụ thành công');
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {plan ? 'Chỉnh sửa gói dịch vụ' : 'Tạo gói dịch vụ mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên gói <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời hạn <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.periodValue}
                onChange={(e) => setFormData({ ...formData, periodValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.periodUnit}
                onChange={(e) => setFormData({ ...formData, periodUnit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="MONTH">Tháng</option>
                <option value="YEAR">Năm</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
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
              {loading ? 'Đang xử lý...' : plan ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
