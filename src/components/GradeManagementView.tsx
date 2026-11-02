import React, { useState, useRef } from 'react';
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
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  HelpCircle,
} from 'lucide-react';
import { calculateSubjectFinalGrade } from '../utils/gradeCalculations';
import { downloadGradeTemplateExcel, parseGradesFromExcel } from '../utils/excelHandler';

interface Props {
  currentSession: UserSession;
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  learningObjectives: LearningObjective[];
  grades: GradeRecord[];
  onUpdateGrades: (updatedGrades: GradeRecord[]) => void;
  onAddLearningObjective: (newTp: LearningObjective) => void;
  onDeleteLearningObjective: (tpId: string) => void;
}

export const GradeManagementView: React.FC<Props> = ({
  currentSession,
  classes,
  subjects,
  students,
  learningObjectives,
  grades,
  onUpdateGrades,
  onAddLearningObjective,
  onDeleteLearningObjective,
}) => {
  const defaultClassId = currentSession.assignedClass || classes[0]?.id || 'cls-7-1';
  const defaultSubjId = (currentSession.assignedSubjectIds && currentSession.assignedSubjectIds[0]) || subjects[3]?.id || 'sub-mtk';

  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(defaultSubjId);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);
  const [showTpModal, setShowTpModal] = useState(false);
  const [newTpCode, setNewTpCode] = useState('TP 5');
  const [newTpDesc, setNewTpDesc] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Filter students belonging to this class
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Filter TPs for this subject and class
  const activeTps = learningObjectives.filter(
    (tp) => tp.subjectId === selectedSubjectId && tp.classId === selectedClassId
  );

  // Filter students based on search query
  const filteredStudents = classStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nisn.includes(searchQuery)
  );

  // Handle score change in real-time
  const handleScoreChange = (
    studentId: string,
    tpId: string,
    valueStr: string
  ) => {
    if (isLocked) return;
    const val = valueStr === '' ? 0 : Math.max(0, Math.min(100, Number(valueStr)));

    // Find or create grade record
    const existing = grades.find(
      (g) => g.studentId === studentId && g.subjectId === selectedSubjectId
    );

    const sumatif = existing ? { ...existing.sumatifScores, [tpId]: val } : { [tpId]: val };
    const sas = existing ? existing.sumatifAkhirSemester : 80;

    const calc = calculateSubjectFinalGrade(sumatif, sas, selectedSubject, activeTps);

    const updatedRecord: GradeRecord = {
      id: existing ? existing.id : `grd-${studentId}-${selectedSubjectId}`,
      studentId,
      subjectId: selectedSubjectId,
      classId: selectedClassId,
      semester: 'Ganjil',
      academicYearId: 'ay-2025-1',
      formatifScores: existing ? existing.formatifScores : {},
      sumatifScores: sumatif,
      sumatifAkhirSemester: sas,
      nilaiAkhir: calc.nilaiAkhir,
      highestCompetencyNarrative: calc.highestNarrative,
      lowestCompetencyNarrative: calc.lowestNarrative,
    };

    const newGrades = grades.some((g) => g.studentId === studentId && g.subjectId === selectedSubjectId)
      ? grades.map((g) => (g.studentId === studentId && g.subjectId === selectedSubjectId ? updatedRecord : g))
      : [...grades, updatedRecord];

    onUpdateGrades(newGrades);
  };

  // Handle SAS (Sumatif Akhir Semester) change
  const handleSasChange = (studentId: string, valueStr: string) => {
    if (isLocked) return;
    const sasVal = valueStr === '' ? 0 : Math.max(0, Math.min(100, Number(valueStr)));

    const existing = grades.find(
      (g) => g.studentId === studentId && g.subjectId === selectedSubjectId
    );
    const sumatif = existing ? existing.sumatifScores : {};

    const calc = calculateSubjectFinalGrade(sumatif, sasVal, selectedSubject, activeTps);

    const updatedRecord: GradeRecord = {
      id: existing ? existing.id : `grd-${studentId}-${selectedSubjectId}`,
      studentId,
      subjectId: selectedSubjectId,
      classId: selectedClassId,
      semester: 'Ganjil',
      academicYearId: 'ay-2025-1',
      formatifScores: existing ? existing.formatifScores : {},
      sumatifScores: sumatif,
      sumatifAkhirSemester: sasVal,
      nilaiAkhir: calc.nilaiAkhir,
      highestCompetencyNarrative: calc.highestNarrative,
      lowestCompetencyNarrative: calc.lowestNarrative,
    };

    const newGrades = grades.some((g) => g.studentId === studentId && g.subjectId === selectedSubjectId)
      ? grades.map((g) => (g.studentId === studentId && g.subjectId === selectedSubjectId ? updatedRecord : g))
      : [...grades, updatedRecord];

    onUpdateGrades(newGrades);
  };

  // Recalculate all grades and narratives
  const handleRecalculateAll = () => {
    const updated = grades.map((g) => {
      if (g.subjectId === selectedSubjectId && g.classId === selectedClassId) {
        const calc = calculateSubjectFinalGrade(
          g.sumatifScores,
          g.sumatifAkhirSemester,
          selectedSubject,
          activeTps
        );
        return {
          ...g,
          nilaiAkhir: calc.nilaiAkhir,
          highestCompetencyNarrative: calc.highestNarrative,
          lowestCompetencyNarrative: calc.lowestNarrative,
        };
      }
      return g;
    });

    onUpdateGrades(updated);
    setUploadSuccessNotice('Seluruh Nilai Akhir & Narasi Capaian Kurikulum Merdeka berhasil dikalkulasi ulang!');
    setTimeout(() => setUploadSuccessNotice(null), 3500);
  };

  // Download teacher Excel template
  const handleDownloadTemplate = () => {
    downloadGradeTemplateExcel(selectedSubject, selectedClass, classStudents, activeTps);
  };

  // Upload Excel file and apply
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedResults = await parseGradesFromExcel(file, activeTps);
      let matchCount = 0;

      let workingGrades = [...grades];

      parsedResults.forEach((item) => {
        const student = classStudents.find((s) => s.nisn === item.nisn || s.nis === item.nisn);
        if (!student) return;

        matchCount++;
        const calc = calculateSubjectFinalGrade(
          item.sumatifScores,
          item.sas,
          selectedSubject,
          activeTps
        );

        const newRecord: GradeRecord = {
          id: `grd-${student.id}-${selectedSubjectId}`,
          studentId: student.id,
          subjectId: selectedSubjectId,
          classId: selectedClassId,
          semester: 'Ganjil',
          academicYearId: 'ay-2025-1',
          formatifScores: {},
          sumatifScores: item.sumatifScores,
          sumatifAkhirSemester: item.sas,
          nilaiAkhir: calc.nilaiAkhir,
          highestCompetencyNarrative: calc.highestNarrative,
          lowestCompetencyNarrative: calc.lowestNarrative,
        };

        const existingIdx = workingGrades.findIndex(
          (g) => g.studentId === student.id && g.subjectId === selectedSubjectId
        );
        if (existingIdx >= 0) {
          workingGrades[existingIdx] = newRecord;
        } else {
          workingGrades.push(newRecord);
        }
      });

      onUpdateGrades(workingGrades);
      setUploadSuccessNotice(`Berhasil menyinkronkan ${matchCount} nilai siswa dari file Excel!`);
      setTimeout(() => setUploadSuccessNotice(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateTp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTpDesc.trim()) return;

    const newObj: LearningObjective = {
      id: `tp-${Date.now()}`,
      subjectId: selectedSubjectId,
      classId: selectedClassId,
      semester: 'Ganjil',
      code: newTpCode.trim() || `TP ${activeTps.length + 1}`,
      description: newTpDesc.trim(),
    };

    onAddLearningObjective(newObj);
    setNewTpDesc('');
    setShowTpModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Class & Subject Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Rombongan Belajar (Kelas)</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phase} - SMP)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Mata Pelajaran</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden max-w-[280px]"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden lg:block border-l border-slate-200 pl-3">
              <div className="text-[11px] text-slate-500">Guru Pengampu</div>
              <div className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                {selectedSubject.teacherName}
              </div>
            </div>
          </div>

          {/* Action Buttons: Excel Template & Upload */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Unduh format spreadsheet untuk diisi nilai offline"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Unduh Template Excel
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Unggah hasil isian nilai dari Excel guru"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              Unggah Nilai Excel
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            <button
              onClick={handleRecalculateAll}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Kalkulasi ulang Nilai Akhir & Narasi Capaian"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Hitung Ulang Narasi
            </button>

            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isLocked
                  ? 'bg-rose-50 text-rose-700 border border-rose-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={isLocked ? 'Buka kunci nilai' : 'Kunci nilai agar tidak berubah tidak sengaja'}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isLocked ? 'Terkunci' : 'Kunci Nilai'}</span>
            </button>
          </div>

        </div>

        {/* Kurikulum Merdeka Formula Banner */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-sky-900 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Ketentuan Penilaian Kurikulum Merdeka:</strong> KKTP = <strong>{selectedSubject.kktp}</strong> | Bobot Sumatif LM = <strong>{selectedSubject.weightSLM}%</strong> | Bobot SAS = <strong>{selectedSubject.weightSAS}%</strong>
            </span>
          </div>
          <div className="text-[11px] text-sky-700 font-medium">
            Nilai Akhir = ({selectedSubject.weightSLM}% &times; Rata SLM) + ({selectedSubject.weightSAS}% &times; SAS)
          </div>
        </div>

        {uploadSuccessNotice && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccessNotice}</span>
          </div>
        )}

      </div>

      {/* Tujuan Pembelajaran (TP) Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-xs">
              Tujuan Pembelajaran (TP) Yang Dinilai Semester Ini ({activeTps.length} TP)
            </h4>
            <p className="text-[11px] text-slate-500">
              Deskripsi TP digunakan sebagai dasar pembuatan narasi deskripsi capaian rapor otomatis.
            </p>
          </div>
          <button
            onClick={() => setShowTpModal(true)}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah TP
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {activeTps.map((tp) => (
            <div
              key={tp.id}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start justify-between gap-2"
            >
              <div>
                <span className="font-black text-blue-700 text-[11px] bg-blue-100 px-1.5 py-0.5 rounded mr-1.5">
                  {tp.code}
                </span>
                <span className="text-slate-700 text-[11px] leading-relaxed">
                  {tp.description}
                </span>
              </div>
              {activeTps.length > 1 && (
                <button
                  onClick={() => onDeleteLearningObjective(tp.id)}
                  title="Hapus TP"
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Table Filter & Search Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Daftar Penilaian Siswa ({filteredStudents.length} siswa)
            </span>
            {isLocked && (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Lembar Nilai Dikunci
              </span>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa / NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Interactive Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3 w-28">NISN</th>
                <th className="p-3 min-w-[170px]">Nama Lengkap Siswa</th>
                
                {/* Dynamically display active TPs columns */}
                {activeTps.map((tp) => (
                  <th key={tp.id} className="p-2 w-20 text-center bg-blue-50/50 border-l border-slate-200" title={tp.description}>
                    <div>{tp.code}</div>
                    <div className="text-[9px] text-blue-600 font-normal">Sumatif</div>
                  </th>
                ))}

                <th className="p-2 w-20 text-center bg-indigo-50/50 border-l border-slate-200" title="Sumatif Akhir Semester">
                  <div>SAS</div>
                  <div className="text-[9px] text-indigo-600 font-normal">{selectedSubject.weightSAS}%</div>
                </th>

                <th className="p-2 w-20 text-center bg-emerald-50/60 border-l border-slate-200">
                  <div>Nilai Akhir</div>
                  <div className="text-[9px] text-emerald-700 font-normal">KKTP: {selectedSubject.kktp}</div>
                </th>

                <th className="p-3 min-w-[220px] border-l border-slate-200">
                  Capaian Tertinggi
                </th>
                <th className="p-3 min-w-[220px] border-l border-slate-200">
                  Perlu Bimbingan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={activeTps.length + 6} className="p-8 text-center text-slate-400">
                    Tidak ada siswa ditemukan di kelas ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => {
                  const gradeRecord = grades.find(
                    (g) => g.studentId === std.id && g.subjectId === selectedSubjectId
                  );
                  const na = gradeRecord ? gradeRecord.nilaiAkhir : 0;
                  const isPassed = na >= selectedSubject.kktp;

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 text-center text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                      <td className="p-3 font-mono text-slate-600 text-[11px]">{std.nisn}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        {std.name}
                        <span className="block text-[10px] text-slate-400 font-normal">NIS: {std.nis}</span>
                      </td>

                      {/* Inputs for each TP */}
                      {activeTps.map((tp) => {
                        const scoreVal = gradeRecord?.sumatifScores?.[tp.id] ?? '';
                        return (
                          <td key={tp.id} className="p-2 text-center border-l border-slate-200">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              disabled={isLocked}
                              value={scoreVal}
                              onChange={(e) => handleScoreChange(std.id, tp.id, e.target.value)}
                              className="w-16 text-center font-bold font-mono py-1 px-1 border border-slate-300 rounded-md bg-white focus:bg-blue-50 focus:ring-1 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </td>
                        );
                      })}

                      {/* SAS Input */}
                      <td className="p-2 text-center border-l border-slate-200 bg-indigo-50/20">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={isLocked}
                          value={gradeRecord?.sumatifAkhirSemester ?? ''}
                          onChange={(e) => handleSasChange(std.id, e.target.value)}
                          className="w-16 text-center font-bold font-mono py-1 px-1 border border-indigo-200 rounded-md bg-white focus:bg-indigo-50 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100"
                        />
                      </td>

                      {/* Nilai Akhir Badge */}
                      <td className="p-2 text-center border-l border-slate-200">
                        <span className={`inline-block font-extrabold font-mono px-2.5 py-1 rounded-lg text-xs ${
                          na === 0
                            ? 'bg-slate-100 text-slate-400'
                            : isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {na > 0 ? na : '-'}
                        </span>
                      </td>

                      {/* Highest Competency Narrative */}
                      <td className="p-2.5 border-l border-slate-200 text-[11px] text-slate-700 leading-tight">
                        {gradeRecord?.highestCompetencyNarrative || (
                          <span className="text-slate-400 italic">Otomatis dihitung...</span>
                        )}
                      </td>

                      {/* Lowest Competency Narrative */}
                      <td className="p-2.5 border-l border-slate-200 text-[11px] text-slate-600 leading-tight">
                        {gradeRecord?.lowestCompetencyNarrative || (
                          <span className="text-slate-400 italic">Otomatis dihitung...</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Add TP */}
      {showTpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-blue-600 text-white p-4 font-bold text-sm flex items-center justify-between">
              <span>Tambah Tujuan Pembelajaran (TP) Baru</span>
              <button onClick={() => setShowTpModal(false)} className="text-white/80 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleCreateTp} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kode TP</label>
                <input
                  type="text"
                  required
                  value={newTpCode}
                  onChange={(e) => setNewTpCode(e.target.value)}
                  placeholder="Contoh: TP 5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deskripsi Capaian Kompetensi</label>
                <textarea
                  required
                  rows={3}
                  value={newTpDesc}
                  onChange={(e) => setNewTpDesc(e.target.value)}
                  placeholder="Contoh: Menganalisis penyajian data dalam bentuk diagram batang dan lingkaran..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1">Gunakan kata kerja operasional (C3-C5) sesuai pedoman Kurikulum Merdeka.</p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTpModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Simpan TP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
