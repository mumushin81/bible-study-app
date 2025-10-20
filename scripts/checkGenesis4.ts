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
  verse_number: number;
  hebrew: string;
  ipa: string;
  korean_pronunciation: string;
  modern: string;
  translation: string;
}

async function checkGenesis4() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Genesis 4장 현재 상태 분석');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Genesis 4장 전체 조회
  const { data: verses, error } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', 'genesis')
    .eq('chapter', 4)
    .order('verse_number', { ascending: true });

  if (error) {
    console.error('❌ 데이터 조회 실패:', error.message);
    return;
  }

  if (!verses || verses.length === 0) {
    console.log('⚠️  Genesis 4장 데이터가 없습니다.\n');
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

  // TODO 구절 요약
  if (stats.todoVerse.length > 0) {
    console.log(`⚠️  불완전한 구절: ${stats.todoVerse.length}개\n`);

    // 첫 3개 구절만 샘플 표시
    console.log('📋 샘플 (처음 3개):');
    stats.todoVerse.slice(0, 3).forEach((verse, idx) => {
      console.log(`\n${idx + 1}. ${verse.reference}`);
      console.log(`   Hebrew: ${verse.hebrew ? (verse.hebrew.length > 60 ? verse.hebrew.substring(0, 60) + '...' : verse.hebrew) : '(없음)'}`);
      console.log(`   Modern: ${verse.modern}`);
      console.log(`   IPA: ${verse.ipa}`);
    });
    console.log('');
  } else {
    console.log('🎉 모든 구절이 완벽하게 완성되었습니다!\n');
  }

  // Words & Commentaries 확인
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 Words & Commentaries');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const { count: wordsCount } = await supabase
    .from('words')
    .select('id', { count: 'exact' })
    .in('verse_id', verses.map(v => v.id));

  const { count: commCount } = await supabase
    .from('commentaries')
    .select('id', { count: 'exact' })
    .in('verse_id', verses.map(v => v.id));

  console.log(`Words: ${wordsCount || 0}개`);
  console.log(`Commentaries: ${commCount || 0}개\n`);

  // 다음 단계 제안
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 다음 단계');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (stats.todoVerse.length > 0) {
    console.log(`1. ${stats.todoVerse.length}개 구절 번역 필요`);
    console.log('2. Words & Commentaries 추가 (선택)\n');
  } else {
    console.log('✅ Genesis 4장 완료!\n');
  }
}

checkGenesis4();
