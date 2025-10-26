import React, { useState } from 'react';

interface HebrewIconProps {
  word: string;
  iconUrl?: string; // DB에서 로드한 이미지 URL
  size?: number;
  className?: string;
}

/**
 * 이미지 검증 함수
 * - Supabase Storage의 이미지만 허용
 * - JPG: word_{32-char-md5-hash}.jpg (hebrew-icons/icons/)
 * - JPG: {filename}.jpg (hebrew-icons/word_icons/) - 창세기 1:1 등
 * - GIF: word_{32-char-md5-hash}.gif (animated-icons/gifs/)
 */
function isValidImage(url: string): boolean {
  if (!url) return false;

  // JPG 패턴 1: MD5 해시 파일명 (hebrew-icons/icons/)
  const jpgPattern1 = /supabase\.co\/storage\/v1\/object\/public\/hebrew-icons\/icons\/word_[a-f0-9]{32}\.jpg$/;

  // JPG 패턴 2: 일반 파일명 (hebrew-icons/word_icons/)
  const jpgPattern2 = /supabase\.co\/storage\/v1\/object\/public\/hebrew-icons\/word_icons\/[a-zA-Z_]+\.jpg$/;

  // GIF 패턴 (animated-icons/gifs/)
  const gifPattern = /supabase\.co\/storage\/v1\/object\/public\/animated-icons\/gifs\/word_[a-f0-9]{32}\.gif$/;

  return jpgPattern1.test(url) || jpgPattern2.test(url) || gifPattern.test(url);
}

const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconUrl,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [isInvalidFormat, setIsInvalidFormat] = useState(false);

  // 이미지 형식 검증
  React.useEffect(() => {
    if (iconUrl && !isValidImage(iconUrl)) {
      console.warn(`[HebrewIcon] ⚠️ Invalid image format: ${iconUrl}`);
      setIsInvalidFormat(true);
    } else {
      setIsInvalidFormat(false);
    }
  }, [iconUrl]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 검증: 유효한 이미지 형식만 허용
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (iconUrl && isInvalidFormat) {
    console.error(`[HebrewIcon] 🚫 Invalid image rejected for ${word}: ${iconUrl}`);
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          padding: '16px',
          color: '#856404',
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          🚫 올바르지 않은 이미지 형식
        </div>
        <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>
          {word}
        </div>
        <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.7 }}>
          JPG 또는 GIF 형식만 허용됩니다
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 이미지 표시: DB의 icon_url만 사용
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (iconUrl && !imageError) {
    const isGif = iconUrl.endsWith('.gif');
    console.log(`[HebrewIcon] 🎨 Rendering ${isGif ? 'GIF' : 'JPG'} for ${word}: ${iconUrl}`);
    return (
      <img
        src={iconUrl}
        alt={word}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        loading="lazy"
        onError={() => {
          console.warn(`[HebrewIcon] ❌ Image load failed for ${word}`);
          setImageError(true);
        }}
      />
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 에러 또는 이미지 없음: 빈 상태 표시
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '16px',
        color: '#666',
        fontSize: '14px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>
        {word}
      </div>
      <div style={{ fontSize: '10px', opacity: 0.6 }}>
        {imageError ? '이미지 로딩 실패' : '이미지 없음'}
      </div>
    </div>
  );
};

export default HebrewIcon;