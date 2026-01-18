'use client';

import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function DebugPage() {
  const { token: storeToken, user: storeUser } = useAuthStore();
  const [testResult, setTestResult] = useState<any>(null);

  // Get token from both store and localStorage
  const token = storeToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const user = storeUser || (typeof window !== 'undefined' ? (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  })() : null);

  const testDirectAPI = async () => {
    if (!token) {
      toast.error('Không có token');
      return;
    }

    try {
      // Decode token để xem email
      let email = null;
      try {
        const base64Url = token.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          email = decoded?.sub || decoded?.email;
        }
      } catch (e) {
        console.error('Could not decode token:', e);
      }

      console.log('Testing direct API call with token:', {
        token: token.substring(0, 30) + '...',
        email,
        user,
      });

      // Test với raw fetch
      const response = await fetch('https://lanhcare.onrender.com/api/admin/users?page=0&size=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const responseHeaders = Object.fromEntries(response.headers.entries());

      console.log('Direct API Response:', {
        status: response.status,
        statusText: response.statusText,
        data,
        headers: responseHeaders,
      });

      setTestResult({
        status: response.status,
        statusText: response.statusText,
        data,
        headers: responseHeaders,
        tokenEmail: email,
        requestHeaders: {
          'Authorization': `Bearer ${token.substring(0, 20)}...`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('API call thành công!');
      } else {
        toast.error(`API call thất bại: ${response.status} - ${data.message || data.error}`);
      }
    } catch (error: any) {
      console.error('Test API error:', error);
      toast.error('Lỗi khi test API');
      setTestResult({
        error: error.message,
        stack: error.stack,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Debug API & Token</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Token Info</h2>
            <div className="bg-gray-50 p-4 rounded space-y-2 text-sm">
              <div>
                <strong>Token (from store):</strong> {storeToken ? storeToken.substring(0, 30) + '...' : 'null'}
              </div>
              <div>
                <strong>Token (from localStorage):</strong> {token ? token.substring(0, 30) + '...' : 'null'}
              </div>
              <div>
                <strong>User (from store):</strong> {storeUser ? JSON.stringify(storeUser) : 'null'}
              </div>
              <div>
                <strong>User (from localStorage):</strong> {user ? JSON.stringify(user) : 'null'}
              </div>
            </div>
          </div>

          <button
            onClick={testDirectAPI}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Test Direct API Call
          </button>

          {testResult && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Test Results</h2>
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-xs max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
