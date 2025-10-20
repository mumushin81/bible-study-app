import React from 'react';

interface NachashIconColorfulProps {
  size?: number;
  className?: string;
}

/**
 * נָחָשׁ (나하쉬) - 뱀
 * 화려하고 교활한 뱀의 모습을 표현
 */
const NachashIconColorful: React.FC<NachashIconColorfulProps> = ({
  size = 64,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* 뱀 몸통 그라디언트 - 초록/금색 */}
        <linearGradient id="snakeBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C853" />
          <stop offset="50%" stopColor="#64DD17" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>

        {/* 뱀 배 그라디언트 - 노란색/주황색 */}
        <linearGradient id="snakeBellyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFEB3B" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#FF9800" />
        </linearGradient>

        {/* 눈 그라디언트 - 빨간색/노란색 */}
        <radialGradient id="eyeGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#C41E3A" />
        </radialGradient>

        {/* 비늘 패턴 */}
        <pattern id="scalePattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2" fill="#1B5E20" opacity="0.3" />
        </pattern>
      </defs>

      {/* 배경 그림자 */}
      <ellipse
        cx="32"
        cy="58"
        rx="28"
        ry="4"
        fill="#000000"
        opacity="0.2"
      />

      {/* 뱀 몸통 - 구불구불한 형태 */}
      <path
        d="M 48 52 Q 52 44 48 36 Q 44 28 48 20 Q 52 12 48 4"
        stroke="url(#snakeBodyGradient)"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))"
      />

      {/* 뱀 배 (밝은 부분) */}
      <path
        d="M 48 52 Q 50 44 48 36 Q 46 28 48 20 Q 50 12 48 4"
        stroke="url(#snakeBellyGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* 비늘 패턴 */}
      <path
        d="M 48 52 Q 52 44 48 36 Q 44 28 48 20 Q 52 12 48 4"
        stroke="url(#scalePattern)"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />

      {/* 뱀 머리 */}
      <ellipse
        cx="48"
        cy="4"
        rx="8"
        ry="6"
        fill="url(#snakeBodyGradient)"
        stroke="#1B5E20"
        strokeWidth="1"
        filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))"
        transform="rotate(-30 48 4)"
      />

      {/* 뱀 눈 (왼쪽) */}
      <ellipse
        cx="45"
        cy="3"
        rx="2.5"
        ry="3"
        fill="url(#eyeGradient)"
        stroke="#000000"
        strokeWidth="0.5"
        filter="drop-shadow(0 0 3px rgba(255, 215, 0, 0.8))"
      />
      <ellipse
        cx="45"
        cy="2.5"
        rx="1"
        ry="1.5"
        fill="#000000"
      />
      <circle
        cx="44.5"
        cy="2"
        r="0.5"
        fill="#FFFFFF"
        opacity="0.8"
      />

      {/* 뱀 눈 (오른쪽) */}
      <ellipse
        cx="51"
        cy="3"
        rx="2.5"
        ry="3"
        fill="url(#eyeGradient)"
        stroke="#000000"
        strokeWidth="0.5"
        filter="drop-shadow(0 0 3px rgba(255, 215, 0, 0.8))"
      />
      <ellipse
        cx="51"
        cy="2.5"
        rx="1"
        ry="1.5"
        fill="#000000"
      />
      <circle
        cx="50.5"
        cy="2"
        r="0.5"
        fill="#FFFFFF"
        opacity="0.8"
      />

      {/* 혀 - 갈라진 형태 */}
      <g stroke="#C41E3A" strokeWidth="1.5" strokeLinecap="round">
        <path d="M 54 6 L 58 8" opacity="0.9" />
        <path d="M 54 6 L 58 4" opacity="0.9" />
      </g>

      {/* 사과 (유혹의 상징) */}
      <defs>
        <radialGradient id="appleGradient" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="50%" stopColor="#C41E3A" />
          <stop offset="100%" stopColor="#8B0000" />
        </radialGradient>
      </defs>

      <circle
        cx="20"
        cy="32"
        r="10"
        fill="url(#appleGradient)"
        filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))"
      />

      {/* 사과 하이라이트 */}
      <ellipse
        cx="17"
        cy="28"
        rx="3"
        ry="4"
        fill="#FFFFFF"
        opacity="0.4"
      />

      {/* 사과 잎 */}
      <path
        d="M 20 22 Q 18 20 16 22"
        stroke="#2E7D32"
        strokeWidth="2"
        fill="#4CAF50"
        strokeLinecap="round"
      />

      {/* 꼬리 끝 - 화려한 마무리 */}
      <circle
        cx="48"
        cy="52"
        r="4"
        fill="url(#snakeBodyGradient)"
        stroke="#FFD700"
        strokeWidth="1"
        filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))"
      />

      {/* 반짝이는 효과 (비늘) */}
      <g fill="#FFFFFF" opacity="0.6">
        <circle cx="48" cy="10" r="1" />
        <circle cx="46" cy="18" r="1.5" />
        <circle cx="50" cy="26" r="1" />
        <circle cx="46" cy="34" r="1.5" />
        <circle cx="50" cy="42" r="1" />
      </g>
    </svg>
  );
};

export default NachashIconColorful;
