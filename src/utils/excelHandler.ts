import * as XLSX from 'xlsx';
import { Student, Subject, ClassRoom, LearningObjective, GradeRecord } from '../types/erapor';

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
 * Unduh Format Excel Input Nilai Guru Mata Pelajaran
 */
export function downloadGradeTemplateExcel(
  subject: Subject,
  classroom: ClassRoom,
  students: Student[],
  tps: LearningObjective[]
) {
  const rows = students.map((s, idx) => {
    const rowObj: Record<string, any> = {
      'No': idx + 1,
      'NIS': s.nis,
      'NISN': s.nisn,
      'Nama Siswa': s.name,
      'Kelas': classroom.name,
      'Mata Pelajaran': subject.name,
    };

    // Add Sumatif Lingkup Materi columns for each TP
    tps.forEach((tp) => {
      rowObj[`Sumatif_${tp.code}`] = 85; // contoh nilai awal
    });

    // Add Sumatif Akhir Semester
    rowObj['Sumatif_Akhir_Semester_SAS'] = 85;

    return rowObj;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  const safeSubName = subject.code.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.utils.book_append_sheet(wb, ws, 'Form Nilai Guru');
  XLSX.writeFile(wb, `Format_Nilai_${safeSubName}_${classroom.name.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Parsing Nilai yang diunggah Guru dari Excel
 */
export async function parseGradesFromExcel(
  file: File,
  tps: LearningObjective[]
): Promise<Array<{ nisn: string; sumatifScores: Record<string, number>; sas: number }>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        const results: Array<{ nisn: string; sumatifScores: Record<string, number>; sas: number }> = [];

        rawJson.forEach((row) => {
          const nisn = String(row['NISN'] || row['nisn'] || '').trim();
          if (!nisn) return;

          const sumatifScores: Record<string, number> = {};
          tps.forEach((tp) => {
            const val = row[`Sumatif_${tp.code}`] || row[tp.code] || row[`SLM_${tp.code}`];
            if (val !== undefined && !isNaN(Number(val))) {
              sumatifScores[tp.id] = Number(val);
            }
          });

          const sasVal = row['Sumatif_Akhir_Semester_SAS'] || row['SAS'] || row['Nilai SAS'] || row['ASAS'];
          const sas = sasVal !== undefined && !isNaN(Number(sasVal)) ? Number(sasVal) : 80;

          results.push({
            nisn,
            sumatifScores,
            sas,
          });
        });

        resolve(results);
      } catch (err: any) {
        reject(new Error(`Gagal memproses file nilai: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
    reader.readAsArrayBuffer(file);
  });
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
  const legerData = students.map((std, idx) => {
    const row: Record<string, any> = {
      'No': idx + 1,
      'NIS': std.nis,
      'NISN': std.nisn,
      'Nama Siswa': std.name,
      'JK': std.gender,
    };

    let totalScore = 0;
    let countScore = 0;

    subjects.forEach((subj) => {
      const g = grades.find((gr) => gr.studentId === std.id && gr.subjectId === subj.id);
      const score = g ? g.nilaiAkhir : '-';
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
  XLSX.utils.book_append_sheet(wb, ws, 'Leger Nilai');
  XLSX.writeFile(wb, `Leger_Nilai_${classroom.name.replace(/\s+/g, '_')}.xlsx`);
}
