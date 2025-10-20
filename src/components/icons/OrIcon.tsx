import React from 'react';

interface OrIconProps {
  size?: number;
  className?: string;
  color?: string;
}

const OrIcon: React.FC<OrIconProps> = ({ 
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
      {/* 중심의 빛 핵심 */}
      <circle 
        cx="16" 
        cy="16" 
        r="4" 
        stroke={color} 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* 내부의 작은 빛 */}
      <circle 
        cx="16" 
        cy="16" 
        r="1.5" 
        fill={color}
        opacity="0.8"
      />
      
      {/* 주요 광선 8방향 */}
      <g stroke={color} strokeWidth="2.5" strokeLinecap="round">
        {/* 수직/수평 */}
        <line x1="16" y1="4" x2="16" y2="8" />
        <line x1="16" y1="24" x2="16" y2="28" />
        <line x1="4" y1="16" x2="8" y2="16" />
        <line x1="24" y1="16" x2="28" y2="16" />
        
        {/* 대각선 */}
        <line x1="6.8" y1="6.8" x2="9.2" y2="9.2" />
        <line x1="22.8" y1="22.8" x2="25.2" y2="25.2" />
        <line x1="25.2" y1="6.8" x2="22.8" y2="9.2" />
        <line x1="9.2" y1="22.8" x2="6.8" y2="25.2" />
      </g>
      
      {/* 보조 광선들 (더 얇고 짧게) */}
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
        <line x1="16" y1="6" x2="16" y2="7" />
        <line x1="16" y1="25" x2="16" y2="26" />
        <line x1="6" y1="16" x2="7" y2="16" />
        <line x1="25" y1="16" x2="26" y2="16" />
        
        <line x1="8.5" y1="8.5" x2="9" y2="9" />
        <line x1="23" y1="23" x2="23.5" y2="23.5" />
        <line x1="23.5" y1="8.5" x2="23" y2="9" />
        <line x1="9" y1="23" x2="8.5" y2="23.5" />
      </g>
      
      {/* 빛의 파동 (동심원) */}
      <g stroke={color} strokeWidth="1" fill="none" opacity="0.3">
        <circle cx="16" cy="16" r="6" />
        <circle cx="16" cy="16" r="8" strokeDasharray="3,2" />
        <circle cx="16" cy="16" r="10" strokeDasharray="2,3" />
      </g>
      
      {/* 어둠을 뚫고 나오는 빛의 역동성 */}
      <g stroke={color} strokeWidth="0.8" opacity="0.2">
        <path d="M 2 2 Q 16 16 30 2" fill="none" />
        <path d="M 2 30 Q 16 16 30 30" fill="none" />
        <path d="M 2 16 Q 8 12 16 16 Q 24 20 30 16" fill="none" />
      </g>
      
      {/* 히브리어 א (alef) 형태 힌트 */}
      <g stroke={color} strokeWidth="0.8" opacity="0.15">
        <path d="M 1 28 L 3 24" strokeLinecap="round" />
        <path d="M 2 26 L 4 26" strokeLinecap="round" />
        <path d="M 3 28 L 5 24" strokeLinecap="round" />
      </g>
      
      {/* 생명을 주는 빛의 온기 (미묘한 그라데이션 느낌) */}
      <circle 
        cx="16" 
        cy="16" 
        r="2.5" 
        fill={color}
        opacity="0.1"
      />
    </svg>
  );
};

export default OrIcon;