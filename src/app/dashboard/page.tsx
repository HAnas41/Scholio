'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user, loading, role, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [prof, setProf] = useState<any>(null);

  useEffect(() => { if (!loading && !user) router.push('/'); }, [user, loading, router]);
  useEffect(() => {
    if (user) {
      if (!db) return;
      (async () => {
        try {
          const s = await getDoc(doc(db, 'users', user.uid));
          if (s.exists()) setProf(s.data());
        } catch (error) {
          console.error('Firestore read failed:', error);
          // keep existing state, don't crash
        }
      })();
    }
  }, [user]);

  if (loading || !user) return null;
  const completionBaseFields = [
    'name',
    'phone',
    'cnic',
    'dateOfBirth',
    'gender',
    'city',
    'province',
    'currentStatus',
  ];
  const completionFieldKeys = Array.from(
    new Set([...completionBaseFields, ...(prof ? Object.keys(prof) : [])])
  );
  const hasActualValue = (value: any) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  };
  const totalFields = completionFieldKeys.length;
  const fields = prof ? completionFieldKeys.filter((field) => hasActualValue(prof[field])).length : 0;
  const complete = prof?.degreeLevel && prof?.fieldOfStudy && typeof prof?.cgpaOrMarks === 'number';
  const progress = totalFields > 0 ? (fields / totalFields) * 100 : 0;
  const roundedProgress = Number(progress.toFixed(1));
  const missingFields = Math.max(totalFields - fields, 0);
  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
    : 'U';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const links = [
    { href: '/matches', label: 'Matches' },
    { href: '/scholarships', label: 'Scholarships' },
    { href: '/profile', label: 'Profile' },
  ];
  const profileFields = [
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'degreeLevel', label: 'Degree Level' },
    { key: 'fieldOfStudy', label: 'Field of Study' },
    { key: 'cgpaOrMarks', label: 'CGPA / Marks' },
    { key: 'matricMarks', label: 'Matric Marks' },
    { key: 'currentUniversity', label: 'Current University' },
    { key: 'graduationYear', label: 'Graduation Year' },
  ];
  const isFieldDone = (fieldKey: string) => {
    const value = prof?.[fieldKey];
    if (typeof value === 'number') return Number.isFinite(value);
    return Boolean(value);
  };
  const topStats = [
    {
      value: '12',
      label: 'Matches found',
      sub: '↑ 3 new today',
      accent: 'from-[#2563eb] to-[#60a5fa]',
      subColor: 'text-[#34d399]',
    },
    {
      value: `${roundedProgress}%`,
      label: 'Profile complete',
      sub: `${missingFields} field${missingFields === 1 ? '' : 's'} missing`,
      accent: 'from-[#ca8a04] to-[#fbbf24]',
      subColor: 'text-[#fbbf24]',
    },
    {
      value: '81%',
      label: 'Avg match score',
      sub: 'Strong matches',
      accent: 'from-[#7c3aed] to-[#a78bfa]',
      subColor: 'text-[#a78bfa]',
    },
    {
      value: 'Apr 30',
      label: 'Next deadline',
      sub: 'HEC Need-Based Scholarship',
      accent: 'from-[#059669] to-[#34d399]',
      subColor: 'text-[#34d399]',
    },
  ];
  const recentMatches = [
    {
      logo: 'N',
      name: 'NUST Merit Scholarship',
      meta: 'Merit • Undergraduate • Apr 30',
      score: 86,
      logoClass: 'bg-[rgba(37,99,235,0.2)] text-[#60a5fa]',
    },
    {
      logo: 'U',
      name: 'UCP Talent Support Grant',
      meta: 'Need-based • Graduate • May 05',
      score: 74,
      logoClass: 'bg-[rgba(202,138,4,0.2)] text-[#fbbf24]',
    },
    {
      logo: 'H',
      name: 'HEC National Scholarship',
      meta: 'Research • National • May 12',
      score: 82,
      logoClass: 'bg-[rgba(124,58,237,0.2)] text-[#a78bfa]',
    },
  ];

  return (
    <div className="dashboard-root min-h-screen w-full bg-[#0a0f1e] text-white relative overflow-x-hidden">
      <div className="pointer-events-none absolute right-8 top-4 h-[300px] w-[300px] rounded-full bg-[rgba(37,99,235,0.15)] blur-[70px]" />
      <div className="pointer-events-none absolute bottom-6 left-4 h-[200px] w-[200px] rounded-full bg-[rgba(202,138,4,0.10)] blur-[70px]" />
      <div className="pointer-events-none absolute left-[14%] top-[42%] h-[150px] w-[150px] rounded-full bg-[rgba(124,58,237,0.12)] blur-[70px]" />

      <nav className="relative z-10 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-transparent px-8 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-base">🎓</div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Scholio<span className="text-[#60a5fa]">AI</span>
          </h1>
        </Link>

        <div className="dashboard-nav-center flex items-center gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-[14px] py-[7px] text-[13px] transition ${
                  active
                    ? 'bg-[rgba(37,99,235,0.15)] text-[#60a5fa]'
                    : 'text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {role === 'admin' && (
            <span className="dashboard-admin-badge rounded-lg border border-[rgba(251,191,36,0.25)] bg-[rgba(202,138,4,0.15)] px-[14px] py-[6px] text-xs font-semibold text-[#fbbf24]">
              Admin
            </span>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-xs font-bold text-white">
            {initials}
          </div>
          <button
            onClick={signOut}
            className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-[7px] text-xs text-[rgba(255,255,255,0.4)] transition hover:border-[rgba(255,255,255,0.15)] hover:text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="relative z-10 px-8 py-7">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0 }}
          className="dashboard-welcome mb-5 flex items-start justify-between gap-5"
        >
          <div>
            <div className="dashboard-overview-pill mb-4 inline-flex items-center gap-2 rounded-[20px] border border-[rgba(96,165,250,0.2)] bg-[rgba(37,99,235,0.12)] px-[10px] py-[3px]">
              <span className="h-[5px] w-[5px] rounded-full bg-[#60a5fa] animate-pulseDot" />
              <span className="text-[10px] uppercase tracking-[0.45px] text-[#60a5fa]">Academic Overview</span>
            </div>
            <h2 className="mb-2 text-[26px] font-bold tracking-[-0.5px] text-white">
              Welcome back, <span className="text-[#60a5fa]">{user.displayName}</span>
            </h2>
            <p className="text-[13px] text-[rgba(255,255,255,0.4)]">Here&apos;s your scholarship matching overview for today.</p>
          </div>
          <div className="dashboard-date text-right text-xs text-[rgba(255,255,255,0.25)]">{today}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="dashboard-stats-grid mb-5 grid grid-cols-4 gap-3"
        >
          {topStats.map((item) => (
            <div key={item.label} className="relative rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] p-[14px]">
              <div className={`absolute left-0 top-0 h-[2px] w-full rounded-t-xl bg-gradient-to-r ${item.accent}`} />
              <div className="text-[20px] font-bold text-white">{item.value}</div>
              <div className="text-[11px] text-[rgba(255,255,255,0.35)]">{item.label}</div>
              <div className={`mt-1 text-[10px] ${item.subColor}`}>{item.sub}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="dashboard-main-grid grid grid-cols-2 gap-4"
        >
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(37,99,235,0.2)]">✓</span>
                Profile Completion
              </h3>
              <span className="rounded-md bg-[rgba(202,138,4,0.15)] px-[9px] py-[3px] text-[11px] text-[#fbbf24]">
                {fields}/{totalFields} Fields
              </span>
            </div>

            <div className="mb-2 h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)]">
              <div
                className="progress-fill h-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa]"
                style={{ ['--progress' as string]: `${roundedProgress}%` }}
              />
            </div>
            <div className="mb-4 flex items-center justify-between text-[11px]">
              <span className="text-[rgba(255,255,255,0.55)]">{roundedProgress}% Complete</span>
              <span className="text-[#60a5fa]">{missingFields} remaining</span>
            </div>

            <div className="space-y-2">
              {profileFields.map((field) => {
                const done = isFieldDone(field.key);
                return (
                  <div key={field.key} className="flex items-center justify-between gap-3 rounded-lg bg-[rgba(255,255,255,0.015)] px-2.5 py-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                          done ? 'bg-[rgba(5,150,105,0.2)] text-[#34d399]' : 'bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.4)]'
                        }`}
                      >
                        {done ? '✓' : '•'}
                      </span>
                      <span className="text-xs text-[rgba(255,255,255,0.8)]">{field.label}</span>
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] ${
                        done ? 'bg-[rgba(5,150,105,0.15)] text-[#34d399]' : 'bg-[rgba(202,138,4,0.15)] text-[#fbbf24]'
                      }`}
                    >
                      {done ? 'Done' : 'Missing'}
                    </span>
                  </div>
                );
              })}
            </div>

            {!complete && (
              <Link href="/profile" className="mt-4 inline-flex items-center text-xs text-[#60a5fa] hover:text-[#93c5fd]">
                Complete your profile to unlock better matches
              </Link>
            )}
          </div>

          <div className="flex flex-col justify-between rounded-[14px] border border-[rgba(96,165,250,0.15)] bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(124,58,237,0.12))] p-5">
            <div>
              <div className="mb-4 flex h-11 w-11 animate-floatY items-center justify-center rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] text-[22px]">
                🧭
              </div>
              <h3 className="mb-2 text-base font-bold text-white">Discover Scholarships</h3>
              <p className="mb-5 text-xs text-[rgba(255,255,255,0.4)]">
                Run our Gemini AI matching engine against your current academic profile to find eligible scholarships.
              </p>

              <div className="discover-mini-stats mb-5 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-2 py-2 text-[11px] text-[rgba(255,255,255,0.35)]">
                  <span className="block text-sm font-semibold text-white">500+</span>Scholarships
                </div>
                <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-2 py-2 text-[11px] text-[rgba(255,255,255,0.35)]">
                  <span className="block text-sm font-semibold text-white">94%</span>Accuracy
                </div>
                <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-2 py-2 text-[11px] text-[rgba(255,255,255,0.35)]">
                  <span className="block text-sm font-semibold text-white">~5s</span>Match time
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/matches')}
              className="find-btn relative w-full overflow-hidden rounded-[10px] bg-gradient-to-br from-[#2563eb] to-[#7c3aed] px-3 py-[13px] text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Find Matching
              </span>
            </button>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="dashboard-recent mt-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Matches</h3>
            <Link href="/matches" className="text-xs text-[#60a5fa] hover:text-[#93c5fd]">
              View all →
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentMatches.map((item) => (
              <div
                key={item.name}
                className="recent-row flex items-center justify-between rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-[9px] text-xs font-bold ${item.logoClass}`}>{item.logo}</div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">{item.name}</p>
                    <p className="text-[11px] text-[rgba(255,255,255,0.3)]">{item.meta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[13px] font-bold ${item.score >= 80 ? 'text-[#34d399]' : 'text-[#fbbf24]'}`}>{item.score}%</span>
                  <Link
                    href="/scholarships"
                    className="recent-apply rounded-[7px] border border-[rgba(96,165,250,0.2)] bg-[rgba(37,99,235,0.15)] px-3 py-[5px] text-[11px] text-[#60a5fa] transition hover:bg-[rgba(37,99,235,0.24)]"
                  >
                    Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <style jsx>{`
        .dashboard-overview-pill { animation: fadeInUp 0.45s ease both; }
        .progress-fill {
          width: var(--progress);
          animation: progressFill 1.5s ease both;
        }
        .find-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%);
          background-size: 400px 100%;
          animation: shimmer 2.5s infinite;
          pointer-events: none;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes progressFill {
          from { width: 0; }
          to { width: var(--progress); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .animate-floatY { animation: float 3s ease-in-out infinite; }
        .animate-pulseDot { animation: pulseDot 2s infinite; }
        @media (max-width: 768px) {
          .dashboard-nav-center { display: none; }
          .dashboard-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dashboard-main-grid { grid-template-columns: 1fr; }
          .dashboard-root > div.relative.z-10 { padding: 20px; }
          .dashboard-welcome h2 { font-size: 22px; }
          .dashboard-recent .recent-row:nth-child(n + 3) { display: none; }
        }
        @media (max-width: 480px) {
          .dashboard-root > nav { padding: 12px 16px; }
          .dashboard-root > nav h1 { font-size: 16px; }
          .dashboard-admin-badge { display: none; }
          .dashboard-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dashboard-stats-grid > div { padding: 10px; }
          .dashboard-stats-grid > div > div.text-\\[20px\\] { font-size: 16px; }
          .dashboard-root > div.relative.z-10 { padding: 16px; }
          .dashboard-overview-pill { display: none; }
          .dashboard-welcome h2 { font-size: 18px; }
          .dashboard-date { display: none; }
          .dashboard-main-grid { grid-template-columns: 1fr; }
          .discover-mini-stats { display: none; }
          .dashboard-recent .recent-row:nth-child(n + 3) { display: none; }
          .recent-apply { display: none; }
          .dashboard-root > div.pointer-events-none:nth-child(1) {
            width: 150px;
            height: 150px;
          }
          .dashboard-root > div.pointer-events-none:nth-child(2) {
            width: 100px;
            height: 100px;
          }
          .dashboard-root > div.pointer-events-none:nth-child(3) {
            width: 75px;
            height: 75px;
          }
        }
        @media (max-width: 360px) {
          .dashboard-stats-grid { grid-template-columns: 1fr; }
          .dashboard-stats-grid > div { padding: 8px; }
          .dashboard-recent { display: none; }
        }
      `}</style>
    </div>
  );
}
