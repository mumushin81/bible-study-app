import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Commentary } from '../../types';

interface ScriptureCardProps {
  commentary: Commentary;
  darkMode: boolean;
}

/**
 * ✝️ 말씀카드
 * 성경 구절의 깊이 있는 해설을 표시
 * - 서론 (intro)
 * - 색상 섹션들 (sections)
 * - 어린이 질문 (whyQuestion)
 * - 결론 (conclusion)
 */
export default function ScriptureCard({ commentary, darkMode }: ScriptureCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`rounded-3xl shadow-2xl p-8 mb-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/50 to-teal-900/30 border-2 border-emerald-400/30'
          : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-300'
      }`}
      data-testid="scripture-card"
    >
      {/* 카드 헤더 (접기 가능) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-200 ${
          darkMode
            ? 'hover:bg-emerald-800/30'
            : 'hover:bg-emerald-100/50'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${
            darkMode
              ? 'bg-gradient-to-br from-emerald-600/30 to-teal-600/30'
              : 'bg-gradient-to-br from-emerald-200 to-teal-200'
          }`}>
            <span className="text-4xl">✝️</span>
          </div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
            말씀카드
          </h3>
        </div>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={28} className={darkMode ? 'text-emerald-400' : 'text-emerald-600'} />
        </div>
      </button>

      {/* 카드 본문 */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 space-y-6"
        >
          {/* Intro */}
          {commentary.intro && (
            <p className={`text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {commentary.intro}
            </p>
          )}

          {/* Sections */}
          {commentary.sections?.map((section, index) => {
            const colorClasses = {
              purple: darkMode ? 'bg-purple-900/30 border-purple-500' : 'bg-purple-50 border-purple-400',
              blue: darkMode ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-400',
              green: darkMode ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-400',
              pink: darkMode ? 'bg-pink-900/30 border-pink-500' : 'bg-pink-50 border-pink-400',
              orange: darkMode ? 'bg-orange-900/30 border-orange-500' : 'bg-orange-50 border-orange-400',
              yellow: darkMode ? 'bg-yellow-900/30 border-yellow-500' : 'bg-yellow-50 border-yellow-400',
            };

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-5 rounded-xl border-l-4 ${colorClasses[section.color]}`}
              >
                <h4 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {section.emoji} {section.title}
                </h4>
                <p className={`text-sm mb-3 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {section.description}
                </p>
                <ul className="space-y-2">
                  {section.points.map((point, i) => (
                    <li key={i} className={`text-sm flex gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
              className={`p-5 rounded-2xl ${
                darkMode
                  ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-500/30'
                  : 'bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-300'
              }`}
            >
              <h4 className={`text-lg font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-pink-300' : 'text-pink-700'}`}>
                💭 어린이를 위한 질문
              </h4>
              <p className={`text-base font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Q: {commentary.whyQuestion.question}
              </p>
              <p className={`text-sm leading-relaxed mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                A: {commentary.whyQuestion.answer}
              </p>
              <div className={`pt-3 border-t ${darkMode ? 'border-pink-700/30' : 'border-pink-300'}`}>
                <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-pink-400' : 'text-pink-700'}`}>
                  📖 관련 성경 구절
                </p>
                <ul className="space-y-1">
                  {commentary.whyQuestion.bibleReferences.map((ref, i) => (
                    <li key={i} className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
              className={`p-5 rounded-2xl ${
                darkMode
                  ? 'bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30'
                  : 'bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-300'
              }`}
            >
              <h4 className={`text-lg font-bold mb-3 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                {commentary.conclusion.title}
              </h4>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {commentary.conclusion.content}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
