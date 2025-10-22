import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * word.root 필드에서 순수 어근 패턴 추출
 * 예: "ע-ל-ה (알라)" → "ע-ל-ה"
 */
function extractRootPattern(rootField: string): string | null {
  if (!rootField) return null;

  // 괄호 앞부분만 추출하고 공백 제거
  const match = rootField.match(/^([^(]+)/);
  if (!match) return null;

  return match[1].trim();
}

async function mapWordDerivations() {
  console.log('🔄 단어-어근 자동 매핑 시작...\n');

  try {
    // 1. 모든 히브리 어근 가져오기
    const { data: roots, error: rootsError } = await supabase
      .from('hebrew_roots')
      .select('id, root, root_hebrew');

    if (rootsError) throw rootsError;

    console.log(`📚 총 ${roots.length}개 어근 로드됨`);

    // 어근 패턴 -> ID 매핑 생성
    const rootMap = new Map<string, string>();
    roots.forEach(root => {
      rootMap.set(root.root, root.id);
    });

    // 2. 모든 단어 가져오기
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, hebrew, root, meaning, korean');

    if (wordsError) throw wordsError;

    console.log(`📖 총 ${words.length}개 단어 로드됨\n`);

    // 3. 기존 매핑 삭제 (선택사항 - 클린 스타트)
    console.log('🗑️  기존 word_derivations 데이터 삭제 중...');
    const { error: deleteError } = await supabase
      .from('word_derivations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 행 삭제

    if (deleteError) {
      console.warn('⚠️  삭제 중 경고:', deleteError.message);
    } else {
      console.log('✅ 기존 데이터 삭제 완료\n');
    }

    // 4. 단어를 어근에 매핑
    let matchedCount = 0;
    let unmatchedCount = 0;
    const derivationsToInsert: any[] = [];

    console.log('🔍 단어-어근 매칭 중...\n');

    for (const word of words) {
      const rootPattern = extractRootPattern(word.root);

      if (!rootPattern) {
        console.log(`⚠️  [${word.hebrew}] 어근 패턴 추출 실패: "${word.root}"`);
        unmatchedCount++;
        continue;
      }

      const rootId = rootMap.get(rootPattern);

      if (rootId) {
        derivationsToInsert.push({
          root_id: rootId,
          word_id: word.id,
          binyan: null, // 추후 분석 가능
          pattern: null,
          derivation_note: `자동 매핑: ${word.root}`
        });
        matchedCount++;
      } else {
        // 매칭되지 않은 어근은 로그만 출력
        unmatchedCount++;
      }
    }

    console.log(`\n📊 매칭 결과:`);
    console.log(`   ✅ 매칭 성공: ${matchedCount}개`);
    console.log(`   ❌ 매칭 실패: ${unmatchedCount}개`);
    console.log(`   📈 매칭률: ${((matchedCount / words.length) * 100).toFixed(1)}%\n`);

    // 5. word_derivations 테이블에 삽입
    if (derivationsToInsert.length > 0) {
      console.log(`💾 ${derivationsToInsert.length}개 매핑 데이터 삽입 중...`);

      // 배치 삽입 (500개씩)
      const batchSize = 500;
      for (let i = 0; i < derivationsToInsert.length; i += batchSize) {
        const batch = derivationsToInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('word_derivations')
          .insert(batch);

        if (insertError) {
          console.error(`❌ 배치 ${Math.floor(i / batchSize) + 1} 삽입 실패:`, insertError);
        } else {
          console.log(`   ✓ 배치 ${Math.floor(i / batchSize) + 1} 완료 (${batch.length}개)`);
        }
      }

      console.log('\n✨ 단어-어근 매핑 완료!');
    } else {
      console.log('⚠️  삽입할 데이터가 없습니다.');
    }

    // 6. 매칭되지 않은 어근 패턴 분석
    console.log('\n📋 매칭되지 않은 주요 어근 패턴 (상위 10개):');
    const unmatchedPatterns = new Map<string, number>();

    for (const word of words) {
      const rootPattern = extractRootPattern(word.root);
      if (rootPattern && !rootMap.has(rootPattern)) {
        unmatchedPatterns.set(rootPattern, (unmatchedPatterns.get(rootPattern) || 0) + 1);
      }
    }

    const sortedUnmatched = Array.from(unmatchedPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    sortedUnmatched.forEach(([pattern, count]) => {
      console.log(`   ${pattern}: ${count}회`);
    });

  } catch (err) {
    console.error('❌ 오류 발생:', err);
    process.exit(1);
  }

  console.log('\n✅ 스크립트 실행 완료!');
  process.exit(0);
}

mapWordDerivations();
