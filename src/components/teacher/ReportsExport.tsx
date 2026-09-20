import React, { useState } from 'react';
import { Assignment, Student, Submission, SchoolClass } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Filter,
  BarChart3,
  PieChart,
  CheckCircle2,
  Clock,
  Award,
  Calendar
} from 'lucide-react';

interface ReportsExportProps {
  assignments: Assignment[];
  students: Student[];
  submissions: Submission[];
  classes: SchoolClass[];
}

export const ReportsExport: React.FC<ReportsExportProps> = ({
  assignments,
  students,
  submissions,
  classes
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const subjects = Array.from(new Set(assignments.map((a) => a.subject)));

  // Filter submissions
  const filteredSubs = submissions.filter((s) => {
    if (selectedClass !== 'all') {
      const std = students.find((st) => st.id === s.studentId);
      if (std?.className !== selectedClass) return false;
    }
    if (selectedSubject !== 'all' && s.subject !== selectedSubject) return false;
    return s.status === 'submitted' || s.status === 'late';
  });

  // Calculate score distribution
  const scoreStats = {
    excellent: filteredSubs.filter((s) => (s.score ?? 0) >= 8.5).length, // 8.5 - 10
    good: filteredSubs.filter((s) => (s.score ?? 0) >= 7 && (s.score ?? 0) < 8.5).length, // 7.0 - 8.0
    average: filteredSubs.filter((s) => (s.score ?? 0) >= 5 && (s.score ?? 0) < 7).length, // 5.0 - 6.5
    needEffort: filteredSubs.filter((s) => (s.score ?? 0) < 5).length // < 5.0
  };

  const totalEvaluated = filteredSubs.length;
  const avgScore =
    totalEvaluated > 0
      ? Math.round(
          (filteredSubs.reduce((acc, cur) => acc + (cur.score ?? 0), 0) / totalEvaluated) * 10
        ) / 10
      : 0;

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Mã Học Sinh',
      'Họ Và Tên',
      'Lớp',
      'Tên Bài Tập',
      'Môn Học',
      'Điểm Số',
      'Số Câu Đúng',
      'Tổng Số Câu',
      'Thời Gian Làm (phút)',
      'Thời Gian Nộp',
      'Trạng Thái'
    ];

    const rows = filteredSubs.map((s, idx) => {
      const std = students.find((st) => st.id === s.studentId);
      return [
        idx + 1,
        std?.studentCode || '-',
        `"${s.studentName}"`,
        std?.className || '-',
        `"${s.assignmentTitle}"`,
        s.subject,
        s.score ?? 0,
        s.correctCount ?? 0,
        s.totalQuestions,
        Math.round(s.durationSeconds / 60),
        `"${s.submittedAt ? new Date(s.submittedAt).toLocaleString('vi-VN') : '-'}"`,
        s.status === 'late' ? 'Nộp muộn' : 'Đúng hạn'
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Bao_Cao_Ket_Qua_Hoc_Sinh_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Báo Cáo Điểm Số & Xuất Dữ Liệu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng hợp kết quả học tập, phổ điểm và tải danh sách điểm thi chi tiết định dạng CSV / Excel
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto"
        >
          <Download className="w-4 h-4 stroke-[3]" />
          <span>XUẤT BÁO CÁO EXCEL (CSV)</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Lớp học:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                Lớp {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Môn học:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Score Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-emerald-700 mb-1">Hoàn thành tốt (8.5 - 10đ)</div>
          <div className="text-3xl font-black text-emerald-600">{scoreStats.excellent}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalEvaluated > 0
              ? `${Math.round((scoreStats.excellent / totalEvaluated) * 100)}% tổng số`
              : '0%'}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-sky-700 mb-1">Hoàn thành khá (7.0 - 8.0đ)</div>
          <div className="text-3xl font-black text-sky-600">{scoreStats.good}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalEvaluated > 0
              ? `${Math.round((scoreStats.good / totalEvaluated) * 100)}% tổng số`
              : '0%'}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-amber-700 mb-1">Đạt yêu cầu (5.0 - 6.5đ)</div>
          <div className="text-3xl font-black text-amber-600">{scoreStats.average}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalEvaluated > 0
              ? `${Math.round((scoreStats.average / totalEvaluated) * 100)}% tổng số`
              : '0%'}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-rose-700 mb-1">Cần cố gắng (Dưới 5đ)</div>
          <div className="text-3xl font-black text-rose-600">{scoreStats.needEffort}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalEvaluated > 0
              ? `${Math.round((scoreStats.needEffort / totalEvaluated) * 100)}% tổng số`
              : '0%'}
          </div>
        </div>
      </div>

      {/* Submissions Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-base">
            Bảng kết quả nộp bài chi tiết ({filteredSubs.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Điểm trung bình lọc: <strong className="text-indigo-600">{avgScore}/10</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Lớp</th>
                <th className="py-3 px-4">Bài tập</th>
                <th className="py-3 px-4">Môn</th>
                <th className="py-3 px-4">Điểm</th>
                <th className="py-3 px-4">Đúng</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Ngày nộp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.map((sub, idx) => {
                const std = students.find((st) => st.id === sub.studentId);
                const score = sub.score ?? 0;
                const isHigh = score >= 8;

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {sub.studentName}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {std?.studentCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{std?.className || '-'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 line-clamp-1">
                      {sub.assignmentTitle}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-xs">
                        {sub.subject}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-black text-sm ${
                          isHigh ? 'text-emerald-600' : score >= 5 ? 'text-indigo-600' : 'text-rose-600'
                        }`}
                      >
                        {score} / 10
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {sub.correctCount}/{sub.totalQuestions}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {Math.round(sub.durationSeconds / 60)} phút
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
