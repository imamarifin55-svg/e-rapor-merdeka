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
  FileDown,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Award,
  BookOpen,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { exportLegerToExcel } from '../utils/excelHandler';

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
  const [viewType, setViewType] = useState<'academic' | 'identity' | 'extracurricular' | 'leger'>('academic');

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

  return (
    <div className="space-y-6">
      
      {/* Control Bar (Hidden when printing) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Pilih Kelas</label>
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
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {viewType !== 'leger' && (
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Pilih Siswa</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden max-w-[260px]"
                >
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nisn} - {s.name}
                    </option>
                  ))}
                </select>
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
                Unduh Leger Nilai Excel
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
            onClick={() => setViewType('academic')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              viewType === 'academic'
                ? 'bg-blue-100 text-blue-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Nilai &amp; Capaian Kompetensi (Utama)
          </button>
          <button
            onClick={() => setViewType('extracurricular')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              viewType === 'extracurricular'
                ? 'bg-blue-100 text-blue-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2. Ekskul, Kehadiran &amp; Catatan Wali Kelas
          </button>
          <button
            onClick={() => setViewType('identity')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              viewType === 'identity'
                ? 'bg-blue-100 text-blue-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3. Halaman Biodata Siswa Resmi
          </button>
          <button
            onClick={() => setViewType('leger')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              viewType === 'leger'
                ? 'bg-indigo-100 text-indigo-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            4. Leger Nilai Kelas (Master Sheet)
          </button>
        </div>

      </div>

      {/* Report Sheet Document (Printed or Previewed) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-10 max-w-4xl mx-auto print-container">
        
        {/* LEGER VIEW */}
        {viewType === 'leger' && (
          <div className="space-y-6">
            <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
              <h2 className="font-extrabold text-base uppercase text-slate-900 tracking-wider">
                LEGER NILAI HASIL BELAJAR SISWA
              </h2>
              <p className="text-xs font-semibold text-slate-800">
                {schoolProfile.name} • KELAS {selectedClass.name.toUpperCase()}
              </p>
              <p className="text-[11px] text-slate-600">
                Tahun Ajaran {currentAcademicYear.year} Semester {currentAcademicYear.semester} ({schoolProfile.curriculum})
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-400 border-collapse">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                  <tr>
                    <th className="p-2 border border-slate-300 text-center w-8">No</th>
                    <th className="p-2 border border-slate-300 text-center w-24">NISN</th>
                    <th className="p-2 border border-slate-300 text-left min-w-[160px]">Nama Siswa</th>
                    <th className="p-2 border border-slate-300 text-center w-10">JK</th>
                    {subjects.map((sub) => (
                      <th key={sub.id} className="p-1 border border-slate-300 text-center w-12" title={sub.name}>
                        {sub.code}
                      </th>
                    ))}
                    <th className="p-2 border border-slate-300 text-center w-14 bg-slate-200">Total</th>
                    <th className="p-2 border border-slate-300 text-center w-14 bg-slate-200">Rerata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {classStudents.map((std, idx) => {
                    let total = 0;
                    let count = 0;
                    return (
                      <tr key={std.id} className="hover:bg-slate-50">
                        <td className="p-1.5 border border-slate-300 text-center">{idx + 1}</td>
                        <td className="p-1.5 border border-slate-300 text-center font-mono text-[11px]">{std.nisn}</td>
                        <td className="p-1.5 border border-slate-300 font-medium">{std.name}</td>
                        <td className="p-1.5 border border-slate-300 text-center">{std.gender}</td>
                        {subjects.map((sub) => {
                          const g = grades.find((gr) => gr.studentId === std.id && gr.subjectId === sub.id);
                          const score = g ? g.nilaiAkhir : '-';
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

        {/* ACADEMIC REPORT VIEW */}
        {viewType === 'academic' && (
          <div className="space-y-6">
            
            {/* Kop Resmi Sekolah */}
            <div className="border-b-4 border-double border-slate-900 pb-3 text-center space-y-0.5">
              <h2 className="font-black text-lg tracking-wider text-slate-900 uppercase">
                {schoolProfile.name}
              </h2>
              <p className="text-xs text-slate-700">
                NPSN: {schoolProfile.npsn} | NSS: {schoolProfile.nss || '-'}
              </p>
              <p className="text-[11px] text-slate-600">
                {schoolProfile.address}, {schoolProfile.village}, {schoolProfile.district}, {schoolProfile.city}, {schoolProfile.province}
              </p>
              <p className="text-[10px] text-slate-500">
                Telp: {schoolProfile.phone} | Surel: {schoolProfile.email} | Laman: {schoolProfile.website}
              </p>
            </div>

            {/* Document Title */}
            <div className="text-center pt-2">
              <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-900">
                LAPORAN HASIL BELAJAR (RAPOR)
              </h3>
              <p className="text-xs font-semibold text-slate-700">
                Standar Kurikulum Merdeka Kemendikbudristek
              </p>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-800 border border-slate-300 p-3 rounded-lg bg-slate-50/50">
              <div className="flex">
                <span className="w-32 font-semibold">Nama Peserta Didik</span>
                <span className="font-bold">: {selectedStudent?.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">Kelas / Fase</span>
                <span className="font-bold">: {selectedClass.name} / Fase {selectedClass.phase}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">NISN / NIS</span>
                <span className="font-mono">: {selectedStudent?.nisn} / {selectedStudent?.nis}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">Semester</span>
                <span>: {currentAcademicYear.semester}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">Nama Sekolah</span>
                <span>: {schoolProfile.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">Tahun Ajaran</span>
                <span>: {currentAcademicYear.year}</span>
              </div>
            </div>

            {/* Academic Grades Table */}
            <div>
              <table className="w-full text-xs border border-slate-400 border-collapse">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                  <tr>
                    <th className="p-2.5 border border-slate-300 text-center w-8">No</th>
                    <th className="p-2.5 border border-slate-300 text-left w-52">Mata Pelajaran</th>
                    <th className="p-2.5 border border-slate-300 text-center w-20">Nilai Akhir</th>
                    <th className="p-2.5 border border-slate-300 text-left">Capaian Kompetensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {subjects.map((subj, idx) => {
                    const grade = studentGrades.find((g) => g.subjectId === subj.id);
                    const na = grade?.nilaiAkhir ?? '-';
                    const highest = grade?.highestCompetencyNarrative || 'Menunjukkan penguasaan kompetensi dengan baik.';
                    const lowest = grade?.lowestCompetencyNarrative || 'Mampu mempertahankan hasil belajar.';

                    return (
                      <tr key={subj.id} className="align-top">
                        <td className="p-2 border border-slate-300 text-center font-medium">{idx + 1}</td>
                        <td className="p-2 border border-slate-300 font-semibold text-slate-900">
                          {subj.name}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono font-bold text-sm">
                          {na}
                        </td>
                        <td className="p-2 border border-slate-300 text-[11px] leading-relaxed text-slate-800 space-y-1">
                          <p>
                            <span className="font-semibold text-emerald-800">• </span>
                            {highest}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-600">• </span>
                            {lowest}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

        {/* EXTRACURRICULAR & ATTENDANCE VIEW */}
        {viewType === 'extracurricular' && (
          <div className="space-y-6">
            
            <div className="border-b border-slate-300 pb-3">
              <h3 className="font-bold text-base text-slate-900 uppercase">
                Ekstrakurikuler, Ketidakhadiran &amp; Catatan Perkembangan Siswa
              </h3>
              <p className="text-xs text-slate-600">
                Nama Siswa: <strong>{selectedStudent?.name}</strong> | NISN: <strong>{selectedStudent?.nisn}</strong> | Kelas: <strong>{selectedClass.name}</strong>
              </p>
            </div>

            {/* Ekstrakurikuler Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-slate-800">A. Kegiatan Ekstrakurikuler</h4>
              <table className="w-full text-xs border border-slate-400 border-collapse">
                <thead className="bg-slate-100 text-slate-900 font-bold">
                  <tr>
                    <th className="p-2 border border-slate-300 text-center w-8">No</th>
                    <th className="p-2 border border-slate-300 text-left w-56">Kegiatan Ekstrakurikuler</th>
                    <th className="p-2 border border-slate-300 text-center w-28">Predikat</th>
                    <th className="p-2 border border-slate-300 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {studentExtracurriculars.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-slate-500 italic">
                        Tidak ada catatan kegiatan ekstrakurikuler.
                      </td>
                    </tr>
                  ) : (
                    studentExtracurriculars.map((ekskul, idx) => (
                      <tr key={ekskul.id}>
                        <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                        <td className="p-2 border border-slate-300 font-semibold">{ekskul.name}</td>
                        <td className="p-2 border border-slate-300 text-center font-bold">{ekskul.predicate}</td>
                        <td className="p-2 border border-slate-300 text-[11px]">{ekskul.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Attendance Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-slate-800">B. Ketidakhadiran (Absensi)</h4>
              <div className="w-64">
                <table className="w-full text-xs border border-slate-400 border-collapse">
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-300 font-medium">Sakit</td>
                      <td className="p-2 border border-slate-300 text-center font-bold w-20">{studentAttendance.sakit} hari</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-medium">Izin</td>
                      <td className="p-2 border border-slate-300 text-center font-bold w-20">{studentAttendance.izin} hari</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 font-medium">Tanpa Keterangan (Alpa)</td>
                      <td className="p-2 border border-slate-300 text-center font-bold w-20">{studentAttendance.tanpaKeterangan} hari</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Homeroom Notes */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-slate-800">C. Catatan Wali Kelas</h4>
              <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 text-xs text-slate-800 leading-relaxed min-h-[70px]">
                {studentNote?.notes || 'Tingkatkan terus motivasi belajarmu dan pertahankan prestasimu yang membanggakan!'}
              </div>
            </div>

            {/* Decision Status if semester genap */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-slate-800">D. Keputusan Hasil Belajar</h4>
              <div className="border border-slate-300 p-3 rounded-lg bg-slate-50 text-xs font-semibold text-slate-800">
                Berdasarkan hasil pencapaian kompetensi pada semester ini, peserta didik ditetapkan:{' '}
                <span className="text-emerald-700 underline font-bold">
                  {studentNote?.decision || 'Melanjutkan ke Semester Genap'}
                </span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 pt-6 text-xs text-center page-break-inside-avoid">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold mb-16">Orang Tua / Wali</p>
                <p className="font-bold underline">({selectedStudent?.parentName || '....................................'})</p>
              </div>
              <div>
                <p>{schoolProfile.reportPlace}, {schoolProfile.reportDate}</p>
                <p className="font-semibold mb-16">Wali Kelas,</p>
                <p className="font-bold underline">{selectedClass.homeroomTeacherName}</p>
                <p className="text-[11px]">NIP. 19810314 200501 1 008</p>
              </div>
            </div>

          </div>
        )}

        {/* IDENTITY VIEW */}
        {viewType === 'identity' && (
          <div className="space-y-6">
            <div className="text-center border-b-2 border-slate-900 pb-3">
              <h2 className="font-extrabold text-base tracking-wider uppercase text-slate-900">
                KETERANGAN TENTANG DIRI PESERTA DIDIK
              </h2>
              <p className="text-xs text-slate-600">Buku Induk &amp; Lembar Biodata Resmi Sekolah</p>
            </div>

            <div className="space-y-3 text-xs text-slate-800">
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-semibold">1. Nama Lengkap Peserta Didik</span>
                <span className="col-span-2 font-bold">: {selectedStudent?.name}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-semibold">2. Nomor Induk Siswa Nasional (NISN)</span>
                <span className="col-span-2 font-mono font-bold">: {selectedStudent?.nisn}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-semibold">3. Nomor Induk Siswa (NIS)</span>
                <span className="col-span-2 font-mono">: {selectedStudent?.nis}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-semibold">4. Tempat, Tanggal Lahir</span>
                <span className="col-span-2">: {selectedStudent?.birthPlace}, {selectedStudent?.birthDate}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-semibold">5. Jenis Kelamin</span>
                <span className="col-span-2">: {selectedStudent?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-semibold">6. Agama</span>
                <span className="col-span-2">: {selectedStudent?.religion}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-semibold">7. Alamat Peserta Didik</span>
                <span className="col-span-2">: {selectedStudent?.address}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-semibold">8. Nama Orang Tua / Wali</span>
                <span className="col-span-2 font-semibold">: {selectedStudent?.parentName}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-semibold">9. Nomor Telepon / HP Orang Tua</span>
                <span className="col-span-2">: {selectedStudent?.parentPhone}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-semibold">10. Diterima di Sekolah Ini</span>
                <span className="col-span-2">: Di Kelas {selectedClass.name}, Tanggal 15 Juli 2025</span>
              </div>
            </div>

            {/* Photo & Signature */}
            <div className="grid grid-cols-2 pt-8 text-xs items-center">
              <div className="flex justify-center">
                <div className="w-28 h-36 border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 text-[10px] text-center p-2 rounded">
                  Pas Foto Siswa<br />3 x 4 cm
                </div>
              </div>
              <div className="text-center">
                <p>{schoolProfile.reportPlace}, 15 Juli 2025</p>
                <p className="font-semibold mb-16">Kepala Sekolah,</p>
                <p className="font-bold underline">{schoolProfile.headmasterName}</p>
                <p className="text-[11px]">NIP. {schoolProfile.headmasterNip}</p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
