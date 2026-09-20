import React, { useState } from 'react';
import { Assignment, SchoolClass, Student, Submission } from '../../types';
import { AssignmentDetailModal } from './AssignmentDetailModal';
import {
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Search,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Flame,
  Calendar,
  Eye
} from 'lucide-react';

interface TeacherDashboardProps {
  assignments: Assignment[];
  students: Student[];
  submissions: Submission[];
  classes: SchoolClass[];
  onNavigateTab: (tab: 'dashboard' | 'students' | 'assignments' | 'reports' | 'settings') => void;
  onOpenCreateAssignment: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  assignments,
  students,
  submissions,
  classes,
  onNavigateTab,
  onOpenCreateAssignment
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDetailAssignment, setSelectedDetailAssignment] = useState<Assignment | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter based on selected class
  const filteredStudents = students.filter(
    (s) => selectedClass === 'all' || s.className === selectedClass || s.classId === selectedClass
  );
  const filteredAssignments = assignments.filter(
    (a) => selectedClass === 'all' || a.className === selectedClass || a.classId === selectedClass
  );

  const now = new Date();

  // Metrics calculation
  const totalStudents = filteredStudents.length;
  const activeAssignments = filteredAssignments.filter((a) => !a.dueDate || new Date(a.dueDate) >= now);
  const completedSubmissions = submissions.filter((s) => s.status === 'submitted' || s.status === 'late');
  const lateSubmissions = submissions.filter((s) => s.status === 'late');

  // Calculate uncompleted students on active assignments
  const pendingStudentsCount = filteredStudents.filter((std) => {
    return activeAssignments.some((asg) => {
      const sub = submissions.find((s) => s.assignmentId === asg.id && s.studentId === std.id);
      return !sub || (sub.status !== 'submitted' && sub.status !== 'late');
    });
  }).length;

  // Alerts: Cảnh báo học sinh cần quan tâm (điểm thấp < 5, nộp muộn, chưa vào làm)
  const studentsNeedingCare = filteredStudents
    .map((std) => {
      const stdSubs = submissions.filter((s) => s.studentId === std.id);
      const lowScores = stdSubs.filter((s) => s.score !== undefined && s.score < 5);
      const lateCount = stdSubs.filter((s) => s.status === 'late').length;
      const notStartedCount = activeAssignments.filter(
        (a) => !stdSubs.some((s) => s.assignmentId === a.id)
      ).length;

      const reasons: string[] = [];
      if (lowScores.length > 0) reasons.push(`${lowScores.length} bài điểm dưới 5`);
      if (lateCount > 0) reasons.push(`${lateCount} lần nộp muộn`);
      if (notStartedCount > 1) reasons.push(`Chưa làm ${notStartedCount} bài đang giao`);

      return { student: std, reasons, urgency: reasons.length };
    })
    .filter((item) => item.reasons.length > 0)
    .sort((a, b) => b.urgency - a.urgency);

  // Assignments due soon (within next 72 hours)
  const assignmentsDueSoon = filteredAssignments.filter((a) => {
    if (!a.dueDate) return false;
    const dueTime = new Date(a.dueDate).getTime();
    const diffHours = (dueTime - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 72;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-indigo-200 mb-2 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Thời gian thực • Đồng bộ dữ liệu học sinh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Tổng Quan Lớp Học & Bài Tập
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1">
            Theo dõi tiến độ làm bài, cảnh báo học sinh cần hỗ trợ và phân tích kết quả tức thời
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class filter selector */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-xs outline-none cursor-pointer hover:bg-white/20 transition-colors"
          >
            <option value="all" className="text-slate-900">
              🏫 Tất cả các lớp ({classes.length})
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.name} className="text-slate-900">
                Lớp {c.name} ({c.studentCount} HS)
              </option>
            ))}
          </select>

          <button
            onClick={onOpenCreateAssignment}
            className="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>GIAO BÀI MỚI</span>
          </button>
        </div>
      </div>

      {/* 5 KEY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Số học sinh */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Số học sinh</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800">{totalStudents}</div>
          <div className="text-[11px] text-indigo-600 mt-1 flex items-center gap-1 font-semibold">
            <span>Xem hồ sơ</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Bài đang giao */}
        <div
          onClick={() => onNavigateTab('assignments')}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Bài đang giao</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-sky-600">{activeAssignments.length}</div>
          <div className="text-[11px] text-sky-600 mt-1 font-semibold">Đang mở nộp bài</div>
        </div>

        {/* Bài đã hoàn thành */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Bài đã hoàn thành</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{completedSubmissions.length}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">Lượt nộp đã chấm</div>
        </div>

        {/* Học sinh chưa hoàn thành */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Chưa hoàn thành</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{pendingStudentsCount}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-semibold">Học sinh chưa nộp đủ</div>
        </div>

        {/* Học sinh nộp muộn */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Học sinh nộp muộn</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600">{lateSubmissions.length}</div>
          <div className="text-[11px] text-rose-700 mt-1 font-semibold">Cần nhắc nhở</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN COLUMN: DANH SÁCH BÀI TẬP VÀ TIẾN ĐỘ THỜI GIAN THỰC (Phần XII) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Tiến độ nộp bài các bài tập
                </h2>
                <p className="text-xs text-slate-400">
                  Tự động cập nhật tức thời ngay khi học sinh nộp bài
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('assignments')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả bài</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {filteredAssignments.map((asg) => {
                // Compute progress for this assignment
                const classStudents = students.filter(
                  (s) => s.classId === asg.classId || s.className === asg.className
                );
                const asgSubmissions = submissions.filter((s) => s.assignmentId === asg.id);
                const totalStudentsInClass = classStudents.length || 1;
                const submittedCount = asgSubmissions.filter(
                  (s) => s.status === 'submitted' || s.status === 'late'
                ).length;
                const lateCount = asgSubmissions.filter((s) => s.status === 'late').length;
                const notSubmittedCount = Math.max(0, totalStudentsInClass - submittedCount);
                const percent = Math.round((submittedCount / totalStudentsInClass) * 100);

                return (
                  <div
                    key={asg.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-[11px] font-black uppercase">
                            {asg.subject}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[11px] font-mono font-bold">
                            {asg.code}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            Lớp {asg.className}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-base">
                          {asg.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCopyCode(asg.code)}
                          className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Sao chép mã bài"
                        >
                          {copiedCode === asg.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Mã bài</span>
                        </button>

                        <button
                          id={`btn-view-detail-${asg.id}`}
                          onClick={() => setSelectedDetailAssignment(asg)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>XEM CHI TIẾT</span>
                        </button>
                      </div>
                    </div>

                    {/* Stats details bar */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span>
                        Sĩ số: <strong>{totalStudentsInClass} học sinh</strong>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">
                        Đã nộp: <strong>{submittedCount}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-rose-600 font-semibold">
                        Chưa nộp: <strong>{notSubmittedCount}</strong>
                      </span>
                      {lateCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 font-semibold">
                            Nộp muộn: <strong>{lateCount}</strong>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Progress Bar (Visual representation) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold text-slate-500">
                        <span>Tiến độ hoàn thành:</span>
                        <span className="text-indigo-600">{percent}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIDEBAR COLUMN: CẢNH BÁO HỌC SINH CẦN QUAN TÂM & BÀI TẬP SẮP HẾT HẠN */}
        <div className="space-y-6">
          {/* Cảnh báo học sinh cần quan tâm */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                  Cảnh báo học sinh cần quan tâm
                </h3>
                <p className="text-[11px] text-slate-400">
                  {studentsNeedingCare.length} học sinh cần hỗ trợ hoặc nhắc nhở
                </p>
              </div>
            </div>

            {studentsNeedingCare.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs text-center font-bold">
                🎉 Tất cả học sinh đang hoàn thành bài rất tốt!
              </div>
            ) : (
              <div className="space-y-2.5">
                {studentsNeedingCare.slice(0, 5).map(({ student, reasons }) => (
                  <div
                    key={student.id}
                    className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-2xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {student.fullName} ({student.studentCode})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-600 font-semibold border border-rose-200">
                        Lớp {student.className}
                      </span>
                    </div>
                    <div className="text-rose-700 font-medium">
                      {reasons.map((r, i) => (
                        <div key={i}>• {r}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danh sách bài tập sắp hết hạn */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                ⏰
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                  Bài tập sắp hết hạn (48h)
                </h3>
                <p className="text-[11px] text-slate-400">
                  {assignmentsDueSoon.length} bài sắp khóa nộp
                </p>
              </div>
            </div>

            {assignmentsDueSoon.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 text-slate-500 text-xs text-center">
                Không có bài tập nào sắp hết hạn trong 48 giờ tới.
              </div>
            ) : (
              <div className="space-y-2.5">
                {assignmentsDueSoon.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{asg.title}</div>
                      <div className="text-amber-800 font-medium">
                        Hạn nộp: {asg.dueDate.replace('T', ' ')}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDetailAssignment(asg)}
                      className="p-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-xs cursor-pointer hover:bg-amber-100"
                    >
                      Kiểm tra
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Detail Modal */}
      {selectedDetailAssignment && (
        <AssignmentDetailModal
          assignment={selectedDetailAssignment}
          students={students}
          submissions={submissions}
          onClose={() => setSelectedDetailAssignment(null)}
        />
      )}
    </div>
  );
};
