'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      // Check state ngay sau khi checkAuth (không cần setTimeout)
      const state = useAuthStore.getState();
      if (state.isAuthenticated && state.user?.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    };
    init();
  }, [router, checkAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
