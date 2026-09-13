import React from 'react';
import { Student } from '../../types';
import { Button } from './Button';
import { User, LogOut, GraduationCap, Sparkles } from 'lucide-react';

interface HeaderProps {
  isTeacherMode: boolean;
  currentStudent: Student | null;
  onOpenTeacherLogin: () => void;
  onExitTeacherMode: () => void;
  onLogoutStudent: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isTeacherMode,
  currentStudent,
  onOpenTeacherLogin,
  onExitTeacherMode,
  onLogoutStudent,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-sage-100 border border-sage-200 flex items-center justify-center text-xl shadow-inner select-none">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                오늘의 감사 - 감사일기
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sage-500 text-white">
                {isTeacherMode ? '교사용' : '학교용'}
              </span>
            </div>
            <p className="hidden sm:block text-xs text-stone-500">
              오늘 하루, 고마웠던 순간을 찾아보세요
            </p>
          </div>
        </div>

        {/* Right action area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isTeacherMode ? (
            <>
              {onOpenSettings && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenSettings}
                >
                  ⚙️ 설정
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                icon={<GraduationCap className="w-4 h-4" />}
                onClick={onExitTeacherMode}
              >
                학생 화면으로
              </Button>
            </>
          ) : (
            <>
              {currentStudent ? (
                <div className="flex items-center gap-2 bg-sage-50/80 px-2.5 py-1.5 rounded-xl border border-sage-200/80">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sage-900">
                    <User className="w-3.5 h-3.5 text-sage-600" />
                    <span>{currentStudent.grade}학년 {currentStudent.classNum}반 {currentStudent.number}번</span>
                    <span className="text-stone-800 font-bold">{currentStudent.name}</span>
                  </div>
                  <button
                    onClick={onLogoutStudent}
                    title="학생 변경 / 로그아웃"
                    className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-sage-100 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                onClick={onOpenTeacherLogin}
              >
                교사 전용
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
