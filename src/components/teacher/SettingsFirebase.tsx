import React, { useState } from 'react';
import { SystemSettings, FirebaseConfig, SchoolClass } from '../../types';
import { storageService } from '../../services/storage';
import { testFirebaseConnection } from '../../services/firebase';
import {
  Settings,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  RotateCcw,
  Sparkles,
  Server,
  Key,
  School,
  User,
  Mail,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface SettingsFirebaseProps {
  onRefresh: () => void;
}

export const SettingsFirebase: React.FC<SettingsFirebaseProps> = ({ onRefresh }) => {
  const [settings, setSettings] = useState<SystemSettings>(() => storageService.getSettings());
  const [classes, setClasses] = useState<SchoolClass[]>(() => storageService.getClasses());
  const [students, setStudents] = useState(() => storageService.getStudents());

  // School and Teacher Profile state
  const [schoolName, setSchoolName] = useState(settings.schoolName || 'Trường Tiểu Học Chu Văn An');
  const [teacherName, setTeacherName] = useState(settings.teacherName || 'Thầy Huy');
  const [teacherEmail, setTeacherEmail] = useState(settings.teacherEmail || 'dhhuy25@gmail.com');

  // New Class state
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<number>(5);
  const [newClassYear, setNewClassYear] = useState('2025 - 2026');
  const [classError, setClassError] = useState('');

  // Delete Class Confirm modal
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);

  // Reset confirmation modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>(
    () => storageService.getFirebaseConfig() || {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    }
  );

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: SystemSettings = {
      ...settings,
      schoolName: schoolName.trim() || 'Trường Tiểu Học Chu Văn An',
      teacherName: teacherName.trim() || 'Thầy Huy',
      teacherEmail: teacherEmail.trim()
    };
    storageService.saveSettings(updatedSettings);
    storageService.saveFirebaseConfig(firebaseConfig);
    setSettings(updatedSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onRefresh();
  };

  // Add new class
  const handleAddNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    setClassError('');
    if (!newClassName.trim()) {
      setClassError('Vui lòng nhập tên lớp (ví dụ: 5/9, 5/1, 4A)');
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
    setClasses(storageService.getClasses());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onRefresh();
  };

  // Delete class
  const handleConfirmDeleteClass = () => {
    if (!classToDelete) return;
    const res = storageService.deleteClass(classToDelete.id);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setClassToDelete(null);
    setClasses(storageService.getClasses());
    onRefresh();
  };

  // Test Firebase connection
  const handleTestFirebase = async () => {
    setIsTesting(true);
    setTestResult(null);

    const res = await testFirebaseConnection(firebaseConfig);
    setIsTesting(false);
    setTestResult(res);
  };

  // Reset to initial mock primary data (in-app modal confirmed)
  const handlePerformReset = () => {
    storageService.resetToInitialMock();
    const freshSettings = storageService.getSettings();
    setSettings(freshSettings);
    setSchoolName(freshSettings.schoolName);
    setTeacherName(freshSettings.teacherName);
    setTeacherEmail(freshSettings.teacherEmail);
    setClasses(storageService.getClasses());
    setStudents(storageService.getStudents());
    setIsResetConfirmOpen(false);
    onRefresh();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Cài Đặt Hệ Thống & Thông Tin Lớp Học
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tùy chỉnh thông tin trường, họ tên giáo viên, quản lý danh sách lớp và cấu hình lưu trữ
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã lưu thành công!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. THÔNG TIN TRƯỜNG & GIÁO VIÊN (Yêu cầu người dùng tự nhập) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <School className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-800 text-base">
              Thông Tin Trường Học & Giáo Viên Tự Nhập
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            Thông tin này sẽ được hiển thị trên Tiêu đề Cổng giáo viên, trang làm bài của học sinh và phiếu kết quả/báo cáo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tên trường học:</span>
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Ví dụ: Trường Tiểu Học Chu Văn An, Trường Tiểu Học Kim Đồng..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:border-indigo-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Họ và tên giáo viên:</span>
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Ví dụ: Thầy Huy, Cô Mai Linh..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:border-indigo-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>Email giáo viên:</span>
              </label>
              <input
                type="email"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                placeholder="dhhuy25@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:border-indigo-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* 2. QUẢN LÝ DANH SÁCH LỚP HỌC (Thêm tên lớp cho giáo viên tự nhập) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-800 text-base">
                Quản Lý Danh Sách Lớp Học
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              {classes.length} Lớp học
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Thầy/Cô có thể tự nhập thêm lớp mới để phân bổ học sinh và giao bài tập theo đúng lớp mình giảng dạy:
          </p>

          {/* Form thêm lớp mới */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />
              <span>Thêm lớp học mới</span>
            </div>

            {classError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{classError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Tên lớp (ví dụ: 5/9, 5/1, 4A, 3/2)..."
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs sm:text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs sm:text-sm outline-none"
                >
                  {[1, 2, 3, 4, 5].map((g) => (
                    <option key={g} value={g}>
                      Khối {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddNewClass}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Thêm lớp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bảng danh sách lớp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {classes.map((cls) => {
              const count = students.filter(
                (s) => s.className === cls.name || s.classId === cls.id
              ).length;

              return (
                <div
                  key={cls.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <div className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <span>Lớp {cls.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                        Khối {cls.grade}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <strong>{count} học sinh</strong> • {cls.academicYear}
                    </div>
                  </div>

                  <div>
                    {count === 0 ? (
                      <button
                        type="button"
                        onClick={() => setClassToDelete(cls)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa lớp học này (chưa có học sinh)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 bg-slate-100 rounded-md">
                        Đang dùng
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. CÀI ĐẶT ĐÁNH GIÁ & XẾP LOẠI */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-800 text-base">
              Quy Tắc Đánh Giá & Hiển Thị Học Sinh
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer">
              <div>
                <div className="font-bold text-slate-800">Hiển thị Bảng xếp hạng cho học sinh</div>
                <div className="text-xs text-slate-500">
                  Khi bật, học sinh sẽ thấy vị trí xếp hạng thi đua trong lớp sau khi nộp bài
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showLeaderboardToStudents ?? settings.allowStudentViewLeaderboard}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    showLeaderboardToStudents: e.target.checked,
                    allowStudentViewLeaderboard: e.target.checked
                  })
                }
                className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer">
              <div>
                <div className="font-bold text-slate-800">Tự động đồng bộ nhiều tab (Broadcast Channel)</div>
                <div className="text-xs text-slate-500">
                  Cập nhật Dashboard giáo viên ngay khi học sinh nộp bài ở tab hoặc thiết bị khác
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.syncEnabled ?? true}
                onChange={(e) => setSettings({ ...settings, syncEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngưỡng điểm "Hoàn thành tốt" (sao vàng)
              </label>
              <input
                type="number"
                step="0.5"
                min="5"
                max="10"
                value={settings.gradeThresholds?.excellentMin || 8.0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSettings({
                    ...settings,
                    excellentThreshold: val,
                    gradeThresholds: { ...settings.gradeThresholds, excellentMin: val }
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
              />
              <span className="text-[11px] text-slate-400">Mặc định: 8.0 điểm trở lên</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngưỡng điểm "Hoàn thành"
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="8"
                value={settings.gradeThresholds?.needEffortMax || 4.9}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSettings({
                    ...settings,
                    completedThreshold: val,
                    gradeThresholds: { ...settings.gradeThresholds, needEffortMax: val }
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
              />
              <span className="text-[11px] text-slate-400">Dưới ngưỡng này xếp loại "Cần cố gắng"</span>
            </div>
          </div>
        </div>

        {/* 4. CẤU HÌNH FIREBASE CLOUD DATABASE */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-800 text-base">
                Cấu Hình Firebase Cloud Database
              </h3>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono">
              Firestore & Auth
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Ứng dụng hoạt động độc lập lưu trữ bền bỉ. Thầy cô có thể điền thông tin dự án Firebase của trường nếu cần đồng bộ đám mây:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">API Key</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={firebaseConfig.apiKey}
                onChange={(e) => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Project ID</label>
              <input
                type="text"
                placeholder="quanly-hocsinh-tieu-hoc"
                value={firebaseConfig.projectId}
                onChange={(e) => setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Auth Domain</label>
              <input
                type="text"
                placeholder="app-id.firebaseapp.com"
                value={firebaseConfig.authDomain}
                onChange={(e) => setFirebaseConfig({ ...firebaseConfig, authDomain: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">App ID</label>
              <input
                type="text"
                placeholder="1:123456:web:abcd..."
                value={firebaseConfig.appId}
                onChange={(e) => setFirebaseConfig({ ...firebaseConfig, appId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTestFirebase}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối Firebase'}</span>
            </button>

            {testResult && (
              <span
                className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{testResult.message}</span>
              </span>
            )}
          </div>
        </div>

        {/* Buttons save and reset */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Khôi phục dữ liệu mẫu Tiểu học ban đầu</span>
          </button>

          <button
            type="submit"
            id="btn-save-all-settings"
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>LƯU TẤT CẢ CÀI ĐẶT</span>
          </button>
        </div>
      </form>

      {/* CONFIRM DELETE CLASS MODAL */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <h4 className="font-bold text-slate-800 text-base mb-2">
              Xóa lớp {classToDelete.name}?
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Lớp này hiện không có học sinh. Thầy/Cô có chắc chắn muốn xóa khỏi danh sách lớp học?
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

      {/* CONFIRM RESET DATA MODAL (In-app, avoids window.confirm blocked in iframes) */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  Khôi phục dữ liệu mẫu
                </h3>
                <p className="text-xs text-slate-500">Đặt lại dữ liệu chuẩn của trường tiểu học</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Thầy/Cô có chắc chắn muốn khôi phục toàn bộ dữ liệu mẫu chuẩn (Lớp 5/9, danh sách học sinh và các bộ bài tập Toán, Tiếng Việt, Khoa học mẫu)?
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handlePerformReset}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-200"
              >
                Đồng ý khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
