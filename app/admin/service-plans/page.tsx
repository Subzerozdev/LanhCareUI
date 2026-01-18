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

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params: any = { page: 0, size: 100 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await adminApi.servicePlans.getAll(params);
      console.log('Service plans API response:', response);
      
      if (response.data && response.data.data) {
        setPlans(response.data.data.content || []);
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
  }, [search, statusFilter]);

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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
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
                    <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Edit className="h-4 w-4" />
                      Chỉnh sửa
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
