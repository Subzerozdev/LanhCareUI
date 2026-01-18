'use client';

import AdminLayout from '@/components/AdminLayout';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-gray-600 mt-1">Cấu hình hệ thống và tùy chọn.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Trang cài đặt đang được phát triển...
        </div>
      </div>
    </AdminLayout>
  );
}
