import {
  Assignment,
  SchoolClass,
  Student,
  Submission,
  AppSettings,
  NotificationItem,
  Question,
  GradeThresholds,
  FirebaseConfig
} from '../types';
import {
  initialAssignments,
  initialClasses,
  initialNotifications,
  initialSettings,
  initialStudents,
  initialSubmissions
} from '../mock/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'edu_students_v1',
  ASSIGNMENTS: 'edu_assignments_v1',
  SUBMISSIONS: 'edu_submissions_v1',
  CLASSES: 'edu_classes_v1',
  NOTIFICATIONS: 'edu_notifications_v1',
  SETTINGS: 'edu_settings_v1',
  STUDENT_SESSION: 'edu_student_session_v1',
  TEACHER_SESSION: 'edu_teacher_session_v1'
};

type Listener = (event: { type: string; payload?: any }) => void;

class StorageService {
  private listeners: Set<Listener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.initDefaultData();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('edumanage_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          this.notifyListeners(event.data.type, event.data.payload, false);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(type: string, payload?: any, broadcast = true) {
    this.listeners.forEach((l) => l({ type, payload }));
    if (broadcast && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type, payload });
      } catch (err) {
        console.warn('Broadcast failed', err);
      }
    }
  }

  private initDefaultData() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(initialClasses));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(initialAssignments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(initialSubmissions));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
    }
  }

  // --- CLASSES ---
  public getClasses(): SchoolClass[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return raw ? JSON.parse(raw) : initialClasses;
  }

  public saveClasses(classes: SchoolClass[]) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    this.notifyListeners('CLASSES_UPDATED', classes);
  }

  public addClass(params: { name: string; grade?: number; academicYear?: string }): {
    success: boolean;
    message?: string;
    newClass?: SchoolClass;
  } {
    const classes = this.getClasses();
    const cleanName = params.name.trim();
    if (!cleanName) {
      return { success: false, message: 'Vui lòng nhập tên lớp (ví dụ: 5/9, 4A, 3/2)' };
    }

    const exists = classes.some((c) => c.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      return { success: false, message: `Lớp "${cleanName}" đã tồn tại trên hệ thống!` };
    }

    const newClass: SchoolClass = {
      id: `cls-${cleanName.replace(/[^a-zA-Z0-9]/g, '') || Date.now()}`,
      name: cleanName,
      grade: params.grade || parseInt(cleanName.charAt(0), 10) || 5,
      academicYear: params.academicYear || '2025 - 2026',
      studentCount: 0
    };

    classes.push(newClass);
    this.saveClasses(classes);
    return { success: true, newClass };
  }

  public updateClass(classId: string, updated: { name: string; grade?: number; academicYear?: string }): {
    success: boolean;
    message?: string;
  } {
    const classes = this.getClasses();
    const cleanName = updated.name.trim();
    if (!cleanName) {
      return { success: false, message: 'Tên lớp không được để trống' };
    }

    const idx = classes.findIndex((c) => c.id === classId);
    if (idx === -1) {
      return { success: false, message: 'Không tìm thấy lớp' };
    }

    const oldName = classes[idx].name;
    classes[idx].name = cleanName;
    if (updated.grade) classes[idx].grade = updated.grade;
    if (updated.academicYear) classes[idx].academicYear = updated.academicYear;

    // If name changed, update students belonging to this class
    if (oldName !== cleanName) {
      const students = this.getStudents();
      let hasChange = false;
      students.forEach((s) => {
        if (s.classId === classId || s.className === oldName) {
          s.className = cleanName;
          s.classId = classId;
          hasChange = true;
        }
      });
      if (hasChange) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        this.notifyListeners('STUDENTS_UPDATED', students);
      }
    }

    this.saveClasses(classes);
    this.updateClassStudentCounts();
    return { success: true };
  }

  public deleteClass(classId: string): { success: boolean; message?: string } {
    const students = this.getStudents();
    const classHasStudents = students.some((s) => s.classId === classId || s.className === classId);
    if (classHasStudents) {
      return {
        success: false,
        message: 'Không thể xóa lớp đang có học sinh. Thầy/Cô vui lòng chuyển hoặc xóa hết học sinh trong lớp trước khi xóa lớp!'
      };
    }

    const classes = this.getClasses().filter((c) => c.id !== classId && c.name !== classId);
    this.saveClasses(classes);
    return { success: true };
  }

  // --- STUDENTS ---
  public getStudents(): Student[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : initialStudents;
  }

  public getStudentsByClass(classId: string): Student[] {
    return this.getStudents().filter((s) => s.classId === classId || s.className === classId);
  }

  public getStudentById(id: string): Student | undefined {
    return this.getStudents().find((s) => s.id === id);
  }

  public findStudentByLogin(fullName: string, studentCode: string, className: string): Student | null {
    const normalizedName = fullName.trim().toLowerCase();
    const normalizedCode = studentCode.trim().toUpperCase();
    const normalizedClass = className.trim().toLowerCase();

    return (
      this.getStudents().find((s) => {
        const matchName = s.fullName.trim().toLowerCase() === normalizedName;
        const matchCode = s.studentCode.trim().toUpperCase() === normalizedCode;
        const matchClass = s.className.trim().toLowerCase() === normalizedClass;
        return matchName && matchCode && matchClass;
      }) || null
    );
  }

  public saveStudent(student: Student): { success: boolean; message?: string } {
    const students = this.getStudents();
    const existingCode = students.find(
      (s) => s.studentCode.toUpperCase() === student.studentCode.toUpperCase() && s.id !== student.id
    );
    if (existingCode) {
      return { success: false, message: `Mã học sinh "${student.studentCode}" đã tồn tại trên hệ thống!` };
    }

    const index = students.findIndex((s) => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.push(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    this.updateClassStudentCounts();
    this.notifyListeners('STUDENTS_UPDATED', students);
    return { success: true };
  }

  public deleteStudent(id: string) {
    const students = this.getStudents().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    // Also remove associated submissions to maintain referential integrity
    const submissions = this.getSubmissions().filter((sub) => sub.studentId !== id);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));

    this.updateClassStudentCounts();
    this.notifyListeners('STUDENTS_UPDATED', students);
    this.notifyListeners('SUBMISSIONS_UPDATED', submissions);
  }

  public toggleLockStudent(id: string) {
    const students = this.getStudents().map((s) => {
      if (s.id === id) {
        return { ...s, status: s.status === 'active' ? ('locked' as const) : ('active' as const) };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    this.notifyListeners('STUDENTS_UPDATED', students);
  }

  public importStudents(newStudents: Omit<Student, 'id' | 'createdAt'>[]): { added: number; skipped: number } {
    const current = this.getStudents();
    const codes = new Set(current.map((s) => s.studentCode.toUpperCase()));
    let added = 0;
    let skipped = 0;

    newStudents.forEach((ns, i) => {
      if (codes.has(ns.studentCode.toUpperCase())) {
        skipped++;
      } else {
        codes.add(ns.studentCode.toUpperCase());
        current.push({
          ...ns,
          id: `std-${Date.now()}-${i}`,
          createdAt: new Date().toISOString()
        });
        added++;
      }
    });

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(current));
    this.updateClassStudentCounts();
    this.notifyListeners('STUDENTS_UPDATED', current);
    return { added, skipped };
  }

  public generateNextStudentCode(): string {
    const students = this.getStudents();
    let max = 0;
    students.forEach((s) => {
      const match = s.studentCode.match(/HS(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    });
    return `HS${String(max + 1).padStart(3, '0')}`;
  }

  private updateClassStudentCounts() {
    const classes = this.getClasses();
    const students = this.getStudents();
    const updated = classes.map((c) => {
      const count = students.filter((s) => s.classId === c.id || s.className === c.name).length;
      return { ...c, studentCount: count };
    });
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updated));
  }

  // --- ASSIGNMENTS ---
  public getAssignments(): Assignment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return raw ? JSON.parse(raw) : initialAssignments;
  }

  public getAssignmentsForStudent(student: Student): Assignment[] {
    const all = this.getAssignments();
    return all.filter((a) => {
      // Check class match
      const classMatch = a.classId === student.classId || a.className === student.className;
      if (!classMatch) return false;

      // Check audience
      if (a.targetAudience === 'all') return true;
      if (a.targetAudience === 'specific' || a.targetAudience === 'group') {
        return a.targetStudentIds?.includes(student.id);
      }
      return true;
    });
  }

  public getAssignmentByCode(code: string): Assignment | undefined {
    return this.getAssignments().find((a) => a.code.toUpperCase() === code.trim().toUpperCase());
  }

  public getAssignmentById(id: string): Assignment | undefined {
    return this.getAssignments().find((a) => a.id === id);
  }

  public saveAssignment(assignment: Assignment) {
    const list = this.getAssignments();
    const idx = list.findIndex((a) => a.id === assignment.id);
    if (idx >= 0) {
      list[idx] = assignment;
    } else {
      list.unshift(assignment);
      // Create a notification for students in that class
      this.addNotification({
        id: `notif-${Date.now()}`,
        targetClassId: assignment.classId,
        title: `Bài tập mới từ ${assignment.teacherName}`,
        message: `${assignment.teacherName} vừa giao bài mới: "${assignment.subject} – ${assignment.title}". Hạn nộp: ${assignment.dueDate.replace('T', ' ')}`,
        type: 'new_assignment',
        assignmentId: assignment.id,
        assignmentCode: assignment.code,
        createdAt: new Date().toISOString(),
        read: false
      });
    }
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
    this.notifyListeners('ASSIGNMENTS_UPDATED', list);
  }

  public deleteAssignment(id: string) {
    const list = this.getAssignments().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(list));
    this.notifyListeners('ASSIGNMENTS_UPDATED', list);
  }

  public generateAssignmentCode(subject: string, className: string): string {
    const subjectPrefixMap: Record<string, string> = {
      'Toán': 'TOAN',
      'Tiếng Việt': 'TV',
      'Tiếng Anh': 'TA',
      'Khoa học': 'KH',
      'Lịch sử & Địa lý': 'LSDL',
      'Tin học': 'TIN',
      'Đạo đức': 'DD',
      'Hoạt động trải nghiệm': 'HDTN'
    };
    const prefix = subjectPrefixMap[subject] || 'BT';
    const gradeClean = className.replace(/[^a-zA-Z0-9]/g, '');
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}`;
    const randomKey = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${gradeClean}-${dateStr}-${randomKey}`;
  }

  // --- SUBMISSIONS & AUTO-SAVE & GRADING ---
  public getSubmissions(): Submission[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return raw ? JSON.parse(raw) : initialSubmissions;
  }

  public getSubmissionsByAssignment(assignmentId: string): Submission[] {
    return this.getSubmissions().filter((s) => s.assignmentId === assignmentId);
  }

  public getSubmissionForStudent(assignmentId: string, studentId: string): Submission | undefined {
    return this.getSubmissions().find(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId
    );
  }

  /**
   * Auto-saves the draft answers of the student during quiz taking.
   * Restores immediately on refresh or accidental exit.
   */
  public autoSaveSubmissionDraft(params: {
    assignment: Assignment;
    student: Student;
    answers: Record<string, any>;
    durationSeconds: number;
  }): Submission {
    const submissions = this.getSubmissions();
    const existingIdx = submissions.findIndex(
      (s) => s.assignmentId === params.assignment.id && s.studentId === params.student.id
    );

    const nowIso = new Date().toISOString();
    let submission: Submission;

    if (existingIdx >= 0) {
      submission = {
        ...submissions[existingIdx],
        answers: { ...submissions[existingIdx].answers, ...params.answers },
        durationSeconds: params.durationSeconds,
        lastSavedAt: nowIso,
        status: submissions[existingIdx].status === 'submitted' || submissions[existingIdx].status === 'late'
          ? submissions[existingIdx].status
          : 'in_progress'
      };
      submissions[existingIdx] = submission;
    } else {
      submission = {
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        assignmentId: params.assignment.id,
        assignmentCode: params.assignment.code,
        assignmentTitle: params.assignment.title,
        subject: params.assignment.subject,
        studentId: params.student.id,
        studentName: params.student.fullName,
        studentCode: params.student.studentCode,
        className: params.student.className,
        startedAt: nowIso,
        lastSavedAt: nowIso,
        durationSeconds: params.durationSeconds,
        status: 'in_progress',
        answers: params.answers,
        totalQuestions: params.assignment.questions.length,
        attemptNumber: 1
      };
      submissions.push(submission);
    }

    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    this.notifyListeners('SUBMISSION_AUTOSAVED', submission);
    return submission;
  }

  /**
   * Final submission with automatic grading and evaluation calculation.
   */
  public submitAssignment(params: {
    assignment: Assignment;
    student: Student;
    answers: Record<string, any>;
    durationSeconds: number;
  }): { submission: Submission; score: number; correctCount: number; evaluation: string } {
    const submissions = this.getSubmissions();
    const existingIdx = submissions.findIndex(
      (s) => s.assignmentId === params.assignment.id && s.studentId === params.student.id
    );

    const now = new Date();
    const isLate = params.assignment.dueDate ? now > new Date(params.assignment.dueDate) : false;

    // Automatic grading
    const { score, correctCount } = this.calculateGrade(params.assignment.questions, params.answers);
    const evaluation = this.getEvaluation(score);

    const submissionData: Submission = {
      id: existingIdx >= 0 ? submissions[existingIdx].id : `sub-${Date.now()}`,
      assignmentId: params.assignment.id,
      assignmentCode: params.assignment.code,
      assignmentTitle: params.assignment.title,
      subject: params.assignment.subject,
      studentId: params.student.id,
      studentName: params.student.fullName,
      studentCode: params.student.studentCode,
      className: params.student.className,
      startedAt: existingIdx >= 0 ? submissions[existingIdx].startedAt : now.toISOString(),
      submittedAt: now.toISOString(),
      lastSavedAt: now.toISOString(),
      durationSeconds: params.durationSeconds,
      status: isLate ? 'late' : 'submitted',
      answers: params.answers,
      score,
      correctCount,
      totalQuestions: params.assignment.questions.length,
      attemptNumber: existingIdx >= 0 ? (submissions[existingIdx].attemptNumber || 1) : 1,
      evaluation
    };

    if (existingIdx >= 0) {
      submissions[existingIdx] = submissionData;
    } else {
      submissions.push(submissionData);
    }

    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    this.notifyListeners('SUBMISSION_COMPLETED', submissionData);

    return {
      submission: submissionData,
      score,
      correctCount,
      evaluation: evaluation === 'excellent' ? 'Hoàn thành tốt' : evaluation === 'completed' ? 'Hoàn thành' : 'Cần cố gắng'
    };
  }

  public calculateGrade(questions: Question[], answers: Record<string, any>): { score: number; correctCount: number } {
    let totalPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;

    questions.forEach((q) => {
      const qPoints = q.points || 1;
      totalPoints += qPoints;
      const studentAns = answers[q.id];

      if (studentAns === undefined || studentAns === null || studentAns === '') {
        return;
      }

      let isCorrect = false;

      switch (q.type) {
        case 'single_choice':
        case 'image_question':
        case 'audio_question':
        case 'video_question': {
          const s = String(studentAns).trim().toLowerCase();
          const c = String(q.correctAnswer).trim().toLowerCase();
          if (s === c) {
            isCorrect = true;
          } else if (q.options && q.options.length > 0) {
            for (let i = 0; i < q.options.length; i++) {
              const opt = q.options[i];
              const optLtr = typeof opt === 'string' ? String.fromCharCode(65 + i).toLowerCase() : (opt.id || String.fromCharCode(65 + i)).toLowerCase();
              const optTxt = (typeof opt === 'string' ? opt : opt.text || '').trim().toLowerCase();
              if ((s === optLtr && c === optTxt) || (s === optTxt && c === optLtr)) {
                isCorrect = true;
                break;
              }
            }
          }
          break;
        }
        case 'true_false': {
          const s = String(studentAns).trim().toLowerCase();
          const c = String(q.correctAnswer).trim().toLowerCase();
          const trueSet = ['true', 'đúng', 'dung', '1'];
          const falseSet = ['false', 'sai', '0'];
          if (s === c) {
            isCorrect = true;
          } else if (trueSet.includes(s) && trueSet.includes(c)) {
            isCorrect = true;
          } else if (falseSet.includes(s) && falseSet.includes(c)) {
            isCorrect = true;
          }
          break;
        }
        case 'multiple_choice': {
          if (Array.isArray(studentAns) && Array.isArray(q.correctAnswer)) {
            const sortedStudent = [...studentAns].map((s) => String(s).trim().toLowerCase()).sort();
            const sortedCorrect = [...q.correctAnswer].map((s) => String(s).trim().toLowerCase()).sort();
            if (
              sortedStudent.length === sortedCorrect.length &&
              sortedStudent.every((val, idx) => val === sortedCorrect[idx])
            ) {
              isCorrect = true;
            } else if (q.options && q.options.length > 0) {
              // Map both to option letter indices for comparison
              const toLetter = (val: string) => {
                const vLow = val.trim().toLowerCase();
                const idx = q.options!.findIndex((o, i) => {
                  const ltr = typeof o === 'string' ? String.fromCharCode(65 + i).toLowerCase() : (o.id || String.fromCharCode(65 + i)).toLowerCase();
                  const txt = (typeof o === 'string' ? o : o.text || '').trim().toLowerCase();
                  return vLow === ltr || vLow === txt;
                });
                return idx >= 0 ? String.fromCharCode(65 + idx) : val;
              };
              const mappedS = sortedStudent.map(toLetter).sort();
              const mappedC = sortedCorrect.map(toLetter).sort();
              if (
                mappedS.length === mappedC.length &&
                mappedS.every((val, idx) => val === mappedC[idx])
              ) {
                isCorrect = true;
              }
            }
          }
          break;
        }
        case 'fill_blank':
        case 'short_answer': {
          const sText = String(studentAns).trim().toLowerCase();
          const cText = String(q.correctAnswer).trim().toLowerCase();
          if (sText === cText) {
            isCorrect = true;
          }
          break;
        }
        case 'matching': {
          if (q.matchingPairs && typeof studentAns === 'object') {
            let allPairsCorrect = true;
            q.matchingPairs.forEach((pair) => {
              if (studentAns[pair.left] !== pair.right) {
                allPairsCorrect = false;
              }
            });
            if (allPairsCorrect) isCorrect = true;
          }
          break;
        }
        case 'reorder': {
          if (Array.isArray(studentAns) && Array.isArray(q.correctAnswer)) {
            if (
              studentAns.length === q.correctAnswer.length &&
              studentAns.every((val, idx) => val === (q.correctAnswer as string[])[idx])
            ) {
              isCorrect = true;
            }
          }
          break;
        }
        default:
          break;
      }

      if (isCorrect) {
        earnedPoints += qPoints;
        correctCount += 1;
      }
    });

    // Score on 10-point scale rounded to 1 decimal
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 10 * 10) / 10 : 0;
    return { score, correctCount };
  }

  public getEvaluation(score: number): 'excellent' | 'completed' | 'need_effort' {
    const settings = this.getSettings();
    const { needEffortMax, completedMax } = settings.gradeThresholds;
    if (score <= needEffortMax) return 'need_effort';
    if (score <= completedMax) return 'completed';
    return 'excellent';
  }

  // --- NOTIFICATIONS ---
  public getNotificationsForStudent(student: Student): NotificationItem[] {
    const all: NotificationItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    return all.filter((n) => n.targetClassId === student.classId || !n.targetClassId);
  }

  public addNotification(notification: NotificationItem) {
    const all: NotificationItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    all.unshift(notification);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    this.notifyListeners('NOTIFICATION_ADDED', notification);
  }

  public markNotificationAsRead(id: string) {
    const all: NotificationItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    this.notifyListeners('NOTIFICATION_UPDATED', updated);
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : initialSettings;
  }

  public saveSettings(settings: AppSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notifyListeners('SETTINGS_UPDATED', settings);
  }

  public updateTeacherAndSchool(params: {
    schoolName: string;
    teacherName: string;
    teacherEmail?: string;
  }) {
    const settings = this.getSettings();
    settings.schoolName = params.schoolName.trim() || settings.schoolName;
    settings.teacherName = params.teacherName.trim() || settings.teacherName;
    if (params.teacherEmail !== undefined) {
      settings.teacherEmail = params.teacherEmail.trim();
    }
    this.saveSettings(settings);
  }

  // --- AUTH SESSIONS ---
  public getStudentSession(): Student | null {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_SESSION);
    return raw ? JSON.parse(raw) : null;
  }

  public setStudentSession(student: Student | null, remember = true) {
    if (student) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_SESSION, JSON.stringify(student));
      if (!remember) {
        sessionStorage.setItem(STORAGE_KEYS.STUDENT_SESSION, JSON.stringify(student));
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.STUDENT_SESSION);
      sessionStorage.removeItem(STORAGE_KEYS.STUDENT_SESSION);
    }
    this.notifyListeners('AUTH_CHANGED', { role: 'student', user: student });
  }

  public isTeacherLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.TEACHER_SESSION) === 'true';
  }

  public setTeacherSession(loggedIn: boolean) {
    if (loggedIn) {
      localStorage.setItem(STORAGE_KEYS.TEACHER_SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.TEACHER_SESSION);
    }
    this.notifyListeners('AUTH_CHANGED', { role: 'teacher', loggedIn });
  }

  public getRememberedStudent(): Student | null {
    return this.getStudentSession();
  }

  public logoutStudent() {
    this.setStudentSession(null);
  }

  public createAssignment(assignment: Assignment) {
    this.saveAssignment(assignment);
  }

  public getFirebaseConfig(): FirebaseConfig | undefined {
    return this.getSettings().firebaseConfig;
  }

  public saveFirebaseConfig(cfg: FirebaseConfig) {
    const settings = this.getSettings();
    settings.firebaseConfig = cfg;
    this.saveSettings(settings);
  }

  public resetToInitialMock() {
    this.resetToDefaultDemo();
  }

  // Reset to initial demo data
  public resetToDefaultDemo() {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(initialClasses));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(initialAssignments));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(initialSubmissions));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
    this.notifyListeners('DATA_RESET', null);
  }
}

export const storageService = new StorageService();
