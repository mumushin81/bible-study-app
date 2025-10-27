import { motion } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';
import { useRef } from 'react';
import { Word } from '../../types';
import { WordWithContext } from '../../hooks/useWords';
import HebrewIcon from './HebrewIcon';
import {
  getWordColor,
  getSimpleGrammar,
  speakHebrew,
} from '../../utils/wordHelpers';
import {
  getGrammarColorValues,
  getGrammarCardBackground,
  getGrammarGlowEffect
} from '../../utils/grammarColors';

interface FlashCardProps {
  word: Word | WordWithContext;
  darkMode: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  isBookmarked: boolean;
  onBookmark: () => void;
  reference: string;
  index?: number;
}

export default function FlashCard({
  word,
  darkMode,
  isFlipped,
  onFlip,
  isBookmarked,
  onBookmark,
  reference,
  index = 0,
}: FlashCardProps) {
  const colors = getWordColor(word, darkMode);
  const grammarColors = word.grammar ? getGrammarColorValues(word.grammar) : null;
  const lastTapRef = useRef<number>(0);

  // 더블 탭 핸들러
  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // 더블 탭 감지 (300ms 이내)
      onFlip();
      lastTapRef.current = 0; // 리셋
    } else {
      // 첫 번째 탭
      lastTapRef.current = now;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative cursor-pointer w-full max-w-md mx-auto"
      style={{ perspective: '1000px', aspectRatio: '9/16' }}
      onClick={handleDoubleTap}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 앞면 - 배경 이미지 + 그라디언트 오버레이 */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            isolation: 'isolate',
            transform: 'translateZ(0)',
          }}
        >
          {/* 배경 이미지 (전체 9:16) */}
          <div className="absolute inset-0 z-0">
            <HebrewIcon
              word={word.hebrew}
              iconUrl={word.iconUrl}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 상단 버튼들 */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 pointer-events-auto">
            {/* 품사 표시 (색상 적용) */}
            {word.grammar && grammarColors && (
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
                style={{
                  backgroundColor: `${grammarColors.bg}cc`,
                  color: grammarColors.text,
                  borderColor: `${grammarColors.border}80`
                }}
              >
                {getSimpleGrammar(word.grammar)}
              </div>
            )}

            {/* 북마크 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className="ml-auto p-2 rounded-full backdrop-blur-md bg-white/40 hover:bg-white/50 transition-all border border-gray-400/30"
            >
              <Star
                size={18}
                className={isBookmarked ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700 drop-shadow'}
              />
            </button>
          </div>

          {/* 하단 컨텐츠 영역 */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center justify-end px-4 py-6 pb-8 pointer-events-auto">
            {/* 히브리어 원문 */}
            <div
              className="text-2xl sm:text-3xl font-bold text-gray-800 drop-shadow-lg mb-2"
              dir="rtl"
              style={{ textShadow: '0 2px 8px rgba(255,255,255,0.8)' }}
            >
              {word.hebrew}
            </div>

            {/* IPA 발음 (중앙 정렬) */}
            <div
              className="text-lg sm:text-xl font-medium text-gray-800 drop-shadow-lg mb-2"
              style={{ textShadow: '0 2px 8px rgba(255,255,255,0.8)' }}
            >
              [{word.ipa}]
            </div>

            {/* 음성 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakHebrew(word.hebrew);
              }}
              className="p-2 rounded-lg bg-gray-800/20 hover:bg-gray-800/30 backdrop-blur-sm text-gray-800 transition-all border border-gray-800/30 mb-2"
              aria-label="발음 듣기"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* 탭 안내 */}
            <div className="text-xs text-gray-600" style={{ textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>
              더블 탭하여 뜻 보기
            </div>
          </div>
        </div>

        {/* 뒷면 - 배경 이미지 + 그라디언트 오버레이 */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(0)',
            isolation: 'isolate',
          }}
        >
          {/* 배경 이미지 (전체 9:16) */}
          <div className="absolute inset-0 z-0">
            <HebrewIcon
              word={word.hebrew}
              iconUrl={word.iconUrl}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 블러 효과 오버레이 (전체 - 유리 느낌) */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              background: 'linear-gradient(to top, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.3) 100%)',
            }}
          />

          {/* 상단 버튼들 */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 pointer-events-auto">
            {/* 품사 표시 (색상 적용) */}
            {word.grammar && grammarColors && (
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
                style={{
                  backgroundColor: `${grammarColors.bg}cc`,
                  color: grammarColors.text,
                  borderColor: `${grammarColors.border}80`
                }}
              >
                {getSimpleGrammar(word.grammar)}
              </div>
            )}

            {/* 북마크 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className="ml-auto p-2 rounded-full backdrop-blur-md bg-white/40 hover:bg-white/50 transition-all border border-gray-400/30"
            >
              <Star
                size={18}
                className={isBookmarked ? 'fill-yellow-500 text-yellow-500' : 'text-gray-700 drop-shadow'}
              />
            </button>
          </div>

          {/* 메인 컨텐츠 영역 */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-start gap-3 px-4 py-16 pb-8 overflow-y-auto pointer-events-auto">
            {/* 한국어 뜻 (가장 크게) */}
            <div className="w-full max-w-sm px-6 py-4 bg-blue-50/90 dark:bg-blue-900/30 border-2 border-blue-200/80 dark:border-blue-700/50 rounded-xl backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 text-center break-keep">
                {word.meaning}
              </div>
            </div>

            {/* 원문 단어 + 한국어 발음 */}
            <div className="w-full max-w-sm px-4 py-3 bg-purple-50/90 dark:bg-purple-900/30 border-2 border-purple-200/80 dark:border-purple-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                {/* 히브리어 원문 (중앙 정렬) */}
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 text-center" dir="rtl">
                  {word.hebrew}
                </div>
                {/* 한국어 발음 (중앙 정렬) */}
                <div className="text-lg font-medium text-purple-800 dark:text-purple-200 text-center">
                  {word.korean}
                </div>
                {/* 음성 버튼 (아래 정렬) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakHebrew(word.hebrew);
                  }}
                  className="p-1.5 rounded-lg bg-purple-200/50 hover:bg-purple-300/50 dark:bg-purple-700/50 dark:hover:bg-purple-600/50 text-purple-800 dark:text-purple-200 transition-all"
                  aria-label="발음 듣기"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 히브리어 읽기 */}
            {word.letters && (
              <div className="w-full max-w-sm px-4 py-3 bg-emerald-50/90 dark:bg-emerald-900/30 border border-emerald-200/80 dark:border-emerald-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2 text-center">
                  히브리어 읽기
                </div>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {word.letters.split(' + ').map((part, idx) => {
                    const match = part.match(/^(.+?)\((.+?)\)$/);
                    if (!match) return null;
                    const [, letter, pronunciation] = match;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-1" dir="rtl">
                          {letter}
                        </div>
                        <div className="w-px h-4 bg-emerald-400 dark:bg-emerald-600"></div>
                        <div className="text-sm sm:text-base font-medium text-emerald-700 dark:text-emerald-300 mt-1">
                          {pronunciation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 어근 (중앙 정렬) */}
            {word.root && (
              <div className="w-full max-w-sm px-4 py-4 bg-amber-50/90 dark:bg-amber-900/30 border-2 border-amber-200/80 dark:border-amber-700/50 rounded-xl backdrop-blur-sm">
                <div className="text-center mb-3">
                  <div className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-3">
                    🌱 어근 분석
                  </div>

                  {/* 어근 히브리어 읽기 시각화 */}
                  {(() => {
                    const hebrewRoot = word.root.split(' ')[0]; // "ב-ר-א" 추출

                    // 히브리어 글자 추출 (하이픈이 있으면 split, 없으면 자음만 추출)
                    let rootLetters: string[];
                    if (hebrewRoot.includes('-')) {
                      // "ב-ר-א" → ["ב", "ר", "א"]
                      rootLetters = hebrewRoot.split('-');
                    } else {
                      // "רֵאשִׁית" → 히브리어 자음만 추출 (모음 기호 제외)
                      // 히브리어 자음 범위: א-ת (U+05D0 - U+05EA)
                      rootLetters = hebrewRoot.split('').filter(char => {
                        const code = char.charCodeAt(0);
                        return code >= 0x05D0 && code <= 0x05EA;
                      });
                    }

                    const englishPronunciation = word.root.match(/\((.+?)\)/)?.[1] || '';

                    // 각 글자의 발음 (rootIpa 우선, 없으면 word.root 괄호 안 영어 발음 사용)
                    let letterPronunciations: string[] = [];
                    if (word.rootIpa) {
                      // IPA를 단순화하여 분할
                      const simplified = word.rootIpa.replace(/[ˈˌʰʔʕχ]/g, '');
                      const avgLen = Math.ceil(simplified.length / rootLetters.length);
                      letterPronunciations = rootLetters.map((_, idx) =>
                        simplified.slice(idx * avgLen, (idx + 1) * avgLen)
                      );
                    } else if (englishPronunciation) {
                      // 영어 발음을 균등 분할
                      const avgLen = Math.ceil(englishPronunciation.length / rootLetters.length);
                      letterPronunciations = rootLetters.map((_, idx) =>
                        englishPronunciation.slice(idx * avgLen, (idx + 1) * avgLen)
                      );
                    }

                    // 디버그 로그 (첫 번째 단어만)
                    if (index === 0) {
                      console.log('🔍 어근 분석 Debug:', {
                        hebrew: word.hebrew,
                        root: word.root,
                        hebrewRoot,
                        rootLetters,
                        englishPronunciation,
                        rootIpa: word.rootIpa,
                        letterPronunciations,
                        hasKorean: /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(word.root)
                      });
                    }

                    return (
                      <div className="flex justify-center gap-2 sm:gap-3">
                        {rootLetters.map((letter, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1" dir="rtl">
                              {letter}
                            </div>
                            <div className="w-px h-4 bg-amber-400 dark:bg-amber-600"></div>
                            {letterPronunciations[idx] && (
                              <div className="text-sm sm:text-base font-medium text-amber-700 dark:text-amber-300 mt-1">
                                {letterPronunciations[idx]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="border-t border-amber-300/50 dark:border-amber-600/50 pt-3 mt-3">
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 text-center">
                    💡 어근의 핵심 의미
                  </div>
                  <div className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed text-center whitespace-pre-wrap">
                    {'rootEtymology' in word && word.rootEtymology ? (
                      // etymology_simple 우선 사용, 없으면 story 사용
                      word.rootEtymology.etymology_simple || word.rootEtymology.story
                    ) : (
                      '히브리어의 대부분의 단어는 3개의 자음으로 이루어진 어근에서 파생됩니다. 이 어근을 이해하면 관련된 다른 단어들의 의미도 쉽게 유추할 수 있습니다.'
                    )}
                  </div>
                </div>

                {/* 어근 활용 예시 - 파생어 표시 */}
                {'rootEtymology' in word && word.rootEtymology?.derivatives && word.rootEtymology.derivatives.length > 0 && (
                  <div className="border-t border-amber-300/50 dark:border-amber-600/50 pt-3 mt-3">
                    <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 text-center">
                      📖 어근 활용 예시
                    </div>
                    <div className="space-y-2">
                      {word.rootEtymology.derivatives.slice(0, 5).map((derivative, idx) => (
                        <div key={`${derivative.hebrew}-${idx}`} className="text-sm text-amber-800 dark:text-amber-200">
                          <div className="flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-400 font-bold min-w-[20px]">{idx + 1}.</span>
                            <div className="flex-1">
                              <span className="font-bold text-base" dir="rtl">{derivative.hebrew}</span>
                              <span className="mx-2">({derivative.korean})</span>
                              <div className="text-xs mt-0.5">→ {derivative.meaning}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}


            {/* 구절 출처 (하단) */}
            <div className="mt-auto px-4 py-2 text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
              📖 {reference}
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
