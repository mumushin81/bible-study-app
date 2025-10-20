import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface Verse {
  id: string;
  reference: string;
  hebrew: string;
  translation: string;
  chapter: number;
  verse_number: number;
}

interface KoreanContent {
  modern: string;
  ipa: string;
  korean_pronunciation: string;
}

/**
 * Claude API를 사용하여 한글 컨텐츠 생성
 */
async function generateKoreanContent(verse: Verse): Promise<KoreanContent> {
  const prompt = `당신은 히브리어 성경 전문 번역가입니다. 다음 창세기 구절을 한글로 번역해주세요.

# 구절 정보
참조: ${verse.reference}
히브리어 원문: ${verse.hebrew}
영어 번역: ${verse.translation}

# 요청 사항
1. **한글 현대어 의역**: 현대 한국어로 자연스럽고 이해하기 쉽게 의역해주세요. 신학적으로 정확하되, 일상 언어를 사용하세요.
2. **IPA 발음**: 히브리어 원문의 국제음성기호(IPA) 발음을 제공해주세요.
3. **한글 발음**: 히브리어를 한글로 음차해주세요 (예: "베레쉬트 바라 엘로힘").

# 응답 형식 (JSON)
다음 형식으로만 응답해주세요:

\`\`\`json
{
  "modern": "한글 현대어 의역",
  "ipa": "IPA 발음 표기",
  "korean_pronunciation": "한글 발음"
}
\`\`\`

주의사항:
- JSON 외의 설명은 포함하지 마세요
- modern은 자연스러운 현대 한국어로 작성
- IPA는 정확한 국제음성기호 사용
- korean_pronunciation은 한글로만 작성`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // JSON 추출 (코드 블록 제거)
    const text = content.text.trim();
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error(`Failed to parse JSON from response: ${text}`);
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const result: KoreanContent = JSON.parse(jsonText);

    // 검증
    if (!result.modern || !result.ipa || !result.korean_pronunciation) {
      throw new Error('Missing required fields in response');
    }

    return result;

  } catch (error: any) {
    console.error(`   ❌ AI 생성 실패 (${verse.reference}):`, error.message);
    throw error;
  }
}

/**
 * Supabase 업데이트
 */
async function updateVerse(verseId: string, content: KoreanContent): Promise<void> {
  const { error } = await supabase
    .from('verses')
    .update({
      modern: content.modern,
      ipa: content.ipa,
      korean_pronunciation: content.korean_pronunciation
    })
    .eq('id', verseId);

  if (error) {
    throw new Error(`Supabase update failed: ${error.message}`);
  }
}

/**
 * TODO 상태인 구절 가져오기
 */
async function getTodoVerses(startChapter: number, endChapter: number, limit?: number): Promise<Verse[]> {
  let query = supabase
    .from('verses')
    .select('id, reference, hebrew, translation, chapter, verse_number')
    .eq('book_id', 'genesis')
    .gte('chapter', startChapter)
    .lte('chapter', endChapter)
    .like('modern', '[TODO%')
    .order('chapter', { ascending: true })
    .order('verse_number', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch verses: ${error.message}`);
  }

  return data || [];
}

/**
 * 배치 처리
 */
async function processBatch(
  verses: Verse[],
  onProgress?: (current: number, total: number, verse: Verse) => void
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < verses.length; i++) {
    const verse = verses[i];

    try {
      if (onProgress) {
        onProgress(i + 1, verses.length, verse);
      }

      // AI 생성
      const content = await generateKoreanContent(verse);

      // Supabase 업데이트
      await updateVerse(verse.id, content);

      success++;
      console.log(`   ✅ ${verse.reference}: "${content.modern.substring(0, 50)}..."`);

      // API rate limit 방지 (1초 대기)
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      failed++;
      console.error(`   ❌ ${verse.reference}: ${error.message}`);
    }
  }

  return { success, failed };
}

/**
 * 메인 실행
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'test'; // test | full
  const startChapter = parseInt(args[1]) || 4;
  const endChapter = parseInt(args[2]) || 50;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 AI 기반 한글 컨텐츠 생성');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // API 키 확인
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY가 설정되지 않았습니다.');
    console.log('\n.env.local에 다음을 추가하세요:');
    console.log('ANTHROPIC_API_KEY=your-api-key\n');
    process.exit(1);
  }

  try {
    // TODO 구절 가져오기
    const limit = mode === 'test' ? 10 : undefined;
    console.log(`📖 TODO 구절 조회 중 (Genesis ${startChapter}-${endChapter}장)...`);

    const verses = await getTodoVerses(startChapter, endChapter, limit);

    if (verses.length === 0) {
      console.log('\n✅ 모든 구절이 이미 번역되었습니다!\n');
      return;
    }

    console.log(`   ✅ ${verses.length}개 구절 발견\n`);

    if (mode === 'test') {
      console.log('🧪 테스트 모드: 처음 10개 구절만 번역합니다.\n');
    } else {
      console.log(`⚠️  전체 모드: ${verses.length}개 구절 번역 (예상 시간: ${Math.ceil(verses.length / 60)}분)\n`);
      console.log('계속하려면 5초 안에 Ctrl+C로 취소하세요...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // 처리 시작
    console.log('🚀 번역 시작...\n');
    const startTime = Date.now();

    const { success, failed } = await processBatch(verses, (current, total, verse) => {
      console.log(`\n[${current}/${total}] ${verse.reference} 번역 중...`);
    });

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    // 결과 출력
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 번역 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 요약:');
    console.log(`   - 성공: ${success}/${verses.length}`);
    console.log(`   - 실패: ${failed}/${verses.length}`);
    console.log(`   - 소요 시간: ${duration}분`);
    console.log(`   - 예상 비용: ~$${(verses.length * 0.01).toFixed(2)}\n`);

    if (failed > 0) {
      console.log('⚠️  실패한 구절은 다시 실행하여 재시도할 수 있습니다.\n');
    }

  } catch (error: any) {
    console.error('\n❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 실행
main();
