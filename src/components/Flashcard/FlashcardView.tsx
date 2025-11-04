import React, { useState } from 'react'
import { FlashcardModel } from '@/models/Flashcard'
import Image from 'next/image'

interface FlashcardViewProps {
  card: FlashcardModel
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  const toggleFlip = () => setIsFlipped(!isFlipped)

  return (
    <div
      className="flashcard relative w-64 h-96 rounded-lg shadow-lg cursor-pointer perspective"
      onClick={toggleFlip}
    >
      <div className={`flashcard-inner relative w-full h-full transition-transform duration-600
        ${isFlipped ? 'rotate-y-180' : ''}`}>

        {/* 앞면 (히브리어 단어) */}
        <div className={`flashcard-front absolute w-full h-full flex flex-col justify-center items-center
          bg-white rounded-lg p-4 backface-hidden ${!isFlipped ? 'z-10' : 'rotate-y-180'}`}>

          {card.hasIcon && (
            <div className="mb-4 w-40 h-60 relative">
              <Image
                src={card.getImageUrl()!}
                alt={`${card.hebrew} 이미지`}
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-800">{card.hebrew}</h2>
          <p className="text-sm text-gray-600">{card.korean}</p>
        </div>

        {/* 뒷면 (의미와 문법) */}
        <div className={`flashcard-back absolute w-full h-full flex flex-col justify-center items-center
          bg-blue-100 rounded-lg p-4 backface-hidden ${isFlipped ? 'z-10' : 'rotate-y-180'}`}>

          <h3 className="text-xl font-semibold text-gray-900">{card.meaning}</h3>

          <div className="mt-4 text-sm text-gray-700">
            {card.grammar && <p>문법: {card.grammar}</p>}
            {card.root && <p>어근: {card.root}</p>}
            {card.context && <p className="text-xs text-gray-600">문맥: {card.context}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlashcardView