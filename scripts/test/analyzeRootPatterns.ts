/**
 * Root 패턴 분석 스크립트
 * 단어의 root 필드 패턴을 분석하여 결합형 판단 로직을 개선
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzePatterns() {
  console.log('🔍 Root 패턴 분석 시작\n');

  // Genesis 1:1-3의 단어들 가져오기 (더 많은 샘플)
  const { data: verses } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .in('verse_number', [1, 2, 3]);

  if (!verses) {
    console.error('❌ 구절을 찾을 수 없습니다');
    return;
  }

  const verseIds = verses.map(v => v.id);

  const { data: words } = await supabase
    .from('words')
    .select('hebrew, meaning, root, grammar')
    .in('verse_id', verseIds)
    .order('position', { ascending: true });

  if (!words) {
    console.error('❌ 단어를 가져올 수 없습니다');
    return;
  }

  console.log(`✅ ${words.length}개 단어 로드\n`);
  console.log('='.repeat(100));

  const patterns = {
    withPlus: [] as any[],      // "ו + אֵת" 같은 패턴
    withDash: [] as any[],       // "ב-ר-א" 같은 패턴
    simple: [] as any[],         // 단순 텍스트
    other: [] as any[]
  };

  words.forEach((word) => {
    const firstChar = word.hebrew[0];
    const hasPrefix = ['ו', 'ב', 'ל', 'מ', 'כ', 'ה'].includes(firstChar);
    const rootHasPlus = word.root.includes('+');
    const rootHasDash = word.root.includes('-');
    const rootStartsWithPrefix = ['ו', 'ב', 'ל', 'מ', 'כ', 'ה'].some(p => word.root.startsWith(p));

    const analysis = {
      hebrew: word.hebrew,
      meaning: word.meaning,
      root: word.root,
      firstChar,
      hasPrefix,
      rootHasPlus,
      rootHasDash,
      rootStartsWithPrefix,
      rootStartsWithSamePrefix: hasPrefix && word.root.startsWith(firstChar)
    };

    if (rootHasPlus) {
      patterns.withPlus.push(analysis);
    } else if (rootHasDash) {
      patterns.withDash.push(analysis);
    } else if (word.root.match(/^[a-zA-Z\u0590-\u05FF\s()]+$/)) {
      patterns.simple.push(analysis);
    } else {
      patterns.other.push(analysis);
    }
  });

  console.log('\n📊 패턴 1: Root에 "+" 기호 포함 (명확한 결합형)\n');
  patterns.withPlus.forEach(w => {
    console.log(`${w.hebrew.padEnd(15)} → ${w.root.padEnd(30)} | ${w.meaning}`);
  });

  console.log('\n📊 패턴 2: Root에 "-" 기호 포함 (어근 표기법)\n');
  patterns.withDash.slice(0, 10).forEach(w => {
    const isCombined = w.hasPrefix && !w.rootStartsWithSamePrefix;
    const marker = isCombined ? '✅ 결합형' : '❌ 단독형';
    console.log(`${w.hebrew.padEnd(15)} → ${w.root.padEnd(30)} | ${marker} | ${w.meaning}`);
  });

  console.log('\n📊 패턴 3: 단순 텍스트\n');
  patterns.simple.slice(0, 10).forEach(w => {
    const isCombined = w.hasPrefix && !w.rootStartsWithPrefix;
    const marker = isCombined ? '✅ 결합형' : '❌ 단독형';
    console.log(`${w.hebrew.padEnd(15)} → ${w.root.padEnd(30)} | ${marker} | ${w.meaning}`);
  });

  console.log('\n' + '='.repeat(100));
  console.log('\n💡 판단 로직 제안:\n');
  console.log('1. root에 "+"가 있으면 → 결합형 (100% 확실)');
  console.log('2. hebrew 첫 글자가 접두사(ו,ב,ל,מ,כ,ה)이고, root가 그 접두사로 시작하지 않으면 → 결합형');
  console.log('3. root에 "-"가 있고 (어근 표기), hebrew 첫 글자가 접두사인데 root에 없으면 → 결합형');
  console.log('4. 그 외 → 단독형\n');
}

analyzePatterns().catch(console.error);
