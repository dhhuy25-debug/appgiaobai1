import React, { useState } from 'react';
import { storageService } from '../../services/storage';
import { ArrowLeft, Lock, Mail, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

interface TeacherLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const TeacherLogin: React.FC<TeacherLoginProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('dhhuy25@gmail.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Teacher authentication
    if (!email.trim()) {
      setError('Vui lòng nhập email giáo viên!');
      return;
    }
    // Allow demo entry
    storageService.setTeacherSession(true);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Đổi vai trò</span>
        </button>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
          Cổng Giáo Viên
        </span>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-indigo-100/70 border border-slate-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-200 text-3xl">
            👨‍🏫
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            ĐĂNG NHẬP GIÁO VIÊN
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Hệ thống quản lý học sinh, đề thi & phân tích kết quả
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>Email giáo viên</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="giaovien@truong.edu.vn"
              className="w-full px-4 py-3 text-base rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Mật khẩu</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-base rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
            />
          </div>

          <button
            id="btn-teacher-login-submit"
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>VÀO BÀN LÀM VIỆC GIÁO VIÊN</span>
            <span>➔</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 text-center">
          <p className="flex items-center justify-center gap-1.5 text-indigo-600 font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Mặc định: Thầy Huy</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Chỉ dành cho cán bộ giáo viên chủ nhiệm và bộ môn
          </p>
        </div>
      </div>
    </div>
  );
};
