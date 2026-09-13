import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Student } from '../../types';
import { parseRosterFile } from '../../services/excelService';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface RosterUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: number;
  classNum: number;
  year: number;
  onUploadSuccess: (students: Student[]) => Promise<void>;
}

export const RosterUploadModal: React.FC<RosterUploadModalProps> = ({
  isOpen,
  onClose,
  grade,
  classNum,
  year,
  onUploadSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const list = await parseRosterFile(selectedFile, grade, classNum, year);
      if (list.length === 0) {
        setError('파일에서 학생 정보를 찾을 수 없습니다. 번호와 이름 열이 있는지 확인해 주세요.');
      } else {
        setParsedStudents(list);
      }
    } catch (err: any) {
      setError(err.message || '파일 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = async () => {
    if (parsedStudents.length === 0) return;
    setIsProcessing(true);
    try {
      await onUploadSuccess(parsedStudents);
      onClose();
    } catch {
      setError('학생 명단 저장에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      ['번호', '이름'],
      [1, '김민지'],
      [2, '이서연'],
      [3, '박지우'],
      [4, '최도윤'],
      [5, '정하은']
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '학생명단');
    XLSX.writeFile(wb, `학생명단_양식_${grade}학년${classNum}반.xlsx`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span>학생 명단 엑셀/CSV 일괄 등록</span>
        </div>
      }
      subtitle={`${grade}학년 ${classNum}반 (${year}학년도) 학생 목록 일괄 업로드`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Template download link */}
        <div className="flex items-center justify-between p-3 bg-cream-50 rounded-2xl border border-stone-100 text-xs">
          <span className="text-stone-600">
            엑셀 양식이 필요하신가요? 기본 양식을 다운로드해 보세요.
          </span>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1 font-bold text-sage-700 hover:text-sage-800 bg-sage-100 px-2.5 py-1.5 rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>양식 다운로드</span>
          </button>
        </div>

        {/* File drop / select */}
        <div className="border-2 border-dashed border-stone-200 hover:border-sage-400 rounded-3xl p-6 text-center transition bg-cream-50/40">
          <input
            type="file"
            id="roster-file-upload"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="roster-file-upload" className="cursor-pointer block">
            <Upload className="w-8 h-8 text-sage-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-800">
              {file ? file.name : '엑셀 또는 CSV 파일을 선택해 주세요'}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              지원 형식: .xlsx, .xls, .csv (열: 번호, 이름)
            </p>
          </label>
        </div>

        {/* Errors */}
        {error && (
          <div className="p-3 bg-coral-50 border border-coral-200 rounded-xl text-xs text-coral-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Preview of Parsed Students */}
        {parsedStudents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700">
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                {parsedStudents.length}명의 학생이 인식되었습니다
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto border border-stone-200 rounded-2xl p-2.5 bg-stone-50 text-xs grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {parsedStudents.map((s) => (
                <div key={s.id} className="bg-white p-1.5 rounded-lg border border-stone-100 flex items-center gap-1.5">
                  <span className="font-bold text-stone-500">{s.number}번</span>
                  <span className="font-semibold text-stone-800">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button variant="outline" size="md" onClick={onClose} disabled={isProcessing}>
            취소
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleApply}
            disabled={parsedStudents.length === 0 || isProcessing}
          >
            {isProcessing ? '등록 중...' : `${parsedStudents.length}명 일괄 적용하기`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
