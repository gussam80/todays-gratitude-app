import { IStorageService } from './adapter';
import { Student, GratitudeEntry, TeacherNote, ClassConfig } from '../../types';
import { LocalStorageService } from './localStorage';

export class SupabaseStorageService implements IStorageService {
  private url: string;
  private key: string;
  private fallback: LocalStorageService;

  constructor(url: string, key: string) {
    this.url = url.replace(/\/$/, '');
    this.key = key;
    this.fallback = new LocalStorageService();
  }

  private getHeaders() {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.url}/rest/v1/students?select=id&limit=1`, {
        headers: this.getHeaders()
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Schema creation helper for teachers
  static getDdlSql(): string {
    return `-- 「오늘의 감사일기」 Supabase 테이블 생성 쿼리
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  grade INT NOT NULL,
  class_num INT NOT NULL,
  number INT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gratitude_entries (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  gratitude1 TEXT NOT NULL,
  gratitude2 TEXT NOT NULL,
  gratitude3 TEXT NOT NULL,
  ai_comment TEXT,
  keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  first_modified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_date UNIQUE (student_id, date)
);

CREATE TABLE IF NOT EXISTS teacher_notes (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_note_student_date UNIQUE (student_id, date)
);`;
  }

  // Implementation delegates to fallback if API error occurs
  async getStudents(grade?: number, classNum?: number): Promise<Student[]> {
    try {
      let query = `${this.url}/rest/v1/students?select=*&order=number.asc`;
      if (grade !== undefined) query += `&grade=eq.${grade}`;
      if (classNum !== undefined) query += `&class_num=eq.${classNum}`;

      const res = await fetch(query, { headers: this.getHeaders() });
      if (!res.ok) throw new Error('Supabase fetch failed');
      const data = await res.json();
      return data.map((d: any) => ({
        id: d.id,
        grade: d.grade,
        classNum: d.class_num,
        number: d.number,
        name: d.name,
        createdAt: d.created_at
      }));
    } catch (err) {
      console.warn('Supabase getStudents failed, using local storage:', err);
      return this.fallback.getStudents(grade, classNum);
    }
  }

  async getStudent(id: string): Promise<Student | null> {
    try {
      const res = await fetch(`${this.url}/rest/v1/students?id=eq.${encodeURIComponent(id)}&select=*`, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error('Supabase fetch failed');
      const data = await res.json();
      if (data.length === 0) return null;
      const d = data[0];
      return {
        id: d.id,
        grade: d.grade,
        classNum: d.class_num,
        number: d.number,
        name: d.name,
        createdAt: d.created_at
      };
    } catch {
      return this.fallback.getStudent(id);
    }
  }

  async saveStudent(student: Student): Promise<void> {
    try {
      const payload = {
        id: student.id,
        grade: student.grade,
        class_num: student.classNum,
        number: student.number,
        name: student.name,
        created_at: student.createdAt
      };
      await fetch(`${this.url}/rest/v1/students`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(payload)
      });
    } catch {
      // Fallback
    }
    await this.fallback.saveStudent(student);
  }

  async saveStudentsBatch(students: Student[]): Promise<void> {
    try {
      const payloads = students.map(s => ({
        id: s.id,
        grade: s.grade,
        class_num: s.classNum,
        number: s.number,
        name: s.name,
        created_at: s.createdAt
      }));
      await fetch(`${this.url}/rest/v1/students`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(payloads)
      });
    } catch {
      // Fallback
    }
    await this.fallback.saveStudentsBatch(students);
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      await fetch(`${this.url}/rest/v1/students?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch {}
    await this.fallback.deleteStudent(id);
  }

  async getGratitudeEntries(studentId?: string, date?: string): Promise<GratitudeEntry[]> {
    try {
      let query = `${this.url}/rest/v1/gratitude_entries?select=*`;
      if (studentId) query += `&student_id=eq.${encodeURIComponent(studentId)}`;
      if (date) query += `&date=eq.${encodeURIComponent(date)}`;

      const res = await fetch(query, { headers: this.getHeaders() });
      if (!res.ok) throw new Error('Supabase fetch failed');
      const data = await res.json();
      return data.map((d: any) => ({
        id: d.id,
        studentId: d.student_id,
        date: d.date,
        gratitude1: d.gratitude1,
        gratitude2: d.gratitude2,
        gratitude3: d.gratitude3,
        aiComment: d.ai_comment,
        keywords: d.keywords,
        createdAt: d.created_at,
        firstModifiedAt: d.first_modified_at,
        updatedAt: d.updated_at
      }));
    } catch {
      return this.fallback.getGratitudeEntries(studentId, date);
    }
  }

  async getGratitudeEntriesByMonth(studentId: string, year: number, month: number): Promise<GratitudeEntry[]> {
    return this.fallback.getGratitudeEntriesByMonth(studentId, year, month);
  }

  async getGratitudeEntry(studentId: string, date: string): Promise<GratitudeEntry | null> {
    const list = await this.getGratitudeEntries(studentId, date);
    return list.length > 0 ? list[0] : null;
  }

  async saveGratitudeEntry(entry: GratitudeEntry): Promise<void> {
    try {
      const payload = {
        id: entry.id,
        student_id: entry.studentId,
        date: entry.date,
        gratitude1: entry.gratitude1,
        gratitude2: entry.gratitude2,
        gratitude3: entry.gratitude3,
        ai_comment: entry.aiComment,
        keywords: entry.keywords,
        created_at: entry.createdAt,
        first_modified_at: entry.firstModifiedAt,
        updated_at: entry.updatedAt
      };
      await fetch(`${this.url}/rest/v1/gratitude_entries`, {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(payload)
      });
    } catch {}
    await this.fallback.saveGratitudeEntry(entry);
  }

  async getTeacherNotes(studentId?: string, date?: string): Promise<TeacherNote[]> {
    return this.fallback.getTeacherNotes(studentId, date);
  }

  async getTeacherNote(studentId: string, date: string): Promise<TeacherNote | null> {
    return this.fallback.getTeacherNote(studentId, date);
  }

  async saveTeacherNote(note: TeacherNote): Promise<void> {
    return this.fallback.saveTeacherNote(note);
  }

  async getClassConfig(): Promise<ClassConfig> {
    return this.fallback.getClassConfig();
  }

  async saveClassConfig(config: ClassConfig): Promise<void> {
    return this.fallback.saveClassConfig(config);
  }

  async resetAllData(): Promise<void> {
    return this.fallback.resetAllData();
  }

  async resetEntriesAndNotes(): Promise<void> {
    return this.fallback.resetEntriesAndNotes();
  }

  async populateSampleData(samples: { students: Student[]; entries: GratitudeEntry[]; notes: TeacherNote[] }): Promise<void> {
    return this.fallback.populateSampleData(samples);
  }
}
