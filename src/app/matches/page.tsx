'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Best Match');
  const [status, setStatus] = useState('Analyzing profile & matching...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(user) {
      const fetchMatches = async () => {
        setLoading(true);
        try {
          if (!db) throw new Error('Firestore not initialized');
          const profileSnap = await getDoc(doc(db, 'users', user.uid));
          if (!profileSnap.exists()) {
            setStatus('Profile not found. Please complete your profile.');
            setLoading(false);
            return;
          }
          const studentProfile = profileSnap.data();

          const scSnap = await getDocs(query(collection(db, 'scholarships'), where('country', '==', 'Pakistan')));
          const scholarships = scSnap.docs.map(d => ({id: d.id, ...d.data()}));

          const res = await fetch('/api/match', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ studentProfile, scholarships })
          });
          
          if (!res.ok) {
            const data = await res.json();
            setStatus(data.error || 'Server error occurred while matching.');
            setLoading(false);
            return;
          }
          
          const d = await res.json();
          if(d.error) setStatus(d.error); 
          else { 
            setMatches(d.matches || []); 
            setStatus(d.matches?.length ? '' : 'No matching scholarships found. Change your profile for broader targets.'); 
          }
        } catch (e: any) {
          setStatus('Failed to match: ' + e.message);
        }
        setLoading(false);
      };
      fetchMatches();
    }
  }, [user]);

  const typeForFilter = (item: any): string => {
    const type = item?.scholarship?.scholarshipType || '';
    return String(type).toLowerCase();
  };

  const levelForFilter = (item: any): string => {
    const degree = item?.scholarship?.degreeRequired;
    const values = Array.isArray(degree) ? degree : [degree];
    return values.map((v) => String(v || '').toLowerCase()).join(' ');
  };

  const filterOptions = useMemo(() => {
    const countBy = (predicate: (m: any) => boolean) => matches.filter(predicate).length;
    return [
      { label: 'All', count: matches.length },
      { label: 'Merit Based', count: countBy((m) => typeForFilter(m).includes('merit')) },
      { label: 'Need Based', count: countBy((m) => typeForFilter(m).includes('need based') && !typeForFilter(m).includes('need + merit')) },
      { label: 'Need + Merit', count: countBy((m) => typeForFilter(m).includes('need + merit')) },
      { label: 'Undergraduate', count: countBy((m) => levelForFilter(m).includes('under')) },
    ];
  }, [matches]);

  const visibleMatches = useMemo(() => {
    const filtered = matches.filter((m) => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Merit Based') return typeForFilter(m).includes('merit');
      if (activeFilter === 'Need Based') return typeForFilter(m).includes('need based') && !typeForFilter(m).includes('need + merit');
      if (activeFilter === 'Need + Merit') return typeForFilter(m).includes('need + merit');
      if (activeFilter === 'Undergraduate') return levelForFilter(m).includes('under');
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'Best Match') return (b.match_score || 0) - (a.match_score || 0);
      if (sortBy === 'Deadline') {
        const aTime = new Date(a?.scholarship?.deadline || '').getTime() || Number.MAX_SAFE_INTEGER;
        const bTime = new Date(b?.scholarship?.deadline || '').getTime() || Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      }
      if (sortBy === 'Min CGPA') {
        const aMin = Number(a?.scholarship?.minimumValue);
        const bMin = Number(b?.scholarship?.minimumValue);
        const av = Number.isFinite(aMin) ? aMin : Number.MAX_SAFE_INTEGER;
        const bv = Number.isFinite(bMin) ? bMin : Number.MAX_SAFE_INTEGER;
        return av - bv;
      }
      return 0;
    });

    return sorted;
  }, [activeFilter, matches, sortBy]);

  const topPickId = visibleMatches[0]?.scholarship?.id || visibleMatches[0]?.scholarship?.title;

  const formatMinReq = (s: any) => {
    const raw = Number(s?.minimumValue);
    if (!Number.isFinite(raw)) return 'Not specified';
    return `${raw}${s?.minimumType === 'Percentage' ? '%' : ''}`;
  };

  const formatDeadline = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'Not specified';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="matches-root min-h-screen w-full bg-[#0a0f1e] text-white relative overflow-x-hidden">
      <div className="pointer-events-none absolute right-8 top-4 h-[250px] w-[250px] rounded-full bg-[rgba(37,99,235,0.15)] blur-[70px] z-0" />
      <div className="pointer-events-none absolute bottom-6 left-4 h-[180px] w-[180px] rounded-full bg-[rgba(202,138,4,0.10)] blur-[70px] z-0" />
      <div className="pointer-events-none absolute right-[12%] top-[42%] h-[150px] w-[150px] rounded-full bg-[rgba(124,58,237,0.12)] blur-[70px] z-0" />

      <div className="relative z-[2] px-[28px] py-6">
        <div className="matches-header mb-5">
          <div className="mb-3 inline-flex items-center gap-2 rounded-[20px] border border-[rgba(96,165,250,0.2)] bg-[rgba(37,99,235,0.12)] px-[10px] py-[3px]">
            <span className="h-[5px] w-[5px] rounded-full bg-[#60a5fa] animate-pulse-dot" />
            <span className="text-[10px] uppercase tracking-[0.4px] text-[#60a5fa]">AI Curated</span>
          </div>
          <h2 className="mb-[6px] text-[24px] font-bold tracking-[-0.5px] text-white">My Scholarships</h2>
          <p className="text-[12px] text-[rgba(255,255,255,0.35)]">
            AI-curated opportunities customized exactly for your academic profile.
          </p>
        </div>

        <div className="matches-filters mb-5 flex flex-wrap items-center gap-2">
          {filterOptions.map((option) => {
            const active = activeFilter === option.label;
            return (
              <button
                key={option.label}
                onClick={() => setActiveFilter(option.label)}
                className={`matches-filter-btn ${
                  active
                    ? 'bg-[rgba(37,99,235,0.2)] border-[rgba(96,165,250,0.3)] text-[#60a5fa]'
                    : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.45)]'
                }`}
              >
                <span>{option.label}</span>
                <span className="matches-count-badge">{option.count}</span>
              </button>
            );
          })}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="matches-sort ml-auto"
          >
            <option>Best Match</option>
            <option>Deadline</option>
            <option>Min CGPA</option>
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[rgba(255,255,255,0.55)]">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#60a5fa]" />
            <p className="text-sm font-semibold">{status}</p>
          </div>
        ) : visibleMatches.length ? (
          <div className="matches-grid grid grid-cols-3 gap-[14px]">
            {visibleMatches.map((m, i) => {
              const s = m.scholarship || {};
              const score = Number(m.match_score) || 0;
              const isTopPick = (s.id || s.title) === topPickId;
              const isHigh = score >= 80;
              const badgeColor = isHigh
                ? 'bg-[rgba(5,150,105,0.15)] text-[#34d399]'
                : 'bg-[rgba(202,138,4,0.15)] text-[#fbbf24]';
              const barColor = isHigh
                ? 'linear-gradient(90deg,#059669,#34d399)'
                : 'linear-gradient(90deg,#ca8a04,#fbbf24)';
              const isNew = i < 2;
              const isTrending = i === 1 || i === 4;
              const isHot = score >= 85;
              return (
                <article
                  key={`${s.id || s.title || 'item'}-${i}`}
                  className={`matches-card ${isTopPick ? 'matches-card-top' : ''}`}
                  style={{ animationDelay: `${0.15 + i * 0.05}s` }}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-[5px]">
                      {isNew && <span className="matches-badge bg-[rgba(5,150,105,0.2)] text-[#34d399]">NEW</span>}
                      {isTrending && <span className="matches-badge bg-[rgba(202,138,4,0.2)] text-[#fbbf24]">TRENDING</span>}
                      {isHot && <span className="matches-badge bg-[rgba(239,68,68,0.2)] text-[#f87171]">HOT</span>}
                    </div>
                    <span className={`rounded-[8px] px-[9px] py-[3px] text-[13px] font-bold ${badgeColor}`}>{score}%</span>
                  </div>

                  <h3 className="mb-[3px] text-[13px] font-bold leading-[1.3] text-white">{s.title || 'Untitled scholarship'}</h3>
                  <p className="mb-[10px] text-[10px] uppercase tracking-[0.3px] text-[rgba(255,255,255,0.3)]">
                    {Array.isArray(s.degreeRequired) ? s.degreeRequired.join(' | ') : (s.degreeRequired || 'Not specified')}
                  </p>

                  <div className="mb-[10px] h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, score))}%`, background: barColor }} />
                  </div>

                  <div className="matches-details mb-3 flex flex-col gap-[5px]">
                    <p className="matches-detail-row">
                      <span className="matches-icon">◎</span>
                      <span>Min Req:</span>
                      <span className="matches-value">{formatMinReq(s)}</span>
                    </p>
                    <p className="matches-detail-row">
                      <span className="matches-icon">◷</span>
                      <span>Deadline:</span>
                      <span className="matches-value">{formatDeadline(s.deadline)}</span>
                    </p>
                    <p className="matches-detail-row detail-for">
                      <span className="matches-icon">◉</span>
                      <span>For:</span>
                      <span className="matches-value">
                        {s.eligibleProvinces?.includes('All Pakistan') ? 'All Pakistan' : (s.eligibleProvinces?.join(', ') || 'Not specified')}
                      </span>
                    </p>
                    <p className="matches-detail-row detail-type">
                      <span className="matches-icon">◈</span>
                      <span>Type:</span>
                      <span className="matches-value">{s.scholarshipType || 'Not specified'}</span>
                    </p>
                  </div>

                  <div className="matches-ai-box mb-3">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.5px] text-[#60a5fa]">✦ AI Analysis</p>
                    <p className="text-[11px] leading-[1.5] text-[rgba(255,255,255,0.45)]">
                      {m.explanation || 'Analyzing your profile match...'}
                    </p>
                  </div>

                  <a href={s.applyLink} target="_blank" rel="noopener noreferrer" className="matches-apply-btn">
                    <span className="relative z-[2]">Apply Now ↗</span>
                  </a>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-10 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-[#60a5fa] opacity-90" />
            <p className="text-sm font-semibold text-[rgba(255,255,255,0.7)]">{status}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .matches-header { animation: fadeInUp 0.5s ease both; }
        .matches-filters { animation: fadeInUp 0.5s 0.1s ease both; }
        .matches-grid { animation: fadeInUp 0.5s 0.15s ease both; }
        .matches-filter-btn {
          display: inline-flex;
          align-items: center;
          border: 1px solid;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .matches-count-badge {
          margin-left: 4px;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.3);
          color: #60a5fa;
          padding: 1px 7px;
          font-size: 10px;
        }
        .matches-sort {
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.5);
          padding: 6px 12px;
          font-size: 11px;
        }
        .matches-card {
          animation: fadeInUp 0.5s ease both;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 16px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .matches-card:hover {
          border-color: rgba(96, 165, 250, 0.25);
          transform: translateY(-2px);
        }
        .matches-card-top {
          border-color: rgba(96, 165, 250, 0.2);
          background: rgba(37, 99, 235, 0.06);
        }
        .matches-badge {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 5px;
          letter-spacing: 0.3px;
        }
        .matches-detail-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }
        .matches-icon {
          width: 14px;
          font-size: 10px;
          text-align: center;
        }
        .matches-value {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
        }
        .matches-ai-box {
          background: rgba(37, 99, 235, 0.07);
          border: 1px solid rgba(37, 99, 235, 0.15);
          border-radius: 8px;
          padding: 8px 10px;
        }
        .matches-apply-btn {
          width: 100%;
          border: none;
          border-radius: 9px;
          padding: 10px;
          background: linear-gradient(135deg, #1d4ed8, #7c3aed);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          text-align: center;
          display: inline-flex;
          justify-content: center;
          transition: opacity 0.2s, transform 0.2s;
        }
        .matches-apply-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .matches-apply-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
          background-size: 400px 100%;
          animation: shimmer 2.5s infinite;
          pointer-events: none;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .animate-pulse-dot { animation: pulse 2s infinite; }

        @media (min-width: 1280px) {
          .matches-root > div.relative.z-\\[2\\] { padding: 28px 40px; }
          .matches-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 1024px) {
          .matches-root > div.relative.z-\\[2\\] { padding: 24px 24px; }
          .matches-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 768px) {
          .matches-root > div.relative.z-\\[2\\] { padding: 20px 20px; }
          .matches-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .matches-header h2 { font-size: 20px; }
          .matches-filter-btn { font-size: 10px; }
          .matches-sort {
            width: 100%;
            margin-left: 0;
            margin-top: 8px;
          }
        }
        @media (max-width: 480px) {
          .matches-root > div.relative.z-\\[2\\] { padding: 16px; }
          .matches-grid { grid-template-columns: 1fr; }
          .matches-header h2 { font-size: 18px; }
          .matches-card { padding: 14px; }
          .matches-card h3 { font-size: 12px; }
          .matches-detail-row { font-size: 10px; }
          .matches-ai-box p:last-child { font-size: 10px; }
          .matches-apply-btn { padding: 9px; }
          .matches-filter-btn:nth-of-type(n + 4) { display: none; }
          .matches-root > div.pointer-events-none:nth-child(1) { width: 125px; height: 125px; }
          .matches-root > div.pointer-events-none:nth-child(2) { width: 90px; height: 90px; }
          .matches-root > div.pointer-events-none:nth-child(3) { width: 75px; height: 75px; }
        }
        @media (max-width: 360px) {
          .matches-root > div.relative.z-\\[2\\] { padding: 12px; }
          .matches-grid { grid-template-columns: 1fr; }
          .matches-ai-box { display: none; }
          .matches-card p.text-\\[10px\\].uppercase { display: none; }
          .detail-for,
          .detail-type { display: none; }
          .matches-filter-btn:nth-of-type(n + 2) { display: none; }
        }
      `}</style>
      <style jsx global>{`
        html, body { background: #0a0f1e; }
      `}</style>
    </div>
  );
}
