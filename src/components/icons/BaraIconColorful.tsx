import React from 'react';

interface BaraIconColorfulProps {
  size?: number;
  className?: string;
}

/**
 * בָּרָא (바라) - 창조하다
 * 폭발하는 별과 우주의 창조를 표현하는 웅장한 아이콘
 */
const BaraIconColorful: React.FC<BaraIconColorfulProps> = ({
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
        {/* 중앙 폭발 그라디언트 */}
        <radialGradient id="explosionGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FFD700" />
          <stop offset="60%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#8B008B" />
        </radialGradient>

        {/* 별 그라디언트 - 보라/파랑 */}
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9C27B0" />
          <stop offset="50%" stopColor="#3F51B5" />
          <stop offset="100%" stopColor="#00BCD4" />
        </linearGradient>

        {/* 우주 먼지 */}
        <radialGradient id="dustGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#9C27B0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 우주 배경 */}
      <rect width="64" height="64" fill="#0A0A2E" rx="8" />

      {/* 우주 먼지 구름들 */}
      <circle cx="20" cy="20" r="12" fill="url(#dustGradient)" opacity="0.6" />
      <circle cx="44" cy="44" r="15" fill="url(#dustGradient)" opacity="0.5" />
      <circle cx="50" cy="20" r="10" fill="url(#dustGradient)" opacity="0.4" />

      {/* 중앙 창조의 폭발 */}
      <circle
        cx="32"
        cy="32"
        r="14"
        fill="url(#explosionGradient)"
        filter="drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))"
      />

      {/* 폭발 파동 */}
      <circle
        cx="32"
        cy="32"
        r="18"
        stroke="#FFD700"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <circle
        cx="32"
        cy="32"
        r="22"
        stroke="#FF6B35"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      <circle
        cx="32"
        cy="32"
        r="26"
        stroke="#8B008B"
        strokeWidth="1"
        fill="none"
        opacity="0.2"
      />

      {/* 창조의 광선 (8방향) */}
      <g stroke="#FFD700" strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <line x1="32" y1="32" x2="32" y2="8" />
        <line x1="32" y1="32" x2="50" y2="14" />
        <line x1="32" y1="32" x2="56" y2="32" />
        <line x1="32" y1="32" x2="50" y2="50" />
        <line x1="32" y1="32" x2="32" y2="56" />
        <line x1="32" y1="32" x2="14" y2="50" />
        <line x1="32" y1="32" x2="8" y2="32" />
        <line x1="32" y1="32" x2="14" y2="14" />
      </g>

      {/* 새롭게 창조되는 별들 */}
      <g fill="url(#starGradient)">
        {/* 큰 별들 */}
        <path d="M 16 12 L 17 14 L 19 14 L 17.5 15.5 L 18 17 L 16 16 L 14 17 L 14.5 15.5 L 13 14 L 15 14 Z"
          filter="drop-shadow(0 0 4px rgba(156, 39, 176, 0.8))" />
        <path d="M 48 52 L 49 54 L 51 54 L 49.5 55.5 L 50 57 L 48 56 L 46 57 L 46.5 55.5 L 45 54 L 47 54 Z"
          filter="drop-shadow(0 0 4px rgba(63, 81, 181, 0.8))" />
        <path d="M 52 8 L 53 10 L 55 10 L 53.5 11.5 L 54 13 L 52 12 L 50 13 L 50.5 11.5 L 49 10 L 51 10 Z"
          filter="drop-shadow(0 0 4px rgba(0, 188, 212, 0.8))" />
      </g>

      {/* 작은 반짝이는 별들 */}
      <g fill="#FFFFFF">
        <circle cx="10" cy="10" r="1.5" opacity="0.8" />
        <circle cx="54" cy="10" r="1" opacity="0.7" />
        <circle cx="58" cy="24" r="1.5" opacity="0.9" />
        <circle cx="56" cy="48" r="1" opacity="0.6" />
        <circle cx="12" cy="52" r="1.5" opacity="0.8" />
        <circle cx="8" cy="40" r="1" opacity="0.7" />
        <circle cx="6" cy="24" r="1.5" opacity="0.6" />
      </g>

      {/* 에너지 입자들 */}
      <g fill="#FFD700" opacity="0.6">
        <circle cx="24" cy="24" r="1" />
        <circle cx="40" cy="24" r="1.5" />
        <circle cx="40" cy="40" r="1" />
        <circle cx="24" cy="40" r="1.5" />
      </g>

      {/* 중앙 빛나는 코어 */}
      <circle
        cx="32"
        cy="32"
        r="6"
        fill="#FFFFFF"
        opacity="0.9"
        filter="drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))"
      />

      {/* 하이라이트 */}
      <circle
        cx="30"
        cy="30"
        r="3"
        fill="#FFFFFF"
        opacity="0.6"
      />

      {/* 나선 은하 형태 */}
      <path
        d="M 32 20 Q 42 24 40 32 Q 38 40 32 44 Q 26 40 24 32 Q 22 24 32 20"
        stroke="#00BCD4"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
        strokeDasharray="4,2"
      />
    </svg>
  );
};

export default BaraIconColorful;
