import React from 'react';
import { GraduationCap, Users, ShieldCheck, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: 'teacher' | 'student') => void;
  directJoinCode?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole, directJoinCode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50/40 to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Decorative top badge */}
      <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm shadow-sm border border-indigo-200/60">
        <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
        <span>Hệ thống Học tập & Quản lý Học sinh Tiểu học</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-indigo-100/70 border border-slate-100 overflow-hidden text-center p-8 transition-all">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-6">
          <BookOpen className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
          TRỢ LÝ QUẢN LÝ HỌC SINH
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mb-8">
          Vui lòng chọn vai trò để tiếp tục truy cập cổng tương ứng
        </p>

        {directJoinCode && (
          <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm text-left flex items-start gap-2.5">
            <span className="text-lg">📌</span>
            <div>
              <p className="font-semibold">Bạn đang có link làm bài tập:</p>
              <p className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-amber-300 inline-block mt-1">
                {directJoinCode}
              </p>
              <p className="text-xs text-amber-700 mt-1">Chọn "Học sinh vào làm bài" để đăng nhập và tự động mở bài tập.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Nút Đăng nhập Giáo viên */}
          <button
            id="btn-role-teacher"
            onClick={() => onSelectRole('teacher')}
            className="w-full group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-lg shadow-md hover:shadow-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👨‍🏫
              </div>
              <div className="text-left">
                <div className="font-bold text-base sm:text-lg">ĐĂNG NHẬP GIÁO VIÊN</div>
                <div className="text-xs text-indigo-100 font-normal">Quản lý lớp, tạo bài, chấm điểm & báo cáo</div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
              ➔
            </div>
          </button>

          {/* Nút Học sinh Vào Làm Bài */}
          <button
            id="btn-role-student"
            onClick={() => onSelectRole('student')}
            className="w-full group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-md hover:shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👨‍🎓
              </div>
              <div className="text-left">
                <div className="font-bold text-base sm:text-lg">HỌC SINH VÀO LÀM BÀI</div>
                <div className="text-xs text-emerald-100 font-normal">Xem bài được giao, làm bài tập & xem điểm</div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
              ➔
            </div>
          </button>
        </div>

        {/* Demo Fast Info helper */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-2 text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Tài khoản thử nghiệm có sẵn:</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl text-left font-mono text-[11px] text-slate-600 border border-slate-200/70 space-y-1">
            <div>• <strong className="text-indigo-600">Giáo viên:</strong> Thầy Huy (truy cập ngay)</div>
            <div>• <strong className="text-emerald-600">Học sinh:</strong> Nguyễn Văn An | Mã: <strong>HS001</strong> | Lớp: <strong>5/9</strong></div>
          </div>
        </div>
      </div>

      <footer className="mt-6 text-center text-xs text-slate-400">
        © 2026 Nền tảng Giáo Dục Số Tiểu Học • Thiết kế thân thiện cho học sinh & giáo viên
      </footer>
    </div>
  );
};
