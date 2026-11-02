import React, { useState, useRef, useEffect } from 'react';
import { SystemBackupData } from '../types/erapor';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  FileCode,
  Calendar,
} from 'lucide-react';
import {
  downloadBackupFile,
  parseBackupFile,
  recordBackupHistory,
  getBackupHistory,
  BackupHistoryItem,
} from '../utils/backupHandler';

interface Props {
  currentBackupData: SystemBackupData;
  onRestoreBackup: (data: SystemBackupData) => void;
  onResetToDefault: () => void;
}

export const BackupRestoreView: React.FC<Props> = ({
  currentBackupData,
  onRestoreBackup,
  onResetToDefault,
}) => {
  const [historyList, setHistoryList] = useState<BackupHistoryItem[]>([]);
  const [restoreCandidate, setRestoreCandidate] = useState<SystemBackupData | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setHistoryList(getBackupHistory());
  }, []);

  const handleDownload = () => {
    downloadBackupFile(currentBackupData);
    recordBackupHistory(currentBackupData, 'Pencadangan Manual Operator');
    setHistoryList(getBackupHistory());
    setStatusNotice('Berkas cadangan JSON berhasil diunduh dan diarsipkan!');
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorNotice(null);
      const parsed = await parseBackupFile(file);
      setRestoreCandidate(parsed);
    } catch (err: any) {
      setErrorNotice(err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExecuteRestore = () => {
    if (!restoreCandidate) return;

    onRestoreBackup(restoreCandidate);
    recordBackupHistory(restoreCandidate, 'Pemulihan dari Berkas Cadangan');
    setHistoryList(getBackupHistory());
    setRestoreCandidate(null);
    setStatusNotice('Basis data e-Rapor berhasil dipulihkan secara menyeluruh!');
    setTimeout(() => setStatusNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Sistem Keamanan Data &amp; Disaster Recovery Terpadu
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Pencadangan (Backup) &amp; Pemulihan (Restore) Basis Data Sekolah
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Lindungi seluruh riwayat nilai, rekaman asesmen formatif-sumatif, biodata siswa, dan konfigurasi satuan pendidikan dari risiko kehilangan data. Unduh cadangan berkala atau pulihkan kapan saja.
        </p>
      </div>

      {statusNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{statusNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-4 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Main Grid: Backup & Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Download Full Backup */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Unduh Cadangan Lengkap (.JSON)</h3>
              <p className="text-xs text-slate-500">Mencakup seluruh profil sekolah, guru, siswa &amp; nilai</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Siswa Terdaftar:</span>
              <span className="font-bold text-slate-900">{currentBackupData.students.length} Siswa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Rekapitulasi Nilai Mapel:</span>
              <span className="font-bold text-slate-900">{currentBackupData.grades.length} Rekaman</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Rombel / Kelas Aktif:</span>
              <span className="font-bold text-slate-900">{currentBackupData.classes.length} Kelas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Capaian TP Tercatat:</span>
              <span className="font-bold text-slate-900">{currentBackupData.learningObjectives.length} Tujuan</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Berkas ini dapat disimpan di flashdisk, Google Drive sekolah, atau komputer operator untuk keperluan audit dan perlindungan data semesteran.
          </p>

          <button
            onClick={handleDownload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            Unduh Berkas Cadangan Sekarang
          </button>
        </div>

        {/* Card 2: Restore from Backup */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pulihkan Basis Data (Restore)</h3>
              <p className="text-xs text-slate-500">Kembalikan kondisi e-Rapor dari berkas cadangan JSON</p>
            </div>
          </div>

          <div className="p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-center space-y-2 transition cursor-pointer bg-slate-50/50"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileCode className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-semibold text-slate-700">
              Klik untuk memilih berkas cadangan (.json)
            </div>
            <p className="text-[10px] text-slate-400">
              Pastikan berkas berasal dari ekspor e-Rapor resmi
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {restoreCandidate && (
            <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-xs space-y-2 text-amber-900 animate-in fade-in">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Konfirmasi Pemulihan Data
              </p>
              <p className="text-[11px] leading-relaxed">
                Berkas cadangan terdeteksi: <strong>{restoreCandidate.schoolProfile?.name}</strong> dengan {restoreCandidate.students?.length} siswa dan {restoreCandidate.grades?.length} nilai.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setRestoreCandidate(null)}
                  className="px-3 py-1 bg-white border border-amber-300 rounded text-amber-800 text-[11px]"
                >
                  Batal
                </button>
                <button
                  onClick={handleExecuteRestore}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px]"
                >
                  Lanjutkan Restore
                </button>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-500">
            Pemulihan data akan mengganti data aktif di peramban dan sinkronisasi ke cloud sesuai isi snapshot.
          </p>
        </div>

      </div>

      {/* Snapshot History & Danger Zone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* History List (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Riwayat Snapshot Pencadangan Sistem
            </h3>
            <span className="text-[10px] text-slate-400">Tersimpan di Penyimpanan Aman</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {historyList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Belum ada catatan snapshot riwayat cadangan.
              </p>
            ) : (
              historyList.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{item.label}</span>
                    <p className="text-[10px] text-slate-400">{item.timestamp}</p>
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-600">
                    <div>{item.studentCount} Siswa</div>
                    <div className="text-slate-400">{item.gradeCount} Rekaman Nilai</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Danger Zone: Reset to Default (1 col) */}
        <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-bold text-xs uppercase">Zona Pengaturan Khusus</h3>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Jika ingin memulai dari awal dengan data contoh resmi Kemendikbud lengkap (SMP Negeri 1 Merdeka Nusantara), Anda dapat mereset data.
          </p>
          <button
            onClick={() => {
              if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke data contoh bawaan?')) {
                onResetToDefault();
                setStatusNotice('Sistem berhasil direset ke data contoh resmi sekolah!');
                setTimeout(() => setStatusNotice(null), 3500);
              }
            }}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset ke Data Contoh Sekolah
          </button>
        </div>

      </div>

    </div>
  );
};
