import { StudentProfile, Scholarship, EducationHistoryEntry } from '@/types';

const DEGREE_ORDER: Record<string, number> = {
  'PhD': 100,
  'MS': 90,
  'MPhil': 90,
  'BS': 80,
  'BBA': 80,
  'MBBS': 80,
  'BDS': 80,
  'Pharm-D': 80,
  'LLB': 80,
  'Intermediate': 70,
  'Matric': 60,
  'Other': 50
};

const getHighestEducation = (st: StudentProfile): string => {
  let highest = 'Matric';

  if (st.hasIntermediate) highest = 'Intermediate';

  if (st.educationHistory && st.educationHistory.length > 0) {
    st.educationHistory.forEach(edu => {
      const level = edu.degreeLevel;
      if (DEGREE_ORDER[level] > DEGREE_ORDER[highest]) {
        highest = level;
      }
    });
  }

  const status = st.currentStatus?.toLowerCase() || '';
  if (status.includes('phd')) return 'PhD';
  if (status.includes('ms') || status.includes('mphil')) return 'MS';
  if (status.includes('bs') || status.includes('bba') || status.includes('mbbs')) return 'BS';

  return highest;
};

export const degreeMatch = (st: StudentProfile, s: Scholarship) => {
  let sDegs: string[] = [];
  if (Array.isArray(s.degreeRequired)) {
    sDegs = (s.degreeRequired as string[]).map((d: string) => d.toLowerCase());
  } else if (typeof s.degreeRequired === 'string') {
    sDegs = [(s.degreeRequired as string).toLowerCase()];
  }

  if (sDegs.includes('any')) return true;

  const studentLevel = getHighestEducation(st).toLowerCase();
  const prefLevel = st.degreePreference?.toLowerCase();

  // Exact match
  if (sDegs.some(sd => studentLevel.includes(sd) || sd.includes(studentLevel))) return true;
  if (prefLevel && sDegs.some(sd => prefLevel.includes(sd) || sd.includes(prefLevel))) return true;

  // Transition matching
  if (studentLevel === 'matric' && sDegs.includes('intermediate')) return true;
  if (studentLevel === 'intermediate' && sDegs.includes('bs')) return true;
  if (['bs', 'bba', 'mbbs', 'bds', 'pharm-d', 'llb'].some(l => studentLevel.includes(l)) && sDegs.includes('ms')) return true;
  if (['ms', 'mphil'].some(l => studentLevel.includes(l)) && sDegs.includes('phd')) return true;

  return false;
};

export const fieldMatch = (st: StudentProfile, s: Scholarship) => {
  const reqField = s.fieldRequired?.toLowerCase() || '';
  if (!reqField || reqField === 'any' || reqField === 'all disciplines') return true;

  const historyFields = st.educationHistory?.map(e => e.fieldOfStudy) || [];
  const studentFields = [
    st.fieldPreference,
    (st as any).fieldOfStudy,
    ...historyFields
  ].filter(Boolean).map(f => f!.toLowerCase());

  const reqFields = reqField.split(/[\s,\/]+/);
  for (const sf of studentFields) {
    if (reqFields.some(rf => sf.includes(rf) || rf.includes(sf))) return true;
  }
  return false;
};

export const minRequirementCheck = (st: StudentProfile, s: Scholarship) => {
  if (!s.minimumValue || s.minimumValue === 0) return true;

  if (s.minimumType === 'CGPA') {
    let latestCGPA = 0;
    if (st.educationHistory && st.educationHistory.length > 0) {
      const latest = st.educationHistory[st.educationHistory.length - 1];
      latestCGPA = Number(latest.cumulativeCGPA || latest.currentGPA || 0);
    }

    const finalCGPA = Math.max(latestCGPA, Number(st.cgpaOrMarks || 0));
    return finalCGPA >= s.minimumValue;
  }

  if (s.minimumType === 'Percentage') {
    const matricPerc = (st.matricTotalMarks && st.matricObtainedMarks)
      ? (Number(st.matricObtainedMarks) / Number(st.matricTotalMarks)) * 100
      : 0;

    const interPerc = (st.interTotalMarks && st.interObtainedMarks)
      ? (Number(st.interObtainedMarks) / Number(st.interTotalMarks)) * 100
      : 0;

    let uniPerc = 0;
    if (st.educationHistory) {
      st.educationHistory.forEach(edu => {
        if (edu.totalMarks && edu.obtainedMarks) {
          const p = (Number(edu.obtainedMarks) / Number(edu.totalMarks)) * 100;
          if (p > uniPerc) uniPerc = p;
        }
      });
    }

    // Also check CGPA as percentage (3.5/4.0 * 100 = 87.5%)
    let cgpaPerc = 0;
    if (st.educationHistory && st.educationHistory.length > 0) {
      const latest = st.educationHistory[st.educationHistory.length - 1];
      const cgpa = Number(latest.cumulativeCGPA || latest.currentGPA || 0);
      if (cgpa > 0 && cgpa <= 4.0) {
        cgpaPerc = (cgpa / 4.0) * 100;
      }
    }

    const highestPerc = Math.max(matricPerc, interPerc, uniPerc, cgpaPerc);
    return highestPerc >= s.minimumValue;
  }

  return true;
};

export const genderMatch = (st: StudentProfile, s: Scholarship) => {
  if (!s.eligibleGender || s.eligibleGender === 'Both') return true;
  if (s.eligibleGender === 'Female Only') return st.gender === 'Female';
  if (s.eligibleGender === 'Male Only') return st.gender === 'Male';
  return true;
};

export const disabilityMatch = (st: StudentProfile, s: Scholarship) => {
  if (!s.isForDisabled || s.isForDisabled === 'No') return true;
  return st.disability !== 'No' && st.disability !== '';
};

export const provinceMatch = (st: StudentProfile, s: Scholarship) => {
  if (!s.eligibleProvinces || s.eligibleProvinces.length === 0) return true;
  if (s.eligibleProvinces.includes('All Pakistan')) return true;
  return !!(st.province && s.eligibleProvinces.some(
    p => p.toLowerCase() === st.province!.toLowerCase()
  ));
};

export const filterScholarships = (st: StudentProfile, sc: Scholarship[]) => {
  const result = sc.filter(s => {
    const countryOK = s.country === 'Pakistan';
    const degreeOK = degreeMatch(st, s);
    const fieldOK = fieldMatch(st, s);
    const minOK = minRequirementCheck(st, s);
    const genderOK = genderMatch(st, s);
    const disabilityOK = disabilityMatch(st, s);
    const provinceOK = provinceMatch(st, s);

    return countryOK && degreeOK && fieldOK && minOK && genderOK && disabilityOK && provinceOK;
  });
  return result;
};
