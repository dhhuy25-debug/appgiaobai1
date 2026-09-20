import React, { useState, useEffect } from 'react';
import { TeacherUser, Assignment, Student, Submission, SchoolClass } from '../../types';
import { storageService } from '../../services/storage';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentProfiles } from './StudentProfiles';
import { AssignmentManager } from './AssignmentManager';
import { ReportsExport } from './ReportsExport';
import { SettingsFirebase } from './SettingsFirebase';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileSpreadsheet,
  Settings,
  LogOut,
  Sparkles,
  School,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

interface TeacherPortalProps {
  teacher: TeacherUser;
  onLogout: () => void;
  onSwitchToStudentView: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  teacher,
  onLogout,
  onSwitchToStudentView
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'students' | 'assignments' | 'reports' | 'settings'
  >('dashboard');

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [settings, setSettings] = useState(() => storageService.getSettings());
  const [openCreateImmediately, setOpenCreateImmediately] = useState(false);

  // Load latest data from storageService
  const loadData = () => {
    setAssignments(storageService.getAssignments());
    setStudents(storageService.getStudents());
    setSubmissions(storageService.getSubmissions());
    setClasses(storageService.getClasses());
    setSettings(storageService.getSettings());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = storageService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Be_Vietnam_Pro',sans-serif]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200">
              🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                  Quản Lý Học Sinh & Bài Tập Tiểu Học
                </h1>
                <span className="hidden sm:inline px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                  Cổng Giáo Viên
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {settings.schoolName || 'Trường Tiểu Học Chu Văn An'} • Giáo viên: {settings.teacherName || teacher.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Switch to Student View Button */}
            <button
              id="btn-switch-to-student"
              onClick={onSwitchToStudentView}
              className="px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Chuyển nhanh sang Cổng học sinh để kiểm tra trải nghiệm"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Vào Cổng Học Sinh</span>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 border-t border-slate-100 overflow-x-auto py-2">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: LayoutDashboard },
            { id: 'students', label: '👥 Hồ sơ học sinh', icon: Users },
            { id: 'assignments', label: '📝 Giao bài tập', icon: BookOpen },
            { id: 'reports', label: '📈 Báo cáo & Xuất file', icon: FileSpreadsheet },
            { id: 'settings', label: '⚙️ Cài đặt & Firebase', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`teacher-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setOpenCreateImmediately(false);
                }}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <TeacherDashboard
            assignments={assignments}
            students={students}
            submissions={submissions}
            classes={classes}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setOpenCreateImmediately(false);
            }}
            onOpenCreateAssignment={() => {
              setActiveTab('assignments');
              setOpenCreateImmediately(true);
            }}
          />
        )}

        {activeTab === 'students' && (
          <StudentProfiles
            students={students}
            classes={classes}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentManager
            assignments={assignments}
            classes={classes}
            students={students}
            onRefresh={loadData}
            openCreateImmediately={openCreateImmediately}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsExport
            assignments={assignments}
            students={students}
            submissions={submissions}
            classes={classes}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsFirebase onRefresh={loadData} />
        )}
      </main>
    </div>
  );
};
