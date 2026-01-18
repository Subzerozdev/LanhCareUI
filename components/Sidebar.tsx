'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Package,
  DollarSign,
  Building2,
  FileCode,
  UtensilsCrossed,
  Settings,
  LogOut,
  ShieldAlert,
  Dumbbell,
  Stethoscope,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const menuItems = [
  {
    title: 'Tổng quan',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'QUẢN LÝ',
    isHeader: true,
  },
  {
    title: 'Người dùng',
    icon: Users,
    href: '/admin/users',
  },
  {
    title: 'Bệnh viện',
    icon: Building2,
    href: '/admin/hospitals',
  },
  {
    title: 'Bài viết',
    icon: FileText,
    href: '/admin/posts',
    badge: '12',
  },
  {
    title: 'Bình luận',
    icon: MessageSquare,
    href: '/admin/comments',
  },
  {
    title: 'ICD-11',
    icon: FileCode,
    href: '/admin/icd11',
  },
  {
    title: 'Dinh dưỡng',
    icon: UtensilsCrossed,
    href: '/admin/nutrition',
  },
  {
    title: 'Hạn chế dinh dưỡng',
    icon: ShieldAlert,
    href: '/admin/dietary-restrictions',
  },
  {
    title: 'Loại bài tập',
    icon: Dumbbell,
    href: '/admin/exercise-types',
  },
  {
    title: 'Chuyên khoa y tế',
    icon: Stethoscope,
    href: '/admin/medical-specialties',
  },
  {
    title: 'TÀI CHÍNH',
    isHeader: true,
  },
  {
    title: 'Doanh thu',
    icon: DollarSign,
    href: '/admin/revenue',
  },
  {
    title: 'Gói dịch vụ',
    icon: Package,
    href: '/admin/service-plans',
  },
  {
    title: 'Cài đặt',
    icon: Settings,
    href: '/admin/settings',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl font-bold">+</span>
        </div>
        <div>
          <div className="font-bold text-gray-900">LanhCare</div>
          <div className="text-xs text-gray-500">Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item, index) => {
          if (item.isHeader) {
            return (
              <div key={index} className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {item.title}
              </div>
            );
          }

          if (!item.href) return null;

          const Icon = item.icon!;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={index}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {user?.fullname?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.fullname || 'Admin User'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
