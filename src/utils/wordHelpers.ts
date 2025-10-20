import { Word } from '../types';

/**
 * 단어에 맞는 이모지 반환
 */
export function getWordEmoji(word: Word): string {
  if (word.emoji) return word.emoji;

  const meaning = word.meaning.toLowerCase();

  // 핵심 단어별 특별 이모지
  if (meaning.includes('하나님') || meaning.includes('엘로힘')) return '👑';
  if (meaning.includes('처음') || meaning.includes('태초') || meaning.includes('베레쉬트')) return '🌅';
  if (meaning.includes('창조') || meaning.includes('바라')) return '✨';
  if (meaning.includes('하늘') || meaning.includes('샤마임')) return '☁️';
  if (meaning.includes('땅') || meaning.includes('에레츠') || meaning.includes('지구')) return '🌏';
  if (meaning.includes('빛') || meaning.includes('오르')) return '🌟';
  if (meaning.includes('어둠') || meaning.includes('어두')) return '🌙';
  if (meaning.includes('물') && !meaning.includes('목적')) return '💎';
  if (meaning.includes('바다')) return '🌊';
  if (meaning.includes('해') || meaning.includes('태양')) return '☀️';
  if (meaning.includes('달')) return '🌙';
  if (meaning.includes('별')) return '⭐';
  if (meaning.includes('나무') || meaning.includes('식물')) return '🌳';
  if (meaning.includes('열매') || meaning.includes('과일')) return '🍎';
  if (meaning.includes('새') || meaning.includes('날개')) return '🕊️';
  if (meaning.includes('물고기')) return '🐠';
  if (meaning.includes('사람') || meaning.includes('인간') || meaning.includes('아담')) return '🧑';
  if (meaning.includes('여자') || meaning.includes('이브')) return '👩';
  if (meaning.includes('남자')) return '👨';
  if (meaning.includes('생명') || meaning.includes('살다')) return '💚';
  if (meaning.includes('영') || meaning.includes('숨')) return '💨';
  if (meaning.includes('말씀') || meaning.includes('말하')) return '💬';
  if (meaning.includes('축복')) return '🙏';
  if (meaning.includes('선') || meaning.includes('좋')) return '😊';
  if (meaning.includes('악') || meaning.includes('나쁨')) return '⚠️';
  if (meaning.includes('목적격')) return '🎯';
  if (meaning.includes('그리고') || meaning.includes('접속')) return '➕';

  // 문법적 카테고리별 기본 이모지
  if (word.grammar?.includes('동사')) return '🔥';
  if (word.grammar?.includes('명사')) return '💠';
  if (word.grammar?.includes('형용사')) return '🎨';
  if (word.grammar?.includes('전치사') || word.grammar?.includes('조사')) return '🔗';
  if (word.grammar?.includes('대명사')) return '👉';
  if (word.grammar?.includes('수사')) return '🔢';

  return '📜';
}

/**
 * 품사별 색상 반환
 */
export function getWordColor(word: Word, darkMode: boolean): { bg: string; border: string } {
  const grammar = word.grammar?.toLowerCase() || '';

  // 명사 - 파란색 계열
  if (grammar.includes('명사')) {
    return darkMode
      ? { bg: 'bg-gradient-to-br from-blue-900/50 via-blue-800/40 to-indigo-900/50', border: 'border-blue-500/30' }
      : { bg: 'bg-gradient-to-br from-blue-100/90 via-blue-50/90 to-indigo-100/90', border: 'border-blue-300/50' };
  }

  // 동사 - 빨간색 계열
  if (grammar.includes('동사')) {
    return darkMode
      ? { bg: 'bg-gradient-to-br from-red-900/50 via-rose-800/40 to-pink-900/50', border: 'border-red-500/30' }
      : { bg: 'bg-gradient-to-br from-red-100/90 via-rose-50/90 to-pink-100/90', border: 'border-red-300/50' };
  }

  // 형용사 - 초록색 계열
  if (grammar.includes('형용사')) {
    return darkMode
      ? { bg: 'bg-gradient-to-br from-green-900/50 via-emerald-800/40 to-teal-900/50', border: 'border-green-500/30' }
      : { bg: 'bg-gradient-to-br from-green-100/90 via-emerald-50/90 to-teal-100/90', border: 'border-green-300/50' };
  }

  // 전치사/조사 - 노란색 계열
  if (grammar.includes('전치사') || grammar.includes('조사')) {
    return darkMode
      ? { bg: 'bg-gradient-to-br from-yellow-900/50 via-amber-800/40 to-orange-900/50', border: 'border-yellow-500/30' }
      : { bg: 'bg-gradient-to-br from-yellow-100/90 via-amber-50/90 to-orange-100/90', border: 'border-yellow-300/50' };
  }

  // 부사 - 보라색 계열
  if (grammar.includes('부사')) {
    return darkMode
      ? { bg: 'bg-gradient-to-br from-purple-900/50 via-violet-800/40 to-fuchsia-900/50', border: 'border-purple-500/30' }
      : { bg: 'bg-gradient-to-br from-purple-100/90 via-violet-50/90 to-fuchsia-100/90', border: 'border-purple-300/50' };
  }

  // 접속사 - 청록색 계열
  if (grammar.includes('접속사')) {
    return darkMode
      ? { bg: 'bg-gradient-to-br from-cyan-900/50 via-sky-800/40 to-blue-900/50', border: 'border-cyan-500/30' }
      : { bg: 'bg-gradient-to-br from-cyan-100/90 via-sky-50/90 to-blue-100/90', border: 'border-cyan-300/50' };
  }

  // 기타 - 기본 파스텔 그라데이션
  return darkMode
    ? { bg: 'bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-blue-900/40', border: 'border-purple-400/30' }
    : { bg: 'bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80', border: 'border-purple-200/50' };
}

