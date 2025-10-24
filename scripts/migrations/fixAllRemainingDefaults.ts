import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 모든 단어 조회 및 shadow 추가
async function addDropShadowToAll() {
  console.log('🔧 모든 SVG에 drop-shadow 추가 시작...\n');

  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_svg')
    .not('icon_svg', 'is', null);

  if (error || !words) {
    console.error('❌ 에러:', error);
    return;
  }

  const wordsToFix = words.filter(w =>
    w.icon_svg && !w.icon_svg.includes('drop-shadow')
  );

  console.log(`📊 Shadow 없는 단어: ${wordsToFix.length}개\n`);

  let fixed = 0;
  for (const word of wordsToFix) {
    let svg = word.icon_svg;

    // 모든 주요 shape에 drop-shadow 추가
    svg = svg.replace(/<(circle|rect|path|ellipse|polygon)/g, (match) => {
      if (!match.includes('filter=')) {
        return match + ' filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"';
      }
      return match;
    });

    await supabase.from('words').update({ icon_svg: svg }).eq('id', word.id);
    fixed++;
    if (fixed % 50 === 0) console.log(`✅ ${fixed}/${wordsToFix.length}`);
  }

  console.log(`\n✅ 완료: ${fixed}개 수정\n`);
}

addDropShadowToAll().catch(console.error);
