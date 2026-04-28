import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

export default function ScholarshipForm({ init, onSave, onCancel }: any) {
  const [f, setF] = useState({
    title: '', 
    country: 'Pakistan', 
    degreeRequired: [], 
    fieldRequired: '', 
    minimumType: 'CGPA',
    minimumValue: '', 
    deadline: '', 
    applyLink: '', 
    description: '',
    eligibleGender: 'Both',
    scholarshipType: 'Merit Based',
    quotaSeats: '',
    isForDisabled: 'No',
    eligibleProvinces: ['All Pakistan'],
    ...init
  });

  const degrees = ["Matric", "Intermediate", "BS", "MS", "Any"];
  const provinces = ["All Pakistan", "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad (ICT)", "Gilgit-Baltistan", "Azad Kashmir", "FATA"];

  const toggleDegree = (deg: string) => {
    let newDegs = [...f.degreeRequired];
    if (newDegs.includes(deg)) {
      newDegs = newDegs.filter(d => d !== deg);
    } else {
      newDegs.push(deg);
    }
    setF({ ...f, degreeRequired: newDegs });
  };

  const toggleProvince = (prov: string) => {
    if (prov === 'All Pakistan') {
      // Toggle All Pakistan: if already selected, deselect; else select only All Pakistan
      const isSelected = f.eligibleProvinces.includes('All Pakistan');
      setF({ ...f, eligibleProvinces: isSelected ? [] : ['All Pakistan'] });
      return;
    }
    // When selecting a specific province, remove 'All Pakistan' if present
    let newProvs = f.eligibleProvinces.filter((p: string) => p !== 'All Pakistan');
    if (newProvs.includes(prov)) {
      newProvs = newProvs.filter((p: string) => p !== prov);
    } else {
      newProvs.push(prov);
    }
    setF({ ...f, eligibleProvinces: newProvs });
  };

  const submit = (e: any) => {
    e.preventDefault();
    if (f.degreeRequired.length === 0) {
      alert("Please select at least one degree requirement.");
      return;
    }
    if (f.eligibleProvinces.length === 0) {
      alert("Please select at least one province or choose 'All Pakistan'.");
      return;
    }
    const payload: any = { 
      ...f, 
      minimumValue: Number(f.minimumValue),
    };
    if (f.quotaSeats !== '' && f.quotaSeats !== null) {
      payload.quotaSeats = Number(f.quotaSeats);
    } else {
      delete payload.quotaSeats;
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-[rgba(0,0,0,0.7)] p-4 backdrop-blur-[4px]">
      <motion.form 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={submit} 
        className="modal-scroll my-4 max-h-[90vh] w-[90%] max-w-[520px] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#111827] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-[20px] font-bold tracking-[-0.3px] text-white">
            {init ? 'Edit Scholarship' : 'New Scholarship'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.5)] transition hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        
        <div className="space-y-4 text-white">

          {/* Title */}
          <div>
            <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Title *</label>
            <input 
              className="w-full rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[13px] text-white outline-none transition placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(96,165,250,0.5)] focus:bg-[rgba(255,255,255,0.07)]" 
              value={f.title} 
              onChange={e => setF({ ...f, title: e.target.value })} 
              placeholder="e.g. HEC Indigenous Scholarship" 
              required 
            />
          </div>
          
          {/* Degree Required - Checkboxes */}
          <div>
            <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Degree Required *</label>
            <div className="flex flex-wrap gap-3 rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-3">
              {degrees.map(deg => (
                <label key={deg} className="flex min-w-[120px] items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={f.degreeRequired.includes(deg)} 
                    onChange={() => toggleDegree(deg)}
                    className="h-4 w-4 cursor-pointer appearance-none rounded-[5px] border-[1.5px] border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] checked:border-[#2563eb] checked:bg-[#2563eb]"
                  />
                  <span className="cursor-pointer text-[13px] text-[rgba(255,255,255,0.7)]">{deg}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Min Requirement Type + Value */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Min Requirement Type *</label>
              <select 
                className="w-full cursor-pointer rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[13px] text-white outline-none transition focus:border-[rgba(96,165,250,0.5)]" 
                value={f.minimumType} 
                onChange={e => setF({ ...f, minimumType: e.target.value })}
              >
                <option value="CGPA">CGPA (out of 4.0)</option>
                <option value="Percentage">Percentage (out of 100)</option>
              </select>
            </div>
            <div>
              <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Min Value *</label>
              <input 
                className="w-full rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[13px] text-white outline-none transition placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(96,165,250,0.5)] focus:bg-[rgba(255,255,255,0.07)]" 
                type="number" 
                step="any" 
                value={isNaN(f.minimumValue) ? '' : f.minimumValue} 
                onChange={e => setF({ ...f, minimumValue: e.target.value })} 
                placeholder={f.minimumType === 'CGPA' ? "e.g. 3.0" : "e.g. 75"} 
                required 
              />
            </div>
          </div>

          {/* Field Required + Deadline */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Field Reqd *</label>
              <input 
                className="w-full rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[13px] text-white outline-none transition placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(96,165,250,0.5)] focus:bg-[rgba(255,255,255,0.07)]" 
                value={f.fieldRequired} 
                onChange={e => setF({ ...f, fieldRequired: e.target.value })} 
                placeholder="e.g. Engineering, Any" 
                required 
              />
            </div>
            <div>
              <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Deadline *</label>
              <input 
                className="w-full cursor-pointer rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[13px] text-white outline-none transition focus:border-[rgba(96,165,250,0.5)] focus:bg-[rgba(255,255,255,0.07)]" 
                type="date" 
                value={f.deadline} 
                onChange={e => setF({ ...f, deadline: e.target.value })} 
                required 
              />
            </div>
          </div>

          {/* Gender Eligibility + Scholarship Type */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Gender Eligibility *</label>
              <select 
                className="w-full cursor-pointer rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[13px] text-white outline-none transition focus:border-[rgba(96,165,250,0.5)]" 
                value={f.eligibleGender} 
                onChange={e => setF({ ...f, eligibleGender: e.target.value })}
                required
              >
                <option value="Both">Both</option>
                <option value="Female Only">Female Only</option>
                <option value="Male Only">Male Only</option>
              </select>
            </div>
            <div>
              <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Scholarship Type *</label>
              <select 
                className="w-full cursor-pointer rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[13px] text-white outline-none transition focus:border-[rgba(96,165,250,0.5)]" 
                value={f.scholarshipType} 
                onChange={e => setF({ ...f, scholarshipType: e.target.value })}
                required
              >
                <option value="Need Based">Need Based</option>
                <option value="Merit Based">Merit Based</option>
                <option value="Need + Merit">Need + Merit</option>
                <option value="Special Quota">Special Quota</option>
              </select>
            </div>
          </div>

          {/* For Disabled + Quota Seats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">For Disabled Students *</label>
              <select 
                className="w-full cursor-pointer rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[13px] text-white outline-none transition focus:border-[rgba(96,165,250,0.5)]" 
                value={f.isForDisabled} 
                onChange={e => setF({ ...f, isForDisabled: e.target.value })}
                required
              >
                <option value="No">No (for all students)</option>
                <option value="Yes">Yes (disabled students only)</option>
              </select>
            </div>
            <div>
              <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Quota Seats (optional)</label>
              <input 
                className="w-full rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[13px] text-white outline-none transition placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(96,165,250,0.5)] focus:bg-[rgba(255,255,255,0.07)]" 
                type="number" 
                min="0"
                value={isNaN(f.quotaSeats) ? '' : f.quotaSeats} 
                onChange={e => setF({ ...f, quotaSeats: e.target.value })} 
                placeholder="e.g. 50"
              />
            </div>
          </div>

          {/* Province Eligibility - Checkboxes */}
          <div>
            <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Province Eligibility *</label>
            <div className="flex flex-wrap gap-2 rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-3">
              {provinces.map(prov => (
                <label key={prov} className="flex min-w-[180px] items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={f.eligibleProvinces.includes(prov)} 
                    onChange={() => toggleProvince(prov)}
                    className="h-4 w-4 cursor-pointer appearance-none rounded-[5px] border-[1.5px] border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] checked:border-[#2563eb] checked:bg-[#2563eb]"
                  />
                  <span className={`cursor-pointer text-[13px] ${prov === 'All Pakistan' ? 'font-semibold text-[#34d399]' : 'text-[rgba(255,255,255,0.7)]'}`}>{prov}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Apply Link */}
          <div>
            <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Apply Link *</label>
            <input 
              className="w-full rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[13px] text-white outline-none transition placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(96,165,250,0.5)] focus:bg-[rgba(255,255,255,0.07)]" 
              type="url"
              value={f.applyLink} 
              onChange={e => setF({ ...f, applyLink: e.target.value })} 
              placeholder="https://..." 
              required 
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-[6px] block text-[10px] font-bold uppercase tracking-[0.5px] text-[rgba(255,255,255,0.4)]">Description *</label>
            <textarea 
              className="h-24 w-full resize-none rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-[14px] py-[10px] text-[13px] text-white outline-none transition placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(96,165,250,0.5)] focus:bg-[rgba(255,255,255,0.07)]" 
              value={f.description} 
              onChange={e => setF({ ...f, description: e.target.value })} 
              placeholder="Detailed scholarship description..." 
              required 
            />
          </div>

        </div>

        <div className="mt-2 flex flex-col gap-3">
          <button 
            type="button" 
            onClick={onCancel} 
            className="w-full rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-[13px] font-semibold text-[rgba(255,255,255,0.7)] transition hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-btn relative w-full overflow-hidden rounded-[10px] border-0 bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-[1px] hover:opacity-90"
          >
            Save Scholarship
          </button>
        </div>
        <style jsx>{`
          select option {
            background: #1a2235;
            color: #ffffff;
          }
          input[type='date'] {
            color-scheme: dark;
          }
          .save-btn::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
            background-size: 400px 100%;
            animation: shimmer 2.5s infinite;
            pointer-events: none;
          }
          .modal-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .modal-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .modal-scroll::-webkit-scrollbar-thumb {
            border-radius: 99px;
            background: rgba(255,255,255,0.1);
          }
          @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
        `}</style>
      </motion.form>
    </div>
  );
}
