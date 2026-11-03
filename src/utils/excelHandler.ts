import * as XLSX from 'xlsx';
import { Student, Subject, ClassRoom, LearningObjective, GradeRecord } from '../types/erapor';
import { isReligionSubject, getSubjectReligion, sortKemdikbudSubjects } from './subjectReligionHelper';

/**
 * Unduh Template Excel untuk Data Siswa
 */
export function downloadStudentTemplateExcel() {
  const templateData = [
    {
      'NIS': '250711',
      'NISN': '0089123411',
      'Nama Lengkap': 'Zahra Amelia Ramadhani',
      'Jenis Kelamin (L/P)': 'P',
      'Tempat Lahir': 'Semarang',
      'Tanggal Lahir': '12 April 2011',
      'Agama': 'Islam',
      'Kelas': 'Kelas VII-A',
      'Nama Orang Tua / Wali': 'Heri Siswanto',
      'Nomor HP Ortu': '081234999888',
      'Alamat': 'Jl. Gajah Mada No. 45, Semarang',
    },
    {
      'NIS': '250712',
      'NISN': '0089123412',
      'Nama Lengkap': 'Dimas Bagas Satrio',
      'Jenis Kelamin (L/P)': 'L',
      'Tempat Lahir': 'Kendal',
      'Tanggal Lahir': '05 Juni 2011',
      'Agama': 'Islam',
      'Kelas': 'Kelas VII-A',
      'Nama Orang Tua / Wali': 'Satrio Wibowo',
      'Nomor HP Ortu': '081234999889',
      'Alamat': 'Jl. Beringin Asri No. 10, Semarang',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  // Auto-width columns
  ws['!cols'] = [
    { wch: 10 },
    { wch: 14 },
    { wch: 28 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 25 },
    { wch: 16 },
    { wch: 35 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
  XLSX.writeFile(wb, 'Format_Impor_Data_Siswa_eRapor.xlsx');
}

/**
 * Ekspor Data Siswa Terdaftar ke Excel
 */
export function exportStudentsToExcel(students: Student[], className?: string) {
  const exportData = students.map((s, idx) => ({
    'No': idx + 1,
    'NIS': s.nis,
    'NISN': s.nisn,
    'Nama Lengkap': s.name,
    'Jenis Kelamin': s.gender,
    'Tempat Lahir': s.birthPlace,
    'Tanggal Lahir': s.birthDate,
    'Agama': s.religion,
    'Kelas': s.className,
    'Nama Orang Tua': s.parentName,
    'Kontak Ortu': s.parentPhone,
    'Alamat': s.address,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 10 },
    { wch: 14 },
    { wch: 28 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 25 },
    { wch: 16 },
    { wch: 35 },
  ];

  const wb = XLSX.utils.book_new();
  const sheetName = className ? className.replace(/[^a-zA-Z0-9]/g, '_') : 'Data Siswa';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `Data_Siswa_${sheetName}.xlsx`);
}

/**
 * Baca dan parsing file Excel untuk sinkronisasi siswa massal
 */
export async function parseStudentsFromExcel(
  file: File,
  targetClassId: string,
  targetClassName: string
): Promise<{ students: Student[]; warnings: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        const warnings: string[] = [];
        const students: Student[] = [];

        rawJson.forEach((row, idx) => {
          const name = row['Nama Lengkap'] || row['Nama'] || row['nama'] || row['NAMA'];
          const nisn = String(row['NISN'] || row['nisn'] || '').trim();
          const nis = String(row['NIS'] || row['nis'] || '').trim();

          if (!name) {
            warnings.push(`Baris ${idx + 2}: Nama siswa kosong, baris dilewati.`);
            return;
          }

          const genderRaw = String(row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || row['JK'] || 'L').toUpperCase();
          const gender: 'L' | 'P' = genderRaw.startsWith('P') ? 'P' : 'L';

          const student: Student = {
            id: `std-imp-${Date.now()}-${idx}`,
            nis: nis || `${250000 + idx + 1}`,
            nisn: nisn || `0089${Math.floor(100000 + Math.random() * 900000)}`,
            name: String(name).trim(),
            gender,
            birthPlace: String(row['Tempat Lahir'] || 'Semarang').trim(),
            birthDate: String(row['Tanggal Lahir'] || '01-01-2011').trim(),
            religion: (row['Agama'] as any) || 'Islam',
            classId: targetClassId,
            className: targetClassName,
            parentName: String(row['Nama Orang Tua / Wali'] || row['Nama Orang Tua'] || '-').trim(),
            parentPhone: String(row['Nomor HP Ortu'] || row['Kontak Ortu'] || '-').trim(),
            address: String(row['Alamat'] || '-').trim(),
          };

          students.push(student);
        });

        resolve({ students, warnings });
      } catch (err: any) {
        reject(new Error(`Gagal membaca berkas Excel: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
/**
 * Unduh Format Excel Input Nilai Asli STS Guru Mata Pelajaran
 * (Rapor Sisipan: Nilai Murni Asli STS Siswa Tanpa TP dan Tanpa Bobot)
 */
export function downloadGradeTemplateExcel(
  subject: Subject,
  classroom: ClassRoom,
  students: Student[],
  _tps?: LearningObjective[]
) {
  const rows = students.map((s, idx) => {
    return {
      'No': idx + 1,
      'NIS': s.nis,
      'NISN': s.nisn,
      'Nama Siswa': s.name,
      'Kelas': classroom.name,
      'Mata Pelajaran': subject.name,
      'KKTP': subject.kktp || 75,
      'Nilai_STS_Asli': 85, // Nilai asli tes STS siswa (0 - 100)
      'Catatan_Guru': 'Menunjukkan pemahaman yang baik pada materi tengah semester.',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 10 },
    { wch: 14 },
    { wch: 28 },
    { wch: 14 },
    { wch: 32 },
    { wch: 8 },
    { wch: 16 },
    { wch: 45 },
  ];
  const wb = XLSX.utils.book_new();
  const safeSubName = subject.code.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.utils.book_append_sheet(wb, ws, 'Nilai STS');
  XLSX.writeFile(wb, `Format_Nilai_STS_${safeSubName}_${classroom.name.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Parsing Nilai STS yang diunggah Guru dari Excel
 * Membaca nilai asli hasil tes STS siswa secara langsung
 */
export async function parseGradesFromExcel(
  file: File,
  _tps?: LearningObjective[]
): Promise<Array<{ nisn: string; stsScore: number; sts?: number; sas: number; sumatifScores: Record<string, number>; catatanSts?: string }>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        const results: Array<{
          nisn: string;
          stsScore: number;
          sts?: number;
          sas: number;
          sumatifScores: Record<string, number>;
          catatanSts?: string;
        }> = [];

        rawJson.forEach((row) => {
          const nisn = String(row['NISN'] || row['nisn'] || '').trim();
          if (!nisn) return;

          // Cari kolom nilai STS (Nilai_STS_Asli, Nilai_STS, Nilai STS, STS, PTS)
          const stsRaw =
            row['Nilai_STS_Asli'] ??
            row['Nilai_STS'] ??
            row['Nilai STS'] ??
            row['STS'] ??
            row['Sumatif_Tengah_Semester_STS'] ??
            row['PTS'] ??
            row['Nilai'];

          const stsVal = stsRaw !== undefined && !isNaN(Number(stsRaw))
            ? Math.max(0, Math.min(100, Math.round(Number(stsRaw))))
            : 0;

          // Catatan guru
          const catatanRaw =
            row['Catatan_Guru'] ||
            row['Catatan Guru'] ||
            row['Catatan'] ||
            row['Catatan STS'] ||
            row['Keterangan'];

          const catatanSts = catatanRaw ? String(catatanRaw).trim() : undefined;

          results.push({
            nisn,
            stsScore: stsVal,
            sts: stsVal,
            sas: stsVal,
            sumatifScores: {},
            catatanSts,
          });
        });

        resolve(results);
      } catch (err: any) {
        reject(new Error(`Gagal memproses file nilai STS: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca berkas Excel.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Ekspor Data & Akun Guru ke Excel
 */
export function exportTeacherAccountsToExcel(
  teachers: any[],
  classes: ClassRoom[],
  subjects: Subject[]
) {
  const rows = teachers.map((t, idx) => {
    const homeroomClass = classes.find((c) => c.id === t.homeroomClassId);
    const assignedSubjects = (t.assignedSubjectIds || [])
      .map((sid: string) => subjects.find((s) => s.id === sid)?.name || sid)
      .join(', ');

    return {
      'No': idx + 1,
      'NIP': t.nip || '-',
      'Nama Guru': t.name,
      'Peran': t.role,
      'Mata Pelajaran': assignedSubjects || 'Belum diatur',
      'Wali Kelas': homeroomClass ? homeroomClass.name : '-',
      'Username e-Rapor': t.username || t.nip?.replace(/\s+/g, '') || t.email,
      'Password Awal': t.password || 'Guru@2025',
      'Email': t.email,
      'No Telepon': t.phone,
      'Status Akun': t.isActive !== false ? 'Aktif' : 'Non-Aktif',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 28 },
    { wch: 16 },
    { wch: 26 },
    { wch: 14 },
    { wch: 22 },
    { wch: 16 },
    { wch: 25 },
    { wch: 16 },
    { wch: 12 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Akun Guru');
  XLSX.writeFile(wb, `Data_Akun_Guru_eRapor_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Ekspor Leger Nilai Lengkap Satu Kelas (Rekapitulasi Semua Mapel)
 */
export function exportLegerToExcel(
  classroom: ClassRoom,
  students: Student[],
  subjects: Subject[],
  grades: GradeRecord[]
) {
  // Mapel umum dan muatan lokal diurutkan sesuai urutan standar Kemdikbud
  const nonReligionSubjects = sortKemdikbudSubjects(subjects.filter((s) => !isReligionSubject(s)));

  const legerData = students.map((std, idx) => {
    const row: Record<string, any> = {
      'No': idx + 1,
      'NIS': std.nis,
      'NISN': std.nisn,
      'Nama Siswa': std.name,
      'JK': std.gender,
      'Agama': std.religion || 'Islam',
    };

    let totalScore = 0;
    let countScore = 0;

    // 1. Nilai Mapel Agama (Hanya mapel agama yang diambil siswa)
    const studentRelSubj = subjects.find(
      (s) => isReligionSubject(s) && getSubjectReligion(s) === (std.religion || 'Islam')
    ) || subjects.find((s) => isReligionSubject(s));

    if (studentRelSubj) {
      const g = grades.find((gr) => gr.studentId === std.id && gr.subjectId === studentRelSubj.id);
      const score = g && typeof g.nilaiAkhir === 'number' && g.nilaiAkhir > 0 ? g.nilaiAkhir : '-';
      row['PAB (Agama)'] = score;
      if (typeof score === 'number') {
        totalScore += score;
        countScore++;
      }
    }

    // 2. Nilai Mapel Umum & Muatan Lokal
    nonReligionSubjects.forEach((subj) => {
      const g = grades.find((gr) => gr.studentId === std.id && gr.subjectId === subj.id);
      const score = g && typeof g.nilaiAkhir === 'number' && g.nilaiAkhir > 0 ? g.nilaiAkhir : '-';
      row[subj.code] = score;

      if (typeof score === 'number') {
        totalScore += score;
        countScore++;
      }
    });

    row['Jumlah Nilai'] = totalScore;
    row['Rata-Rata'] = countScore > 0 ? (totalScore / countScore).toFixed(1) : '-';

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(legerData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leger Nilai STS');
  XLSX.writeFile(wb, `Leger_Nilai_STS_${classroom.name.replace(/\s+/g, '_')}.xlsx`);
}
