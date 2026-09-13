import { Student, GratitudeEntry, TeacherNote, ClassConfig } from '../types';

export const DEFAULT_CONFIG: ClassConfig = {
  year: 2026,
  grade: 1,
  classNum: 1,
  totalStudents: 24,
  teacherPin: '1234',
  useFirebase: true,
  firebaseConfig: {
    apiKey: "AIzaSyB_ukQBHj2j6D8UkZ-xM6bNzCUPHF67mcw",
    authDomain: "todays-gratitude.firebaseapp.com",
    projectId: "todays-gratitude",
    storageBucket: "todays-gratitude.firebasestorage.app",
    messagingSenderId: "660452555346",
    appId: "1:660452555346:web:1f2f1bee4f570dcc3afd8b"
  },
  useSupabase: false,
  aiProvider: 'mock'
};

export const SAMPLE_STUDENTS: Student[] = [
  { id: '2026-1-2-1', grade: 1, classNum: 2, number: 1, name: '김민지', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-2', grade: 1, classNum: 2, number: 2, name: '이서연', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-3', grade: 1, classNum: 2, number: 3, name: '박지우', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-4', grade: 1, classNum: 2, number: 4, name: '최도윤', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-5', grade: 1, classNum: 2, number: 5, name: '정하은', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-6', grade: 1, classNum: 2, number: 6, name: '강민준', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-7', grade: 1, classNum: 2, number: 7, name: '조예준', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-8', grade: 1, classNum: 2, number: 8, name: '윤서아', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-9', grade: 1, classNum: 2, number: 9, name: '장은우', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-10', grade: 1, classNum: 2, number: 10, name: '임시우', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-11', grade: 1, classNum: 2, number: 11, name: '한유진', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-12', grade: 1, classNum: 2, number: 12, name: '오지호', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-13', grade: 1, classNum: 2, number: 13, name: '신채원', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-14', grade: 1, classNum: 2, number: 14, name: '권태양', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-15', grade: 1, classNum: 2, number: 15, name: '황수아', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-16', grade: 1, classNum: 2, number: 16, name: '송현우', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-17', grade: 1, classNum: 2, number: 17, name: '전지민', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-18', grade: 1, classNum: 2, number: 18, name: '홍서진', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-19', grade: 1, classNum: 2, number: 19, name: '유하린', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-20', grade: 1, classNum: 2, number: 20, name: '고은호', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-21', grade: 1, classNum: 2, number: 21, name: '문다은', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-22', grade: 1, classNum: 2, number: 22, name: '양준서', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-23', grade: 1, classNum: 2, number: 23, name: '손나은', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-24', grade: 1, classNum: 2, number: 24, name: '배성현', createdAt: '2026-09-01T08:00:00Z' },
  { id: '2026-1-2-25', grade: 1, classNum: 2, number: 25, name: '백예린', createdAt: '2026-09-01T08:00:00Z' },
];

export const SAMPLE_ENTRIES: GratitudeEntry[] = [
  {
    id: '2026-1-2-1_2026-09-13',
    studentId: '2026-1-2-1',
    date: '2026-09-13',
    gratitude1: '짝꿍 민준이가 수학 문제를 친절하게 설명해줘서 고마웠다.',
    gratitude2: '점심 급식에 나온 돈가스가 바삭하고 정말 맛있었다.',
    gratitude3: '방과 후에 도서관에서 읽고 싶었던 책을 빌릴 수 있어서 기뻤다.',
    aiComment: '함께 공부해 준 친구의 마음을 소중하게 생각하고 있군요. 서로 도와주는 관계가 참 따뜻하게 느껴져요! 💚',
    keywords: ['친구', '학교·일상', '배움·성장'],
    createdAt: '2026-09-13T09:10:00Z',
    updatedAt: '2026-09-13T09:10:00Z'
  },
  {
    id: '2026-1-2-2_2026-09-13',
    studentId: '2026-1-2-2',
    date: '2026-09-13',
    gratitude1: '체육 시간에 피구 경기에서 끝까지 집중해서 수비를 해냈다.',
    gratitude2: '선생님께서 오늘 발표 태도가 정말 좋았다고 칭찬해 주셨다.',
    gratitude3: '집에 오는 길에 하늘 구름이 솜사탕처럼 맑고 예뻤다.',
    aiComment: '선생님의 따뜻한 칭찬과 스스로 해낸 순간들이 오늘을 환하게 밝혔네요. 오늘의 뿌듯함을 오래 기억해 보세요! 💜',
    keywords: ['선생님', '나 자신', '학교·일상'],
    createdAt: '2026-09-13T09:15:00Z',
    updatedAt: '2026-09-13T09:15:00Z'
  },
  {
    id: '2026-1-2-4_2026-09-13',
    studentId: '2026-1-2-4',
    date: '2026-09-13',
    gratitude1: '아침에 비가 올 뻔했는데 다행히 맑아서 친구들과 축구를 했다.',
    gratitude2: '어려웠던 영어 단어 10개를 혼자 다 외워서 시험을 잘 봤다.',
    gratitude3: '엄마가 아침에 따뜻한 미역국을 끓여주셔서 든든했다.',
    aiComment: '노력해서 스스로 목표를 이뤄낸 성취감이 돋보여요. 가족의 사랑도 깊이 느끼며 든든한 하루를 보냈군요! 💙',
    keywords: ['가족', '배움·성장', '친구'],
    createdAt: '2026-09-13T09:20:00Z',
    updatedAt: '2026-09-13T09:20:00Z'
  },
  {
    id: '2026-1-2-5_2026-09-13',
    studentId: '2026-1-2-5',
    date: '2026-09-13',
    gratitude1: '미술 시간에 그린 그림을 친구들이 멋지다고 해줬다.',
    gratitude2: '동생이 숙제하는 것을 도와주었더니 고맙다고 안아줬다.',
    gratitude3: '선생님 말씀대로 청소를 깨끗이 해서 교실이 반짝거렸다.',
    aiComment: '동생을 보살펴주는 다정함과 친구들의 따뜻한 반응이 가득한 하루네요. 베푼 친절이 더 큰 기쁨으로 돌아왔어요! 🌿',
    keywords: ['가족', '친구', '선생님'],
    createdAt: '2026-09-13T09:25:00Z',
    updatedAt: '2026-09-13T09:25:00Z'
  },
  {
    id: '2026-1-2-15_2026-09-13',
    studentId: '2026-1-2-15',
    date: '2026-09-13',
    gratitude1: '친구가 시험 공부를 같이 해줘서 고마웠다.',
    gratitude2: '가족과 저녁을 맛있게 먹어서 좋았다.',
    gratitude3: '오늘 과학 시간에 새로운 별자리를 배워서 신기했다.',
    aiComment: '일상 속에서 고마운 순간을 세심하게 발견하고 있네요. 오늘의 감사한 마음을 내일도 이어가 보세요. 🌱',
    keywords: ['친구', '가족', '배움·성장'],
    createdAt: '2026-09-13T09:30:00Z',
    updatedAt: '2026-09-13T09:30:00Z'
  }
];

export const SAMPLE_NOTES: TeacherNote[] = [
  {
    id: '2026-1-2-1_2026-09-13',
    studentId: '2026-1-2-1',
    date: '2026-09-13',
    note: '수학 시간에 짝꿍과 상호 협력하는 모습이 보기 좋았음. 지속 관찰 격려 필요.',
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T10:00:00Z'
  },
  {
    id: '2026-1-2-3_2026-09-13',
    studentId: '2026-1-2-3',
    date: '2026-09-13',
    note: '오늘 컨디션이 조금 피곤해 보임. 오후 상담 시 가볍게 안부 확인하기.',
    createdAt: '2026-09-13T10:05:00Z',
    updatedAt: '2026-09-13T10:05:00Z'
  }
];
