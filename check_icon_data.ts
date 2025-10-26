import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'EXISTS' : 'MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'EXISTS' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIconData() {
  console.log('🔍 플래시카드 이미지 데이터 확인 중...\n');

  // Genesis 1:1 단어들의 아이콘 데이터 확인
  const { data: words, error } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_url, icon_svg, verses!inner(reference)')
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 1)
    .eq('verses.verse_number', 1)
    .order('position', { ascending: true })
    .limit(10);

  if (error) {
    console.error('❌ 에러:', error);
    return;
  }

  console.log(`총 ${words?.length || 0}개 단어 확인:\n`);

  words?.forEach((word: any, idx: number) => {
    const hasUrl = !!word.icon_url;
    const hasSvg = !!word.icon_svg;
    const urlPreview = word.icon_url?.substring(0, 60) || 'NULL';
    const svgPreview = word.icon_svg?.substring(0, 60) || 'NULL';

    console.log(`${idx + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   icon_url: ${hasUrl ? '✅ EXISTS' : '❌ NULL'}`);
    console.log(`   → ${urlPreview}${word.icon_url?.length > 60 ? '...' : ''}`);
    console.log(`   icon_svg: ${hasSvg ? '✅ EXISTS' : '❌ NULL'}`);
    console.log(`   → ${svgPreview}${word.icon_svg?.length > 60 ? '...' : ''}`);
    console.log('');
  });
}

checkIconData();
