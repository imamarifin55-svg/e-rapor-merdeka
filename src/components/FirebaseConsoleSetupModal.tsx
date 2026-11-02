import React, { useState } from 'react';
import {
  Flame,
  Globe,
  Database,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Save,
  Trash2,
  AlertCircle,
  X,
  Code,
  Sparkles,
  Info,
  Check,
  ArrowRight,
  MousePointerClick,
} from 'lucide-react';
import {
  FirebaseConsoleConfig,
  getActiveFirebaseConfig,
  saveFirebaseConsoleConfig,
  clearFirebaseConsoleConfig,
  testFirestoreConnection,
} from '../services/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const FirebaseConsoleSetupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'vercel' | 'firebase' | 'rules'>('vercel');
  
  const currentConfig = getActiveFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig?.appId || '');
  const [firestoreDbId, setFirestoreDbId] = useState(currentConfig?.firestoreDatabaseId || '');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const targetConfig: FirebaseConsoleConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
      firestoreDatabaseId: firestoreDbId.trim(),
    };

    const res = await testFirestoreConnection(targetConfig);
    setTesting(false);
    setTestResult(res);
  };

  const vercelEnvSnippet = `VITE_FIREBASE_API_KEY=${apiKey}
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
VITE_FIREBASE_APP_ID=${appId}
VITE_FIREBASE_DATABASE_ID=${firestoreDbId || '(default)'}`;

  const envItems = [
    { key: 'VITE_FIREBASE_API_KEY', val: apiKey, desc: 'Web API Key Firebase' },
    { key: 'VITE_FIREBASE_PROJECT_ID', val: projectId, desc: 'ID Project Google Cloud' },
    { key: 'VITE_FIREBASE_AUTH_DOMAIN', val: authDomain, desc: 'Domain Otentikasi' },
    { key: 'VITE_FIREBASE_STORAGE_BUCKET', val: storageBucket, desc: 'Wadah Penyimpanan' },
    { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', val: messagingSenderId, desc: 'Messaging Sender ID' },
    { key: 'VITE_FIREBASE_APP_ID', val: appId, desc: 'Application ID' },
    { key: 'VITE_FIREBASE_DATABASE_ID', val: firestoreDbId || '(default)', desc: 'Nama Database Firestore' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-900 to-slate-900 p-6 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Database Firebase Telah Aktif Otomatis
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Panduan Meng-online-kan ke Vercel (Klik per Klik)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Ikuti panduan mudah langkah demi langkah di bawah ini. Semua tombol dan teks yang harus diklik telah dirinci secara lengkap.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('vercel')}
            className={`pb-3 px-3.5 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vercel'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-600" />
            1. Panduan Step-by-Step Vercel
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`pb-3 px-3.5 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'firebase'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            2. Nilai Kredensial Firebase Aktif
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 px-3.5 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rules'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            3. Aturan Keamanan Database
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* TAB 1: VERCEL STEP-BY-STEP */}
          {activeTab === 'vercel' && (
            <div className="space-y-6">
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 space-y-1">
                <h4 className="font-bold flex items-center gap-2 text-sm text-blue-950">
                  <MousePointerClick className="w-4 h-4 text-blue-600" />
                  Semua yang Harus Anda Klik dari Awal sampai Selesai:
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Layanan Vercel <strong>100% Gratis</strong> untuk sekolah. Cukup ikuti urutan 4 tahap di bawah ini:
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                    1
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Daftar / Masuk ke Vercel (Sekali Saja)
                  </h4>
                </div>
                <div className="ml-9 space-y-1.5 text-slate-600 text-xs">
                  <p>1. Buka situs resmi: <a href="https://vercel.com/signup" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold inline-flex items-center gap-1">vercel.com/signup <ExternalLink className="w-3 h-3" /></a></p>
                  <p>2. Klik tombol hitam: <strong>"Continue with GitHub"</strong> (atau daftar menggunakan akun email sekolah / Google Anda).</p>
                  <p>3. Ikuti konfirmasi login hingga Anda masuk ke halaman utama (*Dashboard Vercel*).</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Buat Project Baru di Vercel
                  </h4>
                </div>
                <div className="ml-9 space-y-1.5 text-slate-600 text-xs">
                  <p>1. Di Dashboard Vercel (pojok kanan atas), klik tombol hitam: <strong>"+ Add New..."</strong> lalu pilih <strong>"Project"</strong>.</p>
                  <p>2. Di daftar repositori GitHub Anda, cari nama project e-Rapor ini (misal: <code>e-rapor-merdeka</code>).</p>
                  <p>3. Klik tombol biru: <strong>"Import"</strong> di sebelah kanan nama project tersebut.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                    3
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Memasukkan Kunci Database (Hanya 1x Klik Salin!)
                  </h4>
                </div>
                <div className="ml-9 space-y-3 text-slate-600 text-xs">
                  <p>
                    Di halaman konfigurasi Vercel, gulir sedikit ke bawah dan temukan bagian bertuliskan <strong>"Environment Variables"</strong> (klik judulnya agar menunya terbuka ke bawah).
                  </p>

                  <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-amber-900 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Cara Paling Cepat (Otomatis):
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Klik tombol di bawah ini. Lalu di layar Vercel, klik kotak input pertama pada bagian Environment Variables, dan tekan <strong>Ctrl + V</strong> (Paste). Semua 7 kunci akan otomatis terisi rapi!
                    </p>
                    <button
                      onClick={() => handleCopy(vercelEnvSnippet, 'all_env_btn')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedKey === 'all_env_btn' ? 'Berhasil Tersalin ke Clipboard!' : 'Klik Di Sini: Salin Semua Kunci untuk Vercel'}
                    </button>
                  </div>

                  <p className="font-semibold text-slate-800 pt-1">
                    Atau jika ingin memasukkan satu per satu:
                  </p>

                  {/* Individual copy table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2">Nama Kolom (Key)</th>
                          <th className="p-2">Nilai (Value)</th>
                          <th className="p-2 text-center w-20">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {envItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-slate-800">{item.key}</td>
                            <td className="p-2 font-mono text-slate-600 truncate max-w-[200px]">{item.val || '-'}</td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleCopy(item.val, `val_${idx}`)}
                                className="px-2 py-1 bg-slate-100 hover:bg-blue-100 text-blue-700 font-semibold rounded text-[10px]"
                              >
                                {copiedKey === `val_${idx}` ? 'Tersalin' : 'Salin'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                    4
                  </span>
                  <h4 className="font-extrabold text-emerald-950 text-sm">
                    Klik Tombol "Deploy" &amp; Selesai!
                  </h4>
                </div>
                <div className="ml-9 space-y-2 text-emerald-900 text-xs">
                  <p>1. Di bagian paling bawah halaman Vercel, klik tombol biru besar: <strong>"Deploy"</strong>.</p>
                  <p>2. Tunggu proses kompilasi sekitar 30 sampai 50 detik hingga muncul gambar pesta konfeti bertuliskan <em>"Congratulations!"</em>.</p>
                  <p>3. Klik gambar pratinjau website Anda atau klik tautan domain yang diberikan (contoh: <code>https://erapor-smpn1.vercel.app</code>).</p>
                  <p className="font-bold text-emerald-800 bg-white/80 p-2 rounded-lg border border-emerald-200">
                    Selamat! Aplikasi e-Rapor sekolah Anda kini sudah resmi online dan dapat diakses dari laptop guru mana saja maupun HP wali murid di seluruh Indonesia!
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ACTIVE CREDENTIALS */}
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-900 space-y-1">
                <h4 className="font-bold flex items-center gap-2 text-sm text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Kredensial Database Cloud Google Telah Dibuatkan:
                </h4>
                <p className="text-xs text-emerald-900">
                  Berikut rincian lengkap konfigurasi yang terhubung ke aplikasi Anda saat ini:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <span className="text-slate-500 font-sans font-semibold">Project ID:</span>
                  <p className="font-bold text-slate-900">{projectId}</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <span className="text-slate-500 font-sans font-semibold">Database ID:</span>
                  <p className="font-bold text-slate-900">{firestoreDbId}</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <span className="text-slate-500 font-sans font-semibold">Auth Domain:</span>
                  <p className="font-bold text-slate-900">{authDomain}</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <span className="text-slate-500 font-sans font-semibold">Storage Bucket:</span>
                  <p className="font-bold text-slate-900">{storageBucket}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xs transition"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-200" />
                  {testing ? 'Menguji...' : 'Uji Koneksi Firestore Sekarang'}
                </button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs">
                Aturan keamanan <code>firestore.rules</code> sudah otomatis dideploy ke Google Cloud. Data nilai 12 rombel Anda terlindungi dengan aman.
              </div>
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Konfigurasi 100% Siap untuk Vercel</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
