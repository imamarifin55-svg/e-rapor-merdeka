/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  SchoolProfile,
  AcademicYear,
  Teacher,
  Student,
  ClassRoom,
  Subject,
  LearningObjective,
  GradeRecord,
  AttendanceRecord,
  ExtracurricularRecord,
  StudentHomeroomNote,
  SystemBackupData,
  UserSession,
} from './types/erapor';
import {
  INITIAL_SCHOOL_PROFILE,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_LEARNING_OBJECTIVES,
  INITIAL_GRADES,
  INITIAL_ATTENDANCE,
  INITIAL_EXTRACURRICULARS,
  INITIAL_HOMEROOM_NOTES,
  getFullInitialBackup,
} from './data/initialData';
import {
  saveToLocalState,
  loadFromLocalState,
  downloadBackupFile,
} from './utils/backupHandler';
import { getActiveFirebaseConfig } from './services/firebase';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { GradeManagementView } from './components/GradeManagementView';
import { StudentSyncView } from './components/StudentSyncView';
import { ReportCardPrintView } from './components/ReportCardPrintView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { FirebaseConsoleSetupModal } from './components/FirebaseConsoleSetupModal';
import { CloudDatabaseComparisonModal } from './components/CloudDatabaseComparisonModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import {
  Menu,
  GraduationCap,
  Flame,
  Globe,
  Settings,
  ShieldCheck,
  Calendar,
  Sparkles,
  Printer,
  ChevronRight,
  Database,
  School,
} from 'lucide-react';

