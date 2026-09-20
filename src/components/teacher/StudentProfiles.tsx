import React, { useState } from 'react';
import { Student, SchoolClass } from '../../types';
import { storageService } from '../../services/storage';
import {
  Plus,
  Search,
  Upload,
  Download,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
  Check,
  X,
  UserCheck,
  RefreshCw,
  Copy,
  School,
  Settings2,
  CheckCircle2
} from 'lucide-react';

interface StudentProfilesProps {
  students: Student[];
  classes: SchoolClass[];
  onRefresh: () => void;
}

export const StudentProfiles: React.FC<StudentProfilesProps> = ({ students, classes, onRefresh }) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [fullName, setFullName] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [formClass, setFormClass] = useState<string>(classes[0]?.name || '5/9');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Delete Student in-app modal state (no window.confirm which is blocked in iframes)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Class management modal states
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassGrade, setNewClassGrade] = useState<number>(5);
  const [newClassYear, setNewClassYear] = useState<string>('2025 - 2026');
  const [classError, setClassError] = useState<string>('');
  const [isManageClassesModalOpen, setIsManageClassesModalOpen] = useState<boolean>(false);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);

  // CSV Import modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>(
    'Nguyễn Hoàng Nam,HS011,5/9,0912333444\nLê Thị Thảo,HS012,5/9,0912333555\nTrần Quang Khải,HS013,5/9,0912333666'
  );
  const [csvResult, setCsvResult] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filtered = students.filter((s) => {
    if (selectedClass !== 'all' && s.className !== selectedClass) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.fullName.toLowerCase().includes(q) || s.studentCode.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFullName('');
    setStudentCode(storageService.generateNextStudentCode());
    setFormClass(selectedClass !== 'all' ? selectedClass : (classes[0]?.name || '5/9'));
    setParentPhone('');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (std: Student) => {
    setEditingStudent(std);
    setFullName(std.fullName);
    setStudentCode(std.studentCode);
    setFormClass(std.className);
    setParentPhone(std.parentPhone || '');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập Họ và tên học sinh');
      return;
    }
    if (!studentCode.trim()) {
      setErrorMessage('Vui lòng nhập Mã học sinh');
      return;
    }

    const cls = classes.find((c) => c.name === formClass);
    const newOrUpdated: Student = {
      id: editingStudent ? editingStudent.id : `std-${Date.now()}`,
      fullName: fullName.trim(),
      studentCode: studentCode.trim().toUpperCase(),
      classId: cls ? cls.id : `cls-${formClass}`,
      className: formClass,
      gender: editingStudent ? editingStudent.gender : 'nam',
      parentPhone: parentPhone.trim() || undefined,
      status: editingStudent ? editingStudent.status : 'active',
      createdAt: editingStudent ? editingStudent.createdAt : new Date().toISOString()
    };

    const res = storageService.saveStudent(newOrUpdated);
    if (!res.success) {
      setErrorMessage(res.message || 'Lỗi khi lưu học sinh');
      return;
    }

    setIsModalOpen(false);
    onRefresh();
    showToast(editingStudent ? `Đã cập nhật thông tin học sinh ${fullName}!` : `Đã thêm học sinh ${fullName} vào lớp ${formClass}!`);
  };

  // Perform Student Deletion (Direct, reliable, in-app modal confirmed)
  const handleConfirmDeleteStudent = () => {
    if (!studentToDelete) return;
    const name = studentToDelete.fullName;
    storageService.deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
    onRefresh();
    showToast(`Đã xóa học sinh "${name}" khỏi danh sách thành công!`);
  };

  const handleToggleLock = (id: string, name: string, isCurrentlyLocked: boolean) => {
    storageService.toggleLockStudent(id);
    onRefresh();
    showToast(isCurrentlyLocked ? `Đã mở khóa tài khoản cho ${name}` : `Đã khóa tài khoản của ${name}`);
  };

  const handleRegenerateCode = (std: Student) => {
    const nextCode = storageService.generateNextStudentCode();
    storageService.saveStudent({ ...std, studentCode: nextCode });
    onRefresh();
    showToast(`Đã cấp mã mới: ${nextCode} cho học sinh ${std.fullName}`);
  };

  // Handle Add Class
  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClassError('');
    if (!newClassName.trim()) {
      setClassError('Vui lòng nhập tên lớp (ví dụ: 5/9, 5/2, 4A)');
      return;
    }

    const res = storageService.addClass({
      name: newClassName.trim(),
      grade: newClassGrade,
      academicYear: newClassYear.trim()
    });

    if (!res.success) {
      setClassError(res.message || 'Lỗi khi tạo lớp');
      return;
    }

    setNewClassName('');
    setIsAddClassModalOpen(false);
    onRefresh();
    if (res.newClass) {
      setSelectedClass(res.newClass.name);
      setFormClass(res.newClass.name);
    }
    showToast(`Đã tạo lớp học mới "${newClassName.trim()}" thành công!`);
  };

  // Handle Delete Class
  const handleConfirmDeleteClass = () => {
    if (!classToDelete) return;
    const name = classToDelete.name;
    const res = storageService.deleteClass(classToDelete.id);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setClassToDelete(null);
    if (selectedClass === name) setSelectedClass('all');
    onRefresh();
    showToast(`Đã xóa lớp "${name}" thành công!`);
  };

  const handleImportCsv = () => {
    setCsvResult(null);
    try {
      const lines = csvText.trim().split('\n');
      const toAdd: Omit<Student, 'id' | 'createdAt'>[] = [];

      lines.forEach((line) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          const [name, code, clsName, phone] = parts;
          const targetClass = clsName || classes[0]?.name || '5/9';
          const matchedCls = classes.find((c) => c.name === targetClass);

          toAdd.push({
            fullName: name,
            studentCode: code.toUpperCase(),
            classId: matchedCls ? matchedCls.id : `cls-${targetClass}`,
            className: targetClass,
            gender: 'nam',
            parentPhone: phone || undefined,
            status: 'active'
          });
        }
      });

      if (toAdd.length === 0) {
        setCsvResult('Không tìm thấy dòng dữ liệu hợp lệ.');
        return;
      }

      const { added, skipped } = storageService.importStudents(toAdd);
      setCsvResult(`Thành công! Đã thêm ${added} học sinh mới (Bỏ qua ${skipped} vì trùng mã học sinh).`);
      onRefresh();
    } catch (e: any) {
      setCsvResult(`Lỗi phân tích file: ${e.message}`);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Actions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Danh Sách & Hồ Sơ Học Sinh
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý thông tin cá nhân, mã học sinh đăng nhập, phân lớp và phân quyền tài khoản
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nhập Excel / CSV</span>
          </button>

          <button
            id="btn-add-student"
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ THÊM HỌC SINH</span>
          </button>
        </div>
      </div>

      {/* Filter and Class Management Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Lọc theo lớp:</span>
          
          <button
            onClick={() => setSelectedClass('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedClass === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({students.length})
          </button>

          {classes.map((c) => {
            const count = students.filter((s) => s.className === c.name || s.classId === c.id).length;
            const isSel = selectedClass === c.name;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClass(c.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Lớp {c.name}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${isSel ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}

          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => {
                setNewClassName('');
                setClassError('');
                setIsAddClassModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Thêm lớp học mới vào hệ thống"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Thêm lớp</span>
            </button>

            <button
              onClick={() => setIsManageClassesModalOpen(true)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Quản lý danh sách lớp học"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, mã HS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                <th className="py-3.5 px-4">STT</th>
                <th className="py-3.5 px-4">Mã học sinh</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-4">SĐT Phụ huynh</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chưa có học sinh nào trong danh mục này. Hãy bấm <strong>+ Thêm học sinh</strong> để tạo mới!
                  </td>
                </tr>
              ) : (
                filtered.map((std, idx) => {
                  const isLocked = std.status === 'locked';

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200 text-xs">
                            {std.studentCode}
                          </span>
                          <button
                            onClick={() => handleCopyCode(std.studentCode)}
                            className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                            title="Sao chép mã"
                          >
                            {copiedCode === std.studentCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {std.fullName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                          Lớp {std.className}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                        {std.parentPhone || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isLocked
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isLocked ? '🔒 Đã khóa' : '🟢 Hoạt động'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Cấp lại mã nếu quên */}
                          <button
                            onClick={() => handleRegenerateCode(std)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Cấp lại mã học sinh mới"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* SỬA */}
                          <button
                            onClick={() => handleOpenEditModal(std)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* KHÓA / MỞ KHÓA */}
                          <button
                            onClick={() => handleToggleLock(std.id, std.fullName, isLocked)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isLocked
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                            title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>

                          {/* XÓA HỌC SINH (Opens in-app confirmation modal) */}
                          <button
                            id={`btn-delete-student-${std.id}`}
                            onClick={() => setStudentToDelete(std)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa học sinh này"
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

      {/* CONFIRM DELETE STUDENT MODAL (In-app, avoids browser window.confirm blocked in iframes) */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  Xác nhận xóa học sinh
                </h3>
                <p className="text-xs text-slate-500">Hành động này sẽ xóa dữ liệu học sinh</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 my-4 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Họ và tên:</span>
                <span className="font-bold text-slate-800">{studentToDelete.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã học sinh:</span>
                <span className="font-mono font-bold text-indigo-600">{studentToDelete.studentCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lớp học:</span>
                <span className="font-bold text-slate-800">Lớp {studentToDelete.className}</span>
              </div>
            </div>

            <p className="text-xs text-rose-600 font-medium mb-5">
              ⚠️ Lưu ý: Các kết quả nộp bài của học sinh này cũng sẽ được gỡ bỏ để đảm bảo tính đồng bộ của báo cáo.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-confirm-delete-student"
                onClick={handleConfirmDeleteStudent}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>XÁC NHẬN XÓA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM LỚP HỌC MỚI */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-600" />
                <span>Thêm Lớp Học Mới</span>
              </h3>
              <button
                onClick={() => setIsAddClassModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClassSubmit} className="space-y-4 text-xs sm:text-sm">
              {classError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{classError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên lớp học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 5/9, 5/1, 4A, 3/2"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:border-indigo-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold bg-white outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((g) => (
                      <option key={g} value={g}>
                        Khối {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Niên khóa</label>
                  <input
                    type="text"
                    value={newClassYear}
                    onChange={(e) => setNewClassYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-200"
                >
                  Tạo lớp học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL QUẢN LÝ DANH SÁCH LỚP HỌC */}
      {isManageClassesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-600" />
                <span>Quản Lý Danh Sách Lớp Học</span>
              </h3>
              <button
                onClick={() => setIsManageClassesModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {classes.map((cls) => {
                const count = students.filter((s) => s.className === cls.name || s.classId === cls.id).length;

                return (
                  <div
                    key={cls.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                        <span>Lớp {cls.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                          Khối {cls.grade}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Niên khóa: {cls.academicYear} • <strong>{count} học sinh</strong>
                      </div>
                    </div>

                    <div>
                      {count === 0 ? (
                        <button
                          onClick={() => setClassToDelete(cls)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa lớp học này (chưa có học sinh)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-lg">
                          Có học sinh
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsManageClassesModalOpen(false);
                  setIsAddClassModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Thêm lớp mới</span>
              </button>

              <button
                type="button"
                onClick={() => setIsManageClassesModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE CLASS MODAL */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-rose-100">
            <h4 className="font-bold text-slate-800 text-base mb-2">
              Xóa lớp {classToDelete.name}?
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Lớp học này hiện không có học sinh nào. Bạn có chắc chắn muốn xóa khỏi danh sách lớp?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClass}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT STUDENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <span>{editingStudent ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs sm:text-sm">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="HS001"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:border-indigo-500 outline-none uppercase"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Dùng để đăng nhập làm bài</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lớp học <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white focus:border-indigo-500 outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số điện thoại phụ huynh</label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 0912345678"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-200"
                >
                  {editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Nhập danh sách học sinh (Excel / CSV)</span>
              </h3>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-2">
              Dán dữ liệu theo định dạng: <code>Họ và tên, Mã học sinh, Lớp, Số điện thoại</code> (mỗi học sinh một dòng)
            </p>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 focus:border-emerald-500 outline-none mb-3"
            />

            {csvResult && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
                {csvResult}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
              <button
                onClick={handleImportCsv}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-200"
              >
                Tiến hành nạp dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
