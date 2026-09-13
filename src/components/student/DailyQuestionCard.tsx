import React, { useState } from 'react';
import { DAILY_QUESTIONS, INSPIRING_QUOTES } from '../../constants/dailyQuestions';
import { RefreshCw, Lightbulb, Sparkles } from 'lucide-react';

export const DailyQuestionCard: React.FC = () => {
  const [questionIndex, setQuestionIndex] = useState<number>(() => {
    // Pick question based on day of month by default
    const day = new Date().getDate();
    return (day - 1) % DAILY_QUESTIONS.length;
  });

  const [quoteIndex, setQuoteIndex] = useState<number>(() => {
    const day = new Date().getDate();
    return (day - 1) % INSPIRING_QUOTES.length;
  });

  const currentQuestion = DAILY_QUESTIONS[questionIndex];
  const currentQuote = INSPIRING_QUOTES[quoteIndex];

  const handleNextQuestion = () => {
    setQuestionIndex((prev) => (prev + 1) % DAILY_QUESTIONS.length);
  };

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % INSPIRING_QUOTES.length);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Daily Question */}
      <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/50 rounded-3xl p-5 border border-amber-200/70 shadow-soft relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>오늘의 생각 질문</span>
            </div>
            <button
              onClick={handleNextQuestion}
              title="다른 질문 보기"
              className="p-1 rounded-lg text-amber-700 hover:bg-amber-100/80 transition-colors flex items-center gap-1 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">다른 질문</span>
            </button>
          </div>
          <p className="text-base sm:text-lg font-bold text-stone-900 mt-1 leading-snug">
            "{currentQuestion.question}"
          </p>
        </div>
        <p className="text-xs text-amber-700/80 mt-3 font-medium">
          💡 오늘 일기를 쓸 때 이 질문을 떠올려 보세요.
        </p>
      </div>

      {/* Inspiring quote */}
      <div className="bg-gradient-to-br from-sage-50/90 to-emerald-50/50 rounded-3xl p-5 border border-sage-200/70 shadow-soft relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sage-800 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-sage-600" />
              <span>오늘의 감사 한 문장</span>
            </div>
            <button
              onClick={handleNextQuote}
              title="다른 문장 보기"
              className="p-1 rounded-lg text-sage-700 hover:bg-sage-100/80 transition-colors flex items-center gap-1 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">새로고침</span>
            </button>
          </div>
          <p className="text-sm sm:text-base font-medium text-stone-800 mt-1 italic leading-relaxed">
            "{currentQuote}"
          </p>
        </div>
        <p className="text-xs text-sage-700/80 mt-3 font-medium">
          🌱 작은 감사가 모여 행복한 오늘을 만듭니다.
        </p>
      </div>
    </div>
  );
};
