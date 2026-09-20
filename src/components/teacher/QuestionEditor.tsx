import React, { useState } from 'react';
import { Question, QuestionType, QuestionOption, MatchingPair } from '../../types';
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Volume2,
  Video,
  HelpCircle,
  Sparkles,
  Link,
  AlignLeft,
  ListOrdered,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

interface QuestionEditorProps {
  question: Question;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (updated: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const QUESTION_TYPE_LABELS: Record<QuestionType, { label: string; icon: string; desc: string }> = {
  single_choice: {
    label: 'Trắc nghiệm 1 đáp án đúng',
    icon: '🔘',
    desc: 'Học sinh chọn 1 trong các phương án A, B, C, D...'
  },
  multiple_choice: {
    label: 'Trắc nghiệm nhiều lựa chọn',
    icon: '☑️',
    desc: 'Có thể có nhiều hơn 1 đáp án đúng (chọn nhiều)'
  },
  true_false: {
    label: 'Đúng / Sai',
    icon: '⚖️',
    desc: 'Lựa chọn phương án Đúng hoặc Sai'
  },
  fill_blank: {
    label: 'Điền vào chỗ trống',
    icon: '✍️',
    desc: 'Học sinh nhập từ, số hoặc cụm từ còn thiếu'
  },
  short_answer: {
    label: 'Trả lời ngắn / Tự luận',
    icon: '📝',
    desc: 'Học sinh tự viết câu trả lời ngắn gọn'
  },
  matching: {
    label: 'Nối cặp tương ứng',
    icon: '🔗',
    desc: 'Nối các mục ở Cột A với Cột B tương ứng'
  },
  reorder: {
    label: 'Sắp xếp thứ tự',
    icon: '🔢',
    desc: 'Sắp xếp lại các bước hoặc sự kiện theo thứ tự chuẩn'
  },
  image_question: {
    label: 'Câu hỏi có hình ảnh minh họa',
    icon: '🖼️',
    desc: 'Kèm ảnh đồ thị, sơ đồ, hình học, tranh vẽ'
  },
  audio_question: {
    label: 'Câu hỏi có âm thanh',
    icon: '🔊',
    desc: 'Kèm tệp nghe phát âm, bài nghe Tiếng Anh'
  },
  video_question: {
    label: 'Câu hỏi có video',
    icon: '🎬',
    desc: 'Kèm video bài giảng hoặc thí nghiệm thực hành'
  }
};

const SAMPLE_IMAGES = [
  { name: 'Đồng hồ xem giờ', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80' },
  { name: 'Hình học & Thước kẻ', url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80' },
  { name: 'Thiên nhiên sinh thái', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Trái đất & Bản đồ', url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80' }
];

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  total,
  isExpanded,
  onToggleExpand,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown
}) => {
  // Normalize options to object form { id, text }
  const getNormalizedOptions = (): { id: string; text: string }[] => {
    if (!question.options || question.options.length === 0) {
      return [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' }
      ];
    }
    return question.options.map((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      if (typeof opt === 'string') {
        return { id: letter, text: opt };
      }
      return { id: opt.id || letter, text: opt.text || '' };
    });
  };

  const options = getNormalizedOptions();

  // Handle changing question type
  const handleTypeChange = (newType: QuestionType) => {
    let updated: Question = {
      ...question,
      type: newType
    };

    // Initialize default states according to type
    if (newType === 'single_choice' || newType === 'image_question' || newType === 'audio_question' || newType === 'video_question') {
      if (!question.options || question.options.length < 2) {
        updated.options = [
          { id: 'A', text: 'Phương án A' },
          { id: 'B', text: 'Phương án B' },
          { id: 'C', text: 'Phương án C' },
          { id: 'D', text: 'Phương án D' }
        ];
      }
      if (typeof question.correctAnswer !== 'string' || !question.correctAnswer) {
        updated.correctAnswer = 'A';
      }
    } else if (newType === 'multiple_choice') {
      if (!question.options || question.options.length < 2) {
        updated.options = [
          { id: 'A', text: 'Phương án A' },
          { id: 'B', text: 'Phương án B' },
          { id: 'C', text: 'Phương án C' },
          { id: 'D', text: 'Phương án D' }
        ];
      }
      if (!Array.isArray(question.correctAnswer)) {
        updated.correctAnswer = ['A'];
      }
    } else if (newType === 'true_false') {
      updated.options = ['Đúng', 'Sai'];
      if (typeof question.correctAnswer !== 'string' || (question.correctAnswer !== 'Đúng' && question.correctAnswer !== 'Sai')) {
        updated.correctAnswer = 'Đúng';
      }
    } else if (newType === 'fill_blank') {
      if (typeof question.correctAnswer !== 'string') {
        updated.correctAnswer = '';
      }
    } else if (newType === 'matching') {
      if (!question.matchingPairs || question.matchingPairs.length === 0) {
        updated.matchingPairs = [
          { id: 'm-1', left: 'Vế trái 1', right: 'Vế phải 1' },
          { id: 'm-2', left: 'Vế trái 2', right: 'Vế phải 2' },
          { id: 'm-3', left: 'Vế trái 3', right: 'Vế phải 3' }
        ];
      }
    } else if (newType === 'reorder') {
      if (!question.sequenceItems || question.sequenceItems.length === 0) {
        updated.sequenceItems = ['Bước 1', 'Bước 2', 'Bước 3'];
        updated.correctAnswer = ['Bước 1', 'Bước 2', 'Bước 3'];
      }
    }

    onChange(updated);
  };

  // Option text change
  const handleOptionTextChange = (optIdx: number, newText: string) => {
    const newOptions = [...options];
    newOptions[optIdx] = { ...newOptions[optIdx], text: newText };
    onChange({
      ...question,
      options: newOptions
    });
  };

  // Select correct answer for single_choice / image / audio / video
  const handleSelectSingleChoiceCorrect = (optId: string) => {
    onChange({
      ...question,
      correctAnswer: optId
    });
  };

  // Toggle correct answer for multiple_choice
  const handleToggleMultipleChoiceCorrect = (optId: string) => {
    const currentList: string[] = Array.isArray(question.correctAnswer) ? [...question.correctAnswer] : [];
    let updatedList: string[];
    if (currentList.includes(optId)) {
      // Keep at least one correct answer
      if (currentList.length > 1) {
        updatedList = currentList.filter((x) => x !== optId);
      } else {
        updatedList = currentList;
      }
    } else {
      updatedList = [...currentList, optId];
    }
    onChange({
      ...question,
      correctAnswer: updatedList
    });
  };

  // Add new option
  const handleAddOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length);
    const newOptions = [...options, { id: nextLetter, text: `Phương án ${nextLetter}` }];
    onChange({
      ...question,
      options: newOptions
    });
  };

