import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkMultipleSVGs() {
  console.log('🔍 창세기 1:1의 모든 단어 SVG 분석 중...\n');

  // Genesis 1:1 verse 가져오기
  const { data: verse, error: verseError } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('reference', '창세기 1:1')
    .single();

  if (verseError || !verse) {
    console.error('❌ Verse 조회 실패:', verseError);
    return;
  }

  // 모든 단어 가져오기
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_svg, position')
    .eq('verse_id', verse.id)
    .order('position');

  if (wordsError || !words) {
    console.error('❌ Words 조회 실패:', wordsError);
    return;
  }

  console.log(`✅ ${verse.reference}에서 ${words.length}개의 단어를 찾았습니다.\n`);

  // 모든 ID 수집
  const allIds: { word: string; ids: string[] }[] = [];
  const idFrequency: Map<string, number> = new Map();

  words.forEach((word, index) => {
    const svg = word.icon_svg;
    if (!svg) {
      console.log(`⚠️  단어 ${index + 1}: ${word.hebrew} - SVG 없음`);
      return;
    }

    const idMatches = svg.match(/id="([^"]+)"/g);
    const ids = idMatches?.map(m => m.match(/id="([^"]+)"/)?.[1] || '') || [];

    allIds.push({ word: word.hebrew, ids });

    // ID 빈도수 계산
    ids.forEach(id => {
      idFrequency.set(id, (idFrequency.get(id) || 0) + 1);
    });

    console.log(`${index + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   SVG 길이: ${svg.length} 문자`);
    console.log(`   ID 개수: ${ids.length}개`);
    if (ids.length > 0) {
      console.log(`   ID 목록: ${ids.join(', ')}`);
    }
    console.log();
  });

  // ID 충돌 분석
  console.log('\n🔑 ID 충돌 분석:\n');

  const duplicateIds = Array.from(idFrequency.entries())
    .filter(([_, count]) => count > 1);

  if (duplicateIds.length > 0) {
    console.log(`❌ ${duplicateIds.length}개의 중복 ID 발견!`);
    duplicateIds.forEach(([id, count]) => {
      console.log(`  - "${id}": ${count}번 사용됨`);
    });
  } else {
    console.log('✅ 중복 ID 없음 (각 단어마다 고유한 ID 사용)');
  }

  // 명명 패턴 분석
  console.log('\n📋 ID 명명 패턴 분석:\n');

  const allUniqueIds = Array.from(idFrequency.keys());
  const hasSuffix = allUniqueIds.every(id => id.includes('_bereshit') || id.includes('_'));

  console.log(`  총 고유 ID 개수: ${allUniqueIds.length}`);
  console.log(`  명명 규칙: ${hasSuffix ? '✅ 일관된 suffix 사용 (_bereshit 등)' : '⚠️  불일관적'}`);

  // SVG 샘플 저장
  if (words.length > 0 && words[0].icon_svg) {
    const outputPath = '/tmp/genesis_1_1_all_svgs.txt';
    const content = words
      .map((w, i) => `\n${'='.repeat(60)}\n단어 ${i + 1}: ${w.hebrew} (${w.meaning})\n${'='.repeat(60)}\n${w.icon_svg || 'SVG 없음'}`)
      .join('\n\n');

    fs.writeFileSync(outputPath, content);
    console.log(`\n💾 모든 SVG 저장 완료: ${outputPath}`);
  }

  // 요약
  console.log('\n📊 최종 요약:\n');
  console.log(`  구절: ${verse.reference}`);
  console.log(`  단어 개수: ${words.length}`);
  console.log(`  SVG 있는 단어: ${words.filter(w => w.icon_svg).length}`);
  console.log(`  총 ID 개수: ${allUniqueIds.length}`);
  console.log(`  중복 ID: ${duplicateIds.length > 0 ? '❌ 있음' : '✅ 없음'}`);
  console.log(`  ID 충돌 위험: ${duplicateIds.length > 0 ? '⚠️  높음 - 같은 페이지에 여러 단어 표시 시 문제 발생 가능' : '✅ 낮음'}`);
}

checkMultipleSVGs();
