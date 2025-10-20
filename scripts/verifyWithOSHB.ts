import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';

interface OSHBWord {
  _: string;  // 히브리어 텍스트
  $: {
    lemma: string;   // Strong's 번호
    morph: string;   // 형태소 정보
    id?: string;
  };
}

interface OSHBVerse {
  $: {
    osisID: string;  // Gen.1.1
  };
  w?: OSHBWord[];
  seg?: any[];
}

interface OSHBChapter {
  $: {
    osisID: string;  // Gen.1
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
}

/**
 * OSHB GitHub에서 창세기 XML을 다운로드합니다.
 */
async function downloadOSHBGenesis(): Promise<string> {
  const url = 'https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc/Gen.xml';

  console.log('📥 OSHB 창세기 XML 다운로드 중...');

  try {
    const response = await axios.get<string>(url, {
      timeout: 30000
    });

    console.log(`   ✅ 다운로드 완료 (${(response.data.length / 1024).toFixed(2)} KB)`);
    return response.data;

  } catch (error: any) {
    console.error(`   ❌ 다운로드 실패: ${error.message}`);
    throw error;
  }
}

/**
 * XML을 파싱하여 구절 데이터를 추출합니다.
 */
async function parseOSHBXML(xml: string, startChapter: number, endChapter: number): Promise<ParsedVerse[]> {
  console.log(`🔍 XML 파싱 중 (${startChapter}-${endChapter}장)...`);

  try {
    const result = await parseStringPromise(xml);

    // XML 구조: osis > osisText > div > chapter[] > verse[]
    const book = result.osis.osisText[0].div[0];
    const chapters: OSHBChapter[] = book.chapter || [];

    const verses: ParsedVerse[] = [];

    for (const chapter of chapters) {
      const chapterId = chapter.$.osisID;  // Gen.1
      const chapterNum = parseInt(chapterId.split('.')[1]);

      // 범위 체크
      if (chapterNum < startChapter || chapterNum > endChapter) {
        continue;
      }

      for (const verse of chapter.verse) {
        const verseId = verse.$.osisID;  // Gen.1.1
        const verseNum = parseInt(verseId.split('.')[2]);

        const words = verse.w || [];

        // 히브리어 단어들 추출
        const hebrewWords = words.map((w: OSHBWord) => {
          // 형태소 구분자(/) 제거, 타암 기호 유지
          return w._.replace(/\//g, '');
        });

        // 전체 히브리어 텍스트 (공백으로 연결)
        const hebrewText = hebrewWords.join(' ')
          .replace(/־/g, '')  // maqqef 제거 (단어 연결 기호)
          .replace(/׃/g, '')  // sof pasuq 제거 (구절 끝 기호)
          .replace(/׀/g, '')  // paseq 제거
          .trim();

        // 형태소 정보 추출
        const morphology = words.map((w: OSHBWord) => w.$.morph);

        verses.push({
          id: `gen${chapterNum}-${verseNum}`,
          chapter: chapterNum,
          verseNumber: verseNum,
          hebrew: hebrewText,
          words: hebrewWords,
          morphology
        });
      }
    }

    console.log(`   ✅ ${verses.length}개 구절 파싱 완료\n`);
    return verses;

  } catch (error: any) {
    console.error(`   ❌ 파싱 실패: ${error.message}`);
    throw error;
  }
}

/**
 * Sefaria 데이터와 OSHB 데이터를 비교합니다.
 */
function compareVerses(sefariaData: any[], oshbData: ParsedVerse[]) {
  console.log('🔬 데이터 비교 시작...\n');

  const results = {
    total: sefariaData.length,
    exactMatches: 0,
    nikudMatches: 0,  // 니쿠드만 비교 (타암 무시)
    mismatches: [] as any[]
  };

  // 니쿠드만 추출하는 함수 (타암 및 특수 기호 제거)
  const extractNikud = (text: string) => {
    return text
      .replace(/־/g, ' ')   // maqqef → 공백으로 대체 (먼저!)
      .replace(/׀/g, ' ')   // paseq → 공백으로 대체 (먼저!)
      .replace(/׃/g, '')   // sof pasuq 제거
      .replace(/\{פ\}/g, '')  // petuchah 제거
      .replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3-\u05C7]/g, '')  // 타암 기호 제거
      .replace(/\s+/g, ' ')
      .trim();
  };

  // ID 정규화 함수 (genesis1-1 → gen1-1)
  const normalizeId = (id: string) => {
    return id.replace('genesis', 'gen');
  };

