import React, { useState } from 'react';
import { Teacher, Subject, ClassRoom, SchoolProfile } from '../types/erapor';
import {
  Users,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  Download,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  Printer,
  Sparkles,
  School,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  CloudUpload,
} from 'lucide-react';
import { exportTeacherAccountsToExcel } from '../utils/excelHandler';

interface Props {
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassRoom[];
  schoolProfile: SchoolProfile;
  onUpdateTeachers: (updated: Teacher[]) => void;
  onSaveToCloud?: () => void;
}

export const TeacherManagementView: React.FC<Props> = ({
  teachers,
  subjects,
  classes,
  schoolProfile,
  onUpdateTeachers,
  onSaveToCloud,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  
  // Feedback notices
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [isSavingCloud, setIsSavingCloud] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    email: '',
    phone: '',
    role: 'Guru Mapel' as Teacher['role'],
    assignedSubjectIds: [] as string[],
    homeroomClassId: '',
    username: '',
    password: '',
    isActive: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.username && t.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRoleFilter === 'all' || t.role === selectedRoleFilter;

    const matchesStatus =
      selectedStatusFilter === 'all' ||
      (selectedStatusFilter === 'active' && t.isActive !== false) ||
      (selectedStatusFilter === 'inactive' && t.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      nip: '',
      email: '',
      phone: '',
      role: 'Guru Mapel',
      assignedSubjectIds: subjects.length > 0 ? [subjects[0].id] : [],
      homeroomClassId: '',
      username: '',
      password: 'Guru@' + Math.floor(1000 + Math.random() * 9000),
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      nip: t.nip,
      email: t.email,
      phone: t.phone,
      role: t.role,
      assignedSubjectIds: t.assignedSubjectIds || [],
      homeroomClassId: t.homeroomClassId || '',
      username: t.username || t.nip.replace(/\s+/g, '') || t.email.split('@')[0],
      password: t.password || 'Guru@2025',
      isActive: t.isActive !== false,
    });
    setIsModalOpen(true);
  };

  // Submit create or edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const cleanUsername = formData.username.trim() || formData.nip.replace(/\s+/g, '') || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanPassword = formData.password.trim() || 'Guru@2025';

    if (editingTeacher) {
      const updatedList = teachers.map((t) =>
        t.id === editingTeacher.id
          ? {
              ...t,
              ...formData,
              username: cleanUsername,
              password: cleanPassword,
            }
          : t
      );
      onUpdateTeachers(updatedList);
      showToast(`Data guru ${formData.name} berhasil diperbarui!`);
    } else {
      const newTeacher: Teacher = {
        id: `tch-${Date.now()}`,
        ...formData,
        username: cleanUsername,
        password: cleanPassword,
      };
      onUpdateTeachers([...teachers, newTeacher]);
      showToast(`Guru baru ${formData.name} berhasil ditambahkan! Akun e-Rapor siap digunakan.`);
    }

    setIsModalOpen(false);
  };

  // Delete teacher
  const handleDeleteTeacher = (t: Teacher) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data guru "${t.name}"?`)) {
      const updatedList = teachers.filter((item) => item.id !== t.id);
      onUpdateTeachers(updatedList);
      showToast(`Data guru "${t.name}" berhasil dihapus.`);
    }
  };

  // Copy account to clipboard formatted for WhatsApp / SMS
  const handleCopyCredentials = (t: Teacher) => {
    const username = t.username || t.nip.replace(/\s+/g, '') || t.email;
    const password = t.password || 'Guru@2025';
    const homeroom = classes.find((c) => c.id === t.homeroomClassId);
    
    const textToCopy = `*AKUN LOGIN e-RAPOR KURIKULUM MERDEKA*\n` +
      `Sekolah: ${schoolProfile.name}\n` +
      `Nama Guru: ${t.name}\n` +
      `NIP: ${t.nip || '-'}\n` +
      `Peran: ${t.role}${homeroom ? ` (Wali ${homeroom.name})` : ''}\n` +
      `---------------------------------\n` +
      `Username: ${username}\n` +
      `Password: ${password}\n` +
      `---------------------------------\n` +
      `Silakan masuk ke aplikasi dan segera ganti kata sandi setelah login pertama. Terima kasih.`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(t.id);
    showToast(`Akun e-Rapor ${t.name} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Toggle active status
  const handleToggleActive = (t: Teacher) => {
    const newStatus = t.isActive === false ? true : false;
    const updated = teachers.map((item) =>
      item.id === t.id ? { ...item, isActive: newStatus } : item
    );
    onUpdateTeachers(updated);
    showToast(`Status akun ${t.name} diubah menjadi: ${newStatus ? 'Aktif' : 'Non-Aktif'}`);
  };

  // Toggle show password
  const toggleShowPassword = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Generate random password in form
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: `Guru@${rand}` }));
  };

  // Export to Excel
  const handleExportExcel = () => {
    exportTeacherAccountsToExcel(teachers, classes, subjects);
    showToast('File data & akun guru berhasil diekspor ke format Excel (.xlsx)!');
  };

  // Trigger manual cloud save
  const handleManualSaveCloud = () => {
    setIsSavingCloud(true);
    if (onSaveToCloud) onSaveToCloud();
    setTimeout(() => {
      setIsSavingCloud(false);
      showToast('Seluruh data guru & akun e-Rapor tersinkronisasi ke Firebase Cloud!');
    }, 800);
  };

  // Stats
  const activeCount = teachers.filter((t) => t.isActive !== false).length;
  const homeroomCount = teachers.filter((t) => !!t.homeroomClassId).length;

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                Pendidik &amp; Tenaga Kependidikan
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">12 Rombel Sekolah</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Data Guru &amp; Akun e-Rapor
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
              Kelola pendidik, penugasan mata pelajaran, penugasan wali kelas (Kelas 7.1 s.d 9.4), hak akses, dan distribusi akun login e-Rapor.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Guru</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Unduh daftar akun dan password guru dalam file Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh Akun (Excel)</span>
            </button>

            <button
              onClick={() => setShowSlipModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Pratinjau kartu / slip kredensial untuk dibagikan"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak Slip Akun</span>
            </button>

            <button
              onClick={handleManualSaveCloud}
              disabled={isSavingCloud}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              title="Simpan langsung ke Cloud Database Firebase"
            >
              <CloudUpload className={`w-3.5 h-3.5 text-sky-400 ${isSavingCloud ? 'animate-bounce' : ''}`} />
              <span>{isSavingCloud ? 'Menyimpan...' : 'Simpan ke Cloud'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] text-slate-500 block">Total Pendidik</span>
            <span className="text-lg font-black text-slate-900">{teachers.length} Guru</span>
          </div>
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
            <span className="text-[11px] text-emerald-700 block">Wali Kelas Terisi</span>
            <span className="text-lg font-black text-emerald-800">{homeroomCount} / 12 Rombel</span>
          </div>
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
            <span className="text-[11px] text-blue-700 block">Akun e-Rapor Aktif</span>
            <span className="text-lg font-black text-blue-800">{activeCount} Akun</span>
          </div>
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
            <span className="text-[11px] text-amber-700 block">Standar Kurikulum</span>
            <span className="text-lg font-black text-amber-800">Fase D (SMP)</span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, NIP, username, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">Semua Peran</option>
            <option value="Wali Kelas">Wali Kelas</option>
            <option value="Guru Mapel">Guru Mapel</option>
            <option value="Kurikulum">Kurikulum</option>
            <option value="Kepala Sekolah">Kepala Sekolah</option>
            <option value="Admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">Semua Status Akun</option>
            <option value="active">Akun Aktif</option>
            <option value="inactive">Akun Non-Aktif</option>
          </select>
        </div>
      </div>

      {/* 3. Main Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3 min-w-[200px]">Nama Lengkap &amp; NIP</th>
                <th className="p-3 w-32">Peran Utama</th>
                <th className="p-3 min-w-[180px]">Penugasan Pembelajaran</th>
                <th className="p-3 min-w-[220px] bg-slate-50/50 border-l border-slate-200">
                  Kredensial e-Rapor (Username &amp; Sandi)
                </th>
                <th className="p-3 w-24 text-center">Status</th>
                <th className="p-3 w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data guru sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t, idx) => {
                  const homeroomClass = classes.find((c) => c.id === t.homeroomClassId);
                  const assignedSubjs = (t.assignedSubjectIds || [])
                    .map((sid) => subjects.find((s) => s.id === sid)?.name)
                    .filter(Boolean);

                  const username = t.username || t.nip.replace(/\s+/g, '') || t.email.split('@')[0];
                  const password = t.password || 'Guru@2025';
                  const isPwVisible = !!showPasswordMap[t.id];
                  const isCopied = copiedId === t.id;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      {/* No */}
                      <td className="p-3 text-center text-slate-500 font-mono text-[11px]">{idx + 1}</td>

                      {/* Name & NIP */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-xs">{t.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          NIP: {t.nip || 'Belum diisi'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{t.email}</div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.role === 'Wali Kelas'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : t.role === 'Kurikulum'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : t.role === 'Kepala Sekolah'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : t.role === 'Admin'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {t.role}
                        </span>
                      </td>

                      {/* Assignments (Mapel & Homeroom) */}
                      <td className="p-3 space-y-1">
                        {homeroomClass && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <School className="w-3 h-3 text-emerald-600" />
                            <span>Wali: {homeroomClass.name}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-700">
                          {assignedSubjs.length > 0 ? (
                            assignedSubjs.join(', ')
                          ) : (
                            <span className="text-slate-400 italic">Belum ada mapel diampu</span>
                          )}
                        </div>
                      </td>

                      {/* Credentials */}
                      <td className="p-3 border-l border-slate-200 bg-slate-50/40 font-mono text-[11px]">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Username:</span>
                            <span className="font-bold text-slate-800">{username}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">Password:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-blue-700">
                                {isPwVisible ? password : '••••••••'}
                              </span>
                              <button
                                onClick={() => toggleShowPassword(t.id)}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                                title={isPwVisible ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                              >
                                {isPwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopyCredentials(t)}
                            className={`p-1.5 rounded-lg border transition ${
                              isCopied
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title="Salin akun & kata sandi untuk dikirimkan ke guru"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleActive(t)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                            t.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          }`}
                          title="Klik untuk ubah status aktif/non-aktif"
                        >
                          {t.isActive !== false ? 'Aktif' : 'Non-Aktif'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Ubah data guru"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(t)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus guru"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal Add / Edit Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in max-h-[90vh] flex flex-col">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">
                  {editingTeacher ? 'Ubah Data & Akun Guru' : 'Tambah Guru & Buat Akun e-Rapor'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Lengkapi identitas pendidik, peran, penugasan rombel dan kata sandi akses.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Nama Guru */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Lengkap &amp; Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi, S.Pd., M.Si."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* NIP & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 19810314 200501 1 008"
                    value={formData.nip}
                    onChange={(e) => {
                      const nipVal = e.target.value;
                      setFormData({
                        ...formData,
                        nip: nipVal,
                        username: formData.username || nipVal.replace(/\s+/g, ''),
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Peran / Hak Akses <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                  >
                    <option value="Guru Mapel">Guru Mapel</option>
                    <option value="Wali Kelas">Wali Kelas</option>
                    <option value="Kurikulum">Kurikulum</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email / Akun belajar.id</label>
                  <input
                    type="email"
                    placeholder="nama@smpn1.sch.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Homeroom Assignment */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Penugasan Wali Kelas (12 Rombel)
                </label>
                <select
                  value={formData.homeroomClassId}
                  onChange={(e) => {
                    const clsId = e.target.value;
                    setFormData({
                      ...formData,
                      homeroomClassId: clsId,
                      role: clsId ? 'Wali Kelas' : formData.role,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Bukan Wali Kelas / Tidak Ditugaskan --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phase} - SMP)
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Multi-assignment */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mata Pelajaran yang Diampu
                </label>
                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-36 overflow-y-auto">
                  {subjects.map((sub) => {
                    const isChecked = formData.assignedSubjectIds.includes(sub.id);
                    return (
                      <label key={sub.id} className="flex items-center gap-2 text-[11px] cursor-pointer hover:bg-white p-1 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                assignedSubjectIds: [...formData.assignedSubjectIds, sub.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                assignedSubjectIds: formData.assignedSubjectIds.filter((id) => id !== sub.id),
                              });
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{sub.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Account Credentials Box */}
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-sky-950">
                    <KeyRound className="w-4 h-4 text-sky-600" />
                    <span>Kredensial Akun e-Rapor</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Acak Kata Sandi
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-sky-900 block mb-1">Username Login</label>
                    <input
                      type="text"
                      required
                      placeholder="Username (contoh: NIP)"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-sky-900 block mb-1">Kata Sandi Awal</label>
                    <input
                      type="text"
                      required
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="chk-active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="chk-active" className="text-[11px] font-semibold text-sky-900 cursor-pointer">
                    Akun Aktif (Dapat langsung digunakan untuk login e-Rapor)
                  </label>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {editingTeacher ? 'Simpan Perubahan' : 'Buat Akun & Simpan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 5. Printable Slips Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">
                  Cetak Lembar Slip Akun e-Rapor Guru
                </h3>
                <p className="text-[11px] text-slate-400">
                  Format kartu kredensial siap gunting untuk dibagikan kepada masing-masing guru.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Sekarang
                </button>
                <button
                  onClick={() => setShowSlipModal(false)}
                  className="text-slate-400 hover:text-white p-1 text-lg font-bold"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teachers.map((t) => {
                  const homeroom = classes.find((c) => c.id === t.homeroomClassId);
                  const username = t.username || t.nip.replace(/\s+/g, '') || t.email;
                  const password = t.password || 'Guru@2025';

                  return (
                    <div
                      key={t.id}
                      className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 space-y-2.5 text-xs print:break-inside-avoid"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div>
                          <p className="font-black text-slate-900 text-xs">{schoolProfile.name}</p>
                          <p className="text-[10px] text-slate-500">SLIP AKUN e-RAPOR KURIKULUM MERDEKA</p>
                        </div>
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {t.role}
                        </span>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-slate-800">{t.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NIP: {t.nip || '-'}</div>
                        {homeroom && (
                          <div className="text-[10px] text-emerald-700 font-bold">Wali {homeroom.name}</div>
                        )}
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Username:</span>
                          <span className="font-bold text-slate-900">{username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Password:</span>
                          <span className="font-bold text-blue-700">{password}</span>
                        </div>
                      </div>

                      <p className="text-[9px] text-slate-400 italic">
                        Harap rahasiakan kata sandi Anda dan ubah segera setelah login pertama kali.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
