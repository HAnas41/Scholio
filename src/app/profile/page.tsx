'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Save, UserCircle, AlertCircle, CheckCircle2, Edit2, X, PlusCircle, GraduationCap } from 'lucide-react';
import { StudentProfile, EducationHistoryEntry } from '@/types';

const defaultForm: Partial<StudentProfile> = {
  name: '', email: '', cnic: '', phone: '', dateOfBirth: '', gender: '', disability: '',
  isPakistanResident: true, city: '', province: '', country: 'Pakistan',
  matricSchoolName: '', matricCity: '', matricBoard: '', matricField: '', matricTotalMarks: '', matricObtainedMarks: '', matricYear: '',
  hasIntermediate: false, interCollegeName: '', interCity: '', interBoard: '', interField: '', interTotalMarks: '', interObtainedMarks: '', interYear: '',
  educationHistory: [],
  fieldPreference: '', degreePreference: '', scholarshipTypePreference: 'Any', preferredProvince: 'All Pakistan',
  currentStatus: ''
};

const PROVINCES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad (ICT)', 'Gilgit-Baltistan', 'Azad Kashmir'];
const BOARDS = ['BISE Lahore', 'BISE Karachi', 'BISE Rawalpindi', 'BISE Multan', 'BISE Faisalabad', 'BISE Peshawar', 'BISE Quetta', 'BISE Gujranwala', 'BISE Sargodha', 'BISE Bahawalpur', 'BISE Dera Ghazi Khan', 'BISE Sahiwal', 'BISE Abbottabad', 'BISE Mardan', 'BISE Swat', 'BISE Hyderabad', 'BISE Sukkur', 'BISE Larkana', 'BISE Mirpurkhas', 'Federal Board', 'IB (International Baccalaureate)', 'Cambridge O-Levels', 'Other'];
const MATRIC_FIELDS = ['Science', 'Arts', 'Commerce', 'Computer Science', 'Pre-Engineering', 'Pre-Medical', 'General', 'Other'];
const INTER_FIELDS = ['Pre-Engineering', 'Pre-Medical', 'ICS (Computer Science)', 'ICom (Commerce)', 'FA (Arts)', 'General Science', 'Cambridge A-Levels', 'Other'];
const DEGREE_LEVELS = ['BS', 'BBA', 'MBBS', 'BDS', 'Pharm-D', 'LLB', 'MPhil', 'MS', 'PhD', 'Other'];
const STATUSES = [
  'Studying (Matric)', 'Studying (Intermediate)', 'Studying (BS)', 'Studying (BBA)', 'Studying (MBBS)', 'Studying (MPhil)', 'Studying (MS)', 'Studying (PhD)',
  'Completed Matric', 'Completed Intermediate', 'Completed BS', 'Completed BBA', 'Completed MBBS', 'Completed MPhil', 'Completed MS', 'Completed PhD',
  'Gap Year', 'Dropout'
];
const PREF_DEGREES = ['Matric', 'Intermediate', 'BS', 'BBA', 'MBBS', 'MPhil', 'MS', 'PhD', 'Any'];

const profileSectionClass =
  'w-full max-w-full bg-[rgba(255,255,255,0.04)] p-6 md:p-8 rounded-[14px] border border-[rgba(255,255,255,0.08)] space-y-6';
const profileSectionHeadingRowClass = 'border-b border-[rgba(255,255,255,0.08)] pb-3 flex items-center gap-2';
const profileSectionHeadingClass = 'text-xl font-bold text-white flex items-center gap-2';
const profileSectionHeaderFlexClass =
  'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(255,255,255,0.08)] pb-3';
const profileFieldFullRowClass = 'md:col-span-2';
const profileFieldLabelClass = 'block text-sm font-semibold text-[rgba(255,255,255,0.6)] mb-1.5';
const profileInputClass =
  'w-full h-12 px-3 box-border bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-base text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors';
const profileInputDisabledClass =
  'w-full h-12 px-3 box-border bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.45)] border border-[rgba(255,255,255,0.1)] rounded-xl text-base cursor-not-allowed outline-none';

