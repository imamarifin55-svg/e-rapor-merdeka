import React, { useState } from 'react';
import {
  SchoolProfile,
  Teacher,
  Student,
  ClassRoom,
  UserSession,
} from '../types/erapor';
import {
  GraduationCap,
  Lock,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  School,
  KeyRound,
  CheckCircle2,
  Calendar,
  Users,
  Search,
} from 'lucide-react';

interface Props {
  schoolProfile: SchoolProfile;
  teachers: Teacher[];
  classes: ClassRoom[];
  students: Student[];
  onLoginSuccess: (session: UserSession) => void;
  onOpenFirebaseModal: () => void;
}

export const LoginPage: React.FC<Props> = ({
  schoolProfile,
  teachers,
  classes,
  students,
  onLoginSuccess,
  onOpenFirebaseModal,
}) => {
  const [activeTab, setActiveTab] = useState<'guru' | 'siswa' | 'admin'>('guru');

  // Form states for Teacher
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || 'tch-1');
  const [teacherPassword, setTeacherPassword] = useState('123456');

  // Form states for Student
  const [studentNisn, setStudentNisn] = useState('');
  const [studentError, setStudentError] = useState<string | null>(null);

  // Form states for Admin
  const [adminUsername, setAdminUsername] = useState('admin.smpn1');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Handle Teacher Login
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = teachers.find((tch) => tch.id === selectedTeacherId) || teachers[0];
    const isHomeroom = !!t.homeroomClassId;
    const homeroomClass = classes.find((c) => c.id === t.homeroomClassId);

    onLoginSuccess({
      id: t.id,
      name: isHomeroom && homeroomClass ? `${t.name} (Wali Kelas ${homeroomClass.name})` : t.name,
      role: isHomeroom ? 'wali_kelas' : 'guru',
      nip: t.nip,
      email: t.email,
      assignedSubjectIds: t.assignedSubjectIds,
      assignedClass: t.homeroomClassId,
    });
  };

  // Handle Student Login via NISN
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);

    const found = students.find(
      (s) => s.nisn.trim() === studentNisn.trim() || s.nis.trim() === studentNisn.trim()
    );

    if (found) {
      onLoginSuccess({
        id: found.id,
        name: `${found.name} (Siswa)`,
        role: 'siswa',
        email: `${found.nisn}@siswa.belajar.id`,
        assignedClass: found.classId,
      });
    } else {
      setStudentError('NISN atau NIS tidak ditemukan. Silakan cek kembali atau hubungi wali kelas.');
    }
  };

  // Handle Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      id: 'usr-admin',
      name: 'Budi Santoso, S.Kom. (Admin)',
      role: 'admin',
      email: 'admin.erapor@sekolah.sch.id',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg ring-2 ring-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              {schoolProfile.name}
            </h1>
            <p className="text-[11px] text-blue-400 font-medium">
              Sistem e-Rapor Terintegrasi Kemendikbudristek (NPSN {schoolProfile.npsn})
            </p>
          </div>
        </div>

        <button
          onClick={onOpenFirebaseModal}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Status Cloud:</span>
          <span>Online Ready</span>
        </button>
      </header>

      {/* Center Form Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col lg:flex-row items-center justify-center gap-8 z-10">
        
        {/* Left Welcome Branding */}
        <div className="space-y-4 max-w-md text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold border border-blue-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Portal Masuk Resmi Sekolah
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Selamat Datang di Portal e-Rapor Merdeka
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Platform penilaian terpadu 12 rombongan belajar (Kelas 7.1 s.d. 9.4). Memudahkan guru menginput nilai formatif/sumatif, wali kelas mengelola absensi &amp; ekskul, dan siswa mengecek rapor digital.
          </p>

          <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              12 Rombel Aktif
            </span>
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Auto-Save Cloud
            </span>
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Standar Permendikbud
            </span>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Role Tab Selector */}
          <div className="grid grid-cols-3 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('guru')}
              className={`py-2 rounded-xl transition ${
                activeTab === 'guru'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Guru &amp; Wali
            </button>
            <button
              onClick={() => setActiveTab('siswa')}
              className={`py-2 rounded-xl transition ${
                activeTab === 'siswa'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Siswa / Ortu
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-2 rounded-xl transition ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          {/* TAB 1: GURU & WALI KELAS FORM */}
          {activeTab === 'guru' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Pilih Akun Guru / Wali Kelas:
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {teachers.map((t) => {
                    const homeroom = classes.find((c) => c.id === t.homeroomClassId);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} {homeroom ? `(Wali ${homeroom.name})` : '(Guru Mapel)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Kata Sandi (Password):
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-2"
              >
                <span>Masuk ke Dashboard Guru</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    // Quick simulated login with Google belajar.id
                    const t = teachers[0];
                    onLoginSuccess({
                      id: t.id,
                      name: t.name,
                      role: 'wali_kelas',
                      nip: t.nip,
                      email: 'imamarifin55@admin.smp.belajar.id',
                      assignedSubjectIds: t.assignedSubjectIds,
                      assignedClass: 'cls-7-1',
                    });
                  }}
                  className="text-slate-400 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 mx-auto transition"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-3.5 h-3.5" />
                  <span>Masuk dengan Akun belajar.id</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SISWA & ORTU FORM */}
          {activeTab === 'siswa' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Nomor Induk Siswa Nasional (NISN) / NIS:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={studentNisn}
                    onChange={(e) => setStudentNisn(e.target.value)}
                    placeholder="Contoh: 0089123401 atau 250701"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Tips: Coba gunakan contoh NISN <code>0089123401</code> (Aditya Pratama) untuk pratinjau instan.
                </p>
              </div>

              {studentError && (
                <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-[11px]">
                  {studentError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2"
              >
                <span>Cek e-Rapor Siswa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: ADMIN FORM */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Nama Pengguna (Username Admin):
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Kata Sandi Administrator:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-indigo-900/30 transition flex items-center justify-center gap-2"
              >
                <span>Masuk sebagai Administrator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Access Bar */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
              Akses Cepat Pengujian (1-Klik):
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => {
                  onLoginSuccess({
                    id: 'usr-admin',
                    name: 'Budi Santoso, S.Kom. (Admin)',
                    role: 'admin',
                    email: 'admin.erapor@sekolah.sch.id',
                  });
                }}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-left truncate transition"
              >
                🔐 Masuk: Admin
              </button>

              <button
                onClick={() => {
                  onLoginSuccess({
                    id: 'tch-1',
                    name: 'Ahmad Fauzi (Wali 7.1)',
                    role: 'wali_kelas',
                    email: 'ahmad.fauzi@smpn1.sch.id',
                    assignedClass: 'cls-7-1',
                    assignedSubjectIds: ['sub-mtk'],
                  });
                }}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-left truncate transition"
              >
                👨‍🏫 Masuk: Wali 7.1
              </button>

              <button
                onClick={() => {
                  onLoginSuccess({
                    id: 'tch-2',
                    name: 'Siti Rahmawati (Guru B.Indo)',
                    role: 'guru',
                    email: 'siti.rahma@smpn1.sch.id',
                    assignedSubjectIds: ['sub-indo'],
                    assignedClass: 'cls-7-2',
                  });
                }}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-left truncate transition"
              >
                📖 Masuk: Guru Mapel
              </button>

              <button
                onClick={() => {
                  onLoginSuccess({
                    id: 'std-01',
                    name: 'Aditya Pratama (Siswa)',
                    role: 'siswa',
                    email: 'aditya@siswa.belajar.id',
                    assignedClass: 'cls-7-1',
                  });
                }}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-left truncate transition"
              >
                🎒 Masuk: Siswa 7.1
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-3 text-center text-xs text-slate-500">
        &copy; 2026 {schoolProfile.name} • Didukung oleh Google Cloud Firebase &amp; Kurikulum Merdeka
      </footer>

    </div>
  );
};
