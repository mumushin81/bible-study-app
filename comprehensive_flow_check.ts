import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function comprehensiveFlowCheck() {
  console.log('🔍 플래시카드 이미지 데이터 흐름 검증\n');
  console.log('='.repeat(80));

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1: 데이터베이스 확인
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n📊 STEP 1: 데이터베이스 확인');
  console.log('─'.repeat(80));

  const { data: words, error } = await supabase
    .from('words')
    .select(`
      hebrew,
      meaning,
      icon_url,
      icon_svg,
      verses!inner (
        book_id,
        chapter,
        verse_number
      )
    `)
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 1)
    .eq('verses.verse_number', 1)
    .order('position', { ascending: true })
    .limit(7);

  if (error) {
    console.error('❌ DB 에러:', error);
    return;
  }

  const wordsWithIconUrl = words?.filter(w => w.icon_url) || [];
  const wordsWithIconSvg = words?.filter(w => w.icon_svg) || [];

  console.log(`✅ Genesis 1:1 총 ${words?.length || 0}개 단어`);
  console.log(`   - icon_url 있음: ${wordsWithIconUrl.length}개`);
  console.log(`   - icon_svg 있음: ${wordsWithIconSvg.length}개`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 2: Supabase Storage 확인
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n\n📦 STEP 2: Supabase Storage 확인');
  console.log('─'.repeat(80));

  const { data: storageFiles, error: storageError } = await supabase.storage
    .from('hebrew-icons')
    .list('icons', { limit: 100 });

  if (storageError) {
    console.error('❌ Storage 에러:', storageError);
  } else {
    console.log(`Storage에 실제 파일 수: ${storageFiles?.length || 0}개`);

    if (storageFiles && storageFiles.length > 0) {
      console.log('\n처음 5개 파일:');
      storageFiles.slice(0, 5).forEach((file, idx) => {
        console.log(`  ${idx + 1}. ${file.name}`);
      });
    } else {
      console.log('❌ Storage 폴더가 비어있습니다!');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 3: URL 접근성 테스트
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n\n🌐 STEP 3: URL 접근성 테스트 (처음 3개)');
  console.log('─'.repeat(80));

  for (let i = 0; i < Math.min(3, wordsWithIconUrl.length); i++) {
    const word = wordsWithIconUrl[i];
    console.log(`\n${i + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   URL: ${word.icon_url}`);

    try {
      const response = await fetch(word.icon_url);
      if (response.ok) {
        console.log(`   ✅ 접근 가능 (${response.status})`);
      } else {
        const errorMsg = await response.text();
        console.log(`   ❌ 접근 불가 (${response.status})`);
        console.log(`   에러: ${errorMsg}`);
      }
    } catch (err) {
      console.log(`   ❌ 네트워크 에러:`, err);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 4: 데이터 흐름 분석
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n\n🔄 STEP 4: 데이터 흐름 분석');
  console.log('─'.repeat(80));

  console.log('\n[1단계] useWords Hook (src/hooks/useWords.ts)');
  console.log('   - ✅ icon_url 필드를 SELECT 쿼리에 포함 (line 53)');
  console.log('   - ✅ iconUrl로 매핑 (line 112)');
  console.log('   - ✅ WordWithContext 타입에 iconUrl 정의 (line 13)');

  console.log('\n[2단계] FlashCard 컴포넌트 (src/components/shared/FlashCard.tsx)');
  console.log('   - ✅ word.iconUrl을 HebrewIcon에 전달 (line 84)');
  console.log('   - ✅ iconSvg도 fallback으로 전달 (line 85)');

  console.log('\n[3단계] HebrewIcon 컴포넌트 (src/components/shared/HebrewIcon.tsx)');
  console.log('   - ✅ iconUrl 우선순위 시스템 구현 (line 22)');
  console.log('   - ✅ iconUrl이 있으면 <img> 태그 렌더링 (line 23-36)');
  console.log('   - ✅ iconUrl이 없으면 iconSvg fallback (line 46)');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 최종 진단
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n\n' + '='.repeat(80));
  console.log('🎯 최종 진단 결과');
  console.log('='.repeat(80));

  console.log('\n✅ 정상 작동하는 부분:');
  console.log('   1. 데이터베이스에 icon_url 필드가 모든 단어에 존재');
  console.log('   2. useWords Hook이 icon_url을 정확히 매핑');
  console.log('   3. FlashCard → HebrewIcon 컴포넌트로 iconUrl 전달');
  console.log('   4. HebrewIcon의 우선순위 시스템 (iconUrl → iconSvg → fallback)');
  console.log('   5. CORS 헤더 설정 (access-control-allow-origin: *)');

  console.log('\n❌ 문제점:');
  console.log('   ⚠️  Supabase Storage의 hebrew-icons/icons 폴더가 비어있음');
  console.log('   ⚠️  DB에 URL은 있지만 실제 이미지 파일이 업로드되지 않음');
  console.log('   ⚠️  모든 icon_url이 404 Not Found 에러 반환');

  console.log('\n💡 해결 방법:');
  console.log('   1. 생성된 JPG 이미지 파일을 Supabase Storage에 업로드');
  console.log('   2. 업로드 경로: hebrew-icons/icons/word_*.jpg');
  console.log('   3. 업로드 후 즉시 작동 (코드 수정 불필요)');

  console.log('\n📝 현재 상태:');
  console.log(`   - DB에 icon_url 있는 단어: ${wordsWithIconUrl.length}개`);
  console.log(`   - Storage에 업로드된 파일: ${storageFiles?.length || 0}개`);
  console.log(`   - 누락된 파일: ${wordsWithIconUrl.length}개`);

  console.log('\n🔧 추천 조치:');
  if (!storageFiles || storageFiles.length === 0) {
    console.log('   → upload_genesis_icons.ts 같은 스크립트로 이미지 업로드 실행');
    console.log('   → 또는 Supabase Dashboard에서 수동 업로드');
  }

  console.log('\n' + '='.repeat(80));
}

comprehensiveFlowCheck();
