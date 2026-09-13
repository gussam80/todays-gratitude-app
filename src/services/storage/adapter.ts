import { Student, GratitudeEntry, TeacherNote, ClassConfig } from '../../types';

export interface IStorageService {
  // Students
  getStudents(grade?: number, classNum?: number): Promise<Student[]>;
  getStudent(id: string): Promise<Student | null>;
  saveStudent(student: Student): Promise<void>;
  saveStudentsBatch(students: Student[]): Promise<void>;
  deleteStudent(id: string): Promise<void>;

  // Gratitude Entries
  getGratitudeEntries(studentId?: string, date?: string): Promise<GratitudeEntry[]>;
  getGratitudeEntriesByMonth(studentId: string, year: number, month: number): Promise<GratitudeEntry[]>;
  getGratitudeEntry(studentId: string, date: string): Promise<GratitudeEntry | null>;
  saveGratitudeEntry(entry: GratitudeEntry): Promise<void>;

  // Teacher Notes
  getTeacherNotes(studentId?: string, date?: string): Promise<TeacherNote[]>;
  getTeacherNote(studentId: string, date: string): Promise<TeacherNote | null>;
  saveTeacherNote(note: TeacherNote): Promise<void>;

  // Config
  getClassConfig(): Promise<ClassConfig>;
  saveClassConfig(config: ClassConfig): Promise<void>;

  // Utility
  resetAllData(): Promise<void>;
  resetEntriesAndNotes(): Promise<void>;
  populateSampleData(samples: { students: Student[]; entries: GratitudeEntry[]; notes: TeacherNote[] }): Promise<void>;
}
