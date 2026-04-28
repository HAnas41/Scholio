'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, LayoutDashboard, UserCircle, Settings, LogOut, BookOpen, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!user) return null;
  const isMatchesPage = pathname === '/matches';
  const isScholarshipsPage = pathname === '/scholarships';
  const isProfilePage = pathname === '/profile';
  const isAdminPage = pathname === '/admin';
  const isDarkNavPage = isMatchesPage || isScholarshipsPage || isProfilePage || isAdminPage;

  const links = [
    { href: '/matches', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Matches' },
    { href: '/scholarships', icon: <BookOpen className="h-4 w-4" />, label: 'Scholarships' },
    { href: '/profile', icon: <UserCircle className="h-4 w-4" />, label: 'Profile' },
    ...(role === 'admin' ? [{ href: '/admin', icon: <Settings className="h-4 w-4" />, label: 'Admin', className: 'text-amber-600' }] : []),
  ];

  return (
    <nav
      className={`sticky top-0 z-50 border-b ${
        isDarkNavPage
          ? 'bg-transparent border-[rgba(255,255,255,0.06)]'
          : 'bg-white/90 border-slate-200 shadow-sm backdrop-blur-md'
      }`}
    >
      <div className={`${isDarkNavPage ? 'w-full px-[28px] py-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 font-heading font-bold tracking-tight transition hover:opacity-80 ${
              isDarkNavPage ? 'text-white text-[17px]' : 'text-blue-700 text-lg md:text-xl'
            }`}
          >
            <GraduationCap className={`h-5 w-5 md:h-6 md:w-6 ${isDarkNavPage ? 'text-white' : 'text-blue-600'}`} />
            Scholio<span className={isDarkNavPage ? 'text-[#60a5fa]' : 'text-slate-900'}>AI</span>
          </Link>

          {/* Desktop Links */}
          <div className={`hidden md:flex items-center ${isDarkNavPage ? 'gap-2 text-[12px]' : 'gap-6 text-sm'} font-medium`}>
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2 transition ${
                  isDarkNavPage
                    ? `rounded-[8px] px-[13px] py-[6px] ${
                        pathname === l.href
                          ? 'bg-[rgba(37,99,235,0.15)] text-[#60a5fa]'
                          : 'text-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
                      }`
                    : `hover:text-blue-700 text-slate-600 ${(l as any).className || ''}`
                }`}
              >
                {l.icon} {l.label}
              </Link>
            ))}
            <div className={`h-6 w-px mx-2 ${isDarkNavPage ? 'bg-[rgba(255,255,255,0.15)]' : 'bg-slate-200'}`} />
            <button
              onClick={signOut}
              className={`flex items-center gap-2 transition ${
                isDarkNavPage
                  ? 'rounded-[8px] border border-[rgba(255,255,255,0.08)] px-3 py-[6px] text-[12px] text-[rgba(255,255,255,0.4)] hover:border-[rgba(255,255,255,0.15)] hover:text-white'
                  : 'text-slate-500 hover:text-red-600'
              }`}
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition ${
              isDarkNavPage
                ? 'text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div
          className={`md:hidden border-t ${
            isDarkNavPage
              ? 'bg-[#0a0f1e] border-[rgba(255,255,255,0.08)]'
              : 'bg-white border-slate-100 shadow-lg'
          }`}
        >
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isDarkNavPage
                    ? 'text-[rgba(255,255,255,0.75)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
                    : `hover:bg-slate-50 text-slate-700 hover:text-blue-700 ${(l as any).className || ''}`
                }`}
              >
                {l.icon} {l.label}
              </Link>
            ))}
            <div className={`border-t my-1 ${isDarkNavPage ? 'border-[rgba(255,255,255,0.08)]' : 'border-slate-100'}`} />
            <button
              onClick={() => { signOut(); setMobileOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition w-full text-left ${
                isDarkNavPage
                  ? 'text-[rgba(255,255,255,0.6)] hover:bg-[rgba(239,68,68,0.15)] hover:text-[#f87171]'
                  : 'hover:bg-red-50 text-slate-500 hover:text-red-600'
              }`}
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
