import { Tables } from '@/types/supabase'

export interface Flashcard extends Tables<'words'> {
  flashcard_img_url?: string | null
  hasIcon: boolean
  getImageUrl(): string | null
}

export class FlashcardModel implements Flashcard {
  constructor(private word: Tables<'words'>) {}

  // 데이터베이스 필드 직접 매핑
  get id(): number { return this.word.id }
  get hebrew(): string { return this.word.hebrew }
  get meaning(): string { return this.word.meaning }
  get korean(): string { return this.word.korean }
  get root(): string | null { return this.word.root }
  get grammar(): string | null { return this.word.grammar }
  get context(): string | null { return this.word.context }
  get flashcard_img_url(): string | null { return this.word.flashcard_img_url }

  // 아이콘 존재 여부 확인
  get hasIcon(): boolean {
    return !!this.flashcard_img_url && this.flashcard_img_url.trim() !== ''
  }

  // 이미지 URL 안전하게 반환
  getImageUrl(): string | null {
    return this.hasIcon ? this.flashcard_img_url : null
  }

  // 추가 유틸리티 메서드
  getDisplayName(): string {
    return this.korean || this.hebrew
  }

  // 플래시카드 난이도 계산 (예시)
  calculateDifficulty(): number {
    const complexityFactors = [
      this.hebrew.length,
      this.root ? 1 : 0,
      this.context ? 1 : 0
    ]
    return complexityFactors.reduce((a, b) => a + b, 0)
  }
}