const getDegreeHeading = (level: string) => {
  const map: Record<string, string> = {
    BS: "BS / Undergraduate",
    BBA: "BBA / Business",
    MBBS: "MBBS / Medical",
    BDS: "BDS / Dental",
    'Pharm-D': "Pharm-D / Pharmacy",
    LLB: "LLB / Law",
    MPhil: "MPhil / Graduate",
    MS: "MS / Graduate",
    PhD: "PhD / Doctorate",
    Other: "Other Degree"
  };
  return map[level] || "Education Entry";
};

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState<Partial<StudentProfile>>(defaultForm);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (!db) {
        setIsLoading(false);
        return;
      }
      (async () => {
        try {
          const s = await getDoc(doc(db, 'users', user.uid));
          if (s.exists()) {
            const d = s.data();
            const educationHistory = Array.isArray(d.educationHistory) ? d.educationHistory : [];
            setForm(f => ({
              ...f,
              scholarshipTypePreference: 'Any',
              preferredProvince: 'All Pakistan',
              ...d,
              educationHistory,
              email: user.email || ''
            }));
            if (!d.name && user.displayName) setForm(f => ({ ...f, name: user.displayName || '' }));
            if (!d.name && !user.displayName) setIsEditing(true);
          } else {
            setForm(f => ({ ...f, email: user.email || '', name: user.displayName || '', educationHistory: [{ degreeLevel: 'BS', fieldOfStudy: '', universityName: '', city: '', status: 'Currently Enrolled', startYear: 2024 }] }));
            setIsEditing(true);
          }
        } catch (error) {
          console.error('Firestore read failed:', error);
          // keep existing state, don't crash
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addEducation = () => {
    const newEntry: EducationHistoryEntry = {
      degreeLevel: 'BS',
      fieldOfStudy: '',
      universityName: '',
      city: '',
      status: 'Currently Enrolled',
      startYear: 2024
    };
    setForm({ ...form, educationHistory: [...(form.educationHistory || []), newEntry] });
  };

  const removeEducation = (index: number) => {
    const newHistory = [...(form.educationHistory || [])];
    if (newHistory.length <= 1) return;
    newHistory.splice(index, 1);
    setForm({ ...form, educationHistory: newHistory });
  };

  const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newHistory = [...(form.educationHistory || [])];
    newHistory[index] = { ...newHistory[index], [name]: value };
    setForm({ ...form, educationHistory: newHistory });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.isPakistanResident) {
      setMsg({ text: 'Only Pakistani residents are eligible.', type: 'error' });
      return;
    }

    const cnicRegex = /^\d{5}-\d{7}-\d{1}$|^\d{13}$/;
    if (form.cnic && !cnicRegex.test(form.cnic)) {
      setMsg({ text: 'Invalid CNIC format. Use 13 digits or XXXXX-XXXXXXX-X.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      if (!db) throw new Error('Firestore not initialized');
      const history = form.educationHistory || [];
      const latest = history.length > 0 ? history[history.length - 1] : null;

      const payload = {
        ...form,
        country: 'Pakistan',
        cgpaOrMarks: Number(latest?.cumulativeCGPA || latest?.currentGPA || form.interObtainedMarks || form.matricObtainedMarks || 0),
        matricMarks: Number(form.matricObtainedMarks || 0),
        currentUniversity: latest?.universityName || ''
      };

      await setDoc(doc(db, 'users', user!.uid), payload, { merge: true });
      setMsg({ text: 'Profile successfully updated!', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
      setIsEditing(false);
    } catch (err: any) {
      setMsg({ text: 'Error saving profile: ' + err.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const getYears = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => String(start + i));

  const calculateCompletion = () => {
    const coreFields = ['name', 'email', 'cnic', 'phone', 'dateOfBirth', 'gender', 'city', 'province', 'currentStatus', 'matricSchoolName', 'matricBoard', 'matricTotalMarks', 'matricObtainedMarks'];
    let filled = 0;
    let total = coreFields.length;

    coreFields.forEach(k => { if (form[k as keyof StudentProfile]) filled++; });

    if (form.hasIntermediate) {
      const interFields = ['interCollegeName', 'interBoard', 'interTotalMarks', 'interObtainedMarks'];
      total += interFields.length;
      interFields.forEach(k => { if (form[k as keyof StudentProfile]) filled++; });
    }

    if (form.educationHistory && form.educationHistory.length > 0) {
      total += 3;
      if (form.educationHistory[0].universityName) filled++;
      if (form.educationHistory[0].degreeLevel) filled++;
      if (form.educationHistory[0].fieldOfStudy) filled++;
    }

    return Math.round((filled / total) * 100);
  };

  if (!user || isLoading) return <div className="min-h-screen bg-[#0a0f1e] p-8 text-center text-[rgba(255,255,255,0.6)]">Loading...</div>;

  const completionPct = calculateCompletion();
  const initials = (form.name || user.displayName || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="profile-root relative min-h-screen w-full overflow-x-hidden bg-[#0a0f1e] text-white">
      <div className="pointer-events-none absolute right-8 top-4 h-[260px] w-[260px] rounded-full bg-[rgba(37,99,235,0.15)] blur-[70px] z-0" />
      <div className="pointer-events-none absolute bottom-6 left-4 h-[180px] w-[180px] rounded-full bg-[rgba(202,138,4,0.10)] blur-[70px] z-0" />
      <div className="pointer-events-none absolute right-[14%] top-[42%] h-[150px] w-[150px] rounded-full bg-[rgba(124,58,237,0.12)] blur-[70px] z-0" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="profile-content relative z-[2] mx-auto max-w-[800px] px-[28px] py-6">

        {!isEditing ? (
          // ==============================
          // VIEW MODE
          // ==============================
          <div className="space-y-4">
            <div className="profile-top-row mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-[20px] border border-[rgba(96,165,250,0.2)] bg-[rgba(37,99,235,0.12)] px-[10px] py-[3px]">
                  <span className="h-[5px] w-[5px] rounded-full bg-[#60a5fa] animate-pulse-dot" />
                  <span className="text-[10px] uppercase tracking-[0.4px] text-[#60a5fa]">Academic Profile</span>
                </div>
                <h2 className="mb-[6px] text-[24px] font-bold tracking-[-0.5px] text-white">Your Profile</h2>
                <p className="text-[12px] text-[rgba(255,255,255,0.35)]">Manage your academic information and scholarship preferences.</p>
              </div>
              <button onClick={() => setIsEditing(true)} className="profile-edit-btn w-full sm:w-auto flex items-center justify-center gap-2 font-bold py-[10px] px-[18px] rounded-[10px] transition">
                <Edit2 className="w-4 h-4" /> ✎ Edit Profile
              </button>
            </div>

            {msg.text && (
              <div className={`p-4 flex items-center gap-3 rounded-xl mb-6 font-medium ${msg.type === 'error' ? 'bg-[rgba(239,68,68,0.1)] text-[#f87171] border border-[rgba(239,68,68,0.25)]' : 'bg-[rgba(5,150,105,0.12)] text-[#34d399] border border-[rgba(5,150,105,0.25)]'}`}>
                {msg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                {msg.text}
              </div>
            )}

            {/* Profile Header Card */}
            <div className="profile-user-card w-full max-w-full border rounded-[14px] p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="profile-avatar flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] text-[20px] font-bold text-white">
                  {initials || 'U'}
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-white">{form.name || 'Unnamed User'}</h3>
                  <p className="text-[12px] text-[rgba(255,255,255,0.4)]">{form.email}</p>
                  <p className="text-[12px] text-[rgba(255,255,255,0.3)]">{form.city ? `${form.city}, ${form.province}` : 'Location missing'}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-[rgba(255,255,255,0.4)]">Profile Completion</span>
                  <span className="font-bold text-[#fbbf24]">{completionPct}%</span>
                </div>
                <div className="h-[6px] w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                  <div className="profile-progress-fill h-[6px] rounded-full bg-gradient-to-r from-[#ca8a04] to-[#fbbf24]" style={{ ['--target-width' as string]: `${completionPct}%` }} />
                </div>
                {completionPct < 100 && (
                  <p className="mt-2 flex items-center gap-1 text-[12px] text-[#fbbf24]">
                    <AlertCircle className="w-4 h-4" /> Your profile is incomplete. Click Edit Profile to finish.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-[14px] max-w-full">
              {/* Personal Info */}
              <div className="profile-section w-full max-w-full border rounded-[14px] overflow-hidden">
                <div className="profile-section-head profile-section-blue px-[18px] py-[12px] font-bold text-white text-[13px]">Personal Information</div>
                <div className="profile-section-body p-[16px] md:px-[18px] md:py-[16px] grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                  <p className="profile-field"><span className="profile-label">Name</span><span className="profile-value">{form.name || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">CNIC</span><span className="profile-value">{form.cnic || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">Phone</span><span className="profile-value">{form.phone || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">DOB</span><span className="profile-value">{form.dateOfBirth || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">Gender</span><span className="profile-value">{form.gender || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">Disability</span><span className="profile-value">{form.disability || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">City</span><span className="profile-value">{form.city || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">Province</span><span className="profile-value">{form.province || '-'}</span></p>
                  <p className="profile-field md:col-span-2"><span className="profile-label">Resident</span><span className="profile-value">{form.isPakistanResident ? 'Yes' : 'No'}</span></p>
                </div>
              </div>


              {/* Matric */}
              <div className="profile-section w-full max-w-full border rounded-[14px] overflow-hidden">
                <div className="profile-section-head profile-section-amber px-[18px] py-[12px] font-bold text-white text-[13px]">Matric / O-Levels</div>
                <div className="profile-section-body p-[16px] md:px-[18px] md:py-[16px] grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                  <p className="profile-field"><span className="profile-label">School</span><span className="profile-value">{form.matricSchoolName || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">City</span><span className="profile-value">{form.matricCity || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">Board</span><span className="profile-value">{form.matricBoard || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">Field</span><span className="profile-value">{form.matricField || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">Total Marks</span><span className="profile-value">{form.matricTotalMarks || '-'}</span></p>
                  <p className="profile-field"><span className="profile-label">Obtained</span><span className="profile-value">{form.matricObtainedMarks || '-'}</span></p>
                  <p className="profile-field md:col-span-2"><span className="profile-label">Year</span><span className="profile-value">{form.matricYear || '-'}</span></p>
                </div>
              </div>

              {/* Inter */}
              {form.hasIntermediate && (
                <div className="profile-section w-full max-w-full border rounded-[14px] overflow-hidden">
                  <div className="profile-section-head profile-section-purple px-[18px] py-[12px] font-bold text-white text-[13px]">Intermediate / A-Levels</div>
                  <div className="profile-section-body p-[16px] md:px-[18px] md:py-[16px] grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                    <p className="profile-field"><span className="profile-label">College</span><span className="profile-value">{form.interCollegeName || '-'}</span></p>
                    <p className="profile-field"><span className="profile-label">City</span><span className="profile-value">{form.interCity || '-'}</span></p>
                    <p className="profile-field"><span className="profile-label">Board</span><span className="profile-value">{form.interBoard || '-'}</span></p>
                    <p className="profile-field"><span className="profile-label">Field</span><span className="profile-value">{form.interField || '-'}</span></p>
                    <p className="profile-field"><span className="profile-label">Total Marks</span><span className="profile-value">{form.interTotalMarks || '-'}</span></p>
                    <p className="profile-field"><span className="profile-label">Obtained</span><span className="profile-value">{form.interObtainedMarks || '-'}</span></p>
                    <p className="profile-field md:col-span-2"><span className="profile-label">Year</span><span className="profile-value">{form.interYear || '-'}</span></p>
                  </div>
                </div>
              )}

              {/* Education History View Mode */}
              {form.educationHistory?.map((edu, idx) => (
                <div key={idx} className="profile-section w-full max-w-full border rounded-[14px] overflow-hidden">
                  <div className="profile-section-head profile-section-green px-[18px] py-[12px] font-bold text-white text-[13px] flex justify-between items-center gap-2">
                    <span>{getDegreeHeading(edu.degreeLevel)}</span>
                    <span className="status-chip text-[11px] px-3 py-1 rounded-[8px] shrink-0 inline-flex items-center gap-1.5"><span className="status-dot h-1.5 w-1.5 rounded-full bg-[#34d399]" />{edu.status}</span>
                  </div>
                  <div className="profile-section-body p-[16px] md:px-[18px] md:py-[16px] grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                    <p className="profile-field"><span className="profile-label">University</span><span className="profile-value">{edu.universityName || '-'}</span></p>
                    <p className="profile-field"><span className="profile-label">City</span><span className="profile-value">{edu.city || '-'}</span></p>
                    <p className="profile-field"><span className="profile-label">Field</span><span className="profile-value">{edu.fieldOfStudy || '-'}</span></p>
                    <p className="profile-field"><span className="profile-label">Start Year</span><span className="profile-value">{edu.startYear || '-'}</span></p>

                    {edu.status === 'Currently Enrolled' && (
                      <>
                        <p className="profile-field"><span className="profile-label">Semester</span><span className="profile-value">{edu.currentSemester || '-'}</span></p>
                        <p className="profile-field"><span className="profile-label">Current GPA</span><span className="profile-value">{edu.currentGPA || '-'}</span></p>
                      </>
                    )}

                    {(edu.status === 'Completed' || edu.status === 'Currently Enrolled') && (
                      <p className="profile-field"><span className="profile-label">Cumulative CGPA</span><span className="profile-value">{edu.cumulativeCGPA || '-'}</span></p>
                    )}

                    {edu.status === 'Completed' && (
                      <>
                        <p className="profile-field"><span className="profile-label">Total Marks</span><span className="profile-value">{edu.totalMarks || '-'}</span></p>
                        <p className="profile-field"><span className="profile-label">Obtained Marks</span><span className="profile-value">{edu.obtainedMarks || '-'}</span></p>
                        <p className="profile-field"><span className="profile-label">End Year</span><span className="profile-value">{edu.endYear || '-'}</span></p>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Preferences Box */}
              <div className="profile-section w-full max-w-full border rounded-[14px] overflow-hidden">
                <div className="profile-section-head profile-section-blue px-[18px] py-[12px] font-bold text-white text-[13px]">Scholarship Preferences</div>
                <div className="profile-section-body p-[16px] md:px-[18px] md:py-[16px] grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                  <p className="profile-field"><span className="profile-label">Field Preference</span><span className="profile-value">{form.fieldPreference || 'Any'}</span></p>
                  <p className="profile-field"><span className="profile-label">Degree Preference</span><span className="profile-value">{form.degreePreference || 'Any'}</span></p>
                  <p className="profile-field"><span className="profile-label">Scholarship Type</span><span className="profile-value">{form.scholarshipTypePreference || 'Any'}</span></p>
                  <p className="profile-field"><span className="profile-label">Preferred Province</span><span className="profile-value">{form.preferredProvince || 'All Pakistan'}</span></p>
                </div>
              </div>

              {/* Current Status (view) */}
              <div className="profile-section w-full max-w-full border rounded-[14px] overflow-hidden">
                <div className="profile-section-head profile-section-green px-[18px] py-[12px] font-bold text-white text-[13px]">Current Status</div>
                <div className="profile-section-body p-[16px] md:px-[18px] md:py-[16px]">
                  <p className="profile-field"><span className="profile-label">Current Status</span> <span className="status-chip inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-semibold"><span className="status-dot h-1.5 w-1.5 rounded-full bg-[#34d399]" />{form.currentStatus || 'Not specified'}</span></p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // ==============================
          // EDIT MODE
          // ==============================
          <div>
            <div className="mb-8 border-b border-[rgba(255,255,255,0.08)] pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-[#60a5fa]" />
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">Edit Academic Profile</h2>
              </div>
            </div>

            {msg.text && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 flex items-center gap-3 rounded-xl mb-6 font-medium ${msg.type === 'error' ? 'bg-[rgba(239,68,68,0.1)] text-[#f87171] border border-[rgba(239,68,68,0.25)]' : 'bg-[rgba(5,150,105,0.12)] text-[#34d399] border border-[rgba(5,150,105,0.25)]'}`}>
                {msg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                {msg.text}
              </motion.div>
            )}

            <form onSubmit={save} className="space-y-8 text-white">

              {/* SECTION 1: PERSONAL INFORMATION */}
              <section className={profileSectionClass}>
                <h3 className={`${profileSectionHeadingClass} ${profileSectionHeadingRowClass}`}>
                      <span className="w-8 h-8 shrink-0 bg-[rgba(37,99,235,0.25)] text-[#60a5fa] rounded-lg flex items-center justify-center text-sm">1</span>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={profileFieldLabelClass}>Full Name *</label>
                    <input required name="name" value={form.name || ''} onChange={handleChange} placeholder="Full name as per documents" className={profileInputClass} />
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>CNIC *</label>
                    <input required name="cnic" value={form.cnic || ''} onChange={handleChange} placeholder="35201-1234567-1" className={profileInputClass} />
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Phone *</label>
                    <input required name="phone" value={form.phone || ''} onChange={handleChange} placeholder="03001234567" className={profileInputClass} />
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Date of Birth *</label>
                    <input required type="date" name="dateOfBirth" value={form.dateOfBirth || ''} onChange={handleChange} className={profileInputClass} />
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Gender *</label>
                    <select required name="gender" value={form.gender || ''} onChange={handleChange} className={profileInputClass}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option><option value="Female">Female</option><option value="Transgender">Transgender</option>
                    </select>
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Disability *</label>
                    <select required name="disability" value={form.disability || ''} onChange={handleChange} className={profileInputClass}>
                      <option value="">Select Option</option>
                      <option value="No">No</option><option value="Yes - Physical">Yes - Physical</option><option value="Yes - Visual">Yes - Visual</option><option value="Yes - Hearing">Yes - Hearing</option><option value="Yes - Other">Yes - Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>City *</label>
                    <input required name="city" value={form.city || ''} onChange={handleChange} placeholder="e.g. Lahore, Karachi, Islamabad" className={profileInputClass} />
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Province *</label>
                    <select required name="province" value={form.province || ''} onChange={handleChange} className={profileInputClass}>
                      <option value="">Select Province</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className={profileFieldFullRowClass}>
                    <label className={profileFieldLabelClass}>Email</label>
                    <input disabled value={form.email || ''} className={profileInputDisabledClass} />
                  </div>
                  <div className={profileFieldFullRowClass}>
                    <label className="flex items-center gap-3 text-[rgba(255,255,255,0.7)] cursor-pointer">
                      <input type="checkbox" name="isPakistanResident" checked={!!form.isPakistanResident} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0" />
                      <span className="font-medium select-none text-sm sm:text-base">I am currently a resident of Pakistan</span>
                    </label>
                  </div>
                </div>
              </section>

              {/* SECTION 2: MATRIC / O-LEVELS */}
              <section className={profileSectionClass}>
                <h3 className={`${profileSectionHeadingClass} ${profileSectionHeadingRowClass}`}>
                      <span className="w-8 h-8 shrink-0 bg-[rgba(202,138,4,0.25)] text-[#fbbf24] rounded-lg flex items-center justify-center text-sm">2</span>
                  Matric / O-Levels (Required)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={profileFieldLabelClass}>School Name *</label>
                    <input required name="matricSchoolName" value={form.matricSchoolName || ''} onChange={handleChange} placeholder="e.g. Government High School" className={profileInputClass} />
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>School City *</label>
                    <input required name="matricCity" value={form.matricCity || ''} onChange={handleChange} placeholder="e.g. Lahore" className={profileInputClass} />
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Board *</label>
                    <select required name="matricBoard" value={form.matricBoard || ''} onChange={handleChange} className={profileInputClass}>
                      <option value="">Select Board</option>
                      {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Field *</label>
                    <select required name="matricField" value={form.matricField || ''} onChange={handleChange} className={profileInputClass}>
                      <option value="">Select Field</option>
                      {MATRIC_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Total Marks *</label>
                    <input required type="number" name="matricTotalMarks" value={form.matricTotalMarks || ''} onChange={handleChange} placeholder="e.g. 1100" className={profileInputClass} />
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Obtained Marks *</label>
                    <input required type="number" name="matricObtainedMarks" value={form.matricObtainedMarks || ''} onChange={handleChange} placeholder="e.g. 920" className={profileInputClass} />
                  </div>
                  <div className={profileFieldFullRowClass}>
                    <label className={profileFieldLabelClass}>Passing Year *</label>
                    <select required name="matricYear" value={form.matricYear || ''} onChange={handleChange} className={profileInputClass}>
                      <option value="">Select Year</option>
                      {getYears(2015, 2026).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* SECTION 3: INTERMEDIATE / A-LEVELS */}
              <section className={profileSectionClass}>
                <div className={profileSectionHeaderFlexClass}>
                  <h3 className={profileSectionHeadingClass}>
                      <span className="w-8 h-8 shrink-0 bg-[rgba(124,58,237,0.25)] text-[#a78bfa] rounded-lg flex items-center justify-center text-sm">3</span>
                    Intermediate / A-Levels
                  </h3>
                  <label className="flex items-center gap-2 text-[rgba(255,255,255,0.7)] cursor-pointer shrink-0">
                    <input type="checkbox" name="hasIntermediate" checked={!!form.hasIntermediate} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    <span className="font-medium select-none text-sm">Completed Inter/A-Levels</span>
                  </label>
                </div>

                <AnimatePresence>
                  {form.hasIntermediate && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className={profileFieldLabelClass}>College Name *</label>
                          <input required={!!form.hasIntermediate} name="interCollegeName" value={form.interCollegeName || ''} onChange={handleChange} placeholder="e.g. Government College" className={profileInputClass} />
                        </div>
                        <div>
                          <label className={profileFieldLabelClass}>College City *</label>
                          <input required={!!form.hasIntermediate} name="interCity" value={form.interCity || ''} onChange={handleChange} placeholder="e.g. Lahore" className={profileInputClass} />
                        </div>
                        <div>
                          <label className={profileFieldLabelClass}>Board *</label>
                          <select required={!!form.hasIntermediate} name="interBoard" value={form.interBoard || ''} onChange={handleChange} className={profileInputClass}>
                            <option value="">Select Board</option>
                            {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={profileFieldLabelClass}>Field *</label>
                          <select required={!!form.hasIntermediate} name="interField" value={form.interField || ''} onChange={handleChange} className={profileInputClass}>
                            <option value="">Select Field</option>
                            {INTER_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={profileFieldLabelClass}>Total Marks *</label>
                          <input required={!!form.hasIntermediate} type="number" name="interTotalMarks" value={form.interTotalMarks || ''} onChange={handleChange} placeholder="e.g. 1100" className={profileInputClass} />
                        </div>
                        <div>
                          <label className={profileFieldLabelClass}>Obtained Marks *</label>
                          <input required={!!form.hasIntermediate} type="number" name="interObtainedMarks" value={form.interObtainedMarks || ''} onChange={handleChange} placeholder="e.g. 950" className={profileInputClass} />
                        </div>
                        <div className={profileFieldFullRowClass}>
                          <label className={profileFieldLabelClass}>Passing Year *</label>
                          <select required={!!form.hasIntermediate} name="interYear" value={form.interYear || ''} onChange={handleChange} className={profileInputClass}>
                            <option value="">Select Year</option>
                            {getYears(2015, 2026).map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* DYNAMIC EDUCATION SECTIONS */}
              {form.educationHistory?.map((edu, idx) => (
                <section key={idx} className={`${profileSectionClass} relative group`}>
                  <div className={profileSectionHeaderFlexClass}>
                    <h3 className={profileSectionHeadingClass}>
                      <span className="w-8 h-8 shrink-0 bg-[rgba(37,99,235,0.25)] text-[#60a5fa] rounded-lg flex items-center justify-center text-sm">{4 + idx}</span>
                      {getDegreeHeading(edu.degreeLevel)}
                    </h3>
                    {idx > 0 && (
                      <button type="button" onClick={() => removeEducation(idx)} className="p-2 text-[rgba(255,255,255,0.4)] hover:text-[#f87171] transition-colors shrink-0" title="Remove Degree">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={profileFieldLabelClass}>University Name *</label>
                      <input required name="universityName" value={edu.universityName} onChange={(e) => handleEducationChange(idx, e)} placeholder="e.g. NUST, LUMS, UET" className={profileInputClass} />
                    </div>
                    <div>
                      <label className={profileFieldLabelClass}>City *</label>
                      <input required name="city" value={edu.city} onChange={(e) => handleEducationChange(idx, e)} placeholder="e.g. Islamabad" className={profileInputClass} />
                    </div>
                    <div>
                      <label className={profileFieldLabelClass}>Degree Level *</label>
                      <select required name="degreeLevel" value={edu.degreeLevel} onChange={(e) => handleEducationChange(idx, e)} className={profileInputClass}>
                        {DEGREE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={profileFieldLabelClass}>Field of Study *</label>
                      <input required name="fieldOfStudy" value={edu.fieldOfStudy} onChange={(e) => handleEducationChange(idx, e)} placeholder="e.g. Computer Science" className={profileInputClass} />
                    </div>
                    <div className={profileFieldFullRowClass}>
                      <label className={profileFieldLabelClass}>Status *</label>
                      <select required name="status" value={edu.status} onChange={(e) => handleEducationChange(idx, e)} className={profileInputClass}>
                        <option value="Currently Enrolled">Currently Enrolled</option>
                        <option value="Completed">Completed</option>
                        <option value="Dropped Out">Dropped Out</option>
                      </select>
                    </div>

                    {edu.status === 'Currently Enrolled' && (
                      <>
                        <div>
                          <label className={profileFieldLabelClass}>Current Semester</label>
                          <select name="currentSemester" value={edu.currentSemester || ''} onChange={(e) => handleEducationChange(idx, e)} className={profileInputClass}>
                            <option value="">Select Semester</option>
                            {getYears(1, 12).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={profileFieldLabelClass}>Current GPA</label>
                          <input type="number" step="0.01" name="currentGPA" value={edu.currentGPA || ''} onChange={(e) => handleEducationChange(idx, e)} placeholder="e.g. 3.5" className={profileInputClass} />
                        </div>
                      </>
                    )}

                    {(edu.status === 'Completed' || edu.status === 'Currently Enrolled') && (
                      <>
                        <div>
                          <label className={profileFieldLabelClass}>Cumulative CGPA</label>
                          <input type="number" step="0.01" name="cumulativeCGPA" value={edu.cumulativeCGPA || ''} onChange={(e) => handleEducationChange(idx, e)} placeholder="e.g. 3.4" className={profileInputClass} />
                        </div>
                        <div>
                          <label className={profileFieldLabelClass}>Start Year *</label>
                          <select required name="startYear" value={edu.startYear || ''} onChange={(e) => handleEducationChange(idx, e)} className={profileInputClass}>
                            <option value="">Select Year</option>
                            {getYears(2015, 2026).map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </>
                    )}

                    {edu.status === 'Completed' && (
                      <>
                        <div>
                          <label className={profileFieldLabelClass}>Total Marks</label>
                          <input type="number" name="totalMarks" value={edu.totalMarks || ''} onChange={(e) => handleEducationChange(idx, e)} placeholder="e.g. 4000" className={profileInputClass} />
                        </div>
                        <div>
                          <label className={profileFieldLabelClass}>Obtained Marks</label>
                          <input type="number" name="obtainedMarks" value={edu.obtainedMarks || ''} onChange={(e) => handleEducationChange(idx, e)} placeholder="e.g. 3500" className={profileInputClass} />
                        </div>
                      </>
                    )}

                    {edu.status === 'Dropped Out' && (
                      <div className={profileFieldFullRowClass}>
                        <label className={profileFieldLabelClass}>Start Year *</label>
                        <select required name="startYear" value={edu.startYear || ''} onChange={(e) => handleEducationChange(idx, e)} className={profileInputClass}>
                          <option value="">Select Year</option>
                          {getYears(2015, 2026).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    )}

                    {edu.status === 'Completed' && (
                      <div className={profileFieldFullRowClass}>
                        <label className={profileFieldLabelClass}>Expected Graduation Year *</label>
                        <select required name="endYear" value={edu.endYear || ''} onChange={(e) => handleEducationChange(idx, e)} className={profileInputClass}>
                          <option value="">Select Year</option>
                          {getYears(2015, 2030).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    )}

                    {edu.status === 'Currently Enrolled' && (
                      <div className={profileFieldFullRowClass}>
                        <label className={profileFieldLabelClass}>Expected Graduation Year</label>
                        <select name="endYear" value={edu.endYear || ''} onChange={(e) => handleEducationChange(idx, e)} className={profileInputClass}>
                          <option value="">Select year (optional)</option>
                          {getYears(2015, 2030).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </section>
              ))}

              {/* ADD ANOTHER DEGREE BUTTON */}
              <div className="flex justify-center">
                <button type="button" onClick={addEducation} className="flex items-center gap-2 bg-[rgba(37,99,235,0.15)] border border-[rgba(96,165,250,0.25)] text-[#60a5fa] hover:bg-[rgba(37,99,235,0.22)] font-bold py-3 px-8 rounded-2xl transition">
                  <PlusCircle className="w-5 h-5" /> Add Another Degree
                </button>
              </div>

              {/* SCHOLARSHIP PREFERENCES */}
              <section className={profileSectionClass}>
                <h3 className={`${profileSectionHeadingClass} ${profileSectionHeadingRowClass}`}>
                  <span className="w-8 h-8 shrink-0 bg-[rgba(37,99,235,0.25)] text-[#60a5fa] rounded-lg flex items-center justify-center text-sm">{4 + (form.educationHistory?.length || 0)}</span>
                  Scholarship Preferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={profileFieldLabelClass}>Field Preference</label>
                    <input name="fieldPreference" value={form.fieldPreference || ''} onChange={handleChange} placeholder="e.g. Engineering, IT, Medical" className={profileInputClass} />
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Degree Preference</label>
                    <select name="degreePreference" value={form.degreePreference || ''} onChange={handleChange} className={profileInputClass}>
                      <option value="">Select Preference</option>
                      {PREF_DEGREES.map(d => <option key={d} value={d}>{d} level</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Scholarship Type Preference</label>
                    <select name="scholarshipTypePreference" value={form.scholarshipTypePreference || 'Any'} onChange={handleChange} className={profileInputClass}>
                      <option value="Any">Any</option>
                      <option value="Need Based">Need Based</option>
                      <option value="Merit Based">Merit Based</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className={profileFieldLabelClass}>Preferred Province</label>
                    <select name="preferredProvince" value={form.preferredProvince || 'All Pakistan'} onChange={handleChange} className={profileInputClass}>
                      <option value="All Pakistan">All Pakistan</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* CURRENT STATUS */}
              <section className={profileSectionClass}>
                <h3 className={`${profileSectionHeadingClass} ${profileSectionHeadingRowClass}`}>
                  <span className="w-8 h-8 shrink-0 bg-[rgba(5,150,105,0.25)] text-[#34d399] rounded-lg flex items-center justify-center text-sm">{5 + (form.educationHistory?.length || 0)}</span>
                  Current Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={profileFieldFullRowClass}>
                    <label className={profileFieldLabelClass}>Current Status *</label>
                    <select required name="currentStatus" value={form.currentStatus || ''} onChange={handleChange} className={profileInputClass}>
                      <option value="">Select Status</option>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 flex items-center justify-center gap-2 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.85)] font-bold p-4 rounded-xl transition order-2 sm:order-1">
                  <X className="h-5 w-5" /> Cancel
                </button>
                <button disabled={isSaving} className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] text-white font-bold p-4 rounded-xl transition disabled:opacity-50 order-1 sm:order-2">
                  <Save className="h-5 w-5" /> {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        )}
        <style jsx>{`
          .profile-top-row { animation: fadeInUp 0.5s ease both; }
          .profile-user-card {
            background: rgba(255,255,255,0.04);
            border-color: rgba(255,255,255,0.08);
            animation: fadeInUp 0.5s 0.1s ease both;
          }
          .profile-edit-btn {
            background: linear-gradient(135deg, #1d4ed8, #7c3aed);
            position: relative;
            overflow: hidden;
            font-size: 13px;
          }
          .profile-edit-btn::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
            background-size: 400px 100%;
            animation: shimmer 2.5s infinite;
            pointer-events: none;
          }
          .profile-progress-fill {
            width: var(--target-width);
            animation: progressFill 1.5s ease both;
          }
          .profile-section {
            background: rgba(255,255,255,0.04);
            border-color: rgba(255,255,255,0.08);
            animation: fadeInUp 0.5s ease both;
          }
          .profile-section:nth-child(1) { animation-delay: 0.15s; }
          .profile-section:nth-child(2) { animation-delay: 0.2s; }
          .profile-section:nth-child(3) { animation-delay: 0.25s; }
          .profile-section:nth-child(4) { animation-delay: 0.3s; }
          .profile-section:nth-child(5) { animation-delay: 0.35s; }
          .profile-section-head { border-bottom: 1px solid; }
          .profile-section-blue {
            background: rgba(37,99,235,0.15);
            border-color: rgba(37,99,235,0.2);
          }
          .profile-section-amber {
            background: rgba(202,138,4,0.12);
            border-color: rgba(202,138,4,0.2);
          }
          .profile-section-purple {
            background: rgba(124,58,237,0.12);
            border-color: rgba(124,58,237,0.2);
          }
          .profile-section-green {
            background: rgba(5,150,105,0.12);
            border-color: rgba(5,150,105,0.2);
          }
          .profile-field { display: flex; flex-direction: column; gap: 4px; }
          .profile-label {
            font-size: 10px;
            color: rgba(255,255,255,0.3);
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }
          .profile-value {
            font-size: 13px;
            color: #fff;
            font-weight: 500;
          }
          .status-chip {
            background: rgba(5,150,105,0.15);
            border: 1px solid rgba(52,211,153,0.2);
            color: #34d399;
          }
          .status-dot { animation: pulse 2s infinite; }
          select option {
            background-color: #1a2235;
            color: #e2e8f0;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%,100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
          @keyframes progressFill {
            from { width: 0; }
            to { width: var(--target-width); }
          }
          @media (min-width: 1280px) {
            .profile-content { padding: 28px 40px; }
          }
          @media (max-width: 768px) {
            .profile-content { padding: 20px; }
            .profile-top-row h2 { font-size: 20px; }
            .profile-edit-btn { font-size: 12px; padding: 8px 14px; }
          }
          @media (max-width: 480px) {
            .profile-content { padding: 16px; }
            .profile-top-row { flex-direction: column; gap: 12px; }
            .profile-top-row h2 { font-size: 18px; }
            .profile-edit-btn { width: 100%; justify-content: center; }
            .profile-avatar { width: 44px; height: 44px; font-size: 16px; }
            .profile-user-card h3 { font-size: 16px; }
            .profile-section-body { padding: 12px 14px; }
            .profile-section-head { padding: 10px 14px; }
            .profile-section-body { grid-template-columns: 1fr !important; }
            .profile-root > div.pointer-events-none:nth-child(1) { width: 130px; height: 130px; }
            .profile-root > div.pointer-events-none:nth-child(2) { width: 90px; height: 90px; }
            .profile-root > div.pointer-events-none:nth-child(3) { width: 75px; height: 75px; }
          }
          @media (max-width: 360px) {
            .profile-content { padding: 12px; }
            .profile-avatar { width: 36px; height: 36px; font-size: 13px; }
            .profile-user-card { padding: 14px; }
            .profile-section-head > span:first-child { display: none; }
          }
        `}</style>
        <style jsx global>{`
          html, body { background: #0a0f1e; }
        `}</style>
      </motion.div>
    </div>
  );
}
