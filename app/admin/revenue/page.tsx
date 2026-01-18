'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Download, Search, Filter, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function RevenuePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const [transRes, statsRes] = await Promise.all([
        adminApi.revenue.getTransactions(params),
        adminApi.revenue.getStatistics({
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
        }),
      ]);
      console.log('Revenue API responses:', { transRes, statsRes });
      
      if (transRes.data && transRes.data.data) {
        const pageResponse = transRes.data.data;
        setTransactions(pageResponse.content || []);
        setTotalPages(pageResponse.pageable?.totalPages || 0);
        setTotalElements(pageResponse.pageable?.totalElements || 0);
      }
      if (statsRes.data && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching revenue data:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error ||
                      `Lỗi ${error.response?.status}: ${error.response?.statusText}` ||
                      'Lỗi khi tải dữ liệu';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, startDate, endDate]);

  const handleExport = async (format: string) => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const response = await adminApi.revenue.export(format, params);
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: format === 'PDF' ? 'application/pdf' : 
              format === 'EXCEL' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${Date.now()}.${format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Xuất file ${format} thành công`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xuất file');
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const response = await adminApi.revenue.getTransactionById(id);
      if (response.data && response.data.data) {
        setSelectedTransaction(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải chi tiết giao dịch');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminApi.revenue.updateTransactionStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchData();
      setShowDetailModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-600 mb-2">Trang chủ / Tài chính</div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo tài chính</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi doanh thu, giám sát giao dịch và tải xuống báo cáo.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalRevenue ? formatCurrency(stats.totalRevenue) : '0 ₫'}
                </p>
                <p className="text-xs text-green-600 mt-2">+12%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                💳
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Số lượng giao dịch</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalTransactions || 0}
                </p>
                <p className="text-xs text-green-600 mt-2">+5%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                📄
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tỷ lệ thành công</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.completedTransactions && stats.totalTransactions
                    ? ((stats.completedTransactions / stats.totalTransactions) * 100).toFixed(1)
                    : '0'}%
                </p>
                <p className="text-xs text-green-600 mt-2">+1.2%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                ✅
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="">Tất cả</option>
                <option value="PENDING">Đang chờ</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="FAILED">Thất bại</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="REFUNDED">Đã hoàn tiền</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => handleExport('CSV')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
              <button
                onClick={() => handleExport('EXCEL')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={() => handleExport('PDF')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Giao dịch</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mã giao dịch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Gói dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phương thức
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày
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
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{txn.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-blue-600 text-xs">
                              {txn.userName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">{txn.userName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {txn.servicePlanName}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {txn.paymentMethod}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          txn.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {txn.status === 'COMPLETED' ? 'HOÀN THÀNH' :
                           txn.status === 'PENDING' ? 'ĐANG CHỜ' : txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {txn.transactionDate ? format(new Date(txn.transactionDate), 'dd/MM, HH:mm') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetail(txn.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
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

        {/* Transaction Detail Modal */}
        {showDetailModal && selectedTransaction && (
          <TransactionDetailModal
            transaction={selectedTransaction}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedTransaction(null);
            }}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function TransactionDetailModal({ transaction, onClose, onUpdateStatus }: { transaction: any; onClose: () => void; onUpdateStatus: (id: number, status: string) => void }) {
  const [newStatus, setNewStatus] = useState(transaction.status);

  const handleSubmit = () => {
    if (newStatus !== transaction.status) {
      onUpdateStatus(transaction.id, newStatus);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết giao dịch #{transaction.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Người dùng</label>
              <p className="text-gray-900">{transaction.userName || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gói dịch vụ</label>
              <p className="text-gray-900">{transaction.servicePlanName || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
              <p className="text-gray-900 font-semibold">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.amount || 0)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
              <p className="text-gray-900">{transaction.paymentMethod || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày giao dịch</label>
              <p className="text-gray-900">
                {transaction.transactionDate ? format(new Date(transaction.transactionDate), 'dd/MM/yyyy HH:mm') : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              >
                <option value="PENDING">Đang chờ</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="FAILED">Thất bại</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="REFUNDED">Đã hoàn tiền</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Đóng
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cập nhật trạng thái
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
