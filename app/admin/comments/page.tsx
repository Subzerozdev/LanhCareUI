'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Search, Check, X, Filter, Eye, RotateCcw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function CommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (search) params.search = search;
      
      let response;
      if (activeTab === 'pending') {
        response = await adminApi.comments.getAll({ ...params, status: 'PENDING' });
      } else if (activeTab === 'approved') {
        response = await adminApi.comments.getAll({ ...params, status: 'APPROVED' });
      } else if (activeTab === 'rejected') {
        response = await adminApi.comments.getAll({ ...params, status: 'REJECTED' });
      } else {
        response = await adminApi.comments.getAll(params);
      }

      console.log('Comments API response:', response);
      
      if (response.data && response.data.data) {
        const pageResponse = response.data.data;
        setComments(pageResponse.content || []);
        setTotalPages(pageResponse.pageable?.totalPages || 0);
        setTotalElements(pageResponse.pageable?.totalElements || 0);
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
  }, [activeTab, search, page]);

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

  const handleViewDetail = async (id: number) => {
    try {
      const response = await adminApi.comments.getById(id);
      if (response.data && response.data.data) {
        setSelectedComment(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải chi tiết bình luận');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    try {
      await adminApi.comments.delete(id);
      toast.success('Xóa bình luận thành công');
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa bình luận');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await adminApi.comments.restore(id);
      toast.success('Khôi phục bình luận thành công');
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi khôi phục bình luận');
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
                      {comment.postTitle && (
                        <div className="mt-2 text-sm text-gray-500">
                          Bài viết: {comment.postTitle}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(comment.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {comment.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(comment.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Duyệt"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject(comment.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Từ chối"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {comment.isDeleted && (
                        <button
                          onClick={() => handleRestore(comment.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Khôi phục"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      )}
                      {!comment.isDeleted && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

        {/* Comment Detail Modal */}
        {showDetailModal && selectedComment && (
          <CommentDetailModal
            comment={selectedComment}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedComment(null);
            }}
            onApprove={() => {
              handleApprove(selectedComment.id);
              setShowDetailModal(false);
            }}
            onReject={() => {
              handleReject(selectedComment.id);
              setShowDetailModal(false);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function CommentDetailModal({ comment, onClose, onApprove, onReject }: { comment: any; onClose: () => void; onApprove: () => void; onReject: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết bình luận</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
            <p className="text-gray-900">{comment.authorName || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              comment.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              comment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {comment.status === 'APPROVED' ? 'Đã duyệt' :
               comment.status === 'PENDING' ? 'Chờ duyệt' : 'Bị từ chối'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
            <p className="text-gray-900">
              {comment.createdAt ? format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
            </p>
          </div>

          {comment.postTitle && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bài viết</label>
              <p className="text-gray-900">{comment.postTitle}</p>
            </div>
          )}

          {comment.rejectionReason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối</label>
              <p className="text-red-600">{comment.rejectionReason}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-900">
              {comment.content || '-'}
            </div>
          </div>

          {comment.status === 'PENDING' && (
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
