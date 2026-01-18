'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, RotateCcw } from 'lucide-react';

export default function ExerciseTypesPage() {
  const [exerciseTypes, setExerciseTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingExerciseType, setEditingExerciseType] = useState<any>(null);

  const fetchExerciseTypes = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (search) params.search = search;
      if (includeDeleted) params.includeDeleted = true;

      const response = await adminApi.exerciseTypes.getAll(params);
      console.log('Exercise types API response:', response);
      
      const apiResponse = response.data;
      if (apiResponse && apiResponse.data) {
        const pageResponse = apiResponse.data;
        setExerciseTypes(pageResponse.content || []);
        setTotalPages(pageResponse.pageable?.totalPages || 0);
        setTotalElements(pageResponse.pageable?.totalElements || 0);
      } else {
        console.error('Unexpected response structure:', response);
        setExerciseTypes([]);
      }
    } catch (error: any) {
      console.error('Error fetching exercise types:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error ||
                      `Lỗi ${error.response?.status}: ${error.response?.statusText}` ||
                      'Lỗi khi tải danh sách loại bài tập';
      toast.error(errorMsg);
      setExerciseTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExerciseTypes();
  }, [page, search, includeDeleted]);

  const handleCreate = () => {
    setEditingExerciseType(null);
    setShowModal(true);
  };

  const handleEdit = (exerciseType: any) => {
    setEditingExerciseType(exerciseType);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa loại bài tập này?')) return;

    try {
      await adminApi.exerciseTypes.delete(id);
      toast.success('Xóa loại bài tập thành công');
      fetchExerciseTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa loại bài tập');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await adminApi.exerciseTypes.restore(id);
      toast.success('Khôi phục loại bài tập thành công');
      fetchExerciseTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi khôi phục loại bài tập');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Quản lý {'>'} Loại bài tập</div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Loại Bài tập</h1>
          <p className="text-gray-600 mt-1">
            Quản lý các loại bài tập và giá trị MET (Metabolic Equivalent of Task) trong hệ thống.
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
                  placeholder="Tìm kiếm theo tên hoạt động..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Bao gồm đã xóa</span>
              </label>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Thêm loại bài tập
              </button>
            </div>
          </div>
        </div>

        {/* Exercise Types Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoạt động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ví dụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị MET
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
                ) : exerciseTypes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  exerciseTypes.map((exerciseType) => (
                    <tr key={exerciseType.id} className={`hover:bg-gray-50 ${exerciseType.deleted ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{exerciseType.activity || 'N/A'}</div>
                        <div className="text-xs text-gray-500">ID: {exerciseType.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{exerciseType.examples || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{exerciseType.metValue || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {exerciseType.deleted ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Đã xóa
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {exerciseType.deleted ? (
                            <button
                              onClick={() => handleRestore(exerciseType.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Khôi phục"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(exerciseType)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(exerciseType.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
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

        {/* Exercise Type Modal */}
        {showModal && (
          <ExerciseTypeModal
            exerciseType={editingExerciseType}
            onClose={() => {
              setShowModal(false);
              setEditingExerciseType(null);
            }}
            onSuccess={() => {
              fetchExerciseTypes();
              setShowModal(false);
              setEditingExerciseType(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Exercise Type Modal Component
function ExerciseTypeModal({ exerciseType, onClose, onSuccess }: { exerciseType: any; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    activity: exerciseType?.activity || '',
    examples: exerciseType?.examples || '',
    metValue: exerciseType?.metValue?.toString() || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = {
        activity: formData.activity,
        examples: formData.examples || null,
        metValue: parseFloat(formData.metValue),
      };

      if (exerciseType) {
        await adminApi.exerciseTypes.update(exerciseType.id, data);
        toast.success('Cập nhật loại bài tập thành công');
      } else {
        await adminApi.exerciseTypes.create(data);
        toast.success('Tạo loại bài tập thành công');
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
            {exerciseType ? 'Chỉnh sửa loại bài tập' : 'Thêm loại bài tập mới'}
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
              Tên hoạt động <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              placeholder="Ví dụ: Chạy bộ, Đi bộ..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ví dụ
            </label>
            <textarea
              value={formData.examples}
              onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
              rows={3}
              placeholder="Mô tả các ví dụ về hoạt động này..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá trị MET <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              step="0.1"
              min="0"
              value={formData.metValue}
              onChange={(e) => setFormData({ ...formData, metValue: e.target.value })}
              placeholder="Ví dụ: 3.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
            <p className="mt-1 text-xs text-gray-500">
              MET (Metabolic Equivalent of Task) - Đơn vị đo cường độ hoạt động thể chất
            </p>
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
              {loading ? 'Đang xử lý...' : exerciseType ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
