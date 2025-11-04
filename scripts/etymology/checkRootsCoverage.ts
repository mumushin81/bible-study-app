import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function checkRootsCoverage() {
  const { data: roots } = await supabase
    .from('hebrew_roots')
    .select('root, root_hebrew, core_meaning')
    .order('importance', { ascending: false });

  console.log('📊 데이터베이스의 42개 어근:\n');
  roots?.forEach((r, idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. ${r.root.padEnd(12)} (${r.root_hebrew.padEnd(6)}) - ${r.core_meaning}`);
  });

  // Strong's 매핑 확인
  const mappedRoots = [
    'ב-ר-א', 'ע-ש-ה', 'י-צ-ר', 'ה-י-ה', 'א-מ-ר', 'ד-ב-ר', 'ק-ר-א',
    'ר-א-ה', 'ש-מ-ע', 'י-ד-ע', 'ה-ל-ך', 'ב-ו-א', 'י-צ-א', 'ש-ו-ב',
    'נ-ת-ן', 'ל-ק-ח', 'ב-ד-ל', 'ח-י-ה', 'מ-ו-ת', 'ז-ר-ע', 'פ-ר-ה',
    'ר-ב-ה', 'ב-ר-ך', 'א-ר-ר', 'א-ה-ב', 'ע-ב-ד', 'ש-ב-ת', 'ט-ו-ב',
    'ר-ע-ע', 'ז-כ-ר', 'ש-כ-ח', 'א-כ-ל', 'ש-ת-ה', 'ב-נ-ה', 'י-ש-ב',
    'מ-צ-א', 'ב-ק-ש', 'ש-ל-ח', 'ק-ו-ם', 'נ-פ-ל', 'ש-מ-ר', 'כ-ת-ב'
  ];

  const unmapped = roots?.filter(r => mappedRoots.indexOf(r.root) === -1) || [];

  console.log(`\n✅ Strong's 매핑됨: ${(roots?.length || 0) - unmapped.length}/${roots?.length || 0}`);

  if (unmapped.length > 0) {
    console.log(`\n⚠️  매핑되지 않은 어근 (${unmapped.length}개):\n`);
    unmapped.forEach(r => {
      console.log(`   - ${r.root} (${r.root_hebrew}) - ${r.core_meaning}`);
    });
  }
}

checkRootsCoverage().catch(console.error);
