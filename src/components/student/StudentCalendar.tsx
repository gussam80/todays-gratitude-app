import React from 'react';
import { getCalendarGrid, getMonthYearLabel, getTodayString } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';
import { Button } from '../common/Button';

interface StudentCalendarProps {
  currentYear: number;
  currentMonth: number; // 1-12
  completedDates: Set<string>;
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToday: () => void;
}

export const StudentCalendar: React.FC<StudentCalendarProps> = ({
  currentYear,
  currentMonth,
  completedDates,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToday
}) => {
  const days = getCalendarGrid(currentYear, currentMonth);
  const todayStr = getTodayString();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-100 shadow-soft">
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-sage-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            {getMonthYearLabel(currentYear, currentMonth)}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onGoToday}
            className="text-xs px-2.5 py-1 text-sage-700 hover:text-sage-800"
          >
            오늘
          </Button>
          <button
            onClick={onPrevMonth}
            aria-label="이전 달"
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNextMonth}
            aria-label="다음 달"
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={`text-xs font-semibold py-1.5 ${
              idx === 0 ? 'text-coral-500' : idx === 6 ? 'text-sky-500' : 'text-stone-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map(({ day, dateStr, isCurrentMonth }) => {
          const isCompleted = completedDates.has(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`group relative flex flex-col items-center justify-between p-1.5 sm:p-2.5 min-h-[58px] sm:min-h-[72px] rounded-2xl border transition-all duration-150 text-left ${
                !isCurrentMonth
                  ? 'opacity-30 border-transparent hover:opacity-70'
                  : isToday
                  ? 'border-sage-400 bg-sage-50/60 shadow-sm ring-2 ring-sage-300/60'
                  : isCompleted
                  ? 'bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50 hover:shadow-sm'
                  : 'bg-cream-50/50 border-stone-100 hover:bg-cream-100/80 hover:border-stone-200'
              }`}
            >
              {/* Day number */}
              <div className="w-full flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    !isCurrentMonth
                      ? 'text-stone-400'
                      : isToday
                      ? 'text-sage-800 font-bold underline underline-offset-2'
                      : 'text-stone-700'
                  }`}
                >
                  {day}
                </span>

                {isToday && (
                  <span className="hidden sm:inline-block text-[10px] font-bold text-sage-700 bg-sage-200/80 px-1 rounded">
                    오늘
                  </span>
                )}
              </div>

              {/* Status indicator */}
              <div className="w-full flex items-center justify-center my-auto">
                {isCompleted ? (
                  <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 text-white shadow-sm transform group-hover:scale-110 transition-transform">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-stone-300 transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend & Guide */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100 text-xs text-stone-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">
              ✓
            </span>
            <span>작성 완료</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-xl border-2 border-sage-400 bg-sage-50" />
            <span>오늘</span>
          </div>
        </div>
        <p className="text-stone-400 hidden sm:block">
          날짜를 클릭하면 그날의 감사일기를 쓰거나 확인할 수 있어요
        </p>
      </div>
    </div>
  );
};
