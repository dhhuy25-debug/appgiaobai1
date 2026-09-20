export type QuestionType =
  | 'single_choice'      // 1. Trắc nghiệm 1 đáp án
  | 'multiple_choice'    // 2. Trắc nghiệm nhiều đáp án
  | 'true_false'          // 3. Đúng / Sai
  | 'fill_blank'          // 4. Điền đáp án
  | 'short_answer'        // 5. Câu trả lời ngắn
  | 'matching'            // 6. Nối đáp án
  | 'reorder'             // 7. Sắp xếp thứ tự
  | 'image_question'      // 8. Câu hỏi có hình ảnh
  | 'audio_question'      // 9. Câu hỏi có âm thanh
  | 'video_question';     // 10. Câu hỏi có video

export interface TeacherUser {
  id: string;
  name: string;
  email: string;
  role: 'teacher';
}

export type QuestionOption = string | { id: string; text: string };

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  options?: QuestionOption[];   // For single/multiple choice & true/false
  correctAnswer?: string | string[] | boolean; // For auto-grading
  matchingPairs?: MatchingPair[]; // For matching type
  sequenceItems?: string[];       // For reorder type
  explanation?: string;
  points: number;
}

export type TargetAudienceType = 'all' | 'class' | 'group' | 'specific';

export interface Assignment {
  id: string;
  code: string;                 // e.g. TOAN5-260919-A7K
  title: string;
  subject: string;              // Toán, Tiếng Việt, Tiếng Anh, Khoa học, etc.
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  startDate: string;            // ISO or YYYY-MM-DD HH:mm
  dueDate: string;              // ISO or YYYY-MM-DD HH:mm
  durationMinutes: number;      // 0 = unlimited
  maxAttempts: number;          // 1, 2, or unlimited (0)
  showAnswer: boolean;          // Teacher chooses whether to show correct answers after submission
  autoGrade: boolean;           // Teacher chooses auto-grading
  targetAudience: TargetAudienceType;
  targetStudentIds?: string[];  // When target is specific or group
  questions: Question[];
  status?: 'active' | 'archived';
  createdAt: string;
}

export type SubmissionStatus = 'in_progress' | 'submitted' | 'late' | 'graded';

export interface AnswerRecord {
  questionId: string;
  studentAnswer: any; // string, string[], boolean, object etc.
  isCorrect?: boolean;
  scoreAwarded?: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentCode: string;
  assignmentTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  startedAt: string;
  submittedAt?: string;
  lastSavedAt: string;
  durationSeconds: number;
  status: SubmissionStatus;
  answers: Record<string, any>; // questionId -> answer
  score?: number;               // 0 - 10
  correctCount?: number;
  totalQuestions: number;
  attemptNumber: number;
  evaluation?: 'excellent' | 'completed' | 'need_effort'; // Hoàn thành tốt, Hoàn thành, Cần cố gắng
}

export interface Student {
  id: string;
  fullName: string;
  studentCode: string;          // e.g. HS001
  classId: string;
  className: string;
  gender: 'nam' | 'nu';
  dob?: string;
  parentPhone?: string;
  status: 'active' | 'locked';
  createdAt: string;
}

export interface SchoolClass {
  id: string;
  name: string;                 // e.g. 5/9, 5/1
  grade: number;                // 5
  academicYear: string;
  studentCount: number;
}

export interface NotificationItem {
  id: string;
  targetClassId: string;
  targetStudentId?: string;
  title: string;
  message: string;
  type: 'new_assignment' | 'due_soon' | 'overdue' | 'system';
  assignmentId?: string;
  assignmentCode?: string;
  createdAt: string;
  read: boolean;
}

export interface GradeThresholds {
  needEffortMax: number;   // default 4.9 (< 5.0: Cần cố gắng)
  completedMax: number;    // default 7.9 (5.0 - 7.9: Hoàn thành)
  excellentMin: number;    // default 8.0 (8.0 - 10.0: Hoàn thành tốt)
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AppSettings {
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
  gradeThresholds: GradeThresholds;
  allowStudentViewLeaderboard: boolean;
  showLeaderboardToStudents?: boolean;
  syncEnabled?: boolean;
  excellentThreshold?: number;
  completedThreshold?: number;
  firebaseConfig?: FirebaseConfig;
  useFirebase: boolean;
}

export type SystemSettings = AppSettings;
