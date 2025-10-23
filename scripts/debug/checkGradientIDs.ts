import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGradientIDs() {
  console.log('🔍 Gradient ID 중복 확인...\n');

  const { data: allWords } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_svg, position, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis')
    .order('position', { ascending: true })
    .limit(10);

  console.log('📝 첫 10개 단어의 Gradient ID 확인:\n');

  allWords?.forEach((word: any, idx: number) => {
    const svg = word.icon_svg || '';
    const idMatches = svg.match(/id="([^"]+)"/g) || [];
    const ids = idMatches.map((m: string) => m.replace(/id="|"/g, ''));

    console.log(`${idx + 1}. ${word.hebrew} (position: ${word.position})`);
    console.log(`   의미: ${word.meaning}`);
    console.log(`   Gradient IDs: ${ids.join(', ')}`);
    console.log(`   SVG 길이: ${svg.length}자`);
    console.log(`   미리보기: ${svg.substring(0, 120)}...\n`);
  });
}

checkGradientIDs().catch(console.error);
