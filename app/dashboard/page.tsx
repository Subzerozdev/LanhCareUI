'use client';

import AdminLayout from '@/components/AdminLayout';
import { Users, FileText, DollarSign, Package, TrendingUp, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import Link from 'next/link';
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
  primary: '#3b82f6',      // Blue - Trust, Professional
  success: '#10b981',      // Green - Health, Growth
  warning: '#f59e0b',      // Amber - Attention
  info: '#60a5fa',         // Light Blue - Information
  purple: '#a78bfa',       // Purple - Premium
  teal: '#14b8a6',        // Teal - Secondary
  red: '#ef4444',          // Red - Alert
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.info, CHART_COLORS.purple];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingPosts: 0,
    monthlyRevenue: 0,
    activePlans: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [servicePlanRevenue, setServicePlanRevenue] = useState<any[]>([]);
  const [userDistribution, setUserDistribution] = useState<any[]>([]);
  const [postStats, setPostStats] = useState({
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    rejectedPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Tính date range cho 6 tháng gần nhất để lấy revenue by month
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // Fetch tất cả stats song song (parallel)
        const [usersRes, postsRes, revenueRes, plansRes, postStatsRes] = await Promise.allSettled([
          adminApi.users.getAll({ page: 0, size: 1000 }), // Lấy nhiều để tính distribution
          adminApi.posts.getAll({ page: 0, size: 1 }),
          adminApi.revenue.getStatistics({ startDate: startDateStr, endDate: endDateStr }),
          adminApi.servicePlans.getAll({ status: 'ACTIVE', page: 0, size: 1 }),
          adminApi.posts.getStats(),
        ]);

        // Process users
        if (usersRes.status === 'fulfilled') {
          const apiResponse = usersRes.value.data;
          const users = apiResponse?.data?.content || [];
          const totalUsers = apiResponse?.data?.pageable?.totalElements || 0;
          setStats(prev => ({ ...prev, totalUsers }));

          // Tính phân bố theo role
          const roleCount: Record<string, number> = {};
          users.forEach((user: any) => {
            const role = user.role || 'USER';
            roleCount[role] = (roleCount[role] || 0) + 1;
          });

          const distribution = Object.entries(roleCount).map(([role, count]) => ({
            name: role === 'ADMIN' ? 'Quản trị viên' : role === 'STAFF' ? 'Nhân viên' : 'Người dùng',
            value: count,
            role,
          }));
          setUserDistribution(distribution);
        }

        // Process posts
        if (postsRes.status === 'fulfilled') {
          const apiResponse = postsRes.value.data;
          const pendingPosts = apiResponse?.data?.pageable?.totalElements || 0;
          setStats(prev => ({ ...prev, pendingPosts }));
        }

        // Process revenue
        if (revenueRes.status === 'fulfilled') {
          const apiResponse = revenueRes.value.data;
          const revenueStats = apiResponse?.data;
          const monthlyRevenue = revenueStats?.totalRevenue || 0;
          setStats(prev => ({ ...prev, monthlyRevenue }));

          // Format revenue by month data
          if (revenueStats?.revenueByMonth) {
            const formatted = revenueStats.revenueByMonth.map((item: any) => ({
              month: item.month || '',
              revenue: item.revenue ? parseFloat(item.revenue.toString()) : 0,
              transactions: item.transactionCount || 0,
            }));
            setRevenueData(formatted);
          }

          // Format service plan revenue
          if (revenueStats?.revenueByServicePlan) {
            const formatted = revenueStats.revenueByServicePlan.map((item: any) => ({
              name: item.servicePlanName || `Gói ${item.servicePlanId}`,
              revenue: item.revenue ? parseFloat(item.revenue.toString()) : 0,
              transactions: item.transactionCount || 0,
            }));
            setServicePlanRevenue(formatted);
          }
        }

        // Process plans
        if (plansRes.status === 'fulfilled') {
          const apiResponse = plansRes.value.data;
          const activePlans = apiResponse?.data?.pageable?.totalElements || 0;
          setStats(prev => ({ ...prev, activePlans }));
        }

        // Process post stats
        if (postStatsRes.status === 'fulfilled') {
          const apiResponse = postStatsRes.value.data;
          const stats = apiResponse?.data;
          if (stats) {
            setPostStats({
              totalPosts: stats.totalPosts || 0,
              pendingPosts: stats.pendingPosts || 0,
              approvedPosts: stats.approvedPosts || 0,
              rejectedPosts: stats.rejectedPosts || 0,
            });
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching stats:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
              {entry.name}: {entry.name.includes('Doanh thu') ? formatCurrency(entry.value) : entry.value}
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan Dashboard LanhCare</h1>
          <p className="text-gray-600 mt-1">Hệ thống quản trị LanhCare Admin chuyên nghiệp cho y tế.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Tổng người dùng</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>↑ 12% so với tháng trước</span>
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-lg p-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">Bài viết chờ duyệt</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">
                  {loading ? '...' : stats.pendingPosts}
                </p>
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Cần xử lý</span>
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Doanh thu tháng này</p>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {loading ? '...' : formatCurrency(stats.monthlyRevenue)}
                </p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>↑ +8.2% Tăng trưởng</span>
                </p>
              </div>
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Gói dịch vụ đang hoạt động</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {loading ? '...' : stats.activePlans.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-2">Cập nhật vừa xong</p>
              </div>
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <Package className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1: Revenue Trend & User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Xu hướng Doanh thu</h2>
                <p className="text-sm text-gray-600 mt-1">Doanh thu theo tháng</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_COLORS.success}
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    name="Doanh thu"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </div>

          {/* User Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Phân bố Người dùng</h2>
                <p className="text-sm text-gray-600 mt-1">Theo vai trò trong hệ thống</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : userDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span style={{ color: '#374151' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chưa có dữ liệu người dùng
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2: Posts Status & Service Plan Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Posts Status Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Trạng thái Bài viết</h2>
                <p className="text-sm text-gray-600 mt-1">Phân bố bài viết theo trạng thái</p>
              </div>
              <Link
                href="/admin/posts"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem tất cả
              </Link>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={[
                    { name: 'Chờ duyệt', value: postStats.pendingPosts },
                    { name: 'Đã duyệt', value: postStats.approvedPosts },
                    { name: 'Từ chối', value: postStats.rejectedPosts },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {[
                      { name: 'Chờ duyệt', value: postStats.pendingPosts, color: CHART_COLORS.warning },
                      { name: 'Đã duyệt', value: postStats.approvedPosts, color: CHART_COLORS.success },
                      { name: 'Từ chối', value: postStats.rejectedPosts, color: CHART_COLORS.red },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Service Plan Revenue Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Doanh thu theo Gói dịch vụ</h2>
                <p className="text-sm text-gray-600 mt-1">Phân tích doanh thu từng gói</p>
              </div>
              <Link
                href="/admin/service-plans"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem tất cả
              </Link>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : servicePlanRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={servicePlanRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" radius={[0, 8, 8, 0]} fill={CHART_COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chưa có dữ liệu doanh thu theo gói
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Posts */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bài viết mới cần duyệt</h2>
                <p className="text-sm text-gray-600 mt-1">Xem xét và kiểm duyệt nội dung gửi đến.</p>
              </div>
              <Link
                href="/admin/posts?status=PENDING"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Đang tải...</div>
                ) : stats.pendingPosts === 0 ? (
                  <div className="text-center py-8 text-gray-500">Không có bài viết chờ duyệt</div>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-amber-600 mb-2">{stats.pendingPosts}</div>
                      <div className="text-sm text-gray-600">bài viết đang chờ duyệt</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h2>
                <p className="text-sm text-gray-600 mt-1">Hoạt động tài chính mới nhất.</p>
              </div>
              <Link
                href="/admin/revenue"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-600 text-center py-8">
                  Xem chi tiết trong trang Doanh thu
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
