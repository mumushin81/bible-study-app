import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface VerseData {
  verse: number;
  hebrew: string;
}

async function crawlGenesis1() {
  try {
    console.log('📖 창세기 1장 크롤링 시작...');

    const url = 'https://mechon-mamre.org/p/pt/pt0101.htm';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log('✓ HTML 다운로드 완료');

    const $ = cheerio.load(response.data);
    const verses: VerseData[] = [];

    // mechon-mamre 사이트의 구조 분석
    // 각 절은 특정 패턴으로 구성되어 있음
    $('p').each((index, element) => {
      const text = $(element).text().trim();

      // 절 번호와 히브리어 텍스트 분리
      const match = text.match(/^([א-ת]+)\s+(.+)$/);
      if (match) {
        const verseNumber = hebrewToNumber(match[1]);
        const hebrewText = match[2].trim();

        if (verseNumber > 0 && hebrewText) {
          verses.push({
            verse: verseNumber,
            hebrew: hebrewText
          });
          console.log(`✓ 절 ${verseNumber} 추출 완료`);
        }
      }
    });

    // 대체 파싱 방법: 모든 텍스트를 확인하여 히브리어 패턴 찾기
    if (verses.length === 0) {
      console.log('⚠ 첫 번째 방법 실패, 대체 파싱 시도...');

      const bodyText = $('body').text();
      const lines = bodyText.split('\n').filter(line => line.trim());

      let currentVerse = 0;
      for (const line of lines) {
        const trimmed = line.trim();
        // 히브리어 문자 포함 여부 확인
        if (/[\u0590-\u05FF]/.test(trimmed)) {
          // 절 번호 패턴 찾기 (숫자나 히브리어 숫자)
          const verseMatch = trimmed.match(/^(\d+|[א-ת]+)\s*(.+)$/);
          if (verseMatch) {
            const verseNum = verseMatch[1];
            const hebrewText = verseMatch[2].trim();

            if (/^\d+$/.test(verseNum)) {
              currentVerse = parseInt(verseNum);
            } else {
              currentVerse = hebrewToNumber(verseNum);
            }

            if (currentVerse > 0 && hebrewText && /[\u0590-\u05FF]/.test(hebrewText)) {
              verses.push({
                verse: currentVerse,
                hebrew: hebrewText
              });
              console.log(`✓ 절 ${currentVerse} 추출 완료`);
            }
          }
        }
      }
    }

    if (verses.length === 0) {
      throw new Error('히브리어 구절을 찾을 수 없습니다');
    }

    // 절 번호로 정렬
    verses.sort((a, b) => a.verse - b.verse);

    // 결과 저장
    const outputDir = join(__dirname, '..', 'data');
    const outputPath = join(outputDir, 'genesis1-raw.json');

    // data 디렉토리가 없으면 생성
    try {
      mkdirSync(outputDir, { recursive: true });
    } catch (err) {
      // 이미 존재하면 무시
    }

    writeFileSync(outputPath, JSON.stringify(verses, null, 2), 'utf-8');

    console.log(`\n✅ 크롤링 완료!`);
    console.log(`📊 총 ${verses.length}개 구절 추출`);
    console.log(`💾 저장 위치: ${outputPath}`);

  } catch (error) {
    console.error('❌ 크롤링 실패:', error);
    if (axios.isAxiosError(error)) {
      console.error('HTTP 에러:', error.response?.status, error.response?.statusText);
    }
    process.exit(1);
  }
}

// 히브리어 숫자를 아라비아 숫자로 변환
function hebrewToNumber(hebrewNum: string): number {
  const hebrewNumerals: { [key: string]: number } = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5,
    'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
    'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50,
    'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400
  };

  let total = 0;
  for (const char of hebrewNum) {
    total += hebrewNumerals[char] || 0;
  }
  return total;
}

// 실행
crawlGenesis1();
