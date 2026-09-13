import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Student, GratitudeEntry, TeacherNote } from '../../types';
import { formatKoreanDate } from '../../utils/dateUtils';
import { Sparkles, Lock, Save, User, Calendar, AlertCircle } from 'lucide-react';

interface TeacherDiaryDetailModalProps {
  isOpen: boolean;
  student: Student | null;
  dateStr: string;
  entry: GratitudeEntry | null;
  existingNote: TeacherNote | null;
  onClose: () => void;
  onSaveNote: (noteText: string) => Promise<void>;
}

export const TeacherDiaryDetailModal: React.FC<TeacherDiaryDetailModalProps> = ({
  isOpen,
  student,
  dateStr,
  entry,
  existingNote,
  onClose,
  onSaveNote
}) => {
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (existingNote) {
      setNoteText(existingNote.note || '');
    } else {
      setNoteText('');
    }
    setSaveSuccess(false);
  }, [existingNote, isOpen, student]);

  if (!student) return null;

  const handleSaveNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNote(true);
    try {
      await onSaveNote(noteText.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      // error handled by parent
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-sage-600" />
          <span>{student.grade}학년 {student.classNum}반 {student.number}번 {student.name}</span>
        </div>
      }
      subtitle={`${formatKoreanDate(dateStr)} 일기 확인 및 관찰 메모`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Student's Gratitude Content */}
        {entry ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
                <span>오늘의 감사 3가지</span>
              </h4>
              {entry.keywords && entry.keywords.length > 0 && (
                <div className="flex items-center gap-1">
                  {entry.keywords.map((kw, i) => (
                    <Badge key={i} variant="sage" size="sm">
                      #{kw}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Gratitudes */}
            <div className="space-y-2.5">
              <div className="p-3.5 bg-cream-50 rounded-2xl border border-stone-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sage-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.gratitude1}
                </p>
              </div>

              <div className="p-3.5 bg-cream-50 rounded-2xl border border-stone-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sage-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.gratitude2}
                </p>
              </div>

              <div className="p-3.5 bg-cream-50 rounded-2xl border border-stone-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sage-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.gratitude3}
                </p>
              </div>
            </div>

            {/* AI Encouragement */}
            <div className="bg-sage-50/90 rounded-2xl p-4 border border-sage-200">
              <div className="flex items-center gap-2 mb-1 text-sage-900 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI 제공 격려 코멘트</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed pl-1">
                "{entry.aiComment || '오늘 하루 속에서 작은 감사들을 발견해 낸 모습이 참 좋아요. 내일도 주변의 좋은 순간을 찾아보세요! 🌱'}"
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-stone-50 rounded-2xl p-6 text-center text-stone-500 border border-stone-100">
            <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-medium text-sm">해당 날짜에 작성된 감사일기가 아직 없습니다.</p>
            <p className="text-xs text-stone-400 mt-1">
              학생이 일기를 작성하면 자동으로 이곳에 업데이트됩니다.
            </p>
          </div>
        )}

        {/* Teacher Confidential Note Section */}
        <form onSubmit={handleSaveNoteSubmit} className="border-t border-stone-100 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <label htmlFor="teacher-note-input" className="text-sm font-bold text-stone-800">
                담임교사 전용 관찰·지도 메모
              </label>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                비공개 (학생 비노출)
              </span>
            </div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 animate-fade-in">
                ✓ 메모가 저장되었습니다
              </span>
            )}
          </div>

          <textarea
            id="teacher-note-input"
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="학생의 교우관계, 정서 상태, 특이사항 등에 대한 지도 메모를 남겨보세요. (예: 친구 관계에 관심을 가지고 관찰 필요)"
            className="w-full bg-cream-50/90 border border-stone-200 rounded-2xl p-3.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
          />

          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/60 text-[11px] text-stone-500 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
            <p>
              이 메모는 교사 대시보드에서만 조회 가능하며 학생에게 절대 공개되지 않습니다. 불필요한 민감 정보는 기록하지 않도록 주의해 주세요.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="submit"
              variant="secondary"
              size="md"
              icon={<Save className="w-4 h-4" />}
              disabled={isSavingNote}
              className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200"
            >
              {isSavingNote ? '저장 중...' : '교사 메모 저장'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
            >
              닫기
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
