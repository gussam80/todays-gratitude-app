import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Student, GratitudeEntry, TeacherNote } from '../../types';
import { getCalendarGrid, getMonthYearLabel, formatKoreanDate } from '../../utils/dateUtils';
import { getStorageService } from '../../services/storage';
import { ChevronLeft, ChevronRight, Check, FileText } from 'lucide-react';

interface StudentHistoryModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSelectDateDiary: (student: Student, entry: GratitudeEntry | null, dateStr: string) => void;
}

export const StudentHistoryModal: React.FC<StudentHistoryModalProps> = ({
  isOpen,
  student,
  onClose,
  onSelectDateDiary
}) => {
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [notes, setNotes] = useState<TeacherNote[]>([]);

  const storageService = getStorageService();

  useEffect(() => {
    if (!student || !isOpen) return;

    const loadData = async () => {
      try {
        const studentEntries = await storageService.getGratitudeEntriesByMonth(student.id, currentYear, currentMonth);
        const studentNotes = await storageService.getTeacherNotes(student.id);
        setEntries(studentEntries);
        setNotes(studentNotes);
      } catch (err) {
        console.error('Failed to load student history:', err);
      }
    };

    loadData();
  }, [student, currentYear, currentMonth, isOpen]);

  if (!student) return null;

  const entriesMap = new Map<string, GratitudeEntry>();
  entries.forEach(e => entriesMap.set(e.date, e));

  const notesMap = new Map<string, TeacherNote>();
  notes.forEach(n => notesMap.set(n.date, n));

  const days = getCalendarGrid(currentYear, currentMonth);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{student.number}번 {student.name} 학생 감사일기 이력</span>
        </div>
      }
      subtitle={`${student.grade}학년 ${student.classNum}반 | ${getMonthYearLabel(currentYear, currentMonth)} 작성 현황`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Month Navigator */}
        <div className="flex items-center justify-between bg-cream-50 p-3 rounded-2xl border border-stone-100">
          <span className="font-bold text-stone-800 text-sm sm:text-base">
            {getMonthYearLabel(currentYear, currentMonth)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-stone-200/60 transition"
              aria-label="이전 달"
            >
              <ChevronLeft className="w-4 h-4 text-stone-700" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-stone-200/60 transition"
              aria-label="다음 달"
            >
              <ChevronRight className="w-4 h-4 text-stone-700" />
            </button>
          </div>
        </div>

        {/* Calendar Grid for this student */}
        <div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-400 mb-1.5">
            {weekDays.map((d, i) => (
              <div key={d} className={i === 0 ? 'text-coral-500' : i === 6 ? 'text-sky-500' : ''}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map(({ day, dateStr, isCurrentMonth }) => {
              const entry = entriesMap.get(dateStr) || null;
              const note = notesMap.get(dateStr) || null;
              const isCompleted = !!entry;

              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDateDiary(student, entry, dateStr)}
                  className={`p-1.5 min-h-[58px] rounded-xl border flex flex-col items-center justify-between text-left transition ${
                    !isCurrentMonth
                      ? 'opacity-25 border-transparent'
                      : isCompleted
                      ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70'
                      : 'bg-stone-50/50 border-stone-100 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-xs font-bold text-stone-700">{day}</span>
                  <div className="flex items-center gap-1">
                    {isCompleted && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    {note && (
                      <span className="w-3.5 h-3.5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-[8px] font-bold">
                        <FileText className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Info */}
        <div className="p-3 bg-sage-50 rounded-2xl border border-sage-200 flex items-center justify-between text-xs text-sage-900">
          <span>이번 달 작성일: <strong>{entries.length}일</strong></span>
          <span>기록된 감사: <strong>{entries.length * 3}개</strong></span>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="md" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
};
