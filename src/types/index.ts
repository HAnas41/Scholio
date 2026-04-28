export interface EducationHistoryEntry {
  degreeLevel: 'BS' | 'BBA' | 'MBBS' | 'BDS' | 'Pharm-D' | 'LLB' | 'MPhil' | 'MS' | 'PhD' | 'Other';
  fieldOfStudy: string;
  universityName: string;
  city: string;
  status: 'Currently Enrolled' | 'Completed' | 'Dropped Out';
  currentSemester?: number | '';
  currentGPA?: number | '';
  cumulativeCGPA?: number | '';
  totalMarks?: number | '';
  obtainedMarks?: number | '';
  startYear: number | '';
  endYear?: number | '';
}

export interface StudentProfile {
  // Section 1: Personal Information
  name: string;
  email: string;
  cnic: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Transgender' | '';
  disability: 'No' | 'Yes - Physical' | 'Yes - Visual' | 'Yes - Hearing' | 'Yes - Other' | '';
  isPakistanResident: boolean;
  city: string;
  province: 'Punjab' | 'Sindh' | 'Khyber Pakhtunkhwa' | 'Balochistan' | 'Islamabad (ICT)' | 'Gilgit-Baltistan' | 'Azad Kashmir' | '';
  country: 'Pakistan';

  // Section 2: Matric / O-Levels (Required)
  matricSchoolName: string;
  matricCity: string;
  matricBoard: string;
  matricField: string;
  matricTotalMarks: number | '';
  matricObtainedMarks: number | '';
  matricYear: string;

  // Section 3: Intermediate / A-Levels (Optional)
  hasIntermediate: boolean;
  interCollegeName?: string;
  interCity?: string;
  interBoard?: string;
  interField?: string;
  interTotalMarks?: number | '';
  interObtainedMarks?: number | '';
  interYear?: string;

  // Section 4: Education History (Dynamic)
  educationHistory: EducationHistoryEntry[];

  // Section 5: Scholarship Preferences
  fieldPreference?: string;
  fieldOfStudy?: string;
  degreePreference?: string;
  scholarshipTypePreference?: 'Need Based' | 'Merit Based' | 'Both' | 'Any';
  preferredProvince?: string;

  // Section 6: Current Status
  currentStatus: string;
  
  role?: 'student' | 'admin';

  // Legacy fields for backward compatibility
  cgpaOrMarks?: number;
  matricMarks?: number;
  currentUniversity?: string;
}

export interface Scholarship {
  id: string;
  title: string;
  country: string;
  city?: string;
  province?: string;
  degreeRequired: string[];
  fieldRequired: string;
  minimumType: 'CGPA' | 'Percentage';
  minimumValue: number;
  deadline: string;
  applyLink: string;
  description: string;
  eligibleGender: 'Both' | 'Female Only' | 'Male Only';
  scholarshipType: 'Need Based' | 'Merit Based' | 'Need + Merit' | 'Special Quota';
  quotaSeats?: number;
  isForDisabled: 'No' | 'Yes';
  eligibleProvinces: string[];
}

export interface MatchResult {
  scholarship_id: string;
  match_score: number;
  explanation: string;
}
