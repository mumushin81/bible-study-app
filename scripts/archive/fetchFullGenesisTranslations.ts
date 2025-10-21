import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface SefariaResponse {
  he: string[];
  text: string[];
  ref: string;
  heRef: string;
}

interface Translation {
  chapter: number;
  verseNumber: number;
  english: string;
}

/**
 * Sefaria API에서 특정 장의 영어 번역 가져오기
 */
async function fetchChapterTranslation(book: string, chapter: number): Promise<Translation[]> {
  const url = `https://www.sefaria.org/api/texts/${book}.${chapter}`;

  console.log(`   📖 Chapter ${chapter} 가져오는 중...`);

  try {
    const response = await axios.get<SefariaResponse>(url, {
      params: { lang: 'en' },
      timeout: 10000
    });

    if (!response.data.text || response.data.text.length === 0) {
      console.warn(`   ⚠️  Chapter ${chapter}: 영어 번역 없음`);
      return [];
    }

    // HTML 태그 제거 및 정제
    const translations: Translation[] = response.data.text.map((text, index) => ({
      chapter,
      verseNumber: index + 1,
      english: text
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }));

    console.log(`   ✅ Chapter ${chapter}: ${translations.length} verses`);
    return translations;

  } catch (error: any) {
    console.error(`   ❌ Chapter ${chapter} 오류: ${error.message}`);
    return [];
  }
}

/**
 * 창세기 전체 영어 번역 가져오기
 */
async function fetchFullGenesisTranslations(): Promise<Translation[]> {
  console.log('\n📚 창세기 전체 영어 번역 다운로드 시작\n');

  const allTranslations: Translation[] = [];

  for (let ch = 1; ch <= 50; ch++) {
    const translations = await fetchChapterTranslation('Genesis', ch);
    allTranslations.push(...translations);

    // API rate limit 방지 (500ms 대기)
    await new Promise(resolve => setTimeout(resolve, 500));

    // 진행 상황 표시
    if (ch % 10 === 0) {
      console.log(`\n   🎯 진행: ${ch}/50 챕터 완료\n`);
    }
  }

  console.log(`\n✅ 총 ${allTranslations.length}개 영어 번역 다운로드 완료\n`);
  return allTranslations;
}

/**
 * 통계 출력
 */
function printStatistics(translations: Translation[]) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 영어 번역 통계');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const chapterStats: { [key: number]: number } = {};

  translations.forEach(t => {
    chapterStats[t.chapter] = (chapterStats[t.chapter] || 0) + 1;
  });

  let totalVerses = 0;
  Object.keys(chapterStats).sort((a, b) => parseInt(a) - parseInt(b)).forEach(ch => {
    const count = chapterStats[parseInt(ch)];
    totalVerses += count;
    console.log(`   Chapter ${ch.padStart(2, ' ')}: ${count.toString().padStart(3, ' ')} verses`);
  });

  console.log(`\n   📖 총 ${Object.keys(chapterStats).length}개 챕터`);
  console.log(`   📝 총 ${totalVerses}개 번역\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * 메인 실행
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 창세기 전체 50장 영어 번역 다운로드');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // 1. 전체 번역 다운로드
    const translations = await fetchFullGenesisTranslations();

    // 2. 통계 출력
    printStatistics(translations);

    // 3. JSON 저장
    const outputPath = path.join(process.cwd(), 'data', 'genesis-full-translations.json');
    fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2), 'utf-8');
    console.log(`💾 저장 완료: ${outputPath}`);
    console.log(`   파일 크기: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`);

  } catch (error: any) {
    console.error('\n❌ 스크립트 실행 실패:', error.message);
    process.exit(1);
  }
}

main();
