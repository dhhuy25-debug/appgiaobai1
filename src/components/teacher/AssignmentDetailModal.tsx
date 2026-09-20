import React, { useState } from 'react';
import { Assignment, Student, Submission } from '../../types';
import { X, Trophy, Clock, CheckCircle2, AlertCircle, Award, User, Search, Eye } from 'lucide-react';

interface AssignmentDetailModalProps {
  assignment: Assignment;
  students: Student[];
  submissions: Submission[];
  onClose: () => void;
}

export const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  assignment,
  students,
  submissions,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'table' | 'leaderboard'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectSubmission, setInspectSubmission] = useState<Submission | null>(null);

  // Filter students in the target class or targeted audience
  const targetStudents = students.filter((s) => {
    const isClassMatch = s.classId === assignment.classId || s.className === assignment.className;
    if (!isClassMatch) return false;
    if (assignment.targetAudience === 'specific' || assignment.targetAudience === 'group') {
      return assignment.targetStudentIds?.includes(s.id);
    }
    return true;
  });

  // Calculate detailed status for each student
  const studentRecords = targetStudents.map((std) => {
    const sub = submissions.find((s) => s.assignmentId === assignment.id && s.studentId === std.id);
    const now = new Date();
    const isOverdue = assignment.dueDate ? now > new Date(assignment.dueDate) : false;

    let statusText = 'Chưa làm';
    let statusClass = 'bg-slate-100 text-slate-700 border-slate-200';

    if (sub && (sub.status === 'submitted' || sub.status === 'late')) {
      if (sub.status === 'late') {
        statusText = 'Nộp muộn';
        statusClass = 'bg-amber-100 text-amber-900 border-amber-300';
      } else {
        statusText = 'Đã hoàn thành';
        statusClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      }
    } else if (sub && sub.status === 'in_progress') {
      statusText = 'Đang làm';
      statusClass = 'bg-yellow-100 text-yellow-900 border-yellow-300';
    } else if (isOverdue) {
      statusText = 'Chưa nộp (Quá hạn)';
      statusClass = 'bg-rose-100 text-rose-900 border-rose-300';
    }

    return {
      student: std,
      submission: sub,
      statusText,
      statusClass,
      score: sub?.score !== undefined ? sub.score : null,
      duration: sub?.durationSeconds ? Math.round(sub.durationSeconds / 60) : null,
      durationSeconds: sub?.durationSeconds || 999999,
      submittedAt: sub?.submittedAt
        ? new Date(sub.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        : '-'
    };
  });

  // Filtered by search
  const filteredRecords = studentRecords.filter((r) =>
    r.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.student.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Leaderboard ranking: Ưu tiên điểm cao hơn, nếu bằng điểm thì thời gian làm ngắn hơn
  const leaderboardRecords = studentRecords
    .filter((r) => r.score !== null)
    .sort((a, b) => {
      if ((b.score ?? 0) !== (a.score ?? 0)) {
        return (b.score ?? 0) - (a.score ?? 0);
      }
      return a.durationSeconds - b.durationSeconds;
    });

  // Summary counts
  const total = targetStudents.length;
  const submittedCount = studentRecords.filter(
    (r) => r.submission && (r.submission.status === 'submitted' || r.submission.status === 'late')
  ).length;
  const lateCount = studentRecords.filter((r) => r.submission?.status === 'late').length;
  const notStartedCount = total - submittedCount;
  const progressPercent = total > 0 ? Math.round((submittedCount / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold">
                {assignment.subject}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-xs font-mono font-bold">
                {assignment.code}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Lớp {assignment.className}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {assignment.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white text-slate-400 hover:text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Summary Bar */}
        <div className="p-5 bg-white border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-500">Tổng số học sinh</div>
            <div className="text-2xl font-black text-slate-800">{total} em</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80">
            <div className="text-xs font-bold text-emerald-700">Đã nộp bài</div>
            <div className="text-2xl font-black text-emerald-600">{submittedCount} em</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80">
            <div className="text-xs font-bold text-amber-700">Nộp muộn</div>
            <div className="text-2xl font-black text-amber-600">{lateCount} em</div>
          </div>
          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200/80">
            <div className="text-xs font-bold text-rose-700">Chưa nộp</div>
            <div className="text-2xl font-black text-rose-600">{notStartedCount} em</div>
          </div>
        </div>

        {/* Progress Bar (Yêu cầu Phần XII) */}
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center gap-4">
          <div className="text-xs font-bold text-slate-600 whitespace-nowrap">
            Tiến độ nộp bài:
          </div>
          <div className="flex-1 h-3.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs font-black text-emerald-700 font-mono">
            {progressPercent}%
          </div>
        </div>

        {/* View Switcher & Search */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveView('table')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'table'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📋 Danh sách nộp bài ({studentRecords.length})
            </button>
            <button
              onClick={() => setActiveView('leaderboard')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'leaderboard'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>🏆 Bảng xếp hạng ({leaderboardRecords.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã HS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-5 overflow-y-auto">
          {activeView === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/80">
                    <th className="py-3 px-3">STT</th>
                    <th className="py-3 px-3">Mã HS</th>
                    <th className="py-3 px-3">Họ và tên</th>
                    <th className="py-3 px-3">Lớp</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3">Điểm</th>
                    <th className="py-3 px-3">Thời gian làm</th>
                    <th className="py-3 px-3">Thời gian nộp</th>
                    <th className="py-3 px-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec, idx) => (
                    <tr key={rec.student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">
                        {rec.student.studentCode}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {rec.student.fullName}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{rec.student.className}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${rec.statusClass}`}
                        >
                          {rec.statusText}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {rec.score !== null ? (
                          <span className="font-extrabold text-emerald-600 text-sm">
                            {rec.score} / 10
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {rec.duration !== null ? `${rec.duration} phút` : '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-xs">
                        {rec.submittedAt}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {rec.submission ? (
                          <button
                            onClick={() => setInspectSubmission(rec.submission || null)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Xem bài
                          </button>
                        ) : (
                          <span className="text-slate-300 text-xs">Chưa có bài</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Leaderboard View (Yêu cầu Phần XIII) */
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <strong>Quy tắc xếp hạng:</strong> Ưu tiên học sinh có điểm cao hơn. Nếu bằng điểm, học sinh nộp bài sớm hơn với thời gian làm bài ngắn hơn sẽ xếp trên.
                </div>
              </div>

              <div className="space-y-2">
                {leaderboardRecords.map((r, rankIdx) => {
                  const rank = rankIdx + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;

                  return (
                    <div
                      key={r.student.id}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                        isTop1
                          ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-100'
                          : isTop2
                          ? 'bg-slate-50 border-slate-300'
                          : isTop3
                          ? 'bg-orange-50/60 border-orange-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                            isTop1
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                              : isTop2
                              ? 'bg-slate-400 text-white'
                              : isTop3
                              ? 'bg-orange-400 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : rank}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm sm:text-base">
                            {r.student.fullName}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            Mã: {r.student.studentCode} • Lớp {r.student.className}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-black text-emerald-600">
                          {r.score} <span className="text-xs text-slate-400">/ 10</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{r.duration} phút</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Detail Submission Modal */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Bài làm của {inspectSubmission.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  Điểm: <strong>{inspectSubmission.score}/10</strong> • Đúng {inspectSubmission.correctCount}/{inspectSubmission.totalQuestions} câu
                </p>
              </div>
              <button
                onClick={() => setInspectSubmission(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {assignment.questions.map((q, qIdx) => {
                const sAns = inspectSubmission.answers[q.id];
                return (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-800 mb-2">
                      Câu {qIdx + 1}: {q.prompt}
                    </div>
                    <div className="text-slate-600 mb-1">
                      <strong>Học sinh chọn:</strong>{' '}
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 inline-block text-indigo-700">
                        {typeof sAns === 'object' ? JSON.stringify(sAns) : String(sAns || 'Chưa trả lời')}
                      </span>
                    </div>
                    <div className="text-emerald-700">
                      <strong>Đáp án đúng:</strong>{' '}
                      <span className="font-mono">
                        {Array.isArray(q.correctAnswer)
                          ? q.correctAnswer.join(', ')
                          : q.type === 'matching' && q.matchingPairs
                          ? q.matchingPairs.map((p) => `${p.left} ➔ ${p.right}`).join('; ')
                          : String(q.correctAnswer)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
