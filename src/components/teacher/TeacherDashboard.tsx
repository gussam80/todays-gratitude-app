import React, { useState, useEffect, useMemo } from 'react';
import { Student, GratitudeEntry, TeacherNote, ClassConfig, ClassStats } from '../../types';
import { TeacherStatsCards } from './TeacherStatsCards';
import { StudentRosterTable } from './StudentRosterTable';
import { TeacherCalendarView } from './TeacherCalendarView';
import { TeacherDiaryDetailModal } from './TeacherDiaryDetailModal';
import { StudentHistoryModal } from './StudentHistoryModal';
import { RosterUploadModal } from './RosterUploadModal';
import { ExportModal } from './ExportModal';
import { TeacherSettingsModal } from './TeacherSettingsModal';
import { TeacherResetModal } from './TeacherResetModal';
import { Button } from '../common/Button';
import { getStorageService } from '../../services/storage';
import { getTodayString, formatKoreanDate } from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  Settings,
  Table,
  CalendarCheck,
  RotateCcw
} from 'lucide-react';

interface TeacherDashboardProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onOpenSettingsModal: () => void;
  isSettingsOpen: boolean;
  onCloseSettingsModal: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onShowToast,
  onOpenSettingsModal,
  isSettingsOpen,
  onCloseSettingsModal
}) => {
  const [config, setConfig] = useState<ClassConfig>({
    year: 2026,
    grade: 1,
    classNum: 2,
    totalStudents: 25,
    teacherPin: '1234',
    useSupabase: false,
    aiProvider: 'mock'
  });

  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClassNum, setSelectedClassNum] = useState<string>('');

  const handleGradeChange = (val: string) => {
    setSelectedGrade(val);
  };

  const handleClassNumChange = (val: string) => {
    setSelectedClassNum(val);
  };

  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayString());
  const [calendarYear, setCalendarYear] = useState<number>(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(() => new Date().getMonth() + 1);

  // Tab view: 'roster' | 'calendar'
  const [viewMode, setViewMode] = useState<'roster' | 'calendar'>('roster');

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [allEntries, setAllEntries] = useState<GratitudeEntry[]>([]);
  const [allNotes, setAllNotes] = useState<TeacherNote[]>([]);

  // Modals
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [selectedEntryForDetail, setSelectedEntryForDetail] = useState<GratitudeEntry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [isRosterUploadOpen, setIsRosterUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const storageService = useMemo(() => getStorageService(), []);

  // Load all initial data
  const loadDashboardData = async () => {
    try {
      const currentConfig = await storageService.getClassConfig();
      setConfig(currentConfig);
      const studentList = await storageService.getStudents();
      setStudents(studentList);

      const entryList = await storageService.getGratitudeEntries();
      setAllEntries(entryList);

      const noteList = await storageService.getTeacherNotes();
      setAllNotes(noteList);
    } catch (err) {
      console.error('Failed to load teacher dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload students when grade/class filter changes
  useEffect(() => {
    const fetchStudentsForFilter = async () => {
      const gNum = selectedGrade ? parseInt(selectedGrade, 10) : undefined;
      const cNum = selectedClassNum ? parseInt(selectedClassNum, 10) : undefined;
      const studentList = await storageService.getStudents(
        isNaN(gNum as number) ? undefined : gNum,
        isNaN(cNum as number) ? undefined : cNum
      );
      setStudents(studentList);
    };
    fetchStudentsForFilter();
  }, [selectedGrade, selectedClassNum]);

  // Current day maps
  const currentDayEntriesMap = useMemo(() => {
    const map = new Map<string, GratitudeEntry>();
    allEntries.filter(e => e.date === selectedDate).forEach(e => map.set(e.studentId, e));
    return map;
  }, [allEntries, selectedDate]);

  const currentDayNotesMap = useMemo(() => {
    const map = new Map<string, TeacherNote>();
    allNotes.filter(n => n.date === selectedDate).forEach(n => map.set(n.studentId, n));
    return map;
  }, [allNotes, selectedDate]);

  // Calculate statistics for selectedDate
  const stats: ClassStats = useMemo(() => {
    const total = students.length;
    const completed = students.filter(s => currentDayEntriesMap.has(s.id)).length;
    const pending = Math.max(0, total - completed);
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Monthly average calculation
    const monthPrefix = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}`;
    const monthEntries = allEntries.filter(e => e.date.startsWith(monthPrefix) && students.some(s => s.id === e.studentId));
    const monthAvg = total > 0 ? Number((monthEntries.length / total).toFixed(1)) : 0;

    return {
      totalStudents: total,
      completedToday: completed,
      pendingToday: pending,
      rateToday: rate,
      monthAvgDays: monthAvg
    };
  }, [students, currentDayEntriesMap, allEntries, calendarYear, calendarMonth]);

  // Daily rates map for calendar view
  const dailyRatesMap = useMemo(() => {
    const map = new Map<string, { completed: number; total: number; rate: number }>();
    const total = students.length || 25;
    const monthPrefix = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}`;

    const monthEntries = allEntries.filter(e => e.date.startsWith(monthPrefix));
    const dateCountMap = new Map<string, number>();

    monthEntries.forEach(e => {
      // count only if student belongs to selected grade/class
      if (students.some(s => s.id === e.studentId)) {
        dateCountMap.set(e.date, (dateCountMap.get(e.date) || 0) + 1);
      }
    });

    dateCountMap.forEach((completed, date) => {
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      map.set(date, { completed, total, rate });
    });

    return map;
  }, [students, allEntries, calendarYear, calendarMonth]);

  // Navigation handlers for date
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  const handleGoToday = () => {
    setSelectedDate(getTodayString());
  };

  // Open diary detail modal
  const handleOpenDiaryDetail = (student: Student, entry: GratitudeEntry | null) => {
    setSelectedStudentForDetail(student);
    setSelectedEntryForDetail(entry);
    setIsDetailModalOpen(true);
  };

  // Save teacher private note
  const handleSaveTeacherNote = async (noteText: string) => {
    if (!selectedStudentForDetail) return;

    const noteObj: TeacherNote = {
      id: `${selectedStudentForDetail.id}_${selectedDate}`,
      studentId: selectedStudentForDetail.id,
      date: selectedDate,
      note: noteText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await storageService.saveTeacherNote(noteObj);
    const updatedNotes = await storageService.getTeacherNotes();
    setAllNotes(updatedNotes);
    onShowToast('교사 메모가 안전하게 저장되었습니다.', 'info');
  };

  // Open single student history
  const handleOpenStudentHistory = (student: Student) => {
    setSelectedStudentForHistory(student);
    setIsHistoryModalOpen(true);
  };

  // Roster upload complete handler
  const handleRosterUploaded = async (newStudents: Student[]) => {
    await storageService.saveStudentsBatch(newStudents);
    await loadDashboardData();
    onShowToast(`${newStudents.length}명의 학생 명단이 성공적으로 등록되었습니다!`, 'success');
  };

  // Save config
  const handleSaveConfig = async (newConfig: ClassConfig) => {
    await storageService.saveClassConfig(newConfig);
    setConfig(newConfig);
    await loadDashboardData();
    onShowToast('학급 설정이 저장되었습니다.', 'success');
  };

  // Populate sample
  const handlePopulateSample = async (samples: any) => {
    await storageService.populateSampleData(samples);
    await loadDashboardData();
    onShowToast('샘플 데이터가 채워졌습니다! 🌱', 'success');
  };

  // Reset all
  const handleResetData = async () => {
    await storageService.resetAllData();
    await loadDashboardData();
    onShowToast('모든 데이터가 깨끗하게 리셋되었습니다. 🌱', 'success');
  };

  // Reset diaries and notes only (keep students)
  const handleResetDiariesOnly = async () => {
    await storageService.resetEntriesAndNotes();
    await loadDashboardData();
    onShowToast('감사일기와 교사 메모가 비워졌습니다. (학생 명단 유지) 🌱', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-soft flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Title and Filter selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <span>감사일기 교사 대시보드</span>
              {(selectedGrade || selectedClassNum) ? (
                <span className="text-xs bg-sage-100 text-sage-800 px-2.5 py-0.5 rounded-full font-bold">
                  {selectedGrade ? `${selectedGrade}학년` : ''} {selectedClassNum ? `${selectedClassNum}반` : ''}
                </span>
              ) : null}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedGrade}
              onChange={(e) => handleGradeChange(e.target.value)}
              className={`bg-cream-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sage-400 cursor-pointer transition shadow-xs ${
                !selectedGrade ? 'text-stone-400' : 'text-stone-800'
              }`}
            >
              <option value="" className="text-stone-400">학년</option>
              {[1, 2, 3].map(g => (
                <option key={g} value={g} className="text-stone-800 font-semibold">{g}학년</option>
              ))}
            </select>

            <select
              value={selectedClassNum}
              onChange={(e) => handleClassNumChange(e.target.value)}
              className={`bg-cream-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sage-400 cursor-pointer transition shadow-xs ${
                !selectedClassNum ? 'text-stone-400' : 'text-stone-800'
              }`}
            >
              <option value="" className="text-stone-400">반</option>
              {[1, 2].map(c => (
                <option key={c} value={c} className="text-stone-800 font-semibold">{c}반</option>
              ))}
            </select>
          </div>

          {/* Date Picker Bar */}
          <div className="flex items-center gap-1 bg-cream-50/80 px-2 py-1 rounded-xl border border-stone-200/80 text-xs">
            <button
              onClick={handlePrevDay}
              title="이전 날짜"
              className="p-1 rounded-lg hover:bg-stone-200/60 transition text-stone-600"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-0 font-bold text-stone-800 text-xs focus:outline-none cursor-pointer"
            />

            <button
              onClick={handleNextDay}
              title="다음 날짜"
              className="p-1 rounded-lg hover:bg-stone-200/60 transition text-stone-600"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleGoToday}
              className="ml-1 text-[11px] font-bold text-sage-700 bg-sage-100 hover:bg-sage-200 px-2 py-0.5 rounded-md transition"
            >
              오늘
            </button>
          </div>
        </div>

        {/* Action buttons on the right */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => setIsRosterUploadOpen(true)}
            className="text-xs"
          >
            명렬 일괄 업로드
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => setIsExportOpen(true)}
            className="text-xs"
          >
            엑셀 다운로드
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={<Settings className="w-4 h-4 text-stone-600" />}
            onClick={onOpenSettingsModal}
            title="교사용 설정"
            className="text-xs"
          >
            <span className="hidden sm:inline">설정</span>
          </Button>
        </div>
      </div>

      {/* Class Overview Statistics Cards */}
      <TeacherStatsCards
        stats={stats}
        selectedDateStr={formatKoreanDate(selectedDate)}
      />

      {/* View Switcher: Roster vs Calendar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('roster')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
              viewMode === 'roster'
                ? 'bg-sage-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>학생별 일기 목록 ({formatKoreanDate(selectedDate)})</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
              viewMode === 'calendar'
                ? 'bg-sage-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>학급 월간 작성률 달력</span>
          </button>
        </div>

        <span className="text-xs text-stone-500 hidden sm:block">
          {viewMode === 'roster'
            ? '학생을 클릭하면 3가지 감사 내용과 비공개 관찰 메모를 작성할 수 있습니다.'
            : '날짜를 클릭하면 해당 날짜로 바로 이동합니다.'}
        </span>
      </div>

      {/* Main Mode View */}
      {viewMode === 'roster' ? (
        <StudentRosterTable
          students={students}
          entriesMap={currentDayEntriesMap}
          notesMap={currentDayNotesMap}
          selectedDate={selectedDate}
          onViewDiary={handleOpenDiaryDetail}
          onViewHistory={handleOpenStudentHistory}
        />
      ) : (
        <TeacherCalendarView
          currentYear={calendarYear}
          currentMonth={calendarMonth}
          dailyRates={dailyRatesMap}
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            setViewMode('roster');
          }}
          onPrevMonth={() => {
            if (calendarMonth === 1) {
              setCalendarYear(y => y - 1);
              setCalendarMonth(12);
            } else {
              setCalendarMonth(m => m - 1);
            }
          }}
          onNextMonth={() => {
            if (calendarMonth === 12) {
              setCalendarYear(y => y + 1);
              setCalendarMonth(1);
            } else {
              setCalendarMonth(m => m + 1);
            }
          }}
          onGoToday={() => {
            const now = new Date();
            setCalendarYear(now.getFullYear());
            setCalendarMonth(now.getMonth() + 1);
            setSelectedDate(getTodayString());
          }}
        />
      )}

      {/* Modals */}
      {isDetailModalOpen && selectedStudentForDetail && (
        <TeacherDiaryDetailModal
          isOpen={true}
          student={selectedStudentForDetail}
          dateStr={selectedDate}
          entry={selectedEntryForDetail}
          existingNote={currentDayNotesMap.get(selectedStudentForDetail.id) || null}
          onClose={() => setIsDetailModalOpen(false)}
          onSaveNote={handleSaveTeacherNote}
        />
      )}

      {isHistoryModalOpen && selectedStudentForHistory && (
        <StudentHistoryModal
          isOpen={true}
          student={selectedStudentForHistory}
          onClose={() => setIsHistoryModalOpen(false)}
          onSelectDateDiary={(student, entry, dateStr) => {
            setSelectedDate(dateStr);
            setSelectedStudentForDetail(student);
            setSelectedEntryForDetail(entry);
            setIsHistoryModalOpen(false);
            setIsDetailModalOpen(true);
          }}
        />
      )}

      {isRosterUploadOpen && (
        <RosterUploadModal
          isOpen={true}
          onClose={() => setIsRosterUploadOpen(false)}
          grade={parseInt(selectedGrade, 10) || 1}
          classNum={parseInt(selectedClassNum, 10) || 1}
          year={config.year || 2026}
          onUploadSuccess={handleRosterUploaded}
        />
      )}

      {isExportOpen && (
        <ExportModal
          isOpen={true}
          onClose={() => setIsExportOpen(false)}
          entries={allEntries}
          students={students}
          notes={allNotes}
          defaultYear={calendarYear}
          defaultMonth={calendarMonth}
          defaultGrade={parseInt(selectedGrade, 10) || 1}
          defaultClassNum={parseInt(selectedClassNum, 10) || 1}
        />
      )}

      {isSettingsOpen && (
        <TeacherSettingsModal
          isOpen={true}
          onClose={onCloseSettingsModal}
          config={config}
          onSaveConfig={handleSaveConfig}
          onResetData={handleResetData}
          onPopulateSampleData={handlePopulateSample}
        />
      )}

      {isResetModalOpen && (
        <TeacherResetModal
          isOpen={true}
          onClose={() => setIsResetModalOpen(false)}
          onResetAll={handleResetData}
          onResetDiariesOnly={handleResetDiariesOnly}
        />
      )}
    </div>
  );
};
