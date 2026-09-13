import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { IStorageService } from './adapter';
import { Student, GratitudeEntry, TeacherNote, ClassConfig, FirebaseConfigData } from '../../types';
import { LocalStorageService } from './localStorage';

export class FirebaseStorageService implements IStorageService {
  private app: FirebaseApp;
  private db: Firestore;
  private fallback: LocalStorageService;
  private configData: FirebaseConfigData;

  constructor(config: FirebaseConfigData) {
    this.configData = config;
    this.fallback = new LocalStorageService();

    // Initialize or reuse existing Firebase app
    const appName = `gratitude_${config.projectId || 'app'}`;
    const existingApps = getApps();
    const matchedApp = existingApps.find(a => a.name === appName);
    
    if (matchedApp) {
      this.app = matchedApp;
    } else {
      this.app = initializeApp(config, appName);
    }
    this.db = getFirestore(this.app);
  }

  async testConnection(): Promise<boolean> {
    try {
      const colRef = collection(this.db, 'students');
      await getDocs(query(colRef, where('grade', '==', 1)));
      return true;
    } catch (err) {
      console.error('Firebase test connection error:', err);
      return false;
    }
  }

  // --- Students ---
  async getStudents(grade?: number, classNum?: number): Promise<Student[]> {
    try {
      const colRef = collection(this.db, 'students');
      const snapshot = await getDocs(colRef);
      const list: Student[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Student);
      });

