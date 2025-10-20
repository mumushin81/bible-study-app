import React from 'react';

interface ElohimIconProps {
  size?: number;
  className?: string;
  color?: string;
}

const ElohimIcon: React.FC<ElohimIconProps> = ({ 
  size = 32, 
  className = '', 
  color = 'currentColor' 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 왕관의 기본 형태 */}
      <path 
        d="M 6 22 L 8 16 L 12 18 L 16 12 L 20 18 L 24 16 L 26 22 Z" 
        stroke={color} 
        strokeWidth="2" 
        fill="none"
        strokeLinejoin="round"
      />
      
      {/* 왕관 밑단 */}
      <line 
        x1="6" 
        y1="22" 
        x2="26" 
        y2="22" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      {/* 삼위일체를 상징하는 삼각형 */}
      <path 
        d="M 16 6 L 12 14 L 20 14 Z" 
        stroke={color} 
        strokeWidth="1.5" 
        fill="none"
        strokeLinejoin="round"
      />
      
      {/* 전지전능의 눈 (삼각형 내부) */}
      <circle 
        cx="16" 
        cy="11" 
        r="2" 
        stroke={color} 
        strokeWidth="1" 
        fill="none"
      />
      <circle 
        cx="16" 
        cy="11" 
        r="0.8" 
        fill={color}
        opacity="0.6"
      />
      
      {/* 왕관의 보석들 (하나님의 완전함) */}
      <circle cx="16" cy="15" r="1.5" fill={color} opacity="0.4" />
      <circle cx="11" cy="17" r="1" fill={color} opacity="0.3" />
      <circle cx="21" cy="17" r="1" fill={color} opacity="0.3" />
      
      {/* 신성함을 나타내는 광채 */}
      <g stroke={color} strokeWidth="1" opacity="0.3">
        <line x1="16" y1="2" x2="16" y2="5" />
        <line x1="22" y1="4" x2="21" y2="6" />
        <line x1="25" y1="10" x2="22" y2="9" />
        <line x1="10" y1="4" x2="11" y2="6" />
        <line x1="7" y1="10" x2="10" y2="9" />
      </g>
      
      {/* 히브리어 ם (mem) 형태의 미묘한 힌트 */}
      <path 
        d="M 3 26 Q 5 28 7 26" 
        stroke={color} 
        strokeWidth="1" 
        fill="none"
        opacity="0.2"
      />
    </svg>
  );
};

export default ElohimIcon;