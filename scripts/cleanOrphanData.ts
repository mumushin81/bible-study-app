import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanOrphanData() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧹 고아 데이터 정리 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let totalDeleted = 0;

  // 1. 고아 Words 삭제 (verse_id가 null)
  console.log('1️⃣  고아 Words 삭제 중...\n');
  const { data: orphanWords, error: orphanWordsError } = await supabase
    .from('words')
    .select('id, hebrew, meaning')
    .is('verse_id', null);

  if (orphanWordsError) {
    console.error('❌ 고아 단어 조회 실패:', orphanWordsError.message);
  } else if (orphanWords && orphanWords.length > 0) {
    console.log(`⚠️  ${orphanWords.length}개의 고아 단어 발견:\n`);
    orphanWords.slice(0, 10).forEach(word => {
      console.log(`   ${word.hebrew} (${word.meaning}) - ID: ${word.id.substring(0, 8)}`);
    });
    if (orphanWords.length > 10) {
      console.log(`   ... 외 ${orphanWords.length - 10}개 더\n`);
    }

    // 삭제 확인
    console.log('\n🗑️  고아 단어 삭제 중...');
    const { error: deleteError } = await supabase
      .from('words')
      .delete()
      .is('verse_id', null);

    if (deleteError) {
      console.error('❌ 삭제 실패:', deleteError.message);
    } else {
      console.log(`✅ ${orphanWords.length}개의 고아 단어 삭제 완료\n`);
      totalDeleted += orphanWords.length;
    }
  } else {
    console.log('✅ 고아 단어 없음\n');
  }

  // 2. 고아 Commentaries 삭제 (verse_id가 null)
  console.log('2️⃣  고아 Commentaries 삭제 중...\n');
  const { data: orphanCommentaries, error: orphanCommentariesError } = await supabase
    .from('commentaries')
    .select('id, verse_id')
    .is('verse_id', null);

  if (orphanCommentariesError) {
    console.error('❌ 고아 주석 조회 실패:', orphanCommentariesError.message);
  } else if (orphanCommentaries && orphanCommentaries.length > 0) {
    console.log(`⚠️  ${orphanCommentaries.length}개의 고아 주석 발견:\n`);
    orphanCommentaries.slice(0, 10).forEach(commentary => {
      console.log(`   ID: ${commentary.id.substring(0, 8)}`);
    });
    if (orphanCommentaries.length > 10) {
      console.log(`   ... 외 ${orphanCommentaries.length - 10}개 더\n`);
    }

    // 삭제 확인
    console.log('\n🗑️  고아 주석 삭제 중...');
    const { error: deleteError } = await supabase
      .from('commentaries')
      .delete()
      .is('verse_id', null);

    if (deleteError) {
      console.error('❌ 삭제 실패:', deleteError.message);
    } else {
      console.log(`✅ ${orphanCommentaries.length}개의 고아 주석 삭제 완료\n`);
      totalDeleted += orphanCommentaries.length;
    }
  } else {
    console.log('✅ 고아 주석 없음\n');
  }

  // 3. 유효하지 않은 verse_id를 가진 Words 삭제
  console.log('3️⃣  유효하지 않은 verse_id를 가진 Words 삭제 중...\n');

  // 모든 유효한 verse_id 가져오기
  const { data: validVerses } = await supabase
    .from('verses')
    .select('id');

  if (validVerses) {
    const validVerseIds = new Set(validVerses.map(v => v.id));

    // 모든 words 가져오기
    const { data: allWords } = await supabase
      .from('words')
      .select('id, verse_id, hebrew');

    if (allWords) {
      const invalidWords = allWords.filter(w => w.verse_id && !validVerseIds.has(w.verse_id));

      if (invalidWords.length > 0) {
        console.log(`⚠️  ${invalidWords.length}개의 유효하지 않은 verse_id를 가진 단어 발견:\n`);
        invalidWords.slice(0, 10).forEach(word => {
          console.log(`   ${word.hebrew} - verse_id: ${word.verse_id.substring(0, 8)} (존재하지 않음)`);
        });
        if (invalidWords.length > 10) {
          console.log(`   ... 외 ${invalidWords.length - 10}개 더\n`);
        }

        // 삭제
        console.log('\n🗑️  유효하지 않은 단어 삭제 중...');
        const invalidWordIds = invalidWords.map(w => w.id);
        const { error: deleteError } = await supabase
          .from('words')
          .delete()
          .in('id', invalidWordIds);

        if (deleteError) {
          console.error('❌ 삭제 실패:', deleteError.message);
        } else {
          console.log(`✅ ${invalidWords.length}개의 유효하지 않은 단어 삭제 완료\n`);
          totalDeleted += invalidWords.length;
        }
      } else {
        console.log('✅ 유효하지 않은 verse_id를 가진 단어 없음\n');
      }
    }
  }

  // 4. 유효하지 않은 verse_id를 가진 Commentaries 삭제
  console.log('4️⃣  유효하지 않은 verse_id를 가진 Commentaries 삭제 중...\n');

  if (validVerses) {
    const validVerseIds = new Set(validVerses.map(v => v.id));

    // 모든 commentaries 가져오기
    const { data: allCommentaries } = await supabase
      .from('commentaries')
      .select('id, verse_id');

    if (allCommentaries) {
      const invalidCommentaries = allCommentaries.filter(c => c.verse_id && !validVerseIds.has(c.verse_id));

      if (invalidCommentaries.length > 0) {
        console.log(`⚠️  ${invalidCommentaries.length}개의 유효하지 않은 verse_id를 가진 주석 발견:\n`);
        invalidCommentaries.slice(0, 10).forEach(commentary => {
          console.log(`   ID: ${commentary.id.substring(0, 8)} - verse_id: ${commentary.verse_id.substring(0, 8)} (존재하지 않음)`);
        });
        if (invalidCommentaries.length > 10) {
          console.log(`   ... 외 ${invalidCommentaries.length - 10}개 더\n`);
        }

        // 삭제
        console.log('\n🗑️  유효하지 않은 주석 삭제 중...');
        const invalidCommentaryIds = invalidCommentaries.map(c => c.id);
        const { error: deleteError } = await supabase
          .from('commentaries')
          .delete()
          .in('id', invalidCommentaryIds);

        if (deleteError) {
          console.error('❌ 삭제 실패:', deleteError.message);
        } else {
          console.log(`✅ ${invalidCommentaries.length}개의 유효하지 않은 주석 삭제 완료\n`);
          totalDeleted += invalidCommentaries.length;
        }
      } else {
        console.log('✅ 유효하지 않은 verse_id를 가진 주석 없음\n');
      }
    }
  }

  // 최종 요약
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 정리 완료');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (totalDeleted === 0) {
    console.log('✅ 삭제할 고아 데이터가 없습니다.\n');
  } else {
    console.log(`✅ 총 ${totalDeleted}개의 고아 데이터 삭제 완료!\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

cleanOrphanData().catch(console.error);
