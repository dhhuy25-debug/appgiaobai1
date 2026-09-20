import React, { useState } from 'react';
import { Assignment, SchoolClass, Student, Question, QuestionType } from '../../types';
import { storageService } from '../../services/storage';
import { AssignmentDetailModal } from './AssignmentDetailModal';
import { QuestionEditor } from './QuestionEditor';
import {
  Plus,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Copy,
  Check,
  Link,
  Trash2,
  Eye,
  Settings,
  Share2,
  QrCode,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  FileQuestion,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronDown
} from 'lucide-react';

interface AssignmentManagerProps {
  assignments: Assignment[];
  classes: SchoolClass[];
  students: Student[];
  onRefresh: () => void;
  openCreateImmediately?: boolean;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  assignments,
  classes,
  students,
  onRefresh,
  openCreateImmediately = false
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(openCreateImmediately);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [selectedDetailAssignment, setSelectedDetailAssignment] = useState<Assignment | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form states for creating assignment
  const [title, setTitle] = useState<string>('');
  const [subject, setSubject] = useState<string>('Toán');
  const [formClass, setFormClass] = useState<string>(classes[0]?.name || '5/9');
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [noTimeLimit, setNoTimeLimit] = useState<boolean>(false);
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [showAnswer, setShowAnswer] = useState<boolean>(true);
  const [autoGrade, setAutoGrade] = useState<boolean>(true);
  const [targetAudience, setTargetAudience] = useState<'class' | 'group' | 'specific'>('class');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(20, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  // Questions for new assignment
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q-new-1',
      type: 'single_choice',
      prompt: 'Tính: 15,4 + 8,25 = ?',
      options: [
        { id: 'A', text: '23,65' },
        { id: 'B', text: '23,55' },
        { id: 'C', text: '24,65' },
        { id: 'D', text: '22,65' }
      ],
      correctAnswer: 'A',
      explanation: 'Ta đặt tính: 15,40 + 8,25 = 23,65.',
      points: 2
    },
    {
      id: 'q-new-2',
      type: 'true_false',
      prompt: 'Phân số 3/4 viết dưới dạng số thập phân là 0,75. Đúng hay sai?',
      options: ['Đúng', 'Sai'],
      correctAnswer: 'Đúng',
      explanation: '3 chia 4 bằng 0,75.',
      points: 2
    }
  ]);

  // Track expanded questions in the builder
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'q-new-1': true,
    'q-new-2': false
  });

  const toggleExpandQuestion = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    const updated: Record<string, boolean> = {};
    questions.forEach((q) => {
      updated[q.id] = true;
    });
    setExpandedIds(updated);
  };

  const handleCollapseAll = () => {
    setExpandedIds({});
  };

  // Add Question by Type
  const handleAddQuestionWithType = (type: QuestionType) => {
    const newId = `q-${Date.now()}`;
    let newQ: Question = {
      id: newId,
      type,
      prompt: '',
      points: 2
    };

    if (type === 'single_choice' || type === 'image_question' || type === 'audio_question' || type === 'video_question') {
      newQ.options = [
        { id: 'A', text: 'Phương án A' },
        { id: 'B', text: 'Phương án B' },
        { id: 'C', text: 'Phương án C' },
        { id: 'D', text: 'Phương án D' }
      ];
      newQ.correctAnswer = 'A';
    } else if (type === 'multiple_choice') {
      newQ.options = [
        { id: 'A', text: 'Phương án A' },
        { id: 'B', text: 'Phương án B' },
        { id: 'C', text: 'Phương án C' },
        { id: 'D', text: 'Phương án D' }
      ];
      newQ.correctAnswer = ['A'];
    } else if (type === 'true_false') {
      newQ.options = ['Đúng', 'Sai'];
      newQ.correctAnswer = 'Đúng';
    } else if (type === 'fill_blank') {
      newQ.correctAnswer = '';
    } else if (type === 'matching') {
      newQ.matchingPairs = [
        { id: 'm-1', left: 'Vế trái 1', right: 'Vế phải 1' },
        { id: 'm-2', left: 'Vế trái 2', right: 'Vế phải 2' },
        { id: 'm-3', left: 'Vế trái 3', right: 'Vế phải 3' }
      ];
    } else if (type === 'reorder') {
      newQ.sequenceItems = ['Bước 1', 'Bước 2', 'Bước 3'];
      newQ.correctAnswer = ['Bước 1', 'Bước 2', 'Bước 3'];
    }

    setQuestions([...questions, newQ]);
    setExpandedIds((prev) => ({ ...prev, [newId]: true }));
    showToast(`Đã thêm 1 câu hỏi (${type}) vào đề!`);
  };

  // Duplicate Question
  const handleDuplicateQuestion = (idx: number) => {
    const source = questions[idx];
    const newId = `q-${Date.now()}`;
    const cloned: Question = JSON.parse(JSON.stringify(source));
    cloned.id = newId;
    cloned.prompt = `${cloned.prompt} (Bản sao)`;

    const updated = [...questions];
    updated.splice(idx + 1, 0, cloned);
    setQuestions(updated);
    setExpandedIds((prev) => ({ ...prev, [newId]: true }));
    showToast(`Đã nhân bản câu hỏi số ${idx + 1}!`);
  };

  // Move Question
  const handleMoveQuestion = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= questions.length) return;
    const updated = [...questions];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setQuestions(updated);
  };

  // Update Question
  const handleQuestionChange = (idx: number, updatedQ: Question) => {
    const updated = [...questions];
    updated[idx] = updatedQ;
    setQuestions(updated);
  };

  // Remove question
  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      showToast('Đề bài cần ít nhất 1 câu hỏi!');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Presets
  const handleLoadMathPreset = () => {
    setTitle('Ôn tập Phân số thập phân & Số thập phân - Lớp 5');
    setSubject('Toán');
    setQuestions([
      {
        id: `q-m1-${Date.now()}`,
        type: 'single_choice',
        prompt: 'Tính giá trị của biểu thức: 15,4 + 8,25 = ?',
        options: [
          { id: 'A', text: '23,65' },
          { id: 'B', text: '23,55' },
          { id: 'C', text: '24,65' },
          { id: 'D', text: '22,65' }
        ],
        correctAnswer: 'A',
        explanation: 'Ta đặt tính thẳng cột dấu phẩy: 15,40 + 8,25 = 23,65.',
        points: 2
      },
      {
        id: `q-m2-${Date.now()}`,
        type: 'multiple_choice',
        prompt: 'Những phân số nào dưới đây có thể viết thành phân số thập phân? (Chọn tất cả đáp án đúng)',
        options: [
          { id: 'A', text: '3/5 (nhân cả tử và mẫu với 2 thành 6/10)' },
          { id: 'B', text: '1/4 (nhân cả tử và mẫu với 25 thành 25/100)' },
          { id: 'C', text: '7/15 (mẫu số chứa thừa số 3)' },
          { id: 'D', text: '9/20 (nhân cả tử và mẫu với 5 thành 45/100)' }
        ],
        correctAnswer: ['A', 'B', 'D'],
        explanation: 'Các phân số có mẫu số chuyển đổi được về 10, 100, 1000... là phân số thập phân.',
        points: 2.5
      },
      {
        id: `q-m3-${Date.now()}`,
        type: 'true_false',
        prompt: 'Phân số 3/4 viết dưới dạng số thập phân là 0,75. Nhận định này Đúng hay Sai?',
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Đúng',
        explanation: 'Lấy tử số chia cho mẫu số: 3 chia 4 bằng 0,75.',
        points: 1.5
      },
      {
        id: `q-m4-${Date.now()}`,
        type: 'fill_blank',
        prompt: 'Tìm số x biết: x - 4,5 = 2,5. Giá trị của x là:',
        correctAnswer: '7',
        explanation: 'x = 2,5 + 4,5 = 7',
        points: 2
      },
      {
        id: `q-m5-${Date.now()}`,
        type: 'matching',
        prompt: 'Nối phân số ở Cột A với tỉ số phần trăm tương ứng ở Cột B:',
        matchingPairs: [
          { id: 'm-1', left: 'Phân số 1/2', right: '50%' },
          { id: 'm-2', left: 'Phân số 1/4', right: '25%' },
          { id: 'm-3', left: 'Phân số 3/4', right: '75%' },
          { id: 'm-4', left: 'Phân số 1/5', right: '20%' }
        ],
        explanation: '1/2 = 50%, 1/4 = 25%, 3/4 = 75%, 1/5 = 20%',
        points: 2
      }
    ]);
    handleExpandAll();
    showToast('Đã nạp bộ đề mẫu Toán 5 chuẩn (5 dạng câu hỏi đa dạng)!');
  };

  const handleLoadVietnamesePreset = () => {
    setTitle('Luyện từ và câu: Từ đồng nghĩa & Thành ngữ - Lớp 5');
    setSubject('Tiếng Việt');
    setQuestions([
      {
        id: `q-v1-${Date.now()}`,
        type: 'single_choice',
        prompt: 'Cặp từ nào dưới đây là cặp từ đồng nghĩa hoàn toàn?',
        options: [
          { id: 'A', text: 'xe lửa - tàu hỏa' },
          { id: 'B', text: 'chăm chỉ - lười biếng' },
          { id: 'C', text: 'cao lớn - thấp bé' },
          { id: 'D', text: 'nhà cửa - ruộng đồng' }
        ],
        correctAnswer: 'A',
        explanation: 'Xe lửa và tàu hỏa là hai từ đồng nghĩa hoàn toàn, có thể thay thế cho nhau.',
        points: 2.5
      },
      {
        id: `q-v2-${Date.now()}`,
        type: 'multiple_choice',
        prompt: 'Những từ nào dưới đây đồng nghĩa với từ "Tổ quốc"? (Tích chọn tất cả đáp án đúng)',
        options: [
          { id: 'A', text: 'Đất nước' },
          { id: 'B', text: 'Non sông' },
          { id: 'C', text: 'Giang sơn' },
          { id: 'D', text: 'Gia đình' }
        ],
        correctAnswer: ['A', 'B', 'C'],
        explanation: 'Đất nước, non sông, giang sơn đều là các từ đồng nghĩa với Tổ quốc.',
        points: 2.5
      },
      {
        id: `q-v3-${Date.now()}`,
        type: 'true_false',
        prompt: 'Từ "chạy" trong câu "Bé chạy lon ton trên sân trường" được dùng theo nghĩa chuyển. Đúng hay Sai?',
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Sai',
        explanation: 'Đây là nghĩa gốc chỉ hoạt động di chuyển nhanh của người bằng chân.',
        points: 2
      },
      {
        id: `q-v4-${Date.now()}`,
        type: 'fill_blank',
        prompt: 'Điền từ còn thiếu vào câu thành ngữ: "Uống nước nhớ ......"',
        correctAnswer: 'nguồn',
        explanation: 'Câu tục ngữ hoàn chỉnh: "Uống nước nhớ nguồn".',
        points: 3
      }
    ]);
    handleExpandAll();
    showToast('Đã nạp bộ đề mẫu Tiếng Việt 5 phong phú!');
  };

  const handleLoadSciencePreset = () => {
    setTitle('Khoa học: Sự biến đổi của chất & Nguồn năng lượng');
    setSubject('Khoa học');
    setQuestions([
      {
        id: `q-s1-${Date.now()}`,
        type: 'single_choice',
        prompt: 'Hiện tượng nào dưới đây là ví dụ điển hình về sự biến đổi hóa học?',
        options: [
          { id: 'A', text: 'Đinh sắt để ngoài không khí ẩm bị gỉ sét màu nâu' },
          { id: 'B', text: 'Nước đá trong tủ lạnh tan chảy thành nước lỏng' },
          { id: 'C', text: 'Cắt nhỏ một tờ giấy trắng thành nhiều mảnh vụn' },
          { id: 'D', text: 'Đun sôi nước bốc thành hơi nước trên nắp vung' }
        ],
        correctAnswer: 'A',
        explanation: 'Đinh sắt gỉ sinh ra chất mới (gỉ sắt có màu nâu đỏ) nên là biến đổi hóa học.',
        points: 2.5
      },
      {
        id: `q-s2-${Date.now()}`,
        type: 'true_false',
        prompt: 'Khi đun đường trên chảo đến khi đường cháy khét thành than đen thì đó là sự biến đổi hóa học. Đúng hay sai?',
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Đúng',
        explanation: 'Đường bị cháy sinh ra chất mới có màu đen và mùi khét.',
        points: 2.5
      },
      {
        id: `q-s3-${Date.now()}`,
        type: 'matching',
        prompt: 'Nối nguồn năng lượng ở Cột A với ứng dụng thực tế ở Cột B:',
        matchingPairs: [
          { id: 'm-s1', left: 'Năng lượng Mặt Trời', right: 'Pin mặt trời, sấy khô nông sản' },
          { id: 'm-s2', left: 'Năng lượng gió', right: 'Làm quay cánh quạt cối xay gió phát điện' },
          { id: 'm-s3', left: 'Năng lượng nước chảy', right: 'Chạy tuabin nhà máy thủy điện' }
        ],
        explanation: 'Các nguồn năng lượng sạch được ứng dụng phục vụ đời sống.',
        points: 2.5
      },
      {
        id: `q-s4-${Date.now()}`,
        type: 'short_answer',
        prompt: 'Nêu ít nhất 2 việc làm thiết thực của em và gia đình để sử dụng tiết kiệm điện năng?',
        correctAnswer: 'Tắt đèn quạt khi ra khỏi phòng, tận dụng ánh sáng mặt trời',
        explanation: 'Học sinh nêu các hành động tiết kiệm điện.',
        points: 2.5
      }
    ]);
    handleExpandAll();
    showToast('Đã nạp bộ đề mẫu Khoa học 5!');
  };

  // Handle Copy Code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Handle Copy Link
  const handleCopyLink = (code: string) => {
    const directUrl = `${window.location.origin}${window.location.pathname}?join=${code}`;
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Submit Create Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Vui lòng nhập tên bài tập!');
      return;
    }

    if (questions.length === 0) {
      showToast('Vui lòng tạo ít nhất 1 câu hỏi cho bài tập!');
      return;
    }

    // Validate prompt completeness
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        showToast(`Vui lòng nhập nội dung đề bài cho Câu số ${i + 1}!`);
        setExpandedIds((prev) => ({ ...prev, [q.id]: true }));
        return;
      }

      if (q.type === 'single_choice' || q.type === 'image_question' || q.type === 'audio_question' || q.type === 'video_question') {
        if (!q.correctAnswer) {
          showToast(`Vui lòng chọn 1 đáp án đúng cho Câu số ${i + 1}!`);
          setExpandedIds((prev) => ({ ...prev, [q.id]: true }));
          return;
        }
      } else if (q.type === 'multiple_choice') {
        if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
          showToast(`Vui lòng tích chọn ít nhất 1 đáp án đúng cho Câu số ${i + 1}!`);
          setExpandedIds((prev) => ({ ...prev, [q.id]: true }));
          return;
        }
      } else if (q.type === 'fill_blank') {
        if (!String(q.correctAnswer || '').trim()) {
          showToast(`Vui lòng nhập đáp án cần điền cho Câu số ${i + 1}!`);
          setExpandedIds((prev) => ({ ...prev, [q.id]: true }));
          return;
        }
      }
    }

    const matchedCls = classes.find((c) => c.name === formClass);
    const code = storageService.generateAssignmentCode(subject, formClass);

    const currentSettings = storageService.getSettings();

    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
      code,
      title: title.trim(),
      subject,
      classId: matchedCls ? matchedCls.id : `cls-${formClass}`,
      className: formClass,
      teacherId: 't-01',
      teacherName: currentSettings.teacherName || 'Thầy Nguyễn Văn Huy',
      startDate: new Date().toISOString().slice(0, 16),
      dueDate: dueDate,
      durationMinutes: noTimeLimit ? 0 : durationMinutes,
      maxAttempts: maxAttempts,
      showAnswer: showAnswer,
      autoGrade: autoGrade,
      targetAudience: targetAudience,
      targetStudentIds: targetAudience !== 'class' ? selectedStudentIds : undefined,
      questions: questions,
      status: 'active' as const,
      createdAt: new Date().toISOString()
    };

    storageService.createAssignment(newAssignment);
    setIsCreateModalOpen(false);
    onRefresh();
    showToast(`Đã giao bài tập thành công! Mã: ${code} cho lớp ${formClass}`);
  };

  const handleConfirmDeleteAssignment = () => {
    if (!assignmentToDelete) return;
    const asgTitle = assignmentToDelete.title;
    storageService.deleteAssignment(assignmentToDelete.id);
    setAssignmentToDelete(null);
    onRefresh();
    showToast(`Đã xóa bài tập "${asgTitle}" thành công!`);
  };

  const filtered = assignments.filter((a) => {
    if (selectedClass !== 'all' && a.className !== selectedClass) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Quản Lý & Giao Bài Tập Cho Học Sinh
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Thiết lập câu hỏi, thời hạn làm bài, lấy mã bài tập và link làm bài gửi qua Zalo / Nhóm lớp
          </p>
        </div>

        <button
          id="btn-open-create-asg"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ TẠO BÀI TẬP MỚI</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Lọc theo lớp:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Tất cả bài tập ({assignments.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                Lớp {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên bài, mã bài..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((asg) => {
          const directUrl = `${window.location.origin}${window.location.pathname}?join=${asg.code}`;

          return (
            <div
              key={asg.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-black uppercase">
                      {asg.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                      {asg.code}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Lớp {asg.className}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-800 text-base mb-2">
                  {asg.title}
                </h3>

                <div className="space-y-1 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hạn nộp: <strong className="text-rose-600">{asg.dueDate.replace('T', ' ')}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Thời gian làm: <strong>{asg.durationMinutes > 0 ? `${asg.durationMinutes} phút` : 'Không giới hạn'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                    <span>Số câu hỏi: <strong>{asg.questions.length} câu</strong> ({asg.autoGrade ? 'Chấm tự động' : 'Giáo viên chấm'})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Đối tượng: <strong>{(asg.targetAudience === 'class' || asg.targetAudience === 'all') ? 'Cả lớp' : 'Nhóm học sinh'}</strong></span>
                  </div>
                </div>

                {/* Share bar: Code and Direct Link */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mã: {asg.code}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyCode(asg.code)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      {copiedCode === asg.code ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedCode === asg.code ? 'Đã chép mã' : 'Sao chép mã'}</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(asg.code)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      {copiedLink === asg.code ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Link className="w-3 h-3" />
                      )}
                      <span>{copiedLink === asg.code ? 'Đã chép link' : 'Sao chép link'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDetailAssignment(asg)}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem bài nộp</span>
                </button>

                <button
                  onClick={() => setAssignmentToDelete(asg)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                  title="Xóa bài tập này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Submission Modal */}
      {selectedDetailAssignment && (
        <AssignmentDetailModal
          assignment={selectedDetailAssignment}
          students={students}
          submissions={storageService.getSubmissions()}
          onClose={() => setSelectedDetailAssignment(null)}
        />
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-4xl lg:max-w-5xl bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
                  <FileQuestion className="w-6 h-6 text-indigo-600" />
                  Tạo & Giao Bài Tập Mới
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Thiết kế đề kiểm tra đa dạng loại câu hỏi, tự động chấm điểm và gửi ngay tới Cổng học sinh
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QUICK PRESET TEMPLATES BAR */}
            <div className="mb-6 p-3.5 bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-pink-50/80 rounded-2xl border border-indigo-100 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-indigo-950">
                  Nạp nhanh bộ đề mẫu tiểu học:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadMathPreset}
                  className="px-3 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 text-xs font-extrabold shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  📐 Toán 5 (Phân số & Số thập phân)
                </button>
                <button
                  type="button"
                  onClick={handleLoadVietnamesePreset}
                  className="px-3 py-1.5 rounded-xl bg-white text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 text-xs font-extrabold shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  📖 Tiếng Việt 5 (Từ đồng nghĩa)
                </button>
                <button
                  type="button"
                  onClick={handleLoadSciencePreset}
                  className="px-3 py-1.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-extrabold shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  🔬 Khoa học 5 (Năng lượng)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Tên bài tập *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Ôn tập phép cộng và trừ số thập phân - Tuần 3"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold bg-white"
                  >
                    <option value="Toán">Toán</option>
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Khoa học">Khoa học</option>
                    <option value="Lịch sử & Địa lí">Lịch sử & Địa lí</option>
                    <option value="Tin học">Tin học</option>
                    <option value="Đạo đức">Đạo đức</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp nhận bài *</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn nộp bài *</label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Thời gian làm bài</label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={noTimeLimit}
                        onChange={(e) => setNoTimeLimit(e.target.checked)}
                        className="rounded"
                      />
                      <span>Không giới hạn</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={noTimeLimit}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    min={5}
                    max={180}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold disabled:bg-slate-100"
                    placeholder="Thời gian (phút)"
                  />
                </div>
              </div>

              {/* Tùy chọn nâng cao: Hiển thị đáp án, Chấm tự động, Đối tượng */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                  Cài đặt giao bài & chế độ nộp
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAnswer}
                      onChange={(e) => setShowAnswer(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span>Cho phép học sinh xem đáp án sau khi nộp</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoGrade}
                      onChange={(e) => setAutoGrade(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span>Chấm điểm tự động thang điểm 10</span>
                  </label>
                </div>

                <div className="pt-2">
                  <span className="block font-bold text-slate-700 mb-1">Đối tượng nhận bài:</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="target"
                        checked={targetAudience === 'class'}
                        onChange={() => setTargetAudience('class')}
                      />
                      <span>Cả lớp</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="target"
                        checked={targetAudience === 'group'}
                        onChange={() => setTargetAudience('group')}
                      />
                      <span>Nhóm học sinh</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="target"
                        checked={targetAudience === 'specific'}
                        onChange={() => setTargetAudience('specific')}
                      />
                      <span>Học sinh cụ thể</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* DANH SÁCH CÂU HỎI & BỘ CÔNG CỤ SOẠN THẢO */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                {/* Header & Stats Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-slate-800 text-sm">
                      Nội dung câu hỏi
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-extrabold text-xs shadow-2xs">
                      {questions.length} câu
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                      Tổng: {questions.reduce((sum, q) => sum + (Number(q.points) || 1), 0)} điểm
                    </span>
                    {autoGrade && (
                      <span className="hidden sm:inline-flex px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-[11px]">
                        ✓ Tự động chấm điểm
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExpandAll}
                      className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" /> Mở rộng hết
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleCollapseAll}
                      className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Minimize2 className="w-3.5 h-3.5" /> Thu gọn hết
                    </button>
                  </div>
                </div>

                {/* Quick Add Buttons by Question Type */}
                <div>
                  <div className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                    Thêm nhanh câu hỏi theo loại:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuestionWithType('single_choice')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                    >
                      <span>🔘</span> Trắc nghiệm 1 đáp án
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionWithType('multiple_choice')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                    >
                      <span>☑️</span> Nhiều lựa chọn
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionWithType('true_false')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                    >
                      <span>⚖️</span> Đúng / Sai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionWithType('fill_blank')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                    >
                      <span>✍️</span> Điền chỗ trống
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionWithType('matching')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                    >
                      <span>🔗</span> Nối cặp
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionWithType('reorder')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                    >
                      <span>🔢</span> Sắp xếp
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestionWithType('image_question')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                    >
                      <span>🖼️</span> Có ảnh minh họa
                    </button>
                  </div>
                </div>

                {/* List of Questions with QuestionEditor */}
                <div className="space-y-4">
                  {questions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-600 text-sm">Chưa có câu hỏi nào trong đề bài</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Hãy bấm các nút phía trên hoặc chọn "Nạp đề mẫu" để bắt đầu soạn đề.
                      </p>
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <QuestionEditor
                        key={q.id}
                        question={q}
                        index={idx}
                        total={questions.length}
                        isExpanded={expandedIds[q.id] !== false}
                        onToggleExpand={() => toggleExpandQuestion(q.id)}
                        onChange={(updated) => handleQuestionChange(idx, updated)}
                        onDelete={() => handleRemoveQuestion(idx)}
                        onDuplicate={() => handleDuplicateQuestion(idx)}
                        onMoveUp={() => handleMoveQuestion(idx, idx - 1)}
                        onMoveDown={() => handleMoveQuestion(idx, idx + 1)}
                      />
                    ))
                  )}
                </div>

                {/* Bottom Add Question Button */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleAddQuestionWithType('single_choice')}
                    className="px-5 py-2.5 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm một câu hỏi trắc nghiệm mới</span>
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-medium">
                  Đề bài gồm: <strong className="text-slate-800 font-black">{questions.length} câu hỏi</strong> • Tổng điểm: <strong className="text-indigo-700 font-black">{questions.reduce((sum, q) => sum + (Number(q.points) || 1), 0)} điểm</strong>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-200 cursor-pointer transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>GIAO BÀI TẬP NGAY</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ASSIGNMENT MODAL (In-app modal, avoids window.confirm blocked in iframes) */}
      {assignmentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  Xác nhận xóa bài tập
                </h3>
                <p className="text-xs text-slate-500">Hành động này sẽ xóa dữ liệu bài tập</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 my-4 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tên bài tập:</span>
                <span className="font-bold text-slate-800 text-right">{assignmentToDelete.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã bài tập:</span>
                <span className="font-mono font-bold text-indigo-600">{assignmentToDelete.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lớp được giao:</span>
                <span className="font-bold text-slate-800">Lớp {assignmentToDelete.className}</span>
              </div>
            </div>

            <p className="text-xs text-rose-600 font-medium mb-5">
              ⚠️ Lưu ý: Toàn bộ dữ liệu nộp bài và lịch sử làm bài của học sinh đối với bài tập này cũng sẽ được gỡ bỏ khỏi hệ thống.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAssignmentToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-confirm-delete-assignment"
                onClick={handleConfirmDeleteAssignment}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>XÁC NHẬN XÓA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