export default function App() {
  // Load initial state from LocalStorage or use realistic default 12-rombel dataset
  const savedState = loadFromLocalState();

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(
    savedState?.schoolProfile || INITIAL_SCHOOL_PROFILE
  );
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(
    savedState?.academicYears || INITIAL_ACADEMIC_YEARS
  );
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(
    academicYears.find((ay) => ay.isActive)?.id || academicYears[0]?.id || 'ay-2025-1'
  );
  const [teachers, setTeachers] = useState<Teacher[]>(
    savedState?.teachers || INITIAL_TEACHERS
  );
  // Ensure we use the 12 rombel (7.1-7.4, 8.1-8.4, 9.1-9.4)
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    if (savedState?.classes && savedState.classes.length >= 12) {
      return savedState.classes;
    }
    return INITIAL_CLASSES;
  });
  const [subjects, setSubjects] = useState<Subject[]>(
    savedState?.subjects || INITIAL_SUBJECTS
  );
  const [students, setStudents] = useState<Student[]>(
    savedState?.students || INITIAL_STUDENTS
  );
  const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>(
    savedState?.learningObjectives || INITIAL_LEARNING_OBJECTIVES
  );
  const [grades, setGrades] = useState<GradeRecord[]>(
    savedState?.grades || INITIAL_GRADES
  );
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(
    savedState?.attendances || INITIAL_ATTENDANCE
  );
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularRecord[]>(
    savedState?.extracurriculars || INITIAL_EXTRACURRICULARS
  );
  const [homeroomNotes, setHomeroomNotes] = useState<StudentHomeroomNote[]>(
    savedState?.homeroomNotes || INITIAL_HOMEROOM_NOTES
  );

  // Layout & UI State (Sidebar Layout)
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Modal Dialogs State
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);
  const [isCloudCompareOpen, setIsCloudCompareOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [hasFirebaseConfig, setHasFirebaseConfig] = useState<boolean>(!!getActiveFirebaseConfig());

  // Active Multi-User Session
  const [currentSession, setCurrentSession] = useState<UserSession>({
    id: 'usr-admin',
    name: 'Budi Santoso, S.Kom. (Admin)',
    role: 'admin',
    email: 'admin.erapor@sekolah.sch.id',
  });

  // Bundle snapshot
  const getCurrentBackupSnapshot = (): SystemBackupData => ({
    version: '1.2.0',
    appName: 'e-Rapor Merdeka Terintegrasi Kemendikbud',
    timestamp: new Date().toISOString(),
    schoolProfile,
    academicYears,
    classes,
    subjects,
    teachers,
    students,
    learningObjectives,
    grades,
    attendances,
    extracurriculars,
    homeroomNotes,
  });

  // Auto-save changes locally
  useEffect(() => {
    saveToLocalState(getCurrentBackupSnapshot());
  }, [
    schoolProfile,
    academicYears,
    classes,
    subjects,
    teachers,
    students,
    learningObjectives,
    grades,
    attendances,
    extracurriculars,
    homeroomNotes,
  ]);

  const handleRestoreBackup = (restored: SystemBackupData) => {
    if (restored.schoolProfile) setSchoolProfile(restored.schoolProfile);
    if (restored.academicYears) setAcademicYears(restored.academicYears);
    if (restored.classes) setClasses(restored.classes);
    if (restored.subjects) setSubjects(restored.subjects);
    if (restored.teachers) setTeachers(restored.teachers);
    if (restored.students) setStudents(restored.students);
    if (restored.learningObjectives) setLearningObjectives(restored.learningObjectives);
    if (restored.grades) setGrades(restored.grades);
    if (restored.attendances) setAttendances(restored.attendances);
    if (restored.extracurriculars) setExtracurriculars(restored.extracurriculars);
    if (restored.homeroomNotes) setHomeroomNotes(restored.homeroomNotes);
  };

  const handleResetToDefault = () => {
    const def = getFullInitialBackup();
    handleRestoreBackup(def);
  };

  const tabLabels: Record<string, string> = {
    dashboard: 'Dasbor Penilaian & Statistik KKTP',
    grades: 'Kelola Nilai & Tujuan Pembelajaran (TP)',
    students: 'Data Siswa & Sinkronisasi Massal Excel',
    reports: 'Cetak Rapor Resmi & Leger Nilai PDF',
    backup: 'Pusat Cadangan & Pemulihan Basis Data',
  };

  // Student specific data for Portal Siswa
  const currentStudentObj = students.find((s) => s.id === currentSession.id) || students[0];
  const currentStudentGrades = grades.filter((g) => g.studentId === currentStudentObj?.id);

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Sleek Responsive Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        schoolProfile={schoolProfile}
        academicYears={academicYears}
        selectedAcademicYearId={selectedAcademicYearId}
        onChangeAcademicYear={setSelectedAcademicYearId}
        currentSession={currentSession}
        onChangeUserSession={(sess) => {
          setCurrentSession(sess);
          if (sess.role === 'siswa') {
            setCurrentTab('dashboard');
          }
        }}
        availableTeachers={teachers}
        classes={classes}
        totalStudentsCount={students.length}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isFirebaseConnected={hasFirebaseConfig}
      />

      {/* 2. Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                title="Buka Menu Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                    {tabLabels[currentTab] || 'e-Rapor Merdeka'}
                  </h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                    12 Rombel
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  {schoolProfile.name} • Kurikulum Merdeka (Fase D SMP)
                </p>
              </div>
            </div>

            {/* Right: Cloud/Firebase Status & Quick Links */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Firebase / Vercel Indicator Button */}
              <button
                onClick={() => setIsFirebaseModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition text-xs font-bold shadow-2xs"
                title="Buka Pengaturan Firebase Console & Panduan Vercel"
              >
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Firebase:</span>
                <span className="font-mono text-[11px]">
                  {hasFirebaseConfig ? 'Terkonfigurasi' : 'Hubungkan Console'}
                </span>
              </button>

              {/* Vercel Ready Indicator */}
              <button
                onClick={() => setIsFirebaseModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                title="Aplikasi siap deploy ke Vercel"
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Vercel Ready</span>
              </button>

              {/* Settings Shortcut */}
              {currentSession.role === 'admin' && (
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                  title="Profil & Kop Satuan Pendidikan"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

            </div>

          </div>
        </header>

        {/* 3. Main Body Content View */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Siswa / Orang Tua Mode */}
          {currentSession.role === 'siswa' && currentTab === 'dashboard' ? (
            <div className="space-y-6">
              
              <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-sky-700 text-white rounded-2xl p-6 shadow-md space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-blue-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Portal e-Rapor Siswa Mandiri
                </div>
                <h2 className="text-2xl font-black">
                  Halo, {currentStudentObj?.name}!
                </h2>
                <p className="text-xs text-blue-100 max-w-2xl">
                  NISN: {currentStudentObj?.nisn} | Kelas: {currentStudentObj?.className} | Tahun Ajaran 2025/2026 Semester Ganjil
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setCurrentTab('reports')}
                    className="bg-white text-blue-800 hover:bg-blue-50 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    Lihat &amp; Unduh e-Rapor Resmi (PDF)
                  </button>
                </div>
              </div>

              {/* Student Subject Cards */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-sm">Rangkuman Nilai &amp; Capaian Kompetensi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map((sub) => {
                    const gr = currentStudentGrades.find((g) => g.subjectId === sub.id);
                    const na = gr?.nilaiAkhir ?? '-';
                    return (
                      <div key={sub.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{sub.name}</span>
                          <span className="font-extrabold font-mono text-sm px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {na}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2 space-y-1">
                          <p><strong className="text-emerald-700">Capaian:</strong> {gr?.highestCompetencyNarrative || 'Kompetensi tercapai dengan baik.'}</p>
                          {gr?.lowestCompetencyNarrative && (
                            <p><strong className="text-slate-500">Saran:</strong> {gr?.lowestCompetencyNarrative}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  currentSession={currentSession}
                  students={students}
                  subjects={subjects}
                  classes={classes}
                  grades={grades}
                  teachers={teachers}
                  onNavigate={setCurrentTab}
                  onOpenCloudModal={() => setIsFirebaseModalOpen(true)}
                  onDownloadBackup={() => downloadBackupFile(getCurrentBackupSnapshot())}
                />
              )}

              {currentTab === 'grades' && (
                <GradeManagementView
                  currentSession={currentSession}
                  classes={classes}
                  subjects={subjects}
                  students={students}
                  learningObjectives={learningObjectives}
                  grades={grades}
                  onUpdateGrades={setGrades}
                  onAddLearningObjective={(newTp) =>
                    setLearningObjectives([...learningObjectives, newTp])
                  }
                  onDeleteLearningObjective={(tpId) =>
                    setLearningObjectives(learningObjectives.filter((tp) => tp.id !== tpId))
                  }
                />
              )}

              {currentTab === 'students' && (
                <StudentSyncView
                  students={students}
                  classes={classes}
                  onAddStudent={(newStudent) => setStudents([...students, newStudent])}
                  onUpdateStudent={(updated) =>
                    setStudents(students.map((s) => (s.id === updated.id ? updated : s)))
                  }
                  onDeleteStudent={(stdId) => setStudents(students.filter((s) => s.id !== stdId))}
                  onBatchSyncStudents={(incoming) => {
                    const working = [...students];
                    incoming.forEach((item) => {
                      const idx = working.findIndex((s) => s.nisn === item.nisn);
                      if (idx >= 0) {
                        working[idx] = item;
                      } else {
                        working.push(item);
                      }
                    });
                    setStudents(working);
                  }}
                />
              )}

              {currentTab === 'reports' && (
                <ReportCardPrintView
                  schoolProfile={schoolProfile}
                  academicYears={academicYears}
                  selectedAcademicYearId={selectedAcademicYearId}
                  classes={classes}
                  students={students}
                  subjects={subjects}
                  grades={grades}
                  attendances={attendances}
                  extracurriculars={extracurriculars}
                  homeroomNotes={homeroomNotes}
                />
              )}

              {currentTab === 'backup' && (
                <BackupRestoreView
                  currentBackupData={getCurrentBackupSnapshot()}
                  onRestoreBackup={handleRestoreBackup}
                  onResetToDefault={handleResetToDefault}
                />
              )}
            </>
          )}

        </main>

        {/* Footer */}
        <footer className="no-print border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              &copy; 2026 {schoolProfile.name} • 12 Rombel (Kelas 7.1-7.4, 8.1-8.4, 9.1-9.4)
            </p>
            <div className="flex items-center gap-3 text-[11px]">
              <button
                onClick={() => setIsFirebaseModalOpen(true)}
                className="text-amber-600 hover:underline font-semibold flex items-center gap-1"
              >
                <Flame className="w-3.5 h-3.5" />
                Firebase Console &amp; Vercel
              </button>
              <span>•</span>
              <span className="text-emerald-600 font-medium">Status: Terproteksi &amp; Online</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Firebase Console & Vercel Setup Modal */}
      <FirebaseConsoleSetupModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onConfigUpdated={() => setHasFirebaseConfig(!!getActiveFirebaseConfig())}
      />

      {/* Cloud SQL vs Firebase Comparison Modal */}
      <CloudDatabaseComparisonModal
        isOpen={isCloudCompareOpen}
        onClose={() => setIsCloudCompareOpen(false)}
        currentMode="firebase"
        onSelectMode={() => setIsCloudCompareOpen(false)}
      />

      {/* School Settings Modal */}
      <SchoolSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={schoolProfile}
        onSave={(updated) => setSchoolProfile(updated)}
      />

    </div>
  );
}
