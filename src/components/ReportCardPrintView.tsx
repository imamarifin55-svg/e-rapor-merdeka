import React, { useState } from 'react';
import {
  Student,
  Subject,
  ClassRoom,
  GradeRecord,
  AttendanceRecord,
  ExtracurricularRecord,
  StudentHomeroomNote,
  SchoolProfile,
  AcademicYear,
} from '../types/erapor';
import {
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Award,
  BookOpen,
  UserCheck,
  ChevronRight,
  Sparkles,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { exportLegerToExcel } from '../utils/excelHandler';
import { getStsPredicate, getStsStatus, generateDefaultStsNote } from '../utils/gradeCalculations';
import {
  isReligionSubject,
  getSubjectReligion,
  getEligibleSubjectsForStudent,
  sortKemdikbudSubjects,
} from '../utils/subjectReligionHelper';
import { PemdaLogo, SchoolLogo } from './SchoolLogos';

interface Props {
  schoolProfile: SchoolProfile;
  academicYears: AcademicYear[];
  selectedAcademicYearId: string;
  classes: ClassRoom[];
  students: Student[];
  subjects: Subject[];
  grades: GradeRecord[];
  attendances: AttendanceRecord[];
  extracurriculars: ExtracurricularRecord[];
  homeroomNotes: StudentHomeroomNote[];
}

export const ReportCardPrintView: React.FC<Props> = ({
  schoolProfile,
  academicYears,
  selectedAcademicYearId,
  classes,
  students,
  subjects,
  grades,
  attendances,
  extracurriculars,
  homeroomNotes,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-7-1');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'std-01');
  const [viewType, setViewType] = useState<'sts_report' | 'leger' | 'identity'>('sts_report');
  const [onlyShowInputted, setOnlyShowInputted] = useState<boolean>(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId);
  const selectedStudent = students.find((s) => s.id === selectedStudentId) || classStudents[0] || students[0];
  const currentAcademicYear = academicYears.find((ay) => ay.id === selectedAcademicYearId) || academicYears[0];

  // Specific student's data
  const studentGrades = grades.filter((g) => g.studentId === selectedStudent?.id);
  const studentAttendance = attendances.find((a) => a.studentId === selectedStudent?.id) || {
    studentId: selectedStudent?.id || '',
    classId: selectedClassId,
    semester: currentAcademicYear.semester,
    academicYearId: currentAcademicYear.id,
    sakit: 0,
    izin: 0,
    tanpaKeterangan: 0,
  };
  const studentExtracurriculars = extracurriculars.filter((e) => e.studentId === selectedStudent?.id);
  const studentNote = homeroomNotes.find((n) => n.studentId === selectedStudent?.id);

  const handlePrint = () => {
    window.print();
  };

  const handleExportLeger = () => {
    exportLegerToExcel(selectedClass, classStudents, subjects, grades);
  };

  // Helper to extract student's raw STS grade for a subject
  const getSubjectStsGrade = (subjectId: string, kktp: number) => {
    const gr = studentGrades.find((g) => g.subjectId === subjectId);
    let rawScore: number | null = null;
    if (typeof gr?.stsScore === 'number') {
      rawScore = gr.stsScore;
    } else if (typeof gr?.sumatifTengahSemester === 'number') {
      rawScore = gr.sumatifTengahSemester;
    } else if (typeof gr?.nilaiAkhir === 'number' && gr.nilaiAkhir > 0) {
      rawScore = gr.nilaiAkhir;
    }

    if (rawScore === null) {
      return {
        score: '-',
        numericScore: 0,
        predicate: '-',
        status: 'Belum Diisi',
        note: 'Nilai STS belum diinput oleh guru mata pelajaran.',
      };
    }

    const predicate = getStsPredicate(rawScore, kktp);
    const status = getStsStatus(rawScore, kktp);
    const note = gr?.catatanSts || gr?.highestCompetencyNarrative || generateDefaultStsNote(rawScore, kktp);

    return {
      score: rawScore,
      numericScore: rawScore,
      predicate,
      status,
      note,
    };
  };

  // 1. Dapatkan hanya mata pelajaran yang diambil siswa (1 mapel agama yang sesuai + mapel umum & mulok)
  // Sesuai urutan baku resmi Kemdikbud
  const enrolledStudentSubjects = getEligibleSubjectsForStudent(selectedStudent, subjects);

  // 2. Filter mapel untuk tampilan cetak rapor (opsi: hanya tampilkan mapel yang sudah diisi nilai)
  const displayedStudentSubjects = onlyShowInputted
    ? enrolledStudentSubjects.filter((subj) => {
        const gr = getSubjectStsGrade(subj.id, subj.kktp);
        return typeof gr.score === 'number' && gr.score > 0;
      })
    : enrolledStudentSubjects;

  // 3. Calculate student averages for STS (hanya dari mapel yang diambil siswa)
  const evaluatedScores = enrolledStudentSubjects
    .map((sub) => getSubjectStsGrade(sub.id, sub.kktp))
    .filter((res) => typeof res.score === 'number' && res.score > 0);

  const totalStsScore = evaluatedScores.reduce((acc, curr) => acc + (curr.numericScore || 0), 0);
  const studentAvgSts = evaluatedScores.length > 0 ? (totalStsScore / evaluatedScores.length).toFixed(1) : '-';

  return (
    <div className="space-y-6">
      
      {/* Control Bar (Hidden when printing) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Pilih Kelas (12 Rombel)
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  const firstInClass = students.find((s) => s.classId === e.target.value);
                  if (firstInClass) setSelectedStudentId(firstInClass.id);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} • Wali: {c.homeroomTeacherName}
                  </option>
                ))}
              </select>
            </div>

            {viewType !== 'leger' && (
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Pilih Siswa
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden max-w-[280px]"
                  >
                    {classStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nisn} - {s.name} ({s.religion || 'Islam'})
                      </option>
                    ))}
                  </select>
                </div>

                {viewType === 'sts_report' && (
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition h-[38px]">
                    <input
                      type="checkbox"
                      checked={onlyShowInputted}
                      onChange={(e) => setOnlyShowInputted(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Hanya Tampilkan Mapel Yang Sudah Diisi Nilai</span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {viewType === 'leger' ? (
              <button
                onClick={handleExportLeger}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Unduh Leger Nilai STS (Excel)
              </button>
            ) : null}

            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF (A4)
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex border-t border-slate-100 pt-3 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setViewType('sts_report')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              viewType === 'sts_report'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            1. Rapor Sisipan STS (Per Siswa)
          </button>
          <button
            onClick={() => setViewType('leger')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              viewType === 'leger'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            2. Leger Nilai STS Kelas
          </button>
          <button
            onClick={() => setViewType('identity')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              viewType === 'identity'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            3. Biodata Siswa Resmi
          </button>
        </div>

      </div>

      {/* PRINTABLE CANVAS (Standard A4) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 mx-auto max-w-4xl text-slate-800 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
        
        {/* VIEW 1: RAPOR SISIPAN STS PER SISWA */}
        {viewType === 'sts_report' && (
          <div className="space-y-6">
            
            {/* Kop Resmi Sekolah Standar Kemdikbud & Pemkab Tulang Bawang Barat */}
            <div className="pb-3">
              <div className="flex items-center justify-between gap-4">
                {/* Logo Kiri: Pemkab Tulang Bawang Barat */}
                <div className="w-20 sm:w-24 shrink-0 flex justify-center">
                  <PemdaLogo customSrc={schoolProfile.logoPemda} className="w-18 h-18 sm:w-20 sm:h-20" />
                </div>

                {/* Kop Teks Tengah */}
                <div className="flex-1 text-center space-y-0.5">
                  <h3 className="font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-800">
                    PEMERINTAH KABUPATEN {schoolProfile.city?.toUpperCase() || 'TULANG BAWANG BARAT'}
                  </h3>
                  <h3 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-slate-800">
                    DINAS PENDIDIKAN DAN KEBUDAYAAN
                  </h3>
                  <h2 className="font-black text-lg sm:text-xl tracking-wide uppercase text-slate-900 pt-0.5">
                    {schoolProfile.name}
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-700 font-mono">
                    NPSN: {schoolProfile.npsn} {schoolProfile.nss ? `| NSS: ${schoolProfile.nss}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-700 leading-snug">
                    {schoolProfile.address}, Kec. {schoolProfile.district || 'Gunung Agung'}, Kab. {schoolProfile.city || 'Tulang Bawang Barat'}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Provinsi {schoolProfile.province || 'Lampung'} Kode Pos {schoolProfile.postalCode || '34683'} | Pos-el: {schoolProfile.email || 'smpn14tubaba@sch.id'}
                  </p>
                </div>

                {/* Logo Kanan: Tut Wuri Handayani / Lambang Sekolah */}
                <div className="w-20 sm:w-24 shrink-0 flex justify-center">
                  <SchoolLogo customSrc={schoolProfile.logoSekolah} className="w-18 h-18 sm:w-20 sm:h-20" />
                </div>
              </div>

              {/* Garis Ganda Standar Kop Surat Resmi (Tebal & Tipis) */}
              <div className="pt-2">
                <div className="border-b-[3px] border-slate-900 w-full" />
                <div className="border-b border-slate-900 w-full mt-[2px]" />
              </div>
            </div>

            {/* Document Title: Rapor Sisipan STS */}
            <div className="text-center pt-1 space-y-1">
              <h3 className="font-black text-lg uppercase tracking-wide text-slate-900">
                LAPORAN HASIL ASESMEN TENGAH SEMESTER (STS)
              </h3>
              <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">
                RAPOR SISIPAN KURIKULUM MERDEKA
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                Tahun Ajaran {currentAcademicYear.year} • Semester {currentAcademicYear.semester}
              </p>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-800 border border-slate-300 p-3 rounded-lg bg-slate-50/50">
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Nama Peserta Didik</span>
                <span className="font-bold text-slate-900">: {selectedStudent?.name}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Kelas / Fase</span>
                <span className="font-bold text-slate-900">: {selectedClass.name} / Fase {selectedClass.phase}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">NISN / NIS</span>
                <span className="font-mono">: {selectedStudent?.nisn} / {selectedStudent?.nis}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Semester</span>
                <span>: {currentAcademicYear.semester}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Nama Sekolah</span>
                <span>: {schoolProfile.name}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Tahun Pelajaran</span>
                <span>: {currentAcademicYear.year}</span>
              </div>
            </div>

            {/* STS Grades Table */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900">
                  A. Capaian Nilai Asesmen Sumatif Tengah Semester (STS)
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">
                  * Nilai murni hasil tes STS siswa
                </span>
              </div>

              <table className="w-full text-xs border border-slate-400 border-collapse">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center">
                  <tr>
                    <th className="p-2 border border-slate-300 w-8">No</th>
                    <th className="p-2 border border-slate-300 text-left w-64">Mata Pelajaran</th>
                    <th className="p-2 border border-slate-300 w-14">KKTP</th>
                    <th className="p-2 border border-slate-300 w-24 bg-blue-50/60 font-black">
                      Nilai STS
                    </th>
                    <th className="p-2 border border-slate-300 text-left">
                      Catatan Capaian Kompetensi Guru Mata Pelajaran
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-300">
                  {displayedStudentSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 font-medium">
                        Belum ada nilai mata pelajaran yang diinput untuk siswa ini.
                      </td>
                    </tr>
                  ) : (
                    displayedStudentSubjects.map((subj, idx) => {
                      const gradeData = getSubjectStsGrade(subj.id, subj.kktp);

                      return (
                        <tr key={subj.id} className="align-middle">
                          <td className="p-2 border border-slate-300 text-center font-medium">
                            {idx + 1}
                          </td>
                          <td className="p-2 border border-slate-300 font-bold text-slate-900">
                            {subj.name}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-mono font-semibold text-slate-600">
                            {subj.kktp}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-mono font-black text-sm bg-blue-50/30">
                            {gradeData.score}
                          </td>
                          <td className="p-2 border border-slate-300 text-[11px] leading-relaxed text-slate-800">
                            {gradeData.note}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                {/* Summary Row */}
                <tfoot className="bg-slate-100 font-bold border-t border-slate-400">
                  <tr>
                    <td colSpan={3} className="p-2 text-right pr-4 border border-slate-300">
                      Rata-Rata Nilai STS:
                    </td>
                    <td className="p-2 text-center font-mono font-black text-blue-800 border border-slate-300 text-sm">
                      {studentAvgSts}
                    </td>
                    <td className="p-2 text-left pl-3 text-[11px] text-slate-700 border border-slate-300">
                      Rapor Sisipan Sumatif Tengah Semester (Nilai Murni STS Siswa)
                    </td>
                  </tr>
                </tfoot>

              </table>
            </div>

            {/* Attendance & Midterm Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* B. Ketidakhadiran */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900">
                  B. Ketidakhadiran Tengah Semester
                </h4>
                <table className="w-full text-xs border border-slate-300 border-collapse">
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-300 font-medium w-48">1. Sakit</td>
                      <td className="p-2 border border-slate-300 font-mono font-bold text-center">
                        {studentAttendance.sakit} hari
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-medium">2. Izin</td>
                      <td className="p-2 border border-slate-300 font-mono font-bold text-center">
                        {studentAttendance.izin} hari
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-medium">3. Tanpa Keterangan</td>
                      <td className="p-2 border border-slate-300 font-mono font-bold text-center">
                        {studentAttendance.tanpaKeterangan} hari
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* C. Catatan Wali Kelas */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900">
                  C. Catatan Perkembangan Wali Kelas
                </h4>
                <div className="border border-slate-300 p-2.5 rounded text-xs min-h-[92px] text-slate-800 leading-relaxed bg-slate-50/40">
                  {studentNote?.notes ||
                    'Tetap semangat dan terus tingkatkan kedisiplinan serta ketekunan belajar menghadapi pembelajaran tengah semester ke depan.'}
                </div>
              </div>

            </div>

            {/* Titimangsa & Tanda Tangan */}
            <div className="grid grid-cols-3 pt-6 text-xs text-center gap-4 page-break-inside-avoid">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold mb-16">Orang Tua / Wali Murid</p>
                <p className="font-bold underline">({selectedStudent?.parentName || '....................................'})</p>
              </div>

              <div>
                <p>&nbsp;</p>
                <p className="font-semibold mb-16">Wali Kelas,</p>
                <p className="font-bold underline">{selectedClass.homeroomTeacherName}</p>
                <p className="text-[11px]">NIP. 19810314 200501 1 008</p>
              </div>

              <div>
                <p>{schoolProfile.reportPlace}, {schoolProfile.reportDate}</p>
                <p className="font-semibold mb-16">Kepala Sekolah,</p>
                <p className="font-bold underline">{schoolProfile.headmasterName}</p>
                <p className="text-[11px]">NIP. {schoolProfile.headmasterNip}</p>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: LEGER NILAI STS KELAS */}
        {viewType === 'leger' && (
          <div className="space-y-6">
            <div className="border-b-2 border-slate-800 pb-3">
              <div className="flex items-center justify-between gap-4">
                <PemdaLogo customSrc={schoolProfile.logoPemda} className="w-14 h-14 shrink-0" />
                <div className="flex-1 text-center space-y-0.5">
                  <h2 className="font-black text-sm uppercase text-slate-900 tracking-wider">
                    LEGER NILAI ASESMEN SUMATIF TENGAH SEMESTER (STS)
                  </h2>
                  <p className="text-xs font-extrabold text-slate-800">
                    {schoolProfile.name} • KELAS {selectedClass.name.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Tahun Ajaran {currentAcademicYear.year} Semester {currentAcademicYear.semester} (Rapor Sisipan / Murni STS)
                  </p>
                </div>
                <SchoolLogo customSrc={schoolProfile.logoSekolah} className="w-14 h-14 shrink-0" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-400 border-collapse">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center">
                  <tr>
                    <th className="p-2 border border-slate-300 w-8">No</th>
                    <th className="p-2 border border-slate-300 w-24">NISN</th>
                    <th className="p-2 border border-slate-300 text-left min-w-[160px]">Nama Siswa</th>
                    <th className="p-2 border border-slate-300 w-10">JK</th>
                    <th className="p-2 border border-slate-300 w-16">Agama</th>
                    <th className="p-1 border border-slate-300 w-14 bg-indigo-50 font-bold" title="Pendidikan Agama & Budi Pekerti (Sesuai Agama Siswa)">
                      PAB
                    </th>
                    {sortKemdikbudSubjects(subjects.filter((s) => !isReligionSubject(s))).map((sub) => (
                      <th key={sub.id} className="p-1 border border-slate-300 w-12" title={`${sub.code} - ${sub.name}`}>
                        {sub.code}
                      </th>
                    ))}
                    <th className="p-2 border border-slate-300 w-14 bg-blue-100 text-blue-900 font-black">Total</th>
                    <th className="p-2 border border-slate-300 w-14 bg-blue-100 text-blue-900 font-black">Rerata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {classStudents.map((std, idx) => {
                    let total = 0;
                    let count = 0;
                    const nonRelSubjects = sortKemdikbudSubjects(subjects.filter((s) => !isReligionSubject(s)));

                    // 1. Nilai Agama Siswa
                    const relSubj = subjects.find(
                      (s) => isReligionSubject(s) && getSubjectReligion(s) === (std.religion || 'Islam')
                    ) || subjects.find((s) => isReligionSubject(s));

                    let relScore: number | '-' = '-';
                    if (relSubj) {
                      const g = grades.find((gr) => gr.studentId === std.id && gr.subjectId === relSubj.id);
                      if (typeof g?.stsScore === 'number' && g.stsScore > 0) relScore = g.stsScore;
                      else if (typeof g?.sumatifTengahSemester === 'number' && g.sumatifTengahSemester > 0) relScore = g.sumatifTengahSemester;
                      else if (typeof g?.nilaiAkhir === 'number' && g.nilaiAkhir > 0) relScore = g.nilaiAkhir;
                    }
                    if (typeof relScore === 'number') {
                      total += relScore;
                      count++;
                    }

                    return (
                      <tr key={std.id} className="hover:bg-slate-50">
                        <td className="p-1.5 border border-slate-300 text-center">{idx + 1}</td>
                        <td className="p-1.5 border border-slate-300 text-center font-mono text-[11px]">{std.nisn}</td>
                        <td className="p-1.5 border border-slate-300 font-medium">{std.name}</td>
                        <td className="p-1.5 border border-slate-300 text-center">{std.gender}</td>
                        <td className="p-1.5 border border-slate-300 text-center text-[10px] font-semibold text-slate-600">
                          {std.religion || 'Islam'}
                        </td>
                        <td className="p-1.5 border border-slate-300 text-center font-mono font-semibold bg-indigo-50/40">
                          {relScore}
                        </td>
                        {nonRelSubjects.map((sub) => {
                          const g = grades.find((gr) => gr.studentId === std.id && gr.subjectId === sub.id);
                          const score = typeof g?.stsScore === 'number' && g.stsScore > 0
                            ? g.stsScore
                            : (typeof g?.sumatifTengahSemester === 'number' && g.sumatifTengahSemester > 0
                            ? g.sumatifTengahSemester
                            : (typeof g?.nilaiAkhir === 'number' && g.nilaiAkhir > 0 ? g.nilaiAkhir : '-'));

                          if (typeof score === 'number') {
                            total += score;
                            count++;
                          }
                          return (
                            <td key={sub.id} className="p-1.5 border border-slate-300 text-center font-mono font-semibold">
                              {score}
                            </td>
                          );
                        })}
                        <td className="p-1.5 border border-slate-300 text-center font-mono font-bold bg-slate-50">{total}</td>
                        <td className="p-1.5 border border-slate-300 text-center font-mono font-bold bg-slate-50">
                          {count > 0 ? (total / count).toFixed(1) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Leger Signatures */}
            <div className="grid grid-cols-2 pt-6 text-xs text-center">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold mb-14">Kepala {schoolProfile.name}</p>
                <p className="font-bold underline">{schoolProfile.headmasterName}</p>
                <p className="text-[11px]">NIP. {schoolProfile.headmasterNip}</p>
              </div>
              <div>
                <p>{schoolProfile.reportPlace}, {schoolProfile.reportDate}</p>
                <p className="font-semibold mb-14">Wali Kelas</p>
                <p className="font-bold underline">{selectedClass.homeroomTeacherName}</p>
                <p className="text-[11px]">NIP. 19810314 200501 1 008</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: BIODATA SISWA */}
        {viewType === 'identity' && (
          <div className="space-y-6">
            <div className="border-b-2 border-slate-800 pb-3 text-center">
              <h3 className="font-black text-base uppercase text-slate-900">
                LEMBAR BIODATA PESERTA DIDIK
              </h3>
              <p className="text-xs text-slate-600">{schoolProfile.name}</p>
            </div>

            <table className="w-full text-xs border border-slate-300 border-collapse">
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold w-48">Nama Lengkap</td>
                  <td className="p-2 border border-slate-300 font-bold">{selectedStudent?.name}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Nomor Induk Siswa Nasional (NISN)</td>
                  <td className="p-2 border border-slate-300 font-mono">{selectedStudent?.nisn}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Nomor Induk Siswa (NIS)</td>
                  <td className="p-2 border border-slate-300 font-mono">{selectedStudent?.nis}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Tempat, Tanggal Lahir</td>
                  <td className="p-2 border border-slate-300">{selectedStudent?.birthPlace}, {selectedStudent?.birthDate}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Jenis Kelamin</td>
                  <td className="p-2 border border-slate-300">{selectedStudent?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Agama</td>
                  <td className="p-2 border border-slate-300">{selectedStudent?.religion}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Nama Orang Tua / Wali</td>
                  <td className="p-2 border border-slate-300">{selectedStudent?.parentName}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Nomor Telepon Orang Tua</td>
                  <td className="p-2 border border-slate-300 font-mono">{selectedStudent?.parentPhone}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">Alamat Tempat Tinggal</td>
                  <td className="p-2 border border-slate-300">{selectedStudent?.address}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
