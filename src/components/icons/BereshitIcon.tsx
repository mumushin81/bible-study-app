import React from 'react';

interface BereshitIconProps {
  size?: number;
  className?: string;
  color?: string;
}

const BereshitIcon: React.FC<BereshitIconProps> = ({ 
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
      {/* 지평선 */}
      <line 
        x1="2" 
        y1="20" 
        x2="30" 
        y2="20" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      
      {/* 태양 - 시간의 시작을 상징 */}
      <circle 
        cx="16" 
        cy="12" 
        r="6" 
        stroke={color} 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* 태양 광선 */}
      <g stroke={color} strokeWidth="2" strokeLinecap="round">
        <line x1="16" y1="2" x2="16" y2="4" />
        <line x1="23.5" y1="4.5" x2="22.5" y2="5.5" />
        <line x1="27" y1="12" x2="25" y2="12" />
        <line x1="23.5" y1="19.5" x2="22.5" y2="18.5" />
        <line x1="8.5" y1="4.5" x2="9.5" y2="5.5" />
        <line x1="5" y1="12" x2="7" y2="12" />
        <line x1="8.5" y1="19.5" x2="9.5" y2="18.5" />
      </g>
      
      {/* 시간을 나타내는 미세한 원호 */}
      <path 
        d="M 10 25 Q 16 27 22 25" 
        stroke={color} 
        strokeWidth="1" 
        fill="none" 
        strokeDasharray="2,2"
        opacity="0.6"
      />
      
      {/* 히브리어 문자의 추상적 표현 - ב의 형태 힌트 */}
      <path 
        d="M 4 26 L 4 30 L 8 30" 
        stroke={color} 
        strokeWidth="1.5" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        opacity="0.4"
      />
    </svg>
  );
};

export default BereshitIcon;