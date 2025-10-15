import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import { bibleBooks, getBooksByCategory, BookInfo } from '../data/bibleBooks';

interface BookSelectionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (bookId: string, chapter: number) => void;
  darkMode: boolean;
  currentBookId?: string;
  currentChapter?: number;
}

export default function BookSelectionBottomSheet({
  isOpen,
  onClose,
  onSelectBook,
  darkMode,
  currentBookId,
  currentChapter,
}: BookSelectionBottomSheetProps) {
  const [testament, setTestament] = useState<'old' | 'new'>('old');
  const [selectedBook, setSelectedBook] = useState<BookInfo | null>(null);

  const handleBookClick = (book: BookInfo) => {
    setSelectedBook(book);
  };

  const handleChapterClick = (chapter: number) => {
    if (selectedBook) {
      onSelectBook(selectedBook.id, chapter);
      setSelectedBook(null);
      onClose();
    }
  };

  const handleBack = () => {
    setSelectedBook(null);
  };

  const booksByCategory = getBooksByCategory(testament);

  // 빠른 이동 버튼 생성 (10장 단위)
  const getQuickJumpButtons = (totalChapters: number) => {
    if (totalChapters <= 10) return [];
    const buttons = [];
    for (let i = 1; i <= totalChapters; i += 10) {
      const end = Math.min(i + 9, totalChapters);
      buttons.push({ start: i, end });
    }
    return buttons;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col ${
              darkMode
                ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'
                : 'bg-gradient-to-br from-white via-purple-50 to-pink-50'
            }`}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className={`w-12 h-1.5 rounded-full ${
                  darkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              {selectedBook ? (
                <button
                  onClick={handleBack}
                  className={`flex items-center gap-2 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-semibold">뒤로</span>
                </button>
              ) : (
                <h2
                  className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  📖 성경 선택
                </h2>
              )}
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-all hover:scale-110 ${
                  darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                }`}
              >
                <X className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!selectedBook ? (
                <>
                  {/* Testament Tabs */}
                  <div
                    className={`flex gap-2 mb-6 p-1 rounded-xl ${
                      darkMode ? 'bg-gray-800/50' : 'bg-gray-100'
                    }`}
                  >
                    <button
                      onClick={() => setTestament('old')}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                        testament === 'old'
                          ? darkMode
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-white text-purple-600 shadow-md'
                          : darkMode
                            ? 'text-gray-400'
                            : 'text-gray-600'
                      }`}
                    >
                      구약 (39권)
                    </button>
                    <button
                      onClick={() => setTestament('new')}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                        testament === 'new'
                          ? darkMode
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-white text-purple-600 shadow-md'
                          : darkMode
                            ? 'text-gray-400'
                            : 'text-gray-600'
                      }`}
                    >
                      신약 (27권)
                    </button>
                  </div>

                  {/* Book Categories */}
                  <div className="space-y-6">
                    {Array.from(booksByCategory.entries()).map(([category, books]) => (
                      <div key={category}>
                        <h3
                          className={`text-sm font-bold mb-3 flex items-center gap-2 ${
                            darkMode ? 'text-purple-300' : 'text-purple-700'
                          }`}
                        >
                          <span>{books[0].categoryEmoji}</span>
                          <span>{category}</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {books.map((book) => (
                            <button
                              key={book.id}
                              onClick={() => handleBookClick(book)}
                              className={`p-3 rounded-xl text-left transition-all hover:scale-105 active:scale-95 ${
                                currentBookId === book.id
                                  ? darkMode
                                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg'
                                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                                  : darkMode
                                    ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white'
                                    : 'bg-white hover:bg-purple-50 text-gray-900 border border-gray-200'
                              }`}
                            >
                              <div className="font-bold text-sm mb-1">{book.name}</div>
                              <div
                                className={`text-xs ${
                                  currentBookId === book.id
                                    ? 'text-white/80'
                                    : darkMode
                                      ? 'text-gray-400'
                                      : 'text-gray-500'
                                }`}
                              >
                                {book.totalChapters}장
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Chapter Selection */}
                  <h3
                    className={`text-lg font-bold mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {selectedBook.name} ({selectedBook.totalChapters}장)
                  </h3>

                  {/* Quick Jump Buttons */}
                  {getQuickJumpButtons(selectedBook.totalChapters).length > 0 && (
                    <div className="mb-4">
                      <p
                        className={`text-xs font-semibold mb-2 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        💡 빠른 이동:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getQuickJumpButtons(selectedBook.totalChapters).map((range) => (
                          <button
                            key={range.start}
                            onClick={() => {
                              const element = document.getElementById(`chapter-${range.start}`);
                              element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              darkMode
                                ? 'bg-purple-800/50 hover:bg-purple-700/50 text-purple-300'
                                : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                            }`}
                          >
                            {range.start}-{range.end}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chapter Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: selectedBook.totalChapters }, (_, i) => i + 1).map(
                      (chapter) => (
                        <button
                          key={chapter}
                          id={`chapter-${chapter}`}
                          onClick={() => handleChapterClick(chapter)}
                          className={`aspect-square rounded-xl font-bold transition-all hover:scale-110 active:scale-95 ${
                            currentBookId === selectedBook.id && currentChapter === chapter
                              ? darkMode
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                                : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                              : darkMode
                                ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white'
                                : 'bg-white hover:bg-purple-100 text-gray-900 border border-gray-200'
                          }`}
                        >
                          {chapter}
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
