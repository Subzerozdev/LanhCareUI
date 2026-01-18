'use client';

import AdminLayout from '@/components/AdminLayout';

export default function NutritionPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Dinh dưỡng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý cơ sở dữ liệu cho kế hoạch dinh dưỡng bệnh nhân.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Trang quản lý dinh dưỡng đang được phát triển...
        </div>
      </div>
    </AdminLayout>
  );
}
