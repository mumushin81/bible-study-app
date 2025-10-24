export interface Word {
  hebrew: string;
  meaning: string;
  ipa: string;
  korean: string;
  letters?: string;  // 글자별 분해 (예: "ש(sh) + ל(l) + ו(o) + ם(m)")
  root: string;
  grammar: string;  // 간단한 품사 (명사/동사/형용사/전치사/접속사/부사/대명사)
  iconSvg?: string;  // 화려한 커스텀 SVG 아이콘 코드 (선택적)
}

export interface CommentarySection {
  emoji: string;           // "1️⃣", "2️⃣", "3️⃣", "💡"
  title: string;           // "בְּרֵאשִׁית (베레쉬트) - 절대적인 시작"
  description: string;     // 설명 텍스트
  points: string[];        // 불렛 포인트 리스트
  color: 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'yellow';
}

export interface Commentary {
  intro: string;                    // 서론 텍스트
  sections: CommentarySection[];    // 색상 카드 섹션들 (보통 3-4개)
  whyQuestion?: {                   // 어린이를 위한 질문
    question: string;               // "왜 하나님은 세상을 만드셨을까요?"
    answer: string;                 // 어린이를 위한 답변 (3-5문장)
    bibleReferences: string[];      // 관련 성경 구절들
  };
  conclusion?: {                    // 💡 신학적 의미
    title: string;
    content: string;
  };
}

export interface Verse {
  id: string;
  reference: string;
  hebrew: string;
  ipa: string;
  koreanPronunciation: string;
  literal?: string;
  translation?: string;
  modern: string;
  words: Word[];
  commentary?: Commentary;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  points: number;
  exp: number;
}

export interface UserStats {
  points: number;
  level: number;
  exp: number;
  studiedVerses: string[];
  quizResults: {
    questionId: string;
    correct: boolean;
  }[];
}
