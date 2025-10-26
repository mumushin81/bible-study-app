#!/usr/bin/env tsx

/**
 * icon_url을 올바르게 수정
 * - 각 단어 ID를 해시하여 정확한 파일명으로 업데이트
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createHash } from 'crypto';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Admin 권한 필요
);

const STORAGE_BASE_URL = 'https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons';

function generateCorrectFilename(wordId: string): string {
  const hash = createHash('md5').update(wordId).digest('hex');
  return `word_${hash}.jpg`;
}

async function fixIconUrls() {
  console.log('🔧 Genesis 1:1 단어들의 icon_url 수정 시작\n');

  // 1. Genesis 1:1 단어들 가져오기
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_url, verses!inner(reference)')
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 1)
    .eq('verses.verse_number', 1)
    .order('position', { ascending: true });

  if (error || !words) {
    console.error('❌ 단어 조회 실패:', error);
    return;
  }

  console.log(`📊 총 ${words.length}개 단어 발견\n`);

  let updated = 0;
  let failed = 0;

  for (const word of words) {
    const correctFilename = generateCorrectFilename(word.id);
    const correctUrl = `${STORAGE_BASE_URL}/${correctFilename}`;

    const currentFilename = word.icon_url ? word.icon_url.split('/').pop() : 'NULL';

    console.log(`${word.hebrew} (${word.meaning})`);
    console.log(`  현재: ${currentFilename}`);
    console.log(`  수정: ${correctFilename}`);

    if (currentFilename === correctFilename) {
      console.log(`  ✅ 이미 올바름\n`);
      continue;
    }

    // DB 업데이트
    const { error: updateError } = await supabase
      .from('words')
      .update({ icon_url: correctUrl })
      .eq('id', word.id);

    if (updateError) {
      console.error(`  ❌ 업데이트 실패:`, updateError.message);
      failed++;
    } else {
      console.log(`  ✅ 업데이트 완료\n`);
      updated++;
    }

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 업데이트 성공: ${updated}/${words.length}`);
  console.log(`❌ 실패: ${failed}/${words.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (updated + failed === words.length) {
    console.log('🎉 icon_url 수정 완료!');
    console.log('\n⚠️  주의: Supabase Storage에 해당 파일들을 업로드해야 합니다.');
    console.log('파일명 형식: word_<MD5(단어ID)>.jpg');
  }
}

fixIconUrls().catch(console.error);
