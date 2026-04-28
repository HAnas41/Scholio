'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';
  const isDashboardPage = pathname === '/dashboard';
  const isMatchesPage = pathname === '/matches';
  const isProfilePage = pathname === '/profile';
  const isAdminPage = pathname === '/admin';

  return (
    <>
      {!isLoginPage && !isDashboardPage && <Navbar />}
      <main className={isLoginPage || isDashboardPage || isMatchesPage || isProfilePage || isAdminPage ? 'w-full m-0 p-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full'}>
        {children}
      </main>
    </>
  );
}
