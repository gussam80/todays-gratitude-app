import React, { useState } from 'react';
import { Student, GratitudeEntry, TeacherNote } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Search, CheckCircle, Clock, Eye, History, FileText } from 'lucide-react';

interface StudentRosterTableProps {
  students: Student[];
  entriesMap: Map<string, GratitudeEntry>; // studentId -> entry
  notesMap: Map<string, TeacherNote>; // studentId -> note
  selectedDate: string;
  onViewDiary: (student: Student, entry: GratitudeEntry | null) => void;
  onViewHistory: (student: Student) => void;
}

export const StudentRosterTable: React.FC<StudentRosterTableProps> = ({
  students,
  entriesMap,
  notesMap,
  selectedDate,
  onViewDiary,
  onViewHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'completed' | 'pending'>('all');

  // Filter and search
  const filteredStudents = students.filter(student => {
    const isCompleted = entriesMap.has(student.id);

    // Status filter
    if (filterMode === 'completed' && !isCompleted) return false;
    if (filterMode === 'pending' && isCompleted) return false;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      const matchName = student.name.toLowerCase().includes(term);
      const matchNumber = String(student.number) === term;
      return matchName || matchNumber;
    }

    return true;
  });

  const completedCount = students.filter(s => entriesMap.has(s.id)).length;
  const pendingCount = students.length - completedCount;

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-soft overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-cream-50/50">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-stone-200/80 shadow-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'all'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            전체 ({students.length})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            ✓ 완료 ({completedCount})
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'pending'
                ? 'bg-stone-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            미작성 ({pendingCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름 또는 번호 검색"
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/70 text-stone-500 text-xs font-bold uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6 w-16 text-center">번호</th>
              <th className="py-3 px-4 sm:px-6">이름</th>
              <th className="py-3 px-4 sm:px-6 text-center">작성 여부</th>
              <th className="py-3 px-4 sm:px-6">감사 키워드 / 요약</th>
              <th className="py-3 px-4 sm:px-6 text-center">교사 메모</th>
              <th className="py-3 px-4 sm:px-6 text-right">상세 및 이력</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-stone-400 text-sm">
                  조건에 맞는 학생이 없습니다.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const entry = entriesMap.get(student.id) || null;
                const isCompleted = !!entry;
                const note = notesMap.get(student.id) || null;

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-cream-50/60 transition-colors group"
                  >
                    {/* Number */}
                    <td className="py-3.5 px-4 sm:px-6 text-center font-semibold text-stone-600">
                      {student.number}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-stone-800">
                      {student.name}
                    </td>

                    {/* Completion Status */}
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          작성 완료
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full border border-stone-200">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          미작성
                        </span>
                      )}
                    </td>

                    {/* Gratitude snippet / keywords */}
                    <td className="py-3.5 px-4 sm:px-6 max-w-xs truncate">
                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {entry?.keywords && entry.keywords.length > 0 ? (
                            entry.keywords.map((kw, i) => (
                              <Badge key={i} variant="sage" size="sm">
                                #{kw}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-stone-500 truncate">
                              "{entry?.gratitude1}"
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 italic">-</span>
                      )}
                    </td>

                    {/* Teacher note badge */}
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      {note && note.note ? (
                        <span
                          title={note.note}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 cursor-pointer"
                          onClick={() => onViewDiary(student, entry)}
                        >
                          <FileText className="w-3 h-3 text-purple-600" />
                          메모있음
                        </span>
                      ) : (
                        <span className="text-xs text-stone-300">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant={isCompleted ? 'secondary' : 'outline'}
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => onViewDiary(student, entry)}
                          className="text-xs"
                        >
                          {isCompleted ? '일기 보기' : '작성창'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<History className="w-3.5 h-3.5 text-stone-500" />}
                          onClick={() => onViewHistory(student)}
                          title="학생의 전체 일기 이력 보기"
                          className="text-xs p-1.5"
                        >
                          <span className="sr-only">이력</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
