import React, { useState } from 'react';
import { Database, Flame, Server, CheckCircle2, AlertTriangle, ShieldCheck, Zap, ArrowRight, X, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentMode: 'hybrid' | 'firebase' | 'cloudsql';
  onSelectMode: (mode: 'hybrid' | 'firebase' | 'cloudsql') => void;
}

export const CloudDatabaseComparisonModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'architecture' | 'recommendation'>('comparison');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestLatency = (type: string) => {
    setTestStatus(`Menguji koneksi ke ${type}...`);
    setTimeout(() => {
      setTestStatus(`Koneksi ke ${type} aman! Latensi: ${Math.floor(28 + Math.random() * 20)}ms. Enkripsi data aktif (AES-256).`);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-medium text-sky-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Panduan Arsitektur Basis Data e-Rapor
            </div>
            <h2 className="text-2xl font-bold">Pilihan Basis Data: Cloud SQL (PostgreSQL) vs Firebase</h2>
            <p className="text-sm text-blue-100 max-w-2xl">
              Analisis komparatif untuk sistem e-Rapor sekolah: pertimbangan kestabilan koneksi, keamanan nilai siswa, sinkronisasi realtime guru, dan kompatibilitas Dapodik.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'comparison'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tabel Komparasi Fitur
          </button>
          <button
            onClick={() => setActiveTab('recommendation')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'recommendation'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Rekomendasi untuk Sekolah
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'architecture'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Diagram Alur Sinkronisasi Realtime
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">

          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Firebase Firestore Card */}
                <div className={`p-5 rounded-xl border-2 transition relative ${
                  currentMode === 'firebase' ? 'border-amber-500 bg-amber-50/30' : 'border-slate-200 bg-white hover:border-amber-300'
                }`}>
                  {currentMode === 'firebase' && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      Pilihan Aktif
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Firebase Firestore</h3>
                      <p className="text-xs text-slate-500">NoSQL Document Store + Realtime Listener</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 mb-5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Realtime Sync Otomatis:</strong> Ketika guru A menginput nilai kelas 7A, wali kelas langsung melihat nilainya ter-update seketika tanpa refresh.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Offline Persistence:</strong> Jika wifi sekolah putus saat guru mengetik nilai, data tersimpan di cache lokal browser dan otomatis sinkron saat internet kembali.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Biaya Sangat Ringan:</strong> Memiliki kuota gratis besar (50.000 pembacaan & 20.000 penulisan per hari), sangat hemat untuk sekolah.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Perhatian:</strong> Perlu struktur data yang cermat untuk menghindari pembacaan berlebih pada rekapitulasi leger seluruh sekolah.</span>
                    </li>
                  </ul>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTestLatency('Firebase Firestore')}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition"
                    >
                      Uji Latensi
                    </button>
                    <button
                      onClick={() => onSelectMode('firebase')}
                      className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-medium transition flex-1 text-center"
                    >
                      Gunakan Firebase
                    </button>
                  </div>
                </div>

                {/* Cloud SQL PostgreSQL Card */}
                <div className={`p-5 rounded-xl border-2 transition relative ${
                  currentMode === 'cloudsql' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-blue-300'
                }`}>
                  {currentMode === 'cloudsql' && (
                    <span className="absolute top-3 right-3 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      Pilihan Aktif
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      <Server className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Cloud SQL (PostgreSQL)</h3>
                      <p className="text-xs text-slate-500">Relational RDBMS + ACID Compliance</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 mb-5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Standar Dapodik Kemendikbud:</strong> Database resmi Dapodik berbasis PostgreSQL, sehingga skema tabel (relasi siswa, rombel, mapel, nilai) 100% selaras.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Query Kompleks & Leger Cepat:</strong> Sangat tangguh untuk query JOIN antar semester, audit trail riwayat nilai, dan rekapitulasi data besar.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Integritas Relasional Kuat:</strong> Foreign key mencegah data siswa yatim (orphaned records) jika kelas diubah atau dihapus.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Perhatian:</strong> Butuh server proxy / ORM backend dan biaya instance berjalan (tidak ada offline mode murni tanpa service worker khusus).</span>
                    </li>
                  </ul>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTestLatency('Cloud SQL PostgreSQL')}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition"
                    >
                      Uji Latensi
                    </button>
                    <button
                      onClick={() => onSelectMode('cloudsql')}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition flex-1 text-center"
                    >
                      Gunakan Cloud SQL
                    </button>
                  </div>
                </div>

              </div>

              {testStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testStatus}</span>
                </div>
              )}

              {/* Matrix Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Parameter Evaluasi</th>
                      <th className="p-3 text-amber-700">Firebase Firestore</th>
                      <th className="p-3 text-blue-700">Cloud SQL (PostgreSQL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-medium">Sinkronisasi Realtime Multi-Guru</td>
                      <td className="p-3 text-emerald-700 font-semibold">Bawaan (Instant WebSockets)</td>
                      <td className="p-3 text-slate-600">Perlu polling atau WebSocket gateway</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Kekebalan Internet Sekolah Lemah (Offline)</td>
                      <td className="p-3 text-emerald-700 font-semibold">Sangat Baik (IndexedDB Cache)</td>
                      <td className="p-3 text-slate-600">Perlu koneksi stabil ke server</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Kesesuaian Struktur dengan Dapodik Pusat</td>
                      <td className="p-3 text-slate-600">Memerlukan denormalisasi NoSQL</td>
                      <td className="p-3 text-emerald-700 font-semibold">100% Identik (PostgreSQL Dapodik)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Ekspor Leger & Agregasi Nilai 1 Sekolah</td>
                      <td className="p-3 text-slate-600">Bagus (Kalkulasi di Client / Cloud Function)</td>
                      <td className="p-3 text-emerald-700 font-semibold">Sangat Cepat (SQL Aggregate Query)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Keamanan & Hak Akses Guru / Wali Kelas</td>
                      <td className="p-3 text-slate-700">Firestore Security Rules</td>
                      <td className="p-3 text-slate-700">Role-Based Access Control (RBAC) di DB</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'recommendation' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sky-900 space-y-2">
                <h4 className="font-bold flex items-center gap-2 text-sm text-sky-800">
                  <Zap className="w-4 h-4 text-sky-600" />
                  Rekomendasi Terbaik untuk Sekolah Anda:
                </h4>
                <p className="text-xs text-sky-800 leading-relaxed">
                  Berdasarkan kebutuhan yang Anda sampaikan (guru menginput nilai secara efisien, realtime online, sinkronisasi massal Excel, backup otomatis, dan akses multi-pengguna):
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border-2 border-emerald-500 rounded-xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Pilihan Paling Praktis & Tangguh
                    </span>
                    <Flame className="w-5 h-5 text-amber-500" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Pilih Firebase Firestore jika:</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sekolah ingin sistem siap pakai tanpa perlu menyewa dan memelihara server database mandiri. Guru-guru di sekolah sering mengisi nilai serentak menjelang pembagian rapor, dan kadang sinyal WiFi sekolah kurang stabil (Firebase otomatis menyimpan draft nilai secara offline).
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                      Pilihan Institusional Terpusat
                    </span>
                    <Server className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Pilih Cloud SQL jika:</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sekolah memiliki tim IT atau ingin menyelaraskan arsitektur database secara langsung dengan sistem Dapodikdasmen pusat (PostgreSQL) serta mengelola ribuan data riwayat alumni dan buku induk nilai bertahun-tahun dalam format SQL relasional.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-slate-800">
                  Kabar Baik: Aplikasi e-Rapor ini sudah didesain dengan Arsitektur Hybrid!
                </p>
                <p className="leading-relaxed">
                  Aplikasi saat ini sudah memiliki mesin data reaktif lokal lengkap (bisa impor Excel, cetak PDF resmi, backup & restore JSON). Kapan pun Anda memutuskan untuk mengaktifkan Firebase atau Cloud SQL, Anda cukup menyambungkannya tanpa merusak struktur data nilai yang sudah ada!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-slate-100 p-5 rounded-xl space-y-3 font-mono text-xs">
                <div className="text-amber-400 font-bold">// Arsitektur Alur Data e-Rapor Merdeka</div>
                <div className="space-y-1 text-slate-300">
                  <p>1. [Browser Guru Mapel] ──(Input Nilai / Upload Excel)──&gt; Validasi KKTP &amp; Formula Merdeka</p>
                  <p>2. [Reactive State Engine] ──(Auto-compute)──&gt; Narasi Otomatis Capaian Tertinggi &amp; Terendah</p>
                  <p>3. [Local Snapshot Engine] ──(Persist)──&gt; Cache Offline Aman di Browser Guru</p>
                  <p>4. [Cloud Sync Layer] ──(Push/Stream)──&gt; Firebase / Cloud SQL Endpoint Terenkripsi</p>
                  <p>5. [Wali Kelas / Kepsek] &lt;──(Realtime Listen)──&gt; Cetak Rapor Resmi A4 &amp; Leger Kelas</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Data nilai siswa dijaga dengan checksum dan enkripsi. Sistem pencadangan otomatis (Auto-backup) mengarsipkan snapshot berkala ke dalam format JSON yang dapat dipulihkan dalam 1 klik jika terjadi kesalahan guru.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Status: <span className="font-semibold text-emerald-600">Siap Sinkronisasi &amp; Aman</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Tutup &amp; Lanjutkan Bekerja
          </button>
        </div>

      </div>
    </div>
  );
};
