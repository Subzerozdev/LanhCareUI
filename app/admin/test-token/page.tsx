'use client';

import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { decodeJWT } from '@/lib/jwt';
import { useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';

export default function TestTokenPage() {
  const { token, user } = useAuthStore();
  const [testResult, setTestResult] = useState<any>(null);

  const testToken = () => {
    if (!token) {
      toast.error('Không có token');
      return;
    }

    const decoded = decodeJWT(token);
    setTestResult({
      token: token.substring(0, 50) + '...',
      decoded,
      user,
    });
  };

  const testAPI = async () => {
    try {
      // Test với raw fetch để xem headers
      const token = localStorage.getItem('token');
      console.log('Testing API with token:', token?.substring(0, 30));
      
      if (!token) {
        toast.error('Không có token trong localStorage');
        return;
      }

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
          console.log('Token email:', email);
        }
      } catch (e) {
        console.error('Could not decode token:', e);
      }
      
      const response = await fetch('https://lanhcare.onrender.com/api/admin/users?page=0&size=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('Raw fetch response:', { 
        status: response.status, 
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      if (response.ok) {
        toast.success('API call thành công!');
        setTestResult((prev: any) => ({
          ...prev,
          apiResponse: data,
          rawResponse: { 
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()) 
          },
          tokenEmail: email,
        }));
      } else {
        toast.error(`API call thất bại: ${response.status}`);
        setTestResult((prev: any) => ({
          ...prev,
          apiError: {
            status: response.status,
            statusText: response.statusText,
            data: data,
            headers: Object.fromEntries(response.headers.entries()),
            tokenEmail: email,
          },
        }));
      }
    } catch (error: any) {
      toast.error('API call thất bại');
      console.error('Test API error:', error);
      setTestResult((prev: any) => ({
        ...prev,
        apiError: {
          message: error.message,
          stack: error.stack,
        },
      }));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Test Token & API</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Token Info</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>Token:</strong> {token ? token.substring(0, 50) + '...' : 'Không có'}</p>
              <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'Không có'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={testToken}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Decode Token
            </button>
            <button
              onClick={testAPI}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Test API Call
            </button>
          </div>

          {testResult && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Test Results</h2>
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
