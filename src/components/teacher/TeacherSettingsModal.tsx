import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ClassConfig, Student, GratitudeEntry, TeacherNote } from '../../types';
import { SupabaseStorageService } from '../../services/storage/supabase';
import { FirebaseStorageService } from '../../services/storage/firebase';
import { SAMPLE_STUDENTS, SAMPLE_ENTRIES, SAMPLE_NOTES } from '../../constants/sampleData';
import { Settings, KeyRound, Database, Sparkles, RefreshCw, Trash2, Copy, Check, Globe, Flame, Rocket } from 'lucide-react';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ClassConfig;
  onSaveConfig: (newConfig: ClassConfig) => Promise<void>;
  onResetData: () => Promise<void>;
  onPopulateSampleData: (sample: { students: Student[]; entries: GratitudeEntry[]; notes: TeacherNote[] }) => Promise<void>;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetData,
  onPopulateSampleData
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'firebase' | 'cloud' | 'data'>('general');
  const [pin, setPin] = useState(config.teacherPin || '1234');
  const [year, setYear] = useState(config.year || 2026);
  const [grade, setGrade] = useState(config.grade || 1);
  const [classNum, setClassNum] = useState(config.classNum || 2);
  const [totalStudents, setTotalStudents] = useState(config.totalStudents || 25);

  // AI settings
  const [aiProvider, setAiProvider] = useState<'mock' | 'openai' | 'gemini'>(config.aiProvider || 'mock');
  const [aiApiKey, setAiApiKey] = useState(config.aiApiKey || '');

  // Firebase settings
  const [useFirebase, setUseFirebase] = useState(config.useFirebase || false);
  const [firebaseApiKey, setFirebaseApiKey] = useState(config.firebaseConfig?.apiKey || '');
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState(config.firebaseConfig?.authDomain || '');
  const [firebaseProjectId, setFirebaseProjectId] = useState(config.firebaseConfig?.projectId || '');
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useState(config.firebaseConfig?.storageBucket || '');
  const [firebaseMessagingSenderId, setFirebaseMessagingSenderId] = useState(config.firebaseConfig?.messagingSenderId || '');
  const [firebaseAppId, setFirebaseAppId] = useState(config.firebaseConfig?.appId || '');
  const [firebaseRawSnippet, setFirebaseRawSnippet] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  // Supabase settings
  const [useSupabase, setUseSupabase] = useState(config.useSupabase || false);
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.supabaseAnonKey || '');

  const [copiedSql, setCopiedSql] = useState(false);
  const [message, setMessage] = useState('');

  const handleParseSnippet = () => {
    try {
      const text = firebaseRawSnippet;
      const apiKeyMatch = text.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = text.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = text.match(/projectId:\s*["']([^"']+)["']/);
      const storageBucketMatch = text.match(/storageBucket:\s*["']([^"']+)["']/);
      const messagingSenderIdMatch = text.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appIdMatch = text.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch) setFirebaseApiKey(apiKeyMatch[1]);
      if (authDomainMatch) setFirebaseAuthDomain(authDomainMatch[1]);
      if (projectIdMatch) setFirebaseProjectId(projectIdMatch[1]);
      if (storageBucketMatch) setFirebaseStorageBucket(storageBucketMatch[1]);
      if (messagingSenderIdMatch) setFirebaseMessagingSenderId(messagingSenderIdMatch[1]);
      if (appIdMatch) setFirebaseAppId(appIdMatch[1]);

      if (projectIdMatch || apiKeyMatch) {
        setUseFirebase(true);
        alert('Firebase 설정이 성공적으로 파싱되어 적용되었습니다! 🌱');
      } else {
        const parsed = JSON.parse(text);
        if (parsed.apiKey) setFirebaseApiKey(parsed.apiKey);
        if (parsed.projectId) setFirebaseProjectId(parsed.projectId);
        if (parsed.appId) setFirebaseAppId(parsed.appId);
        if (parsed.authDomain) setFirebaseAuthDomain(parsed.authDomain);
        setUseFirebase(true);
        alert('Firebase JSON 설정이 성공적으로 적용되었습니다! 🌱');
      }
    } catch {
      alert('설정 코드를 파싱할 수 없습니다. 직접 입력란에 입력해 주세요.');
    }
  };

  const handleSave = async () => {
    const newConfig: ClassConfig = {
      ...config,
      teacherPin: pin.trim() || '1234',
      year,
      grade,
      classNum,
      totalStudents,
      aiProvider,
      aiApiKey: aiApiKey.trim(),
      useFirebase,
      firebaseConfig: {
        apiKey: firebaseApiKey.trim(),
        authDomain: firebaseAuthDomain.trim() || (firebaseProjectId ? `${firebaseProjectId.trim()}.firebaseapp.com` : ''),
        projectId: firebaseProjectId.trim(),
        storageBucket: firebaseStorageBucket.trim() || (firebaseProjectId ? `${firebaseProjectId.trim()}.appspot.com` : ''),
        messagingSenderId: firebaseMessagingSenderId.trim(),
        appId: firebaseAppId.trim()
      },
      useSupabase,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim()
    };

    await onSaveConfig(newConfig);
    setMessage('설정이 안전하게 저장되었습니다! 🌱');
    setTimeout(() => {
      setMessage('');
      onClose();
    }, 1200);
  };

  const handleCopyFirestoreRules = () => {
    navigator.clipboard.writeText(FirebaseStorageService.getFirestoreRules());
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SupabaseStorageService.getDdlSql());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handlePopulate = async () => {
    if (window.confirm('샘플 학생 25명과 풍부한 감사일기 데이터를 채우시겠습니까?')) {
      await onPopulateSampleData({
        students: SAMPLE_STUDENTS,
        entries: SAMPLE_ENTRIES,
        notes: SAMPLE_NOTES
      });
      alert('샘플 데이터가 채워졌습니다! 🌱');
      onClose();
    }
  };

  const handleReset = async () => {
    if (window.confirm('정말 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      await onResetData();
      alert('모든 데이터가 초기화되었습니다.');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-stone-700" />
          <span>교사용 관리 설정</span>
        </div>
      }
      subtitle="학급 정보, 비밀번호, AI 및 클라우드 연동을 관리합니다."
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl text-xs font-semibold text-stone-600">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'general' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            기본 / 학급 정보
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'ai' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            AI 코멘트
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'firebase' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            🔥 Firebase 배포 & 클라우드
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'cloud' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            기타(Supabase)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'data' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            데이터 관리
          </button>
        </div>

        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                교사 인증 비밀번호 (PIN)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="새 비밀번호 입력"
                  className="w-full bg-cream-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-800 focus:ring-2 focus:ring-sage-400"
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                대시보드 진입 시 입력하는 교사 전용 비밀번호입니다.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  학년도
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-cream-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  기본 학년
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full bg-cream-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium text-stone-800"
                >
                  <option value={1}>1학년</option>
                  <option value={2}>2학년</option>
                  <option value={3}>3학년</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  기본 반
                </label>
                <select
                  value={classNum}
                  onChange={(e) => setClassNum(Number(e.target.value))}
                  className="w-full bg-cream-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium text-stone-800"
                >
                  <option value={1}>1반</option>
                  <option value={2}>2반</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  학급 정원
                </label>
                <input
                  type="number"
                  value={totalStudents}
                  onChange={(e) => setTotalStudents(Number(e.target.value))}
                  className="w-full bg-cream-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium text-stone-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                AI 격려 코멘트 제공 방식
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAiProvider('mock')}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-left transition ${
                    aiProvider === 'mock'
                      ? 'border-sage-500 bg-sage-50 text-sage-900'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                    <span>내장 규칙 AI (권장)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-normal">
                    100% 오프라인 동작, API 키 필요 없음
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAiProvider('openai')}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-left transition ${
                    aiProvider === 'openai'
                      ? 'border-sage-500 bg-sage-50 text-sage-900'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="font-bold mb-1">OpenAI (GPT-4o)</div>
                  <p className="text-[11px] text-stone-500 font-normal">
                    OpenAI API 키 사용
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAiProvider('gemini')}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-left transition ${
                    aiProvider === 'gemini'
                      ? 'border-sage-500 bg-sage-50 text-sage-900'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="font-bold mb-1">Google Gemini</div>
                  <p className="text-[11px] text-stone-500 font-normal">
                    Gemini Flash API 키 사용
                  </p>
                </button>
              </div>
            </div>

            {aiProvider !== 'mock' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  {aiProvider === 'openai' ? 'OpenAI API Key' : 'Gemini API Key'}
                </label>
                <input
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder={aiProvider === 'openai' ? 'sk-...' : 'AIzaSy...'}
                  className="w-full bg-cream-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 font-mono"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  * API 호출 실패 시 학생의 일기는 안전하게 저장되며 내장 격려 엔진으로 자동 대체됩니다.
                </p>
              </div>
            )}

            <div className="bg-sage-50/70 p-3 rounded-2xl border border-sage-200/60 text-xs text-stone-600">
              <strong className="text-sage-900">💡 AI 격려 원칙:</strong> 학생을 평가하거나 점수 매기지 않으며, 학생이 찾은 감사의 의미를 긍정적으로 지지하고 공감하는 1~2문장의 따뜻한 코멘트만 제공합니다.
            </div>
          </div>
        )}

        {/* Tab: Firebase */}
        {activeTab === 'firebase' && (
          <div className="space-y-4 animate-fade-in">
            {/* Live Link Card */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <span>학생 배포용 웹 접속 링크 (Firebase Hosting URL)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-800">
                  {firebaseProjectId ? '연결됨' : '설정 필요'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-stone-800 select-all overflow-x-auto whitespace-nowrap">
                  {firebaseProjectId ? `https://${firebaseProjectId.trim()}.web.app` : 'https://[프로젝트ID].web.app'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const url = firebaseProjectId ? `https://${firebaseProjectId.trim()}.web.app` : '';
                    if (!url) {
                      alert('먼저 아래 Firebase Project ID를 설정해 주세요.');
                      return;
                    }
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? '복사됨!' : '링크 복사'}</span>
                </button>
              </div>

              <p className="text-[11px] text-amber-800 leading-relaxed">
                💡 이 웹 주소를 <strong>학생 알림장, 학급 SNS, 학교 홈페이지, 태블릿 북마크</strong>로 공유하면 스마트폰, 태블릿, PC 어디서든 즉시 접속해 감사일기를 쓸 수 있습니다.
              </p>
            </div>

            {/* Firebase Toggle */}
            <div className="flex items-center justify-between p-3 bg-cream-50 rounded-2xl border border-stone-100">
              <div>
                <span className="text-xs font-bold text-stone-800 block">Firebase 실시간 클라우드(Firestore) 동기화 사용</span>
                <span className="text-[11px] text-stone-500">
                  학생들이 각자 자리에서 작성한 감사일기를 실시간으로 교탁 컴퓨터에 수집합니다.
                </span>
              </div>
              <input
                type="checkbox"
                checked={useFirebase}
                onChange={(e) => setUseFirebase(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-400"
              />
            </div>

            {useFirebase && (
              <div className="space-y-3 animate-fade-in">
                {/* Easy Snippet Paste */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Firebase 콘솔 설정 코드 붙여넣기 (추천)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleParseSnippet}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition"
                    >
                      자동 파싱 적용
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={firebaseRawSnippet}
                    onChange={(e) => setFirebaseRawSnippet(e.target.value)}
                    placeholder="Firebase 콘솔에서 복사한 firebaseConfig 객체나 JSON을 여기에 붙여넣고 [자동 파싱 적용]을 누르세요."
                    className="w-full bg-white border border-stone-200 rounded-xl p-2 text-[11px] font-mono text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Project ID (*필수)</label>
                    <input
                      type="text"
                      value={firebaseProjectId}
                      onChange={(e) => setFirebaseProjectId(e.target.value)}
                      placeholder="my-gratitude-school"
                      className="w-full bg-cream-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">API Key (*필수)</label>
                    <input
                      type="password"
                      value={firebaseApiKey}
                      onChange={(e) => setFirebaseApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-cream-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">App ID (*필수)</label>
                    <input
                      type="text"
                      value={firebaseAppId}
                      onChange={(e) => setFirebaseAppId(e.target.value)}
                      placeholder="1:123456789:web:abcdef"
                      className="w-full bg-cream-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Auth Domain (선택)</label>
                    <input
                      type="text"
                      value={firebaseAuthDomain}
                      onChange={(e) => setFirebaseAuthDomain(e.target.value)}
                      placeholder="my-gratitude-school.firebaseapp.com"
                      className="w-full bg-cream-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-mono text-stone-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <span className="text-xs text-stone-500">Firestore 보안 규칙(Rules)</span>
                  <button
                    type="button"
                    onClick={handleCopyFirestoreRules}
                    className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg"
                  >
                    {copiedRules ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRules ? '복사됨!' : '보안 규칙 복사'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* One click deploy instructions */}
            <div className="p-3 bg-sage-50/70 border border-sage-200/60 rounded-2xl text-xs text-stone-600 space-y-1.5">
              <div className="font-bold text-sage-900 flex items-center gap-1">
                <Rocket className="w-3.5 h-3.5 text-sage-600" />
                <span>원클릭 배포 방법</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                1. 폴더 내 <strong>`배포하기_firebase.bat`</strong>을 더블 클릭하면 자동으로 빌드되어 배포됩니다.<br />
                2. 배포 완료 후 위의 <strong>배포용 웹 접속 링크</strong>로 학생들이 바로 참여할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Cloud */}
        {activeTab === 'cloud' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-cream-50 rounded-2xl border border-stone-100">
              <div>
                <span className="text-xs font-bold text-stone-800 block">Supabase 클라우드 동기화 사용</span>
                <span className="text-[11px] text-stone-500">
                  학교의 여러 기기(컴퓨터실, 교무실 등)에서 데이터를 실시간 공유할 때 사용합니다.
                </span>
              </div>
              <input
                type="checkbox"
                checked={useSupabase}
                onChange={(e) => setUseSupabase(e.target.checked)}
                className="w-4 h-4 text-sage-600 rounded focus:ring-sage-400"
              />
            </div>

            {useSupabase && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Project URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full bg-cream-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Anon Public Key</label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-cream-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-800"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-stone-500">테이블 생성 DDL 쿼리</span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center gap-1 text-xs text-sage-700 hover:text-sage-900 bg-sage-100 px-2.5 py-1 rounded-lg"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? '복사됨!' : 'SQL 쿼리 복사'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Data */}
        {activeTab === 'data' && (
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-900">시연용 샘플 데이터 채우기</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  1학년 2반 25명 학생 및 오늘 작성 완료 21명의 모범 감사일기를 즉시 생성합니다.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handlePopulate} icon={<Sparkles className="w-3.5 h-3.5 text-emerald-600" />}>
                채우기
              </Button>
            </div>

            <div className="p-4 bg-coral-50/70 border border-coral-200/70 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-coral-900">전체 데이터 초기화</h4>
                <p className="text-[11px] text-coral-700 mt-0.5">
                  새 학기 시작 시 저장된 모든 학생과 일기, 메모를 리셋합니다.
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={handleReset} icon={<Trash2 className="w-3.5 h-3.5" />}>
                초기화
              </Button>
            </div>
          </div>
        )}

        {message && (
          <div className="p-2.5 bg-sage-100 text-sage-800 rounded-xl text-xs text-center font-bold animate-fade-in">
            {message}
          </div>
        )}

        {/* Save footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button variant="outline" size="md" onClick={onClose}>
            닫기
          </Button>
          <Button variant="primary" size="md" onClick={handleSave}>
            설정 저장하기
          </Button>
        </div>
      </div>
    </Modal>
  );
};
