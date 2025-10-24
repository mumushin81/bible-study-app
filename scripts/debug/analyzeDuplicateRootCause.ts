import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeDuplicateRootCause() {
  console.log('🔬 SVG 중복 생성 근본 원인 분석\n');
  console.log('=' .repeat(70));

  // יְהִי (있으라, 되라) 단어들 조회
  const { data: words } = await supabase
    .from('words')
    .select(`
      id,
      hebrew,
      meaning,
      grammar,
      icon_svg,
      position,
      created_at,
      verses!inner (
        id,
        reference,
        book_id,
        chapter,
        verse_number
      )
    `)
    .eq('hebrew', 'יְהִי')
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 1)
    .eq('verses.verse_number', 6);

  console.log('\n📊 יְהִי (있으라, 되라) 중복 단어 상세 분석:\n');
  console.log(`총 발견: ${words?.length}개\n`);

  words?.forEach((word: any, idx: number) => {
    console.log(`${idx + 1}. 단어 정보:`);
    console.log(`   DB ID: ${word.id}`);
    console.log(`   히브리어: ${word.hebrew}`);
    console.log(`   의미: ${word.meaning}`);
    console.log(`   문법: ${word.grammar}`);
    console.log(`   Position: ${word.position}`);
    console.log(`   생성일: ${word.created_at}`);
    console.log(`   구절 ID: ${word.verses.id}`);
    console.log(`   구절: ${word.verses.reference}`);

    // Gradient ID 추출
    const gradientIds = word.icon_svg?.match(/id="([^"]+)"/g) || [];
    const ids = gradientIds.map((m: string) => m.replace(/id="|"/g, ''));
    console.log(`   Gradient IDs: ${ids.join(', ')}`);
    console.log(`   SVG 길이: ${word.icon_svg?.length}자\n`);
  });

  console.log('=' .repeat(70));
  console.log('\n🎯 근본 원인 분석:\n');

  // 원인 1: 동일한 verse_id를 참조하는 중복 레코드
  console.log('1️⃣  데이터베이스 중복 레코드 검사:');
  const verseIds = new Set(words?.map((w: any) => w.verses.id));
  console.log(`   verse_id 개수: ${verseIds.size}개`);
  console.log(`   단어 레코드 개수: ${words?.length}개`);

  if (verseIds.size < words!.length) {
    console.log(`   ❌ 중복 발견! 동일한 구절에 같은 히브리어 단어가 ${words!.length - verseIds.size}번 중복 저장됨`);
    console.log(`   원인: words 테이블에 동일한 (hebrew, verse_id) 조합이 여러 번 존재`);
  } else {
    console.log(`   ✅ 구절별로는 중복 없음`);
  }

  // 원인 2: Gradient ID 생성 방식 확인
  console.log('\n2️⃣  Gradient ID 생성 방식 검사:');
  words?.forEach((word: any, idx: number) => {
    const gradientIds = word.icon_svg?.match(/id="([^"]+)"/g) || [];
    const ids = gradientIds.map((m: string) => m.replace(/id="|"/g, ''));

    console.log(`   단어 ${idx + 1}: ${ids[0] || 'N/A'}`);

    // 우리 스크립트 형식인지 확인
    if (ids[0] && ids[0].includes('mh3g')) {
      console.log(`      → ✅ 최신 스크립트 형식 (DB ID + timestamp)`);
    } else if (ids[0] && ids[0].includes('_g')) {
      console.log(`      → ⚠️  이전 스크립트 형식 (고정 ID)`);
    } else {
      console.log(`      → ❓ 알 수 없는 형식`);
    }
  });

  // 원인 3: SVG 내용 비교
  console.log('\n3️⃣  SVG 내용 비교:');
  const svgContents = new Set(words?.map((w: any) => w.icon_svg));
  console.log(`   고유 SVG 패턴 수: ${svgContents.size}개`);

  if (svgContents.size === 1) {
    console.log(`   ❌ 모든 단어가 완전히 동일한 SVG 사용 (Gradient ID까지 동일)`);
    console.log(`   원인: 이전 스크립트로 생성되어 고정 Gradient ID 사용`);
  } else if (svgContents.size < words!.length) {
    console.log(`   ⚠️  일부 단어가 동일한 SVG 사용`);
  } else {
    console.log(`   ✅ 모든 단어가 고유한 SVG 사용`);
  }

  console.log('\n=' .repeat(70));
  console.log('📋 종합 분석 결과:\n');

  // 종합 판단
  const hasDatabaseDuplicates = verseIds.size < words!.length;
  const hasIdenticalSVGs = svgContents.size === 1;
  const hasOldFormat = words?.some((w: any) => {
    const ids = w.icon_svg?.match(/id="([^"]+)"/g) || [];
    return ids.some((id: string) => id.includes('_g') && !id.includes('mh3g'));
  });

  console.log('🔍 문제 유형:');

  if (hasDatabaseDuplicates) {
    console.log('\n✅ 주요 원인: **데이터베이스 중복 레코드**');
    console.log('   설명:');
    console.log('   - words 테이블에 동일한 (hebrew, verse_id) 조합이 여러 번 저장됨');
    console.log('   - 데이터 생성 과정에서 중복 삽입 발생');
    console.log('   - 각 레코드는 다른 word.id를 가지지만 내용은 동일');
    console.log('\n   해결 방법:');
    console.log('   1. words 테이블에서 중복 레코드 삭제');
    console.log('   2. (hebrew, verse_id) 조합에 UNIQUE 제약조건 추가');
    console.log('   3. 데이터 생성 스크립트 수정하여 중복 방지');
  }

  if (hasIdenticalSVGs && hasOldFormat) {
    console.log('\n✅ 부차적 원인: **이전 스크립트로 생성된 SVG**');
    console.log('   설명:');
    console.log('   - 고정 Gradient ID 사용 (예: star_g3_r5t)');
    console.log('   - 같은 의미의 단어는 동일한 Gradient ID 사용');
    console.log('   - 최신 스크립트(DB ID + timestamp)로 재생성 필요');
    console.log('\n   해결 방법:');
    console.log('   1. regenerateAllSVGsPerGuidelines.ts 스크립트 재실행');
    console.log('   2. 모든 SVG를 고유 Gradient ID로 재생성');
  }

  if (!hasDatabaseDuplicates && hasIdenticalSVGs) {
    console.log('\n✅ 주요 원인: **SVG 생성 로직 문제**');
    console.log('   설명:');
    console.log('   - 서로 다른 레코드지만 동일한 SVG 생성');
    console.log('   - Gradient ID가 고유하지 않음');
    console.log('\n   해결 방법:');
    console.log('   1. SVG 생성 스크립트의 고유성 보장 로직 수정');
    console.log('   2. 모든 SVG 재생성');
  }

  console.log('\n=' .repeat(70));
  console.log('🔧 권장 조치 순서:\n');
  console.log('1. 데이터베이스에서 중복 레코드 제거');
  console.log('2. (hebrew, verse_id) UNIQUE 제약조건 추가');
  console.log('3. 남은 단어들에 대해 SVG 재생성 (고유 ID 보장)');
  console.log('4. 재생성 후 검증');
}

analyzeDuplicateRootCause().catch(console.error);
