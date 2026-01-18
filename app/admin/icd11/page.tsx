'use client';

import AdminLayout from '@/components/AdminLayout';

export default function ICD11Page() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-600 mb-2">Tổng quan > Cài đặt > Quản lý ICD-11</div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý mã bệnh ICD-11</h1>
          <p className="text-gray-600 mt-1">
            Cơ sở dữ liệu tập trung cho phân loại và dịch thuật mã bệnh quốc tế.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Trang quản lý ICD-11 đang được phát triển...
        </div>
      </div>
    </AdminLayout>
  );
}
