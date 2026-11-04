import React, { useState, useRef } from 'react';
import { SchoolProfile, Subject, AcademicYear } from '../types/erapor';
import {
  School,
  X,
  Save,
  Check,
  Upload,
  Trash2,
  Image as ImageIcon,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Sparkles,
  Info,
} from 'lucide-react';
import { PemdaLogo, SchoolLogo } from './SchoolLogos';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  onSave: (updated: SchoolProfile) => Promise<void> | void;
  subjects?: Subject[];
  onSaveSubjects?: (updated: Subject[]) => Promise<void> | void;
  academicYears?: AcademicYear[];
  onSaveAcademicYears?: (updated: AcademicYear[]) => Promise<void> | void;
}

export const SchoolSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  subjects = [],
  onSaveSubjects,
  academicYears = [],
  onSaveAcademicYears,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'kktp' | 'years'>('profile');
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });
  const [editableSubjects, setEditableSubjects] = useState<Subject[]>([...subjects]);
  const [editableYears, setEditableYears] = useState<AcademicYear[]>([...academicYears]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const pemdaFileInputRef = useRef<HTMLInputElement | null>(null);
  const schoolFileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  React.useEffect(() => {
    setEditableSubjects([...subjects]);
  }, [subjects]);

  React.useEffect(() => {
    setEditableYears([...academicYears]);
  }, [academicYears]);

  if (!isOpen) return null;

  // Process image upload with client-side canvas resizing for fast rendering and minimal storage
  const handleProcessImage = (file: File, field: 'logoPemda' | 'logoSekolah') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/png', 0.85);
          setFormData((prev) => ({ ...prev, [field]: compressedDataUrl }));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleKktpChange = (subjectId: string, newKktpStr: string) => {
    const val = newKktpStr === '' ? 0 : Math.max(0, Math.min(100, Math.round(Number(newKktpStr))));
    setEditableSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, kktp: val } : s))
    );
  };

  const handleBulkSetKktp = (value: number) => {
    setEditableSubjects((prev) => prev.map((s) => ({ ...s, kktp: value })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    if (onSaveSubjects) {
      await onSaveSubjects(editableSubjects);
    }
    if (onSaveAcademicYears) {
      await onSaveAcademicYears(editableYears);
    }
    setIsSaving(false);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Pengaturan Satuan Pendidikan &amp; KKTP</h3>
              <p className="text-xs text-slate-300">
                Profil Sekolah, Logo Kop Rapor Resmi, KKTP Mata Pelajaran, dan Tahun Pelajaran
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-2 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <School className="w-4 h-4" />
            1. Identitas &amp; Logo Kop
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kktp')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'kktp'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            2. Kelola KKTP Mapel ({editableSubjects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('years')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'years'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            3. Tahun Pelajaran 2026/2027
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          
          {/* TAB 1: IDENTITAS DAN UPLOAD LOGO */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              
              {/* Upload Section: Logo Pemda & Logo Sekolah */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      Upload Logo Kop Cetak Rapor
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Format PNG/JPG transparan direkomendasikan. Logo otomatis dikompres ringan untuk kecepatan cetak.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* 1. Logo Pemda (Kiri Kop) */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Logo Pemda (Kiri Kop)
                    </span>
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                      <PemdaLogo customSrc={formData.logoPemda} className="w-16 h-16" />
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {formData.logoPemda ? 'Logo Kustom Aktif' : 'Lambang Default Tubaba Aktif'}
                    </div>

                    <input
                      ref={pemdaFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProcessImage(file, 'logoPemda');
                      }}
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => pemdaFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg flex items-center gap-1.5 transition text-[11px]"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {formData.logoPemda ? 'Ganti Logo' : 'Upload Logo Pemda'}
                      </button>
                      {formData.logoPemda && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, logoPemda: '' }))}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Kembalikan ke lambang default Tubaba"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Logo Sekolah (Kanan Kop) */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Logo Sekolah (Kanan Kop)
                    </span>
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                      <SchoolLogo customSrc={formData.logoSekolah} className="w-16 h-16" />
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {formData.logoSekolah ? 'Logo Kustom Aktif' : 'Lambang Tut Wuri Handayani Aktif'}
                    </div>

                    <input
                      ref={schoolFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProcessImage(file, 'logoSekolah');
                      }}
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => schoolFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg flex items-center gap-1.5 transition text-[11px]"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {formData.logoSekolah ? 'Ganti Logo' : 'Upload Logo Sekolah'}
                      </button>
                      {formData.logoSekolah && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, logoSekolah: '' }))}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Kembalikan ke lambang default Tut Wuri Handayani"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Satuan Pendidikan */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Identitas Satuan Pendidikan</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nama Resmi Sekolah</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="SMPN 14 TULANG BAWANG BARAT"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">NPSN</label>
                    <input
                      type="text"
                      required
                      value={formData.npsn}
                      onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                      placeholder="10809848"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Jl. Poros Tiyuh Marga Jaya, Kecamatan Gunung Agung"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Kabupaten</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Tulang Bawang Barat"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Provinsi</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      placeholder="Lampung"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Kode Pos</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="34683"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Titimangsa & Kepala Sekolah */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Penandatanganan &amp; Titimangsa Rapor</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nama Kepala Sekolah</label>
                    <input
                      type="text"
                      required
                      value={formData.headmasterName}
                      onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                      placeholder="PEBRIANSYAH, M.Pd"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">NIP Kepala Sekolah</label>
                    <input
                      type="text"
                      required
                      value={formData.headmasterNip}
                      onChange={(e) => setFormData({ ...formData, headmasterNip: e.target.value })}
                      placeholder="197602182014071002"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tempat Titimangsa Rapor</label>
                    <input
                      type="text"
                      required
                      value={formData.reportPlace}
                      onChange={(e) => setFormData({ ...formData, reportPlace: e.target.value })}
                      placeholder="Tulang Bawang Barat"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tanggal Pembagian Rapor</label>
                    <input
                      type="text"
                      required
                      value={formData.reportDate}
                      onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                      placeholder="20 Desember 2026"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KELOLA KKTP MATA PELAJARAN */}
          {activeTab === 'kktp' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900">
                <div className="flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</div>
                    <div className="text-[11px] text-amber-800">
                      KKTP dapat disesuaikan per mata pelajaran. Nilai KKTP digunakan sebagai acuan deskripsi capaian pembelajaran siswa pada Rapor STS.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-semibold text-slate-600">Set Seragam:</span>
                  {[70, 72, 75, 78, 80].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleBulkSetKktp(num)}
                      className="px-2 py-1 bg-white border border-amber-300 rounded text-[10px] font-bold hover:bg-amber-100 transition"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5 w-20">Kode</th>
                      <th className="p-2.5">Mata Pelajaran</th>
                      <th className="p-2.5 w-32">Kategori</th>
                      <th className="p-2.5 w-28 text-center">Nilai KKTP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {editableSubjects.map((sub, index) => (
                      <tr key={sub.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 text-center font-mono text-slate-500">{index + 1}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-700">{sub.code}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{sub.name}</td>
                        <td className="p-2.5 text-slate-600">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              sub.category === 'Muatan Lokal'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {sub.category}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={sub.kktp}
                              onChange={(e) => handleKktpChange(sub.id, e.target.value)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-blue-900"
                            />
                            <span className="text-slate-400 text-[10px]">/ 100</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TAHUN PELAJARAN 2026/2027 */}
          {activeTab === 'years' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-xl text-sky-950 flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">Kelola Tahun Pelajaran 2026/2027</div>
                  <div className="text-[11px] text-sky-800">
                    Tahun pelajaran 2026/2027 Semester Ganjil dan Genap telah aktif dan dapat dipilih di seluruh sistem e-Rapor.
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Tahun Pelajaran</th>
                      <th className="p-2.5">Semester</th>
                      <th className="p-2.5 text-center">Status</th>
                      <th className="p-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {editableYears.map((ay) => (
                      <tr key={ay.id} className={ay.isActive ? 'bg-blue-50/60 font-semibold' : ''}>
                        <td className="p-2.5 font-bold">{ay.year}</td>
                        <td className="p-2.5">{ay.semester}</td>
                        <td className="p-2.5 text-center">
                          {ay.isActive ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Aktif Default
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Non-aktif</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          {!ay.isActive && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditableYears((prev) =>
                                  prev.map((y) => ({ ...y, isActive: y.id === ay.id }))
                                );
                              }}
                              className="px-2.5 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition"
                            >
                              Jadikan Aktif
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 shrink-0">
            <span className="text-[11px] text-slate-500">
              * Perubahan akan tersinkronisasi otomatis ke cetak rapor dan leger nilai.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
              >
                {savedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Tersimpan!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Seluruh Pengaturan
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
