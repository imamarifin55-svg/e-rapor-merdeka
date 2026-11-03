import { Subject } from '../types/erapor';

export interface StsAssessmentResult {
  stsScore: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  status: 'Tuntas' | 'Belum Tuntas';
  catatanSts: string;
}

/**
 * Menghitung predikat berdasarkan KKTP dan nilai asli STS
 */
export function getStsPredicate(score: number, kktp: number = 75): 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= kktp) return 'C';
  return 'D';
}

/**
 * Menentukan status ketuntasan berdasarkan nilai STS dan KKTP
 */
export function getStsStatus(score: number, kktp: number = 75): 'Tuntas' | 'Belum Tuntas' {
  return score >= kktp ? 'Tuntas' : 'Belum Tuntas';
}

/**
 * Menghasilkan catatan otomatis perkembangan belajar STS siswa
 */
export function generateDefaultStsNote(score: number, kktp: number = 75, subjectName?: string): string {
  const subLabel = subjectName ? `dalam mata pelajaran ${subjectName}` : 'pada materi tengah semester';
  if (score >= 92) {
    return `Menunjukkan penguasaan yang sangat memuaskan dan konsisten ${subLabel}. Pertahankan prestasi belajar.`;
  }
  if (score >= 83) {
    return `Menunjukkan pemahaman yang baik ${subLabel}. Terus pertahankan motivasi dan ketekunan belajar.`;
  }
  if (score >= kktp) {
    return `Telah mencapai kriteria ketuntasan ${subLabel}. Perlu peningkatan ketelitian dan pemantapan latihan.`;
  }
  return `Perlu bimbingan tambahan dan peningkatan belajar ${subLabel} agar mencapai kriteria ketuntasan (KKTP: ${kktp}).`;
}

/**
 * Kalkulasi murni Nilai STS (Rapor Sisipan):
 * Nilai Rapor adalah nilai asli STS siswa tanpa pembobotan, tanpa TP.
 */
export function calculatePureStsGrade(
  rawScore: number,
  kktp: number = 75,
  existingNote?: string,
  subjectName?: string
): StsAssessmentResult {
  const safeScore = Math.max(0, Math.min(100, Math.round(Number(rawScore) || 0)));
  const status = getStsStatus(safeScore, kktp);
  const predikat = getStsPredicate(safeScore, kktp);
  const catatanSts = existingNote && existingNote.trim() !== ''
    ? existingNote
    : generateDefaultStsNote(safeScore, kktp, subjectName);

  return {
    stsScore: safeScore,
    nilaiAkhir: safeScore, // Nilai asli tanpa bobot
    predikat,
    status,
    catatanSts,
  };
}

/**
 * Kompatibilitas dengan pemanggil lama jika ada:
 * Menghitung nilai akhir yang langsung mengutamakan nilai asli STS siswa
 */
export interface CalculatedGradeResult {
  rataSumatifLM: number;
  stsScore?: number;
  sasScore: number;
  nilaiAkhir: number;
  highestNarrative: string;
  lowestNarrative: string;
}

export function calculateSubjectFinalGrade(
  sumatifScores: Record<string, number>,
  sasScore: number,
  subject: Subject,
  _tps?: any[],
  stsScore?: number
): CalculatedGradeResult {
  const kktp = subject.kktp || 75;
  // Jika nilai STS tersedia, nilai rapor sisipan adalah nilai asli STS
  const rawSts = typeof stsScore === 'number' && !isNaN(stsScore) ? stsScore : (sasScore || 0);
  const safeScore = Math.max(0, Math.min(100, Math.round(rawSts)));

  const note = generateDefaultStsNote(safeScore, kktp, subject.name);

  return {
    rataSumatifLM: safeScore,
    stsScore: safeScore,
    sasScore: safeScore,
    nilaiAkhir: safeScore, // Nilai murni asli STS siswa
    highestNarrative: note,
    lowestNarrative: safeScore >= kktp
      ? 'Memenuhi capaian pembelajaran tengah semester dengan tuntas.'
      : `Belum tuntas KKTP (${kktp}), membutuhkan program remedial/bimbingan belajar.`,
  };
}
