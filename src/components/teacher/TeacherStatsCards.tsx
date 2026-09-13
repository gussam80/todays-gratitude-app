import React from 'react';
import { ClassStats } from '../../types';
import { Users, CheckCircle, Clock, TrendingUp, Calendar } from 'lucide-react';

interface TeacherStatsCardsProps {
  stats: ClassStats;
  selectedDateStr: string;
}

export const TeacherStatsCards: React.FC<TeacherStatsCardsProps> = ({ stats, selectedDateStr }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
          <span>오늘 우리 반 감사일기</span>
          <span className="text-xs font-normal text-stone-500">
            ({selectedDateStr} 기준)
          </span>
        </h3>
        <span className="text-xs text-stone-500 bg-cream-50 px-2.5 py-1 rounded-full border border-stone-200">
          작성률 {stats.rateToday}%
        </span>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-medium">전체 학생</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-stone-800">{stats.totalStudents}</span>
            <span className="text-xs text-stone-500">명</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-medium">작성 완료</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-700">{stats.completedToday}</span>
            <span className="text-xs text-emerald-600">명</span>
          </div>
        </div>

        {/* Pending (Neutral stone color, not aggressive red) */}
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium">미작성</span>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-stone-700">{stats.pendingToday}</span>
            <span className="text-xs text-stone-400">명</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-2xl p-4 border border-sage-100 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-sage-600 mb-1">
            <span className="text-xs font-medium">오늘 작성률</span>
            <TrendingUp className="w-4 h-4 text-sage-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-sage-800">{stats.rateToday}</span>
            <span className="text-xs text-sage-600">%</span>
          </div>
        </div>

        {/* Monthly Avg Days */}
        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-soft flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-medium">이달 평균 작성</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-amber-800">{stats.monthAvgDays}</span>
            <span className="text-xs text-amber-700">일</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-stone-100 shadow-soft">
        <div className="flex items-center justify-between text-xs text-stone-600 mb-2 font-medium">
          <span>학급 참여 진행도</span>
          <span>
            {stats.completedToday} / {stats.totalStudents} 명 완료 ({stats.rateToday}%)
          </span>
        </div>
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, stats.rateToday))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
