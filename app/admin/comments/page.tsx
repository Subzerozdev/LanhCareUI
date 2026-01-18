'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Search, Check, X, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function CommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params: any = { page: 0, size: 20 };
      if (search) params.search = search;
      if (activeTab === 'pending') params.status = 'PENDING';
      else if (activeTab === 'approved') params.status = 'APPROVED';
      else if (activeTab === 'rejected') params.status = 'REJECTED';

      const response = await adminApi.comments.getAll(params);
      console.log('Comments API response:', response);
      
      if (response.data && response.data.data) {
        setComments(response.data.data.content || []);
      } else {
        console.error('Unexpected response structure:', response);
        setComments([]);
      }
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error ||
                      `Lỗi ${error.response?.status}: ${error.response?.statusText}` ||
                      'Lỗi khi tải danh sách bình luận';
      toast.error(errorMsg);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [activeTab, search]);

  const handleApprove = async (id: number) => {
    try {
      await adminApi.comments.approve(id);
      toast.success('Duyệt bình luận thành công');
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi duyệt bình luận');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      await adminApi.comments.reject(id, reason);
      toast.success('Từ chối bình luận thành công');
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi từ chối bình luận');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Duyệt bình luận</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và xem xét các bình luận của người dùng trên nền tảng để đảm bảo tuân thủ.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-1 border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
            >
              Tất cả ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
            >
              Chờ duyệt
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'approved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
            >
              Đã duyệt
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'rejected' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
            >
              Bị từ chối
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Không có bình luận nào</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {comment.authorName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{comment.authorName}</div>
                          <div className="text-sm text-gray-500">
                            {comment.createdAt ? format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                    {comment.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(comment.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(comment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
