import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { FlashcardModel } from '@/models/Flashcard'
import FlashcardView from '@/components/Flashcard/FlashcardView'

export default async function FlashcardsPage() {
  const supabase = createClient()

  const { data: words, error } = await supabase
    .from('words')
    .select('*')
    .not('flashcard_img_url', 'is', null)
    .order('id')

  if (error) {
    console.error('플래시카드 로드 중 오류:', error)
    return <div>플래시카드를 로드할 수 없습니다.</div>
  }

  const flashcards = words.map(word => new FlashcardModel(word))

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">히브리어 성경 단어 플래시카드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
        {flashcards.map(card => (
          <FlashcardView key={card.id} card={card} />
        ))}
      </div>

      {flashcards.length === 0 && (
        <p className="text-center text-gray-600">
          아직 플래시카드가 없습니다. 단어 이미지를 생성해주세요.
        </p>
      )}
    </div>
  )
}