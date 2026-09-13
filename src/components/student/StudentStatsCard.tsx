import React from 'react';
import { StudentStats } from '../../types';

interface StudentStatsCardProps {
  stats: StudentStats;
}

export const StudentStatsCard: React.FC<StudentStatsCardProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
          <span>나의 감사 습관</span>
          <span className="text-xs font-normal text-stone-400">이번 달</span>
        </h3>
        <span className="text-xs font-medium text-sage-600 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200">
          나와의 따뜻한 약속 🌱
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {/* Days wrote */}
        <div className="bg-cream-50/80 rounded-2xl p-3 border border-stone-100 flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl mb-1">🌱</span>
          <span className="text-xs text-stone-500 font-medium">이번 달 작성</span>
          <span className="text-base sm:text-xl font-bold text-stone-800 mt-0.5">
            {stats.monthCount}일
          </span>
        </div>

        {/* Gratitudes count */}
        <div className="bg-cream-50/80 rounded-2xl p-3 border border-stone-100 flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl mb-1">💚</span>
          <span className="text-xs text-stone-500 font-medium">기록한 감사</span>
          <span className="text-base sm:text-xl font-bold text-stone-800 mt-0.5">
            {stats.totalGratitudes}개
          </span>
        </div>

        {/* Streak */}
        <div className="bg-cream-50/80 rounded-2xl p-3 border border-stone-100 flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl mb-1">🔥</span>
          <span className="text-xs text-stone-500 font-medium">연속 작성</span>
          <span className="text-base sm:text-xl font-bold text-stone-800 mt-0.5">
            {stats.consecutiveDays}일
          </span>
        </div>
      </div>
    </div>
  );
};
