'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ScholarshipForm from '@/components/ScholarshipForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Database } from 'lucide-react';

export default function Admin() {
  const { role, loading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [form, setForm] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [del, setDel] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!db) return;
    const snap = await getDocs(collection(db, 'scholarships'));
    setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (!loading) {
      if (role !== 'admin') {
        router.push('/dashboard');
      } else {
        load();
      }
    }
  }, [role, loading, router]);

  if (loading || role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-[#60a5fa] text-xl font-bold animate-pulse">Checking Permissions...</div>
      </div>
    );
  }

  const save = async (d: any) => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      if (edit) {
        await updateDoc(doc(db, 'scholarships', edit.id), d);
      } else {
        const newRef = doc(collection(db, 'scholarships'));
        await setDoc(newRef, d);
      }
      setForm(false);
      load();
    } catch (e) {
      console.error(e);
      alert("Failed to save scholarship. Check permissions.");
    }
  };

  const confirmDel = async () => {
    try {
      if (del) {
        if (!db) throw new Error('Firestore not initialized');
        await deleteDoc(doc(db, 'scholarships', del));
      }
      setDel(null);
      load();
    } catch (e) {
      console.error(e);
      alert("Failed to delete scholarship.");
    }
  };

  const filteredData = data.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(s.title || '').toLowerCase().includes(q) ||
      String(s.fieldRequired || '').toLowerCase().includes(q) ||
      String(s.scholarshipType || '').toLowerCase().includes(q) ||
      String(s.eligibleGender || '').toLowerCase().includes(q)
    );
  });

  const now = new Date();
  const inThirtyDays = new Date();
  inThirtyDays.setDate(now.getDate() + 30);
  const totalScholarships = data.length;
  const activeMatches = data.filter((s) => {
    const d = new Date(s.deadline);
    return !Number.isNaN(d.getTime()) && d >= now;
  }).length;
  const deadlineSoon = data.filter((s) => {
    const d = new Date(s.deadline);
    return !Number.isNaN(d.getTime()) && d >= now && d <= inThirtyDays;
  }).length;
  const stats = [
    { value: String(totalScholarships), label: 'Total Scholarships', accent: 'from-[#2563eb] to-[#60a5fa]' },
    { value: String(activeMatches), label: 'Active Matches', accent: 'from-[#ca8a04] to-[#fbbf24]' },
    { value: String(deadlineSoon), label: 'Deadline Soon', accent: 'from-[#7c3aed] to-[#a78bfa]' },
    { value: '100%', label: 'Data Complete', accent: 'from-[#059669] to-[#34d399]' },
  ];

  return (
    <div className="admin-root relative min-h-screen w-full overflow-x-hidden bg-[#0a0f1e] text-white">
      <div className="pointer-events-none absolute right-8 top-4 z-0 h-[260px] w-[260px] rounded-full bg-[rgba(37,99,235,0.15)] blur-[70px]" />
      <div className="pointer-events-none absolute bottom-6 left-4 z-0 h-[180px] w-[180px] rounded-full bg-[rgba(202,138,4,0.10)] blur-[70px]" />
      <div className="pointer-events-none absolute right-[12%] top-[45%] z-0 h-[150px] w-[150px] rounded-full bg-[rgba(124,58,237,0.12)] blur-[70px]" />

      <div className="admin-content relative z-10 px-[28px] py-6">
        <div className="admin-top-row mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-[20px] border border-[rgba(251,191,36,0.2)] bg-[rgba(202,138,4,0.12)] px-[10px] py-[3px]">
              <span className="admin-pill-dot h-[5px] w-[5px] rounded-full bg-[#fbbf24]" />
              <span className="text-[10px] uppercase tracking-[0.4px] text-[#fbbf24]">Admin Panel</span>
            </div>
            <h1 className="text-2xl font-bold tracking-[-0.5px] text-white">Admin Dashboard</h1>
            <p className="mt-1 text-xs text-[rgba(255,255,255,0.35)]">Manage scholarships, users, and platform data.</p>
          </div>

          <div className="admin-top-actions flex gap-3">
            <button
              onClick={() => { setEdit(null); setForm(true); }}
              className="admin-add-btn relative inline-flex items-center justify-center gap-[7px] overflow-hidden rounded-[10px] border-0 bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] px-4 py-[9px] text-xs font-bold text-white transition hover:-translate-y-0.5"
            >
              <span className="relative z-10">⊕ Add Scholarship</span>
            </button>
          </div>
        </div>

        <div className="admin-stats-grid mb-5 grid grid-cols-4 gap-3">
          {stats.map((item) => (
            <div key={item.label} className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] p-[14px]">
              <div className={`absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r ${item.accent}`} />
              <div className="text-[22px] font-bold text-white">{item.value}</div>
              <div className="text-[11px] text-[rgba(255,255,255,0.35)]">{item.label}</div>
            </div>
          ))}
        </div>

        <section className="admin-table-wrap overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)]">
          <div className="admin-table-head flex items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.06)] px-[18px] py-[14px]">
            <div className="flex items-center">
              <h2 className="text-[13px] font-bold text-white">All Scholarships</h2>
              <span className="ml-2 rounded-md bg-[rgba(37,99,235,0.2)] px-2 py-[2px] text-[11px] text-[#60a5fa]">{filteredData.length}</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="admin-search w-[180px] rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-[7px] text-[11px] text-white outline-none placeholder:text-[rgba(255,255,255,0.25)] focus:border-[rgba(96,165,250,0.4)]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead className="border-b border-[rgba(255,255,255,0.06)] bg-transparent">
                <tr>
                  <th className="px-[14px] py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">Title</th>
                  <th className="col-degrees px-[14px] py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">Degrees</th>
                  <th className="col-field px-[14px] py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">Field</th>
                  <th className="col-min px-[14px] py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">Min Req</th>
                  <th className="col-gender px-[14px] py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">Gender</th>
                  <th className="px-[14px] py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">Type</th>
                  <th className="col-disabled px-[14px] py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">Disabled</th>
                  <th className="col-provinces px-[14px] py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">Provinces</th>
                  <th className="col-seats px-[14px] py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">Seats</th>
                  <th className="px-[14px] py-[10px] text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">Deadline</th>
                  <th className="px-[14px] py-[10px] text-right text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.3)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length ? filteredData.map((s) => (
                <tr key={s.id} className="border-b border-[rgba(255,255,255,0.04)] transition hover:bg-[rgba(255,255,255,0.03)]">
                  <td className="px-[14px] py-[11px] align-middle text-xs font-semibold text-white max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">{s.title}</td>
                  <td className="col-degrees px-[14px] py-[11px] align-middle text-xs text-[rgba(255,255,255,0.65)]">
                    {(Array.isArray(s.degreeRequired) ? s.degreeRequired : [s.degreeRequired]).filter(Boolean).map((deg: string, idx: number) => (
                      <span key={`${s.id}-deg-${idx}`} className="mr-[4px] inline-flex whitespace-nowrap rounded-md bg-[rgba(37,99,235,0.2)] px-2 py-[3px] text-[10px] font-semibold text-[#60a5fa]">
                        {deg}
                      </span>
                    ))}
                  </td>
                  <td className="col-field px-[14px] py-[11px] align-middle text-xs text-[rgba(255,255,255,0.65)]">{s.fieldRequired}</td>
                  <td className="col-min px-[14px] py-[11px] align-middle text-xs text-[rgba(255,255,255,0.65)]">
                    {s.minimumType}: {s.minimumValue}{s.minimumType === 'Percentage' ? '%' : ''}
                  </td>
                  <td className="col-gender px-[14px] py-[11px] align-middle text-xs text-[rgba(255,255,255,0.65)]">{s.eligibleGender || 'Both'}</td>
                  <td className="px-[14px] py-[11px] align-middle">
                    <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-[3px] text-[10px] font-semibold ${
                      s.scholarshipType === 'Need + Merit' ? 'bg-[rgba(202,138,4,0.2)] text-[#fbbf24]' :
                      s.scholarshipType === 'Merit Based' ? 'bg-[rgba(124,58,237,0.2)] text-[#a78bfa]' :
                      s.scholarshipType === 'Need Based' ? 'bg-[rgba(5,150,105,0.2)] text-[#34d399]' :
                      s.scholarshipType === 'Special Quota' ? 'bg-[rgba(239,68,68,0.2)] text-[#f87171]' :
                      'bg-[rgba(202,138,4,0.2)] text-[#fbbf24]'
                    }`}>
                      {s.scholarshipType || '—'}
                    </span>
                  </td>
                  <td className="col-disabled px-[14px] py-[11px] align-middle text-xs text-[rgba(255,255,255,0.65)]">
                    {s.isForDisabled === 'Yes' ? (
                      <span className="inline-flex whitespace-nowrap rounded-md bg-[rgba(239,68,68,0.2)] px-2 py-[3px] text-[10px] font-semibold text-[#f87171]">
                        Disabled Only
                      </span>
                    ) : (
                      'All'
                    )}
                  </td>
                  <td className="col-provinces px-[14px] py-[11px] align-middle text-xs text-[rgba(255,255,255,0.65)]">
                    {Array.isArray(s.eligibleProvinces) && s.eligibleProvinces.length > 0
                      ? (s.eligibleProvinces.includes('All Pakistan')
                          ? <span className="inline-flex whitespace-nowrap rounded-md border border-[rgba(52,211,153,0.15)] bg-[rgba(5,150,105,0.15)] px-2 py-[3px] text-[10px] font-semibold text-[#34d399]">All Pakistan</span>
                          : s.eligibleProvinces.join(', '))
                      : <span className="inline-flex whitespace-nowrap rounded-md border border-[rgba(52,211,153,0.15)] bg-[rgba(5,150,105,0.15)] px-2 py-[3px] text-[10px] font-semibold text-[#34d399]">All Pakistan</span>}
                  </td>
                  <td className="col-seats px-[14px] py-[11px] align-middle text-xs text-[rgba(255,255,255,0.65)]">{s.quotaSeats || '—'}</td>
                  <td className="px-[14px] py-[11px] align-middle text-xs text-[rgba(255,255,255,0.65)]">{new Date(s.deadline).toLocaleDateString()}</td>
                  <td className="px-[14px] py-[11px] align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEdit(s); setForm(true); }} className="rounded-md border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-[10px] py-1 text-[10px] font-semibold text-[rgba(255,255,255,0.5)] transition hover:border-[rgba(96,165,250,0.3)] hover:bg-[rgba(37,99,235,0.08)] hover:text-[#60a5fa]">
                        Edit
                      </button>
                      <button onClick={() => setDel(s.id)} className="rounded-md border border-[rgba(239,68,68,0.2)] bg-transparent px-[10px] py-1 text-[10px] font-semibold text-[rgba(248,113,113,0.6)] transition hover:border-[rgba(239,68,68,0.4)] hover:bg-[rgba(239,68,68,0.08)] hover:text-[#f87171]">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-[rgba(255,255,255,0.45)]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Database className="h-10 w-10 text-[rgba(255,255,255,0.25)]" />
                      <p>No scholarships found in the database.</p>
                    </div>
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </section>

        {form && <ScholarshipForm init={edit} onSave={save} onCancel={() => setForm(false)} />}
        {del && (
          <div className="fixed inset-0 z-[60]">
            <ConfirmDialog onConfirm={confirmDel} onCancel={() => setDel(null)} />
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-top-row { animation: fadeInUp 0.5s ease both; }
        .admin-stats-grid { animation: fadeInUp 0.5s 0.1s ease both; }
        .admin-table-wrap { animation: fadeInUp 0.5s 0.15s ease both; }
        .admin-pill-dot { animation: pulse 2s infinite; }
        .admin-add-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
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
        @media (max-width: 768px) {
          .admin-content { padding: 20px; }
          .admin-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .admin-top-row h1 { font-size: 20px; }
          .admin-top-actions button { font-size: 11px; padding: 8px 12px; }
          .admin-search { width: 140px; }
        }
        @media (max-width: 480px) {
          .admin-content { padding: 16px; }
          .admin-top-row { flex-direction: column; gap: 12px; }
          .admin-top-row h1 { font-size: 18px; }
          .admin-top-actions { width: 100%; }
          .admin-top-actions button { flex: 1; }
          .admin-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .admin-stats-grid > div { padding: 10px; }
          .admin-stats-grid > div > div:first-child { font-size: 18px; }
          .admin-search { width: 100%; margin-top: 8px; }
          .admin-table-head { align-items: flex-start; flex-direction: column; }
          .col-disabled, .col-seats { display: none; }
          .admin-root > div.pointer-events-none:nth-child(1) { width: 130px; height: 130px; }
          .admin-root > div.pointer-events-none:nth-child(2) { width: 90px; height: 90px; }
          .admin-root > div.pointer-events-none:nth-child(3) { width: 75px; height: 75px; }
        }
        @media (max-width: 360px) {
          .admin-stats-grid { grid-template-columns: 1fr; }
          .admin-search { display: none; }
          .col-degrees, .col-field, .col-min, .col-gender, .col-disabled, .col-provinces, .col-seats { display: none; }
          table { min-width: 540px; }
        }
      `}</style>
      <style jsx global>{`
        html, body { background: #0a0f1e; }
      `}</style>
    </div>
  );
}
