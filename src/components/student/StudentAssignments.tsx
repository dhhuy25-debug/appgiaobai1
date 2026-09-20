import React, { useState } from 'react';
import { Assignment, Student, Submission } from '../../types';
import { Search, Filter, BookOpen, Clock, Calendar, CheckCircle2, AlertCircle, Star } from 'lucide-react';

interface StudentAssignmentsProps {
  assignments: Assignment[];
  submissions: Submission[];
  student: Student;
  onStartQuiz: (assignment: Assignment) => void;
}

export const StudentAssignments: React.FC<StudentAssignmentsProps> = ({
  assignments,
  submissions,
  student,
  onStartQuiz
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Determine status of an assignment for this student
  const getAssignmentStatus = (asg: Assignment) => {
    const sub = submissions.find((s) => s.assignmentId === asg.id && s.studentId === student.id);
    const now = new Date();
    const isOverdue = asg.dueDate ? now > new Date(asg.dueDate) : false;

    if (sub && (sub.status === 'submitted' || sub.status === 'late')) {
      if ((sub.score ?? 0) >= 8) {
        return { key: 'excellent', label: '⭐ Hoàn thành tốt', color: 'bg-amber-100 text-amber-900 border-amber-300', btnText: 'XEM KẾT QUẢ' };
      }
      return { key: 'completed', label: '🟢 Đã hoàn thành', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', btnText: 'XEM KẾT QUẢ' };
    }
    if (sub && sub.status === 'in_progress') {
      return { key: 'in_progress', label: '🟡 Đang làm', color: 'bg-yellow-100 text-yellow-900 border-yellow-300', btnText: 'TIẾP TỤC' };
    }
    if (isOverdue) {
      return { key: 'overdue', label: '🔴 Quá hạn', color: 'bg-rose-100 text-rose-900 border-rose-300', btnText: 'BẮT ĐẦU' };
    }
    return { key: 'not_started', label: '🔵 Chưa làm', color: 'bg-sky-100 text-sky-900 border-sky-300', btnText: 'BẮT ĐẦU' };
  };

  // Subjects list
  const subjects = Array.from(new Set(assignments.map((a) => a.subject)));

  // Filtered assignments
  const filtered = assignments.filter((asg) => {
    const statusObj = getAssignmentStatus(asg);

    if (selectedSubject !== 'all' && asg.subject !== selectedSubject) return false;

    if (selectedStatus === 'not_started' && statusObj.key !== 'not_started') return false;
    if (selectedStatus === 'in_progress' && statusObj.key !== 'in_progress') return false;
    if (selectedStatus === 'completed' && statusObj.key !== 'completed' && statusObj.key !== 'excellent') return false;
    if (selectedStatus === 'overdue' && statusObj.key !== 'overdue') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = asg.title.toLowerCase().includes(q);
      const matchSub = asg.subject.toLowerCase().includes(q);
      const matchCode = asg.code.toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchCode) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Kho bài tập của em</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Lớp {student.className} • {assignments.length} bài tập được giao
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên bài, môn học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs & Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'not_started', label: '🔵 Chưa làm' },
            { key: 'in_progress', label: '🟡 Đang làm' },
            { key: 'completed', label: '🟢 Đã nộp' },
            { key: 'overdue', label: '🔴 Quá hạn' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === tab.key
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none cursor-pointer"
        >
          <option value="all">📚 Tất cả môn học</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {/* Assignment Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">Không tìm thấy bài tập phù hợp</p>
          <p className="text-xs text-slate-400 mt-1">Em hãy thử chọn lọc lại bộ lọc nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((asg) => {
            const statusObj = getAssignmentStatus(asg);
            const sub = submissions.find((s) => s.assignmentId === asg.id && s.studentId === student.id);

            return (
              <div
                key={asg.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider">
                      {asg.subject}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold border ${statusObj.color}`}
                    >
                      {statusObj.label}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2 leading-snug">
                    {asg.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-700">Giáo viên:</span>
                      <span>{asg.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ngày giao: {asg.startDate.replace('T', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-rose-600">
                        Hạn nộp: {asg.dueDate.replace('T', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Số câu: <strong>{asg.questions.length} câu</strong></span>
                      <span>•</span>
                      <span>Thời gian: <strong>{asg.durationMinutes > 0 ? `${asg.durationMinutes} phút` : 'Tự do'}</strong></span>
                    </div>
                  </div>

                  {sub && sub.score !== undefined && (
                    <div className="mb-4 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                      <span className="text-emerald-800 font-bold">Điểm số của em:</span>
                      <span className="text-sm font-extrabold text-emerald-700">
                        {sub.score}/10 ({sub.correctCount}/{asg.questions.length} đúng)
                      </span>
                    </div>
                  )}
                </div>

                <button
                  id={`btn-asg-${asg.id}`}
                  onClick={() => onStartQuiz(asg)}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                    statusObj.btnText === 'XEM KẾT QUẢ'
                      ? 'bg-slate-800 hover:bg-slate-900 text-white'
                      : statusObj.btnText === 'TIẾP TỤC'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                  }`}
                >
                  <span>{statusObj.btnText}</span>
                  <span>➔</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