  // Remove option
  const handleRemoveOption = (optIdx: number) => {
    if (options.length <= 2) return;
    const removedId = options[optIdx].id;
    const remaining = options.filter((_, i) => i !== optIdx);
    // Re-letter remaining options to keep A, B, C, D sequence clean
    const reLettered = remaining.map((opt, i) => ({
      id: String.fromCharCode(65 + i),
      text: opt.text
    }));

    let newCorrectAnswer = question.correctAnswer;
    if (question.type === 'multiple_choice' && Array.isArray(question.correctAnswer)) {
      newCorrectAnswer = question.correctAnswer
        .filter((id) => id !== removedId)
        .map((oldId) => {
          const oldIdx = options.findIndex((o) => o.id === oldId);
          if (oldIdx > optIdx) {
            return String.fromCharCode(65 + oldIdx - 1);
          }
          return oldId;
        });
      if (newCorrectAnswer.length === 0) newCorrectAnswer = ['A'];
    } else if (question.correctAnswer === removedId || !reLettered.some((o) => o.id === question.correctAnswer)) {
      newCorrectAnswer = 'A';
    }

    onChange({
      ...question,
      options: reLettered,
      correctAnswer: newCorrectAnswer
    });
  };

  // Reset to 4 default options
  const handleResetFourOptions = () => {
    const newOptions = [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' }
    ];
    onChange({
      ...question,
      options: newOptions,
      correctAnswer: question.type === 'multiple_choice' ? ['A'] : 'A'
    });
  };

  // Matching pair helpers
  const handleMatchingPairChange = (pIdx: number, field: 'left' | 'right', value: string) => {
    const pairs = question.matchingPairs ? [...question.matchingPairs] : [];
    if (pairs[pIdx]) {
      pairs[pIdx] = { ...pairs[pIdx], [field]: value };
      onChange({ ...question, matchingPairs: pairs });
    }
  };

  const handleAddMatchingPair = () => {
    const pairs = question.matchingPairs ? [...question.matchingPairs] : [];
    pairs.push({
      id: `m-${Date.now()}`,
      left: `Vế trái ${pairs.length + 1}`,
      right: `Vế phải ${pairs.length + 1}`
    });
    onChange({ ...question, matchingPairs: pairs });
  };

