import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { Button } from '../common/Button';
import { Sparkles, UserCheck } from 'lucide-react';

interface StudentLoginProps {
  onLogin: (student: Student) => void;
  registeredStudents: Student[];
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onLogin, registeredStudents }) => {
  const [grade, setGrade] = useState<number | ''>('');
  const [classNum, setClassNum] = useState<number | ''>('');
  const [number, setNumber] = useState<number | ''>('');
  const [name, setName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Auto-fill student name if found in registeredStudents for selected grade, class, number
  useEffect(() => {
    if (grade && classNum && number) {
      const matched = registeredStudents.find(
        s => s.grade === grade && s.classNum === classNum && s.number === number
      );
      if (matched) {
        setName(matched.name);
      }
    }
  }, [grade, classNum, number, registeredStudents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grade) {
      setErrorMessage('학년을 선택해 주세요 😊');
      return;
    }
    if (!classNum) {
      setErrorMessage('반을 선택해 주세요 😊');
      return;
    }
    if (!number) {
      setErrorMessage('번호를 선택해 주세요 😊');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('이름을 입력해 주세요 😊');
      return;
    }
    setErrorMessage('');

    const studentId = `2026-${grade}-${classNum}-${number}`;
    const student: Student = {
      id: studentId,
      grade: Number(grade),
      classNum: Number(classNum),
      number: Number(number),
      name: name.trim(),
      createdAt: new Date().toISOString()
    };

    onLogin(student);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-stone-100 animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-sage-50 border border-sage-200 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
            🌱
          </div>
          <h2 className="text-2xl font-bold text-stone-900">오늘의 감사 - 감사일기</h2>
          <p className="text-sm text-stone-500 mt-1">
            시작하기 전에 학생 정보를 확인해 주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Grade, Class, Number Selectors */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                학년
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : '')}
                className={`w-full bg-cream-50 border border-stone-200 rounded-xl px-2 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 ${
                  !grade ? 'text-stone-400' : 'text-stone-800'
                }`}
                required
              >
                <option value="" disabled className="text-stone-400">학년</option>
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={g} className="text-stone-800 font-medium">
                    {g}학년
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                반
              </label>
              <select
                value={classNum}
                onChange={(e) => setClassNum(e.target.value ? Number(e.target.value) : '')}
                className={`w-full bg-cream-50 border border-stone-200 rounded-xl px-2 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 ${
                  !classNum ? 'text-stone-400' : 'text-stone-800'
                }`}
                required
              >
                <option value="" disabled className="text-stone-400">반</option>
                {Array.from({ length: 15 }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={c} className="text-stone-800 font-medium">
                    {c}반
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                번호
              </label>
              <select
                value={number}
                onChange={(e) => setNumber(e.target.value ? Number(e.target.value) : '')}
                className={`w-full bg-cream-50 border border-stone-200 rounded-xl px-2 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 ${
                  !number ? 'text-stone-400' : 'text-stone-800'
                }`}
                required
              >
                <option value="" disabled className="text-stone-400">번호</option>
                {Array.from({ length: 35 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num} className="text-stone-800 font-medium">
                    {num}번
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="이름을 입력하세요 (예: 김민지)"
              className="w-full bg-cream-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 transition"
              autoFocus
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-coral-500 font-medium animate-fade-in">
              {errorMessage}
            </p>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full py-3.5 text-base shadow-soft hover:shadow-md"
              icon={<Sparkles className="w-5 h-5 text-amber-300" />}
            >
              감사일기 쓰러 가기
            </Button>
          </div>

          <div className="bg-sage-50/70 rounded-2xl p-3.5 border border-sage-200/60 text-xs text-sage-800 flex items-start gap-2">
            <UserCheck className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
            <p>
              학교 공용 기기에서도 안심하세요! 작성 후 언제든지 상단의 <strong>[학생 변경]</strong> 버튼을 눌러 정보를 전환할 수 있습니다.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
