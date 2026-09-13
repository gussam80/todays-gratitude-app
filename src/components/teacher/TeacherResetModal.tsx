import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle, FileText, Trash2 } from 'lucide-react';

interface TeacherResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetAll: () => Promise<void>;
  onResetDiariesOnly: () => Promise<void>;
}

export const TeacherResetModal: React.FC<TeacherResetModalProps> = ({
  isOpen,
  onClose,
  onResetAll,
  onResetDiariesOnly
}) => {
  const [loadingType, setLoadingType] = useState<'all' | 'diaries' | null>(null);

  const handleConfirmResetAll = async () => {
    if (window.confirm('⚠️ [주의: 모든 데이터 완전 초기화]\n\n저장된 모든 학생 명단, 작성된 감사일기, 교사 지도 메모가 영구적으로 삭제됩니다.\n\n정말 모든 데이터를 깨끗하게 리셋하시겠습니까?')) {
      setLoadingType('all');
      try {
        await onResetAll();
        onClose();
      } finally {
        setLoadingType(null);
      }
    }
  };

  const handleConfirmResetDiaries = async () => {
    if (window.confirm('📝 [감사일기 및 메모만 초기화]\n\n등록된 학생 명단(이름, 번호)은 그대로 유지하고, 학생들이 작성한 일기와 교사 메모만 모두 비웁니다.\n\n진행하시겠습니까?')) {
      setLoadingType('diaries');
      try {
        await onResetDiariesOnly();
        onClose();
      } finally {
        setLoadingType(null);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🗑️ 데이터 전체 리셋 및 초기화"
      maxWidth="md"
    >
      <div className="space-y-4 text-stone-700">
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 leading-relaxed">
            <span className="font-bold">주의:</span> 리셋 후에는 데이터를 다시 복구할 수 없습니다. 새 학기나 새로운 학급을 시작하거나, 테스트 목적으로 작성된 데이터를 비우실 때 적절한 리셋 범위를 선택해 주세요.
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Option 1: Complete Reset (All) */}
          <div className="p-4 bg-cream-50/80 border-2 border-rose-200 hover:border-rose-300 rounded-2xl transition">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-rose-100 text-rose-700 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-stone-900">모든 데이터 완전 리셋 (완전 백지화)</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-md">전체 초기화</span>
            </div>
            <p className="text-xs text-stone-600 mb-3.5 pl-8">
              저장된 <span className="font-bold text-stone-800">학생 명단, 감사일기 전체, 교사 관찰 메모</span>를 모두 삭제하여 처음 설치한 상태처럼 깨끗하게 비웁니다.
            </p>
            <div className="pl-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfirmResetAll}
                disabled={loadingType !== null}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold border-0 text-xs shadow-xs cursor-pointer"
              >
                {loadingType === 'all' ? '리셋 진행 중...' : '⚠️ 모든 데이터 완전 리셋 실행'}
              </Button>
            </div>
          </div>

          {/* Option 2: Diaries & Notes only */}
          <div className="p-4 bg-cream-50/80 border border-amber-200 hover:border-amber-300 rounded-2xl transition">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 text-amber-800 rounded-xl">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-stone-900">감사일기 기록만 비우기 (학생 명단 유지)</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">명단 보존</span>
            </div>
            <p className="text-xs text-stone-600 mb-3.5 pl-8">
              <span className="font-bold text-emerald-700">학생 명단(이름, 번호)은 안전하게 그대로 유지</span>하고, 작성된 감사일기와 교사 메모만 비워 새로 일기를 시작합니다.
            </p>
            <div className="pl-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfirmResetDiaries}
                disabled={loadingType !== null}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold border-0 text-xs shadow-xs cursor-pointer"
              >
                {loadingType === 'diaries' ? '비우는 중...' : '📝 일기 기록만 비우기 실행'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-stone-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loadingType !== null}
            className="text-stone-500 hover:text-stone-800 text-xs"
          >
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
};