  const handleRemoveMatchingPair = (pIdx: number) => {
    if (!question.matchingPairs || question.matchingPairs.length <= 2) return;
    const pairs = question.matchingPairs.filter((_, i) => i !== pIdx);
    onChange({ ...question, matchingPairs: pairs });
  };

  // Reorder helpers
  const handleSequenceItemChange = (sIdx: number, value: string) => {
    const items = question.sequenceItems ? [...question.sequenceItems] : [];
    items[sIdx] = value;
    onChange({
      ...question,
      sequenceItems: items,
      correctAnswer: items
    });
  };

  const handleAddSequenceItem = () => {
    const items = question.sequenceItems ? [...question.sequenceItems] : [];
    items.push(`Bước ${items.length + 1}`);
    onChange({
      ...question,
      sequenceItems: items,
      correctAnswer: items
    });
  };

  const handleRemoveSequenceItem = (sIdx: number) => {
    if (!question.sequenceItems || question.sequenceItems.length <= 2) return;
    const items = question.sequenceItems.filter((_, i) => i !== sIdx);
    onChange({
      ...question,
      sequenceItems: items,
      correctAnswer: items
    });
  };

  return (
    <div
      id={`question-editor-card-${question.id}`}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
    >
      {/* Question Header Bar */}
      <div className="p-3.5 sm:p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
            {index + 1}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                Câu hỏi số {index + 1}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-100/70 text-indigo-700 font-bold hidden sm:inline-flex">
                {QUESTION_TYPE_LABELS[question.type]?.icon} {QUESTION_TYPE_LABELS[question.type]?.label}
              </span>
            </div>
            {!isExpanded && (
              <p className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md mt-0.5">
                {question.prompt || '(Chưa nhập nội dung câu hỏi...)'}
              </p>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Points selector */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500">Điểm:</span>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="10"
              value={question.points}
              onChange={(e) => onChange({ ...question, points: parseFloat(e.target.value) || 1 })}
              className="w-12 text-center text-xs font-black text-indigo-700 outline-none"
            />
          </div>

          {/* Move Up/Down */}
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            title="Di chuyển câu hỏi lên trên"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            title="Di chuyển câu hỏi xuống dưới"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
            title="Nhân bản câu hỏi này"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete */}
          {total > 1 && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
              title="Xóa câu hỏi này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Expand/Collapse */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors ml-1"
          >
            {isExpanded ? 'Thu gọn' : 'Chỉnh sửa'}
          </button>
        </div>
      </div>

      {/* Expanded Editor Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* 1. Chọn loại câu hỏi */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              1. Chọn loại câu hỏi:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((typeKey) => {
                const info = QUESTION_TYPE_LABELS[typeKey];
                const isSelected = question.type === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => handleTypeChange(typeKey)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-300'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 text-slate-700'
                    } cursor-pointer`}
                  >
                    <span className="text-lg leading-none mt-0.5">{info.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-tight">{info.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5 truncate">
                        {info.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Nội dung câu hỏi (Prompt) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Nội dung câu hỏi (Đề bài) *
            </label>
            <textarea
              rows={2}
              required
              value={question.prompt}
              onChange={(e) => onChange({ ...question, prompt: e.target.value })}
              placeholder="Nhập nội dung đề bài câu hỏi (Ví dụ: Tính 15,4 + 8,25 = ? hoặc Điền phân số thập phân thích hợp)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50/50"
            />
          </div>

          {/* Đính kèm đa phương tiện (Nếu là loại Image, Audio, Video hoặc người dùng muốn chèn ảnh) */}
          {(question.type === 'image_question' || question.type === 'audio_question' || question.type === 'video_question' || question.imageUrl) && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  Đính kèm tệp đa phương tiện minh họa
                </span>
                {question.imageUrl && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...question, imageUrl: undefined })}
                    className="text-[11px] text-rose-600 hover:underline font-bold"
                  >
                    Gỡ ảnh
                  </button>
                )}
              </div>

              {/* URL Input */}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={question.imageUrl || question.videoUrl || question.audioUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (question.type === 'video_question') onChange({ ...question, videoUrl: val });
                    else if (question.type === 'audio_question') onChange({ ...question, audioUrl: val });
                    else onChange({ ...question, imageUrl: val });
                  }}
                  placeholder="Dán đường link ảnh hoặc video / audio (https://...)"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Sample images quick pick */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500 font-medium">Gợi ý ảnh nhanh:</span>
                {SAMPLE_IMAGES.map((s, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => onChange({ ...question, imageUrl: s.url })}
                    className="text-[10px] px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 font-medium cursor-pointer"
                  >
                    + {s.name}
                  </button>
                ))}
              </div>

              {/* Preview */}
              {question.imageUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white max-w-xs">
                  <img
                    src={question.imageUrl}
                    alt="Preview"
                    className="w-full h-36 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          )}

          {/* 3. KHU VỰC NHẬP PHƯƠNG ÁN & CHỌN ĐÁP ÁN ĐÚNG THEO LOẠI CÂU HỎI */}
          <div className="pt-2 border-t border-slate-100">
            {/* 3.1. TRẮC NGHIỆM 1 ĐÁP ÁN (single_choice & image/audio/video) */}
            {(question.type === 'single_choice' ||
              question.type === 'image_question' ||
              question.type === 'audio_question' ||
              question.type === 'video_question') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      3. Các phương án trả lời & Chọn 1 đáp án đúng:
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Nhấp vào <strong className="text-indigo-600">nút tròn</strong> bên trái để chỉ định phương án đúng.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFourOptions}
                    className="text-[11px] text-indigo-600 hover:underline font-bold cursor-pointer"
                  >
                    Đặt lại 4 lựa chọn (A, B, C, D)
                  </button>
                </div>

                <div className="space-y-2.5">
                  {options.map((opt, optIdx) => {
                    const isCorrect = question.correctAnswer === opt.id || question.correctAnswer === opt.text;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 sm:gap-3 p-2.5 rounded-2xl border transition-all ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-100'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {/* Radio select correct */}
                        <button
                          type="button"
                          onClick={() => handleSelectSingleChoiceCorrect(opt.id)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 cursor-pointer transition-all ${
                            isCorrect
                              ? 'bg-emerald-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title={`Chọn phương án ${opt.id} là đáp án đúng`}
                        >
                          {isCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : opt.id}
                        </button>

                        {/* Input text for option */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            required
                            value={opt.text}
                            onChange={(e) => handleOptionTextChange(optIdx, e.target.value)}
                            placeholder={`Nội dung lựa chọn ${opt.id}...`}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Correct badge */}
                        {isCorrect && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" /> Đáp án đúng
                          </span>
                        )}

                        {/* Delete option button */}
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(optIdx)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                            title="Xóa lựa chọn này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add option button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm phương án {String.fromCharCode(65 + options.length)}</span>
                  </button>

                  <span className="text-[11px] text-slate-500">
                    Đáp án đúng hiện tại: <strong className="text-emerald-700 font-black">Lựa chọn {question.correctAnswer as string}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* 3.2. TRẮC NGHIỆM NHIỀU LỰA CHỌN (multiple_choice) */}
            {question.type === 'multiple_choice' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      3. Các phương án trả lời & Tích chọn các đáp án đúng:
                    </label>
                    <p className="text-[11px] text-indigo-600 font-medium">
                      💡 Tích chọn vào ô vuông bên trái tất cả các phương án đúng (có thể chọn 2 hoặc nhiều đáp án).
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {options.map((opt, optIdx) => {
                    const isChecked =
                      Array.isArray(question.correctAnswer) && question.correctAnswer.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 sm:gap-3 p-2.5 rounded-2xl border transition-all ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-100'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {/* Checkbox select correct */}
                        <button
                          type="button"
                          onClick={() => handleToggleMultipleChoiceCorrect(opt.id)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title={`Tích chọn phương án ${opt.id} là đáp án đúng`}
                        >
                          {isChecked ? <Check className="w-4 h-4 stroke-[3]" /> : opt.id}
                        </button>

                        {/* Input text for option */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            required
                            value={opt.text}
                            onChange={(e) => handleOptionTextChange(optIdx, e.target.value)}
                            placeholder={`Nội dung lựa chọn ${opt.id}...`}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Correct badge */}
                        {isChecked && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" /> Đúng
                          </span>
                        )}

                        {/* Delete option button */}
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(optIdx)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                            title="Xóa lựa chọn này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add option button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm phương án {String.fromCharCode(65 + options.length)}</span>
                  </button>

                  <span className="text-[11px] text-slate-500">
                    Các đáp án đúng: <strong className="text-emerald-700 font-black">{(question.correctAnswer as string[])?.join(', ') || 'Chưa chọn'}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* 3.3. ĐÚNG / SAI (true_false) */}
            {question.type === 'true_false' && (
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  3. Chọn đáp án đúng chuẩn cho câu hỏi này:
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {['Đúng', 'Sai'].map((val) => {
                    const isSelected = String(question.correctAnswer) === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => onChange({ ...question, correctAnswer: val })}
                        className={`p-3.5 rounded-2xl border-2 font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? val === 'Đúng'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                              : 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-200'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">{val === 'Đúng' ? '👍' : '👎'}</span>
                        <span>{val}</span>
                        {isSelected && (
                          <span className="ml-1 text-xs px-2 py-0.5 rounded-md bg-white font-black shadow-2xs">
                            ✓ Đáp án đúng
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3.4. ĐIỀN VÀO CHỖ TRỐNG (fill_blank) */}
            {question.type === 'fill_blank' && (
              <div className="space-y-2 max-w-md">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  3. Đáp án đúng cần điền vào ô trống *
                </label>
                <input
                  type="text"
                  required
                  value={String(question.correctAnswer || '')}
                  onChange={(e) => onChange({ ...question, correctAnswer: e.target.value })}
                  placeholder="Ví dụ: 8 hoặc 0,75 hoặc Phân số thập phân..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-800 bg-white"
                />
                <p className="text-[11px] text-slate-500">
                  ℹ️ Hệ thống tự động so khớp không phân biệt chữ hoa, chữ thường và khoảng trắng thừa.
                </p>
              </div>
            )}

            {/* 3.5. TRẢ LỜI NGẮN (short_answer) */}
            {question.type === 'short_answer' && (
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  3. Đáp án mẫu / Hướng dẫn chấm điểm tự luận ngắn
                </label>
                <textarea
                  rows={2}
                  value={String(question.correctAnswer || '')}
                  onChange={(e) => onChange({ ...question, correctAnswer: e.target.value })}
                  placeholder="Nhập câu trả lời chuẩn hoặc từ khóa bắt buộc để hệ thống chấm điểm / giáo viên xem lại..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 bg-white outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* 3.6. NỐI CẶP TƯƠNG ỨNG (matching) */}
            {question.type === 'matching' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      3. Thiết lập các cặp nối tương ứng (Cột A ➔ Cột B):
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Hệ thống sẽ tự động xáo trộn Cột B khi học sinh làm bài để học sinh nối cặp.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMatchingPair}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm cặp nối
                  </button>
                </div>

                <div className="space-y-2">
                  {question.matchingPairs?.map((pair, pIdx) => (
                    <div
                      key={pair.id || pIdx}
                      className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50"
                    >
                      <span className="w-6 text-center text-xs font-bold text-slate-400">
                        {pIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={pair.left}
                        onChange={(e) => handleMatchingPairChange(pIdx, 'left', e.target.value)}
                        placeholder="Nội dung Cột A..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                      />
                      <span className="text-indigo-600 font-black text-sm">➔</span>
                      <input
                        type="text"
                        value={pair.right}
                        onChange={(e) => handleMatchingPairChange(pIdx, 'right', e.target.value)}
                        placeholder="Nội dung Cột B tương ứng..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                      />
                      {question.matchingPairs && question.matchingPairs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMatchingPair(pIdx)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3.7. SẮP XẾP THỨ TỰ (reorder) */}
            {question.type === 'reorder' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      3. Nhập các bước theo THỨ TỰ ĐÚNG CHUẨN:
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Khi học sinh làm bài, các bước này sẽ được xáo ngẫu nhiên để học sinh kéo thả / sắp xếp lại.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSequenceItem}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm bước
                  </button>
                </div>

                <div className="space-y-2">
                  {question.sequenceItems?.map((item, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50"
                    >
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {sIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleSequenceItemChange(sIdx, e.target.value)}
                        placeholder={`Nội dung bước ${sIdx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                      />
                      {question.sequenceItems && question.sequenceItems.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSequenceItem(sIdx)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Lời giải & Hướng dẫn chi tiết (Explanation) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-600 mb-1">
              4. Lời giải chi tiết / Hướng dẫn giải (Tùy chọn):
            </label>
            <input
              type="text"
              value={question.explanation || ''}
              onChange={(e) => onChange({ ...question, explanation: e.target.value })}
              placeholder="Hiển thị cho học sinh xem sau khi nộp bài để hiểu vì sao đáp án đó đúng..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 outline-none focus:border-indigo-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
