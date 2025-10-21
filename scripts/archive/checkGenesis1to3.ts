import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface VerseCheck {
  id: string;
  reference: string;
  chapter: number;
  verse_number: number;
  hebrew: string;
  ipa: string;
  korean_pronunciation: string;
  modern: string;
  translation: string;
}

async function checkGenesis1to3() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Genesis 1-3장 완성도 분석');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Genesis 1-3장 전체 조회
  const { data: verses, error } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', 'genesis')
    .gte('chapter', 1)
    .lte('chapter', 3)
    .order('chapter', { ascending: true })
    .order('verse_number', { ascending: true });

  if (error) {
    console.error('❌ 데이터 조회 실패:', error.message);
    return;
  }

  if (!verses || verses.length === 0) {
    console.log('⚠️  Genesis 1-3장 데이터가 없습니다.\n');
    return;
  }

  console.log(`📊 총 ${verses.length}개 구절 발견\n`);

  // 분석
  const stats = {
    total: verses.length,
    hebrewComplete: 0,
    ipaComplete: 0,
    koreanPronComplete: 0,
    modernComplete: 0,
    translationComplete: 0,
    fullyComplete: 0,
    todoVerse: [] as VerseCheck[],
  };

  const todoFields: { [key: string]: string[] } = {};

  verses.forEach((verse: VerseCheck) => {
    const issues: string[] = [];

    // Hebrew
    if (verse.hebrew && !verse.hebrew.includes('[TODO')) {
      stats.hebrewComplete++;
    } else {
      issues.push('hebrew');
    }

    // IPA
    if (verse.ipa && !verse.ipa.includes('[TODO')) {
      stats.ipaComplete++;
    } else {
      issues.push('ipa');
    }

    // Korean Pronunciation
    if (verse.korean_pronunciation && !verse.korean_pronunciation.includes('[TODO')) {
      stats.koreanPronComplete++;
    } else {
      issues.push('korean_pronunciation');
    }

    // Modern
    if (verse.modern && !verse.modern.includes('[TODO')) {
      stats.modernComplete++;
    } else {
      issues.push('modern');
    }

    // Translation
    if (verse.translation && !verse.translation.includes('[TODO')) {
      stats.translationComplete++;
    } else {
      issues.push('translation');
    }

    if (issues.length === 0) {
      stats.fullyComplete++;
    } else {
      stats.todoVerse.push(verse);
      todoFields[verse.reference] = issues;
    }
  });

  // 결과 출력
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📈 필드별 완성도');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const printStat = (label: string, count: number, total: number) => {
    const percent = ((count / total) * 100).toFixed(1);
    const status = count === total ? '✅' : '⚠️ ';
    console.log(`${status} ${label.padEnd(20)}: ${count}/${total} (${percent}%)`);
  };

  printStat('히브리 원문', stats.hebrewComplete, stats.total);
  printStat('IPA 발음', stats.ipaComplete, stats.total);
  printStat('한글 발음', stats.koreanPronComplete, stats.total);
  printStat('현대어 의역', stats.modernComplete, stats.total);
  printStat('영어 번역', stats.translationComplete, stats.total);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  printStat('완전히 완성된 구절', stats.fullyComplete, stats.total);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // TODO 구절 상세
  if (stats.todoVerse.length > 0) {
    console.log('⚠️  불완전한 구절 목록:\n');

    stats.todoVerse.forEach((verse, idx) => {
      const issues = todoFields[verse.reference];
      console.log(`${idx + 1}. ${verse.reference}`);
      console.log(`   ID: ${verse.id}`);
      console.log(`   누락 필드: ${issues.join(', ')}`);

      // 샘플 표시
      issues.forEach(field => {
        const value = (verse as any)[field];
        if (value) {
          const sample = value.length > 50 ? value.substring(0, 50) + '...' : value;
          console.log(`   ${field}: "${sample}"`);
        } else {
          console.log(`   ${field}: (비어있음)`);
        }
      });
      console.log('');
    });
  } else {
    console.log('🎉 모든 구절이 완벽하게 완성되었습니다!\n');
  }

  // 챕터별 통계
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 챕터별 완성도');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  [1, 2, 3].forEach(ch => {
    const chapterVerses = verses.filter((v: VerseCheck) => v.chapter === ch);
    const chapterComplete = chapterVerses.filter((v: VerseCheck) => {
      return !v.modern.includes('[TODO') &&
             !v.ipa.includes('[TODO') &&
             !v.korean_pronunciation.includes('[TODO');
    });

    const percent = ((chapterComplete.length / chapterVerses.length) * 100).toFixed(1);
    const status = chapterComplete.length === chapterVerses.length ? '✅' : '⚠️ ';

    console.log(`${status} Genesis ${ch}장: ${chapterComplete.length}/${chapterVerses.length} 구절 (${percent}%)`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 다음 단계 제안
  if (stats.todoVerse.length > 0) {
    console.log('📝 다음 단계:');
    console.log(`   1. ${stats.todoVerse.length}개 불완전한 구절 완성`);
    console.log('   2. 품질 검증');
    console.log('   3. Genesis 4-50장으로 확장\n');
  }
}

checkGenesis1to3();
