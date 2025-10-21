import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkGenesis8() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Genesis 8장 Words & Commentaries 분석');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 해당 챕터의 구절 조회
  const { data: verses, error: vError } = await supabase
    .from('verses')
    .select('id, reference, hebrew, ipa, korean_pronunciation, modern')
    .eq('book_id', 'genesis')
    .eq('chapter', 8)
    .order('verse_number', { ascending: true });

  if (vError) {
    console.error('Error fetching verses:', vError);
    return;
  }

  console.log(`총 구절 수: ${verses?.length || 0}`);

  if (!verses || verses.length === 0) {
    console.log('❌ Genesis 8 구절을 찾을 수 없습니다.');
    return;
  }

  // Count verses with content
  const withIpa = verses.filter(v => v.ipa && v.ipa.trim() !== '').length;
  const withKorean = verses.filter(v => v.korean_pronunciation && v.korean_pronunciation.trim() !== '').length;
  const withModern = verses.filter(v => v.modern && v.modern.trim() !== '').length;

  console.log(`\n📝 기본 필드:`);
  console.log(`  - IPA: ${withIpa}/${verses.length}`);
  console.log(`  - 한글 발음: ${withKorean}/${verses.length}`);
  console.log(`  - 현대어: ${withModern}/${verses.length}`);

  // Words 조회
  const { data: words, count: wordsCount } = await supabase
    .from('words')
    .select('id', { count: 'exact' })
    .in('verse_id', verses.map(v => v.id));

  console.log(`\n📚 Words: ${wordsCount || 0}개`);

  // Commentaries 조회
  const { data: commentaries, count: commCount } = await supabase
    .from('commentaries')
    .select('id', { count: 'exact' })
    .in('verse_id', verses.map(v => v.id));

  console.log(`💬 Commentaries: ${commCount || 0}개`);

  // Commentary Sections 조회
  if (commentaries && commentaries.length > 0) {
    const { count: sectionsCount } = await supabase
      .from('commentary_sections')
      .select('id', { count: 'exact' })
      .in('commentary_id', commentaries.map(c => c.id));

    console.log(`   - Sections: ${sectionsCount || 0}개`);
  }

  // Why Questions 조회
  const { count: questionsCount } = await supabase
    .from('why_questions')
    .select('id', { count: 'exact' })
    .in('verse_id', verses.map(v => v.id));

  console.log(`❓ Why Questions: ${questionsCount || 0}개`);

  // Conclusions 조회
  const { count: conclusionsCount } = await supabase
    .from('commentary_conclusions')
    .select('id', { count: 'exact' })
    .in('verse_id', verses.map(v => v.id));

  console.log(`💡 Conclusions: ${conclusionsCount || 0}개`);

  // 구절별 상세 정보
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 구절별 상세 정보');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const verse of verses) {
    const { count: vWords } = await supabase
      .from('words')
      .select('id', { count: 'exact' })
      .eq('verse_id', verse.id);

    const { count: vComm } = await supabase
      .from('commentaries')
      .select('id', { count: 'exact' })
      .eq('verse_id', verse.id);

    const hasIpa = verse.ipa && verse.ipa.trim() !== '';
    const hasKorean = verse.korean_pronunciation && verse.korean_pronunciation.trim() !== '';
    const hasModern = verse.modern && verse.modern.trim() !== '';

    const status = (hasIpa && hasKorean && hasModern && vWords && vComm) ? '✅' : '❌';

    console.log(`${status} ${verse.reference} (${verse.id})`);
    console.log(`   Hebrew: ${verse.hebrew ? '✓' : '✗'} | IPA: ${hasIpa ? '✓' : '✗'} | Korean: ${hasKorean ? '✓' : '✗'} | Modern: ${hasModern ? '✓' : '✗'}`);
    console.log(`   Words: ${vWords || 0} | Commentaries: ${vComm || 0}`);
  }

  // 상태 요약
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 상태 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const needsContent = verses.filter(v => {
    const hasIpa = v.ipa && v.ipa.trim() !== '';
    const hasKorean = v.korean_pronunciation && v.korean_pronunciation.trim() !== '';
    const hasModern = v.modern && v.modern.trim() !== '';
    return !hasIpa || !hasKorean || !hasModern;
  });

  if (needsContent.length > 0) {
    console.log(`❌ ${needsContent.length}개 구절에 기본 컨텐츠 필요:`);
    needsContent.forEach(v => console.log(`   - ${v.reference}`));
  }

  if ((wordsCount || 0) === 0) {
    console.log(`\n❌ Words가 없습니다! 모든 ${verses.length}개 구절에 단어 분석 필요`);
  } else if ((wordsCount || 0) < verses.length * 3) {
    console.log(`\n⚠️  Words가 적습니다 (평균 ${Math.round((wordsCount || 0) / verses.length)}개/구절)`);
  } else {
    console.log(`\n✅ Words 존재 (평균 ${Math.round((wordsCount || 0) / verses.length)}개/구절)`);
  }

  if ((commCount || 0) === 0) {
    console.log(`❌ Commentaries가 없습니다! 모든 ${verses.length}개 구절에 주석 필요`);
  } else if ((commCount || 0) < verses.length) {
    console.log(`⚠️  일부 구절에만 Commentaries 존재 (${commCount}/${verses.length})`);
  } else {
    console.log(`✅ Commentaries 존재 (${commCount}/${verses.length})`);
  }
}

checkGenesis8().catch(console.error);
