import { memo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Commentary } from '../../types';
import { BaseCard } from '../shared/BaseCard';
import { getSectionColorClasses, getSectionTextColor, SectionColor } from '../../utils/cardStyles';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface ScriptureCardProps {
  commentary: Commentary;
  darkMode: boolean;
}

/**
 * ✝️ 말씀카드 (리팩토링)
 * 성경 구절의 깊이 있는 해설을 표시
 * - 서론 (intro)
 * - 색상 섹션들 (sections)
 * - 어린이 질문 (whyQuestion)
 * - 결론 (conclusion)
 */
export default memo(function ScriptureCard({ commentary, darkMode }: ScriptureCardProps) {
  const [isOpen, setIsOpen] = useLocalStorage('scriptureCardOpen', true);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, [setIsOpen]);

  return (
    <BaseCard colorScheme="emerald" testId="scripture-card">
      {/* 카드 헤더 (접기 가능) */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-200 hover:bg-emerald-100/50 dark:hover:bg-emerald-800/30"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-600/30 dark:to-teal-600/30">
            <span className="text-4xl">✝️</span>
          </div>
          <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            말씀카드
          </h3>
        </div>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={28} className="text-emerald-600 dark:text-emerald-400" />
        </div>
      </button>

      {/* 카드 본문 */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mt-4 space-y-6 overflow-hidden"
        >
          {/* Intro */}
          {commentary.intro && (
            <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
              {commentary.intro}
            </p>
          )}

          {/* Sections */}
          {commentary.sections?.map((section, index) => {
            const colorClasses = getSectionColorClasses(section.color as SectionColor);
            const textColor = getSectionTextColor(section.color as SectionColor);

            return (
              <motion.div
                key={`section-${index}-${section.title}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-5 rounded-xl border-l-4 ${colorClasses}`}
              >
                <h4 className={`text-lg font-bold mb-3 text-gray-900 dark:text-white`}>
                  {section.emoji} {section.title}
                </h4>
                <p className={`text-sm mb-3 leading-relaxed text-gray-700 dark:text-gray-300`}>
                  {section.description}
                </p>
                <ul className="space-y-2">
                  {section.points.map((point, i) => (
                    <li
                      key={`point-${index}-${i}-${point.substring(0, 10)}`}
                      className={`text-sm flex gap-2 text-gray-600 dark:text-gray-400`}
                    >
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}

          {/* Why Question for Children */}
          {commentary.whyQuestion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-300 dark:from-pink-900/40 dark:to-purple-900/40 dark:border-pink-500/30"
            >
              <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
                💭 어린이를 위한 질문
              </h4>
              <p className="text-base font-semibold mb-3 text-gray-900 dark:text-white">
                Q: {commentary.whyQuestion.question}
              </p>
              <p className="text-sm leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
                A: {commentary.whyQuestion.answer}
              </p>
              <div className="pt-3 border-t border-pink-300 dark:border-pink-700/30">
                <p className="text-xs font-semibold mb-2 text-pink-700 dark:text-pink-400">
                  📖 관련 성경 구절
                </p>
                <ul className="space-y-1">
                  {commentary.whyQuestion.bibleReferences.map((ref, i) => (
                    <li
                      key={`ref-${i}-${ref.substring(0, 10)}`}
                      className="text-xs text-gray-600 dark:text-gray-400"
                    >
                      • {ref}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* Conclusion */}
          {commentary.conclusion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-300 dark:from-indigo-900/40 dark:to-blue-900/40 dark:border-indigo-500/30"
            >
              <h4 className="text-lg font-bold mb-3 text-indigo-700 dark:text-indigo-300">
                {commentary.conclusion.title}
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {commentary.conclusion.content}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </BaseCard>
  );
});
