import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createHash } from 'crypto';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findHashSource() {
  console.log('🔍 실제 파일명의 해시 소스 찾기\n');

  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, korean, icon_url')
    .eq('id', 'c6f3ee0c-11df-47b0-8759-23e654f09b0d') // בְּרֵאשִׁית
    .single();

  if (error || !words) {
    console.error('❌ 에러:', error);
    return;
  }

  console.log(`단어: ${words.hebrew} (${words.meaning})\n`);

  // 실제 파일명에서 해시 추출
  const actualFilename = words.icon_url.split('/').pop();
  const actualHash = actualFilename?.replace('word_', '').replace('.jpg', '');

  console.log(`실제 파일의 해시: ${actualHash}\n`);
  console.log('다양한 필드를 해시하여 매칭 시도:\n');

  // 시도할 필드들
  const attempts = [
    { name: 'ID', value: words.id },
    { name: 'Hebrew', value: words.hebrew },
    { name: 'Meaning', value: words.meaning },
    { name: 'Korean', value: words.korean },
    { name: 'Hebrew + Meaning', value: words.hebrew + words.meaning },
    { name: 'Hebrew (normalized)', value: words.hebrew.replace(/\s/g, '') },
    { name: 'ID (without hyphens)', value: words.id.replace(/-/g, '') },
    { name: 'ID (uppercase)', value: words.id.toUpperCase() },
  ];

  for (const attempt of attempts) {
    const hash = createHash('md5').update(attempt.value).digest('hex');
    const match = hash === actualHash;
    console.log(`${match ? '✅' : '❌'} ${attempt.name}: ${attempt.value}`);
    console.log(`   해시: ${hash}`);
    if (match) {
      console.log(`   🎯 매칭 성공!`);
      return;
    }
  }

  console.log('\n⚠️  매칭되는 필드를 찾지 못했습니다.');
  console.log('실제 업로드 스크립트를 확인해야 합니다.');
}

findHashSource();
