import React, { useState, useEffect, useMemo } from 'react';
import { Student, GratitudeEntry, StudentStats } from '../../types';
import { StudentCalendar } from './StudentCalendar';
import { StudentStatsCard } from './StudentStatsCard';
import { DailyQuestionCard } from './DailyQuestionCard';
import { GratitudeWriteModal } from './GratitudeWriteModal';
import { GratitudeDetailModal } from './GratitudeDetailModal';
import { getStorageService } from '../../services/storage';
import { generateAIComment } from '../../services/aiService';
import { getTodayString, calculateConsecutiveDays } from '../../utils/dateUtils';
import { PenLine, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

interface StudentHomeProps {
  currentStudent: Student;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({ currentStudent, onShowToast }) => {
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'write' | 'detail' | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRegeneratingAI, setIsRegeneratingAI] = useState<boolean>(false);

  const storageService = useMemo(() => getStorageService(), []);
  const todayStr = getTodayString();

  // Load entries for current student
  const loadStudentEntries = async () => {
    try {
      const studentEntries = await storageService.getGratitudeEntries(currentStudent.id);
      setEntries(studentEntries);
    } catch (err) {
      console.error('Failed to load student entries:', err);
    }
  };

  useEffect(() => {
    loadStudentEntries();
  }, [currentStudent.id, currentYear, currentMonth]);

  // Set of completed date strings
  const completedDates = useMemo(() => {
    return new Set(entries.map(e => e.date));
  }, [entries]);

  // Is today completed?
  const isTodayCompleted = completedDates.has(todayStr);

  // Calculate statistics
  const stats: StudentStats = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const monthEntries = entries.filter(e => e.date.startsWith(monthPrefix));
    const allDateList = entries.map(e => e.date);

    return {
      monthCount: monthEntries.length,
      totalGratitudes: monthEntries.length * 3,
      consecutiveDays: calculateConsecutiveDays(allDateList, todayStr)
    };
  }, [entries, currentYear, currentMonth, todayStr]);

  // Selected entry object
  const selectedEntry = useMemo(() => {
    if (!selectedDate) return null;
    return entries.find(e => e.date === selectedDate) || null;
  }, [entries, selectedDate]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  // Date selection in calendar
  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = entries.find(e => e.date === dateStr);
    if (existing) {
      setModalMode('detail');
    } else {
      setModalMode('write');
    }
  };

  // Saving gratitude entry
  const handleSaveEntry = async (g1: string, g2: string, g3: string) => {
    if (!selectedDate) return;
    setIsSaving(true);

    try {
      const config = await storageService.getClassConfig();
      // Generate AI comment
      const aiResult = await generateAIComment(g1, g2, g3, config);

      const newEntry: GratitudeEntry = {
        id: `${currentStudent.id}_${selectedDate}`,
        studentId: currentStudent.id,
        date: selectedDate,
        gratitude1: g1,
        gratitude2: g2,
        gratitude3: g3,
        aiComment: aiResult.comment,
        keywords: aiResult.keywords,
        createdAt: selectedEntry?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await storageService.saveGratitudeEntry(newEntry);
      await loadStudentEntries();

      setIsSaving(false);
      setModalMode('detail');
      onShowToast('오늘의 감사일기가 저장되었어요! 🌱', 'success');
    } catch (err) {
      setIsSaving(false);
      onShowToast('저장 중 문제가 발생했습니다. 다시 시도해 주세요.', 'error');
    }
  };

  // Regenerate AI comment from detail view
  const handleRegenerateAI = async () => {
    if (!selectedEntry) return;
    setIsRegeneratingAI(true);
    try {
      const config = await storageService.getClassConfig();
      const aiResult = await generateAIComment(
        selectedEntry.gratitude1,
        selectedEntry.gratitude2,
        selectedEntry.gratitude3,
        config
      );

      const updated = {
        ...selectedEntry,
        aiComment: aiResult.comment,
        keywords: aiResult.keywords,
        updatedAt: new Date().toISOString()
      };

      await storageService.saveGratitudeEntry(updated);
      await loadStudentEntries();
      onShowToast('새로운 격려 코멘트가 도착했어요! ✨', 'info');
    } catch {
      onShowToast('코멘트 생성에 실패했습니다.', 'error');
    } finally {
      setIsRegeneratingAI(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-sage-500 to-emerald-600 rounded-3xl p-6 text-white shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sage-100 text-xs sm:text-sm font-medium">
            <span>{currentStudent.grade}학년 {currentStudent.classNum}반 {currentStudent.number}번</span>
            <span className="w-1 h-1 rounded-full bg-sage-200" />
            <span>{currentStudent.name} 학생</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
            오늘도 감사한 일을 찾아볼까요? 🌱
          </h2>
          <p className="text-xs sm:text-sm text-sage-100/90 mt-1">
            작은 감사 세 가지로 오늘 하루를 따뜻하게 물들여 보세요.
          </p>
        </div>

        {/* Quick button to write today */}
        <Button
          variant="secondary"
          size="md"
          icon={<PenLine className="w-4 h-4 text-sage-700" />}
          onClick={() => {
            setSelectedDate(todayStr);
            setModalMode('write');
          }}
          className="bg-white/95 hover:bg-white text-stone-800 font-bold shadow-sm whitespace-nowrap"
        >
          감사일기 쓰기
        </Button>
      </div>

      {/* Gentle Reminder if today is unwritten */}
      {!isTodayCompleted && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <span className="text-lg">🌱</span>
            <span>오늘의 감사일기를 아직 작성하지 않았어요. 여유 있을 때 천천히 적어보세요.</span>
          </div>
          <button
            onClick={() => handleSelectDate(todayStr)}
            className="text-xs font-bold text-amber-800 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-xl transition whitespace-nowrap"
          >
            작성하기 ✏️
          </button>
        </div>
      )}

      {/* Daily Question & Inspiring Quote */}
      <DailyQuestionCard />

      {/* Student Habit Statistics */}
      <StudentStatsCard stats={stats} />

      {/* Monthly Interactive Calendar */}
      <StudentCalendar
        currentYear={currentYear}
        currentMonth={currentMonth}
        completedDates={completedDates}
        onSelectDate={handleSelectDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onGoToday={handleGoToday}
      />

      {/* Write / Edit Modal */}
      {modalMode === 'write' && selectedDate && (
        <GratitudeWriteModal
          isOpen={true}
          dateStr={selectedDate}
          existingEntry={selectedEntry}
          onClose={() => setModalMode(null)}
          onSave={handleSaveEntry}
          isLoading={isSaving}
        />
      )}

      {/* Detail / View Modal */}
      {modalMode === 'detail' && selectedEntry && (
        <GratitudeDetailModal
          isOpen={true}
          entry={selectedEntry}
          onClose={() => setModalMode(null)}
          onEdit={() => setModalMode('write')}
          onRegenerateAI={handleRegenerateAI}
          isRegeneratingAI={isRegeneratingAI}
        />
      )}
    </div>
  );
};
