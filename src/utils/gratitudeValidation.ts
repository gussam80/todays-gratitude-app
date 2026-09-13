export interface QualityCheckResult {
  valid: boolean;
  reason?: 'empty' | 'jamo' | 'symbols' | 'repeated' | 'dummy' | 'dismissive' | 'too_short' | 'incomplete_ending' | 'not_a_sentence' | 'no_predicate';
  message: string;
  suggestion?: string;
  summaryBadge?: string;
}

export interface GratitudeValidationError {
  field: 1 | 2 | 3;
  title: string;
  message: string;
  suggestion?: string;
}

/**
 * 학생이 입력한 단어나 문구를 바탕으로 자연스러운 완성형 감사 문장을 동적으로 추천합니다.
 */
export function generateSentenceSuggestion(input: string): string {
  const clean = (input || '').trim().replace(/[.!?~^♡♥★☆\s]+$/g, '');
  if (!clean) return '예: 오늘 점심 급식에 내가 좋아하는 음식이 나와 맛있게 먹었어요.';

  const NOUNS = [
    '게임', '그림', '모임', '모둠', '피자', '과자', '의자', '상자', '모자', '감자',
    '바다', '사이다', '소다', '판다', '바나나', '피아노'
  ];

  // 1. 끝이 연결어미로 끝난 경우 (예: ~고, ~서, ~며, ~면, ~다가)
  if (!NOUNS.some(n => clean.endsWith(n)) && /[고며면서니게]$|[^피과모상의감]자$/.test(clean)) {
    return `예: '${clean} 정말 기분 좋고 감사한 마음이 들었어요.'`;
  }

  // 2. 끝이 조사로 끝난 경우 (예: ~을/를, ~와/과, ~에, ~으로, ~도)
  if (/[을를]$/.test(clean)) {
    if (/밥|급식|음식|반찬|간식|사과|빵|고기|라면|돈가스|피자|과자|치킨|떡볶이/.test(clean)) {
      return `예: '${clean} 맛있게 먹고 든든하게 하루를 보낼 수 있어서 감사했어요.'`;
    }
    if (/체육|피구|축구|수업|공부|숙제|시험|게임|놀이|책|독서|활동/.test(clean)) {
      return `예: '${clean} 열심히 참여하며 보람찬 시간을 보냈어요.'`;
    }
    return `예: '${clean} 소중하게 생각하며 감사한 하루를 보냈어요.'`;
  }
  if (/[와과랑]$/.test(clean)) {
    return `예: '${clean} 함께 즐거운 시간을 보내고 서로 도와주어서 고마웠어요.'`;
  }
  if (/[에서]$/.test(clean)) {
    return `예: '${clean} 새로운 것을 배우고 즐겁게 활동해서 감사했어요.'`;
  }
  if (/[에게한테께]$/.test(clean)) {
    return `예: '${clean} 고마운 마음을 전할 수 있어서 뜻깊었어요.'`;
  }
  if (/[이가은는]$/.test(clean)) {
    return `예: '${clean} 나를 따뜻하게 격려해 주셔서 큰 힘이 되었어요.'`;
  }
  if (/[에로도만]$/.test(clean)) {
    return `예: '${clean} 좋은 일이 생겨서 정말 감사하고 다행이었어요.'`;
  }

  // 3. 끝 단어별 맞춤 제안 (명사 종결)
  if (/선물$/.test(clean)) {
    return `예: '${clean}을(를) 받아 정말 기쁘고 감사한 마음이 들었어요.'`;
  }
  if (/밥|급식|음식|반찬|간식|사과|빵|고기|라면|돈가스|피자|과자|치킨|떡볶이|국|찌개|과일|우유|아침|점심|저녁/.test(clean)) {
    return `예: '${clean}을(를) 맛있게 먹고 힘차게 하루를 보낼 수 있어서 감사했어요.'`;
  }
  if (/친구|선생님|엄마|아빠|부모님|동생|형|누나|오빠|가족|짝꿍|할머니|할아버지/.test(clean)) {
    return `예: '${clean}와(과) 함께 사이좋게 지내고 힘이 되어주어서 감사했어요.'`;
  }
  if (/체육|피구|축구|수업|공부|숙제|시험|게임|놀이|책|독서|도서관|음악|미술|운동|달리기/.test(clean)) {
    return `예: '${clean} 활동에 즐겁게 참여하고 끝까지 해내서 스스로 뿌듯했어요.'`;
  }
  if (/날씨|하늘|바람|햇살|햇빛|비|눈|공기/.test(clean)) {
    return `예: '오늘 상쾌한 ${clean} 덕분에 기분 좋은 하루를 보냈어요.'`;
  }

  return `예: '${clean} 덕분에 오늘 하루도 즐겁고 감사한 순간이 되었어요.'`;
}

