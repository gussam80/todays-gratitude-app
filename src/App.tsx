import React, { useState, useEffect } from 'react';
import { Student, ClassConfig, ToastMessage } from './types';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { StudentLogin } from './components/student/StudentLogin';
import { StudentHome } from './components/student/StudentHome';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherLoginModal } from './components/teacher/TeacherLoginModal';
import { getStorageService } from './services/storage';

const STORAGE_LAST_STUDENT_KEY = 'todays_gratitude_last_student';

export const App: React.FC = () => {
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);
  const [isTeacherLoginOpen, setIsTeacherLoginOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [registeredStudents, setRegisteredStudents] = useState<Student[]>([]);
  const [config, setConfig] = useState<ClassConfig>({
    year: 2026,
    grade: 1,
    classNum: 2,
    totalStudents: 25,
    teacherPin: '1234'
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const storageService = getStorageService();

  // Show toast notification helper
  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto dismiss after 3.5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const loadedConfig = await storageService.getClassConfig();
        setConfig(loadedConfig);

        const students = await storageService.getStudents(loadedConfig.grade, loadedConfig.classNum);
        setRegisteredStudents(students);

        // Restore last logged-in student if exists
        const savedStudentRaw = localStorage.getItem(STORAGE_LAST_STUDENT_KEY);
        if (savedStudentRaw) {
          try {
            const savedStudent = JSON.parse(savedStudentRaw);
            setCurrentStudent(savedStudent);
          } catch {
            localStorage.removeItem(STORAGE_LAST_STUDENT_KEY);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    init();
  }, []);

  // Handle student login
  const handleStudentLogin = async (student: Student) => {
    setCurrentStudent(student);
    localStorage.setItem(STORAGE_LAST_STUDENT_KEY, JSON.stringify(student));

    // Register student in storage if not already present
    await storageService.saveStudent(student);
    showToast(`${student.name} 학생, 환영해요! 🌱`, 'success');
  };

  // Handle student logout / switch
  const handleLogoutStudent = () => {
    localStorage.removeItem(STORAGE_LAST_STUDENT_KEY);
    setCurrentStudent(null);
    showToast('학생 정보가 변경되었습니다.', 'info');
  };

  // Teacher login success
  const handleTeacherLoginSuccess = () => {
    setIsTeacherLoginOpen(false);
    setIsTeacherMode(true);
    showToast('선생님 대시보드에 입장했습니다 👩‍🏫', 'success');
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col font-sans">
      {/* Universal Header */}
      <Header
        isTeacherMode={isTeacherMode}
        currentStudent={currentStudent}
        onOpenTeacherLogin={() => setIsTeacherLoginOpen(true)}
        onExitTeacherMode={() => setIsTeacherMode(false)}
        onLogoutStudent={handleLogoutStudent}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {isTeacherMode ? (
          <TeacherDashboard
            onShowToast={showToast}
            onOpenSettingsModal={() => setIsSettingsOpen(true)}
            isSettingsOpen={isSettingsOpen}
            onCloseSettingsModal={() => setIsSettingsOpen(false)}
          />
        ) : currentStudent ? (
          <StudentHome
            currentStudent={currentStudent}
            onShowToast={showToast}
          />
        ) : (
          <StudentLogin
            onLogin={handleStudentLogin}
            registeredStudents={registeredStudents}
          />
        )}
      </main>

      {/* Warm Footer */}
      <footer className="bg-white/80 border-t border-stone-100 py-6 text-center text-xs text-stone-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>🌱</span>
            <span className="font-semibold text-stone-600">오늘의 감사 - 감사일기</span>
            <span>—</span>
            <span>초·중·고 학교 맞춤형 감사 습관 플랫폼</span>
          </div>
          <div className="text-stone-400">
            개인정보를 안전하게 보호하며, AI는 오직 학생을 격려하고 응원합니다.
          </div>
        </div>
      </footer>

      {/* Teacher Authentication Modal */}
      <TeacherLoginModal
        isOpen={isTeacherLoginOpen}
        onClose={() => setIsTeacherLoginOpen(false)}
        onLoginSuccess={handleTeacherLoginSuccess}
        correctPin={config.teacherPin || '1234'}
      />

      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};

export default App;
