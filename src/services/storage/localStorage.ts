import { IStorageService } from './adapter';
import { Student, GratitudeEntry, TeacherNote, ClassConfig } from '../../types';
import { DEFAULT_CONFIG, SAMPLE_STUDENTS, SAMPLE_ENTRIES, SAMPLE_NOTES } from '../../constants/sampleData';

const KEYS = {
  STUDENTS: 'todays_gratitude_students',
  ENTRIES: 'todays_gratitude_entries',
  NOTES: 'todays_gratitude_notes',
  CONFIG: 'todays_gratitude_config',
  LAST_STUDENT: 'todays_gratitude_last_student_id'
};

export class LocalStorageService implements IStorageService {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    const CLEAN_KEY = 'todays_gratitude_cleaned_v3';
    if (!localStorage.getItem(CLEAN_KEY)) {
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify([]));
      localStorage.setItem(KEYS.ENTRIES, JSON.stringify([]));
      localStorage.setItem(KEYS.NOTES, JSON.stringify([]));
      localStorage.removeItem(KEYS.LAST_STUDENT);
      localStorage.setItem(CLEAN_KEY, 'true');
    }

    if (!localStorage.getItem(KEYS.CONFIG)) {
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem(KEYS.STUDENTS)) {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.ENTRIES)) {
      localStorage.setItem(KEYS.ENTRIES, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.NOTES)) {
      localStorage.setItem(KEYS.NOTES, JSON.stringify([]));
    }
  }

  // --- Students ---
  async getStudents(grade?: number, classNum?: number): Promise<Student[]> {
    const raw = localStorage.getItem(KEYS.STUDENTS);
    const students: Student[] = raw ? JSON.parse(raw) : [];
    return students.filter(s => {
      if (grade !== undefined && s.grade !== grade) return false;
      if (classNum !== undefined && s.classNum !== classNum) return false;
      return true;
    }).sort((a, b) => a.number - b.number);
  }

  async getStudent(id: string): Promise<Student | null> {
    const students = await this.getStudents();
    return students.find(s => s.id === id) || null;
  }

  async saveStudent(student: Student): Promise<void> {
    const students = await this.getStudents();
    const idx = students.findIndex(s => s.id === student.id);
    if (idx >= 0) {
      students[idx] = student;
    } else {
      students.push(student);
    }
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  }

  async saveStudentsBatch(newStudents: Student[]): Promise<void> {
    const existing = await this.getStudents();
    const map = new Map<string, Student>();
    existing.forEach(s => map.set(s.id, s));
    newStudents.forEach(s => map.set(s.id, s));
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(Array.from(map.values())));
  }

  async deleteStudent(id: string): Promise<void> {
    const students = await this.getStudents();
    const filtered = students.filter(s => s.id !== id);
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(filtered));
  }

  // --- Gratitude Entries ---
  async getGratitudeEntries(studentId?: string, date?: string): Promise<GratitudeEntry[]> {
    const raw = localStorage.getItem(KEYS.ENTRIES);
    const entries: GratitudeEntry[] = raw ? JSON.parse(raw) : [];
    return entries.filter(e => {
      if (studentId && e.studentId !== studentId) return false;
      if (date && e.date !== date) return false;
      return true;
    });
  }

  async getGratitudeEntriesByMonth(studentId: string, year: number, month: number): Promise<GratitudeEntry[]> {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const raw = localStorage.getItem(KEYS.ENTRIES);
    const entries: GratitudeEntry[] = raw ? JSON.parse(raw) : [];
    return entries.filter(e => e.studentId === studentId && e.date.startsWith(prefix));
  }

  async getGratitudeEntry(studentId: string, date: string): Promise<GratitudeEntry | null> {
    const entries = await this.getGratitudeEntries(studentId, date);
    return entries.length > 0 ? entries[0] : null;
  }

  async saveGratitudeEntry(entry: GratitudeEntry): Promise<void> {
    const raw = localStorage.getItem(KEYS.ENTRIES);
    const entries: GratitudeEntry[] = raw ? JSON.parse(raw) : [];
    const idx = entries.findIndex(e => e.studentId === entry.studentId && e.date === entry.date);

    if (idx >= 0) {
      // Updating existing entry
      const existing = entries[idx];
      entries[idx] = {
        ...entry,
        id: existing.id,
        firstModifiedAt: existing.firstModifiedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdAt: existing.createdAt
      };
    } else {
      // New entry
      entries.push({
        ...entry,
        id: `${entry.studentId}_${entry.date}`,
        createdAt: entry.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
  }

  // --- Teacher Notes ---
  async getTeacherNotes(studentId?: string, date?: string): Promise<TeacherNote[]> {
    const raw = localStorage.getItem(KEYS.NOTES);
    const notes: TeacherNote[] = raw ? JSON.parse(raw) : [];
    return notes.filter(n => {
      if (studentId && n.studentId !== studentId) return false;
      if (date && n.date !== date) return false;
      return true;
    });
  }

  async getTeacherNote(studentId: string, date: string): Promise<TeacherNote | null> {
    const notes = await this.getTeacherNotes(studentId, date);
    return notes.length > 0 ? notes[0] : null;
  }

  async saveTeacherNote(note: TeacherNote): Promise<void> {
    const raw = localStorage.getItem(KEYS.NOTES);
    const notes: TeacherNote[] = raw ? JSON.parse(raw) : [];
    const idx = notes.findIndex(n => n.studentId === note.studentId && n.date === note.date);

    if (idx >= 0) {
      notes[idx] = {
        ...note,
        updatedAt: new Date().toISOString()
      };
    } else {
      notes.push({
        ...note,
        id: `${note.studentId}_${note.date}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  }

  // --- Class Config ---
  async getClassConfig(): Promise<ClassConfig> {
    const raw = localStorage.getItem(KEYS.CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_CONFIG;
  }

  async saveClassConfig(config: ClassConfig): Promise<void> {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  }

  // --- Utility & Reset ---
  async resetAllData(): Promise<void> {
    localStorage.removeItem(KEYS.ENTRIES);
    localStorage.removeItem(KEYS.NOTES);
    localStorage.removeItem(KEYS.STUDENTS);
    localStorage.removeItem(KEYS.LAST_STUDENT);
    localStorage.removeItem(KEYS.CONFIG);
    this.ensureInitialized();
  }

  async resetEntriesAndNotes(): Promise<void> {
    localStorage.setItem(KEYS.ENTRIES, JSON.stringify([]));
    localStorage.setItem(KEYS.NOTES, JSON.stringify([]));
  }

  async populateSampleData(samples: { students: Student[]; entries: GratitudeEntry[]; notes: TeacherNote[] }): Promise<void> {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(samples.students));
    localStorage.setItem(KEYS.ENTRIES, JSON.stringify(samples.entries));
    localStorage.setItem(KEYS.NOTES, JSON.stringify(samples.notes));
  }
}
