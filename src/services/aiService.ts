import { extractGratitudeKeywords, detectDistressKeywords } from '../utils/keywordExtractor';
import { ClassConfig } from '../types';

export interface AICommentResult {
  comment: string;
  keywords: string[];
}

// Warm contextual mock response generator
export function generateMockAIComment(gratitude1: string, gratitude2: string, gratitude3: string): AICommentResult {
  const fullText = `${gratitude1} ${gratitude2} ${gratitude3}`;
  const keywords = extractGratitudeKeywords(fullText);

  // Safety check for distress
  if (detectDistressKeywords(fullText)) {
    return {
      comment: "오늘 마음이 많이 힘들고 무거운 일이 있었던 것 같아요. 혼자 힘들어하지 말고 믿을 수 있는 선생님이나 어른에게 편하게 이야기해 보는 것도 좋아요. 당신의 마음을 언제나 응원해요. 🌱",
      keywords: ['마음돌봄']
    };
  }

  // Contextual encouragement based on detected categories
  if (keywords.includes('친구')) {
    const friendComments = [
      "함께해 준 친구의 마음을 소중하게 기억하고 있네요. 서로를 배려하는 따뜻한 우정이 느껴져요! 💚",
      "친구와 함께 웃고 나눈 순간이 오늘 하루를 밝혀주었군요. 참 좋은 친구 관계를 가꾸어가고 있어요. 😊",
      "주변 친구에게 고마움을 표현할 줄 아는 예쁜 마음이 돋보여요. 내일도 다정한 하루 보내길 바라요! 🌱"
    ];
    return {
      comment: friendComments[Math.floor(Math.random() * friendComments.length)],
      keywords
    };
  }

  if (keywords.includes('선생님')) {
    const teacherComments = [
      "선생님의 말씀과 칭찬 속에서 긍정적인 힘을 얻었군요. 오늘의 뿌듯한 마음을 소중히 간직해 보세요! 💜",
      "선생님과 함께한 시간 속에서 감사를 발견해낸 모습이 참 멋져요. 내일도 즐거운 배움이 가득하길 응원해요! ✨"
    ];
    return {
      comment: teacherComments[Math.floor(Math.random() * teacherComments.length)],
      keywords
    };
  }

  if (keywords.includes('가족')) {
    const familyComments = [
      "가족과 함께 나눈 따뜻한 온기가 글 속에 가득 담겨 있네요. 소중한 사람들과의 시간이 큰 힘이 되었을 거예요. 💙",
      "가장 가까운 가족에게 감사한 마음을 전할 줄 아는 모습이 참 다정하고 포근해요. 🏡"
    ];
    return {
      comment: familyComments[Math.floor(Math.random() * familyComments.length)],
      keywords
    };
  }

  if (keywords.includes('배움·성장')) {
    const learningComments = [
      "새로운 것을 배우고 스스로 해내는 과정에서 큰 보람을 찾았군요. 한 걸음씩 성장해가는 모습이 정말 멋집니다! 🧡",
      "어려운 순간도 포기하지 않고 노력한 자신을 스스로 칭찬해 주세요. 오늘의 값진 배움이 내일의 힘이 될 거예요. 🌱"
    ];
    return {
      comment: learningComments[Math.floor(Math.random() * learningComments.length)],
      keywords
    };
  }

  if (keywords.includes('나 자신')) {
    const selfComments = [
      "스스로 노력하고 잘 견뎌낸 자신을 따뜻하게 안아준 하루였네요. 자신의 가능성을 믿고 응원하는 모습이 자랑스러워요! 🌱",
      "나를 돌보고 스스로에게 감사할 줄 아는 태도는 가장 큰 선물이에요. 오늘 하루도 수고 많았어요! ⭐"
    ];
    return {
      comment: selfComments[Math.floor(Math.random() * selfComments.length)],
      keywords
    };
  }

  // General encouraging comments
  const generalComments = [
    "오늘 하루 속에서 작은 감사들을 세심하게 발견해 낸 모습이 참 좋아요. 내일도 주변의 좋은 순간을 찾아보세요! 🌱",
    "평범한 일상 속에서도 고마운 순간을 놓치지 않고 기록했네요. 감사의 마음이 오늘을 한층 더 풍성하게 만들어 주었을 거예요. ✨",
    "하루를 돌아보며 고마운 일들을 떠올린 것만으로도 마음이 한결 따뜻해졌을 거예요. 편안한 저녁 보내세요! 🌿",
    "사소해 보이는 순간에도 감사함을 발견하는 고운 시선이 참 멋져요. 오늘의 긍정적인 에너지를 내일로 이어가 보세요. 😊"
  ];

  return {
    comment: generalComments[Math.floor(Math.random() * generalComments.length)],
    keywords: keywords.length > 0 ? keywords : ['일상·감사']
  };
}

// Live AI integration (OpenAI or Gemini) with safe fallback
export async function generateAIComment(
  gratitude1: string,
  gratitude2: string,
  gratitude3: string,
  config?: ClassConfig
): Promise<AICommentResult> {
  const fullText = `${gratitude1}\n${gratitude2}\n${gratitude3}`;
  const keywords = extractGratitudeKeywords(fullText);

  // If distress detected, always prioritize safety directly without sending raw sensitive info to 3rd party
  if (detectDistressKeywords(fullText)) {
    return generateMockAIComment(gratitude1, gratitude2, gratitude3);
  }

  // If no API key or mock provider configured, return high-quality mock response
  if (!config?.aiApiKey || config.aiProvider === 'mock' || !config.aiProvider) {
    return generateMockAIComment(gratitude1, gratitude2, gratitude3);
  }

  try {
    const prompt = `너는 초중고 학생의 감사일기를 읽고 따뜻하고 짧은 격려를 제공하는 교육용 AI이다.
학생의 글을 평가하거나 판단하거나 점수 매기지 말고, 학생이 발견한 감사의 의미를 긍정적으로 인정해라.
답변은 부드럽고 다정한 한국어 존댓말로 1~2문장으로 작성해라. 지나치게 과장된 표현은 피하고 온화하게 응원해라.

학생의 오늘의 감사 3가지:
1. ${gratitude1}
2. ${gratitude2}
3. ${gratitude3}

격려 코멘트(1~2문장):`;

    if (config.aiProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.aiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
      const data = await res.json();
      const comment = data.choices?.[0]?.message?.content?.trim();
      if (comment) {
        return { comment, keywords: keywords.length > 0 ? keywords : ['감사'] };
      }
    } else if (config.aiProvider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.aiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.7 }
        })
      });

      if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
      const data = await res.json();
      const comment = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (comment) {
        return { comment, keywords: keywords.length > 0 ? keywords : ['감사'] };
      }
    }
  } catch (error) {
    console.warn('AI API call failed, falling back to local encouragement generator:', error);
  }

  // Graceful fallback to mock
  return generateMockAIComment(gratitude1, gratitude2, gratitude3);
}
