import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Word {
  id: string;
  hebrew: string;
  meaning: string;
  root: string | null;
  grammar: string | null;
}

/**
 * Calculate difficulty level based on word characteristics
 * 1 = Very Easy, 5 = Very Hard
 */
function calculateDifficulty(word: Word): number {
  let difficulty = 2; // Start with medium

  // 어근이 없거나 복잡한 문법 = 어려움
  if (!word.root) difficulty += 1;
  if (word.grammar && (word.grammar.includes('Hiphil') || word.grammar.includes('Hophal'))) {
    difficulty += 1;
  }

  // 의미가 길고 복잡함 = 어려움
  if (word.meaning && word.meaning.length > 50) {
    difficulty += 1;
  }

  return Math.min(5, Math.max(1, Math.round(difficulty)));
}

/**
 * Calculate theological importance based on frequency and content
 * 1 = Low, 5 = Critical (e.g., names of God)
 */
function calculateTheologicalImportance(word: Word, frequency: number): number {
  let importance = 2; // Start with medium

  // 높은 빈도 = 중요
  if (frequency > 100) importance = 4;
  else if (frequency > 50) importance = 3;
  else if (frequency > 20) importance = 2;
  else importance = 1;

  // 신학적 중요 단어 (예: 하나님, 언약, 믿음 등)
  const theologicalKeywords = ['하나님', '여호와', '언약', '믿음', '의', '사랑', '구원', '창조', '축복', '율법', '거룩'];
  if (word.meaning && theologicalKeywords.some(kw => word.meaning.includes(kw))) {
    importance = 5; // Critical
  }

  return Math.min(5, Math.max(1, importance));
}

/**
 * Calculate pedagogical priority
 * 1 = Low priority, 5 = High priority
 */
function calculatePedagogicalPriority(difficulty: number, importance: number, frequency: number): number {
  // 공식: 중요하고 빈도 높고 쉬운 단어 = 우선순위 높음
  // (6 - difficulty) + importance + Math.log10(frequency + 1)
  const frequencyBonus = Math.min(2, Math.log10(frequency + 1));
  const priority = (6 - difficulty) + importance + frequencyBonus;

  return Math.min(5, Math.max(1, Math.round(priority / 2)));
}

