import React from 'react';
import { getCalendarGrid, getMonthYearLabel, getTodayString } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface TeacherCalendarViewProps {
  currentYear: number;
  currentMonth: number;
  dailyRates: Map<string, { completed: number; total: number; rate: number }>;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToday: () => void;
}

export const TeacherCalendarView: React.FC<TeacherCalendarViewProps> = ({
  currentYear,
  currentMonth,
  dailyRates,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToday
}) => {
  const days = getCalendarGrid(currentYear, currentMonth);
  const todayStr = getTodayString();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-soft">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-sage-600" />
          <h3 className="text-lg sm:text-xl font-bold text-stone-900">
            학급 일자별 작성률 달력 ({getMonthYearLabel(currentYear, currentMonth)})
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onGoToday}
            className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium"
          >
            오늘
          </button>
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-semibold text-stone-400">
        {weekDays.map((d, idx) => (
          <div key={d} className={idx === 0 ? 'text-coral-500' : idx === 6 ? 'text-sky-500' : ''}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map(({ day, dateStr, isCurrentMonth }) => {
          const rateInfo = dailyRates.get(dateStr);
          const rate = rateInfo ? rateInfo.rate : 0;
          const completed = rateInfo ? rateInfo.completed : 0;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;

          // Background styling based on rate
          let bgClass = 'bg-cream-50/50 border-stone-100';
          let rateBadgeClass = 'text-stone-400 bg-stone-100';

          if (rate >= 80) {
            bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-900';
            rateBadgeClass = 'text-emerald-800 bg-emerald-100 font-bold';
          } else if (rate >= 40) {
            bgClass = 'bg-sage-50/70 border-sage-200 text-sage-900';
            rateBadgeClass = 'text-sage-800 bg-sage-100 font-semibold';
          } else if (rate > 0) {
            bgClass = 'bg-amber-50/50 border-amber-200 text-amber-900';
            rateBadgeClass = 'text-amber-800 bg-amber-100';
          }

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`p-1.5 sm:p-2.5 min-h-[64px] sm:min-h-[72px] rounded-2xl border flex flex-col justify-between text-left transition-all ${
                !isCurrentMonth ? 'opacity-30' : ''
              } ${isSelected ? 'ring-2 ring-sage-600 border-sage-600 shadow-sm' : ''} ${bgClass}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-bold ${isToday ? 'text-sage-700 underline' : ''}`}>
                  {day}
                </span>
                {isToday && (
                  <span className="text-[10px] text-sage-600 font-semibold">오늘</span>
                )}
              </div>

              {completed > 0 ? (
                <div className="mt-1 flex items-center justify-between w-full">
                  <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md ${rateBadgeClass}`}>
                    {rate}%
                  </span>
                  <span className="text-[10px] text-stone-500 hidden sm:inline">
                    {completed}명
                  </span>
                </div>
              ) : (
                <div className="text-[10px] text-stone-400 mt-auto">
                  -
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
        <span>* 날짜를 클릭하면 해당 일자의 학생 목록 및 일기를 즉시 확인합니다.</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> 80% 이상
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sage-300 inline-block" /> 40~79%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" /> 1~39%
          </span>
        </div>
      </div>
    </div>
  );
};
