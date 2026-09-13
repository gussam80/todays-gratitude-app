import * as XLSX from 'xlsx';
import { Student, GratitudeEntry, TeacherNote } from '../types';

export interface ExportRow {
  날짜: string;
  학년: number;
  반: number;
  번호: number;
  이름: string;
  '감사 1': string;
  '감사 2': string;
  '감사 3': string;
  'AI 격려 코멘트': string;
  '감사 키워드': string;
  '교사 메모'?: string;
}

export function exportGratitudeToExcel(
  entries: GratitudeEntry[],
  students: Student[],
  notes: TeacherNote[],
  yearMonth: string,
  grade: number,
  classNum: number,
  format: 'xlsx' | 'csv' = 'xlsx',
  includeTeacherNotes: boolean = false
) {
  const studentMap = new Map<string, Student>();
  students.forEach(s => studentMap.set(s.id, s));

  const noteMap = new Map<string, string>();
  notes.forEach(n => noteMap.set(`${n.studentId}_${n.date}`, n.note));

  const rows: ExportRow[] = entries.map(e => {
    const student = studentMap.get(e.studentId);
    const row: ExportRow = {
      날짜: e.date,
      학년: student ? student.grade : grade,
      반: student ? student.classNum : classNum,
      번호: student ? student.number : 0,
      이름: student ? student.name : '알수없음',
      '감사 1': e.gratitude1,
      '감사 2': e.gratitude2,
      '감사 3': e.gratitude3,
      'AI 격려 코멘트': e.aiComment || '',
      '감사 키워드': (e.keywords || []).join(', ')
    };

    if (includeTeacherNotes) {
      row['교사 메모'] = noteMap.get(`${e.studentId}_${e.date}`) || '';
    }

    return row;
  });

  // Sort by date desc, then number asc
  rows.sort((a, b) => {
    if (a.날짜 !== b.날짜) return b.날짜.localeCompare(a.날짜);
    return a.번호 - b.번호;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '오늘의감사일기');

  const fileName = `감사일기_${yearMonth}_${grade}학년${classNum}반.${format}`;
  XLSX.writeFile(workbook, fileName, { bookType: format });
}

export async function parseRosterFile(
  file: File,
  grade: number,
  classNum: number,
  year: number
): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const students: Student[] = [];

        for (let i = 0; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length === 0) continue;

          let num = 0;
          let name = '';

          // Look for number and name
          const col0 = String(row[0] || '').trim();
          const col1 = String(row[1] || '').trim();

          // Skip header rows like "번호", "이름"
          if (col0.includes('번호') || col1.includes('이름')) continue;

          const parsedNum = parseInt(col0, 10);
          if (!isNaN(parsedNum) && col1) {
            num = parsedNum;
            name = col1;
          } else if (!isNaN(parseInt(col1, 10)) && col0) {
            num = parseInt(col1, 10);
            name = col0;
          }

          if (num > 0 && name) {
            students.push({
              id: `${year}-${grade}-${classNum}-${num}`,
              grade,
              classNum,
              number: num,
              name,
              createdAt: new Date().toISOString()
            });
          }
        }

        // Sort by number asc
        students.sort((a, b) => a.number - b.number);
        resolve(students);
      } catch (err) {
        reject(new Error('파일을 읽는 중 오류가 발생했습니다. 형식(번호, 이름)을 확인해 주세요.'));
      }
    };

    reader.onerror = () => reject(new Error('파일 열기에 실패했습니다.'));
    reader.readAsArrayBuffer(file);
  });
}