  for (let i = 0; i < sefariaData.length; i++) {
    const sefaria = sefariaData[i];
    const normalizedSefariaId = normalizeId(sefaria.id);
    const oshb = oshbData.find(v => v.id === normalizedSefariaId);

    if (!oshb) {
      console.log(`⚠️  OSHB에서 찾을 수 없음: ${sefaria.id} (정규화: ${normalizedSefariaId})`);
      continue;
    }

    const sefariaText = sefaria.hebrew;
    const oshbText = oshb.hebrew;

    // 완전 일치 체크
    if (sefariaText === oshbText) {
      results.exactMatches++;
      continue;
    }

    // 니쿠드만 비교 (타암 무시)
    const sefariaNikud = extractNikud(sefariaText);
    const oshbNikud = extractNikud(oshbText);

    if (sefariaNikud === oshbNikud) {
      results.nikudMatches++;
      continue;
    }

    // 불일치 케이스
    results.mismatches.push({
      id: sefaria.id,
      reference: sefaria.reference,
      sefaria: sefariaText.substring(0, 80),
      oshb: oshbText.substring(0, 80),
      difference: {
        lengthDiff: sefariaText.length - oshbText.length,
        sefariaLength: sefariaText.length,
        oshbLength: oshbText.length
      }
    });
  }

  return results;
}

/**
 * 비교 결과를 출력합니다.
 */
function printResults(results: any) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 검증 결과');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`총 구절 수: ${results.total}`);
  console.log(`완전 일치: ${results.exactMatches} (${(results.exactMatches / results.total * 100).toFixed(2)}%)`);
  console.log(`니쿠드 일치 (타암 차이): ${results.nikudMatches} (${(results.nikudMatches / results.total * 100).toFixed(2)}%)`);
  console.log(`불일치: ${results.mismatches.length} (${(results.mismatches.length / results.total * 100).toFixed(2)}%)\n`);

  const accuracy = ((results.exactMatches + results.nikudMatches) / results.total * 100).toFixed(2);
  console.log(`✅ 전체 정확도: ${accuracy}%\n`);

  if (results.mismatches.length > 0) {
    console.log('⚠️  불일치 구절:');
    console.log('─────────────────────────────────────\n');

    results.mismatches.slice(0, 5).forEach((m: any) => {
      console.log(`${m.reference}:`);
      console.log(`  Sefaria: ${m.sefaria}...`);
      console.log(`  OSHB:    ${m.oshb}...`);
      console.log(`  차이: 길이 ${m.difference.lengthDiff}\n`);
    });

    if (results.mismatches.length > 5) {
      console.log(`  ... 외 ${results.mismatches.length - 5}개 더\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    // 1. Sefaria 데이터 로드
    const sefariaPath = path.join(process.cwd(), 'data', 'genesis-1-3-sefaria.json');

    if (!fs.existsSync(sefariaPath)) {
      console.error('❌ Sefaria 데이터 파일을 찾을 수 없습니다.');
      console.log('먼저 fetchFromSefaria.ts를 실행하세요.');
      process.exit(1);
    }

    console.log('📖 Sefaria 데이터 로드 중...');
    const sefariaData = JSON.parse(fs.readFileSync(sefariaPath, 'utf-8'));
    console.log(`   ✅ ${sefariaData.length}개 구절 로드\n`);

    // 2. OSHB XML 다운로드 및 파싱
    const xml = await downloadOSHBGenesis();
    const oshbData = await parseOSHBXML(xml, 1, 3);

    // 3. OSHB 데이터 저장
    const oshbPath = path.join(process.cwd(), 'data', 'genesis-1-3-oshb.json');
    fs.writeFileSync(oshbPath, JSON.stringify(oshbData, null, 2), 'utf-8');
    console.log(`💾 OSHB 데이터 저장: ${oshbPath}\n`);

    // 4. 데이터 비교
    const results = compareVerses(sefariaData, oshbData);

    // 5. 결과 출력
    printResults(results);

    // 6. 상세 결과 저장
    const reportPath = path.join(process.cwd(), 'data', 'verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`📄 상세 리포트 저장: ${reportPath}\n`);

  } catch (error: any) {
    console.error('❌ 스크립트 실행 실패:', error.message);
    process.exit(1);
  }
}

export { downloadOSHBGenesis, parseOSHBXML, compareVerses };

// 스크립트 직접 실행 시
main();