// 명사로 끝나는 대표적인 예외 단어 (종결어미와 겹치는 글자로 끝나는 명사들)
const NOUNS_ENDING_IN_TERMINATIONS = [
  '게임', '그림', '모임', '모둠', '피자', '과자', '의자', '상자', '모자', '감자',
  '바다', '사이다', '소다', '판다', '바나나', '피아노'
];

/**
 * 개별 감사 항목의 입력 완성도, 문맥적 의미 및 문장 완성 여부를 정밀 검사합니다.
 */
export function checkGratitudeQuality(text: string): QualityCheckResult {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return {
      valid: false,
      reason: 'empty',
      message: '내용을 작성해 주세요.',
      summaryBadge: '💡 단어가 아닌 완성된 문장으로 적어보세요'
    };
  }

  const withoutSpaces = trimmed.replace(/\s/g, '');
  // 뒤쪽의 문장부호(. ! ? ~ ^ ♡ ♥ ★ ☆) 및 공백 제거
  const cleanText = trimmed.replace(/[.!?~^♡♥★☆\s]+$/g, '');
  const lastChar = cleanText.slice(-1);

  // 1. 한글 자음 또는 모음만으로 구성 (예: ㅇ, ㅋㅋㅋ, ㅎㅎ, ㄱㄱ, ㅏㅏ)
  const isOnlyJamo = /^[ㄱ-ㅎㅏ-ㅣ\s\.\,\!\?\~\^\-]+$/.test(trimmed);
  if (isOnlyJamo) {
    return {
      valid: false,
      reason: 'jamo',
      message: '자음이나 모음(예: ㅇ, ㅋㅋ)만으로는 감사한 마음을 알기 어려워요. 어떤 일이 고마웠는지 온전한 문장으로 적어볼까요? 😊',
      suggestion: '예: 짝꿍이 모르는 문제를 친절하게 가르쳐 주었어요.',
      summaryBadge: '🌱 자음 대신 문장으로 적어보세요'
    };
  }

  // 2. 특수문자, 숫자, 기호만으로 구성 (예: ..., !!!, 1234)
  const isOnlySymbols = /^[\d\s\.\,\!\?\~\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\\\/\<\>]+$/.test(trimmed);
  if (isOnlySymbols) {
    return {
      valid: false,
      reason: 'symbols',
      message: '기호나 숫자 대신 오늘 감사했던 순간을 글로 표현해 보세요! ✏️',
      suggestion: '예: 점심 급식에 내가 좋아하는 돈가스가 나와 맛있게 먹었어요.',
      summaryBadge: '🌱 기호 대신 문장으로 표현해 보세요'
    };
  }

  // 3. 같은 문자 연속 도배 (예: aaaaa, 가가가가, 1111, 하하하하)
  const isRepeatedChar = /^(.)\1{2,}$/.test(withoutSpaces) || /^(.{2})\1+$/.test(withoutSpaces);
  if (isRepeatedChar) {
    return {
      valid: false,
      reason: 'repeated',
      message: '같은 글자를 반복하기보다 오늘 있었던 특별한 기억을 천천히 떠올려 보세요! 🌸',
      suggestion: '예: 체육 시간에 친구들과 피구를 함께해서 즐거웠어요.',
      summaryBadge: '🌱 반복 글자 대신 오늘 일을 적어보세요'
    };
  }

  // 4. 무의미한 자판 나열 및 테스트성 문구
  const dummyPatterns = [
    '가나다', '가나다라', '동해물과', '아자차카', '하늘땅',
    '테스트', '아무거나', '아무말', '쓸게없', '할말없', '그냥적', '그냥씀',
    '대충적', '대충씀', '모르겠', '기억안', '기억이안', '없다고', '없다니',
    '패스합', 'qwer', 'asdf', 'zxcv', 'ㅁㄴㅇㄹ', 'ㅂㅈㄷㄱ'
  ];
  if (dummyPatterns.some(p => withoutSpaces.includes(p))) {
    return {
      valid: false,
      reason: 'dummy',
      message: '임의의 글자나 테스트 문구 대신 오늘 실제로 있었던 감사한 일을 진심을 담아 적어보세요! 💡',
      suggestion: '예: 숙제를 포기하지 않고 끝까지 해내서 스스로 뿌듯했어요.',
      summaryBadge: '🌱 진심을 담은 감사 문장을 적어보세요'
    };
  }

  // 5. 무성의/회피성 단어 (없음, 몰라, 그냥, 귀찮아, pass 등)
  const dismissiveWords = [
    '없음', '없다', '없어요', '모름', '몰라', '몰라요',
    '그냥', '귀찮', '귀찮음', '귀찮아', '패스', 'pass',
    'none', 'nothing', '싫어', '알아서뭐함', '없는데', 'ㄴㄴ', 'ㅇㅇ', '싫음', '별로'
  ];
  const cleanWord = withoutSpaces.toLowerCase();
  if (dismissiveWords.some(w => cleanWord === w || (cleanWord.length <= 5 && cleanWord.includes(w)))) {
    return {
      valid: false,
      reason: 'dismissive',
      message: '거창한 일이 아니어도 괜찮아요. 오늘 마신 시원한 물 한 잔, 친구와의 인사처럼 소소하고 작은 일상도 훌륭한 감사가 된답니다! 🌿',
      suggestion: '예: 오늘 아침 맑은 하늘을 보며 상쾌한 기분이 들었어요.',
      summaryBadge: '🌱 소소한 일상도 좋은 감사가 돼요'
    };
  }

  // 6. 조사로 끝난 문장 (문장이 조사에서 끊김)
  const particleEndings = ['을', '를', '이', '가', '은', '는', '에', '의', '와', '과', '랑', '로', '으로', '도', '만', '서', '에서', '에게', '한테', '보다', '처럼', '까지', '부터', '조차', '마저', '께'];
  if (particleEndings.some(p => cleanText.endsWith(p))) {
    return {
      valid: false,
      reason: 'incomplete_ending',
      message: `문장이 조사('~${lastChar}')에서 멈추었어요. 뒤이어 어떤 일이 일어났거나 어떤 기분이 들었는지 문장 끝까지 완성해 볼까요? 💭`,
      suggestion: generateSentenceSuggestion(cleanText),
      summaryBadge: '🌱 문장이 중간에 끊겼어요'
    };
  }

  // 7. 연결어미/접속형으로 끝난 문장 (마무리 서술 부재)
  const conjunctiveEndings = ['고', '며', '면', '으면', '아서', '어서', '해서', '여서', '니까', '으니까', '려고', '으려고', '다가', '자마자', '는데', '은데', '텐데', '지만', '으나', '도록', '게'];
  if (conjunctiveEndings.some(c => cleanText.endsWith(c))) {
    return {
      valid: false,
      reason: 'incomplete_ending',
      message: '문장이 이어지다 멈춘 것 같아요. 그래서 어떤 마음이 들었는지 마무리를 지어보세요! 🌿',
      suggestion: generateSentenceSuggestion(cleanText),
      summaryBadge: '🌱 문장 마무리를 완성해 보세요'
    };
  }

  // 8. 문장이 아닌 경우 (단어/명사구 종결 검사 - '오늘 아침 밥', '체육 시간 피구', '점심 급식 돈가스' 등)
  // 한국어 정상 문장의 종결어미: 다, 요, 음, 슴, 함, 어, 아, 해, 네, 군, 죠, 지, 심, 나, 자, 길
  const VALID_SENTENCE_ENDINGS = new Set([
    '다', '요', '음', '슴', '함', '어', '아', '해', '네', '군', '죠', '지', '심', '나', '자', '길'
  ]);

  const isEndingInNoun = NOUNS_ENDING_IN_TERMINATIONS.some(noun => cleanText.endsWith(noun));
  const hasValidTermination = VALID_SENTENCE_ENDINGS.has(lastChar) && !isEndingInNoun;

  if (!hasValidTermination) {
    return {
      valid: false,
      reason: 'not_a_sentence',
      message: `'${trimmed}'처럼 단어나 명사만 적기보다, 어떤 일이 있었고 어떤 마음이 들었는지 완성된 문장(~했어요, ~했습니다)으로 적어볼까요? ✏️`,
      suggestion: generateSentenceSuggestion(cleanText),
      summaryBadge: '🌱 단어 대신 완성된 문장으로 적어보세요'
    };
  }

  // 9. 최소 글자수 체크 (공백 제외 6글자 미만)
  if (withoutSpaces.length < 6) {
    return {
      valid: false,
      reason: 'too_short',
      message: `'${trimmed}'을(를) 조금만 더 구체적인 완성 문장으로 적어볼까요? (최소 6글자 이상 문장) 🌱`,
      suggestion: generateSentenceSuggestion(cleanText),
      summaryBadge: '🌱 문장으로 조금만 더 적어보세요'
    };
  }

  // 10. 종결어미가 붙어있으나 서술어 및 감정/행동 표현이 온전한지 검사 (단순 '밥다', '학교다' 같은 비문 방지)
  const predicatesAndSentiments = [
    '다', '요', '음', '임', '어', '네', '군', '지', '죠', '함', '됨', '봄', '줌',
    '맛있', '좋았', '좋아', '고맙', '고마', '감사', '뿌듯', '신났', '신나', '재미',
    '즐거', '행복', '보람', '편안', '따뜻', '예뻤', '멋졌', '해냈', '배웠', '도와',
    '도움', '먹었', '마셨', '놀았', '웃었', '칭찬', '격려', '응원', '이겼', '쉬었',
    '만났', '풀었', '받았', '줬다', '주셨', '나눴', '성공', '다행', '든든', '흐뭇',
    '했', '됐', '봤', '왔', '갔', '나누', '함께'
  ];
  const hasValidPredicate = predicatesAndSentiments.some(p => withoutSpaces.includes(p));
  if (!hasValidPredicate) {
    return {
      valid: false,
      reason: 'no_predicate',
      message: '단어 나열 대신 어떤 일이 있었는지 구체적인 행동이나 느낌을 담아 문장을 완성해 보세요! 💭',
      suggestion: generateSentenceSuggestion(cleanText),
      summaryBadge: '🌱 상황이나 느낌을 문장으로 적어보세요'
    };
  }

  return {
    valid: true,
    message: '따뜻하고 정성스러운 감사 문장이에요!',
    summaryBadge: '✓ 따뜻하고 정성스러운 감사 문장이에요!'
  };
}

