import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllSVGs() {
  console.log('기존 SVG 전체 삭제 시작...\n');

  // 1. 현재 상태 확인
  const { data: beforeCount, count } = await supabase
    .from('words')
    .select('id', { count: 'exact' })
    .not('icon_svg', 'is', null);

  console.log('삭제 전 SVG 있는 레코드:', count, '개\n');

  // 2. 전체 icon_svg를 NULL로 업데이트
  console.log('모든 icon_svg 필드를 NULL로 업데이트 중...');
  
  const { error, count: updatedCount } = await supabase
    .from('words')
    .update({ icon_svg: null })
    .not('icon_svg', 'is', null)
    .select('id', { count: 'exact' });

  if (error) {
    console.error('오류 발생:', error);
    return;
  }

  console.log('업데이트 완료:', updatedCount, '개 레코드\n');

  // 3. 검증
  const { count: afterCount } = await supabase
    .from('words')
    .select('id', { count: 'exact' })
    .not('icon_svg', 'is', null);

  console.log('=== 최종 결과 ===');
  console.log('SVG 있는 레코드:', afterCount, '개');
  console.log('삭제 성공:', count, '개');
  
  if (afterCount === 0) {
    console.log('\n✅ 모든 SVG가 성공적으로 삭제되었습니다!');
  } else {
    console.log('\n⚠️ 일부 SVG가 남아있습니다.');
  }
}

deleteAllSVGs();
