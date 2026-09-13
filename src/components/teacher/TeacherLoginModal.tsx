import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { KeyRound, ShieldAlert } from 'lucide-react';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  correctPin: string;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  correctPin
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === correctPin.trim()) {
      setError('');
      setPin('');
      onLoginSuccess();
    } else {
      setError('비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-sage-600" />
          <span>선생님 전용 관리 화면</span>
        </div>
      }
      subtitle="교사 인증 비밀번호를 입력해 주세요."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">
            교사 비밀번호 (PIN)
          </label>
          <input
            type="password"
            maxLength={10}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              if (error) setError('');
            }}
            placeholder="비밀번호 4자리 입력"
            className="w-full bg-cream-50 border border-stone-200 rounded-xl px-4 py-3 text-center text-base sm:text-lg font-bold tracking-widest text-stone-900 placeholder:text-stone-400 placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition"
            autoFocus
          />
        </div>

        {error && (
          <div className="text-xs text-coral-600 font-medium bg-coral-50 p-2.5 rounded-xl border border-coral-200">
            {error}
          </div>
        )}

        <div className="bg-sage-50/80 rounded-xl p-3 border border-sage-200/60 text-xs text-stone-600 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
          <p>
            교사 화면에서는 학급 학생들의 일기 열람 및 관리가 가능하므로 비밀번호로 안전하게 보호됩니다.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" size="md">
            대시보드 입장
          </Button>
        </div>
      </form>
    </Modal>
  );
};