/**
 * 3가지 감사 항목 전체의 완성도, 의미 및 중복 여부를 종합 검사합니다.
 */
export function validateAllGratitudes(g1: string, g2: string, g3: string): GratitudeValidationError | null {
  const q1 = checkGratitudeQuality(g1);
  if (!q1.valid) {
    const title = q1.reason === 'not_a_sentence'
      ? '첫 번째 감사를 완성된 문장으로 적어볼까요? ✏️'
      : '첫 번째 감사 질문을 다시 한번 생각해 볼까요? 💭';
    return {
      field: 1,
      title,
      message: q1.message,
      suggestion: q1.suggestion || generateSentenceSuggestion(g1)
    };
  }

  const q2 = checkGratitudeQuality(g2);
  if (!q2.valid) {
    const title = q2.reason === 'not_a_sentence'
      ? '두 번째 감사를 완성된 문장으로 적어볼까요? ✏️'
      : '두 번째 감사 질문을 다시 한번 생각해 볼까요? 💭';
    return {
      field: 2,
      title,
      message: q2.message,
      suggestion: q2.suggestion || generateSentenceSuggestion(g2)
    };
  }

  const q3 = checkGratitudeQuality(g3);
  if (!q3.valid) {
    const title = q3.reason === 'not_a_sentence'
      ? '세 번째 감사를 완성된 문장으로 적어볼까요? ✏️'
      : '세 번째 감사 질문을 다시 한번 생각해 볼까요? 💭';
    return {
      field: 3,
      title,
      message: q3.message,
      suggestion: q3.suggestion || generateSentenceSuggestion(g3)
    };
  }

  // 3가지 내용 중복 검사 (복사/붙여넣기 방지)
  const t1 = (g1 || '').trim().replace(/\s/g, '');
  const t2 = (g2 || '').trim().replace(/\s/g, '');
  const t3 = (g3 || '').trim().replace(/\s/g, '');

  if (t1 === t2 || t2 === t3 || t1 === t3) {
    return {
      field: (t1 === t2) ? 2 : 3,
      title: '서로 다른 3가지 감사를 찾아볼까요? ✨',
      message: '각 질문마다 서로 다른 감사한 순간을 하나씩 적어주세요. 친구, 가족, 선생님, 학교생활 등 다양한 고마움을 떠올려 보세요!',
      suggestion: '예: 1번은 친구 이야기, 2번은 맛있는 음식이나 가족 이야기, 3번은 스스로 칭찬해줄 일'
    };
  }

  return null;
}
