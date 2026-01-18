'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Download, Search, Filter, Eye, Edit, TrendingUp, Activity, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Màu sắc phù hợp với nghiệp vụ y tế
const CHART_COLORS = {
  primary: '#3b82f6',      // Blue
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Amber
  info: '#60a5fa',         // Light Blue
  purple: '#a78bfa',       // Purple
  teal: '#14b8a6',         // Teal
  red: '#ef4444',           // Red
  orange: '#f97316',       // Orange
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: CHART_COLORS.success,
  PENDING: CHART_COLORS.warning,
  FAILED: CHART_COLORS.red,
  CANCELLED: CHART_COLORS.red,
  REFUNDED: CHART_COLORS.orange,
};

export default function RevenuePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [transactionStatusData, setTransactionStatusData] = useState<any[]>([]);
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

      // Luôn gửi date range mặc định (6 tháng gần nhất) cho statistics để có dữ liệu biểu đồ
      // Backend yêu cầu format ISO DATE_TIME (LocalDateTime), không có timezone
      let statsStartDateStr: string | undefined;
      let statsEndDateStr: string | undefined;
      
      if (startDate && endDate) {
        // Nếu có date range từ filter, sử dụng nó
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Format: YYYY-MM-DDTHH:mm:ss (không có timezone, backend sẽ parse thành LocalDateTime)
        statsStartDateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}T00:00:00`;
        statsEndDateStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}T23:59:59`;
      } else {
        // Mặc định: 6 tháng gần nhất
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        // Đảm bảo startDate < endDate
        statsStartDateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}T00:00:00`;
        statsEndDateStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}T23:59:59`;
      }

      // Sử dụng Promise.allSettled để không bị fail nếu một trong hai API fail
      const [transRes, statsRes] = await Promise.allSettled([
        adminApi.revenue.getTransactions(params),
        adminApi.revenue.getStatistics({
          startDate: statsStartDateStr,
          endDate: statsEndDateStr,
        }),
      ]);
      if (process.env.NODE_ENV === 'development') {
        console.log('Revenue API responses:', { transRes, statsRes });
      }
      
      // Process transactions
      if (transRes.status === 'fulfilled' && transRes.value.data && transRes.value.data.data) {
        const pageResponse = transRes.value.data.data;
        setTransactions(pageResponse.content || []);
        setTotalPages(pageResponse.pageable?.totalPages || 0);
        setTotalElements(pageResponse.pageable?.totalElements || 0);
      } else if (transRes.status === 'rejected') {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching transactions:', transRes.reason);
        }
      }

      // Process statistics
      if (statsRes.status === 'fulfilled' && statsRes.value.data && statsRes.value.data.data) {
        const statsData = statsRes.value.data.data;
        setStats(statsData);

        // Format revenue by month data for chart
        if (statsData.revenueByMonth && statsData.revenueByMonth.length > 0) {
          const formatted = statsData.revenueByMonth.map((item: any) => ({
            month: item.month || '',
            revenue: item.revenue ? parseFloat(item.revenue.toString()) : 0,
            transactions: item.transactionCount || 0,
          }));
          setRevenueData(formatted);
        } else if (statsData.totalRevenue && statsData.totalRevenue > 0) {
          // Fallback: Nếu không có monthly data nhưng có tổng doanh thu, tạo một điểm dữ liệu từ tổng
          // Để hiển thị biểu đồ thay vì "Chưa có dữ liệu"
          const currentMonth = new Date().toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
          setRevenueData([{
            month: currentMonth,
            revenue: parseFloat(statsData.totalRevenue.toString()),
            transactions: statsData.totalTransactions || 0,
          }]);
        } else {
          // Không có dữ liệu gì cả
          setRevenueData([]);
        }

        // Format transaction status distribution for pie chart
        const statusData = [
          { name: 'Hoàn thành', value: statsData.completedTransactions || 0, status: 'COMPLETED' },
          { name: 'Đang chờ', value: statsData.pendingTransactions || 0, status: 'PENDING' },
          { name: 'Thất bại', value: statsData.failedTransactions || 0, status: 'FAILED' },
        ].filter(item => item.value > 0);
        setTransactionStatusData(statusData);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Revenue stats data:', {
            revenueByMonth: statsData.revenueByMonth,
            revenueData,
            transactionStatusData: statusData,
            totalRevenue: statsData.totalRevenue,
            totalTransactions: statsData.totalTransactions,
          });
        }
      } else if (statsRes.status === 'rejected') {
        // Nếu statistics API fail (500 error), vẫn hiển thị stats từ transactions nếu có
        const error = statsRes.reason;
        if (process.env.NODE_ENV === 'development') {
          console.warn('Statistics API failed:', error?.response?.status, error?.response?.data);
        }
        
        // Nếu là 500 error, có thể là do date range không hợp lệ hoặc backend issue
        // Set empty arrays để hiển thị "Chưa có dữ liệu" thay vì crash
        setRevenueData([]);
        setTransactionStatusData([]);
        
        // Vẫn hiển thị error toast để user biết
        if (error?.response?.status === 500) {
          toast.error('Lỗi khi tải thống kê doanh thu. Vui lòng thử lại sau.');
        }
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching revenue data:', error);
      }
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

  // Custom tooltip cho charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Doanh thu') || entry.name.includes('revenue') 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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

        {/* Stats Cards with Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Revenue Card with Chart */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-blue-700 font-medium">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {stats.totalRevenue ? formatCurrency(stats.totalRevenue) : '0 ₫'}
                </p>
                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12%</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenueCard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    fill="url(#colorRevenueCard)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-32 flex items-center justify-center text-blue-600 text-sm">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* Transaction Count Card with Chart */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-purple-700 font-medium">Số lượng giao dịch</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {stats.totalTransactions || 0}
                </p>
                <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>+5%</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={revenueData}>
                  <Bar dataKey="transactions" radius={[4, 4, 0, 0]} fill={CHART_COLORS.purple} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-32 flex items-center justify-center text-purple-600 text-sm">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* Success Rate Card with Pie Chart */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-green-700 font-medium">Tỷ lệ thành công</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {stats.completedTransactions && stats.totalTransactions
                    ? ((stats.completedTransactions / stats.totalTransactions) * 100).toFixed(1)
                    : '0'}%
                </p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>+1.2%</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : transactionStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={transactionStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {transactionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || CHART_COLORS.info} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-32 flex items-center justify-center text-green-600 text-sm">
                Chưa có dữ liệu
              </div>
            )}
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
