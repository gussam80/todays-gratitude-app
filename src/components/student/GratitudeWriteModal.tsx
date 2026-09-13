import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { GratitudeEntry } from '../../types';
import { formatKoreanDate } from '../../utils/dateUtils';
import { GRATITUDE_EXAMPLES } from '../../constants/theme';
import { checkGratitudeQuality, validateAllGratitudes, GratitudeValidationError } from '../../utils/gratitudeValidation';
import { Save, Sparkles, Lightbulb, AlertCircle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GratitudeWriteModalProps {
  isOpen: boolean;
  dateStr: string;
  existingEntry: GratitudeEntry | null;
  onClose: () => void;
  onSave: (gratitude1: string, gratitude2: string, gratitude3: string) => Promise<void>;
  isLoading?: boolean;
}

export const GratitudeWriteModal: React.FC<GratitudeWriteModalProps> = ({
  isOpen,
  dateStr,
  existingEntry,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [g1, setG1] = useState('');
  const [g2, setG2] = useState('');
  const [g3, setG3] = useState('');
  const [validationError, setValidationError] = useState<GratitudeValidationError | null>(null);

  useEffect(() => {
    if (existingEntry) {
      setG1(existingEntry.gratitude1 || '');
      setG2(existingEntry.gratitude2 || '');
      setG3(existingEntry.gratitude3 || '');
    } else {
      setG1('');
      setG2('');
      setG3('');
    }
    setValidationError(null);
  }, [existingEntry, isOpen, dateStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateAllGratitudes(g1, g2, g3);
    if (validation) {
      setValidationError(validation);
      return;
    }

    setValidationError(null);
    try {
      await onSave(g1.trim(), g2.trim(), g3.trim());

      // Celebration Confetti effect!
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#558a62', '#ffd166', '#06d6a0', '#118ab2', '#ff85a1']
      });
    } catch (err) {
      setValidationError({
        field: 1,
        title: '저장 중 문제가 발생했습니다',
        message: '일기를 저장하는 도중 오류가 발생했습니다. 다시 시도해 주세요.'
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>🌱</span>
          <span>{formatKoreanDate(dateStr)}, 오늘의 감사일기</span>
        </div>
      }
      subtitle="오늘 하루 감사했던 일을 세 가지 적어보세요."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Encouraging Validation Banner */}
        {validationError && (
          <div className="p-4 bg-amber-50/95 border-2 border-amber-300 rounded-2xl space-y-2 text-left shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                💭
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <span>{validationError.title}</span>
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {validationError.message}
                </p>
                {validationError.suggestion && (
                  <div className="text-[11px] text-amber-900 bg-white/90 p-2.5 rounded-xl border border-amber-200 mt-1.5 flex items-start gap-1.5 shadow-2xs">
                    <span className="font-bold text-amber-800 flex-shrink-0">🌱 작성 팁:</span>
                    <span>{validationError.suggestion}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Item 1 */}
        <div className={`rounded-2xl p-4 border transition-all ${
          validationError && validationError.field === 1
            ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-300'
            : 'bg-cream-50/80 border-stone-200 focus-within:border-sage-400 focus-within:ring-2 focus-within:ring-sage-200'
        }`}>
          <label className="block text-sm font-bold text-stone-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-sage-200 text-sage-800 text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span>오늘 감사했던 일은 무엇인가요?</span>
          </label>
          <textarea
            rows={2}
            value={g1}
            onChange={(e) => {
              setG1(e.target.value);
              if (validationError && validationError.field === 1) setValidationError(null);
            }}
            placeholder="예: 짝꿍이 모르는 문제를 친절하게 가르쳐 주었어요."
            className="w-full bg-transparent border-0 text-sm sm:text-base text-stone-800 placeholder:text-stone-400 focus:outline-none resize-none"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-stone-200/60 text-[11px]">
            <div>
              {(() => {
                const clean = g1.trim().replace(/\s/g, '');
                if (clean.length === 0) {
                  return <span className="text-stone-400">💡 단어가 아닌 완성된 문장(~했어요, ~했습니다)으로 적어보세요</span>;
                }
                const q = checkGratitudeQuality(g1);
                if (!q.valid) {
                  return <span className="text-amber-700 font-medium">{q.summaryBadge || `🌱 ${q.message.split('.')[0]}`}</span>;
                }
                return <span className="text-emerald-700 font-medium flex items-center gap-1">✓ 따뜻하고 정성스러운 감사 문장이에요!</span>;
              })()}
            </div>
            <span className={`font-semibold text-[10px] ${checkGratitudeQuality(g1).valid ? 'text-emerald-600 font-bold' : 'text-stone-400'}`}>
              {g1.trim().replace(/\s/g, '').length}자
            </span>
          </div>
        </div>

        {/* Item 2 */}
        <div className={`rounded-2xl p-4 border transition-all ${
          validationError && validationError.field === 2
            ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-300'
            : 'bg-cream-50/80 border-stone-200 focus-within:border-sage-400 focus-within:ring-2 focus-within:ring-sage-200'
        }`}>
          <label className="block text-sm font-bold text-stone-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-sage-200 text-sage-800 text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>또 어떤 일에 감사했나요?</span>
          </label>
          <textarea
            rows={2}
            value={g2}
            onChange={(e) => {
              setG2(e.target.value);
              if (validationError && validationError.field === 2) setValidationError(null);
            }}
            placeholder="예: 점심 급식에 내가 제일 좋아하는 돈가스가 나왔어요."
            className="w-full bg-transparent border-0 text-sm sm:text-base text-stone-800 placeholder:text-stone-400 focus:outline-none resize-none"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-stone-200/60 text-[11px]">
            <div>
              {(() => {
                const clean = g2.trim().replace(/\s/g, '');
                if (clean.length === 0) {
                  return <span className="text-stone-400">💡 단어가 아닌 완성된 문장(~했어요, ~했습니다)으로 적어보세요</span>;
                }
                const q = checkGratitudeQuality(g2);
                if (!q.valid) {
                  return <span className="text-amber-700 font-medium">{q.summaryBadge || `🌱 ${q.message.split('.')[0]}`}</span>;
                }
                return <span className="text-emerald-700 font-medium flex items-center gap-1">✓ 따뜻하고 정성스러운 감사 문장이에요!</span>;
              })()}
            </div>
            <span className={`font-semibold text-[10px] ${checkGratitudeQuality(g2).valid ? 'text-emerald-600 font-bold' : 'text-stone-400'}`}>
              {g2.trim().replace(/\s/g, '').length}자
            </span>
          </div>
        </div>

        {/* Item 3 */}
        <div className={`rounded-2xl p-4 border transition-all ${
          validationError && validationError.field === 3
            ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-300'
            : 'bg-cream-50/80 border-stone-200 focus-within:border-sage-400 focus-within:ring-2 focus-within:ring-sage-200'
        }`}>
          <label className="block text-sm font-bold text-stone-800 mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-sage-200 text-sage-800 text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>마지막으로 감사한 일은 무엇인가요?</span>
          </label>
          <textarea
            rows={2}
            value={g3}
            onChange={(e) => {
              setG3(e.target.value);
              if (validationError && validationError.field === 3) setValidationError(null);
            }}
            placeholder="예: 어렵던 영어 단어를 끝까지 외워서 스스로 뿌듯했어요."
            className="w-full bg-transparent border-0 text-sm sm:text-base text-stone-800 placeholder:text-stone-400 focus:outline-none resize-none"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-stone-200/60 text-[11px]">
            <div>
              {(() => {
                const clean = g3.trim().replace(/\s/g, '');
                if (clean.length === 0) {
                  return <span className="text-stone-400">💡 단어가 아닌 완성된 문장(~했어요, ~했습니다)으로 적어보세요</span>;
                }
                const q = checkGratitudeQuality(g3);
                if (!q.valid) {
                  return <span className="text-amber-700 font-medium">{q.summaryBadge || `🌱 ${q.message.split('.')[0]}`}</span>;
                }
                return <span className="text-emerald-700 font-medium flex items-center gap-1">✓ 따뜻하고 정성스러운 감사 문장이에요!</span>;
              })()}
            </div>
            <span className={`font-semibold text-[10px] ${checkGratitudeQuality(g3).valid ? 'text-emerald-600 font-bold' : 'text-stone-400'}`}>
              {g3.trim().replace(/\s/g, '').length}자
            </span>
          </div>
        </div>

        {/* Edit timestamp record if existing */}
        {existingEntry && (
          <div className="text-xs text-stone-400 flex items-center gap-1.5 px-1">
            <Clock className="w-3.5 h-3.5" />
            <span>최초 작성: {new Date(existingEntry.createdAt).toLocaleString('ko-KR')}</span>
            {existingEntry.firstModifiedAt && (
              <span>(수정됨)</span>
            )}
          </div>
        )}

        {/* Examples Guide Box */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-xs sm:text-sm text-stone-600">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>💡 감사한 일의 예시 (클릭하면 내용에 쏙 들어갑니다!)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-stone-600">
            {GRATITUDE_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (!g1.trim()) setG1(ex);
                  else if (!g2.trim()) setG2(ex);
                  else if (!g3.trim()) setG3(ex);
                  setValidationError(null);
                }}
                className="text-left text-stone-700 hover:text-amber-900 hover:bg-amber-100/60 p-1 rounded transition text-[11px]"
              >
                • {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            icon={isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {isLoading
              ? 'AI가 격려 코멘트를 준비 중... 🌱'
              : existingEntry
              ? '수정 완료하기'
              : '감사일기 저장하기'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
