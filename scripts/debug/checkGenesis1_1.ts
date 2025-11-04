import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGenesis1_1() {
  console.log('🔍 창세기 1:1 단어들의 아이콘 확인 중...\n');

  try {
    // 창세기 1:1 구절 조회
    const { data: verse, error: verseError } = await supabase
      .from('verses')
      .select('id, reference')
      .eq('book_id', 'genesis')
      .eq('chapter', 1)
      .eq('verse_number', 1)
      .single();

    if (verseError || !verse) {
      console.error('❌ 창세기 1:1 구절을 찾을 수 없습니다.');
      return;
    }

    console.log(`📖 구절: ${verse.reference}`);
    console.log(`📌 verse_id: ${verse.id}\n`);

    // 해당 구절의 단어들 조회
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, hebrew, meaning, icon_url, icon_svg, position')
      .eq('verse_id', verse.id)
      .order('position', { ascending: true });

    if (wordsError || !words || words.length === 0) {
      console.error('❌ 단어를 찾을 수 없습니다.');
      return;
    }

    console.log(`✅ 총 ${words.length}개 단어 발견\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('단어별 아이콘 상태');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    words.forEach((word: any, i) => {
      console.log(`${i + 1}. ${word.hebrew} (${word.meaning})`);
      console.log(`   순서: ${word.position}`);

      // icon_url 확인
      if (word.icon_url) {
        console.log(`   ⚠️  icon_url: ${word.icon_url.substring(0, 70)}...`);
        console.log(`       → 죽은 링크일 가능성 높음 (Storage에 파일 없음)`);
      } else {
        console.log(`   ❌ icon_url: NULL`);
      }

      // icon_svg 확인
      if (word.icon_svg) {
        console.log(`   ✅ icon_svg: 있음 (${word.icon_svg.length} bytes)`);
        console.log(`       → 이 아이콘이 실제로 표시됨!`);
      } else {
        console.log(`   ❌ icon_svg: NULL`);
      }

      // 최종 판정
      if (word.icon_svg) {
        console.log(`   🎨 결과: SVG 아이콘 표시 ✅`);
      } else if (word.icon_url) {
        console.log(`   ⏳ 결과: 로딩 시도 후 실패 → FileText 기본 아이콘 표시 ❌`);
      } else {
        console.log(`   📄 결과: FileText 기본 아이콘 표시 ❌`);
      }

      console.log('');
    });

    // 요약
    const hasIconUrl = words.filter((w: any) => w.icon_url).length;
    const hasIconSvg = words.filter((w: any) => w.icon_svg).length;
    const noIcon = words.length - hasIconUrl - hasIconSvg;
    const bothIcons = words.filter((w: any) => w.icon_url && w.icon_svg).length;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 창세기 1:1 요약');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`총 단어: ${words.length}개`);
    console.log(`icon_url만: ${hasIconUrl - bothIcons}개 (죽은 링크)`);
    console.log(`icon_svg만: ${hasIconSvg - bothIcons}개 (실제 표시됨)`);
    console.log(`둘 다 있음: ${bothIcons}개 (SVG 우선 표시)`);
    console.log(`둘 다 없음: ${noIcon}개 (FileText 기본 아이콘)`);
    console.log('');
    console.log(`🎨 실제로 SVG 표시: ${hasIconSvg}개 (${(hasIconSvg / words.length * 100).toFixed(1)}%)`);
    console.log(`❌ 기본 아이콘 표시: ${words.length - hasIconSvg}개 (${((words.length - hasIconSvg) / words.length * 100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

checkGenesis1_1();
