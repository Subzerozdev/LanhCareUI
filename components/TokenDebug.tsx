'use client';

import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

export default function TokenDebug() {
  const { token: storeToken, user: storeUser } = useAuthStore();
  const [showDebug, setShowDebug] = useState(false);
  const [decoded, setDecoded] = useState<any>(null);

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

  const decodeToken = () => {
    if (!token) return;
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
        setDecoded(JSON.parse(jsonPayload));
      }
    } catch (e) {
      console.error('Could not decode token:', e);
    }
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 shadow-lg max-w-md z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">🔍 Token Debug</h3>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs px-2 py-1 bg-yellow-200 rounded"
        >
          {showDebug ? 'Ẩn' : 'Hiện'}
        </button>
      </div>
      
      {showDebug && (
        <div className="text-xs space-y-2">
          <div>
            <strong>Token:</strong> {token ? token.substring(0, 30) + '...' : 'Không có'}
          </div>
          <div>
            <strong>User:</strong> {user ? JSON.stringify(user) : 'Không có'}
          </div>
          <button
            onClick={decodeToken}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Decode Token
          </button>
          {decoded && (
            <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(decoded, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
