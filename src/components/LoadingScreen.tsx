'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoadingScreen() {
  const { loading } = useAuth();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!loading) {
      const t = window.setTimeout(() => setGone(true), 480);
      return () => window.clearTimeout(t);
    }
  }, [loading]);

  if (gone) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#0a0f1e] px-4"
      initial={{ opacity: 1 }}
      animate={{ opacity: loading ? 1 : 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      aria-busy={loading}
      aria-live="polite"
    >
      <div className="pointer-events-none absolute right-8 top-4 z-0 h-[260px] w-[260px] rounded-full bg-[rgba(37,99,235,0.15)] blur-[70px]" />
      <div className="pointer-events-none absolute bottom-6 left-4 z-0 h-[180px] w-[180px] rounded-full bg-[rgba(202,138,4,0.10)] blur-[70px]" />
      <div className="pointer-events-none absolute right-[14%] top-[42%] z-0 h-[150px] w-[150px] rounded-full bg-[rgba(124,58,237,0.12)] blur-[70px]" />

      <div className="relative z-[2] flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] text-[26px]">
          🎓
        </div>

        <h1 className="font-heading text-[28px] font-bold tracking-[-0.5px] text-white">
          Scholio<span className="text-[#60a5fa]">AI</span>
        </h1>

        <p className="mb-2 text-[13px] text-[rgba(255,255,255,0.35)]">
          AI Scholarship Finder for Pakistani Students
        </p>

        <div
          className="mb-1 h-8 w-8 rounded-full border-2 border-[rgba(255,255,255,0.08)] border-t-[#60a5fa] animate-loading-spin"
          role="status"
        />

        <p className="text-xs text-[rgba(255,255,255,0.3)]">Loading...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-loading-spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </motion.div>
  );
}
