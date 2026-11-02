import React, { useState, useRef } from 'react';
import { Student, ClassRoom } from '../types/erapor';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Users,
  Check,
  X,
} from 'lucide-react';
import {
  downloadStudentTemplateExcel,
  exportStudentsToExcel,
  parseStudentsFromExcel,
} from '../utils/excelHandler';

interface Props {
  students: Student[];
  classes: ClassRoom[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onBatchSyncStudents: (incomingStudents: Student[]) => void;
}

export const StudentSyncView: React.FC<Props> = ({
  students,
  classes,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBatchSyncStudents,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{ students: Student[]; warnings: string[] } | null>(null);
  const [syncTargetClassId, setSyncTargetClassId] = useState<string>(classes[0]?.id || 'cls-7-1');
  const [notice, setNotice] = useState<string | null>(null);

  // Manual Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formName, setFormName] = useState('');
  const [formNis, setFormNis] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formBirthPlace, setFormBirthPlace] = useState('Semarang');
  const [formBirthDate, setFormBirthDate] = useState('12 Mei 2011');
  const [formReligion, setFormReligion] = useState<any>('Islam');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || 'cls-7-1');
  const [formParent, setFormParent] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');

  const excelInputRef = useRef<HTMLInputElement | null>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClassFilter === 'all' || s.classId === selectedClassFilter;
    const matchQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.nis.includes(searchQuery);
    return matchClass && matchQuery;
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormName('');
    setFormNis(`${250700 + students.length + 1}`);
    setFormNisn(`0089${Math.floor(100000 + Math.random() * 900000)}`);
    setFormGender('L');
    setFormBirthPlace('Semarang');
    setFormBirthDate('10 Januari 2011');
    setFormReligion('Islam');
    setFormClassId(selectedClassFilter !== 'all' ? selectedClassFilter : classes[0]?.id || 'cls-7a');
    setFormParent('');
    setFormPhone('');
    setFormAddress('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormNis(student.nis);
    setFormNisn(student.nisn);
    setFormGender(student.gender);
    setFormBirthPlace(student.birthPlace);
    setFormBirthDate(student.birthDate);
    setFormReligion(student.religion);
    setFormClassId(student.classId);
    setFormParent(student.parentName);
    setFormPhone(student.parentPhone);
    setFormAddress(student.address);
    setModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find((c) => c.id === formClassId);
    const className = targetClass ? targetClass.name : 'Kelas VII-A';

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name: formName.trim(),
        nis: formNis.trim(),
        nisn: formNisn.trim(),
        gender: formGender,
        birthPlace: formBirthPlace.trim(),
        birthDate: formBirthDate.trim(),
        religion: formReligion,
        classId: formClassId,
        className,
        parentName: formParent.trim(),
        parentPhone: formPhone.trim(),
        address: formAddress.trim(),
      };
      onUpdateStudent(updated);
      setNotice('Data siswa berhasil diperbarui!');
    } else {
      const newStd: Student = {
        id: `std-${Date.now()}`,
        name: formName.trim(),
        nis: formNis.trim(),
        nisn: formNisn.trim(),
        gender: formGender,
        birthPlace: formBirthPlace.trim(),
        birthDate: formBirthDate.trim(),
        religion: formReligion,
        classId: formClassId,
        className,
        parentName: formParent.trim(),
        parentPhone: formPhone.trim(),
        address: formAddress.trim(),
      };
      onAddStudent(newStd);
      setNotice('Siswa baru berhasil ditambahkan!');
    }

    setModalOpen(false);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const targetClass = classes.find((c) => c.id === syncTargetClassId);
      const parsed = await parseStudentsFromExcel(file, syncTargetClassId, targetClass?.name || 'Kelas VII-A');
      setParsedPreview(parsed);
    } catch (err: any) {
      alert(err.message);
    } finally {
      if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  const handleConfirmSync = () => {
    if (!parsedPreview || parsedPreview.students.length === 0) return;
    onBatchSyncStudents(parsedPreview.students);
    setNotice(`Sinkronisasi berhasil! ${parsedPreview.students.length} siswa berhasil dimasukkan ke sistem.`);
    setParsedPreview(null);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleExportStudents = () => {
    const currentClass = classes.find((c) => c.id === selectedClassFilter);
    exportStudentsToExcel(filteredStudents, currentClass ? currentClass.name : 'Semua_Kelas');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Excel Mass Sync Box */}
      <div className="bg-linear-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Sinkronisasi Massal Excel Berstandar Dapodik
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Unggah &amp; Sinkronkan Data Siswa Secara Massal
            </h2>
            <p className="text-xs text-blue-200 leading-relaxed">
              Dukung impor berkas Excel (.xlsx / .xls) untuk ratusan siswa sekaligus. Data NISN, kelas, dan kontak orang tua akan langsung terintegrasi ke seluruh modul penilaian dan rapor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadStudentTemplateExcel}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Unduh Format Excel
            </button>

            <button
              onClick={() => excelInputRef.current?.click()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <Upload className="w-4 h-4" />
              Unggah Berkas Siswa
            </button>
            <input
              type="file"
              ref={excelInputRef}
              onChange={handleFileChosen}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
          </div>
        </div>

        {/* Sync Target Class Selector */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10 text-xs">
          <span className="text-blue-200">Rombel Tujuan untuk Impor:</span>
          <select
            value={syncTargetClassId}
            onChange={(e) => setSyncTargetClassId(e.target.value)}
            className="bg-slate-800 text-white font-bold border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-hidden"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notice Message */}
      {notice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{notice}</span>
        </div>
      )}

      {/* Preview Dialog if Excel Parsed */}
      {parsedPreview && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Pratinjau Data Impor ({parsedPreview.students.length} Siswa Ditemukan)
              </h3>
              <p className="text-xs text-amber-700">
                Periksa data berikut sebelum mengonfirmasi sinkronisasi ke dalam database sekolah.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setParsedPreview(null)}
                className="px-3 py-1.5 border border-amber-300 text-amber-800 rounded-lg text-xs hover:bg-amber-100"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSync}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
              >
                Konfirmasi &amp; Simpan Data
              </button>
            </div>
          </div>

          {parsedPreview.warnings.length > 0 && (
            <div className="p-3 bg-amber-100/70 rounded-xl text-[11px] text-amber-900 space-y-1">
              <p className="font-semibold">Catatan Peringatan:</p>
              {parsedPreview.warnings.map((w, idx) => (
                <p key={idx}>• {w}</p>
              ))}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto border border-amber-200 rounded-xl bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-100 text-amber-900 font-bold">
                <tr>
                  <th className="p-2">No</th>
                  <th className="p-2">NISN</th>
                  <th className="p-2">Nama Lengkap</th>
                  <th className="p-2">JK</th>
                  <th className="p-2">Tempat, Tanggal Lahir</th>
                  <th className="p-2">Nama Orang Tua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 text-slate-700">
                {parsedPreview.students.map((s, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/50">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2 font-mono font-medium">{s.nisn}</td>
                    <td className="p-2 font-semibold text-slate-900">{s.name}</td>
                    <td className="p-2">{s.gender}</td>
                    <td className="p-2">{s.birthPlace}, {s.birthDate}</td>
                    <td className="p-2">{s.parentName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Directory Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
        
        {/* Filter & Action Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="font-semibold text-slate-500">Kelas:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Rombongan Belajar</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama / NISN / NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-56 sm:w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportStudents}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Unduh seluruh data siswa dalam format Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Ekspor Excel
            </button>

            <button
              onClick={handleOpenAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
            >
              <Plus className="w-4 h-4" />
              Tambah Siswa Manual
            </button>
          </div>

        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3 w-28">NISN / NIS</th>
                <th className="p-3 min-w-[180px]">Nama Lengkap Siswa</th>
                <th className="p-3 w-16 text-center">L/P</th>
                <th className="p-3 min-w-[140px]">Tempat, Tgl Lahir</th>
                <th className="p-3 w-28">Kelas</th>
                <th className="p-3 min-w-[150px]">Orang Tua / Wali</th>
                <th className="p-3 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada siswa ditemukan dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => (
                  <tr key={std.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-800 text-[11px] block">{std.nisn}</span>
                      <span className="font-mono text-slate-400 text-[10px]">NIS: {std.nis}</span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {std.name}
                      <span className="block text-[10px] text-slate-400 font-normal">{std.religion}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        std.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {std.gender === 'L' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{std.birthPlace}</div>
                      <div className="text-[10px] text-slate-400">{std.birthDate}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-[11px]">
                        {std.className}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div className="font-medium text-slate-800">{std.parentName}</div>
                      <div className="text-[10px] text-slate-400">{std.parentPhone}</div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(std)}
                          title="Ubah Data Siswa"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus data siswa ${std.name}?`)) {
                              onDeleteStudent(std.id);
                            }
                          }}
                          title="Hapus Siswa"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add / Edit Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in">
            <div className="bg-blue-600 text-white p-4 font-bold text-sm flex items-center justify-between">
              <span>{editingStudent ? 'Edit Biodata Siswa' : 'Tambah Siswa Baru'}</span>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    placeholder="0089123401"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NIS Lokal</label>
                  <input
                    type="text"
                    required
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    placeholder="250701"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Muhammad Bintang Ramadhan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Agama</label>
                  <select
                    value={formReligion}
                    onChange={(e) => setFormReligion(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formBirthPlace}
                    onChange={(e) => setFormBirthPlace(e.target.value)}
                    placeholder="Semarang"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Lahir</label>
                  <input
                    type="text"
                    value={formBirthDate}
                    onChange={(e) => setFormBirthDate(e.target.value)}
                    placeholder="14 Mei 2011"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rombongan Belajar (Kelas)</label>
                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formParent}
                    onChange={(e) => setFormParent(e.target.value)}
                    placeholder="Bambang Pratama"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kontak HP Orang Tua</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081223344551"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alamat Tinggal</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Jl. Melati Indah No. 12, Semarang"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Siswa
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
