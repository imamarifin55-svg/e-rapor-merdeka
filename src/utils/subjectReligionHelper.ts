import { Subject, Student } from '../types/erapor';

export type StudentReligion = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';

/**
 * Cek apakah mata pelajaran merupakan mata pelajaran Pendidikan Agama
 */
export function isReligionSubject(subject: Subject | string): boolean {
  const name = typeof subject === 'string' ? subject : subject.name;
  const id = typeof subject === 'string' ? subject : subject.id;
  const lower = (name + ' ' + id).toLowerCase();

  return (
    id.startsWith('sub-pai') ||
    id.startsWith('sub-kristen') ||
    id.startsWith('sub-katolik') ||
    id.startsWith('sub-hindu') ||
    id.startsWith('sub-buddha') ||
    lower.includes('agama islam') ||
    lower.includes('agama kristen') ||
    lower.includes('agama katolik') ||
    lower.includes('agama hindu') ||
    lower.includes('agama buddha') ||
    lower.includes('agama budha') ||
    lower.includes('agama konghucu') ||
    lower.includes('agama khonghucu') ||
    lower.includes('pendidikan agama')
  );
}

/**
 * Mendapatkan agama target dari suatu mata pelajaran
 */
export function getSubjectReligion(subject: Subject | string): StudentReligion | null {
  const name = typeof subject === 'string' ? subject : subject.name;
  const id = typeof subject === 'string' ? subject : subject.id;
  const lower = (name + ' ' + id).toLowerCase();

  if (lower.includes('islam') || id === 'sub-pai') return 'Islam';
  if (lower.includes('kristen') || id === 'sub-kristen') return 'Kristen';
  if (lower.includes('katolik') || id === 'sub-katolik') return 'Katolik';
  if (lower.includes('hindu') || id === 'sub-hindu') return 'Hindu';
  if (lower.includes('buddha') || lower.includes('budha') || id === 'sub-buddha') return 'Buddha';
  if (lower.includes('konghucu') || lower.includes('khonghucu')) return 'Konghucu';

  return null;
}

/**
 * Filter daftar siswa yang berhak mengambil mata pelajaran yang dipilih
 * - Jika mapel Pendidikan Agama -> Hanya siswa dengan agama yang sesuai
 * - Jika mapel umum/lainnya -> Seluruh siswa di rombel
 */
export function getEligibleStudentsForSubject(
  subject: Subject | string,
  classStudents: Student[]
): Student[] {
  const subjectRel = getSubjectReligion(subject);
  if (!subjectRel) {
    // Mapel umum atau muatan lokal: diikuti oleh seluruh siswa
    return classStudents;
  }

  // Mapel agama: hanya diikuti oleh siswa yang beragama sama
  return classStudents.filter((student) => {
    const studentRel = (student.religion || 'Islam').trim().toLowerCase();
    return studentRel === subjectRel.toLowerCase();
  });
}

/**
 * Mendapatkan urutan prioritas resmi Kemdikbud Kurikulum Merdeka (SMP Fase D)
 */
export function getKemdikbudSubjectOrder(subject: Subject): number {
  const lowerName = subject.name.toLowerCase();
  const lowerCode = (subject.code || '').toLowerCase();
  const id = subject.id.toLowerCase();

  // 1. Pendidikan Agama dan Budi Pekerti
  if (isReligionSubject(subject)) return 10;

  // 2. Pendidikan Pancasila (PPKn / PKN)
  if (lowerName.includes('pancasila') || lowerCode.includes('pkn') || id.includes('pkn')) return 20;

  // 3. Bahasa Indonesia
  if (lowerName.includes('bahasa indonesia') || lowerCode.includes('bin') || id.includes('indo')) return 30;

  // 4. Matematika
  if (lowerName.includes('matematika') || lowerCode.includes('mtk') || id.includes('mtk')) return 40;

  // 5. Ilmu Pengetahuan Alam (IPA)
  if (lowerName.includes('ilmu pengetahuan alam') || lowerName.includes('(ipa)') || lowerCode.includes('ipa') || id.includes('ipa')) return 50;

  // 6. Ilmu Pengetahuan Sosial (IPS)
  if (lowerName.includes('ilmu pengetahuan sosial') || lowerName.includes('(ips)') || lowerCode.includes('ips') || id.includes('ips')) return 60;

  // 7. Bahasa Inggris
  if (lowerName.includes('bahasa inggris') || lowerCode.includes('big') || id.includes('inggris')) return 70;

  // 8. PJOK
  if (lowerName.includes('jasmani') || lowerName.includes('pjok') || lowerCode.includes('pjk') || id.includes('pjok')) return 80;

  // 9. Informatika
  if (lowerName.includes('informatika') || lowerCode.includes('inf') || id.includes('infor')) return 90;

  // 10. Prakarya / Seni
  if (lowerName.includes('prakarya') || lowerName.includes('seni') || lowerCode.includes('prk') || id.includes('prakarya')) return 100;

  // 11. Bahasa dan Aksara Lampung (Muatan Lokal 1)
  if (lowerName.includes('lampung')) return 110;

  // 12. Pendidikan Karakter Tubaba (Muatan Lokal 2)
  if (lowerName.includes('tubaba') || lowerName.includes('karakter')) return 120;

  // Muatan Lokal lainnya
  if (subject.category === 'Muatan Lokal') return 200;

  // Pilihan
  return 300;
}

/**
 * Mengurutkan mata pelajaran sesuai standar baku Kemdikbud
 */
export function sortKemdikbudSubjects(subjects: Subject[]): Subject[] {
  return [...subjects].sort((a, b) => {
    const orderA = getKemdikbudSubjectOrder(a);
    const orderB = getKemdikbudSubjectOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Mendapatkan mata pelajaran yang diambil oleh siswa tertentu pada rapor
 * - Hanya menyertakan 1 mata pelajaran agama yang sesuai dengan agama siswa
 * - Menyertakan seluruh mapel umum dan muatan lokal
 * - Diurutkan sesuai format baku urutan rapor Kemdikbud
 */
export function getEligibleSubjectsForStudent(
  student: Student | undefined,
  allSubjects: Subject[]
): Subject[] {
  if (!student) return sortKemdikbudSubjects(allSubjects);

  const studentRel = (student.religion || 'Islam').trim().toLowerCase();

  const filtered = allSubjects.filter((subj) => {
    if (!isReligionSubject(subj)) {
      // Non-agama: diambil oleh semua siswa
      return true;
    }
    // Agama: hanya diambil jika agamanya sama dengan agama siswa
    const subjectRel = getSubjectReligion(subj);
    return subjectRel !== null && subjectRel.toLowerCase() === studentRel;
  });

  return sortKemdikbudSubjects(filtered);
}
