'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { GraduationCap, Award, Calendar, MapPin, ArrowUpRight, X } from 'lucide-react';

const NOW = Date.now();

function SmartBadge({ label, icon: Icon, color }: { label: string; icon: any; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-[5px] px-[7px] py-[2px] text-[9px] font-bold uppercase tracking-[0.3px] ${color}`}>
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {label}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value, color = "text-[rgba(255,255,255,0.7)]", className = '' }: { icon: any; label: string; value: string; color?: string; className?: string }) {
  if (!value) return null;
  return (
    <div className={`flex items-center gap-2 text-[11px] text-[rgba(255,255,255,0.38)] ${className}`}>
      <Icon className="h-[12px] w-[12px] text-[rgba(255,255,255,0.45)] shrink-0" />
      <span className="font-medium">{label}:</span>
      <span className={`${color} font-semibold truncate`}>{value}</span>
    </div>
  );
}

function ScholarshipBrowseCard({ s, index }: { s: any; index: number }) {
  const deadline = new Date(s.deadline);
  const daysLeft = Math.ceil((deadline.getTime() - NOW) / (1000 * 60 * 60 * 24));
  const isClosingSoon = daysLeft >= 0 && daysLeft <= 30;
  
  const isNew = index < 3; 
  const isTrending = index === 1 || index === 4;

  const minVal = isNaN(Number(s.minimumValue)) ? 'Not specified' : `${s.minimumValue}${s.minimumType === 'Percentage' ? '%' : ''}`;
  const isFeatured = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`scholar-card group flex h-full flex-col overflow-hidden rounded-[14px] border p-[18px] transition-all duration-200 ${
        isFeatured
          ? 'border-[rgba(96,165,250,0.18)] bg-[rgba(37,99,235,0.07)]'
          : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]'
      }`}
    >
      <div className="flex-grow flex flex-col">
        <div className="mb-2 flex flex-wrap gap-[5px]">
          {isClosingSoon && (
            <SmartBadge label="NEW" icon={null} color="bg-[rgba(5,150,105,0.2)] text-[#34d399]" />
          )}
          {isNew && (
            <SmartBadge label="NEW" icon={null} color="bg-[rgba(5,150,105,0.2)] text-[#34d399]" />
          )}
          {isTrending && (
            <SmartBadge label="TRENDING" icon={null} color="bg-[rgba(202,138,4,0.2)] text-[#fbbf24]" />
          )}
        </div>

        <div>
          <h3 className="mb-[3px] text-[14px] font-bold leading-[1.3] text-white">
            {s.title}
          </h3>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3px] text-[rgba(255,255,255,0.28)]">
            {Array.isArray(s.degreeRequired) ? s.degreeRequired.join(' | ') : s.degreeRequired} | {s.fieldRequired}
          </p>
        </div>

        <div className="my-[10px] flex flex-col gap-[5px]">
          <DetailRow className="detail-min" icon={Award} label="Min Req" value={`${s.minimumType} ${minVal}`} />
          <DetailRow 
            className="detail-deadline"
            icon={Calendar} 
            label="Deadline" 
            value={deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
            color={isClosingSoon ? "text-[#fbbf24]" : "text-[rgba(255,255,255,0.7)]"}
          />
          <DetailRow className="detail-for" icon={MapPin} label="For" value={s.eligibleProvinces?.includes('All Pakistan') ? 'All Pakistan' : s.eligibleProvinces?.join(', ')} />
          <DetailRow className="detail-type" icon={GraduationCap} label="Type" value={s.scholarshipType} />
          {s.quotaSeats && !isNaN(s.quotaSeats) && (
            <DetailRow icon={Award} label="Seats" value={`${s.quotaSeats} seats`} />
          )}
        </div>

        <p className="scholar-desc mt-auto mb-[14px] line-clamp-2 text-[11px] leading-[1.6] text-[rgba(255,255,255,0.38)]">{s.description}</p>
      </div>

      <a
        href={s.applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="apply-btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[10px] bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] py-[11px] text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-[1px] hover:opacity-90"
      >
        <span className="relative z-[2]">Apply Now</span> <ArrowUpRight className="relative z-[2] h-4 w-4" />
      </a>
    </motion.div>
  );
}

export default function ScholarshipsPage() {
  const [all, setAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDegree, setFilterDegree] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterGender, setFilterGender] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDocs(collection(db, 'scholarships'));
        setAll(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Firestore read failed:', error);
        // keep existing state, don't crash
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = all.filter(s => {
    const matchSearch = !search || 
      s.title?.toLowerCase().includes(search.toLowerCase()) || 
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.fieldRequired?.toLowerCase().includes(search.toLowerCase());
    const matchDegree = !filterDegree || (Array.isArray(s.degreeRequired) ? s.degreeRequired.includes(filterDegree) : s.degreeRequired === filterDegree);
    const matchType = !filterType || s.scholarshipType === filterType;
    const matchGender = !filterGender || s.eligibleGender === filterGender || s.eligibleGender === 'Both';
    return matchSearch && matchDegree && matchType && matchGender;
  });

  return (
    <div className="scholar-root relative min-h-screen w-full overflow-x-hidden bg-[#0a0f1e] text-white">
      <div className="pointer-events-none absolute right-8 top-4 h-[280px] w-[280px] rounded-full bg-[rgba(37,99,235,0.15)] blur-[70px] z-0" />
      <div className="pointer-events-none absolute bottom-6 left-4 h-[200px] w-[200px] rounded-full bg-[rgba(202,138,4,0.10)] blur-[70px] z-0" />
      <div className="pointer-events-none absolute right-[14%] top-[42%] h-[160px] w-[160px] rounded-full bg-[rgba(124,58,237,0.12)] blur-[70px] z-0" />

      <div className="relative z-[2] px-[28px] py-6">
        <div className="mb-5 animate-[fadeInUp_0.5s_ease_both]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-[20px] border border-[rgba(96,165,250,0.2)] bg-[rgba(37,99,235,0.12)] px-[10px] py-[3px]">
            <span className="h-[5px] w-[5px] rounded-full bg-[#60a5fa] animate-pulse-dot" />
            <span className="text-[10px] uppercase tracking-[0.4px] text-[#60a5fa]">Browse Scholarships</span>
          </div>
          <h1 className="mb-[6px] text-[24px] font-bold text-white">Browse Scholarships</h1>
          <p className="text-[12px] text-[rgba(255,255,255,0.35)]">AI-curated opportunities customized exactly for your academic profile.</p>
        </div>

        <div className="mb-3 animate-[fadeInUp_0.5s_ease_both]">
          <input
            className="w-full rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-[10px] text-[13px] text-white outline-none placeholder:text-[rgba(255,255,255,0.25)] focus:border-[rgba(96,165,250,0.4)]"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2 animate-[fadeInUp_0.5s_ease_both]">
          <select
            className="scholar-select min-w-[120px] rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-2 text-[12px] text-white outline-none cursor-pointer"
            value={filterDegree}
            onChange={e => setFilterDegree(e.target.value)}
          >
            <option value="">Degrees</option>
            <option>Matric</option>
            <option>Intermediate</option>
            <option>BS</option>
            <option>MS</option>
          </select>
          <select
            className="scholar-select min-w-[140px] rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-2 text-[12px] text-white outline-none cursor-pointer"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">Types</option>
            <option>Need Based</option>
            <option>Merit Based</option>
            <option>Need + Merit</option>
            <option>Special Quota</option>
          </select>
          <select
            className="scholar-select min-w-[120px] rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-2 text-[12px] text-white outline-none cursor-pointer"
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
          >
            <option value="">Gender</option>
            <option value="Female Only">Female</option>
            <option value="Male Only">Male</option>
          </select>
          {(search || filterDegree || filterType || filterGender) && (
            <button
              onClick={() => { setSearch(''); setFilterDegree(''); setFilterType(''); setFilterGender(''); }}
              className="rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-[rgba(255,255,255,0.6)] transition hover:border-[rgba(96,165,250,0.3)] hover:text-[#60a5fa]"
              title="Clear Filters"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mb-6 animate-[fadeInUp_0.5s_ease_both]">
          <p className="text-[12px] text-[rgba(255,255,255,0.35)]">
            Showing <span className="font-semibold text-[#60a5fa]">{filtered.length}</span> of {all.length} opportunities
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 border-4 border-[#60a5fa] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="scholar-grid grid grid-cols-3 gap-4 items-stretch animate-[fadeInUp_0.5s_0.1s_ease_both]">
            {filtered.map((s, i) => <ScholarshipBrowseCard key={s.id} s={s} index={i} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-[rgba(255,255,255,0.45)]">
            <GraduationCap className="h-14 w-14 mb-4 text-[rgba(96,165,250,0.8)]" />
            <p className="text-lg font-bold text-white">No scholarships found</p>
            <p className="text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .apply-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
          background-size: 400px 100%;
          animation: shimmer 2.5s infinite;
          pointer-events: none;
        }
        .scholar-card:hover {
          border-color: rgba(96,165,250,0.2);
          transform: translateY(-2px);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-dot { animation: pulse 2s infinite; }
        .scholar-select {
          background: rgba(255,255,255,0.05);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9px;
          padding: 8px 14px;
        }
        .scholar-select option {
          background-color: #1a2235;
          color: #e2e8f0;
        }
        .scholar-select:focus option,
        .scholar-select:active option {
          background-color: #1a2235;
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .scholar-root > div.relative.z-\\[2\\] { padding: 20px; }
          .scholar-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .scholar-root h1 { font-size: 20px; }
        }
        @media (max-width: 480px) {
          .scholar-root > div.relative.z-\\[2\\] { padding: 16px; }
          .scholar-grid { grid-template-columns: 1fr; }
          .scholar-root h1 { font-size: 18px; }
          .scholar-root select,
          .scholar-root button[title='Clear Filters'] {
            width: 100%;
          }
          .scholar-card { padding: 14px; }
          .scholar-root > div.pointer-events-none:nth-child(1) { width: 140px; height: 140px; }
          .scholar-root > div.pointer-events-none:nth-child(2) { width: 100px; height: 100px; }
          .scholar-root > div.pointer-events-none:nth-child(3) { width: 80px; height: 80px; }
        }
        @media (max-width: 360px) {
          .scholar-root > div.relative.z-\\[2\\] { padding: 12px; }
          .scholar-grid { grid-template-columns: 1fr; }
          .scholar-desc { display: none; }
          .detail-for,
          .detail-type { display: none; }
        }
      `}</style>
      <style jsx global>{`
        html, body {
          background: #0a0f1e;
        }
      `}</style>
    </div>
  );
}
