import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface SefariaResponse {
  he: string[];
  ref: string;
  heRef: string;
  text: string[];
  versions: any[];
}

interface Verse {
  id: string;
  chapter: number;
  verseNumber: number;
  hebrew: string;
  reference: string;
  hebrewReference: string;
  source: string;
}

/**
 * Sefaria API에서 특정 장의 히브리어 텍스트를 가져옵니다.
 */
async function fetchChapter(book: string, chapter: number): Promise<Verse[]> {
  const url = `https://www.sefaria.org/api/texts/${book}.${chapter}`;

  console.log(`📖 ${book} ${chapter}장 가져오는 중...`);

  try {
    const response = await axios.get<SefariaResponse>(url, {
      params: {
        lang: 'he'
      },
      timeout: 10000
    });

    if (!response.data.he || response.data.he.length === 0) {
      throw new Error(`히브리어 텍스트를 찾을 수 없습니다: ${book} ${chapter}`);
    }

    // HTML 태그 및 특수 문자 제거
    const cleanText = response.data.he.map(verse =>
      verse
        .replace(/<[^>]+>/g, '')  // HTML 태그 제거 (<big>, <small>, <br> 등)
        .replace(/&thinsp;/g, '')  // &thinsp; 제거
        .replace(/&nbsp;/g, ' ')   // &nbsp; → 공백
        .replace(/\s+/g, ' ')      // 연속 공백 제거
        .trim()
    );

    // Verse 객체 배열로 변환
    const verses: Verse[] = cleanText.map((text, index) => ({
      id: `${book.toLowerCase()}${chapter}-${index + 1}`,
      chapter,
      verseNumber: index + 1,
      hebrew: text,
      reference: `${book} ${chapter}:${index + 1}`,
      hebrewReference: `${response.data.heRef} ${index + 1}`,
      source: 'sefaria'
    }));

    console.log(`   ✅ ${verses.length}개 구절 가져옴`);
    return verses;

  } catch (error: any) {
    console.error(`   ❌ 오류: ${error.message}`);
    throw error;
  }
}

/**
 * 창세기 특정 장들을 가져옵니다.
 */
async function fetchGenesisChapters(startChapter: number, endChapter: number): Promise<Verse[]> {
  console.log(`\n📚 창세기 ${startChapter}-${endChapter}장 다운로드 시작\n`);

  const allVerses: Verse[] = [];

  for (let ch = startChapter; ch <= endChapter; ch++) {
    try {
      const verses = await fetchChapter('Genesis', ch);
      allVerses.push(...verses);

      // API rate limit 방지 (500ms 대기)
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`⚠️  창세기 ${ch}장 건너뜀 (오류 발생)`);
    }
  }

  console.log(`\n✅ 총 ${allVerses.length}개 구절 다운로드 완료\n`);
  return allVerses;
}

/**
 * 데이터를 JSON 파일로 저장합니다.
 */
function saveToJSON(verses: Verse[], filename: string) {
  const dataDir = path.join(process.cwd(), 'data');

  // data 디렉토리 생성 (없으면)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filepath = path.join(dataDir, filename);

  fs.writeFileSync(
    filepath,
    JSON.stringify(verses, null, 2),
    'utf-8'
  );

  console.log(`💾 저장 완료: ${filepath}`);
  console.log(`   파일 크기: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    // 창세기 1-3장 다운로드
    const verses = await fetchGenesisChapters(1, 3);

    // JSON으로 저장
    saveToJSON(verses, 'genesis-1-3-sefaria.json');

    // 샘플 출력
    console.log('\n📋 샘플 데이터:');
    console.log('─────────────────────────────────────');
    verses.slice(0, 3).forEach(v => {
      console.log(`${v.reference}: ${v.hebrew.substring(0, 50)}...`);
    });
    console.log('─────────────────────────────────────\n');

  } catch (error: any) {
    console.error('❌ 스크립트 실행 실패:', error.message);
    process.exit(1);
  }
}

export { fetchChapter, fetchGenesisChapters, saveToJSON };

// 스크립트 직접 실행 시
main();
