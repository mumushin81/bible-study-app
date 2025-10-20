import React from 'react';

interface BaraIconProps {
  size?: number;
  className?: string;
  color?: string;
}

const BaraIcon: React.FC<BaraIconProps> = ({ 
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
      {/* 하나님의 손 (창조의 시작) */}
      <path 
        d="M 8 20 Q 12 16 16 18 Q 20 16 24 20" 
        stroke={color} 
        strokeWidth="2.5" 
        fill="none"
        strokeLinecap="round"
      />
      
      {/* 손가락들 */}
      <g stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M 10 18 Q 9 15 10 12" />
        <path d="M 13 17 Q 12 14 13 11" />
        <path d="M 16 17 Q 15 14 16 10" />
        <path d="M 19 17 Q 18 14 19 11" />
        <path d="M 22 18 Q 21 15 22 12" />
      </g>
      
      {/* 무에서 유로 - 창조되는 별들/입자들 */}
      <g>
        {/* 큰 별 (완성된 창조물) */}
        <g stroke={color} strokeWidth="1.5" fill="none">
          <circle cx="16" cy="6" r="1.5" opacity="0.9" />
          <line x1="16" y1="3" x2="16" y2="4.5" opacity="0.9" />
          <line x1="16" y1="7.5" x2="16" y2="9" opacity="0.9" />
          <line x1="13.5" y1="6" x2="14.5" y2="6" opacity="0.9" />
          <line x1="17.5" y1="6" x2="18.5" y2="6" opacity="0.9" />
        </g>
        
        {/* 중간 별들 (창조 과정) */}
        <circle cx="12" cy="8" r="1" fill={color} opacity="0.6" />
        <circle cx="20" cy="8" r="1" fill={color} opacity="0.6" />
        <circle cx="8" cy="12" r="0.8" fill={color} opacity="0.4" />
        <circle cx="24" cy="12" r="0.8" fill={color} opacity="0.4" />
        
        {/* 작은 입자들 (창조의 시작) */}
        <circle cx="6" cy="14" r="0.5" fill={color} opacity="0.3" />
        <circle cx="26" cy="14" r="0.5" fill={color} opacity="0.3" />
        <circle cx="5" cy="10" r="0.3" fill={color} opacity="0.2" />
        <circle cx="27" cy="10" r="0.3" fill={color} opacity="0.2" />
      </g>
      
      {/* 창조의 에너지 흐름 */}
      <g stroke={color} strokeWidth="1" opacity="0.3" strokeDasharray="2,2">
        <path d="M 10 15 Q 16 8 22 15" />
        <path d="M 8 13 Q 16 6 24 13" />
      </g>
      
      {/* 히브리어 ב (bet) 형태 힌트 */}
      <path 
        d="M 2 25 L 2 30 L 6 30 M 2 27.5 L 5 27.5" 
        stroke={color} 
        strokeWidth="1" 
        opacity="0.2"
        strokeLinecap="round"
      />
      
      {/* 무한함을 상징하는 원호 */}
      <path 
        d="M 4 28 Q 16 32 28 28" 
        stroke={color} 
        strokeWidth="0.8" 
        fill="none"
        opacity="0.2"
      />
    </svg>
  );
};

export default BaraIcon;