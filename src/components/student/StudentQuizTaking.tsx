import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Assignment, Student, Submission } from '../../types';
import { storageService } from '../../services/storage';
import { QuestionItem } from './QuestionItem';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Send,
  Save,
  HelpCircle,
  Trophy,
  Award,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface StudentQuizTakingProps {
  assignment: Assignment;
  student: Student;
  onFinish: () => void;
  onBackToPortal: () => void;
}

export const StudentQuizTaking: React.FC<StudentQuizTakingProps> = ({
  assignment,
  student,
  onFinish,
  onBackToPortal
}) => {
  // Existing submission check
  const existingSub = storageService.getSubmissionForStudent(assignment.id, student.id);

  // States
  const [answers, setAnswers] = useState<Record<string, any>>(existingSub?.answers || {});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [lastSavedText, setLastSavedText] = useState<string>(
    existingSub?.lastSavedAt
      ? new Date(existingSub.lastSavedAt).toLocaleTimeString('vi-VN')
      : new Date().toLocaleTimeString('vi-VN')
  );
  const [secondsElapsed, setSecondsElapsed] = useState<number>(existingSub?.durationSeconds || 0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    submission: Submission;
    score: number;
    correctCount: number;
    evaluation: string;
  } | null>(
    existingSub && (existingSub.status === 'submitted' || existingSub.status === 'late')
      ? {
          submission: existingSub,
          score: existingSub.score ?? 0,
          correctCount: existingSub.correctCount ?? 0,
          evaluation:
            existingSub.evaluation === 'excellent'
              ? 'Hoàn thành tốt'
              : existingSub.evaluation === 'completed'
              ? 'Hoàn thành'
              : 'Cần cố gắng'
        }
      : null
  );

  const [reviewMode, setReviewMode] = useState(false);

  // Time remaining calculation
  const totalLimitSeconds = assignment.durationMinutes > 0 ? assignment.durationMinutes * 60 : 0;
  const timeRemaining = totalLimitSeconds > 0 ? Math.max(0, totalLimitSeconds - secondsElapsed) : null;

  // Timer interval
  useEffect(() => {
    if (submittedResult) return;

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        // Auto-submit if time runs out
        if (totalLimitSeconds > 0 && next >= totalLimitSeconds) {
          handleAutoSubmitOnTimeOut(next);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submittedResult, totalLimitSeconds]);

  // AUTO-SAVE on every answer change
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const secondsRef = useRef(secondsElapsed);
  secondsRef.current = secondsElapsed;

  const performAutoSave = (newAnswers: Record<string, any>) => {
    const sub = storageService.autoSaveSubmissionDraft({
      assignment,
      student,
      answers: newAnswers,
      durationSeconds: secondsRef.current
    });
    setLastSavedText(new Date().toLocaleTimeString('vi-VN'));
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    if (submittedResult && !reviewMode) return;
    const updated = { ...answers, [questionId]: answer };
    setAnswers(updated);
    performAutoSave(updated);
  };

  // Auto-submit if time limit reached
  const handleAutoSubmitOnTimeOut = (finalDuration: number) => {
    const res = storageService.submitAssignment({
      assignment,
      student,
      answers: answersRef.current,
      durationSeconds: finalDuration
    });
    setSubmittedResult(res);
    triggerCelebration(res.score);
  };

  // Submit trigger
  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    const res = storageService.submitAssignment({
      assignment,
      student,
      answers,
      durationSeconds: secondsElapsed
    });
    setSubmittedResult(res);
    triggerCelebration(res.score);
  };

  const triggerCelebration = (score: number) => {
    if (score >= 8) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  // Count answered questions
  const totalQuestions = assignment.questions.length;
  const answeredCount = assignment.questions.filter((q) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null || ans === '') return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    if (typeof ans === 'object' && Object.keys(ans).length === 0) return false;
    return true;
  }).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // If already submitted and user is viewing results summary
  if (submittedResult && !reviewMode) {
    const { score, correctCount, evaluation, submission } = submittedResult;
    const isGreat = score >= 8;

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-emerald-50/40 to-slate-100 py-8 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 p-6 sm:p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-4xl shadow-md shadow-emerald-100">
            {isGreat ? '🏆' : '🎉'}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-1">
            EM ĐÃ NỘP BÀI THÀNH CÔNG!
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Bài làm đã được lưu vào hệ thống của {assignment.teacherName}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Điểm */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Điểm số
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">
                {score} <span className="text-sm font-bold text-emerald-500">/ 10</span>
              </div>
            </div>

            {/* Số câu đúng */}
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
              <div className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
                Số câu đúng
              </div>
              <div className="text-3xl sm:text-4xl font-black text-sky-600">
                {correctCount} <span className="text-sm font-bold text-sky-500">/ {totalQuestions}</span>
              </div>
            </div>

            {/* Thời gian làm */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 mb-0.5">Thời gian làm bài</div>
              <div className="text-base font-bold text-slate-800">
                {formatTime(submission.durationSeconds)}
              </div>
            </div>

            {/* Đánh giá */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="text-[11px] font-bold text-amber-700 mb-0.5">Đánh giá</div>
              <div className="text-sm sm:text-base font-extrabold text-amber-900">
                ⭐ {evaluation}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {assignment.showAnswer ? (
              <button
                id="btn-view-answers"
                onClick={() => setReviewMode(true)}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>XEM KẾT QUẢ VÀ ĐÁP ÁN CHI TIẾT</span>
                <span>➔</span>
              </button>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                🔒 Thầy cô chưa cho phép xem đáp án ngay lúc này. Em sẽ được xem khi cả lớp nộp xong nhé!
              </div>
            )}

            <button
              id="btn-back-home"
              onClick={onBackToPortal}
              className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
            >
              VỀ TRANG CHỦ HỌC SINH
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPortal}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Quay về trang chủ"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                <span>Môn: {assignment.subject}</span>
                <span>•</span>
                <span>Lớp: {student.className}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-800 line-clamp-1">
                {assignment.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-save badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Save className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã tự động lưu lúc {lastSavedText}</span>
            </div>

            {/* Timer if duration limited */}
            {timeRemaining !== null && !reviewMode && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
                  timeRemaining < 300
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>⏱ {formatTime(timeRemaining)}</span>
              </div>
            )}

            {/* Submit button on header */}
            {!reviewMode && (
              <button
                id="btn-header-submit"
                onClick={() => setShowConfirmModal(true)}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Nộp bài</span>
              </button>
            )}

            {reviewMode && (
              <button
                onClick={() => setReviewMode(false)}
                className="py-2 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm cursor-pointer flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" />
                <span>Xem tổng kết</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile auto-save badge */}
        <div className="sm:hidden mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Đã tự lưu: {lastSavedText}
          </span>
          <span className="font-bold text-slate-700">
            Học sinh: {student.fullName}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 pb-24">
        {/* Review Mode Banner */}
        {reviewMode && (
          <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <div className="font-extrabold text-indigo-950 text-base">
                  Chế độ xem lại bài làm & đáp án
                </div>
                <div className="text-xs text-indigo-700">
                  Điểm của em: <strong>{submittedResult?.score}/10</strong> ({submittedResult?.correctCount}/{totalQuestions} câu đúng)
                </div>
              </div>
            </div>
            <button
              onClick={() => setReviewMode(false)}
              className="text-xs font-bold px-3 py-1.5 bg-white text-indigo-700 rounded-xl border border-indigo-200 shadow-2xs hover:bg-indigo-50"
            >
              Đóng xem lại
            </button>
          </div>
        )}

        {/* Quick Question Navigation Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">
              Danh sách câu hỏi ({answeredCount}/{totalQuestions} đã làm)
            </span>
            <span className="text-xs text-slate-400">Bấm số để chuyển nhanh</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {assignment.questions.map((q, idx) => {
              const isAnswered =
                answers[q.id] !== undefined &&
                answers[q.id] !== null &&
                answers[q.id] !== '' &&
                (!Array.isArray(answers[q.id]) || answers[q.id].length > 0) &&
                (typeof answers[q.id] !== 'object' || Object.keys(answers[q.id]).length > 0);

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    const el = document.getElementById(`question-card-${q.id}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    isAnswered
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* List of Questions */}
        <div className="space-y-6">
          {assignment.questions.map((question, idx) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={idx}
              total={totalQuestions}
              studentAnswer={answers[question.id]}
              onChangeAnswer={(ans) => handleAnswerChange(question.id, ans)}
              reviewMode={reviewMode}
            />
          ))}
        </div>

        {/* Big Submit Button at Bottom */}
        {!reviewMode && (
          <div className="pt-6 pb-12 text-center">
            <button
              id="btn-big-submit"
              onClick={() => setShowConfirmModal(true)}
              className="w-full max-w-md py-4 px-8 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xl shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-0.5 active:scale-98 transition-all cursor-pointer inline-flex items-center justify-center gap-3"
            >
              <span>📤 NỘP BÀI TẬP</span>
              <span className="text-2xl">➔</span>
            </button>
            <div className="text-xs text-slate-500 mt-2">
              Em đã trả lời {answeredCount}/{totalQuestions} câu hỏi
            </div>
          </div>
        )}
      </main>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl">
              ❓
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
              Em có chắc chắn muốn nộp bài không?
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Sau khi xác nhận nộp, bài làm sẽ được gửi cho {assignment.teacherName} và chấm điểm tự động.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-6 space-y-2 text-sm text-left">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Đã trả lời:</span>
                <span className="font-extrabold text-emerald-600">
                  {answeredCount} / {totalQuestions} câu
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Chưa trả lời:</span>
                <span
                  className={`font-extrabold ${
                    unansweredCount > 0 ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {unansweredCount} câu
                </span>
              </div>
              {unansweredCount > 0 && (
                <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Em vẫn còn câu chưa chọn đáp án, có thể kiểm tra lại nhé!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-cancel-submit"
                onClick={() => setShowConfirmModal(false)}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer transition-colors"
              >
                QUAY LẠI LÀM TIẾP
              </button>

              <button
                id="btn-confirm-submit"
                onClick={handleConfirmSubmit}
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-200 cursor-pointer transition-all"
              >
                XÁC NHẬN NỘP BÀI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