async function generateMetadata() {
  console.log('\\n📊 Word Metadata 생성 시작\\n');

  try {
    // 1. 모든 단어 가져오기
    console.log('1️⃣  모든 단어 로드 중...');
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, hebrew, meaning, root, grammar');

    if (wordsError) throw wordsError;
    if (!words || words.length === 0) {
      console.log('❌ 단어가 없습니다.');
      return;
    }

    console.log(`✅ ${words.length}개 단어 로드 완료\\n`);

    // 2. 각 단어의 빈도 계산 (히브리어 기준)
    console.log('2️⃣  단어 빈도 계산 중...');
    const frequencyMap = new Map<string, number>();
    for (const word of words) {
      const count = frequencyMap.get(word.hebrew) || 0;
      frequencyMap.set(word.hebrew, count + 1);
    }
    console.log(`✅ ${frequencyMap.size}개 고유 히브리어 단어 빈도 계산 완료\\n`);

    // 3. 각 단어의 메타데이터 계산 및 저장 (고유한 word_hebrew별로)
    console.log('3️⃣  메타데이터 생성 및 저장 중...\\n');

    let successCount = 0;
    let errorCount = 0;

    // 고유한 히브리어 단어별로 처리 (중복 제거)
    const uniqueWords = new Map<string, Word>();
    for (const word of words) {
      if (!uniqueWords.has(word.hebrew)) {
        uniqueWords.set(word.hebrew, word);
      }
    }

    console.log(`고유 단어 수: ${uniqueWords.size}개\\n`);

    const metadataRecords = [];
    for (const [hebrew, word] of uniqueWords.entries()) {
      const frequency = frequencyMap.get(word.hebrew) || 1;
      const difficulty = calculateDifficulty(word);
      const importance = calculateTheologicalImportance(word, frequency);
      const priority = calculatePedagogicalPriority(difficulty, importance, frequency);

      // Check if word is theological term
      const theologicalKeywords = ['하나님', '여호와', '언약', '믿음', '의', '사랑', '구원', '창조', '축복', '율법'];
      const isTheologicalTerm = word.meaning && theologicalKeywords.some(kw => word.meaning.includes(kw));

      metadataRecords.push({
        word_hebrew: word.hebrew,
        bible_frequency: frequency,
        genesis_frequency: frequency, // For now, same as bible_frequency
        objective_difficulty: difficulty,
        theological_importance: importance,
        pedagogical_priority: priority,
        is_theological_term: isTheologicalTerm,
        is_common_word: frequency > 50,
        recommended_review_count: Math.min(20, Math.max(5, Math.floor(difficulty * 2))),
        min_exposures: Math.min(10, Math.max(3, Math.floor(difficulty * 1.5))),
      });
    }

    // 배치로 나눠서 삽입
    const batchSize = 100;
    for (let i = 0; i < metadataRecords.length; i += batchSize) {
      const batch = metadataRecords.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from('word_metadata')
        .upsert(batch, {
          onConflict: 'word_hebrew',
          ignoreDuplicates: false
        });

      if (insertError) {
        console.error(`❌ 배치 ${Math.floor(i / batchSize) + 1} 삽입 실패:`, insertError.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        const progress = Math.round((successCount / metadataRecords.length) * 100);
        console.log(`✅ 배치 ${Math.floor(i / batchSize) + 1} 완료 (${successCount}/${metadataRecords.length}, ${progress}%)`);
      }
    }

    console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');
    console.log('📊 최종 결과\\n');
    console.log(`✅ 성공: ${successCount}개`);
    if (errorCount > 0) {
      console.log(`❌ 실패: ${errorCount}개`);
    }
    console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');

    // 4. 통계 출력
    console.log('4️⃣  생성된 메타데이터 통계\\n');
    const { data: stats } = await supabase
      .from('word_metadata')
      .select('objective_difficulty, theological_importance, pedagogical_priority, is_theological_term, is_common_word');

    if (stats) {
      const avgDifficulty = stats.reduce((sum, s) => sum + s.objective_difficulty, 0) / stats.length;
      const avgImportance = stats.reduce((sum, s) => sum + s.theological_importance, 0) / stats.length;
      const avgPriority = stats.reduce((sum, s) => sum + s.pedagogical_priority, 0) / stats.length;

      console.log(`평균 난이도: ${avgDifficulty.toFixed(2)} / 5`);
      console.log(`평균 신학적 중요도: ${avgImportance.toFixed(2)} / 5`);
      console.log(`평균 학습 우선순위: ${avgPriority.toFixed(2)} / 5`);

      console.log('\\n난이도 분포:');
      for (let level = 1; level <= 5; level++) {
        const count = stats.filter(s => s.objective_difficulty === level).length;
        console.log(`  레벨 ${level}: ${count}개 (${Math.round(count / stats.length * 100)}%)`);
      }

      console.log('\\n신학적 중요도 분포:');
      for (let level = 1; level <= 5; level++) {
        const count = stats.filter(s => s.theological_importance === level).length;
        console.log(`  레벨 ${level}: ${count}개 (${Math.round(count / stats.length * 100)}%)`);
      }

      const theologicalCount = stats.filter(s => s.is_theological_term).length;
      const commonCount = stats.filter(s => s.is_common_word).length;
      console.log(`\\n신학 용어: ${theologicalCount}개 (${Math.round(theologicalCount / stats.length * 100)}%)`);
      console.log(`일반 단어: ${commonCount}개 (${Math.round(commonCount / stats.length * 100)}%)`);
    }

    console.log('\\n✅ Word Metadata 생성 완료!\\n');
  } catch (error) {
    console.error('\\n❌ 오류 발생:', error);
    process.exit(1);
  }
}

generateMetadata();
