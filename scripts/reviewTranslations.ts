import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Verse {
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

async function reviewSampleVerses() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Genesis 2-3장 번역 품질 검토');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 샘플 구절 선택: 각 장에서 대표적인 구절들
  const sampleIds = [
    'genesis_2_4',   // 창조 이야기 서론
    'genesis_2_7',   // 사람 창조
    'genesis_2_18',  // 돕는 짝 필요
    'genesis_2_23',  // 여자 창조 반응
    'genesis_3_1',   // 뱀의 유혹 시작
    'genesis_3_6',   // 선악과 먹음
    'genesis_3_15',  // 원시복음
    'genesis_3_24',  // 에덴에서 추방
  ];

  const { data: verses, error } = await supabase
    .from('verses')
    .select('*')
    .in('id', sampleIds)
    .order('chapter', { ascending: true })
    .order('verse_number', { ascending: true });

  if (error) {
    console.error('❌ 데이터 조회 실패:', error.message);
    return;
  }

  if (!verses || verses.length === 0) {
    console.log('⚠️  샘플 구절을 찾을 수 없습니다.\n');
    return;
  }

  console.log(`📖 ${verses.length}개 샘플 구절 검토\n`);

  verses.forEach((verse: Verse, idx) => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`[${idx + 1}/${verses.length}] ${verse.reference}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // 히브리어 원문
    console.log('📜 히브리어 원문:');
    console.log(`   ${verse.hebrew}\n`);

    // IPA 발음
    console.log('🔊 IPA 발음:');
    console.log(`   ${verse.ipa}\n`);

    // 한글 발음
    console.log('🗣️  한글 발음:');
    console.log(`   ${verse.korean_pronunciation}\n`);

    // 현대어 의역
    console.log('📖 한글 현대어 의역:');
    console.log(`   ${verse.modern}\n`);

    // 영어 번역 (참고)
    console.log('🌐 영어 번역 (참고):');
    const shortTranslation = verse.translation.length > 150
      ? verse.translation.substring(0, 150) + '...'
      : verse.translation;
    console.log(`   ${shortTranslation}\n`);

    // 품질 체크
    const issues: string[] = [];

    // 1. 길이 체크
    if (verse.modern.length < 10) {
      issues.push('⚠️  현대어 의역이 너무 짧습니다');
    }
    if (verse.korean_pronunciation.length < 10) {
      issues.push('⚠️  한글 발음이 너무 짧습니다');
    }

    // 2. TODO 체크
    if (verse.modern.includes('[TODO') || verse.modern.includes('TODO]')) {
      issues.push('❌ 현대어 의역에 TODO가 남아있습니다');
    }
    if (verse.ipa.includes('[TODO') || verse.ipa.includes('TODO]')) {
      issues.push('❌ IPA에 TODO가 남아있습니다');
    }
    if (verse.korean_pronunciation.includes('[TODO') || verse.korean_pronunciation.includes('TODO]')) {
      issues.push('❌ 한글 발음에 TODO가 남아있습니다');
    }

    // 3. 한글 발음에 영어/숫자 체크 (정상적인 한글만 있어야 함)
    const hasNonKorean = /[a-zA-Z0-9]/.test(verse.korean_pronunciation);
    if (hasNonKorean) {
      issues.push('⚠️  한글 발음에 영문자/숫자가 포함되어 있습니다');
    }

    // 4. IPA에 한글 체크 (IPA는 한글이 없어야 함)
    const hasKorean = /[가-힣]/.test(verse.ipa);
    if (hasKorean) {
      issues.push('⚠️  IPA에 한글이 포함되어 있습니다');
    }

    // 결과 출력
    if (issues.length === 0) {
      console.log('✅ 품질 검토: 문제 없음\n');
    } else {
      console.log('🔴 품질 이슈:');
      issues.forEach(issue => console.log(`   ${issue}`));
      console.log('');
    }
  });

  // 전체 통계
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 품질 검토 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const avgModernLength = verses.reduce((sum, v: Verse) => sum + v.modern.length, 0) / verses.length;
  const avgKoreanPronLength = verses.reduce((sum, v: Verse) => sum + v.korean_pronunciation.length, 0) / verses.length;
  const avgIpaLength = verses.reduce((sum, v: Verse) => sum + v.ipa.length, 0) / verses.length;

  console.log(`평균 길이:`);
  console.log(`  - 현대어 의역: ${avgModernLength.toFixed(0)}자`);
  console.log(`  - 한글 발음: ${avgKoreanPronLength.toFixed(0)}자`);
  console.log(`  - IPA 발음: ${avgIpaLength.toFixed(0)}자\n`);

  console.log('✅ 샘플 검토 완료!\n');
}

reviewSampleVerses();
