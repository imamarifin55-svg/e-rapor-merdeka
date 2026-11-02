/**
 * Model data standar e-Rapor Kurikulum Merdeka Kemendikbudristek
 */

export type UserRole = 'admin' | 'guru' | 'wali_kelas' | 'siswa';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  nip?: string;
  email: string;
  assignedClass?: string;
  assignedSubjectIds?: string[];
}

export interface SchoolProfile {
  id: string;
  name: string;
  npsn: string;
  nss?: string;
  level: 'SD' | 'SMP' | 'SMA' | 'SMK';
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  headmasterName: string;
  headmasterNip: string;
  reportDate: string;
  reportPlace: string;
  curriculum: 'Kurikulum Merdeka' | 'Kurikulum 2013';
}

export interface AcademicYear {
  id: string;
  year: string; // e.g. "2025/2026"
  semester: 'Ganjil' | 'Genap';
  isActive: boolean;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  role: 'Guru Mapel' | 'Wali Kelas' | 'Kepala Sekolah' | 'Kurikulum';
  assignedSubjectIds: string[];
  homeroomClassId?: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  religion: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  classId: string;
  className: string;
  parentName: string;
  parentPhone: string;
  address: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "Kelas 7A", "Kelas 8B"
  gradeLevel: number; // 7, 8, 9
  phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; // Fase Kurikulum Merdeka (SMP = Fase D)
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  studentCount?: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: 'Kelompok Umum' | 'Muatan Lokal' | 'Pilihan';
  kktp: number; // Kriteria Ketercapaian Tujuan Pembelajaran (default e.g. 75)
  weightSLM: number; // Bobot Sumatif Lingkup Materi (%) e.g. 60
  weightSAS: number; // Bobot Sumatif Akhir Semester (%) e.g. 40
  teacherId: string;
  teacherName: string;
}

export interface LearningObjective {
  id: string;
  subjectId: string;
  classId: string;
  semester: 'Ganjil' | 'Genap';
  code: string; // e.g. "TP 1", "TP 2"
  description: string; // e.g. "Memahami operasi bilangan bulat dan pecahan dalam masalah nyata"
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  semester: 'Ganjil' | 'Genap';
  academicYearId: string;
  // Nilai Formatif per TP
  formatifScores: Record<string, number>;
  // Nilai Sumatif Lingkup Materi per TP
  sumatifScores: Record<string, number>;
  // Nilai Sumatif Akhir Semester (SAS / ASAS)
  sumatifAkhirSemester: number;
  // Nilai Akhir hasil kalkulasi
  nilaiAkhir: number;
  // Narasi capaian otomatis
  highestCompetencyNarrative: string;
  lowestCompetencyNarrative: string;
  isLocked?: boolean;
}

export interface AttendanceRecord {
  studentId: string;
  classId: string;
  semester: 'Ganjil' | 'Genap';
  academicYearId: string;
  sakit: number;
  izin: number;
  tanpaKeterangan: number;
}

export interface ExtracurricularRecord {
  id: string;
  studentId: string;
  classId: string;
  semester: 'Ganjil' | 'Genap';
  academicYearId: string;
  name: string; // e.g. "Pramuka", "PMR", "Futsal", "English Club"
  predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  description: string;
}

export interface StudentHomeroomNote {
  studentId: string;
  classId: string;
  semester: 'Ganjil' | 'Genap';
  academicYearId: string;
  notes: string;
  decision?: 'Naik ke kelas berikutnya' | 'Lulus' | 'Tinggal di kelas' | 'Melanjutkan ke Semester 2';
}

export interface SystemBackupData {
  version: string;
  appName: string;
  timestamp: string;
  schoolProfile: SchoolProfile;
  academicYears: AcademicYear[];
  classes: ClassRoom[];
  subjects: Subject[];
  teachers: Teacher[];
  students: Student[];
  learningObjectives: LearningObjective[];
  grades: GradeRecord[];
  attendances: AttendanceRecord[];
  extracurriculars: ExtracurricularRecord[];
  homeroomNotes: StudentHomeroomNote[];
}
