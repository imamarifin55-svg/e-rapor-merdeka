import { SystemBackupData } from '../types/erapor';

const STORAGE_KEY = 'erapor_merdeka_app_state_v1';
const BACKUP_HISTORY_KEY = 'erapor_backup_history_v1';

export interface BackupHistoryItem {
  id: string;
  timestamp: string;
  label: string;
  studentCount: number;
  gradeCount: number;
}

/**
 * Download snapshot backup database sebagai berkas JSON
 */
export function downloadBackupFile(data: SystemBackupData) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const schoolSanitized = data.schoolProfile.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);

  a.href = url;
  a.download = `Backup_eRapor_${schoolSanitized}_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Baca dan validasi berkas cadangan JSON yang diunggah
 */
export async function parseBackupFile(file: File): Promise<SystemBackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Basic schema verification
        if (!parsed || !parsed.schoolProfile || !Array.isArray(parsed.students)) {
          throw new Error('Format berkas cadangan tidak valid atau rusak.');
        }

        resolve(parsed as SystemBackupData);
      } catch (err: any) {
        reject(new Error(`Gagal memulihkan cadangan: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca berkas cadangan.'));
    reader.readAsText(file);
  });
}

/**
 * Simpan state lengkap ke LocalStorage
 */
export function saveToLocalState(data: SystemBackupData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Gagal menyimpan ke LocalStorage:', e);
  }
}

/**
 * Muat state dari LocalStorage jika ada
 */
export function loadFromLocalState(): SystemBackupData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Gagal membaca dari LocalStorage:', e);
    return null;
  }
}

/**
 * Catat riwayat snapshot cadangan
 */
export function recordBackupHistory(data: SystemBackupData, label: string) {
  try {
    const raw = localStorage.getItem(BACKUP_HISTORY_KEY);
    const history: BackupHistoryItem[] = raw ? JSON.parse(raw) : [];

    const newItem: BackupHistoryItem = {
      id: `bk-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      label,
      studentCount: data.students.length,
      gradeCount: data.grades.length,
    };

    history.unshift(newItem);
    // Simpan max 10 riwayat terakhir
    localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  } catch (e) {
    console.warn('Gagal mencatat riwayat backup:', e);
  }
}

/**
 * Ambil riwayat snapshot cadangan
 */
export function getBackupHistory(): BackupHistoryItem[] {
  try {
    const raw = localStorage.getItem(BACKUP_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
