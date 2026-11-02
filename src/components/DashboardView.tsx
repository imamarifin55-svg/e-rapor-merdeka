import React from 'react';
import {
  Student,
  Subject,
  GradeRecord,
  ClassRoom,
  Teacher,
  UserSession,
} from '../types/erapor';
import {
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface Props {
  currentSession: UserSession;
  students: Student[];
  subjects: Subject[];
  classes: ClassRoom[];
  grades: GradeRecord[];
  teachers: Teacher[];
  onNavigate: (tab: string) => void;
  onOpenCloudModal: () => void;
  onDownloadBackup: () => void;
}

export const DashboardView: React.FC<Props> = ({
  currentSession,
  students,
  subjects,
  classes,
  grades,
  teachers,
  onNavigate,
  onOpenCloudModal,
  onDownloadBackup,
}) => {
  const maleCount = students.filter((s) => s.gender === 'L').length;
  const femaleCount = students.filter((s) => s.gender === 'P').length;

  // Calculate completeness
  // Expected grade records = students in class * subjects
  const totalPossibleRecords = students.length * subjects.length;
  const completedGradesCount = grades.filter((g) => g.nilaiAkhir > 0).length;
  const completenessPercent = totalPossibleRecords > 0
    ? Math.min(100, Math.round((completedGradesCount / totalPossibleRecords) * 100))
    : 0;

  // Subject average scores
  const subjectStats = subjects.map((subj) => {
    const subjGrades = grades.filter((g) => g.subjectId === subj.id && g.nilaiAkhir > 0);
    const avg = subjGrades.length > 0
      ? Math.round(subjGrades.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / subjGrades.length)
      : 0;
    return {
      id: subj.id,
      name: subj.name,
      code: subj.code,
      kktp: subj.kktp,
      avgScore: avg,
      count: subjGrades.length,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <TrendingUp className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-sky-100 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Portal Penilaian &amp; Asesmen Kurikulum Merdeka
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentSession.name}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Sistem e-Rapor siap mengelola penilaian formatif, sumatif lingkup materi, narasi capaian kompetensi otomatis, dan sinkronisasi massal Excel secara efisien dan akurat.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('grades')}
              className="bg-white text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Mulai Input Nilai Mapel
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="bg-blue-800/80 hover:bg-blue-800 text-white border border-blue-400/40 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4 text-sky-300" />
              Cetak Rapor Siswa (PDF)
            </button>
            <button
              onClick={onOpenCloudModal}
              className="bg-amber-500/90 hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              <Database className="w-4 h-4" />
              Opsi Cloud vs Firebase
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Siswa Terdaftar</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{students.length}</span>
            <span className="text-xs text-slate-500">Siswa Aktif</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-blue-600 font-semibold">{maleCount} Laki-laki</span>
            <span>•</span>
            <span className="text-rose-500 font-semibold">{femaleCount} Perempuan</span>
          </div>
        </div>

        {/* Total Subjects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Mata Pelajaran &amp; KKTP</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{subjects.length}</span>
            <span className="text-xs text-slate-500">Mapel Terstandar</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-100">
            <span>Rata-rata KKTP:</span>
            <span className="font-bold text-slate-800">
              {Math.round(subjects.reduce((a, b) => a + b.kktp, 0) / (subjects.length || 1))}
            </span>
            <span className="text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Grade Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Progres Nilai Masuk</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{completenessPercent}%</span>
            <span className="text-xs text-slate-500">Tercatat</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completenessPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Report Card Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Status Pencetakan Rapor</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-800">Siap Cetak PDF</span>
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1.5 pt-1 border-t border-slate-100 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Format Resmi A4 Kemendikbud</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Subject Performance & Teacher Input Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subject Averages (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Capaian Rata-Rata Mata Pelajaran</h3>
              <p className="text-xs text-slate-500">Perbandingan rata-rata nilai akhir siswa dengan nilai KKTP</p>
            </div>
            <button
              onClick={() => onNavigate('grades')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              Lihat Detail
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {subjectStats.map((item) => {
              const isAbove = item.avgScore >= item.kktp;
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[250px]">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">KKTP: {item.kktp}</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        item.avgScore === 0
                          ? 'bg-slate-100 text-slate-500'
                          : isAbove
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {item.avgScore > 0 ? `Rata-rata: ${item.avgScore}` : 'Belum Ada Nilai'}
                      </span>
                    </div>
                  </div>
                  {/* Gauge Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.avgScore >= 85
                          ? 'bg-emerald-500'
                          : item.avgScore >= item.kktp
                          ? 'bg-blue-600'
                          : item.avgScore > 0
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.min(100, item.avgScore || 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & System Health (1 col) */}
        <div className="space-y-4">
          
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Aksi Cepat Sekolah</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('students')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Sinkronisasi Siswa Excel</p>
                    <p className="text-[11px] text-slate-500">Unggah berkas .xlsx massal</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </button>

              <button
                onClick={() => onNavigate('grades')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Input Nilai Guru Mapel</p>
                    <p className="text-[11px] text-slate-500">Kalkulasi &amp; narasi otomatis</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Cetak Rapor &amp; Leger</p>
                    <p className="text-[11px] text-slate-500">Standar resmi Kemendikbud PDF</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </button>

              <button
                onClick={onDownloadBackup}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Unduh Cadangan Database</p>
                    <p className="text-[11px] text-slate-500">Snapshot data aman format .json</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
              </button>
            </div>
          </div>

          {/* Cloud Info Mini Card */}
          <div className="bg-linear-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Kesiapan Basis Data Cloud
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                Online Ready
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Arsitektur aplikasi ini mendukung sinkronisasi realtime melalui <strong>Firebase Firestore</strong> atau relasional <strong>Cloud SQL (PostgreSQL)</strong> yang aman dan terenkripsi.
            </p>
            <button
              onClick={onOpenCloudModal}
              className="text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold pt-1 block"
            >
              Lihat pertimbangan &amp; perbandingan mendalam &rarr;
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