/**
 * 간단한 품사명 반환
 */
export function getSimpleGrammar(grammar: string): string {
  if (grammar.includes('명사')) return '명사';
  if (grammar.includes('동사')) return '동사';
  if (grammar.includes('형용사')) return '형용사';
  if (grammar.includes('전치사') || grammar.includes('조사')) return '전치사';
  if (grammar.includes('접속사')) return '접속사';
  if (grammar.includes('부사')) return '부사';
  if (grammar.includes('대명사')) return '대명사';
  return '기타';
}

/**
 * 품사별 이모지 반환
 */
export function getGrammarEmoji(grammar: string): string {
  if (grammar.includes('명사')) return '💠';
  if (grammar.includes('동사')) return '🔥';
  if (grammar.includes('형용사')) return '🎨';
  if (grammar.includes('전치사') || grammar.includes('조사')) return '🔗';
  if (grammar.includes('접속사')) return '➕';
  if (grammar.includes('부사')) return '💫';
  if (grammar.includes('대명사')) return '👉';
  return '📜';
}

/**
 * 신학적 의미 반환
 */
export function getTheologicalMeaning(word: Word): string {
  const hebrew = word.hebrew;
  const meaning = word.meaning.toLowerCase();

  // 특정 단어들에 대한 신학적 의미
  if (hebrew === 'בְּרֵאשִׁית') {
    return '시간의 절대적 시작점. 하나님이 시간, 공간, 물질을 창조하신 그 순간을 가리킵니다.';
  }
  if (hebrew === 'בָּרָא') {
    return '오직 하나님만이 할 수 있는 무에서 유를 만드는 창조. 인간의 "만들기"와는 차원이 다릅니다.';
  }
  if (hebrew === 'אֱלֹהִים') {
    return '형태는 복수이지만 단수 동사와 사용되는 "존엄의 복수". 하나님의 무한한 위엄과 권능을 나타냅니다.';
  }
  if (hebrew === 'הַשָּׁמַיִם') {
    return '복수형으로 사용되어 하늘의 방대함과 층차성을 표현. 물리적 하늘과 영적 하늘을 모두 포함합니다.';
  }
  if (hebrew === 'הָאָרֶץ') {
    return '하나님이 인간을 위해 특별히 준비하신 거주 공간. 물리적 환경이자 영적 생활의 무대입니다.';
  }
  if (hebrew === 'אֵת') {
    return '히브리어에만 있는 독특한 문법 요소. 직접 목적어가 특별히 중요함을 강조합니다.';
  }
  if (meaning.includes('빛')) {
    return '단순한 물리적 빛이 아니라 하나님의 진리와 거룩함을 상징하는 영적 실재입니다.';
  }
  if (meaning.includes('어둠')) {
    return '하나님이 아직 빛으로 질서를 부여하지 않은 상태. 혼돈과 무질서를 의미합니다.';
  }
  if (meaning.includes('물')) {
    return '생명의 원소이자 정결을 상징. 세례와 중생의 영적 의미로 확장됩니다.';
  }
  if (meaning.includes('나무') || meaning.includes('식물')) {
    return '하나님이 때를 따라 열매를 맺도록 설계하신 생명체. 성도의 영적 성장을 상징합니다.';
  }
  if (meaning.includes('사람') || meaning.includes('인간')) {
    return '하나님의 형상대로 창조된 유일한 피조물. 하나님과 교제하도록 설계된 영적 존재입니다.';
  }
  if (meaning.includes('말씀') || meaning.includes('말하')) {
    return '하나님의 창조 방법. 말씀으로 만물을 존재케 하신 전능하신 능력을 보여줍니다.';
  }
  if (meaning.includes('좋') || meaning.includes('선')) {
    return '하나님의 성품과 그 창조물의 완전성을 나타냄. 도덕적 선이 아닌 기능적 완전성을 의미합니다.';
  }

  // 기본 신학적 의미
  if (word.grammar?.includes('동사')) {
    return '하나님의 적극적인 행위를 나타냄. 창조주로서의 주동적 역할을 강조합니다.';
  }
  if (word.grammar?.includes('명사')) {
    return '하나님이 창조하신 구체적 대상. 모든 피조물에는 하나님의 목적과 뜻이 담겨 있습니다.';
  }

  // 기본 메시지
  return '이 단어는 하나님의 창조 사역과 그 분의 성품을 드러내는 중요한 용어입니다.';
}

/**
 * TTS 음성 재생
 */
export function speakHebrew(text: string): void {
  if (!('speechSynthesis' in window)) {
    console.warn('TTS not supported');
    return;
  }

  window.speechSynthesis.cancel();

  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, 100);
}
