import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyGuidelines() {
  console.log('🔍 MD Script SVG 가이드라인 준수 검증 시작...\n');

  const { data: allWords } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_svg, verses!inner(book_id)')
    .eq('verses.book_id', 'genesis');

  const total = allWords?.length || 0;
  console.log(`📊 검증 대상: ${total}개 단어\n`);

  let checks = {
    hasViewBox: 0,
    hasXmlns: 0,
    hasDefs: 0,
    hasGradient: 0,
    hasFilter: 0,
    hasUniqueGradientId: 0,
    validSize: 0,
  };

  const gradientIds = new Set<string>();
  const duplicateIds: string[] = [];
  const issues: string[] = [];

  allWords?.forEach((word: any) => {
    const svg = word.icon_svg;
    if (!svg) return;

    // 1. viewBox="0 0 64 64" 체크
    if (svg.includes('viewBox="0 0 64 64"')) {
      checks.hasViewBox++;
    } else {
      issues.push(`❌ ${word.hebrew}: viewBox 누락 또는 잘못됨`);
    }

    // 2. xmlns 체크
    if (svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
      checks.hasXmlns++;
    } else {
      issues.push(`❌ ${word.hebrew}: xmlns 누락`);
    }

    // 3. <defs> 태그 체크
    if (svg.includes('<defs>')) {
      checks.hasDefs++;
    } else {
      issues.push(`⚠️  ${word.hebrew}: <defs> 태그 없음`);
    }

    // 4. gradient 체크
    if (svg.includes('Gradient')) {
      checks.hasGradient++;
    } else {
      issues.push(`⚠️  ${word.hebrew}: gradient 없음`);
    }

    // 5. filter 체크
    if (svg.includes('filter=') && svg.includes('drop-shadow')) {
      checks.hasFilter++;
    } else {
      issues.push(`⚠️  ${word.hebrew}: drop-shadow 효과 없음`);
    }

    // 6. Gradient ID 고유성 체크
    const idMatches = svg.match(/id="([^"]+)"/g);
    if (idMatches) {
      idMatches.forEach((match: string) => {
        const id = match.replace(/id="|"/g, '');

        // 일반적인 ID 패턴 체크 (금지)
        const genericPatterns = ['gradient1', 'grad1', 'g1', 'linear1', 'radial1', 'glow1'];
        if (genericPatterns.some(pattern => id.toLowerCase().includes(pattern) && id.length < 15)) {
          issues.push(`❌ ${word.hebrew}: 일반적인 gradient ID 사용 (${id})`);
        } else {
          checks.hasUniqueGradientId++;
        }

        if (gradientIds.has(id)) {
          duplicateIds.push(`❌ 중복 ID: ${id} (${word.hebrew})`);
        } else {
          gradientIds.add(id);
        }
      });
    }

    // 7. 파일 크기 체크
    if (svg.length >= 100 && svg.length <= 3000) {
      checks.validSize++;
    } else if (svg.length < 100) {
      issues.push(`⚠️  ${word.hebrew}: SVG 너무 작음 (${svg.length}자)`);
    } else {
      issues.push(`⚠️  ${word.hebrew}: SVG 너무 큼 (${svg.length}자)`);
    }
  });

  // 결과 출력
  console.log('=' .repeat(70));
  console.log('📊 가이드라인 준수 결과\n');

  console.log('✅ 필수 규격:');
  console.log(`   viewBox="0 0 64 64":        ${checks.hasViewBox}/${total} (${(checks.hasViewBox/total*100).toFixed(1)}%)`);
  console.log(`   xmlns 선언:                 ${checks.hasXmlns}/${total} (${(checks.hasXmlns/total*100).toFixed(1)}%)`);
  console.log(`   <defs> 태그:                ${checks.hasDefs}/${total} (${(checks.hasDefs/total*100).toFixed(1)}%)`);
  console.log(`   Gradient 사용:              ${checks.hasGradient}/${total} (${(checks.hasGradient/total*100).toFixed(1)}%)`);
  console.log(`   drop-shadow 효과:           ${checks.hasFilter}/${total} (${(checks.hasFilter/total*100).toFixed(1)}%)`);
  console.log(`   파일 크기 적정:             ${checks.validSize}/${total} (${(checks.validSize/total*100).toFixed(1)}%)`);

  console.log(`\n🔑 Gradient ID:`)
  console.log(`   고유 ID 개수:               ${gradientIds.size}개`);
  console.log(`   중복 ID:                    ${duplicateIds.length}개`);

  const passRate = ((checks.hasViewBox + checks.hasXmlns + checks.hasDefs + checks.hasGradient + checks.hasFilter + checks.validSize) / (total * 6) * 100).toFixed(1);

  console.log(`\n📈 전체 통과율:                ${passRate}%`);
  console.log('=' .repeat(70));

  if (duplicateIds.length > 0) {
    console.log('\n⚠️  중복 Gradient ID 발견:');
    duplicateIds.slice(0, 10).forEach(id => console.log(`   ${id}`));
    if (duplicateIds.length > 10) {
      console.log(`   ... 외 ${duplicateIds.length - 10}개`);
    }
  }

  if (issues.length > 0) {
    console.log(`\n⚠️  발견된 이슈 (총 ${issues.length}개):`);
    issues.slice(0, 20).forEach(issue => console.log(`   ${issue}`));
    if (issues.length > 20) {
      console.log(`   ... 외 ${issues.length - 20}개`);
    }
  }

  if (passRate === '100.0' && duplicateIds.length === 0) {
    console.log('\n🎉 축하합니다! 모든 SVG가 MD Script 가이드라인을 완벽하게 준수합니다!');
  } else if (parseFloat(passRate) >= 95) {
    console.log('\n✅ 우수! 대부분의 SVG가 가이드라인을 준수합니다.');
  } else {
    console.log('\n⚠️  일부 SVG에 개선이 필요합니다.');
  }

  // 샘플 SVG 출력
  console.log('\n📝 샘플 SVG (첫 3개):');
  allWords?.slice(0, 3).forEach((word: any, idx: number) => {
    console.log(`\n${idx + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   길이: ${word.icon_svg?.length || 0}자`);
    console.log(`   미리보기: ${word.icon_svg?.substring(0, 100)}...`);
  });
}

verifyGuidelines().catch(console.error);
