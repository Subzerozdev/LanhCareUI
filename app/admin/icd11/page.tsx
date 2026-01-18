'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, Book, Code, Languages } from 'lucide-react';

export default function ICD11Page() {
  const [activeTab, setActiveTab] = useState<'chapters' | 'codes' | 'translations'>('chapters');
  const [chapters, setChapters] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [translations, setTranslations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (search) params.search = search;

      const response = await adminApi.icd11.chapters.getAll(params);
      const apiResponse = response.data;
      if (apiResponse && apiResponse.data) {
        const pageResponse = apiResponse.data;
        setChapters(pageResponse.content || []);
        setTotalPages(pageResponse.pageable?.totalPages || 0);
        setTotalElements(pageResponse.pageable?.totalElements || 0);
      }
    } catch (error: any) {
      console.error('Error fetching chapters:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách chapters');
    } finally {
      setLoading(false);
    }
  };

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (search) params.search = search;

      const response = await adminApi.icd11.codes.getAll(params);
      const apiResponse = response.data;
      if (apiResponse && apiResponse.data) {
        const pageResponse = apiResponse.data;
        setCodes(pageResponse.content || []);
        setTotalPages(pageResponse.pageable?.totalPages || 0);
        setTotalElements(pageResponse.pageable?.totalElements || 0);
      }
    } catch (error: any) {
      console.error('Error fetching codes:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách codes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTranslations = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (search) params.search = search;

      const response = await adminApi.icd11.translations.getAll(params);
      const apiResponse = response.data;
      if (apiResponse && apiResponse.data) {
        const pageResponse = apiResponse.data;
        setTranslations(pageResponse.content || []);
        setTotalPages(pageResponse.pageable?.totalPages || 0);
        setTotalElements(pageResponse.pageable?.totalElements || 0);
      }
    } catch (error: any) {
      console.error('Error fetching translations:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách translations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'chapters') fetchChapters();
    else if (activeTab === 'codes') fetchCodes();
    else if (activeTab === 'translations') fetchTranslations();
  }, [activeTab, page, search]);

  const handleDelete = async (uri: string, type: 'chapters' | 'codes') => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
    try {
      if (type === 'chapters') {
        await adminApi.icd11.chapters.update(uri, { status: 'DEPRECATED' });
        toast.success('Xóa chapter thành công');
        fetchChapters();
      } else {
        await adminApi.icd11.codes.update(uri, { status: 'DEPRECATED' });
        toast.success('Xóa code thành công');
        fetchCodes();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-600 mb-2">Tổng quan {'>'} Cài đặt {'>'} Quản lý ICD-11</div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý mã bệnh ICD-11</h1>
          <p className="text-gray-600 mt-1">
            Cơ sở dữ liệu tập trung cho phân loại và dịch thuật mã bệnh quốc tế.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 px-6">
              <button
                onClick={() => setActiveTab('chapters')}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'chapters'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Chapters
                </div>
              </button>
              <button
                onClick={() => setActiveTab('codes')}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'codes'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Codes
                </div>
              </button>
              <button
                onClick={() => setActiveTab('translations')}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'translations'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Translations
                </div>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Thêm mới
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'chapters' && (
              <ChaptersTable
                chapters={chapters}
                loading={loading}
                onDelete={(uri) => handleDelete(uri, 'chapters')}
              />
            )}
            {activeTab === 'codes' && (
              <CodesTable
                codes={codes}
                loading={loading}
                onDelete={(uri) => handleDelete(uri, 'codes')}
              />
            )}
            {activeTab === 'translations' && (
              <TranslationsTable
                translations={translations}
                loading={loading}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
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
        </div>
      </div>
    </AdminLayout>
  );
}

function ChaptersTable({ chapters, loading, onDelete }: { chapters: any[]; loading: boolean; onDelete: (uri: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URI</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Đang tải...</td>
            </tr>
          ) : chapters.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Không có dữ liệu</td>
            </tr>
          ) : (
            chapters.map((chapter) => (
              <tr key={chapter.uri} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{chapter.uri}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{chapter.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{chapter.description || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    chapter.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {chapter.status || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(chapter.uri)} className="text-red-600 hover:text-red-900">
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
  );
}

function CodesTable({ codes, loading, onDelete }: { codes: any[]; loading: boolean; onDelete: (uri: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URI</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Đang tải...</td>
            </tr>
          ) : codes.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Không có dữ liệu</td>
            </tr>
          ) : (
            codes.map((code) => (
              <tr key={code.icdUri} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{code.icdUri}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{code.code || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{code.title || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{code.chapterUri || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    code.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {code.status || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(code.icdUri)} className="text-red-600 hover:text-red-900">
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
  );
}

function TranslationsTable({ translations, loading }: { translations: any[]; loading: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ICD Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngôn ngữ</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bản dịch</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Đang tải...</td>
            </tr>
          ) : translations.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Không có dữ liệu</td>
            </tr>
          ) : (
            translations.map((translation) => (
              <tr key={translation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{translation.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{translation.icdUri || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{translation.language || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{translation.translatedText || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    translation.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {translation.status || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
