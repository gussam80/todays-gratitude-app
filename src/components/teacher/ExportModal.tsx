import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Student, GratitudeEntry, TeacherNote } from '../../types';
import { exportGratitudeToExcel } from '../../services/excelService';
import { Download, FileSpreadsheet, CheckSquare, Square } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: GratitudeEntry[];
  students: Student[];
  notes: TeacherNote[];
  defaultYear: number;
  defaultMonth: number;
  defaultGrade: number;
  defaultClassNum: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  entries,
  students,
  notes,
  defaultYear,
  defaultMonth,
  defaultGrade,
  defaultClassNum
}) => {
  const [year, setYear] = useState<number>(defaultYear);
  const [month, setMonth] = useState<number>(defaultMonth);
  const [grade, setGrade] = useState<number>(defaultGrade);
  const [classNum, setClassNum] = useState<number>(defaultClassNum);
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [includeNotes, setIncludeNotes] = useState<boolean>(false);

  const handleExport = () => {
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const filteredEntries = entries.filter(e => e.date.startsWith(yearMonth));

    exportGratitudeToExcel(
      filteredEntries,
      students,
      notes,
      yearMonth,
      grade,
      classNum,
      format,
      includeNotes
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span>감사일기 데이터 내보내기</span>
        </div>
      }
      subtitle="학급의 감사일기 기록을 엑셀 또는 CSV 파일로 저장합니다."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Conditions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              대상 연도/월
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-1/2 bg-cream-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs font-medium text-stone-800"
              >
                <option value={2025}>2025년</option>
                <option value={2026}>2026년</option>
                <option value={2027}>2027년</option>
              </select>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-1/2 bg-cream-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs font-medium text-stone-800"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}월
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              학년 / 반
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-1/2 bg-cream-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs font-medium text-stone-800"
              >
                <option value={1}>1학년</option>
                <option value={2}>2학년</option>
                <option value={3}>3학년</option>
              </select>
              <select
                value={classNum}
                onChange={(e) => setClassNum(Number(e.target.value))}
                className="w-1/2 bg-cream-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs font-medium text-stone-800"
              >
                <option value={1}>1반</option>
                <option value={2}>2반</option>
                <option value={3}>3반</option>
                <option value={4}>4반</option>
              </select>
            </div>
          </div>
        </div>

        {/* File Format Option */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">
            파일 형식
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormat('xlsx')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                format === 'xlsx'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              Excel 파일 (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                format === 'csv'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              CSV 파일 (.csv)
            </button>
          </div>
        </div>

        {/* Teacher notes checkbox */}
        <div
          onClick={() => setIncludeNotes(!includeNotes)}
          className="flex items-center gap-2 p-3 bg-purple-50/70 border border-purple-200/70 rounded-2xl cursor-pointer hover:bg-purple-50 transition"
        >
          {includeNotes ? (
            <CheckSquare className="w-4 h-4 text-purple-700 flex-shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-stone-400 flex-shrink-0" />
          )}
          <div className="text-xs text-stone-700">
            <span className="font-bold text-purple-900">교사 비공개 지도 메모 포함하기</span>
            <p className="text-[11px] text-stone-500">
              체크 시 교사가 작성한 관찰 메모 열이 파일에 함께 포함됩니다.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button variant="outline" size="md" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            다운로드 실행
          </Button>
        </div>
      </div>
    </Modal>
  );
};
