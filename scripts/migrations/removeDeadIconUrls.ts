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

async function removeDeadIconUrls() {
  console.log('🗑️  죽은 icon_url 제거 중...\n');

  try {
    // 1. 현재 상태 확인
    const { count: beforeCount } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .not('icon_url', 'is', null);

    console.log(`📊 제거 전: ${beforeCount}개의 icon_url 존재\n`);

    if (!beforeCount || beforeCount === 0) {
      console.log('✅ 제거할 icon_url이 없습니다.');
      return;
    }

    // 2. 샘플 확인 (안전을 위해)
    const { data: samples } = await supabase
      .from('words')
      .select('id, hebrew, meaning, icon_url')
      .not('icon_url', 'is', null)
      .limit(5);

    console.log('🔍 제거될 URL 샘플:');
    samples?.forEach((word: any, i) => {
      console.log(`${i + 1}. ${word.hebrew} (${word.meaning})`);
      console.log(`   ${word.icon_url.substring(0, 60)}...`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  주의: 이 작업은 되돌릴 수 없습니다!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 3. 사용자 확인 (자동 실행이므로 3초 대기)
    console.log('3초 후 자동으로 실행됩니다...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. NULL로 업데이트
    console.log('\n🔄 icon_url을 NULL로 업데이트 중...');

    const { error, count } = await supabase
      .from('words')
      .update({ icon_url: null })
      .not('icon_url', 'is', null)
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ 업데이트 실패:', error.message);
      return;
    }

    console.log(`✅ ${count}개의 icon_url 제거 완료\n`);

    // 5. 검증
    const { count: afterCount } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .not('icon_url', 'is', null);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 최종 결과');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`제거 전: ${beforeCount}개`);
    console.log(`제거 후: ${afterCount || 0}개`);
    console.log(`제거됨: ${beforeCount! - (afterCount || 0)}개`);

    if (afterCount === 0) {
      console.log('\n✅ 모든 죽은 링크 제거 완료!');
    } else {
      console.log(`\n⚠️  ${afterCount}개의 icon_url이 여전히 남아있습니다.`);
    }

    // 6. 현재 아이콘 상태
    const { count: svgCount } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .not('icon_svg', 'is', null);

    const { count: totalCount } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 현재 아이콘 상태');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`총 단어 수: ${totalCount}개`);
    console.log(`icon_svg 있음: ${svgCount || 0}개 (${((svgCount || 0) / totalCount! * 100).toFixed(1)}%)`);
    console.log(`아이콘 없음: ${totalCount! - (svgCount || 0)}개 (${((totalCount! - (svgCount || 0)) / totalCount! * 100).toFixed(1)}%)`);

    console.log('\n💡 다음 단계:');
    console.log('   모든 단어에 SVG를 생성하려면:');
    console.log('   npx tsx scripts/migrations/generateSVGForNullWords.ts');

  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

removeDeadIconUrls();
