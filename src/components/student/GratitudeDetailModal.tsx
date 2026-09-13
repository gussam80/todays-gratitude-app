import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { GratitudeEntry } from '../../types';
import { formatKoreanDate } from '../../utils/dateUtils';
import { Sparkles, Edit3, Calendar, RefreshCw } from 'lucide-react';

interface GratitudeDetailModalProps {
  isOpen: boolean;
  entry: GratitudeEntry | null;
  onClose: () => void;
  onEdit: () => void;
  onRegenerateAI?: () => void;
  isRegeneratingAI?: boolean;
}

export const GratitudeDetailModal: React.FC<GratitudeDetailModalProps> = ({
  isOpen,
  entry,
  onClose,
  onEdit,
  onRegenerateAI,
  isRegeneratingAI = false
}) => {
  if (!entry) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-stone-900">
          <Calendar className="w-5 h-5 text-sage-600" />
          <span>{formatKoreanDate(entry.date)} 감사일기</span>
        </div>
      }
      subtitle="내가 발견했던 고마운 순간들"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Keywords tags */}
        {entry.keywords && entry.keywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-400">감사 키워드:</span>
            {entry.keywords.map((kw, i) => (
              <Badge key={i} variant="sage" size="sm">
                #{kw}
              </Badge>
            ))}
          </div>
        )}

        {/* 3 Gratitude Cards */}
        <div className="space-y-3">
          <div className="bg-cream-50/90 rounded-2xl p-4 border border-stone-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-sage-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-sm">
              1
            </span>
            <p className="text-stone-800 text-sm sm:text-base leading-relaxed flex-1 whitespace-pre-wrap">
              {entry.gratitude1}
            </p>
          </div>

          <div className="bg-cream-50/90 rounded-2xl p-4 border border-stone-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-sage-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-sm">
              2
            </span>
            <p className="text-stone-800 text-sm sm:text-base leading-relaxed flex-1 whitespace-pre-wrap">
              {entry.gratitude2}
            </p>
          </div>

          <div className="bg-cream-50/90 rounded-2xl p-4 border border-stone-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-sage-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-sm">
              3
            </span>
            <p className="text-stone-800 text-sm sm:text-base leading-relaxed flex-1 whitespace-pre-wrap">
              {entry.gratitude3}
            </p>
          </div>
        </div>

        {/* AI Encouraging Comment */}
        <div className="bg-gradient-to-br from-sage-50 to-emerald-50/60 rounded-3xl p-5 border border-sage-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-sage-500 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-sm font-bold text-sage-900">
                AI의 오늘의 격려 코멘트
              </span>
            </div>

            {onRegenerateAI && (
              <button
                onClick={onRegenerateAI}
                disabled={isRegeneratingAI}
                className="p-1.5 rounded-lg text-sage-700 hover:bg-sage-200/60 transition-colors flex items-center gap-1 text-xs disabled:opacity-50"
                title="격려 코멘트 다시 받기"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingAI ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">다시 받기</span>
              </button>
            )}
          </div>

          <p className="text-sm sm:text-base text-stone-800 font-medium leading-relaxed mt-2 pl-1">
            {entry.aiComment || "작은 감사 하나가 오늘을 조금 더 따뜻하게 만들어 줍니다. 내일도 행복한 순간을 찾아보세요! 🌱"}
          </p>

          <p className="text-[11px] text-sage-600/70 mt-3 pl-1">
            * AI는 학생을 평가하거나 판단하지 않으며, 따뜻한 마음을 온전히 지지하고 격려합니다.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="md"
            icon={<Edit3 className="w-4 h-4 text-stone-600" />}
            onClick={onEdit}
          >
            내용 수정하기
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onClose}
          >
            확인 완료
          </Button>
        </div>
      </div>
    </Modal>
  );
};
