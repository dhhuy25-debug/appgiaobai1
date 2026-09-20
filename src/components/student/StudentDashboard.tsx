import React, { useState, useEffect } from 'react';
import { Student, Assignment, Submission, NotificationItem } from '../../types';
import { storageService } from '../../services/storage';
import { StudentAssignments } from './StudentAssignments';
import { StudentResults } from './StudentResults';
import { StudentAccount } from './StudentAccount';
import { StudentQuizTaking } from './StudentQuizTaking';
import {
  Home,
  BookOpen,
  BarChart2,
  User,
  LogOut,
  Bell,
  CheckCircle2,
  Clock,
  Trophy,
  AlertCircle,
  Calendar,
  Sparkles,
  ChevronRight,
  School
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  onLogout: () => void;
  directJoinCode?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onLogout,
  directJoinCode
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'assignments' | 'results' | 'account'>('home');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeQuizAssignment, setActiveQuizAssignment] = useState<Assignment | null>(null);

  // Load data & subscribe to real-time events
  const loadData = () => {
    const asgList = storageService.getAssignmentsForStudent(student);
    const subList = storageService.getSubmissions();
    const notifs = storageService.getNotificationsForStudent(student);
    setAssignments(asgList);
    setSubmissions(subList);
    setNotifications(notifs);

    // If directJoinCode was provided, check if it matches an assignment and start
    if (directJoinCode && !activeQuizAssignment) {
      const match = asgList.find((a) => a.code.toUpperCase() === directJoinCode.toUpperCase());
      if (match) {
        setActiveQuizAssignment(match);
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = storageService.subscribe((event) => {
      loadData();
    });
    return () => unsubscribe();
  }, [student, directJoinCode]);

  // Statistics calculation for the 4 stat cards
  const studentSubs = submissions.filter(
    (s) => s.studentId === student.id && (s.status === 'submitted' || s.status === 'late')
  );
  const completedCount = studentSubs.length;
  const assignedCount = assignments.length;

  const now = new Date();
  const dueSoonCount = assignments.filter((a) => {
    const isCompleted = studentSubs.some((s) => s.assignmentId === a.id);
    if (isCompleted || !a.dueDate) return false;
    const dueTime = new Date(a.dueDate).getTime();
    const diffHours = (dueTime - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48; // within 48h
  }).length;

  const avgScore =
    completedCount > 0
      ? Math.round(
          (studentSubs.reduce((sum, s) => sum + (s.score ?? 0), 0) / completedCount) * 10
        ) / 10
      : 0;

  // Handler for assignment status
  const getAssignmentStatus = (asg: Assignment) => {
    const sub = submissions.find((s) => s.assignmentId === asg.id && s.studentId === student.id);
    const isOverdue = asg.dueDate ? now > new Date(asg.dueDate) : false;

    if (sub && (sub.status === 'submitted' || sub.status === 'late')) {
      if ((sub.score ?? 0) >= 8) {
        return { label: '⭐ Hoàn thành tốt', color: 'bg-amber-100 text-amber-900 border-amber-300', btnText: 'XEM KẾT QUẢ' };
      }
      return { label: '🟢 Đã hoàn thành', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', btnText: 'XEM KẾT QUẢ' };
    }
    if (sub && sub.status === 'in_progress') {
      return { label: '🟡 Đang làm', color: 'bg-yellow-100 text-yellow-900 border-yellow-300', btnText: 'TIẾP TỤC' };
    }
    if (isOverdue) {
      return { label: '🔴 Quá hạn', color: 'bg-rose-100 text-rose-900 border-rose-300', btnText: 'BẮT ĐẦU' };
    }
    return { label: '🔵 Chưa làm', color: 'bg-sky-100 text-sky-900 border-sky-300', btnText: 'BẮT ĐẦU' };
  };

  // If student is actively taking a quiz
  if (activeQuizAssignment) {
    return (
      <StudentQuizTaking
        assignment={activeQuizAssignment}
        student={student}
        onFinish={() => {
          loadData();
          setActiveQuizAssignment(null);
          setActiveTab('results');
        }}
        onBackToPortal={() => {
          loadData();
          setActiveQuizAssignment(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Be_Vietnam_Pro',sans-serif]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-200">
              🎒
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                  Cổng Học Sinh
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                  Lớp {student.className}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Hệ thống làm bài tập & ôn luyện kiến thức tiểu học
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student avatar and name */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
              <span className="text-lg">👋</span>
              <div className="text-left">
                <div className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                  {student.fullName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Mã: {student.studentCode}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-2 border-t border-slate-100 overflow-x-auto py-2">
          {[
            { id: 'home', label: '🏠 Trang chủ' },
            { id: 'assignments', label: '📚 Bài tập' },
            { id: 'results', label: '📊 Kết quả' },
            { id: 'account', label: '👤 Tài khoản' }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'home' && (
          <>
            {/* Greeting Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200/40 relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Chúc em một ngày học tập thật tốt!</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    👋 Xin chào, {student.fullName}
                  </h2>
                  <p className="text-emerald-100 text-sm mt-1">
                    Lớp: <strong>{student.className}</strong> • Mã học sinh: <strong>{student.studentCode}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('assignments')}
                  className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-white text-emerald-800 font-black text-sm shadow-md hover:bg-emerald-50 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>LÀM BÀI TẬP NGAY</span>
                  <span>➔</span>
                </button>
              </div>
            </div>

            {/* Notification Alert Banner if any unread notification */}
            {notifications.length > 0 && (
              <div className="space-y-2">
                {notifications.slice(0, 2).map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm sm:text-base">
                          🔔 {notif.title}
                        </div>
                        <div className="text-xs text-amber-800/90 mt-0.5">
                          {notif.message}
                        </div>
                      </div>
                    </div>

                    {notif.assignmentId && (
                      <button
                        onClick={() => {
                          const asg = assignments.find((a) => a.id === notif.assignmentId);
                          if (asg) setActiveQuizAssignment(asg);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-all"
                      >
                        LÀM BÀI
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 4 STAT CARDS (Yêu cầu Phần III) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Thẻ 1: 📚 Bài được giao */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">📚 Bài được giao</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-black">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-800">
                  {assignedCount}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Đã giao cho lớp {student.className}
                </div>
              </div>

              {/* Thẻ 2: ✅ Đã hoàn thành */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700">✅ Đã hoàn thành</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-black">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-600">
                  {completedCount}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">
                  Đã nộp bài cho giáo viên
                </div>
              </div>

              {/* Thẻ 3: ⏰ Sắp hết hạn */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-700">⏰ Sắp hết hạn</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-black">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-amber-600">
                  {dueSoonCount}
                </div>
                <div className="text-[11px] text-amber-600 mt-1">
                  Hạn nộp trong vòng 48h
                </div>
              </div>

              {/* Thẻ 4: 🏆 Điểm trung bình */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-700">🏆 Điểm trung bình</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-black">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-purple-600">
                  {avgScore} <span className="text-xs font-bold text-slate-400">/ 10</span>
                </div>
                <div className="text-[11px] text-purple-600 mt-1">
                  Xếp loại tích cực
                </div>
              </div>
            </div>

            {/* BÀI TẬP CỦA EM (Phần III) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">BÀI TẬP CỦA EM</h3>
                  <p className="text-xs text-slate-500">
                    Các bài tập được giáo viên giao cho lớp {student.className}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem tất cả ({assignments.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.slice(0, 4).map((asg) => {
                  const statusObj = getAssignmentStatus(asg);

                  return (
                    <div
                      key={asg.id}
                      className="p-5 rounded-2xl border-2 border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-black uppercase">
                            {asg.subject}
                          </span>
                          <span
                            className={`px-3 py-0.5 rounded-full text-xs font-bold border ${statusObj.color}`}
                          >
                            {statusObj.label}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-800 text-base mb-2 line-clamp-1">
                          {asg.title}
                        </h4>

                        <div className="space-y-1 text-xs text-slate-500 mb-4">
                          <div>Giáo viên: <strong>{asg.teacherName}</strong></div>
                          <div>Ngày giao: {asg.startDate.replace('T', ' ')}</div>
                          <div className="text-rose-600 font-semibold">
                            Hạn nộp: {asg.dueDate.replace('T', ' ')}
                          </div>
                          <div>Số câu: <strong>{asg.questions.length} câu</strong></div>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveQuizAssignment(asg)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                          statusObj.btnText === 'XEM KẾT QUẢ'
                            ? 'bg-slate-800 hover:bg-slate-900 text-white'
                            : statusObj.btnText === 'TIẾP TỤC'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <span>{statusObj.btnText}</span>
                        <span>➔</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'assignments' && (
          <StudentAssignments
            assignments={assignments}
            submissions={submissions}
            student={student}
            onStartQuiz={(asg) => setActiveQuizAssignment(asg)}
          />
        )}

        {activeTab === 'results' && (
          <StudentResults
            submissions={submissions}
            student={student}
            assignments={assignments}
            onReviewAssignment={(asg) => setActiveQuizAssignment(asg)}
          />
        )}

        {activeTab === 'account' && (
          <StudentAccount student={student} onLogout={onLogout} />
        )}
      </main>
    </div>
  );
};
