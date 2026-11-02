import React, { useState } from 'react';
import {
  Student,
  ClassRoom,
  AttendanceRecord,
  ExtracurricularRecord,
  StudentHomeroomNote,
  UserSession,
} from '../types/erapor';
import {
  UserCheck,
  Award,
  Calendar,
  MessageSquare,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface Props {
  currentSession: UserSession;
  classes: ClassRoom[];
  students: Student[];
  attendances: AttendanceRecord[];
  onUpdateAttendances: (updated: AttendanceRecord[]) => void;
  extracurriculars: ExtracurricularRecord[];
  onUpdateExtracurriculars: (updated: ExtracurricularRecord[]) => void;
  homeroomNotes: StudentHomeroomNote[];
  onUpdateHomeroomNotes: (updated: StudentHomeroomNote[]) => void;
  onNavigateToPrint: (studentId?: string) => void;
}

export const HomeroomManagementView: React.FC<Props> = ({
  currentSession,
  classes,
  students,
  attendances,
  onUpdateAttendances,
  extracurriculars,
  onUpdateExtracurriculars,
  homeroomNotes,
  onUpdateHomeroomNotes,
  onNavigateToPrint,
}) => {
  // If session is wali_kelas, default to their assigned class, otherwise first class
  const defaultClassId = currentSession.assignedClass || classes[0]?.id || 'cls-7-1';
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'notes' | 'extracurricular'>('attendance');
  const [notice, setNotice] = useState<string | null>(null);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Handle attendance change inline
  const handleAttendanceChange = (
    studentId: string,
    field: 'sakit' | 'izin' | 'tanpaKeterangan',
    valueStr: string
  ) => {
    const val = valueStr === '' ? 0 : Math.max(0, parseInt(valueStr, 10) || 0);
    const existing = attendances.find((a) => a.studentId === studentId);

    const updatedRecord: AttendanceRecord = existing
      ? { ...existing, [field]: val }
      : {
          studentId,
          classId: selectedClassId,
          semester: 'Ganjil',
          academicYearId: 'ay-2025-1',
          sakit: field === 'sakit' ? val : 0,
          izin: field === 'izin' ? val : 0,
          tanpaKeterangan: field === 'tanpaKeterangan' ? val : 0,
        };

    const newAttendances = attendances.some((a) => a.studentId === studentId)
      ? attendances.map((a) => (a.studentId === studentId ? updatedRecord : a))
      : [...attendances, updatedRecord];

    onUpdateAttendances(newAttendances);
  };

  // Handle homeroom note change
  const handleNoteChange = (studentId: string, text: string) => {
    const existing = homeroomNotes.find((n) => n.studentId === studentId);
    const updated: StudentHomeroomNote = existing
      ? { ...existing, notes: text }
      : {
          studentId,
          classId: selectedClassId,
          semester: 'Ganjil',
          academicYearId: 'ay-2025-1',
          notes: text,
          decision: 'Melanjutkan ke Semester 2',
        };

    const newNotes = homeroomNotes.some((n) => n.studentId === studentId)
      ? homeroomNotes.map((n) => (n.studentId === studentId ? updated : n))
      : [...homeroomNotes, updated];

    onUpdateHomeroomNotes(newNotes);
  };

  // Quick suggestion for homeroom notes
  const applyNoteTemplate = (studentId: string, studentName: string, type: 'rajin' | 'perlu_bimbingan' | 'prestasi') => {
    let noteText = '';
    const firstName = studentName.split(' ')[0];

    if (type === 'rajin') {
      noteText = `Ananda ${firstName} menunjukkan kedisiplinan dan keaktifan yang sangat baik dalam kegiatan belajar. Pertahankan semangat dan budi pekertimu yang luhur!`;
    } else if (type === 'prestasi') {
      noteText = `Prestasi akademik dan non-akademik Ananda ${firstName} sangat membanggakan di semester ini. Teruslah berkarya dan raih cita-citamu setinggi langit!`;
    } else {
      noteText = `Ananda ${firstName} memiliki potensi yang besar. Tingkatkan kedisiplinan belajar mandiri di rumah dan lebih fokus saat pembelajaran di kelas.`;
    }

    handleNoteChange(studentId, noteText);
    setNotice(`Saran catatan untuk ${firstName} berhasil diterapkan!`);
    setTimeout(() => setNotice(null), 2500);
  };

  // Extracurricular handlers
  const handleAddEkskul = (studentId: string) => {
    const newEkskul: ExtracurricularRecord = {
      id: `ekskul-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId,
      classId: selectedClassId,
      semester: 'Ganjil',
      academicYearId: 'ay-2025-1',
      name: 'Praja Muda Karana (Pramuka)',
      predicate: 'Baik',
      description: 'Aktif mengikuti kegiatan baris-berbaris dan penjelajahan regu.',
    };
    onUpdateExtracurriculars([...extracurriculars, newEkskul]);
  };

  const handleUpdateEkskul = (
    ekskulId: string,
    field: 'name' | 'predicate' | 'description',
    value: any
  ) => {
    const updated = extracurriculars.map((e) =>
      e.id === ekskulId ? { ...e, [field]: value } : e
    );
    onUpdateExtracurriculars(updated);
  };

  const handleDeleteEkskul = (ekskulId: string) => {
    onUpdateExtracurriculars(extracurriculars.filter((e) => e.id !== ekskulId));
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-emerald-100">
          <UserCheck className="w-3.5 h-3.5 text-amber-300" />
          Ruang Kerja Wali Kelas (12 Rombel)
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Pengelolaan Kelas Binaan: Absensi, Ekstrakurikuler &amp; Catatan Rapor
        </h2>
        <p className="text-xs text-emerald-100 max-w-3xl leading-relaxed">
          Setiap wali kelas dapat mengisi rekap ketidakhadiran, predikat kegiatan ekstrakurikuler, dan catatan perkembangan kepribadian siswa binaan. Semua data ini otomatis tercetak pada lembar resmi e-Rapor PDF.
        </p>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notice}</span>
        </div>
      )}

      {/* Class Selector & SubTabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-700">Pilih Kelas Binaan:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Wali Kelas: {c.homeroomTeacherName})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            Wali Kelas: <strong className="text-slate-800">{selectedClass.homeroomTeacherName}</strong> ({classStudents.length} siswa)
          </div>

        </div>

        {/* SubTab Navigation */}
        <div className="flex border-t border-slate-100 pt-3 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'attendance'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            1. Rekap Ketidakhadiran (Absensi)
          </button>

          <button
            onClick={() => setActiveSubTab('notes')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'notes'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            2. Catatan Perkembangan Wali Kelas
          </button>

          <button
            onClick={() => setActiveSubTab('extracurricular')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'extracurricular'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            3. Kegiatan Ekstrakurikuler Siswa
          </button>
        </div>

      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* SUBTAB 1: ATTENDANCE TABLE */}
        {activeSubTab === 'attendance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3 w-28">NISN</th>
                  <th className="p-3 min-w-[200px]">Nama Lengkap Siswa</th>
                  <th className="p-3 w-28 text-center bg-blue-50/50">Sakit (Hari)</th>
                  <th className="p-3 w-28 text-center bg-amber-50/50">Izin (Hari)</th>
                  <th className="p-3 w-32 text-center bg-rose-50/50">Alpa / Tanpa Ket. (Hari)</th>
                  <th className="p-3 text-center w-28">Total Absen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classStudents.map((std, idx) => {
                  const att = attendances.find((a) => a.studentId === std.id) || {
                    studentId: std.id,
                    classId: selectedClassId,
                    semester: 'Ganjil',
                    academicYearId: 'ay-2025-1',
                    sakit: 0,
                    izin: 0,
                    tanpaKeterangan: 0,
                  };
                  const total = (att.sakit || 0) + (att.izin || 0) + (att.tanpaKeterangan || 0);

                  return (
                    <tr key={std.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="p-3 font-mono text-slate-700 text-[11px]">{std.nisn}</td>
                      <td className="p-3 font-semibold text-slate-900">{std.name}</td>
                      
                      <td className="p-2.5 text-center bg-blue-50/20">
                        <input
                          type="number"
                          min="0"
                          max="90"
                          value={att.sakit}
                          onChange={(e) => handleAttendanceChange(std.id, 'sakit', e.target.value)}
                          className="w-16 text-center font-bold font-mono py-1 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </td>

                      <td className="p-2.5 text-center bg-amber-50/20">
                        <input
                          type="number"
                          min="0"
                          max="90"
                          value={att.izin}
                          onChange={(e) => handleAttendanceChange(std.id, 'izin', e.target.value)}
                          className="w-16 text-center font-bold font-mono py-1 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </td>

                      <td className="p-2.5 text-center bg-rose-50/20">
                        <input
                          type="number"
                          min="0"
                          max="90"
                          value={att.tanpaKeterangan}
                          onChange={(e) => handleAttendanceChange(std.id, 'tanpaKeterangan', e.target.value)}
                          className="w-16 text-center font-bold font-mono py-1 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-slate-800">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          total === 0 ? 'bg-emerald-100 text-emerald-800' : total > 5 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {total} hari
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBTAB 2: HOMEROOM NOTES */}
        {activeSubTab === 'notes' && (
          <div className="p-5 space-y-4">
            <div className="text-xs text-slate-500">
              Ketikkan catatan pembinaan karakter, motivasi belajar, atau pencapaian sikap siswa yang akan tercetak di lembar rapor.
            </div>

            <div className="space-y-4">
              {classStudents.map((std, idx) => {
                const note = homeroomNotes.find((n) => n.studentId === std.id)?.notes || '';

                return (
                  <div key={std.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {idx + 1}. {std.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">NISN: {std.nisn}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400">Gunakan Template:</span>
                        <button
                          onClick={() => applyNoteTemplate(std.id, std.name, 'rajin')}
                          className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-medium transition"
                        >
                          Rajin / Disiplin
                        </button>
                        <button
                          onClick={() => applyNoteTemplate(std.id, std.name, 'prestasi')}
                          className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-medium transition"
                        >
                          Prestasi
                        </button>
                        <button
                          onClick={() => applyNoteTemplate(std.id, std.name, 'perlu_bimbingan')}
                          className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded font-medium transition"
                        >
                          Motivasi
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => handleNoteChange(std.id, e.target.value)}
                      placeholder={`Tuliskan catatan khusus wali kelas untuk ${std.name}...`}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 3: EXTRACURRICULAR ACTIVITIES */}
        {activeSubTab === 'extracurricular' && (
          <div className="p-5 space-y-4">
            <div className="text-xs text-slate-500">
              Tambahkan kegiatan ekstrakurikuler yang diikuti siswa (Pramuka, PMR, Olahraga, Kesenian, dll.) beserta predikat capaiannya.
            </div>

            <div className="space-y-4">
              {classStudents.map((std, idx) => {
                const studentEkskuls = extracurriculars.filter((e) => e.studentId === std.id);

                return (
                  <div key={std.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {idx + 1}. {std.name} ({std.nisn})
                      </span>
                      <button
                        onClick={() => handleAddEkskul(std.id)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Ekskul
                      </button>
                    </div>

                    {studentEkskuls.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Belum ada kegiatan ekstrakurikuler tercatat.</p>
                    ) : (
                      <div className="space-y-2">
                        {studentEkskuls.map((ekskul) => (
                          <div key={ekskul.id} className="p-2.5 bg-white rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs">
                            <input
                              type="text"
                              value={ekskul.name}
                              onChange={(e) => handleUpdateEkskul(ekskul.id, 'name', e.target.value)}
                              placeholder="Nama Ekskul (misal: Pramuka)"
                              className="px-2 py-1 border border-slate-300 rounded font-semibold focus:outline-hidden"
                            />
                            <select
                              value={ekskul.predicate}
                              onChange={(e) => handleUpdateEkskul(ekskul.id, 'predicate', e.target.value)}
                              className="px-2 py-1 border border-slate-300 rounded font-bold text-emerald-700 focus:outline-hidden"
                            >
                              <option value="Sangat Baik">Sangat Baik</option>
                              <option value="Baik">Baik</option>
                              <option value="Cukup">Cukup</option>
                              <option value="Kurang">Kurang</option>
                            </select>
                            <input
                              type="text"
                              value={ekskul.description}
                              onChange={(e) => handleUpdateEkskul(ekskul.id, 'description', e.target.value)}
                              placeholder="Keterangan keaktifan..."
                              className="px-2 py-1 border border-slate-300 rounded text-[11px] focus:outline-hidden sm:col-span-1"
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleDeleteEkskul(ekskul.id)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                title="Hapus ekskul ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
