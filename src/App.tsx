import React, { useState, useEffect } from 'react';
import { Student, TeacherUser } from './types';
import { storageService } from './services/storage';
import { RoleSelector } from './components/auth/RoleSelector';
import { StudentLogin } from './components/auth/StudentLogin';
import { TeacherLogin } from './components/auth/TeacherLogin';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherPortal } from './components/teacher/TeacherPortal';

type AppView =
  | 'role_select'
  | 'student_login'
  | 'teacher_login'
  | 'student_portal'
  | 'teacher_portal';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('role_select');
  const [loggedStudent, setLoggedStudent] = useState<Student | null>(null);
  const [loggedTeacher, setLoggedTeacher] = useState<TeacherUser | null>(null);
  const [directJoinCode, setDirectJoinCode] = useState<string | undefined>(undefined);

  // Initialize and check URL parameters or remembered session
  useEffect(() => {
    // 1. Check URL parameters: ?join=... or ?code=...
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('join') || urlParams.get('code');
    const roleParam = urlParams.get('role');

    if (codeParam) {
      setDirectJoinCode(codeParam);
    }

    // 2. Check remembered student
    const remembered = storageService.getRememberedStudent();
    if (remembered) {
      setLoggedStudent(remembered);
      setCurrentView('student_portal');
      return;
    }

    // 3. Check role param
    if (roleParam === 'student' || codeParam) {
      setCurrentView('student_login');
    } else if (roleParam === 'teacher') {
      // Default sample teacher
      setLoggedTeacher({
        id: 't-01',
        name: 'Thầy Nguyễn Văn Huy',
        email: 'huy.nguyen@kimdong.edu.vn',
        role: 'teacher'
      });
      setCurrentView('teacher_portal');
    } else {
      setCurrentView('role_select');
    }
  }, []);

  // Handlers for Student
  const handleStudentLoginSuccess = (student: Student) => {
    setLoggedStudent(student);
    setCurrentView('student_portal');
  };

  const handleStudentLogout = () => {
    storageService.logoutStudent();
    setLoggedStudent(null);
    setCurrentView('role_select');
  };

  // Handlers for Teacher
  const handleTeacherLoginSuccess = (teacher: TeacherUser) => {
    setLoggedTeacher(teacher);
    setCurrentView('teacher_portal');
  };

  const handleTeacherLogout = () => {
    setLoggedTeacher(null);
    setCurrentView('role_select');
  };

  // Switch to Student View from Teacher portal
  const handleSwitchToStudentView = () => {
    // Pick the first student (Nguyễn Văn An) for quick preview
    const students = storageService.getStudents();
    if (students.length > 0) {
      setLoggedStudent(students[0]);
      setCurrentView('student_portal');
    } else {
      setCurrentView('student_login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Be_Vietnam_Pro',sans-serif] selection:bg-emerald-200">
      {/* Quick Global Switcher Bar (Discrete floating pill at bottom corner for teacher/tester) */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 p-1.5 bg-slate-900/90 text-white rounded-full shadow-2xl backdrop-blur-md border border-slate-700 text-xs">
        <button
          onClick={() => setCurrentView('role_select')}
          className="px-3 py-1 rounded-full hover:bg-white/20 font-bold transition-colors cursor-pointer"
          title="Về màn hình chọn vai trò"
        >
          🔄 Đổi vai trò
        </button>
        <span className="text-slate-600">|</span>
        <button
          onClick={() => {
            const students = storageService.getStudents();
            setLoggedStudent(students[0] || null);
            setCurrentView('student_portal');
          }}
          className={`px-3 py-1 rounded-full font-bold transition-colors cursor-pointer ${
            currentView === 'student_portal'
              ? 'bg-emerald-500 text-white'
              : 'hover:bg-white/20 text-emerald-300'
          }`}
        >
          Cổng Học Sinh
        </button>
        <button
          onClick={() => {
            setLoggedTeacher({
              id: 't-01',
              name: 'Thầy Nguyễn Văn Huy',
              email: 'huy.nguyen@kimdong.edu.vn',
              role: 'teacher'
            });
            setCurrentView('teacher_portal');
          }}
          className={`px-3 py-1 rounded-full font-bold transition-colors cursor-pointer ${
            currentView === 'teacher_portal'
              ? 'bg-indigo-600 text-white'
              : 'hover:bg-white/20 text-indigo-300'
          }`}
        >
          Cổng Giáo Viên
        </button>
      </div>

      {/* Main View Router */}
      {currentView === 'role_select' && (
        <RoleSelector
          onSelectRole={(role) => {
            if (role === 'student') setCurrentView('student_login');
            else setCurrentView('teacher_login');
          }}
        />
      )}

      {currentView === 'student_login' && (
        <StudentLogin
          onSuccess={handleStudentLoginSuccess}
          onBack={() => setCurrentView('role_select')}
          directJoinCode={directJoinCode}
        />
      )}

      {currentView === 'teacher_login' && (
        <TeacherLogin
          onSuccess={() =>
            handleTeacherLoginSuccess({
              id: 't-01',
              name: 'Thầy Nguyễn Văn Huy',
              email: 'huy.nguyen@kimdong.edu.vn',
              role: 'teacher'
            })
          }
          onBack={() => setCurrentView('role_select')}
        />
      )}

      {currentView === 'student_portal' && loggedStudent && (
        <StudentDashboard
          student={loggedStudent}
          onLogout={handleStudentLogout}
          directJoinCode={directJoinCode}
        />
      )}

      {currentView === 'teacher_portal' && loggedTeacher && (
        <TeacherPortal
          teacher={loggedTeacher}
          onLogout={handleTeacherLogout}
          onSwitchToStudentView={handleSwitchToStudentView}
        />
      )}
    </div>
  );
}
