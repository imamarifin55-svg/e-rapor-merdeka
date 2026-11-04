import React, { useState, useRef, useEffect } from 'react';
import {
  Student,
  Subject,
  ClassRoom,
  LearningObjective,
  GradeRecord,
  UserSession,
} from '../types/erapor';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Save,
  CloudUpload,
  Clock,
  Check,
  Award,
  BookOpen,
  Filter,
  CheckSquare,
  AlertTriangle,
  Info,
  Users,
  GraduationCap,
  ChevronDown,
  UserPlus,
  HelpCircle,
  FileCheck,
  Edit3,
  X,
} from 'lucide-react';
import {
  calculatePureStsGrade,
  generateDefaultStsNote,
} from '../utils/gradeCalculations';
import { downloadGradeTemplateExcel, parseGradesFromExcel } from '../utils/excelHandler';
import {
  isReligionSubject,
  getSubjectReligion,
  getEligibleStudentsForSubject,
  sortKemdikbudSubjects,
} from '../utils/subjectReligionHelper';

interface Props {
  currentSession: UserSession;
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  learningObjectives?: LearningObjective[];
  grades: GradeRecord[];
  onUpdateGrades: (updatedGrades: GradeRecord[]) => void;
  onUpdateStudents?: (updatedStudents: Student[]) => void;
  onUpdateSubjects?: (updatedSubjects: Subject[]) => void;
  onAddLearningObjective?: (newTp: LearningObjective) => void;
  onDeleteLearningObjective?: (tpId: string) => void;
}

