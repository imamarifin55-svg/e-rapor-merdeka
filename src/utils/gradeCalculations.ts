import { LearningObjective, Subject } from '../types/erapor';

export interface CalculatedGradeResult {
  rataSumatifLM: number;
  nilaiAkhir: number;
  highestNarrative: string;
  lowestNarrative: string;
}

export function calculateSubjectFinalGrade(
  sumatifScores: Record<string, number>,
  sasScore: number,
  subject: Subject,
  tps: LearningObjective[]
): CalculatedGradeResult {
  const scores = Object.values(sumatifScores).filter((val) => typeof val === 'number' && !isNaN(val));

  const rataSLM = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : 0;

  const validSas = typeof sasScore === 'number' && !isNaN(sasScore) ? sasScore : rataSLM;

  const totalWeight = (subject.weightSLM || 60) + (subject.weightSAS || 40);
  const naCalc = totalWeight > 0
    ? ((rataSLM * (subject.weightSLM || 60)) + (validSas * (subject.weightSAS || 40))) / totalWeight
    : rataSLM;

  const finalNA = Math.round(naCalc);

  // Generate automated Kurikulum Merdeka Competency Narratives
  let highestTP: LearningObjective | null = null;
  let highestScore = -1;
  let lowestTP: LearningObjective | null = null;
  let lowestScore = 999;

  for (const tp of tps) {
    const score = sumatifScores[tp.id];
    if (typeof score === 'number' && !isNaN(score)) {
      if (score > highestScore) {
        highestScore = score;
        highestTP = tp;
      }
      if (score < lowestScore) {
        lowestScore = score;
        lowestTP = tp;
      }
    }
  }

  let highestNarrative = '';
  let lowestNarrative = '';

  if (highestTP) {
    const cleanDesc = highestTP.description.charAt(0).toLowerCase() + highestTP.description.slice(1);
    if (highestScore >= 85) {
      highestNarrative = `Menunjukkan penguasaan yang sangat baik dalam ${cleanDesc}.`;
    } else if (highestScore >= (subject.kktp || 75)) {
      highestNarrative = `Menunjukkan pemahaman yang baik dalam ${cleanDesc}.`;
    } else {
      highestNarrative = `Cukup menguasai kompetensi ${cleanDesc}.`;
    }
  } else {
    highestNarrative = `Menunjukkan penguasaan yang memadai pada seluruh materi pembelajaran yang diujikan.`;
  }

  if (lowestTP && lowestScore < (subject.kktp || 75)) {
    const cleanDesc = lowestTP.description.charAt(0).toLowerCase() + lowestTP.description.slice(1);
    lowestNarrative = `Perlu bimbingan dan peningkatan pemahaman dalam ${cleanDesc}.`;
  } else if (lowestTP && lowestScore < 85 && highestScore >= 85) {
    const cleanDesc = lowestTP.description.charAt(0).toLowerCase() + lowestTP.description.slice(1);
    lowestNarrative = `Perlu sedikit pemantapan materi dalam ${cleanDesc}.`;
  } else {
    lowestNarrative = `Mampu mempertahankan ketuntasan belajar secara konsisten pada semua kompetensi.`;
  }

  return {
    rataSumatifLM: rataSLM,
    nilaiAkhir: finalNA,
    highestNarrative,
    lowestNarrative,
  };
}
