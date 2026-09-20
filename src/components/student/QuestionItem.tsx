import React, { useState } from 'react';
import { Question } from '../../types';
import { Check, X, Volume2, Video, Image as ImageIcon, ArrowUpDown, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';

interface QuestionItemProps {
  question: Question;
  index: number;
  total: number;
  studentAnswer: any;
  onChangeAnswer: (answer: any) => void;
  reviewMode?: boolean; // When true, shows correctness & explanation
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  index,
  total,
  studentAnswer,
  onChangeAnswer,
  reviewMode = false
}) => {
  // Matching temporary selection state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  // Helper for multiple choice array
  const handleMultipleChoiceToggle = (option: string) => {
    const currentList: string[] = Array.isArray(studentAnswer) ? [...studentAnswer] : [];
    const exists = currentList.includes(option);
    const updated = exists ? currentList.filter((x) => x !== option) : [...currentList, option];
    onChangeAnswer(updated);
  };

  // Helper for matching type
  const handleMatchingSelectLeft = (leftItem: string) => {
    if (reviewMode) return;
    setSelectedLeft(leftItem);
  };

  const handleMatchingSelectRight = (rightItem: string) => {
    if (reviewMode || !selectedLeft) return;
    const currentPairs: Record<string, string> =
      typeof studentAnswer === 'object' && studentAnswer !== null ? { ...studentAnswer } : {};
    currentPairs[selectedLeft] = rightItem;
    onChangeAnswer(currentPairs);
    setSelectedLeft(null);
  };

  const handleRemoveMatchingPair = (leftItem: string) => {
    if (reviewMode) return;
    const currentPairs: Record<string, string> =
      typeof studentAnswer === 'object' && studentAnswer !== null ? { ...studentAnswer } : {};
    delete currentPairs[leftItem];
    onChangeAnswer(currentPairs);
  };

  // Helper for reorder type
  const currentSequence: string[] = Array.isArray(studentAnswer)
    ? studentAnswer
    : question.sequenceItems || [];

  const handleMoveSequence = (fromIdx: number, toIdx: number) => {
    if (reviewMode || toIdx < 0 || toIdx >= currentSequence.length) return;
    const updated = [...currentSequence];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    onChangeAnswer(updated);
  };

  // Evaluate correctness for reviewMode
  const getIsCorrect = (): boolean => {
    if (!reviewMode) return false;
    switch (question.type) {
      case 'single_choice':
      case 'image_question':
      case 'audio_question':
      case 'video_question': {
        const s = String(studentAnswer).trim().toLowerCase();
        const c = String(question.correctAnswer).trim().toLowerCase();
        if (s === c) return true;
        if (question.options) {
          for (let i = 0; i < question.options.length; i++) {
            const opt = question.options[i];
            const optLtr = typeof opt === 'string' ? String.fromCharCode(65 + i).toLowerCase() : (opt.id || String.fromCharCode(65 + i)).toLowerCase();
            const optTxt = (typeof opt === 'string' ? opt : opt.text || '').trim().toLowerCase();
            if ((s === optLtr && c === optTxt) || (s === optTxt && c === optLtr)) return true;
          }
        }
        return false;
      }
      case 'true_false': {
        const s = String(studentAnswer).trim().toLowerCase();
        const c = String(question.correctAnswer).trim().toLowerCase();
        const trueSet = ['true', 'đúng', 'dung', '1'];
        const falseSet = ['false', 'sai', '0'];
        if (s === c) return true;
        if (trueSet.includes(s) && trueSet.includes(c)) return true;
        if (falseSet.includes(s) && falseSet.includes(c)) return true;
        return false;
      }
      case 'multiple_choice':
        if (Array.isArray(studentAnswer) && Array.isArray(question.correctAnswer)) {
          const s1 = [...studentAnswer].map((x) => String(x).trim().toLowerCase()).sort();
          const s2 = [...question.correctAnswer].map((x) => String(x).trim().toLowerCase()).sort();
          if (s1.length === s2.length && s1.every((v, i) => v === s2[i])) return true;
          if (question.options) {
            const toLetter = (val: string) => {
              const vLow = val.trim().toLowerCase();
              const idx = question.options!.findIndex((o, i) => {
                const ltr = typeof o === 'string' ? String.fromCharCode(65 + i).toLowerCase() : (o.id || String.fromCharCode(65 + i)).toLowerCase();
                const txt = (typeof o === 'string' ? o : o.text || '').trim().toLowerCase();
                return vLow === ltr || vLow === txt;
              });
              return idx >= 0 ? String.fromCharCode(65 + idx) : val;
            };
            const mappedS = s1.map(toLetter).sort();
            const mappedC = s2.map(toLetter).sort();
            return mappedS.length === mappedC.length && mappedS.every((val, idx) => val === mappedC[idx]);
          }
        }
        return false;
      case 'fill_blank':
      case 'short_answer':
        return (
          String(studentAnswer || '').trim().toLowerCase() ===
          String(question.correctAnswer || '').trim().toLowerCase()
        );
      case 'matching':
        if (question.matchingPairs && typeof studentAnswer === 'object' && studentAnswer) {
          return question.matchingPairs.every((p) => studentAnswer[p.left] === p.right);
        }
        return false;
      case 'reorder':
        if (Array.isArray(studentAnswer) && Array.isArray(question.correctAnswer)) {
          return studentAnswer.every((v, i) => v === (question.correctAnswer as string[])[i]);
        }
        return false;
      default:
        return false;
    }
  };

  const isCorrect = reviewMode ? getIsCorrect() : false;

  return (
    <div
      id={`question-card-${question.id}`}
      className={`bg-white rounded-3xl p-5 sm:p-7 border-2 transition-all ${
        reviewMode
          ? isCorrect
            ? 'border-emerald-300 bg-emerald-50/20'
            : 'border-rose-300 bg-rose-50/20'
          : 'border-slate-200/80 shadow-sm hover:border-slate-300'
      }`}
    >
      {/* Header with question number and points */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-500">
            Câu {index + 1} / {total}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
            {question.points} điểm
          </span>
        </div>

        {reviewMode && (
          <div className="flex items-center gap-1.5">
            {isCorrect ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Check className="w-3.5 h-3.5" /> Đúng
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                <X className="w-3.5 h-3.5" /> Sai
              </span>
            )}
          </div>
        )}
      </div>

      {/* Question Prompt */}
      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 leading-relaxed">
        {question.prompt}
      </h3>

      {/* 8. Image Attachment */}
      {question.imageUrl && (
        <div className="mb-5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-w-lg">
          <img
            src={question.imageUrl}
            alt="Hình minh họa câu hỏi"
            className="w-full h-auto max-h-72 object-contain mx-auto"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* 9. Audio Attachment */}
      {question.audioUrl && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div className="flex-1 w-full">
            <div className="text-xs font-bold text-amber-900 mb-1">Âm thanh câu hỏi:</div>
            <audio controls className="w-full h-9 rounded-lg">
              <source src={question.audioUrl} type="audio/mpeg" />
              Trình duyệt không hỗ trợ thẻ audio.
            </audio>
          </div>
        </div>
      )}

      {/* 10. Video Attachment */}
      {question.videoUrl && (
        <div className="mb-5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-w-xl">
          <video controls className="w-full max-h-80 mx-auto">
            <source src={question.videoUrl} type="video/mp4" />
            Trình duyệt không hỗ trợ thẻ video.
          </video>
        </div>
      )}

      {/* Question Answers Input depending on Question Type */}
      <div className="mt-4">
        {/* 1. SINGLE CHOICE & 8, 9, 10 when options provided */}
        {(question.type === 'single_choice' ||
          ((question.type === 'image_question' ||
            question.type === 'audio_question' ||
            question.type === 'video_question') &&
            question.options &&
            question.options.length > 0)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options?.map((option, optIdx) => {
              const optText = typeof option === 'string' ? option : option.text;
              const optVal = typeof option === 'string' ? option : option.id || option.text;
              const letter = typeof option !== 'string' && option.id ? option.id : String.fromCharCode(65 + optIdx);
              const isSelected = studentAnswer === optVal;
              const cStr = String(question.correctAnswer || '').trim().toLowerCase();
              const isCorrectOption = reviewMode && (
                cStr === String(optVal).trim().toLowerCase() ||
                cStr === String(optText).trim().toLowerCase() ||
                cStr === String(letter).trim().toLowerCase()
              );

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={reviewMode}
                  onClick={() => onChangeAnswer(optVal)}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${
                    reviewMode
                      ? isCorrectOption
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-900 font-bold'
                        : isSelected
                        ? 'border-rose-400 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-500 opacity-70'
                      : isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-sm ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700 hover:border-slate-300'
                  } ${reviewMode ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'}`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base leading-snug">{optText}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. MULTIPLE CHOICE */}
        {question.type === 'multiple_choice' && (
          <div className="space-y-2.5">
            <p className="text-xs text-indigo-600 font-semibold mb-2">
              💡 Gợi ý: Câu hỏi này có thể có nhiều hơn một đáp án đúng.
            </p>
            {question.options?.map((option, optIdx) => {
              const optText = typeof option === 'string' ? option : option.text;
              const optVal = typeof option === 'string' ? option : option.id || option.text;
              const letter = typeof option !== 'string' && option.id ? option.id : String.fromCharCode(65 + optIdx);
              const isChecked = Array.isArray(studentAnswer) && (
                studentAnswer.includes(optVal) ||
                studentAnswer.includes(optText) ||
                studentAnswer.includes(letter)
              );
              const isShouldCheck =
                reviewMode &&
                Array.isArray(question.correctAnswer) &&
                (question.correctAnswer.includes(optVal) ||
                  question.correctAnswer.includes(optText) ||
                  question.correctAnswer.includes(letter));

              return (
                <div
                  key={optIdx}
                  onClick={() => !reviewMode && handleMultipleChoiceToggle(optVal)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 text-left transition-all ${
                    reviewMode
                      ? isShouldCheck
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : isChecked
                        ? 'border-rose-400 bg-rose-50 text-rose-900'
                        : 'border-slate-200 text-slate-500'
                      : isChecked
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  } ${reviewMode ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base">{optText}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. TRUE / FALSE */}
        {question.type === 'true_false' && (
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {['Đúng', 'Sai'].map((opt) => {
              const isSelected = studentAnswer === opt;
              const isCorrectOpt = reviewMode && question.correctAnswer === opt;

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={reviewMode}
                  onClick={() => onChangeAnswer(opt)}
                  className={`py-4 px-6 rounded-2xl border-2 font-bold text-base sm:text-lg text-center transition-all ${
                    reviewMode
                      ? isCorrectOpt
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
                        : isSelected
                        ? 'border-rose-400 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-400'
                      : isSelected
                      ? opt === 'Đúng'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                        : 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  } ${reviewMode ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
                >
                  <span className="text-xl mr-2">{opt === 'Đúng' ? '👍' : '👎'}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 4. FILL IN THE BLANK */}
        {question.type === 'fill_blank' && (
          <div className="max-w-md">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              Nhập đáp án của em vào đây:
            </label>
            <input
              type="text"
              disabled={reviewMode}
              value={studentAnswer || ''}
              onChange={(e) => onChangeAnswer(e.target.value)}
              placeholder="Nhập câu trả lời..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none text-base font-bold text-slate-800 bg-white disabled:bg-slate-100"
            />
          </div>
        )}

        {/* 5. SHORT ANSWER */}
        {question.type === 'short_answer' && (
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              Lời giải / Câu trả lời của em:
            </label>
            <textarea
              rows={3}
              disabled={reviewMode}
              value={studentAnswer || ''}
              onChange={(e) => onChangeAnswer(e.target.value)}
              placeholder="Em hãy viết câu trả lời ngắn gọn vào đây..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none text-sm sm:text-base font-medium text-slate-800 bg-white disabled:bg-slate-100"
            />
          </div>
        )}

        {/* 6. MATCHING (Nối đáp án) */}
        {question.type === 'matching' && question.matchingPairs && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              Cách làm: Nhấp vào ô ở <strong>Cột Trái</strong>, sau đó nhấp vào ô tương ứng ở <strong>Cột Phải</strong> để nối cặp.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cột A</div>
                {question.matchingPairs.map((p) => {
                  const currentRight = studentAnswer?.[p.left];
                  const isSelected = selectedLeft === p.left;
                  return (
                    <div
                      key={p.left}
                      onClick={() => handleMatchingSelectLeft(p.left)}
                      className={`p-3 rounded-xl border-2 text-sm font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 text-indigo-900'
                          : currentRight
                          ? 'border-teal-400 bg-teal-50/50 text-teal-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      } ${reviewMode ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span>{p.left}</span>
                      {currentRight ? (
                        <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md font-bold">
                          ➔ {currentRight}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Chọn</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cột B</div>
                {/* Display shuffled or unique right items */}
                {Array.from(new Set(question.matchingPairs.map((p) => p.right))).map((rightItem) => (
                  <button
                    key={rightItem}
                    type="button"
                    disabled={reviewMode || !selectedLeft}
                    onClick={() => handleMatchingSelectRight(rightItem)}
                    className={`w-full p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                      selectedLeft
                        ? 'border-indigo-300 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 cursor-pointer'
                        : 'border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {rightItem}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Matched Pairs list */}
            {studentAnswer && Object.keys(studentAnswer).length > 0 && (
              <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-600 mb-2 flex items-center justify-between">
                  <span>Các cặp em đã nối:</span>
                  {!reviewMode && (
                    <button
                      type="button"
                      onClick={() => onChangeAnswer({})}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Nối lại từ đầu
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(studentAnswer).map(([l, r]) => (
                    <span
                      key={l}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-teal-300 text-teal-900 rounded-xl text-xs font-bold shadow-xs"
                    >
                      <span>{l}</span>
                      <span className="text-teal-500">➜</span>
                      <span>{String(r)}</span>
                      {!reviewMode && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMatchingPair(l)}
                          className="hover:text-rose-600 cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. REORDER (Sắp xếp thứ tự) */}
        {question.type === 'reorder' && (
          <div className="space-y-2 max-w-lg">
            <p className="text-xs text-slate-500 mb-2">
              Bấm nút <strong>Lên</strong> hoặc <strong>Xuống</strong> để sắp xếp theo thứ tự đúng:
            </p>
            {currentSequence.map((item, seqIdx) => (
              <div
                key={item}
                className="flex items-center justify-between p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 font-extrabold text-xs flex items-center justify-center">
                    {seqIdx + 1}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-slate-800">{item}</span>
                </div>
                {!reviewMode && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={seqIdx === 0}
                      onClick={() => handleMoveSequence(seqIdx, seqIdx - 1)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Chuyển lên"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={seqIdx === currentSequence.length - 1}
                      onClick={() => handleMoveSequence(seqIdx, seqIdx + 1)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Chuyển xuống"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REVIEW MODE: Answer and explanation */}
      {reviewMode && (
        <div className="mt-5 pt-4 border-t border-slate-200/80 text-xs sm:text-sm">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Đáp án đúng:</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg font-mono text-sm border border-emerald-200">
                {Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.join(', ')
                  : question.type === 'matching' && question.matchingPairs
                  ? question.matchingPairs.map((p) => `${p.left} ➔ ${p.right}`).join('; ')
                  : String(question.correctAnswer)}
              </span>
            </div>
            {question.explanation && (
              <div className="text-slate-600 pt-1">
                <strong className="text-slate-700">Giải thích:</strong> {question.explanation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
