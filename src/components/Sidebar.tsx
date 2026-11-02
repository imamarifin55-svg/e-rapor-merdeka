import React, { useState } from 'react';
import {
  SchoolProfile,
  AcademicYear,
  UserSession,
  ClassRoom,
} from '../types/erapor';
import {
  GraduationCap,
  Layers,
  FileSpreadsheet,
  Users,
  FileText,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Globe,
  School,
  Calendar,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  X,
  ShieldCheck,
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
  classes: ClassRoom[];
  totalStudentsCount: number;
  onOpenFirebaseModal: () => void;
  onOpenSettingsModal: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isFirebaseConnected: boolean;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  schoolProfile,
  academicYears,
  selectedAcademicYearId,
  onChangeAcademicYear,
  currentSession,
  onChangeUserSession,
  availableTeachers,
  classes,
  totalStudentsCount,
  onOpenFirebaseModal,
  onOpenSettingsModal,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  isFirebaseConnected,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [classSubmenuOpen, setClassSubmenuOpen] = useState(false);

  const activeYearObj = academicYears.find((ay) => ay.id === selectedAcademicYearId) || academicYears[0];

  const handleSelectTab = (tab: string) => {
    onSelectTab(tab);
    onCloseMobile();
  };

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
      assignedClass: t.homeroomClassId || 'cls-7-1',
    });
    setRoleDropdownOpen(false);
  };

  const handleSwitchToStudent = () => {
    onChangeUserSession({
      id: 'std-01',
      name: 'Aditya Pratama Putra (Siswa)',
      role: 'siswa',
      email: 'aditya.pratama@siswa.belajar.id',
      assignedClass: 'cls-7-1',
    });
    setRoleDropdownOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out no-print ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-72`}
      >
        
        {/* Brand / School Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-blue-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm text-white tracking-tight leading-tight truncate">
                    {schoolProfile.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/50">
                    NPSN {schoolProfile.npsn}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    12 Rombel
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academic Year Quick Selector (Expanded only) */}
        {!isCollapsed && (
          <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>T.A:</span>
            </div>
            <select
              value={selectedAcademicYearId}
              onChange={(e) => onChangeAcademicYear(e.target.value)}
              className="bg-transparent text-slate-200 font-bold text-xs focus:outline-hidden cursor-pointer text-right"
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id} className="bg-slate-900 text-white">
                  {ay.year} - {ay.semester}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation Menu Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* 1. Dashboard */}
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              currentTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
            title="Dasbor Penilaian"
          >
            <Layers className={`w-5 h-5 shrink-0 ${currentTab === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
            {!isCollapsed && <span>Dasbor Penilaian</span>}
          </button>

          {/* 2. Grades Management */}
          {(currentSession.role === 'admin' || currentSession.role === 'guru' || currentSession.role === 'wali_kelas') && (
            <button
              onClick={() => handleSelectTab('grades')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                currentTab === 'grades'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title="Kelola & Input Nilai TP"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileSpreadsheet className={`w-5 h-5 shrink-0 ${currentTab === 'grades' ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">Kelola &amp; Nilai TP</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] bg-slate-800 text-blue-300 font-bold px-1.5 py-0.5 rounded-full">
                  Merdeka
                </span>
              )}
            </button>
          )}

          {/* 3. Students & Mass Excel */}
          {(currentSession.role === 'admin' || currentSession.role === 'wali_kelas') && (
            <button
              onClick={() => handleSelectTab('students')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                currentTab === 'students'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title="Data Siswa & Impor Excel"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Users className={`w-5 h-5 shrink-0 ${currentTab === 'students' ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">Siswa &amp; Impor Excel</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded-full">
                  {totalStudentsCount}
                </span>
              )}
            </button>
          )}

          {/* 4. Rombongan Belajar (12 Kelas) Quick Accordion */}
          {!isCollapsed && (
            <div className="pt-2">
              <button
                onClick={() => setClassSubmenuOpen(!classSubmenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <School className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    12 Rombel Sekolah
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${classSubmenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {classSubmenuOpen && (
                <div className="ml-4 pl-3 border-l border-slate-800 py-1 space-y-1 text-[11px]">
                  <div className="text-[10px] font-bold text-slate-500 uppercase px-2 pt-1">Tingkat VII</div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {classes.filter((c) => c.gradeLevel === 7).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectTab('grades')}
                        className="text-left px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white font-mono"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  <div className="text-[10px] font-bold text-slate-500 uppercase px-2 pt-1.5">Tingkat VIII</div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {classes.filter((c) => c.gradeLevel === 8).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectTab('grades')}
                        className="text-left px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white font-mono"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  <div className="text-[10px] font-bold text-slate-500 uppercase px-2 pt-1.5">Tingkat IX</div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {classes.filter((c) => c.gradeLevel === 9).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectTab('grades')}
                        className="text-left px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white font-mono"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Print Reports & Ledger */}
          <button
            onClick={() => handleSelectTab('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              currentTab === 'reports'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
            title="Cetak Rapor & Leger PDF"
          >
            <FileText className={`w-5 h-5 shrink-0 ${currentTab === 'reports' ? 'text-white' : 'text-slate-400'}`} />
            {!isCollapsed && <span>Cetak Rapor PDF</span>}
          </button>

          {/* 6. Backup & Recovery */}
          {currentSession.role === 'admin' && (
            <button
              onClick={() => handleSelectTab('backup')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                currentTab === 'backup'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title="Cadangan & Pemulihan Data"
            >
              <Database className={`w-5 h-5 shrink-0 ${currentTab === 'backup' ? 'text-white' : 'text-slate-400'}`} />
              {!isCollapsed && <span>Backup &amp; Restore</span>}
            </button>
          )}

          {/* 7. Firebase & Vercel Configuration Special Tab */}
          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={onOpenFirebaseModal}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-linear-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-300 border border-amber-500/30 transition group"
              title="Konfigurasi Firebase Console & Vercel"
            >
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-amber-400 shrink-0 group-hover:scale-110 transition" />
                {!isCollapsed && (
                  <div className="text-left">
                    <p className="font-bold leading-none">Firebase &amp; Vercel</p>
                    <p className="text-[10px] text-amber-400/70 mt-0.5">Setup Database &amp; Online</p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>
          </div>

        </nav>

        {/* Bottom User Profile & Settings Area */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2">
          
          {/* Active User Session Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {currentSession.role === 'admin' ? 'AD' : currentSession.role === 'wali_kelas' ? 'WK' : currentSession.role === 'guru' ? 'GM' : 'SW'}
                </div>
                {!isCollapsed && (
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{currentSession.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {currentSession.role === 'admin' ? 'Administrator' : currentSession.role === 'wali_kelas' ? 'Wali Kelas' : currentSession.role === 'guru' ? 'Guru Mapel' : 'Siswa/Ortu'}
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>

            {/* Role Switcher Menu Popup */}
            {roleDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Ganti Hak Akses Pengguna
                </p>
                
                <div className="space-y-1 pt-1">
                  <button
                    onClick={handleSwitchToAdmin}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
                      currentSession.role === 'admin' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>Administrator / Kurikulum</span>
                  </button>
                  <button
                    onClick={() => handleSwitchToTeacher(availableTeachers[0])}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
                      currentSession.role === 'guru' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>Ahmad Fauzi (Guru Matematika)</span>
                  </button>
                  <button
                    onClick={() => handleSwitchToHomeroom(availableTeachers[0])}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
                      currentSession.role === 'wali_kelas' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>Wali Kelas (Kelas 7.1)</span>
                  </button>
                  <button
                    onClick={handleSwitchToStudent}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
                      currentSession.role === 'siswa' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>Aditya Pratama (Siswa/Ortu)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Footer Settings & Desktop Collapse Button */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
            <button
              onClick={onOpenSettingsModal}
              className="flex items-center gap-1.5 hover:text-white transition"
              title="Pengaturan Sekolah"
            >
              <Settings className="w-3.5 h-3.5" />
              {!isCollapsed && <span className="text-[11px]">Profil Sekolah</span>}
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </aside>
    </>
  );
};
