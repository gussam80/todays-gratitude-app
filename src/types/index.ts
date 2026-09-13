export interface Student {
  id: string; // e.g. "2026-1-2-15"
  grade: number; // 1, 2, 3
  classNum: number; // 1, 2
  number: number; // 1 ~ 25
  name: string;
  createdAt: string;
}

export interface GratitudeEntry {
  id: string; // composite key: `${studentId}_${date}`
  studentId: string;
  date: string; // "YYYY-MM-DD"
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
  aiComment?: string;
  keywords?: string[]; // e.g. ["친구", "배움", "가족"]
  createdAt: string;
  firstModifiedAt?: string;
  updatedAt: string;
}

export interface TeacherNote {
  id: string; // composite key: `${studentId}_${date}`
  studentId: string;
  date: string; // "YYYY-MM-DD"
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseConfigData {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export interface ClassConfig {
  year: number;
  grade: number;
  classNum: number;
  totalStudents: number;
  teacherPin: string; // 기본 PIN "1234"
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  useSupabase?: boolean;
  useFirebase?: boolean;
  firebaseConfig?: FirebaseConfigData;
  aiProvider?: 'mock' | 'openai' | 'gemini';
  aiApiKey?: string;
}

export interface DailyQuestion {
  id: number;
  question: string;
  theme: string;
}

export interface StudentStats {
  monthCount: number;      // 이번 달 작성일 수
  totalGratitudes: number; // 작성한 감사 총 개수 (작성일 * 3)
  consecutiveDays: number; // 연속 작성 일수
}

export interface ClassStats {
  totalStudents: number;
  completedToday: number;
  pendingToday: number;
  rateToday: number;       // 백분율 (0~100)
  monthAvgDays: number;    // 이번 달 학생 평균 작성일
}

export interface KeywordCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  keywords: string[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}
