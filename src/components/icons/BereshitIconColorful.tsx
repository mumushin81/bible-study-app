import React from 'react';

interface BereshitIconColorfulProps {
  size?: number;
  className?: string;
}

/**
 * בְּרֵאשִׁית (베레쉬트) - 처음, 태초
 * 화려한 일출과 새로운 시작을 상징하는 아이콘
 */
const BereshitIconColorful: React.FC<BereshitIconColorfulProps> = ({
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
        {/* 태양 그라디언트 - 금색에서 주황색 */}
        <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF6B35" />
        </radialGradient>

        {/* 하늘 그라디언트 - 분홍에서 보라 */}
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="50%" stopColor="#C44569" />
          <stop offset="100%" stopColor="#8B3A62" />
        </linearGradient>

        {/* 광선 그라디언트 */}
        <radialGradient id="rayGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 배경 하늘 */}
      <rect width="64" height="64" fill="url(#skyGradient)" opacity="0.3" rx="8" />

      {/* 지평선 - 황금빛 */}
      <path
        d="M 0 48 Q 32 44 64 48 L 64 64 L 0 64 Z"
        fill="#4A148C"
        opacity="0.4"
      />

      {/* 태양 광채 (외곽) */}
      <circle
        cx="32"
        cy="28"
        r="20"
        fill="url(#rayGradient)"
        opacity="0.6"
      />

      {/* 태양 (메인) */}
      <circle
        cx="32"
        cy="28"
        r="12"
        fill="url(#sunGradient)"
        filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))"
      />

      {/* 태양 하이라이트 */}
      <circle
        cx="28"
        cy="24"
        r="4"
        fill="#FFFFFF"
        opacity="0.6"
      />

      {/* 태양 광선들 */}
      <g stroke="#FFD700" strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <line x1="32" y1="8" x2="32" y2="14" />
        <line x1="48" y1="12" x2="44" y2="16" />
        <line x1="54" y1="28" x2="48" y2="28" />
        <line x1="48" y1="44" x2="44" y2="40" />
        <line x1="16" y1="12" x2="20" y2="16" />
        <line x1="10" y1="28" x2="16" y2="28" />
        <line x1="16" y1="44" x2="20" y2="40" />
        <line x1="32" y1="42" x2="32" y2="48" />
      </g>

      {/* 작은 별들 - 밤이 물러가는 모습 */}
      <g fill="#FFFFFF" opacity="0.4">
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="52" cy="16" r="1" />
        <circle cx="8" cy="20" r="1" />
        <circle cx="56" cy="36" r="1.5" />
      </g>

      {/* 히브리어 ב의 추상적 표현 */}
      <path
        d="M 8 54 L 8 60 L 16 60"
        stroke="#FFD700"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
};

export default BereshitIconColorful;
