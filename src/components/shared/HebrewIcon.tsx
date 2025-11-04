import React from 'react';

interface FlashcardImgProps {
  word: string;
  flashcardImgUrl?: string | null;
  className?: string;
}

const FlashcardImg: React.FC<FlashcardImgProps> = ({
  word,
  flashcardImgUrl,
  className = '',
}) => {
  // 이미지 URL이 없거나 null인 경우 렌더링 안함
  if (!flashcardImgUrl) return null;

  return (
    <img
      src={flashcardImgUrl}
      alt={word}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
      }}
      loading="lazy"
      onError={(e) => {
        console.warn(`Image load failed for ${word}`);
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

export default FlashcardImg;

