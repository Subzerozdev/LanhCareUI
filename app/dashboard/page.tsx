'use client';

import AdminLayout from '@/components/AdminLayout';
import { Users, FileText, DollarSign, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingPosts: 0,
    monthlyRevenue: 0,
    activePlans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users
        try {
          const usersRes = await adminApi.users.getAll({ page: 0, size: 1 });
          console.log('Users response:', usersRes);
          // Response structure: response.data = ApiResponse, response.data.data = actual data
          const apiResponse = usersRes.data;
          const totalUsers = apiResponse?.data?.pageable?.totalElements || 0;
          setStats(prev => ({ ...prev, totalUsers }));
        } catch (error: any) {
          console.error('Error fetching users:', error.response?.data || error.message);
        }

        // Fetch pending posts
        try {
          const postsRes = await adminApi.posts.getAll({ status: 'PENDING', page: 0, size: 1 });
          console.log('Posts response:', postsRes);
          const apiResponse = postsRes.data;
          const pendingPosts = apiResponse?.data?.pageable?.totalElements || 0;
          setStats(prev => ({ ...prev, pendingPosts }));
        } catch (error: any) {
          console.error('Error fetching posts:', error.response?.data || error.message);
        }

        // Fetch revenue stats
        try {
          const revenueRes = await adminApi.revenue.getStatistics();
          console.log('Revenue response:', revenueRes);
          const apiResponse = revenueRes.data;
          const monthlyRevenue = apiResponse?.data?.totalRevenue || 0;
          setStats(prev => ({ ...prev, monthlyRevenue }));
        } catch (error: any) {
          console.error('Error fetching revenue:', error.response?.data || error.message);
        }

        // Fetch service plans
        try {
          const plansRes = await adminApi.servicePlans.getAll({ status: 'ACTIVE', page: 0, size: 1 });
          console.log('Plans response:', plansRes);
          const apiResponse = plansRes.data;
          const activePlans = apiResponse?.data?.pageable?.totalElements || 0;
          setStats(prev => ({ ...prev, activePlans }));
        } catch (error: any) {
          console.error('Error fetching plans:', error.response?.data || error.message);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <span>↑</span> 12% so với tháng trước
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bài viết chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? '...' : stats.pendingPosts}
                </p>
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <span>!</span> Cần xử lý
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doanh thu tháng này</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? '...' : formatCurrency(stats.monthlyRevenue)}
                </p>
                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <span>↑</span> +8.2% Tăng trưởng
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gói dịch vụ đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? '...' : stats.activePlans.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">Cập nhật 2 phút trước</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts & Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Posts */}
          <div className="bg-white rounded-lg shadow">
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
                  <div className="text-sm text-gray-600">
                    Có {stats.pendingPosts} bài viết đang chờ duyệt
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
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
                <div className="text-sm text-gray-600">
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
