import React from 'react';

interface ElohimIconColorfulProps {
  size?: number;
  className?: string;
}

/**
 * אֱלֹהִים (엘로힘) - 하나님
 * 왕관과 신성한 빛을 표현하는 웅장한 아이콘
 */
const ElohimIconColorful: React.FC<ElohimIconColorfulProps> = ({
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
        {/* 왕관 그라디언트 - 금색 */}
        <linearGradient id="crownGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>

        {/* 삼각형 그라디언트 - 신성한 흰색/금색 */}
        <linearGradient id="trinityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FFE5B4" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>

        {/* 광채 그라디언트 */}
        <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>

        {/* 보석 그라디언트 */}
        <radialGradient id="gemGradient" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FF1493" />
          <stop offset="100%" stopColor="#8B008B" />
        </radialGradient>
      </defs>

      {/* 배경 신성한 광채 */}
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="url(#glowGradient)"
      />

      {/* 외부 광선 */}
      <g stroke="#FFD700" strokeWidth="2" strokeLinecap="round" opacity="0.6">
        <line x1="32" y1="4" x2="32" y2="12" />
        <line x1="48" y1="8" x2="44" y2="14" />
        <line x1="56" y1="20" x2="50" y2="24" />
        <line x1="60" y1="32" x2="52" y2="32" />
        <line x1="56" y1="44" x2="50" y2="40" />
        <line x1="48" y1="56" x2="44" y2="50" />
        <line x1="32" y1="60" x2="32" y2="52" />
        <line x1="16" y1="56" x2="20" y2="50" />
        <line x1="8" y1="44" x2="14" y2="40" />
        <line x1="4" y1="32" x2="12" y2="32" />
        <line x1="8" y1="20" x2="14" y2="24" />
        <line x1="16" y1="8" x2="20" y2="14" />
      </g>

      {/* 삼위일체 삼각형 (신성함) */}
      <path
        d="M 32 14 L 22 30 L 42 30 Z"
        fill="url(#trinityGradient)"
        stroke="#FFD700"
        strokeWidth="2"
        filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))"
      />

      {/* 전지전능의 눈 */}
      <ellipse
        cx="32"
        cy="24"
        rx="6"
        ry="4"
        fill="#FFFFFF"
        stroke="#FFD700"
        strokeWidth="1.5"
      />
      <circle
        cx="32"
        cy="24"
        r="2.5"
        fill="#4A148C"
      />
      <circle
        cx="31"
        cy="23"
        r="1"
        fill="#FFFFFF"
        opacity="0.8"
      />

      {/* 왕관 본체 */}
      <path
        d="M 12 48 L 16 36 L 22 40 L 32 28 L 42 40 L 48 36 L 52 48 Z"
        fill="url(#crownGradient)"
        stroke="#FF8C00"
        strokeWidth="2"
        strokeLinejoin="round"
        filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))"
      />

      {/* 왕관 밑단 (두껍게) */}
      <rect
        x="12"
        y="48"
        width="40"
        height="6"
        fill="url(#crownGradient)"
        stroke="#FF8C00"
        strokeWidth="1"
      />

      {/* 왕관의 보석들 */}
      <circle cx="32" cy="32" r="3" fill="url(#gemGradient)"
        filter="drop-shadow(0 0 4px rgba(255, 20, 147, 0.8))" />
      <circle cx="22" cy="38" r="2" fill="url(#gemGradient)"
        filter="drop-shadow(0 0 3px rgba(255, 20, 147, 0.6))" />
      <circle cx="42" cy="38" r="2" fill="url(#gemGradient)"
        filter="drop-shadow(0 0 3px rgba(255, 20, 147, 0.6))" />
      <circle cx="16" cy="44" r="1.5" fill="url(#gemGradient)" />
      <circle cx="48" cy="44" r="1.5" fill="url(#gemGradient)" />

      {/* 하이라이트 - 왕관 상단 */}
      <path
        d="M 14 48 L 16 44 L 20 46"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* 작은 별들 (신성함의 표시) */}
      <g fill="#FFFFFF" opacity="0.8">
        <path d="M 20 20 L 21 22 L 23 22 L 21.5 23.5 L 22 25 L 20 24 L 18 25 L 18.5 23.5 L 17 22 L 19 22 Z" />
        <path d="M 44 20 L 45 22 L 47 22 L 45.5 23.5 L 46 25 L 44 24 L 42 25 L 42.5 23.5 L 41 22 L 43 22 Z" />
      </g>
    </svg>
  );
};

export default ElohimIconColorful;
