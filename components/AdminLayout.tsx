'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from './Sidebar';
import Header from './Header';
import TokenDebug from './TokenDebug';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, checkAuth, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check auth từ localStorage ngay lập tức (sync)
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              if (user.role === 'ADMIN') {
                // Set state ngay để render không bị chặn
                useAuthStore.setState({
                  token,
                  user,
                  isAuthenticated: true,
                });
                setAuthChecked(true);
                setIsLoading(false);
                return; // Không cần gọi checkAuth nữa
              }
            } catch (e) {
              // Parse error, continue với checkAuth
            }
          }
        }
        
        // Nếu không có token trong localStorage, gọi checkAuth
        await checkAuth();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Auth check failed:', error);
        }
      } finally {
        setAuthChecked(true);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authChecked && !isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && user.role !== 'ADMIN') {
        router.push('/login');
      }
    }
  }, [authChecked, isLoading, isAuthenticated, user, router]);

  if (isLoading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
      <TokenDebug />
    </div>
  );
}
