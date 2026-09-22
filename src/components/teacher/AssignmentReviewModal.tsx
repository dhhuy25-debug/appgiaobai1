import React, { useState } from 'react';
import { Assignment, Question, QuestionOption } from '../../types';
import {
  X,
  Edit3,
  Copy,
  Check,
  Link,
  Calendar,
  Clock,
  FileQuestion,
  Award,
  CheckCircle2,
  HelpCircle,
  Eye,
  Sparkles,
  ArrowRight,
  ListOrdered,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface AssignmentReviewModalProps {
  assignment: Assignment;
  onClose: () => void;
  onEdit: (assignment: Assignment) => void;
  onViewSubmissions?: (assignment: Assignment) => void;
}

export const AssignmentReviewModal: React.FC<AssignmentReviewModalProps> = ({
  assignment,
  onClose,
  onEdit,
  onViewSubmissions
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(assignment.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const directUrl = `${window.location.origin}${window.location.pathname}?join=${assignment.code}`;
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const totalPoints = assignment.questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single_choice':
        return 'Trắc nghiệm (1 đáp án)';
      case 'multiple_choice':
        return 'Trắc nghiệm (nhiều đáp án)';
      case 'true_false':
        return 'Đúng / Sai';
      case 'fill_blank':
        return 'Điền từ / Điền số';
      case 'matching':
        return 'Nối cặp tương ứng';
      case 'reorder':
        return 'Sắp xếp thứ tự';
      case 'image_question':
        return 'Câu hỏi có hình ảnh';
      case 'short_answer':
        return 'Tự luận ngắn';
      default:
        return 'Câu hỏi';
    }
  };

  const getOptionText = (opt: QuestionOption): string => {
    if (typeof opt === 'string') return opt;
    return opt.text;
  };

  const getOptionId = (opt: QuestionOption, idx: number): string => {
    if (typeof opt === 'object' && opt.id) return opt.id;
    return String.fromCharCode(65 + idx);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs uppercase tracking-wide">
                {assignment.subject}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                Lớp {assignment.className}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Đang giao
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
              {assignment.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Info & Sharing Strip */}
        <div className="py-3 px-4 my-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Hạn nộp: <strong className="text-rose-600">{assignment.dueDate.replace('T', ' ')}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Thời gian: <strong>{assignment.durationMinutes > 0 ? `${assignment.durationMinutes} phút` : 'Không giới hạn'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
              <span>Tổng số: <strong>{assignment.questions.length} câu</strong> ({totalPoints} điểm)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span>Chấm điểm: <strong>{assignment.autoGrade ? 'Tự động' : 'Thầy cô chấm'}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Đã chép mã' : `Mã: ${assignment.code}`}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Đã chép link' : 'Sao chép link'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Questions Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-indigo-600" />
              Danh sách {assignment.questions.length} câu hỏi và đáp án chuẩn:
            </h4>
            <span className="text-xs text-slate-400 font-medium">
              Đáp án đúng được đánh dấu màu xanh lá
            </span>
          </div>

          {assignment.questions.map((q, idx) => {
            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition-all shadow-2xs space-y-3"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                      {getQuestionTypeLabel(q.type)}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {q.points} điểm
                  </span>
                </div>

                {/* Prompt */}
                <p className="text-slate-800 font-bold text-sm sm:text-base leading-relaxed">
                  {q.prompt}
                </p>

                {/* Image if present */}
                {q.imageUrl && (
                  <div className="my-2 rounded-xl overflow-hidden border border-slate-200 max-w-md">
                    <img
                      src={q.imageUrl}
                      alt={`Minh họa câu ${idx + 1}`}
                      className="w-full h-auto object-cover max-h-64"
                    />
                  </div>
                )}

                {/* Options / Answer Review based on type */}
                {/* 1. Single Choice & Image Question */}
                {(q.type === 'single_choice' || q.type === 'image_question' || q.type === 'audio_question' || q.type === 'video_question') && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const optId = getOptionId(opt, optIdx);
                      const optText = getOptionText(opt);
                      const isCorrect = q.correctAnswer === optId || q.correctAnswer === optText;

                      return (
                        <div
                          key={optId}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-medium transition-all ${
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-1 ring-emerald-400'
                              : 'border-slate-200 bg-slate-50/50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-600'
                              }`}
                            >
                              {optId}
                            </span>
                            <span>{optText}</span>
                          </div>
                          {isCorrect && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-black shrink-0">
                              ✓ Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. Multiple Choice */}
                {q.type === 'multiple_choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const optId = getOptionId(opt, optIdx);
                      const optText = getOptionText(opt);
                      const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
                      const isCorrect = correctArr.includes(optId) || correctArr.includes(optText);

                      return (
                        <div
                          key={optId}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-medium transition-all ${
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-1 ring-emerald-400'
                              : 'border-slate-200 bg-slate-50/50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-600'
                              }`}
                            >
                              {optId}
                            </span>
                            <span>{optText}</span>
                          </div>
                          {isCorrect && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-black shrink-0">
                              ✓ Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. True / False */}
                {q.type === 'true_false' && (
                  <div className="flex gap-3 pt-1">
                    {['Đúng', 'Sai'].map((val) => {
                      const isCorrect = String(q.correctAnswer).toLowerCase() === val.toLowerCase();
                      return (
                        <div
                          key={val}
                          className={`flex-1 p-3 rounded-xl border text-center font-bold text-sm ${
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-400'
                              : 'border-slate-200 bg-slate-50 text-slate-600'
                          }`}
                        >
                          <span>{val}</span>
                          {isCorrect && (
                            <span className="block text-xs font-black text-emerald-700 mt-0.5">
                              ✓ Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 4. Fill in the Blank / Short Answer */}
                {(q.type === 'fill_blank' || q.type === 'short_answer') && (
                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-300 flex items-center gap-2 text-xs sm:text-sm">
                    <span className="font-bold text-emerald-900">Đáp án chính xác:</span>
                    <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-400 font-bold text-emerald-800 font-mono text-sm">
                      {String(q.correctAnswer || 'Chưa thiết lập')}
                    </span>
                  </div>
                )}

                {/* 5. Matching */}
                {q.type === 'matching' && q.matchingPairs && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-slate-500">Các cặp ghép đúng:</span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {q.matchingPairs.map((pair, pIdx) => (
                        <div
                          key={pair.id || pIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                        >
                          <span className="text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            {pair.left}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mx-2" />
                          <span className="text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 font-bold">
                            {pair.right}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Reorder / Sequence */}
                {q.type === 'reorder' && q.sequenceItems && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-slate-500">Thứ tự các bước chuẩn xác:</span>
                    <div className="space-y-1.5">
                      {q.sequenceItems.map((item, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs font-semibold text-emerald-950"
                        >
                          <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {sIdx + 1}
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation / Solution Guide */}
                {q.explanation && (
                  <div className="mt-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-950 font-bold">Lời giải / Hướng dẫn: </strong>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {onViewSubmissions && (
              <button
                onClick={() => {
                  onClose();
                  onViewSubmissions(assignment);
                }}
                className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Xem bài nộp học sinh</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onEdit(assignment);
              }}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Chỉnh sửa bài tập này</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
