'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, Filter, Building2 } from 'lucide-react';

export default function MedicalSpecialtiesPage() {
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<any>(null);

  const fetchHospitals = async () => {
    try {
      const response = await adminApi.hospitals.getAll({ page: 0, size: 100 });
      if (response.data && response.data.data) {
        setHospitals(response.data.data.content || []);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (hospitalFilter) params.hospitalId = parseInt(hospitalFilter);

      const response = await adminApi.medicalSpecialties.getAll(params);
      console.log('Medical specialties API response:', response);
      
      const apiResponse = response.data;
      if (apiResponse && apiResponse.data) {
        const pageResponse = apiResponse.data;
        setSpecialties(pageResponse.content || []);
        setTotalPages(pageResponse.pageable?.totalPages || 0);
        setTotalElements(pageResponse.pageable?.totalElements || 0);
      } else {
        console.error('Unexpected response structure:', response);
        setSpecialties([]);
      }
    } catch (error: any) {
      console.error('Error fetching medical specialties:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error ||
                      `Lỗi ${error.response?.status}: ${error.response?.statusText}` ||
                      'Lỗi khi tải danh sách chuyên khoa';
      toast.error(errorMsg);
      setSpecialties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    fetchSpecialties();
  }, [page, search, statusFilter, hospitalFilter]);

  const handleCreate = () => {
    setEditingSpecialty(null);
    setShowModal(true);
  };

  const handleEdit = (specialty: any) => {
    setEditingSpecialty(specialty);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chuyên khoa này?')) return;

    try {
      await adminApi.medicalSpecialties.delete(id);
      toast.success('Xóa chuyên khoa thành công');
      fetchSpecialties();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa chuyên khoa');
    }
  };

  const handleChangeStatus = async (id: number, status: string) => {
    try {
      await adminApi.medicalSpecialties.changeStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchSpecialties();
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
      case 'TEMPORARILY_UNAVAILABLE':
        return 'bg-yellow-100 text-yellow-800';
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
      case 'TEMPORARILY_UNAVAILABLE':
        return 'Tạm thời không có';
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Quản lý {'>'} Chuyên khoa y tế</div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Chuyên khoa Y tế</h1>
          <p className="text-gray-600 mt-1">
            Quản lý các chuyên khoa y tế của bệnh viện trong hệ thống.
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
                  placeholder="Tìm kiếm theo tên chuyên khoa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={hospitalFilter}
                onChange={(e) => setHospitalFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="">Tất cả bệnh viện</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
                <option value="TEMPORARILY_UNAVAILABLE">Tạm thời không có</option>
              </select>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Thêm chuyên khoa
              </button>
            </div>
          </div>
        </div>

        {/* Specialties Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên chuyên khoa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh viện
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã ICD-11
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
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : specialties.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  specialties.map((specialty) => (
                    <tr key={specialty.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{specialty.nameVn || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{specialty.nameEn || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">{specialty.hospitalName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{specialty.hospitalAddress || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {specialty.icdCode ? (
                          <div>
                            <div className="text-sm text-gray-900">{specialty.icdCode}</div>
                            <div className="text-xs text-gray-500">{specialty.icdTitle || ''}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Chưa có</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(String(specialty.status || ''))}`}>
                          {getStatusLabel(String(specialty.status || ''))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(specialty)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(specialty.id)}
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

        {/* Specialty Modal */}
        {showModal && (
          <SpecialtyModal
            specialty={editingSpecialty}
            hospitals={hospitals}
            onClose={() => {
              setShowModal(false);
              setEditingSpecialty(null);
            }}
            onSuccess={() => {
              fetchSpecialties();
              setShowModal(false);
              setEditingSpecialty(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Specialty Modal Component
function SpecialtyModal({ specialty, hospitals, onClose, onSuccess }: { specialty: any; hospitals: any[]; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalId: specialty?.hospitalId?.toString() || '',
    nameVn: specialty?.nameVn || '',
    nameEn: specialty?.nameEn || '',
    icdUri: specialty?.icdUri || '',
    status: specialty?.status || 'ACTIVE',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = {
        hospitalId: parseInt(formData.hospitalId),
        nameVn: formData.nameVn,
        nameEn: formData.nameEn,
        status: formData.status,
      };
      
      if (formData.icdUri) {
        data.icdUri = formData.icdUri;
      }

      if (specialty) {
        await adminApi.medicalSpecialties.update(specialty.id, data);
        toast.success('Cập nhật chuyên khoa thành công');
      } else {
        await adminApi.medicalSpecialties.create(data);
        toast.success('Tạo chuyên khoa thành công');
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
            {specialty ? 'Chỉnh sửa chuyên khoa' : 'Thêm chuyên khoa mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bệnh viện <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.hospitalId}
              onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            >
              <option value="">Chọn bệnh viện...</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên tiếng Việt <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nameVn}
              onChange={(e) => setFormData({ ...formData, nameVn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên tiếng Anh <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URI ICD-11
            </label>
            <input
              type="text"
              value={formData.icdUri}
              onChange={(e) => setFormData({ ...formData, icdUri: e.target.value })}
              placeholder="Ví dụ: http://id.who.int/icd/entity/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
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
              <option value="TEMPORARILY_UNAVAILABLE">Tạm thời không có</option>
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
              {loading ? 'Đang xử lý...' : specialty ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
