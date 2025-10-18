interface VerseIndicatorProps {
  currentIndex: number;
  total: number;
  darkMode: boolean;
  maxDots?: number; // 최대 표시할 점 개수
}

export default function VerseIndicator({
  currentIndex,
  total,
  darkMode,
  maxDots = 5
}: VerseIndicatorProps) {
  // 점이 너무 많으면 현재 위치 주변만 표시
  const shouldShowSubset = total > maxDots;

  const getDots = () => {
    if (!shouldShowSubset) {
      return Array.from({ length: total }, (_, i) => i);
    }

    // 현재 위치 기준으로 앞뒤 표시
    const halfDots = Math.floor(maxDots / 2);
    let start = Math.max(0, currentIndex - halfDots);
    let end = Math.min(total - 1, currentIndex + halfDots);

    // 시작이나 끝에 가까우면 조정
    if (currentIndex < halfDots) {
      end = Math.min(total - 1, maxDots - 1);
    } else if (currentIndex > total - halfDots - 1) {
      start = Math.max(0, total - maxDots);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const dots = getDots();

  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {shouldShowSubset && dots[0] > 0 && (
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>...</span>
      )}

      {dots.map((index) => (
        <div
          key={index}
          className={`rounded-full transition-all ${
            index === currentIndex
              ? darkMode
                ? 'w-2 h-2 bg-purple-400'
                : 'w-2 h-2 bg-purple-600'
              : darkMode
                ? 'w-1.5 h-1.5 bg-gray-600'
                : 'w-1.5 h-1.5 bg-gray-300'
          }`}
        />
      ))}

      {shouldShowSubset && dots[dots.length - 1] < total - 1 && (
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>...</span>
      )}

      <span className={`text-xs ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
        {currentIndex + 1}/{total}
      </span>
    </div>
  );
}
