import React, { useState } from 'react';
import {
  SchoolProfile,
  AcademicYear,
  UserRole,
  UserSession,
} from '../types/erapor';
import {
  GraduationCap,
  Layers,
  FileSpreadsheet,
  FileText,
  Database,
  Settings,
  Users,
  ChevronDown,
  CloudCheck,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  schoolProfile: SchoolProfile;
  academicYears: AcademicYear[];
  selectedAcademicYearId: string;
  onChangeAcademicYear: (ayId: string) => void;
  currentSession: UserSession;
  onChangeUserSession: (session: UserSession) => void;
  availableTeachers: Array<{ id: string; name: string; role: string; assignedSubjectIds: string[]; homeroomClassId?: string }>;
  onOpenCloudModal: () => void;
  onOpenSettingsModal: () => void;
  cloudMode: 'hybrid' | 'firebase' | 'cloudsql';
}

export const Navbar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  schoolProfile,
  academicYears,
  selectedAcademicYearId,
  onChangeAcademicYear,
  currentSession,
  onChangeUserSession,
  availableTeachers,
  onOpenCloudModal,
  onOpenSettingsModal,
  cloudMode,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const activeYearObj = academicYears.find((ay) => ay.id === selectedAcademicYearId) || academicYears[0];

  const handleSwitchToAdmin = () => {
    onChangeUserSession({
      id: 'usr-admin',
      name: 'Budi Santoso, S.Kom. (Admin)',
      role: 'admin',
      email: 'admin.erapor@sekolah.sch.id',
    });
    setRoleDropdownOpen(false);
  };

  const handleSwitchToTeacher = (t: any) => {
    onChangeUserSession({
      id: t.id,
      name: t.name,
      role: 'guru',
      nip: t.nip,
      email: t.email,
      assignedSubjectIds: t.assignedSubjectIds,
      assignedClass: t.homeroomClassId,
    });
    setRoleDropdownOpen(false);
  };

  const handleSwitchToHomeroom = (t: any) => {
    onChangeUserSession({
      id: t.id,
      name: `${t.name} (Wali Kelas)`,
      role: 'wali_kelas',
      nip: t.nip,
      email: t.email,
      assignedSubjectIds: t.assignedSubjectIds,
      assignedClass: t.homeroomClassId || 'cls-7a',
    });
    setRoleDropdownOpen(false);
  };

  const handleSwitchToStudent = () => {
    onChangeUserSession({
      id: 'std-01',
      name: 'Aditya Pratama Putra (Siswa)',
      role: 'siswa',
      email: 'aditya.pratama@siswa.belajar.id',
      assignedClass: 'cls-7a',
    });
    setRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs no-print">
      {/* Top Notification Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-200">
            e-Rapor Merdeka Terintegrasi Kemendikbudristek
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Standar Permendikbudristek No. 56/M/2022 &amp; Panduan Asesmen
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCloudModal}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 transition text-[11px] font-medium"
          >
            <Database className="w-3 h-3 text-sky-400" />
            <span>Basis Data:</span>
            <span className="text-white font-semibold capitalize">
              {cloudMode === 'firebase' ? 'Firebase Firestore' : cloudMode === 'cloudsql' ? 'Cloud SQL' : 'Hybrid Cloud'}
            </span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </button>

          <div className="hidden md:flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Auto-Save Aktif</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* School Identity */}
        <div className="flex items-center gap-3">
          {/* Logo Tut Wuri / School Emblem */}
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-none">
                {schoolProfile.name}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] border border-blue-200">
                NPSN {schoolProfile.npsn}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {schoolProfile.curriculum} • {schoolProfile.city}, {schoolProfile.province}
            </p>
          </div>
        </div>

        {/* Right Tools: Year Selector & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Semester Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-600">T.A:</span>
            <select
              value={selectedAcademicYearId}
              onChange={(e) => onChangeAcademicYear(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.year} - {ay.semester}
                </option>
              ))}
            </select>
          </div>

          {/* User Session Switcher (Multi-role support) */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-800 shadow-2xs transition"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                {currentSession.role === 'admin' ? 'AD' : currentSession.role === 'wali_kelas' ? 'WK' : currentSession.role === 'guru' ? 'GM' : 'SW'}
              </div>
              <div className="text-left hidden md:block">
                <p className="font-bold text-slate-900 leading-none truncate max-w-[130px]">{currentSession.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {currentSession.role === 'admin' ? 'Administrator' : currentSession.role === 'wali_kelas' ? 'Wali Kelas' : currentSession.role === 'guru' ? 'Guru Mapel' : 'Siswa/Ortu'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-800">Ganti Peran Pengguna (Multi-User)</p>
                  <p className="text-[11px] text-slate-500">Uji tampilan dari berbagai hak akses guru &amp; siswa</p>
                </div>

                <div className="p-1 space-y-1">
                  <button
                    onClick={handleSwitchToAdmin}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition ${
                      currentSession.role === 'admin' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">AD</div>
                    <div>
                      <p className="text-xs">Administrator / Kurikulum</p>
                      <p className="text-[10px] text-slate-400">Akses penuh sistem, kelola sekolah &amp; backup</p>
                    </div>
                  </button>

                  {availableTeachers.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSwitchToTeacher(t)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition ${
                        currentSession.id === t.id && currentSession.role === 'guru' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">GM</div>
                      <div className="truncate">
                        <p className="text-xs truncate">{t.name}</p>
                        <p className="text-[10px] text-slate-400">Guru Mata Pelajaran</p>
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => handleSwitchToHomeroom(availableTeachers[0])}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition ${
                      currentSession.role === 'wali_kelas' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">WK</div>
                    <div>
                      <p className="text-xs">Wali Kelas (Kelas VII-A)</p>
                      <p className="text-[10px] text-slate-400">Kelola absensi, catatan &amp; cetak rapor</p>
                    </div>
                  </button>

                  <button
                    onClick={handleSwitchToStudent}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition ${
                      currentSession.role === 'siswa' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">SW</div>
                    <div>
                      <p className="text-xs">Aditya Pratama Putra (Siswa/Ortu)</p>
                      <p className="text-[10px] text-slate-400">Portal e-Rapor Siswa Mandiri</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* School Settings Button */}
          {currentSession.role === 'admin' && (
            <button
              onClick={onOpenSettingsModal}
              title="Pengaturan Satuan Pendidikan"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-50/90 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1 py-1 scrollbar-none">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              currentTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            Dasbor Penilaian
          </button>

          {(currentSession.role === 'admin' || currentSession.role === 'guru' || currentSession.role === 'wali_kelas') && (
            <button
              onClick={() => onSelectTab('grades')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                currentTab === 'grades'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Kelola &amp; Input Nilai TP
            </button>
          )}

          {(currentSession.role === 'admin' || currentSession.role === 'wali_kelas') && (
            <button
              onClick={() => onSelectTab('students')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                currentTab === 'students'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              Data Siswa &amp; Impor Excel
            </button>
          )}

          <button
            onClick={() => onSelectTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              currentTab === 'reports'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            Cetak Rapor &amp; Leger PDF
          </button>

          {currentSession.role === 'admin' && (
            <button
              onClick={() => onSelectTab('backup')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                currentTab === 'backup'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Database className="w-4 h-4" />
              Cadangan &amp; Pemulihan
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
