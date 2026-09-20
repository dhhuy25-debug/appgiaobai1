import React from 'react';
import { Student } from '../../types';
import { User, ShieldCheck, School, Hash, LogOut, Smartphone, CheckCircle, Info } from 'lucide-react';

interface StudentAccountProps {
  student: Student;
  onLogout: () => void;
}

export const StudentAccount: React.FC<StudentAccountProps> = ({ student, onLogout }) => {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200 text-4xl">
          👨‍🎓
        </div>

        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {student.fullName}
        </h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 mt-2">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Học sinh chính thức • Lớp {student.className}</span>
        </div>

        {/* Profile Card Fields */}
        <div className="mt-8 space-y-3 text-left">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-600" /> Mã học sinh
            </span>
            <span className="text-sm font-black font-mono text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {student.studentCode}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-600" /> Lớp học
            </span>
            <span className="text-sm font-bold text-slate-800">
              Lớp {student.className}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" /> Ghi nhớ thiết bị
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              Đang kích hoạt
            </span>
          </div>
        </div>

        {/* Friendly guidance for primary school students */}
        <div className="mt-6 p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-left text-xs text-amber-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <Info className="w-4 h-4 text-amber-600" />
            <span>Lời dặn dò cho học sinh:</span>
          </div>
          <p>
            • Hãy ghi nhớ Mã học sinh <strong>{student.studentCode}</strong> để đăng nhập nhanh khi dùng máy tính khác nhé.
          </p>
          <p>
            • Nếu quên mã hoặc gặp sự cố, em hãy báo ngay cho thầy cô chủ nhiệm để được hỗ trợ.
          </p>
        </div>

        {/* Logout Button */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full py-3.5 px-6 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-sm border border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ĐĂNG XUẤT KHỎI THIẾT BỊ NÀY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