export const GradeManagementView: React.FC<Props> = ({
  currentSession,
  classes,
  subjects,
  students,
  grades,
  onUpdateGrades,
  onUpdateStudents,
  onUpdateSubjects,
}) => {
  // Ensure valid initial class ID
  const initialClassId = (() => {
    if (currentSession.assignedClass && classes.some((c) => c.id === currentSession.assignedClass)) {
      return currentSession.assignedClass;
    }
    return classes[0]?.id || 'cls-7-1';
  })();

  // Ensure valid initial subject ID
  const initialSubjId = (() => {
    const assignedSubjs = currentSession.assignedSubjectIds;
    if (
      assignedSubjs &&
      assignedSubjs[0] &&
      subjects.some((s) => s.id === assignedSubjs[0])
    ) {
      return assignedSubjs[0];
    }
    return subjects[3]?.id || subjects[0]?.id || 'sub-mtk';
  })();

  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'all' | '7' | '8' | '9'>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjId);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);

  // Auto-Save and Cloud status
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Tersimpan di Cloud');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // References for inputs for quick arrow/enter navigation
  const scoreInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Selected Class and Subject objects
  const sortedSubjects = sortKemdikbudSubjects(subjects);
  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || sortedSubjects[0] || subjects[0];
  const kktp = selectedSubject?.kktp || 75;
  const subjectReligion = getSubjectReligion(selectedSubject);

  // KKTP Editable States
  const [isEditingKktp, setIsEditingKktp] = useState(false);
  const [kktpInputVal, setKktpInputVal] = useState<number>(selectedSubject?.kktp || 75);
  const [showAllKktpModal, setShowAllKktpModal] = useState(false);
  const [bulkKktpSubjects, setBulkKktpSubjects] = useState<Subject[]>([...subjects]);

  useEffect(() => {
    if (selectedSubject) {
      setKktpInputVal(selectedSubject.kktp || 75);
    }
  }, [selectedSubjectId, selectedSubject?.kktp]);

  useEffect(() => {
    setBulkKktpSubjects([...subjects]);
  }, [subjects]);

  const handleSaveCurrentKktp = () => {
    const cleanVal = Math.max(0, Math.min(100, Math.round(Number(kktpInputVal) || 75)));
    if (onUpdateSubjects) {
      const next = subjects.map((s) => (s.id === selectedSubject.id ? { ...s, kktp: cleanVal } : s));
      onUpdateSubjects(next);
    }
    setIsEditingKktp(false);
    setUploadSuccessNotice(`KKTP ${selectedSubject.name} berhasil diubah menjadi ${cleanVal}!`);
    setTimeout(() => setUploadSuccessNotice(null), 3000);
  };

  const handleSaveAllKktp = () => {
    if (onUpdateSubjects) {
      onUpdateSubjects(bulkKktpSubjects);
    }
    setShowAllKktpModal(false);
    setUploadSuccessNotice(`KKTP untuk ${bulkKktpSubjects.length} mata pelajaran berhasil diperbarui!`);
    setTimeout(() => setUploadSuccessNotice(null), 3500);
  };

  // Filter classes based on grade filter
  const filteredClasses = classes.filter((cls) => {
    if (selectedGradeFilter === 'all') return true;
    return String(cls.gradeLevel) === selectedGradeFilter;
  });

  // Keep selectedClassId valid when filter changes
  useEffect(() => {
    if (filteredClasses.length > 0 && !filteredClasses.some((c) => c.id === selectedClassId)) {
      setSelectedClassId(filteredClasses[0].id);
    }
  }, [selectedGradeFilter, filteredClasses, selectedClassId]);

  // Robust student matching for this class
  const classStudents = students.filter((s) => {
    if (s.classId === selectedClassId) return true;
    if (selectedClass && s.className && s.className.toLowerCase() === selectedClass.name.toLowerCase()) return true;
    // Normalized comparison (e.g. 'cls-7-1' -> '71', '7.1' -> '71')
    const normClassId = selectedClassId.replace(/[^0-9]/g, '');
    const normStudentClass = (s.classId || '').replace(/[^0-9]/g, '');
    if (normClassId && normStudentClass && normClassId === normStudentClass) return true;
    return false;
  });

  // Filter siswa yang berhak mengikuti mapel ini (Khusus Agama vs Seluruh Siswa Rombel)
  const eligibleStudents = getEligibleStudentsForSubject(selectedSubject, classStudents);

  // Filter students based on search query
  const filteredStudents = eligibleStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nisn.includes(searchQuery) ||
    s.nis.includes(searchQuery)
  );

  // Helper to extract grade record
  const getGradeForStudent = (studentId: string): GradeRecord | undefined => {
    return grades.find((g) => g.studentId === studentId && g.subjectId === selectedSubjectId);
  };

  // Helper to extract raw STS score
  const getStsScore = (studentId: string): number | '' => {
    const rec = getGradeForStudent(studentId);
    if (!rec) return '';
    if (typeof rec.stsScore === 'number') return rec.stsScore;
    if (typeof rec.sumatifTengahSemester === 'number') return rec.sumatifTengahSemester;
    if (typeof rec.nilaiAkhir === 'number' && rec.nilaiAkhir > 0) return rec.nilaiAkhir;
    return '';
  };

  // Helper to get teacher note
  const getTeacherNote = (studentId: string): string => {
    const rec = getGradeForStudent(studentId);
    if (rec?.catatanSts && rec.catatanSts.trim() !== '') return rec.catatanSts;
    if (rec?.highestCompetencyNarrative && rec.highestCompetencyNarrative.trim() !== '') return rec.highestCompetencyNarrative;
    const score = getStsScore(studentId);
    if (typeof score === 'number') {
      return generateDefaultStsNote(score, kktp, selectedSubject?.name || 'Mata Pelajaran');
    }
    return '';
  };

  // Handle pure STS score change (real raw score 0-100)
  const handleStsScoreChange = (studentId: string, valueStr: string) => {
    if (isLocked) return;

    const rawScore = valueStr === '' ? 0 : Math.max(0, Math.min(100, Math.round(Number(valueStr))));
    const existing = grades.find((g) => g.studentId === studentId && g.subjectId === selectedSubjectId);
    const existingNote = existing?.catatanSts || existing?.highestCompetencyNarrative;

    const calc = calculatePureStsGrade(rawScore, kktp, existingNote, selectedSubject.name);

    const updatedRecord: GradeRecord = {
      id: existing ? existing.id : `grd-${studentId}-${selectedSubjectId}`,
      studentId,
      subjectId: selectedSubjectId,
      classId: selectedClassId,
      semester: 'Ganjil',
      academicYearId: 'ay-2025-1',
      stsScore: calc.stsScore,
      sumatifTengahSemester: calc.stsScore,
      nilaiAkhir: calc.nilaiAkhir, // Raw score is the final score
      catatanSts: calc.catatanSts,
      statusSts: calc.status,
      predikatSts: calc.predikat,
      highestCompetencyNarrative: calc.catatanSts,
      lowestCompetencyNarrative: calc.status === 'Tuntas'
        ? 'Memenuhi ketuntasan asesmen tengah semester (STS).'
        : `Belum tuntas KKTP (${kktp}), membutuhkan tindak lanjut atau bimbingan.`,
    };

    const newGrades = grades.some((g) => g.studentId === studentId && g.subjectId === selectedSubjectId)
      ? grades.map((g) => (g.studentId === studentId && g.subjectId === selectedSubjectId ? updatedRecord : g))
      : [...grades, updatedRecord];

    setHasUnsavedChanges(true);
    onUpdateGrades(newGrades);
  };

  // Handle note change
  const handleNoteChange = (studentId: string, noteStr: string) => {
    if (isLocked) return;

    const existing = grades.find((g) => g.studentId === studentId && g.subjectId === selectedSubjectId);
    const currentScore = typeof existing?.stsScore === 'number'
      ? existing.stsScore
      : (typeof existing?.nilaiAkhir === 'number' ? existing.nilaiAkhir : 80);

    const calc = calculatePureStsGrade(currentScore, kktp, noteStr, selectedSubject.name);

    const updatedRecord: GradeRecord = {
      id: existing ? existing.id : `grd-${studentId}-${selectedSubjectId}`,
      studentId,
      subjectId: selectedSubjectId,
      classId: selectedClassId,
      semester: 'Ganjil',
      academicYearId: 'ay-2025-1',
      stsScore: calc.stsScore,
      sumatifTengahSemester: calc.stsScore,
      nilaiAkhir: calc.nilaiAkhir,
      catatanSts: noteStr,
      statusSts: calc.status,
      predikatSts: calc.predikat,
      highestCompetencyNarrative: noteStr,
    };

    const newGrades = grades.some((g) => g.studentId === studentId && g.subjectId === selectedSubjectId)
      ? grades.map((g) => (g.studentId === studentId && g.subjectId === selectedSubjectId ? updatedRecord : g))
      : [...grades, updatedRecord];

    setHasUnsavedChanges(true);
    onUpdateGrades(newGrades);
  };

  // Apply Kemdikbud preset notes (STS Murni tanpa ketuntasan/predikat)
  const handleApplyPresetNote = (studentId: string, presetType: 'sangat_baik' | 'baik' | 'cukup' | 'perlu_bimbingan') => {
    let note = '';
    const subName = selectedSubject.name;
    if (presetType === 'sangat_baik') {
      note = `Menunjukkan penguasaan materi yang sangat unggul pada asesmen tengah semester ${subName}. Pertahankan prestasi belajarmu.`;
    } else if (presetType === 'baik') {
      note = `Memahami konsep-konsep materi asesmen tengah semester ${subName} dengan baik.`;
    } else if (presetType === 'cukup') {
      note = `Mencapai capaian tengah semester dalam ${subName}. Perlu memperbanyak latihan mandiri.`;
    } else {
      note = `Memerlukan bimbingan dan pendampingan berkala dalam memahami materi ${subName}.`;
    }
    handleNoteChange(studentId, note);
  };

  // Quick Action 1: Fill all empty/zero with KKTP
  const handleQuickFillKktp = () => {
    if (isLocked || eligibleStudents.length === 0) return;
    if (!window.confirm(`Isi semua siswa yang belum memiliki nilai dengan nilai dasar KKTP (${kktp})?`)) return;

    let updatedGrades = [...grades];
    eligibleStudents.forEach((st) => {
      const current = getStsScore(st.id);
      if (typeof current !== 'number' || current === 0) {
        const calc = calculatePureStsGrade(kktp, kktp, '', selectedSubject.name);
        const existingIdx = updatedGrades.findIndex((g) => g.studentId === st.id && g.subjectId === selectedSubjectId);
        const rec: GradeRecord = {
          id: existingIdx >= 0 ? updatedGrades[existingIdx].id : `grd-${st.id}-${selectedSubjectId}`,
          studentId: st.id,
          subjectId: selectedSubjectId,
          classId: selectedClassId,
          semester: 'Ganjil',
          academicYearId: 'ay-2025-1',
          stsScore: kktp,
          sumatifTengahSemester: kktp,
          nilaiAkhir: kktp,
          catatanSts: calc.catatanSts,
          statusSts: calc.status,
          predikatSts: calc.predikat,
          highestCompetencyNarrative: calc.catatanSts,
        };
        if (existingIdx >= 0) {
          updatedGrades[existingIdx] = rec;
        } else {
          updatedGrades.push(rec);
        }
      }
    });

    onUpdateGrades(updatedGrades);
    setHasUnsavedChanges(true);
    setUploadSuccessNotice(`Semua siswa berhasil diisi nilai KKTP (${kktp}).`);
    setTimeout(() => setUploadSuccessNotice(null), 3000);
  };

  // Quick Action 2: Generate Kemdikbud auto-narratives for all students
  const handleGenerateAllNarratives = () => {
    if (isLocked || eligibleStudents.length === 0) return;

    let updatedGrades = [...grades];
    eligibleStudents.forEach((st) => {
      const score = getStsScore(st.id);
      const numScore = typeof score === 'number' ? score : kktp;
      const note = generateDefaultStsNote(numScore, kktp, selectedSubject.name);
      const calc = calculatePureStsGrade(numScore, kktp, note, selectedSubject.name);

      const existingIdx = updatedGrades.findIndex((g) => g.studentId === st.id && g.subjectId === selectedSubjectId);
      const rec: GradeRecord = {
        id: existingIdx >= 0 ? updatedGrades[existingIdx].id : `grd-${st.id}-${selectedSubjectId}`,
        studentId: st.id,
        subjectId: selectedSubjectId,
        classId: selectedClassId,
        semester: 'Ganjil',
        academicYearId: 'ay-2025-1',
        stsScore: numScore,
        sumatifTengahSemester: numScore,
        nilaiAkhir: numScore,
        catatanSts: note,
        statusSts: calc.status,
        predikatSts: calc.predikat,
        highestCompetencyNarrative: note,
      };

      if (existingIdx >= 0) {
        updatedGrades[existingIdx] = rec;
      } else {
        updatedGrades.push(rec);
      }
    });

    onUpdateGrades(updatedGrades);
    setHasUnsavedChanges(true);
    setUploadSuccessNotice('Narasi capaian kompetensi standar Kemdikbud berhasil digenerate untuk seluruh siswa.');
    setTimeout(() => setUploadSuccessNotice(null), 3500);
  };

  // Quick Action 3: Auto-Populate Students when class is empty!
  const handleAutoPopulateStudentsForClass = () => {
    const defaultRoster = [
      { name: 'Aditya Pratama Putra', gender: 'L' as const },
      { name: 'Aisyah Putri Azzahra', gender: 'P' as const },
      { name: 'Bima Satria Yudha', gender: 'L' as const },
      { name: 'Citra Dewi Lestari', gender: 'P' as const },
      { name: 'Daffa Rizky Ramadhan', gender: 'L' as const },
      { name: 'Farhan Maulana Hakim', gender: 'L' as const },
      { name: 'Gita Nirmala Sari', gender: 'P' as const },
      { name: 'Jonathan Christopher', gender: 'L' as const },
      { name: 'Nayla Salsabila', gender: 'P' as const },
      { name: 'Rian Bagus Nugroho', gender: 'L' as const },
    ];

    const gradeLevel = selectedClass?.gradeLevel || 7;
    const yearPrefix = gradeLevel === 7 ? '25' : gradeLevel === 8 ? '24' : '23';

    const newStudents: Student[] = defaultRoster.map((st, idx) => ({
      id: `std-${selectedClassId}-${Date.now()}-${idx + 1}`,
      nis: `${yearPrefix}07${String(idx + 1).padStart(2, '0')}`,
      nisn: `00${9 - (gradeLevel - 7)}9123${String(Math.floor(100 + Math.random() * 899))}`,
      name: st.name,
      gender: st.gender,
      birthPlace: 'Semarang',
      birthDate: `${10 + idx} Mei 201${12 - gradeLevel}`,
      religion: st.name.includes('Christopher') ? 'Kristen' : 'Islam',
      classId: selectedClassId,
      className: selectedClass?.name || 'Kelas Terpilih',
      parentName: `Bpk/Ibu ${st.name.split(' ')[0]}`,
      parentPhone: `081234567${idx}0`,
      address: `Jl. Pendidikan No. ${idx + 1}, Semarang`,
    }));

    // Generate initial grades for them
    const newGradesList = [...grades];
    newStudents.forEach((st, sIdx) => {
      subjects.forEach((sub, subIdx) => {
        const subKktp = sub.kktp || 75;
        const score = 75 + ((sIdx * 6 + subIdx * 4) % 22);
        const isTuntas = score >= subKktp;
        const pred = score >= 90 ? 'A' : score >= subKktp ? 'B' : score >= subKktp - 10 ? 'C' : 'D';
        const note = isTuntas
          ? `Menunjukkan penguasaan materi yang sangat baik pada asesmen tengah semester (STS) ${sub.name}.`
          : `Memerlukan bimbingan berkala dalam penguasaan materi tengah semester ${sub.name}.`;

        newGradesList.push({
          id: `grd-${st.id}-${sub.id}`,
          studentId: st.id,
          subjectId: sub.id,
          classId: selectedClassId,
          semester: 'Ganjil',
          academicYearId: 'ay-2025-1',
          stsScore: score,
          sumatifTengahSemester: score,
          nilaiAkhir: score,
          catatanSts: note,
          statusSts: isTuntas ? 'Tuntas' : 'Belum Tuntas',
          predikatSts: pred,
          highestCompetencyNarrative: note,
          lowestCompetencyNarrative: isTuntas ? 'Tuntas KKTP.' : `Belum mencapai KKTP (${subKktp}).`,
        });
      });
    });

    if (onUpdateStudents) {
      onUpdateStudents([...students, ...newStudents]);
    }
    onUpdateGrades(newGradesList);
    setHasUnsavedChanges(true);
    setUploadSuccessNotice(`Berhasil menambahkan 10 siswa otomatis ke ${selectedClass?.name}!`);
    setTimeout(() => setUploadSuccessNotice(null), 4000);
  };

  // Save Grades to Cloud Firestore
  const handleSaveGradesToCloud = () => {
    setIsSaving(true);
    onUpdateGrades([...grades]);
    setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(`Pukul ${timeStr}`);
      setUploadSuccessNotice(`Nilai Asli STS ${selectedSubject.name} (${selectedClass.name}) Berhasil Disimpan ke Cloud Firestore!`);
      setTimeout(() => setUploadSuccessNotice(null), 4000);
    }, 500);
  };

  // Download teacher Excel template (Official Kemdikbud STS)
  const handleDownloadTemplate = () => {
    downloadGradeTemplateExcel(selectedSubject, selectedClass, eligibleStudents);
    setUploadSuccessNotice(`Format Excel Nilai STS ${selectedSubject.code} untuk ${selectedClass.name} (${eligibleStudents.length} siswa) berhasil diunduh.`);
    setTimeout(() => setUploadSuccessNotice(null), 3000);
  };

  // Upload Excel trigger
  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle uploaded Excel file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseGradesFromExcel(file);
      if (parsed.length === 0) {
        alert('Tidak ada data nilai yang dapat diproses dari berkas Excel tersebut.');
        return;
      }

      let matchedCount = 0;
      const updatedGrades = [...grades];

      parsed.forEach((row) => {
        const student = eligibleStudents.find((s) => s.nisn === row.nisn || s.nis === row.nisn);
        if (!student) return;

        matchedCount++;
        const rawScore = row.stsScore;
        const calc = calculatePureStsGrade(rawScore, kktp, row.catatanSts, selectedSubject.name);

        const existingIdx = updatedGrades.findIndex(
          (g) => g.studentId === student.id && g.subjectId === selectedSubjectId
        );

        const updatedRecord: GradeRecord = {
          id: existingIdx >= 0 ? updatedGrades[existingIdx].id : `grd-${student.id}-${selectedSubjectId}`,
          studentId: student.id,
          subjectId: selectedSubjectId,
          classId: selectedClassId,
          semester: 'Ganjil',
          academicYearId: 'ay-2025-1',
          stsScore: calc.stsScore,
          sumatifTengahSemester: calc.stsScore,
          nilaiAkhir: calc.nilaiAkhir,
          catatanSts: calc.catatanSts,
          statusSts: calc.status,
          predikatSts: calc.predikat,
          highestCompetencyNarrative: calc.catatanSts,
        };

        if (existingIdx >= 0) {
          updatedGrades[existingIdx] = updatedRecord;
        } else {
          updatedGrades.push(updatedRecord);
        }
      });

      onUpdateGrades(updatedGrades);
      setHasUnsavedChanges(true);
      setUploadSuccessNotice(`Berhasil mengimpor nilai asli STS untuk ${matchedCount} siswa dari file Excel!`);
      setTimeout(() => setUploadSuccessNotice(null), 4000);
    } catch (err: any) {
      alert(`Gagal membaca Excel: ${err.message}`);
    }
  };

  // Key navigation handler (Enter or Arrow Down -> next student input)
  const handleScoreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextInput = scoreInputsRef.current[currentIndex + 1];
      if (nextInput) nextInput.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevInput = scoreInputsRef.current[currentIndex - 1];
      if (prevInput) prevInput.focus();
    }
  };

  // Class & Subject Statistics Calculation
  const eligibleScores = eligibleStudents
    .map((s) => getStsScore(s.id))
    .filter((sc): sc is number => typeof sc === 'number' && !isNaN(sc) && sc > 0);

  const totalInputted = eligibleScores.length;
  const avgSts = totalInputted > 0 ? Math.round(eligibleScores.reduce((a, b) => a + b, 0) / totalInputted) : 0;
  const highestScore = totalInputted > 0 ? Math.max(...eligibleScores) : 0;
  const lowestScore = totalInputted > 0 ? Math.min(...eligibleScores) : 0;

  return (
    <div className="space-y-5 pb-24 font-sans text-slate-800">
      
      {/* Hidden file input for Excel upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Floating Alert / Toast */}
      {uploadSuccessNotice && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold">{uploadSuccessNotice}</p>
        </div>
      )}

      {/* 1. KEMDIKBUD OFFICIAL HEADER BANNER */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-blue-950/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-200">
                KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Input Nilai Asli STS (Rapor Sisipan)</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Resmi Kemdikbud
              </span>
            </h1>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Formulir pengisian nilai sumatif tengah semester. Nilai yang diinput adalah <strong>nilai asli murni siswa (0–100)</strong> tanpa bobot dan tanpa pembagian TP, langsung tercetak pada rapor sisipan resmi.
            </p>
          </div>

          {/* Quick Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSaveGradesToCloud}
              disabled={isSaving}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
                hasUnsavedChanges
                  ? 'bg-amber-400 text-slate-900 hover:bg-amber-300 animate-pulse ring-2 ring-amber-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Cloud...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{hasUnsavedChanges ? 'Simpan Nilai ke Cloud *' : 'Simpan Nilai ke Cloud'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isLocked
                  ? 'bg-rose-500/90 text-white hover:bg-rose-600'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span>{isLocked ? 'Kunci Form' : 'Buka Kunci'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. OFFICIAL KEMDIKBUD FILTER & SELECTION CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* A. Filter Tingkat Kelas */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Tingkat Kelas</span>
            </label>
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Semua Tingkat (Kelas 7, 8 &amp; 9)</option>
              <option value="7">Kelas 7 (Fase D SMP)</option>
              <option value="8">Kelas 8 (Fase D SMP)</option>
              <option value="9">Kelas 9 (Fase D SMP)</option>
            </select>
          </div>

          {/* B. Filter Rombongan Belajar (Rombel) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Rombel / Kelas (12 Rombel)</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {filteredClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} • Wali: {cls.homeroomTeacherName.split(',')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* C. Filter Mata Pelajaran */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>3. Mata Pelajaran</span>
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {sortedSubjects.map((sub) => {
                const subRel = getSubjectReligion(sub);
                return (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} (KKTP: {sub.kktp}){subRel ? ` • [Khusus Agama ${subRel}]` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* D. Target KKTP Info Card (Editable) */}
          <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-2.5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900 uppercase">
                {subjectReligion ? `KKTP Agama ${subjectReligion}` : 'KKTP Mapel Ini'}
              </span>

              {isEditingKktp ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    autoFocus
                    value={kktpInputVal}
                    onChange={(e) => setKktpInputVal(Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveCurrentKktp();
                      if (e.key === 'Escape') setIsEditingKktp(false);
                    }}
                    className="w-14 px-1.5 py-0.5 bg-white border border-blue-400 rounded text-xs font-mono font-bold text-center text-blue-900 focus:outline-hidden ring-2 ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCurrentKktp}
                    className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                    title="Simpan KKTP Mapel Ini"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setKktpInputVal(kktp);
                      setIsEditingKktp(false);
                    }}
                    className="p-1 text-slate-500 hover:text-slate-800 rounded text-[10px]"
                    title="Batal"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-extrabold font-mono text-xs">
                    {kktp}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingKktp(true)}
                    className="text-[10px] bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 font-bold px-1.5 py-0.5 rounded transition flex items-center gap-1"
                    title="Ubah nilai KKTP mata pelajaran ini"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    Ubah
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-1 pt-1 border-t border-blue-200/60 text-[10px]">
              <span className="text-blue-800 truncate">
                {subjectReligion ? `Khusus Agama ${subjectReligion}` : 'Seluruh Siswa'}
              </span>
              <button
                type="button"
                onClick={() => setShowAllKktpModal(true)}
                className="text-blue-700 hover:text-blue-950 font-bold underline shrink-0 ml-1"
              >
                Atur Semua KKTP
              </button>
            </div>
          </div>

        </div>

        {/* 3. TOOLBAR AKSI CEPAT STANDAR KEMDIKBUD */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Excel Import & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
              title="Unduh Format Excel Nilai STS Resmi Kemdikbud"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Format Excel Nilai STS</span>
            </button>

            <button
              onClick={handleTriggerUpload}
              disabled={isLocked}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
              title="Unggah Nilai Asli STS dari Berkas Excel"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Impor Nilai Excel</span>
            </button>
          </div>

          {/* Right: Quick Tools for Teachers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleQuickFillKktp}
              disabled={isLocked || eligibleStudents.length === 0}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Isi nilai default KKTP untuk siswa yang masih kosong"
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Isi Nilai KKTP ({kktp})</span>
            </button>

            <button
              onClick={handleGenerateAllNarratives}
              disabled={isLocked || eligibleStudents.length === 0}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Generate narasi capaian otomatis sesuai panduan asesmen Kemdikbud"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Generate Narasi Kemdikbud</span>
            </button>
          </div>

        </div>

      </div>

      {/* KHUSUS MAPEL AGAMA: BANNER INFORMASI FILTER AGAMA SISWA */}
      {subjectReligion && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-blue-950 text-xs">
                  Filter Khusus Mapel Agama: {subjectReligion}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Resmi Kemdikbud
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed mt-0.5">
                Hanya menampilkan peserta didik yang memeluk agama <strong>{subjectReligion}</strong> ({eligibleStudents.length} siswa di {selectedClass?.name}). Mapel umum non-agama otomatis menampilkan seluruh siswa ({classStudents.length} siswa).
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xs font-black text-blue-900 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs inline-block">
              {eligibleStudents.length} dari {classStudents.length} Siswa Terdaftar
            </span>
          </div>
        </div>
      )}

      {/* 4. STATISTIK PENILAIAN STS KELAS (REKAPITULASI RESMI) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {subjectReligion ? `Siswa Agama ${subjectReligion}` : 'Peserta Didik'}
          </span>
          <span className="text-base font-extrabold text-slate-800 font-mono">{eligibleStudents.length} Siswa</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Sudah Dinilai</span>
          <span className="text-base font-extrabold text-blue-700 font-mono">
            {totalInputted} / {eligibleStudents.length} ({eligibleStudents.length > 0 ? Math.round((totalInputted / eligibleStudents.length) * 100) : 0}%)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Rerata STS Kelas</span>
          <span className="text-base font-extrabold text-indigo-700 font-mono">{avgSts || '-'}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Nilai Tertinggi</span>
          <span className="text-base font-extrabold text-emerald-700 font-mono">{highestScore || '-'}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Nilai Terendah</span>
          <span className="text-base font-extrabold text-amber-700 font-mono">{lowestScore || '-'}</span>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Skala Penilaian</span>
          <span className="text-xs font-black text-blue-900 font-mono uppercase tracking-wide">
            0 - 100 Murni
          </span>
        </div>
      </div>

      {/* 5. SEARCH & LIVE CLOUD STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau NISN siswa di kelas ini..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>Status Cloud: <strong className="text-slate-800 font-semibold">{lastSavedTime}</strong></span>
        </div>
      </div>

      {/* 6. TABEL PENGIMPUTAN NILAI SISWA (STANDAR RESMI KEMDIKBUD) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* FALLBACK KHUSUS JIKA KELAS INI BELUM MEMILIKI SISWA */}
        {classStudents.length === 0 ? (
          <div className="p-10 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200 shadow-xs">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Data Peserta Didik Belum Ada di {selectedClass?.name || 'Rombel Ini'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rombongan belajar ini belum memiliki daftar nama siswa. Anda dapat membuat data siswa otomatis dalam 1 klik atau mengimpor data dari Excel.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                onClick={handleAutoPopulateStudentsForClass}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>✨ Tambahkan Data 10 Siswa Otomatis</span>
              </button>

              <button
                onClick={handleTriggerUpload}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-300 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Impor dari Excel</span>
              </button>
            </div>
          </div>
        ) : eligibleStudents.length === 0 ? (
          <div className="p-10 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Tidak Ada Peserta Didik Beragama {subjectReligion} di {selectedClass?.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rombongan belajar {selectedClass?.name} memiliki total {classStudents.length} siswa, namun tidak ada siswa yang terdata memeluk agama <strong>{subjectReligion}</strong>. Nilai untuk mata pelajaran ini tidak perlu diinput untuk rombel ini.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  const nonRel = sortedSubjects.find((s) => !isReligionSubject(s));
                  if (nonRel) setSelectedSubjectId(nonRel.id);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <BookOpen className="w-4 h-4" />
                <span>Beralih ke Mata Pelajaran Umum</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              
              <thead className="bg-slate-900 text-white font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-center w-12">No</th>
                  <th className="p-3 text-center w-28">NISN / NIS</th>
                  <th className="p-3 text-left min-w-[220px]">Nama Peserta Didik</th>
                  <th className="p-3 text-center w-12">JK</th>
                  <th className="p-3 text-center w-16">KKTP</th>
                  <th className="p-3 text-center w-36 bg-blue-950 border-x border-blue-800">
                    Nilai Asli STS (0-100)
                  </th>
                  <th className="p-3 text-left min-w-[320px]">
                    Catatan Capaian Kompetensi (Kemdikbud)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                      Tidak ditemukan data siswa yang cocok dengan kata kunci "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std, idx) => {
                    const rawScore = getStsScore(std.id);
                    const note = getTeacherNote(std.id);

                    return (
                      <tr
                        key={std.id}
                        className={`hover:bg-blue-50/50 transition-colors ${
                          idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                        }`}
                      >
                        {/* 1. No */}
                        <td className="p-3 text-center font-medium text-slate-500">
                          {idx + 1}
                        </td>

                        {/* 2. NISN / NIS */}
                        <td className="p-3 text-center font-mono text-[11px] text-slate-700">
                          <div className="font-bold">{std.nisn}</div>
                          <div className="text-[10px] text-slate-400">NIS: {std.nis}</div>
                        </td>

                        {/* 3. Nama Siswa */}
                        <td className="p-3 font-semibold text-slate-900">
                          <div className="text-slate-900 font-bold">{std.name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{selectedClass?.name}</span>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[9.5px]">
                              Agama {std.religion || 'Islam'}
                            </span>
                          </div>
                        </td>

                        {/* 4. JK */}
                        <td className="p-3 text-center font-bold">
                          <span
                            className={`inline-block w-6 h-6 leading-6 rounded-md text-[10px] ${
                              std.gender === 'L'
                                ? 'bg-blue-100 text-blue-700 font-bold'
                                : 'bg-pink-100 text-pink-700 font-bold'
                            }`}
                          >
                            {std.gender}
                          </span>
                        </td>

                        {/* 5. KKTP */}
                        <td className="p-3 text-center font-mono font-bold text-slate-600 bg-slate-50/60">
                          {kktp}
                        </td>

                        {/* 6. Nilai Asli STS Siswa (Direct Input - Tanpa Predikat & Ketuntasan) */}
                        <td className="p-3 text-center bg-blue-50/20 border-x border-slate-200">
                          <div className="flex items-center justify-center">
                            <input
                              ref={(el) => {
                                scoreInputsRef.current[idx] = el;
                              }}
                              type="number"
                              min="0"
                              max="100"
                              disabled={isLocked}
                              value={rawScore}
                              onChange={(e) => handleStsScoreChange(std.id, e.target.value)}
                              onKeyDown={(e) => handleScoreKeyDown(e, idx)}
                              placeholder="0"
                              className={`w-24 text-center py-2 px-2.5 rounded-xl font-mono text-base font-black border shadow-2xs transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                                typeof rawScore !== 'number' || rawScore === 0
                                  ? 'border-slate-300 text-slate-400 bg-white'
                                  : 'border-blue-500 text-blue-900 bg-blue-50/60 font-black'
                              }`}
                            />
                          </div>
                        </td>

                        {/* 7. Catatan Capaian Kompetensi / Guru Mapel */}
                        <td className="p-3">
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              disabled={isLocked}
                              value={note}
                              onChange={(e) => handleNoteChange(std.id, e.target.value)}
                              placeholder="Deskripsi pencapaian kompetensi tengah semester..."
                              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition shadow-2xs"
                            />
                            
                            {/* Template Narasi Cepat */}
                            <div className="flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleApplyPresetNote(std.id, 'sangat_baik')}
                                className="text-[10px] px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 transition font-medium"
                              >
                                Sangat Baik
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApplyPresetNote(std.id, 'baik')}
                                className="text-[10px] px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 transition font-medium"
                              >
                                Baik
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApplyPresetNote(std.id, 'cukup')}
                                className="text-[10px] px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded border border-amber-200 transition font-medium"
                              >
                                Cukup
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApplyPresetNote(std.id, 'perlu_bimbingan')}
                                className="text-[10px] px-1.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 transition font-medium"
                              >
                                Perlu Bimbingan
                              </button>
                            </div>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>
        )}

        {/* Footer info in table */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium text-slate-700">
              Rapor Sisipan STS Murni: Penginputan nilai asli tes siswa (0–100) tanpa predikat dan tanpa status ketuntasan.
            </span>
          </div>

          <div className="font-extrabold text-slate-800">
            {totalInputted} dari {eligibleStudents.length} Peserta Didik Telah Diisi Nilai STS ({eligibleStudents.length > 0 ? Math.round((totalInputted / eligibleStudents.length) * 100) : 0}%)
          </div>
        </div>

      </div>

      {/* 7. FLOATING SAVE ACTION BAR AT SCREEN BOTTOM */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-40 bg-slate-900/95 backdrop-blur-md text-white p-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            {hasUnsavedChanges ? (
              <strong className="text-amber-400">Ada perubahan nilai yang belum disimpan</strong>
            ) : (
              <span>Status: <strong className="text-emerald-400">Tersinkron ke Cloud</strong></span>
            )}
          </span>
        </div>

        <button
          onClick={handleSaveGradesToCloud}
          disabled={isSaving}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition ${
            hasUnsavedChanges
              ? 'bg-amber-400 text-slate-900 hover:bg-amber-300 animate-pulse font-black'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Nilai Sekarang</span>
            </>
          )}
        </button>
      </div>

      {/* POPUP MODAL: ATUR KKTP SELURUH MATA PELAJARAN */}
      {showAllKktpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in duration-150 flex flex-col max-h-[85vh]">
            
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Kelola Kriteria Ketercapaian (KKTP) Mapel</h3>
                  <p className="text-[11px] text-slate-300">
                    Atur nilai ketuntasan tujuan pembelajaran untuk seluruh mata pelajaran di satuan pendidikan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllKktpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-xs">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Set Cepat Seragam:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[70, 72, 75, 78, 80].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setBulkKktpSubjects((prev) => prev.map((s) => ({ ...s, kktp: val })))
                      }
                      className="px-2.5 py-1 bg-white border border-amber-300 rounded font-bold hover:bg-amber-100 transition text-[11px]"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5 w-20">Kode</th>
                      <th className="p-2.5">Mata Pelajaran</th>
                      <th className="p-2.5 w-24 text-center">Nilai KKTP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {bulkKktpSubjects.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-700">{sub.code}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{sub.name}</td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={sub.kktp}
                            onChange={(e) => {
                              const v = e.target.value === '' ? 0 : Math.max(0, Math.min(100, Math.round(Number(e.target.value))));
                              setBulkKktpSubjects((prev) =>
                                prev.map((item) => (item.id === sub.id ? { ...item, kktp: v } : item))
                              );
                            }}
                            className="w-16 px-2 py-1 text-center font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-blue-900"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setShowAllKktpModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAllKktp}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan KKTP
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
