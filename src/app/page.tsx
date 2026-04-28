'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => { 
    if (user && !loading) router.push('/dashboard'); 
  }, [user, loading, router]);
  
  if (loading || user) return null;

  return (
    <>
      <div className="login-root relative w-full min-h-screen bg-[#0a0f1e] overflow-x-hidden overflow-y-auto">
        <div className="pointer-events-none absolute -left-16 -top-16 h-[280px] w-[280px] rounded-full bg-[rgba(37,99,235,0.25)] blur-[60px]" />
        <div className="pointer-events-none absolute bottom-10 left-[38%] h-[200px] w-[200px] rounded-full bg-[rgba(202,138,4,0.15)] blur-[60px]" />
        <div className="pointer-events-none absolute right-10 top-10 h-[180px] w-[180px] rounded-full bg-[rgba(124,58,237,0.2)] blur-[60px]" />

        <div className="login-shell flex min-h-screen w-full max-w-none items-stretch rounded-2xl">
          <section className="login-left relative flex-[1.1] px-8 py-7 flex flex-col justify-center">
            <div className="animate-fadeInLeft [animation-duration:0.6s] [animation-fill-mode:both]">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-9 rounded-[10px] bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true">
                    <path d="M12 2 4 6v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V6l-8-4Zm0 3.2 5 2.5V12c0 3.9-2.4 7.6-5 8.8-2.6-1.2-5-4.9-5-8.8V7.7l5-2.5Z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-white tracking-tight">
                  Scholio<span className="text-[#60a5fa]">AI</span>
                </h1>
              </div>
            </div>

            <div className="animate-fadeInUp [animation-delay:0.1s] [animation-duration:0.6s] [animation-fill-mode:both]">
              <div className="inline-flex items-center gap-2 rounded-[20px] border border-[rgba(96,165,250,0.3)] bg-[rgba(37,99,235,0.15)] px-3 py-1 mb-4">
                <span className="h-2 w-2 rounded-full bg-[#60a5fa] animate-dot-bounce" />
                <span className="text-[11px] uppercase tracking-[0.5px] text-[#60a5fa]">
                  Pakistan&apos;s #1 Scholarship AI
                </span>
              </div>
              <h2 className="max-w-[470px] text-[28px] font-bold leading-[1.25] tracking-[-0.5px] text-white mb-3">
                Find scholarships you <span className="text-[#fbbf24]">actually</span> qualify for
              </h2>
              <p className="max-w-[470px] text-[13px] text-[rgba(255,255,255,0.5)] mb-5">
                AI matches your academic profile to hundreds of Pakistani university scholarships - instantly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5 animate-fadeInUp [animation-delay:0.2s] [animation-duration:0.6s] [animation-fill-mode:both]">
              {[
                { value: '500+', label: 'Scholarships listed', accent: 'from-[#2563eb] to-[#60a5fa]' },
                { value: '12K+', label: 'Students matched', accent: 'from-[#ca8a04] to-[#fbbf24]' },
                { value: '94%', label: 'Match accuracy', accent: 'from-[#7c3aed] to-[#a78bfa]' },
                { value: 'Free', label: 'Always free to use', accent: 'from-[#059669] to-[#34d399]' },
              ].map((item) => (
                <div key={item.label} className="relative rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-3.5">
                  <div className={`absolute left-0 top-0 h-[2px] w-full rounded-t-xl bg-gradient-to-r ${item.accent}`} />
                  <div className="text-[22px] font-bold text-white">{item.value}</div>
                  <div className="text-[11px] text-[rgba(255,255,255,0.4)]">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 mb-5 animate-fadeInUp [animation-delay:0.3s] [animation-duration:0.6s] [animation-fill-mode:both]">
              <div className="flex items-center gap-3">
                <div className="h-[22px] w-[22px] rounded-md bg-[rgba(37,99,235,0.2)] text-[#60a5fa] flex items-center justify-center text-xs">AI</div>
                <p className="text-xs text-[rgba(255,255,255,0.6)]">Gemini AI analyzes your academic profile in seconds</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-[22px] w-[22px] rounded-md bg-[rgba(202,138,4,0.2)] text-[#fbbf24] flex items-center justify-center text-xs">U</div>
                <p className="text-xs text-[rgba(255,255,255,0.6)]">Covers NUST, UCP, HEC, PEEF &amp; 50+ universities</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-[22px] w-[22px] rounded-md bg-[rgba(124,58,237,0.2)] text-[#a78bfa] flex items-center justify-center text-xs">✓</div>
                <p className="text-xs text-[rgba(255,255,255,0.6)]">Personalized reasons why each scholarship fits you</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-[rgba(255,255,255,0.25)] mb-2">Trusted scholarship sources</p>
              <div className="flex flex-wrap gap-2">
                {['NUST', 'UCP', 'HEC', 'PEEF', 'LUMS', 'FAST'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-1 text-[10px] text-[rgba(255,255,255,0.3)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <div className="w-px bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.08),transparent)]" />

          <section className="login-right flex-[0.9] px-8 py-7 flex items-center justify-center">
            <div className="w-full max-w-[300px] text-center animate-fadeInRight [animation-delay:0.2s] [animation-duration:0.6s] [animation-fill-mode:both]">
              <div className="relative mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] flex items-center justify-center text-2xl animate-float">
                🎓
                <span className="pointer-events-none absolute -inset-1.5 rounded-[22px] border-[1.5px] border-[rgba(96,165,250,0.3)] animate-spin-slow" />
              </div>
              <h3 className="text-[22px] font-bold text-white">
                Scholio<span className="text-[#60a5fa]">AI</span>
              </h3>
              <p className="mt-1 mb-4 text-xs text-[rgba(255,255,255,0.4)]">
                Sign in to discover scholarships matched to your profile
              </p>

              <button
                onClick={signIn}
                className="google-btn relative overflow-hidden w-full rounded-xl bg-white px-4 py-[13px] text-sm font-semibold text-slate-800 flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)]"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 3.1l6-6C34.5 3.2 29.6 1 24 1 14.6 1 6.5 6.4 2.6 14.3l7 5.4C11.3 13.2 17.1 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v8.2h12.8c-.3 2-1.8 5-5.2 7l8 6.2c4.8-4.4 7.5-10.9 7.5-17.4z" />
                  <path fill="#FBBC05" d="M9.6 28.3c-.5-1.5-.8-3-.8-4.8s.3-3.3.8-4.8l-7-5.4C1 16.7 0 20.2 0 23.5s1 6.8 2.6 10.2l7-5.4z" />
                  <path fill="#34A853" d="M24 46c6.5 0 11.9-2.1 15.9-5.8l-8-6.2c-2.2 1.5-5.1 2.5-7.9 2.5-6.9 0-12.7-3.7-14.4-10.2l-7 5.4C6.5 39.6 14.6 46 24 46z" />
                </svg>
                Continue with Google
              </button>

              <div className="my-3 flex items-center gap-3">
                <span className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
                <span className="text-[11px] text-[rgba(255,255,255,0.25)]">secure • free • instant</span>
                <span className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
              </div>

              <div className="rounded-[10px] border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.08)] px-3 py-2.5 text-left">
                <p className="text-[11px] text-[rgba(255,255,255,0.5)]">
                  <span className="text-[#60a5fa] mr-1">◉</span>
                  Your data is only used to match scholarships. We never share or sell your academic information.
                </p>
              </div>

              <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-[rgba(255,255,255,0.3)]">
                <span><span className="text-[#34d399]">●</span> SSL Encrypted</span>
                <span><span className="text-[#fbbf24]">●</span> Google Auth</span>
                <span><span className="text-[#34d399]">●</span> No spam</span>
              </div>

              <p className="mt-3 text-[10px] text-[rgba(255,255,255,0.2)]">
                By continuing, you agree to our <a href="#" className="text-[rgba(96,165,250,0.6)]">Terms</a> &amp; <a href="#" className="text-[rgba(96,165,250,0.6)]">Privacy Policy</a>
              </p>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .login-root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          background: #0a0f1e;
          box-sizing: border-box;
        }
        .login-shell {
          width: 100%;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .login-left {
          overflow-y: visible;
          overflow-x: hidden;
          box-sizing: border-box;
          max-width: 100%;
        }
        .login-right {
          box-sizing: border-box;
          max-width: 100%;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease both; }
        .animate-fadeInLeft { animation: fadeInLeft 0.6s ease both; }
        .animate-fadeInRight { animation: fadeInRight 0.6s ease both; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-dot-bounce { animation: dot-bounce 1.4s infinite both; }
        .google-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%);
          background-size: 400px 100%;
          animation: shimmer 2.5s infinite;
          pointer-events: none;
        }
        @media (max-width: 1024px) {
          .google-btn::after { display: none; }
        }
        @media (max-width: 768px) {
          div[class*="max-w-[1200px]"] {
            flex-direction: column;
          }
          section[class*="flex-[1.1]"] {
            order: 2;
            padding: 32px 24px;
          }
          section[class*="flex-[0.9]"] {
            order: 1;
            padding: 32px 24px;
          }
          div[class*="max-w-[1200px]"] > div.w-px {
            display: none;
          }
          section[class*="flex-[1.1]"] h2[class*="text-[28px]"] {
            font-size: 22px;
          }
          section[class*="flex-[1.1]"] div[class*="grid-cols-2"] > div[class*="p-3.5"] {
            padding: 12px;
          }
        }
        @media (max-width: 480px) {
          div[class*="bg-[#0a0f1e]"] > div:nth-child(1) {
            width: 150px;
            height: 150px;
          }
          div[class*="bg-[#0a0f1e]"] > div:nth-child(2) {
            width: 100px;
            height: 100px;
          }
          div[class*="bg-[#0a0f1e]"] > div:nth-child(3) {
            width: 100px;
            height: 100px;
          }
          div[class*="max-w-[1200px]"] {
            border-radius: 0;
          }
          section[class*="flex-[1.1]"] {
            padding: 24px 16px;
          }
          section[class*="flex-[0.9]"] {
            padding: 32px 16px;
          }
          section[class*="flex-[0.9]"] > div[class*="max-w-[300px]"] {
            max-width: 100%;
          }
          section[class*="flex-[1.1]"] h2[class*="text-[28px]"] {
            font-size: 20px;
          }
          section[class*="flex-[1.1]"] div[class*="grid-cols-2"] > div[class*="p-3.5"] > div[class*="text-[22px]"] {
            font-size: 18px;
          }
          section[class*="flex-[1.1]"] div[class*="space-y-3"] p {
            font-size: 11px;
          }
          .google-btn {
            padding: 12px;
          }
          section[class*="flex-[0.9]"] div[class*="mt-4 flex items-center justify-center gap-3"] {
            font-size: 9px;
          }
        }
        @media (max-width: 360px) {
          section[class*="flex-[1.1]"] {
            display: none;
          }
          section[class*="flex-[0.9]"] {
            order: 1;
          }
          section[class*="flex-[1.1]"] div[class*="grid-cols-2"] {
            grid-template-columns: 1fr;
          }
          section[class*="flex-[1.1]"] p[class*="text-[13px]"] {
            display: none;
          }
          section[class*="flex-[1.1]"] > div:last-child {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
