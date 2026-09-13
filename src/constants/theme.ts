import { KeywordCategory } from '../types';

export const GRATITUDE_CATEGORIES: KeywordCategory[] = [
  {
    id: 'friend',
    name: '친구',
    emoji: '💚',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    keywords: ['친구', '짝꿍', '같이', '놀았', '이야기', '도와줬', '빌려', '웃었', '함께']
  },
  {
    id: 'family',
    name: '가족',
    emoji: '💙',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    keywords: ['엄마', '아빠', '부모님', '동생', '형', '누나', '오빠', '할머니', '할아버지', '가족', '집']
  },
  {
    id: 'school',
    name: '학교·일상',
    emoji: '💛',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    keywords: ['학교', '교실', '쉬는시간', '점심시간', '급식', '체육', '음악', '운동장', '햇살', '날씨', '하늘']
  },
  {
    id: 'teacher',
    name: '선생님',
    emoji: '💜',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    keywords: ['선생님', '칭찬', '가르쳐', '말씀', '수업', '설명']
  },
  {
    id: 'learning',
    name: '배움·성장',
    emoji: '🧡',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    keywords: ['공부', '새로운', '배웠', '알게', '시험', '문제', '숙제', '책', '독서', '해냈', '연습']
  },
  {
    id: 'self',
    name: '나 자신',
    emoji: '🌱',
    color: 'bg-sage-100 text-sage-700 border-sage-300',
    keywords: ['스스로', '나', '참았', '끝까지', '노력', '운동', '일찍', '건강', '뿌듯']
  }
];

export const GRATITUDE_EXAMPLES = [
  "친구가 어려운 문제를 친절하게 가르쳐주었어요.",
  "선생님께서 발표를 잘했다고 칭찬해 주셨어요.",
  "오늘 점심 급식에 내가 좋아하는 스파게티가 나와서 맛있게 먹었어요.",
  "가족과 저녁 식사를 하며 재미있게 이야기를 나누었어요.",
  "체육 시간에 넘어진 친구를 일으켜 세워주며 보람을 느꼈어요.",
  "풀리지 않던 수학 문제를 포기하지 않고 끝까지 풀어냈어요."
];
