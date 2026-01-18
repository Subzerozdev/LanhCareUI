'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Search, Check, X, Eye, Filter, RotateCcw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (search) params.search = search;
      if (activeTab === 'pending') {
        const response = await adminApi.posts.getAll({ ...params, status: 'PENDING' });
        handleResponse(response);
        return;
      } else if (activeTab === 'approved') {
        const response = await adminApi.posts.getAll({ ...params, status: 'APPROVED' });
        handleResponse(response);
        return;
      } else if (activeTab === 'rejected') {
        const response = await adminApi.posts.getAll({ ...params, status: 'REJECTED' });
        handleResponse(response);
        return;
      }

      const response = await adminApi.posts.getAll(params);
      handleResponse(response);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error ||
                      `Lỗi ${error.response?.status}: ${error.response?.statusText}` ||
                      'Lỗi khi tải danh sách bài viết';
      toast.error(errorMsg);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (response: any) => {
    console.log('Posts API response:', response);
    if (response.data && response.data.data) {
      const pageResponse = response.data.data;
      setPosts(pageResponse.content || []);
      setTotalPages(pageResponse.pageable?.totalPages || 0);
      setTotalElements(pageResponse.pageable?.totalElements || 0);
    } else {
      console.error('Unexpected response structure:', response);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab, search, page]);

  const handleApprove = async (id: number) => {
    try {
      await adminApi.posts.approve(id);
      toast.success('Duyệt bài viết thành công');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi duyệt bài viết');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      await adminApi.posts.reject(id, reason);
      toast.success('Từ chối bài viết thành công');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi từ chối bài viết');
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const response = await adminApi.posts.getById(id);
      if (response.data && response.data.data) {
        setSelectedPost(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải chi tiết bài viết');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await adminApi.posts.delete(id);
      toast.success('Xóa bài viết thành công');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa bài viết');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await adminApi.posts.restore(id);
      toast.success('Khôi phục bài viết thành công');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi khôi phục bài viết');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Nội dung {'>'} Bài viết</div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài viết</h1>
          <p className="text-gray-600 mt-1">
            Xem xét, phê duyệt hoặc từ chối các bài viết sức khỏe do người dùng gửi.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'pending'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Chờ duyệt
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'approved'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Đã duyệt
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'rejected'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bị từ chối
              </button>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Lọc
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tác giả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tương tác
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày đăng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {post.content?.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-blue-600 text-xs font-semibold">
                              {post.authorName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-900">{post.authorName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                          {post.status === 'APPROVED' ? 'Đã duyệt' :
                           post.status === 'PENDING' ? 'Chờ duyệt' : 'Bị từ chối'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>👍 {post.heart || 0}</span>
                          <span>💬 {post.commentCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {post.createdAt ? format(new Date(post.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {post.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(post.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Duyệt"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(post.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Từ chối"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleViewDetail(post.id)}
                            className="text-blue-600 hover:text-blue-900" 
                            title="Xem"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {post.isDeleted && (
                            <button
                              onClick={() => handleRestore(post.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Khôi phục"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                          {!post.isDeleted && (
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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

        {/* Post Detail Modal */}
        {showDetailModal && selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedPost(null);
            }}
            onApprove={() => {
              handleApprove(selectedPost.id);
              setShowDetailModal(false);
            }}
            onReject={() => {
              handleReject(selectedPost.id);
              setShowDetailModal(false);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function PostDetailModal({ post, onClose, onApprove, onReject }: { post: any; onClose: () => void; onApprove: () => void; onReject: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết bài viết</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
            <p className="text-gray-900">{post.authorName || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              post.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {post.status === 'APPROVED' ? 'Đã duyệt' :
               post.status === 'PENDING' ? 'Chờ duyệt' : 'Bị từ chối'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
            <p className="text-gray-900">
              {post.createdAt ? format(new Date(post.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
            </p>
          </div>

          {post.rejectionReason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối</label>
              <p className="text-red-600">{post.rejectionReason}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
              {post.content || '-'}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>👍 {post.heart || 0}</span>
            <span>💬 {post.commentCount || 0}</span>
          </div>

          {post.status === 'PENDING' && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onApprove}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Duyệt
              </button>
              <button
                onClick={onReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Từ chối
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
