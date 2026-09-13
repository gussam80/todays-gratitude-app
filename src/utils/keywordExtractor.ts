import { GRATITUDE_CATEGORIES } from '../constants/theme';

export function extractGratitudeKeywords(text: string): string[] {
  if (!text) return [];
  const matchedCategories: { name: string; count: number }[] = [];

  for (const cat of GRATITUDE_CATEGORIES) {
    let count = 0;
    for (const kw of cat.keywords) {
      if (text.includes(kw)) {
        count++;
      }
    }
    if (count > 0) {
      matchedCategories.push({ name: cat.name, count });
    }
  }

  // Sort by highest match count
  matchedCategories.sort((a, b) => b.count - a.count);
  return matchedCategories.slice(0, 3).map(c => c.name);
}

// Safety check for distress or crisis keywords
export function detectDistressKeywords(text: string): boolean {
  if (!text) return false;
  const distressTerms = [
    '죽고 싶', '죽고싶', '사라지고 싶', '살기 싫',
    '괴롭힘', '왕따', '따돌림', '때렸', '맞았', '학대',
    '자해', '피흘', '우울해 미치겠', '도망치고 싶'
  ];
  return distressTerms.some(term => text.includes(term));
}
