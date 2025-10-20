// 컨텐츠 제작 에이전트 타입 정의

export interface EmptyVerse {
  id: string
  book_id: string
  chapter: number
  verse_number: number
  reference: string
  hebrew: string
}

export interface GeneratedWord {
  hebrew: string
  meaning: string
  ipa: string
  korean: string
  letters: string  // 글자별 분해 (예: "ש(sh) + ל(l) + ו(o) + ם(m)")
  root: string
  grammar: string  // 간단한 품사 (명사/동사/형용사/전치사/접속사/부사/대명사)
  emoji: string  // fallback
  iconSvg: string  // 화려한 커스텀 SVG 아이콘 코드 (필수)
  relatedWords?: string[]  // 관련 단어들
}

export interface CommentarySection {
  emoji: string
  title: string
  description: string
  points: string[]
  color: 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'yellow'
}

export interface WhyQuestion {
  question: string
  answer: string
  bibleReferences: string[]
}

export interface Conclusion {
  title: string
  content: string
}

export interface GeneratedCommentary {
  intro: string
  sections: CommentarySection[]
  whyQuestion: WhyQuestion
  conclusion: Conclusion
}

export interface GeneratedContent {
  verseId: string
  ipa: string
  koreanPronunciation: string
  modern: string
  literal?: string
  translation?: string
  words: GeneratedWord[]
  commentary: GeneratedCommentary
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface GenerationStats {
  totalVerses: number
  successCount: number
  failureCount: number
  totalTokensUsed: number
  estimatedCost: number
  startTime: Date
  endTime?: Date
}
