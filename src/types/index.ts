export type UserRole = 'ADMIN' | 'FACULTY';
export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface AuthUser {
  userId: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface Faculty {
  id: number;
  name: string;
  designation?: string;
  mobile?: string;
  photoUrl?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  category?: string;
  orcidId?: string;
  highestQualification?: string;
  specialization?: string[];
  joiningDate?: string;
  experienceYears?: number;
  departmentId: number;
  department?: Department;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface CourseCatalog {
  id: number;
  name: string;
  code: string;
  level: 'UG' | 'PG' | 'PHD';
  credits?: number;
  department?: Department;
}

export interface FacultyCourse {
  id: number;
  facultyId: number;
  catalogCourseId: number;
  semester: string;
  academicYear: string;
  role: string;
  hoursPerWeek?: number;
  mode?: string;
  notes?: string;
  createdAt: string;
  catalogCourse?: CourseCatalog;
  department?: Department;
}

export interface Experience {
  id: number;
  facultyId: number;
  type: 'TEACHING' | 'INDUSTRIAL' | 'RESEARCH' | 'ADMINISTRATIVE';
  designation: string;
  organization: string;
  startDate: string;
  endDate?: string;
  location?: string;
  natureOfWork?: string;
  payScale?: string;
}

export interface Publication {
  id: number;
  facultyId: number;
  category: 'JOURNAL' | 'CONFERENCE' | 'BOOK' | 'BOOK_CHAPTER';
  title: string;
  authors: string[];
  venue?: string;
  year: number;
  doi?: string;
  url?: string;
  pages?: string;
  publisher?: string;
  citation?: string;
  indexing: 'SCI' | 'SCOPUS' | 'NONE';
}