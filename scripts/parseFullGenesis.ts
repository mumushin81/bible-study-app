import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';

interface OSHBWord {
  _: string;
  $: {
    lemma: string;
    morph: string;
    id?: string;
  };
}

interface OSHBVerse {
  $: {
    osisID: string;
  };
  w?: OSHBWord[];
  seg?: any[];
}

interface OSHBChapter {
  $: {
    osisID: string;
  };
  verse: OSHBVerse[];
}

interface ParsedVerse {
  id: string;
  chapter: number;
  verseNumber: number;
  hebrew: string;
  words: string[];
  morphology?: string[];
  lemmas?: string[];
}

/**
 * OSHB GitHub에서 창세기 XML 다운로드
 */
async function downloadOSHBGenesis(): Promise<string> {
  const url = 'https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc/Gen.xml';

  console.log('📥 OSHB 창세기 XML 다운로드 중...');

  try {
    const response = await axios.get<string>(url, {
      timeout: 30000
    });

    console.log(`   ✅ 다운로드 완료 (${(response.data.length / 1024).toFixed(2)} KB)\n`);
    return response.data;

  } catch (error: any) {
    console.error(`   ❌ 다운로드 실패: ${error.message}`);
    throw error;
  }
}

/**
 * XML 파싱하여 전체 창세기 구절 추출
 */
async function parseFullGenesis(xml: string): Promise<ParsedVerse[]> {
  console.log('🔍 XML 파싱 중 (창세기 전체 50장)...\n');

  try {
    const result = await parseStringPromise(xml);

    const book = result.osis.osisText[0].div[0];
    const chapters: OSHBChapter[] = book.chapter || [];

    const verses: ParsedVerse[] = [];

    for (const chapter of chapters) {
      const chapterId = chapter.$.osisID;
      const chapterNum = parseInt(chapterId.split('.')[1]);

      console.log(`   ⏳ Chapter ${chapterNum} 파싱 중...`);

      for (const verse of chapter.verse) {
        const verseId = verse.$.osisID;
        const verseNum = parseInt(verseId.split('.')[2]);

        const words = verse.w || [];

        // 히브리어 단어들 추출
        const hebrewWords = words.map((w: OSHBWord) => {
          return w._.replace(/\//g, '');
        });

        // 전체 히브리어 텍스트
        const hebrewText = hebrewWords.join(' ')
          .replace(/־/g, '')  // maqqef 제거
          .replace(/׃/g, '')  // sof pasuq 제거
          .replace(/׀/g, '')  // paseq 제거
          .trim();

        // 형태소 및 어근 정보
        const morphology = words.map((w: OSHBWord) => w.$.morph);
        const lemmas = words.map((w: OSHBWord) => w.$.lemma);

        verses.push({
          id: `gen${chapterNum}-${verseNum}`,
          chapter: chapterNum,
          verseNumber: verseNum,
          hebrew: hebrewText,
          words: hebrewWords,
          morphology,
          lemmas
        });
      }

      console.log(`   ✅ Chapter ${chapterNum}: ${chapter.verse.length} verses`);
    }

    console.log(`\n✅ 총 ${verses.length}개 구절 파싱 완료\n`);
    return verses;

  } catch (error: any) {
    console.error(`   ❌ 파싱 실패: ${error.message}`);
    throw error;
  }
}

/**
 * 챕터별 통계
 */
function printStatistics(verses: ParsedVerse[]) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 창세기 파싱 통계');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const chapterStats: { [key: number]: number } = {};

  verses.forEach(v => {
    chapterStats[v.chapter] = (chapterStats[v.chapter] || 0) + 1;
  });

  let totalVerses = 0;
  Object.keys(chapterStats).sort((a, b) => parseInt(a) - parseInt(b)).forEach(ch => {
    const count = chapterStats[parseInt(ch)];
    totalVerses += count;
    console.log(`   Chapter ${ch.padStart(2, ' ')}: ${count.toString().padStart(3, ' ')} verses`);
  });

  console.log(`\n   📖 총 ${Object.keys(chapterStats).length}개 챕터`);
  console.log(`   📝 총 ${totalVerses}개 구절\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * 메인 실행
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 창세기 전체 50장 OSHB 파싱');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. XML 다운로드
    const xml = await downloadOSHBGenesis();

    // 2. 전체 파싱
    const verses = await parseFullGenesis(xml);

    // 3. 통계 출력
    printStatistics(verses);

    // 4. JSON 저장
    const outputPath = path.join(process.cwd(), 'data', 'genesis-full-oshb.json');
    fs.writeFileSync(outputPath, JSON.stringify(verses, null, 2), 'utf-8');
    console.log(`💾 저장 완료: ${outputPath}`);
    console.log(`   파일 크기: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`);

  } catch (error: any) {
    console.error('\n❌ 스크립트 실행 실패:', error.message);
    process.exit(1);
  }
}

main();
