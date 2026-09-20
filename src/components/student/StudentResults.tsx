import React from 'react';
import { Submission, Student, Assignment } from '../../types';
import { Trophy, Award, TrendingUp, Calendar, Clock, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';

interface StudentResultsProps {
  submissions: Submission[];
  student: Student;
  assignments: Assignment[];
  onReviewAssignment: (assignment: Assignment) => void;
}

export const StudentResults: React.FC<StudentResultsProps> = ({
  submissions,
  student,
  assignments,
  onReviewAssignment
}) => {
  // Only submitted or late with graded score
  const studentSubs = submissions
    .filter((s) => s.studentId === student.id && (s.status === 'submitted' || s.status === 'late'))
    .sort((a, b) => new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime());

  // Stats
  const totalCompleted = studentSubs.length;
  const avgScore =
    totalCompleted > 0
      ? Math.round(
          (studentSubs.reduce((acc, cur) => acc + (cur.score ?? 0), 0) / totalCompleted) * 10
        ) / 10
      : 0;

  const excellentCount = studentSubs.filter((s) => (s.score ?? 0) >= 8).length;

  return (
    <div className="space-y-6">
      {/* Top summary card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 text-white shadow-md shadow-emerald-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Bảng Thành Tích Cá Nhân
            </span>
            <h2 className="text-2xl font-black mt-2 tracking-tight">
              Kết quả học tập của {student.fullName}
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
              Lớp {student.className} • Mã HS: {student.studentCode}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl backdrop-blur-xs border border-white/20">
            <div className="text-center px-2">
              <div className="text-xs text-emerald-100 font-semibold">Điểm TB</div>
              <div className="text-2xl sm:text-3xl font-black">{avgScore}</div>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="text-center px-2">
              <div className="text-xs text-emerald-100 font-semibold">Hoàn thành</div>
              <div className="text-2xl sm:text-3xl font-black">{totalCompleted}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress timeline / score chart visual */}
      {studentSubs.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Biểu đồ tiến bộ điểm số</span>
            </h3>
            <span className="text-xs text-slate-400">Thang điểm 10</span>
          </div>

          {/* Bar progress representation */}
          <div className="space-y-3">
            {studentSubs.slice(0, 5).map((sub) => {
              const score = sub.score ?? 0;
              const percent = Math.min(100, Math.max(10, score * 10));
              const isExcellent = score >= 8;
              const isGood = score >= 5 && score < 8;

              return (
                <div key={sub.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="line-clamp-1">{sub.subject} – {sub.assignmentTitle}</span>
                    <span className={isExcellent ? 'text-emerald-600' : isGood ? 'text-indigo-600' : 'text-amber-600'}>
                      {score}/10
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExcellent
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                          : isGood
                          ? 'bg-gradient-to-r from-sky-400 to-indigo-500'
                          : 'bg-gradient-to-r from-amber-400 to-rose-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List of completed submissions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Lịch sử các bài đã làm ({studentSubs.length})</span>
        </h3>

        {studentSubs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            Em chưa hoàn thành bài tập nào. Hãy vào mục "Bài tập" để bắt đầu làm bài nhé!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {studentSubs.map((sub) => {
              const asg = assignments.find((a) => a.id === sub.assignmentId);
              const score = sub.score ?? 0;
              const isExcellent = score >= 8;
              const isGood = score >= 5 && score < 8;

              return (
                <div
                  key={sub.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                        {sub.subject}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                        {sub.assignmentTitle}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('vi-VN') : 'Đã nộp'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Làm trong: {Math.round(sub.durationSeconds / 60)} phút
                      </span>
                      <span>•</span>
                      <span>
                        Đúng: {sub.correctCount}/{sub.totalQuestions} câu
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-lg sm:text-xl font-black ${
                          isExcellent
                            ? 'text-emerald-600'
                            : isGood
                            ? 'text-indigo-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {score} <span className="text-xs font-semibold text-slate-400">/ 10</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">
                        {isExcellent ? '⭐ Hoàn thành tốt' : isGood ? '✓ Hoàn thành' : '⚡ Cần cố gắng'}
                      </div>
                    </div>

                    {asg && (
                      <button
                        onClick={() => onReviewAssignment(asg)}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Xem lại bài làm"
                      >
                        <span>Xem</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