      return list.filter(s => {
        if (grade !== undefined && s.grade !== grade) return false;
        if (classNum !== undefined && s.classNum !== classNum) return false;
        return true;
      }).sort((a, b) => a.number - b.number);
    } catch (err) {
      console.warn('Firebase getStudents fallback to local:', err);
      return this.fallback.getStudents(grade, classNum);
    }
  }

  async getStudent(id: string): Promise<Student | null> {
    try {
      const docRef = doc(this.db, 'students', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Student;
      }
      return null;
    } catch (err) {
      console.warn('Firebase getStudent fallback to local:', err);
      return this.fallback.getStudent(id);
    }
  }

  async saveStudent(student: Student): Promise<void> {
    try {
      const docRef = doc(this.db, 'students', student.id);
      await setDoc(docRef, student, { merge: true });
      await this.fallback.saveStudent(student);
    } catch (err) {
      console.warn('Firebase saveStudent fallback to local:', err);
      await this.fallback.saveStudent(student);
    }
  }

  async saveStudentsBatch(students: Student[]): Promise<void> {
    try {
      const batch = writeBatch(this.db);
      for (const student of students) {
        const docRef = doc(this.db, 'students', student.id);
        batch.set(docRef, student, { merge: true });
      }
      await batch.commit();
      await this.fallback.saveStudentsBatch(students);
    } catch (err) {
      console.warn('Firebase saveStudentsBatch fallback to local:', err);
      await this.fallback.saveStudentsBatch(students);
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, 'students', id);
      await deleteDoc(docRef);
      await this.fallback.deleteStudent(id);
    } catch (err) {
      console.warn('Firebase deleteStudent fallback to local:', err);
      await this.fallback.deleteStudent(id);
    }
  }

  // --- Gratitude Entries ---
  async getGratitudeEntries(studentId?: string, date?: string): Promise<GratitudeEntry[]> {
    try {
      const colRef = collection(this.db, 'gratitude_entries');
      let q = query(colRef);
      if (studentId) {
        q = query(q, where('studentId', '==', studentId));
      }
      if (date) {
        q = query(q, where('date', '==', date));
      }

      const snapshot = await getDocs(q);
      const entries: GratitudeEntry[] = [];
      snapshot.forEach(docSnap => {
        entries.push(docSnap.data() as GratitudeEntry);
      });
      return entries;
    } catch (err) {
      console.warn('Firebase getGratitudeEntries fallback to local:', err);
      return this.fallback.getGratitudeEntries(studentId, date);
    }
  }

  async getGratitudeEntriesByMonth(studentId: string, year: number, month: number): Promise<GratitudeEntry[]> {
    try {
      const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
      const allForStudent = await this.getGratitudeEntries(studentId);
      return allForStudent.filter(e => e.date.startsWith(monthPrefix));
    } catch (err) {
      console.warn('Firebase getGratitudeEntriesByMonth fallback to local:', err);
      return this.fallback.getGratitudeEntriesByMonth(studentId, year, month);
    }
  }

  async getGratitudeEntry(studentId: string, date: string): Promise<GratitudeEntry | null> {
    try {
      const id = `${studentId}_${date}`;
      const docRef = doc(this.db, 'gratitude_entries', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as GratitudeEntry;
      }
      return null;
    } catch (err) {
      console.warn('Firebase getGratitudeEntry fallback to local:', err);
      return this.fallback.getGratitudeEntry(studentId, date);
    }
  }

  async saveGratitudeEntry(entry: GratitudeEntry): Promise<void> {
    try {
      const docRef = doc(this.db, 'gratitude_entries', entry.id);
      await setDoc(docRef, entry, { merge: true });
      await this.fallback.saveGratitudeEntry(entry);
    } catch (err) {
      console.warn('Firebase saveGratitudeEntry fallback to local:', err);
      await this.fallback.saveGratitudeEntry(entry);
    }
  }

  // --- Teacher Notes ---
  async getTeacherNotes(studentId?: string, date?: string): Promise<TeacherNote[]> {
    try {
      const colRef = collection(this.db, 'teacher_notes');
      let q = query(colRef);
      if (studentId) {
        q = query(q, where('studentId', '==', studentId));
      }
      if (date) {
        q = query(q, where('date', '==', date));
      }
      const snapshot = await getDocs(q);
      const notes: TeacherNote[] = [];
      snapshot.forEach(docSnap => {
        notes.push(docSnap.data() as TeacherNote);
      });
      return notes;
    } catch (err) {
      console.warn('Firebase getTeacherNotes fallback to local:', err);
      return this.fallback.getTeacherNotes(studentId, date);
    }
  }

  async getTeacherNote(studentId: string, date: string): Promise<TeacherNote | null> {
    try {
      const id = `${studentId}_${date}`;
      const docRef = doc(this.db, 'teacher_notes', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as TeacherNote;
      }
      return null;
    } catch (err) {
      console.warn('Firebase getTeacherNote fallback to local:', err);
      return this.fallback.getTeacherNote(studentId, date);
    }
  }

  async saveTeacherNote(note: TeacherNote): Promise<void> {
    try {
      const docRef = doc(this.db, 'teacher_notes', note.id);
      await setDoc(docRef, note, { merge: true });
      await this.fallback.saveTeacherNote(note);
    } catch (err) {
      console.warn('Firebase saveTeacherNote fallback to local:', err);
      await this.fallback.saveTeacherNote(note);
    }
  }

  // --- Config ---
  async getClassConfig(): Promise<ClassConfig> {
    try {
      const docRef = doc(this.db, 'config', 'class_config');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as ClassConfig;
      }
      return this.fallback.getClassConfig();
    } catch (err) {
      console.warn('Firebase getClassConfig fallback to local:', err);
      return this.fallback.getClassConfig();
    }
  }

  async saveClassConfig(config: ClassConfig): Promise<void> {
    try {
      const docRef = doc(this.db, 'config', 'class_config');
      await setDoc(docRef, config, { merge: true });
      await this.fallback.saveClassConfig(config);
    } catch (err) {
      console.warn('Firebase saveClassConfig fallback to local:', err);
      await this.fallback.saveClassConfig(config);
    }
  }

  // --- Reset & Sample ---
  async resetAllData(): Promise<void> {
    try {
      // 1. Delete students
      const studentsSnap = await getDocs(collection(this.db, 'students'));
      const batch1 = writeBatch(this.db);
      studentsSnap.forEach(d => batch1.delete(d.ref));
      await batch1.commit();

      // 2. Delete entries
      const entriesSnap = await getDocs(collection(this.db, 'gratitude_entries'));
      const batch2 = writeBatch(this.db);
      entriesSnap.forEach(d => batch2.delete(d.ref));
      await batch2.commit();

      // 3. Delete notes
      const notesSnap = await getDocs(collection(this.db, 'teacher_notes'));
      const batch3 = writeBatch(this.db);
      notesSnap.forEach(d => batch3.delete(d.ref));
      await batch3.commit();

      await this.fallback.resetAllData();
    } catch (err) {
      console.warn('Firebase resetAllData fallback to local:', err);
      await this.fallback.resetAllData();
    }
  }

  async resetEntriesAndNotes(): Promise<void> {
    try {
      // Delete entries
      const entriesSnap = await getDocs(collection(this.db, 'gratitude_entries'));
      const batch1 = writeBatch(this.db);
      entriesSnap.forEach(d => batch1.delete(d.ref));
      await batch1.commit();

      // Delete notes
      const notesSnap = await getDocs(collection(this.db, 'teacher_notes'));
      const batch2 = writeBatch(this.db);
      notesSnap.forEach(d => batch2.delete(d.ref));
      await batch2.commit();

      await this.fallback.resetEntriesAndNotes();
    } catch (err) {
      console.warn('Firebase resetEntriesAndNotes fallback to local:', err);
      await this.fallback.resetEntriesAndNotes();
    }
  }

  async populateSampleData(samples: { students: Student[]; entries: GratitudeEntry[]; notes: TeacherNote[] }): Promise<void> {
    await this.saveStudentsBatch(samples.students);
    for (const e of samples.entries) {
      await this.saveGratitudeEntry(e);
    }
    for (const n of samples.notes) {
      await this.saveTeacherNote(n);
    }
    await this.fallback.populateSampleData(samples);
  }

  static getFirestoreRules(): string {
    return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
  }
}
