// 성경 66권 데이터 구조

export interface BookInfo {
  id: string;
  name: string;
  englishName: string;
  totalChapters: number;
  testament: 'old' | 'new';
  category: string;
  categoryEmoji: string;
}

export const bibleBooks: BookInfo[] = [
  // ============ 구약 39권 ============

  // 📚 모세오경 (5권)
  { id: 'genesis', name: '창세기', englishName: 'Genesis', totalChapters: 50, testament: 'old', category: '모세오경', categoryEmoji: '📚' },
  { id: 'exodus', name: '출애굽기', englishName: 'Exodus', totalChapters: 40, testament: 'old', category: '모세오경', categoryEmoji: '📚' },
  { id: 'leviticus', name: '레위기', englishName: 'Leviticus', totalChapters: 27, testament: 'old', category: '모세오경', categoryEmoji: '📚' },
  { id: 'numbers', name: '민수기', englishName: 'Numbers', totalChapters: 36, testament: 'old', category: '모세오경', categoryEmoji: '📚' },
  { id: 'deuteronomy', name: '신명기', englishName: 'Deuteronomy', totalChapters: 34, testament: 'old', category: '모세오경', categoryEmoji: '📚' },

  // ⚖️ 역사서 (12권)
  { id: 'joshua', name: '여호수아', englishName: 'Joshua', totalChapters: 24, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },
  { id: 'judges', name: '사사기', englishName: 'Judges', totalChapters: 21, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },
  { id: 'ruth', name: '룻기', englishName: 'Ruth', totalChapters: 4, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },
  { id: '1samuel', name: '사무엘상', englishName: '1 Samuel', totalChapters: 31, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },
  { id: '2samuel', name: '사무엘하', englishName: '2 Samuel', totalChapters: 24, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },
  { id: '1kings', name: '열왕기상', englishName: '1 Kings', totalChapters: 22, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },
  { id: '2kings', name: '열왕기하', englishName: '2 Kings', totalChapters: 25, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },
  { id: '1chronicles', name: '역대상', englishName: '1 Chronicles', totalChapters: 29, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },
  { id: '2chronicles', name: '역대하', englishName: '2 Chronicles', totalChapters: 36, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },
  { id: 'ezra', name: '에스라', englishName: 'Ezra', totalChapters: 10, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },
  { id: 'nehemiah', name: '느헤미야', englishName: 'Nehemiah', totalChapters: 13, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },
  { id: 'esther', name: '에스더', englishName: 'Esther', totalChapters: 10, testament: 'old', category: '역사서', categoryEmoji: '⚖️' },

  // 📖 시가서 (5권)
  { id: 'job', name: '욥기', englishName: 'Job', totalChapters: 42, testament: 'old', category: '시가서', categoryEmoji: '📖' },
  { id: 'psalms', name: '시편', englishName: 'Psalms', totalChapters: 150, testament: 'old', category: '시가서', categoryEmoji: '📖' },
  { id: 'proverbs', name: '잠언', englishName: 'Proverbs', totalChapters: 31, testament: 'old', category: '시가서', categoryEmoji: '📖' },
  { id: 'ecclesiastes', name: '전도서', englishName: 'Ecclesiastes', totalChapters: 12, testament: 'old', category: '시가서', categoryEmoji: '📖' },
  { id: 'songofsolomon', name: '아가', englishName: 'Song of Solomon', totalChapters: 8, testament: 'old', category: '시가서', categoryEmoji: '📖' },

  // 📯 대선지서 (5권)
  { id: 'isaiah', name: '이사야', englishName: 'Isaiah', totalChapters: 66, testament: 'old', category: '대선지서', categoryEmoji: '📯' },
  { id: 'jeremiah', name: '예레미야', englishName: 'Jeremiah', totalChapters: 52, testament: 'old', category: '대선지서', categoryEmoji: '📯' },
  { id: 'lamentations', name: '애가', englishName: 'Lamentations', totalChapters: 5, testament: 'old', category: '대선지서', categoryEmoji: '📯' },
  { id: 'ezekiel', name: '에스겔', englishName: 'Ezekiel', totalChapters: 48, testament: 'old', category: '대선지서', categoryEmoji: '📯' },
  { id: 'daniel', name: '다니엘', englishName: 'Daniel', totalChapters: 12, testament: 'old', category: '대선지서', categoryEmoji: '📯' },

  // 📜 소선지서 (12권)
  { id: 'hosea', name: '호세아', englishName: 'Hosea', totalChapters: 14, testament: 'old', category: '소선지서', categoryEmoji: '📜' },
  { id: 'joel', name: '요엘', englishName: 'Joel', totalChapters: 3, testament: 'old', category: '소선지서', categoryEmoji: '📜' },
  { id: 'amos', name: '아모스', englishName: 'Amos', totalChapters: 9, testament: 'old', category: '소선지서', categoryEmoji: '📜' },
  { id: 'obadiah', name: '오바댜', englishName: 'Obadiah', totalChapters: 1, testament: 'old', category: '소선지서', categoryEmoji: '📜' },
  { id: 'jonah', name: '요나', englishName: 'Jonah', totalChapters: 4, testament: 'old', category: '소선지서', categoryEmoji: '📜' },
  { id: 'micah', name: '미가', englishName: 'Micah', totalChapters: 7, testament: 'old', category: '소선지서', categoryEmoji: '📜' },
  { id: 'nahum', name: '나훔', englishName: 'Nahum', totalChapters: 3, testament: 'old', category: '소선지서', categoryEmoji: '📜' },
  { id: 'habakkuk', name: '하박국', englishName: 'Habakkuk', totalChapters: 3, testament: 'old', category: '소선지서', categoryEmoji: '📜' },
  { id: 'zephaniah', name: '스바냐', englishName: 'Zephaniah', totalChapters: 3, testament: 'old', category: '소선지서', categoryEmoji: '📜' },
  { id: 'haggai', name: '학개', englishName: 'Haggai', totalChapters: 2, testament: 'old', category: '소선지서', categoryEmoji: '📜' },
  { id: 'zechariah', name: '스가랴', englishName: 'Zechariah', totalChapters: 14, testament: 'old', category: '소선지서', categoryEmoji: '📜' },
  { id: 'malachi', name: '말라기', englishName: 'Malachi', totalChapters: 4, testament: 'old', category: '소선지서', categoryEmoji: '📜' },

  // ============ 신약 27권 ============

  // ✝️ 복음서 (4권)
  { id: 'matthew', name: '마태복음', englishName: 'Matthew', totalChapters: 28, testament: 'new', category: '복음서', categoryEmoji: '✝️' },
  { id: 'mark', name: '마가복음', englishName: 'Mark', totalChapters: 16, testament: 'new', category: '복음서', categoryEmoji: '✝️' },
  { id: 'luke', name: '누가복음', englishName: 'Luke', totalChapters: 24, testament: 'new', category: '복음서', categoryEmoji: '✝️' },
  { id: 'john', name: '요한복음', englishName: 'John', totalChapters: 21, testament: 'new', category: '복음서', categoryEmoji: '✝️' },

  // 🕊️ 역사서 (1권)
  { id: 'acts', name: '사도행전', englishName: 'Acts', totalChapters: 28, testament: 'new', category: '역사서', categoryEmoji: '🕊️' },

  // 📨 바울서신 (13권)
  { id: 'romans', name: '로마서', englishName: 'Romans', totalChapters: 16, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: '1corinthians', name: '고린도전서', englishName: '1 Corinthians', totalChapters: 16, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: '2corinthians', name: '고린도후서', englishName: '2 Corinthians', totalChapters: 13, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: 'galatians', name: '갈라디아서', englishName: 'Galatians', totalChapters: 6, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: 'ephesians', name: '에베소서', englishName: 'Ephesians', totalChapters: 6, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: 'philippians', name: '빌립보서', englishName: 'Philippians', totalChapters: 4, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: 'colossians', name: '골로새서', englishName: 'Colossians', totalChapters: 4, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: '1thessalonians', name: '데살로니가전서', englishName: '1 Thessalonians', totalChapters: 5, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: '2thessalonians', name: '데살로니가후서', englishName: '2 Thessalonians', totalChapters: 3, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: '1timothy', name: '디모데전서', englishName: '1 Timothy', totalChapters: 6, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: '2timothy', name: '디모데후서', englishName: '2 Timothy', totalChapters: 4, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: 'titus', name: '디도서', englishName: 'Titus', totalChapters: 3, testament: 'new', category: '바울서신', categoryEmoji: '📨' },
  { id: 'philemon', name: '빌레몬서', englishName: 'Philemon', totalChapters: 1, testament: 'new', category: '바울서신', categoryEmoji: '📨' },

  // 💌 공동서신 (8권)
  { id: 'hebrews', name: '히브리서', englishName: 'Hebrews', totalChapters: 13, testament: 'new', category: '공동서신', categoryEmoji: '💌' },
  { id: 'james', name: '야고보서', englishName: 'James', totalChapters: 5, testament: 'new', category: '공동서신', categoryEmoji: '💌' },
  { id: '1peter', name: '베드로전서', englishName: '1 Peter', totalChapters: 5, testament: 'new', category: '공동서신', categoryEmoji: '💌' },
  { id: '2peter', name: '베드로후서', englishName: '2 Peter', totalChapters: 3, testament: 'new', category: '공동서신', categoryEmoji: '💌' },
  { id: '1john', name: '요한일서', englishName: '1 John', totalChapters: 5, testament: 'new', category: '공동서신', categoryEmoji: '💌' },
  { id: '2john', name: '요한이서', englishName: '2 John', totalChapters: 1, testament: 'new', category: '공동서신', categoryEmoji: '💌' },
  { id: '3john', name: '요한삼서', englishName: '3 John', totalChapters: 1, testament: 'new', category: '공동서신', categoryEmoji: '💌' },
  { id: 'jude', name: '유다서', englishName: 'Jude', totalChapters: 1, testament: 'new', category: '공동서신', categoryEmoji: '💌' },
  { id: 'revelation', name: '요한계시록', englishName: 'Revelation', totalChapters: 22, testament: 'new', category: '묵시서', categoryEmoji: '🔮' },
];

// 구약/신약 필터
export const getOldTestamentBooks = () => bibleBooks.filter(book => book.testament === 'old');
export const getNewTestamentBooks = () => bibleBooks.filter(book => book.testament === 'new');

// 카테고리별 그룹화
export const getBooksByCategory = (testament: 'old' | 'new') => {
  const books = testament === 'old' ? getOldTestamentBooks() : getNewTestamentBooks();
  const categories = new Map<string, BookInfo[]>();

  books.forEach(book => {
    if (!categories.has(book.category)) {
      categories.set(book.category, []);
    }
    categories.get(book.category)!.push(book);
  });

  return categories;
};

// 책 ID로 찾기
export const getBookById = (id: string) => bibleBooks.find(book => book.id === id);

// 책 이름으로 찾기
export const getBookByName = (name: string) => bibleBooks.find(book => book.name === name || book.englishName === name);
