import { useState } from 'react';
import { Volume2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Verse } from '../types';

interface StudyTabProps {
  verse: Verse;
  darkMode: boolean;
  onMarkStudied: () => void;
  studied: boolean;
}

export default function StudyTab({ verse, darkMode, onMarkStudied, studied }: StudyTabProps) {
  const [openDictionary, setOpenDictionary] = useState(false);
  const [openCommentary, setOpenCommentary] = useState(false);
  const [expandedWord, setExpandedWord] = useState<number | null>(null);

  const speak = (text: string, lang: string = 'he-IL') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{verse.reference}</h2>
        {studied && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span className="text-sm font-medium">학습 완료</span>
          </div>
        )}
      </div>

      {/* 히브리어 원문 카드 */}
      <div className={`rounded-3xl shadow-xl p-8 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-600">히브리어 원문</h3>
          <button
            onClick={() => speak(verse.hebrew)}
            className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
            title="음성 재생"
          >
            <Volume2 size={20} className="text-purple-600" />
          </button>
        </div>
        <p
          dir="rtl"
          className="text-3xl font-hebrew leading-relaxed"
          style={{ fontFamily: 'David, serif' }}
        >
          {verse.hebrew}
        </p>
      </div>

      {/* IPA 발음 카드 */}
      {verse.ipa && (
        <div className={`rounded-3xl shadow-xl p-8 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
          <h3 className="text-lg font-semibold text-blue-600 mb-4">IPA 표기</h3>
          <p className="text-2xl font-mono text-blue-800 dark:text-blue-300">
            {verse.ipa}
          </p>
        </div>
      )}

      {/* 한글 발음 카드 */}
      {verse.koreanPronunciation && (
        <div className={`rounded-3xl shadow-xl p-8 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-pink-50 to-pink-100'}`}>
          <h3 className="text-lg font-semibold text-pink-600 mb-4">한글 발음</h3>
          <p className="text-2xl text-pink-800 dark:text-pink-300">
            {verse.koreanPronunciation}
          </p>
        </div>
      )}

      {/* 현대어 번역 카드 */}
      {verse.modern && (
        <div className={`rounded-3xl shadow-xl p-8 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'}`}>
          <h3 className="text-lg font-semibold text-yellow-700 mb-4">현대어 번역</h3>
          <p className="text-xl text-yellow-900 dark:text-yellow-200 leading-relaxed">
            {verse.modern}
          </p>
        </div>
      )}

      {/* 단어 사전 아코디언 */}
      {verse.words && verse.words.length > 0 && (
        <div className={`rounded-3xl shadow-xl p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button
            onClick={() => setOpenDictionary(!openDictionary)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <h3 className="text-xl font-bold text-indigo-600">단어 사전</h3>
            {openDictionary ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {openDictionary && (
            <div className="mt-4 space-y-4">
              {verse.words.map((word, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-indigo-50 to-indigo-100'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          dir="rtl"
                          className="text-3xl font-hebrew"
                          style={{ fontFamily: 'David, serif' }}
                        >
                          {word.hebrew}
                        </span>
                        <button
                          onClick={() => speak(word.hebrew)}
                          className="p-2 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                        >
                          <Volume2 size={16} className="text-indigo-600" />
                        </button>
                      </div>
                      <p className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">
                        {word.meaning}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedWord(expandedWord === index ? null : index)}
                      className="p-2 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition-colors"
                    >
                      {expandedWord === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>

                  {expandedWord === index && (
                    <div className="space-y-3 pt-4 border-t border-indigo-200 dark:border-indigo-700">
                      <div>
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">IPA:</span>
                        <span className="ml-2 font-mono text-indigo-900 dark:text-indigo-100">{word.ipa}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">한글 발음:</span>
                        <span className="ml-2 text-indigo-900 dark:text-indigo-100">{word.korean}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">어근:</span>
                        <span className="ml-2 text-indigo-900 dark:text-indigo-100">{word.root}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">문법:</span>
                        <span className="ml-2 text-indigo-900 dark:text-indigo-100">{word.grammar}</span>
                      </div>
                      {word.structure && (
                        <div>
                          <span className="font-semibold text-indigo-700 dark:text-indigo-300">구조:</span>
                          <span className="ml-2 text-indigo-900 dark:text-indigo-100">{word.structure}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 깊이 읽기 아코디언 */}
      {verse.commentary && (
        <div className={`rounded-3xl shadow-xl p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button
            onClick={() => setOpenCommentary(!openCommentary)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <h3 className="text-xl font-bold text-emerald-600">깊이 읽기</h3>
            {openCommentary ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {openCommentary && (
            <div className="mt-4 prose dark:prose-invert max-w-none">
              <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-emerald-50 to-emerald-100'}`}>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                  {verse.commentary}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 학습 완료 버튼 */}
      {!studied && (
        <button
          onClick={onMarkStudied}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          학습 완료로 표시
        </button>
      )}
    </div>
  );
}
