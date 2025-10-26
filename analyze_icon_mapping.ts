import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createHash } from 'crypto';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function categorizeWord(meaning: string, korean: string): string {
  const text = (meaning + ' ' + korean).toLowerCase();

  if (text.match(/하나님|신|주|거룩|성전|제단/)) return 'divine';
  if (text.match(/하늘|궁창|공간|별|구름/)) return 'celestial';
  if (text.match(/땅|흙|대지|장소|지역/)) return 'earth';
  if (text.match(/물|바다|강|호수|샘/)) return 'water';
  if (text.match(/빛|밝|광명|햇빛/)) return 'light';
  if (text.match(/어둠|밤|어두/)) return 'darkness';
  if (text.match(/생명|탄생|낳|출산|아들|딸/)) return 'life';
  if (text.match(/창조|만들|형성|지으/)) return 'creation';
  if (text.match(/사람|인간|남자|여자|아담|이브/)) return 'person';
  if (text.match(/동물|짐승|새|물고기|생물/)) return 'animal';
  if (text.match(/나무|풀|식물|열매/)) return 'plant';
  if (text.match(/시간|날|년|때|처음|태초/)) return 'time';

  return 'default';
}

function hebrewToFilename(id: string): string {
  return `word_${createHash('md5').update(id).digest('hex')}`;
}

async function analyzeMapping() {
  console.log('🔍 Genesis 1:1 단어 icon_url 매핑 분석\n');

  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, korean, icon_url, verses!inner(reference)')
    .eq('verses.book_id', 'genesis')
    .eq('verses.chapter', 1)
    .eq('verses.verse_number', 1)
    .order('position', { ascending: true })
    .limit(10);

  if (error) {
    console.error('❌ 에러:', error);
    return;
  }

  console.log('단어별 카테고리 및 파일명 분석:\n');

  words?.forEach((word: any, idx: number) => {
    const category = categorizeWord(word.meaning, word.korean);
    const expectedFilename = hebrewToFilename(word.id) + '.jpg';

    // DB에서 실제 파일명 추출
    const actualFilename = word.icon_url ? word.icon_url.split('/').pop() : 'NULL';

    console.log(`${idx + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   ID: ${word.id}`);
    console.log(`   카테고리: ${category}`);
    console.log(`   예상 파일명: ${expectedFilename}`);
    console.log(`   실제 파일명: ${actualFilename}`);
    console.log(`   매칭: ${expectedFilename === actualFilename ? '✅ 일치' : '❌ 불일치'}`);
    console.log('');
  });

  // 불일치 분석
  const mismatches = words?.filter((word: any) => {
    const expectedFilename = hebrewToFilename(word.id) + '.jpg';
    const actualFilename = word.icon_url ? word.icon_url.split('/').pop() : 'NULL';
    return expectedFilename !== actualFilename;
  });

  if (mismatches && mismatches.length > 0) {
    console.log(`\n⚠️  ${mismatches.length}개 단어의 icon_url이 잘못 매핑되었습니다!\n`);
    console.log('가능한 원인:');
    console.log('1. 단어 ID가 변경되었음');
    console.log('2. 업로드 스크립트가 다른 로직을 사용했음');
    console.log('3. 수동으로 icon_url을 수정했음');
  } else {
    console.log('\n✅ 모든 단어의 icon_url이 올바르게 매핑되었습니다!');
  }
}

analyzeMapping();
