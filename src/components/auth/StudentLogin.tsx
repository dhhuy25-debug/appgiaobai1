import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storage';
import { SchoolClass, Student } from '../../types';
import { ArrowLeft, User, KeyRound, School, Check, AlertCircle, Sparkles } from 'lucide-react';

interface StudentLoginProps {
  onSuccess: (student: Student) => void;
  onBack: () => void;
  directJoinCode?: string;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onSuccess, onBack, directJoinCode }) => {
  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [selectedClass, setSelectedClass] = useState('5/9');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  useEffect(() => {
    const clsList = storageService.getClasses();
    setClasses(clsList);
    if (clsList.length > 0 && !selectedClass) {
      setSelectedClass(clsList[0].name);
    }
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Em vui lòng nhập Họ và tên của mình nhé!');
      return;
    }
    if (!studentCode.trim()) {
      setErrorMessage('Em vui lòng nhập Mã học sinh (ví dụ: HS001)!');
      return;
    }
    if (!selectedClass) {
      setErrorMessage('Em hãy chọn lớp của mình!');
      return;
    }

    const student = storageService.findStudentByLogin(fullName, studentCode, selectedClass);
    if (!student) {
      setErrorMessage('Không tìm thấy học sinh với thông tin trên. Em kiểm tra lại Họ tên, Mã học sinh (ví dụ: HS001) và Lớp nhé!');
      return;
    }

    if (student.status === 'locked') {
      setErrorMessage('Tài khoản này tạm thời đang bị khóa. Em hãy liên hệ thầy cô chủ nhiệm để mở lại nhé!');
      return;
    }

    // Save session
    storageService.setStudentSession(student, rememberDevice);
    onSuccess(student);
  };

  const handleFillDemo = (name: string, code: string, cls: string) => {
    setFullName(name);
    setStudentCode(code);
    setSelectedClass(cls);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50/50 to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Back button */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Đổi vai trò</span>
        </button>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Cổng Học Sinh
        </span>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-teal-100/70 border border-slate-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-200 text-3xl">
            🎒
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            ĐĂNG NHẬP HỌC SINH
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Chào mừng em! Nhập thông tin để vào làm bài tập nhé
          </p>
        </div>

        {directJoinCode && (
          <div className="mb-5 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800">
            <span className="font-bold">Mã bài tập chuẩn bị mở:</span>{' '}
            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-300">
              {directJoinCode}
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Họ và tên</span>
            </label>
            <input
              id="student-fullname-input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full px-4 py-3 text-base rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Mã học sinh */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Mã học sinh</span>
            </label>
            <input
              id="student-code-input"
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
              placeholder="Ví dụ: HS001"
              className="w-full px-4 py-3 text-base uppercase rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400 font-bold tracking-wider"
            />
          </div>

          {/* Mã lớp */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Mã lớp</span>
            </label>
            <select
              id="student-class-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 text-base rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-semibold bg-white cursor-pointer"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  Lớp {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ghi nhớ thiết bị */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                id="student-remember-checkbox"
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-5 h-5 rounded-lg text-emerald-600 border-2 border-slate-300 focus:ring-emerald-400 cursor-pointer accent-emerald-600"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-600">
                Ghi nhớ thiết bị này (lần sau không cần nhập lại)
              </span>
            </label>
          </div>

          {/* Nút Vào lớp học */}
          <button
            id="btn-student-submit"
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>VÀO LỚP HỌC</span>
            <span className="text-xl">➔</span>
          </button>
        </form>

        {/* Quick Demo Pickers */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="text-slate-400 mb-2 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Thử nhanh với tài khoản học sinh mẫu:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('Nguyễn Văn An', 'HS001', '5/9')}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold">Nguyễn Văn An</div>
              <div className="text-[11px] text-emerald-600">HS001 • Lớp 5/9</div>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('Trần Thị Bình', 'HS002', '5/9')}
              className="p-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl border border-teal-200 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold">Trần Thị Bình</div>
              <div className="text-[11px] text-teal-600">HS002 • Lớp 5/9</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
