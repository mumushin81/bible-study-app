import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

(async () => {
  console.log('🔍 데이터 구조 분석\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. words 테이블 총 개수
  const { count: wordsCount } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  console.log('📚 words 테이블 (성경 구절의 모든 단어):');
  console.log(`   총 ${wordsCount}개 단어\n`);

  // 2. word_derivations 테이블 개수
  const { count: derivationsCount } = await supabase
    .from('word_derivations')
    .select('*', { count: 'exact', head: true });

  console.log('🔗 word_derivations 테이블 (어근-단어 연결):');
  console.log(`   총 ${derivationsCount}개 매핑\n`);

  // 3. 예시: א-מ-ר 어근의 파생어
  const { data: amarRoot } = await supabase
    .from('hebrew_roots')
    .select('id, root, root_hebrew, core_meaning_korean')
    .eq('root', 'א-מ-ר')
    .single();

  if (amarRoot) {
    const { data: amarDerivations } = await supabase
      .from('word_derivations')
      .select(`
        id,
        word:word_id (
          id,
          hebrew,
          meaning,
          verse_id
        )
      `)
      .eq('root_id', amarRoot.id);

    console.log('📖 예시: א-מ-ר (말하다) 어근의 파생어:');
    console.log(`   어근: ${amarRoot.root} (${amarRoot.root_hebrew})`);
    console.log(`   의미: ${amarRoot.core_meaning_korean}`);
    console.log(`   파생어 개수: ${amarDerivations?.length || 0}개\n`);

    if (amarDerivations && amarDerivations.length > 0) {
      console.log('   처음 5개 파생어:');
      amarDerivations.slice(0, 5).forEach((deriv: any, idx: number) => {
        console.log(`   ${idx + 1}. ${deriv.word.hebrew} - ${deriv.word.meaning}`);
        console.log(`      word_id: ${deriv.word.id}`);
        console.log(`      verse_id: ${deriv.word.verse_id}`);
      });
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 핵심: word_derivations는 새 단어를 만들지 않습니다!');
  console.log('   - words 테이블의 기존 단어를 참조만 합니다 (word_id)');
  console.log('   - 같은 데이터를 어근별로 분류하는 VIEW 역할');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
})();
