'use client';

import AdminLayout from '@/components/AdminLayout';

export default function HospitalsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Bệnh viện</h1>
          <p className="text-gray-600 mt-1">
            Hệ thống quản trị LanhCare Admin chuyên nghiệp cho y tế.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Trang quản lý bệnh viện đang được phát triển...
        </div>
      </div>
    </AdminLayout>
  );
}
