import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DuplicateResult {
  table: string;
  duplicateKey: string;
  count: number;
  examples: any[];
}

async function checkDuplicates() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 데이터베이스 중복 검사 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const duplicates: DuplicateResult[] = [];

  // 1. verses 테이블 중복 검사 (book_id + chapter + verse_number)
  console.log('1️⃣  Verses 테이블 중복 검사...\n');
  const { data: versesDuplicates } = await supabase.rpc('check_verse_duplicates') as any;

  // SQL 쿼리로 직접 확인
  const { data: versesData } = await supabase
    .from('verses')
    .select('id, book_id, chapter, verse_number');

  if (versesData) {
    const verseMap = new Map<string, any[]>();
    for (const verse of versesData) {
      const key = `${verse.book_id}_${verse.chapter}_${verse.verse_number}`;
      if (!verseMap.has(key)) {
        verseMap.set(key, []);
      }
      verseMap.get(key)!.push(verse);
    }

    const duplicateVerses = Array.from(verseMap.entries())
      .filter(([_, verses]) => verses.length > 1);

    if (duplicateVerses.length > 0) {
      console.log(`❌ ${duplicateVerses.length}개의 중복된 구절 발견:\n`);
      duplicateVerses.slice(0, 10).forEach(([key, verses]) => {
        console.log(`   ${key}: ${verses.length}개 중복`);
        console.log(`      IDs: ${verses.map(v => v.id.substring(0, 8)).join(', ')}`);
      });
      if (duplicateVerses.length > 10) {
        console.log(`   ... 외 ${duplicateVerses.length - 10}개 더\n`);
      }
      duplicates.push({
        table: 'verses',
        duplicateKey: 'book_id + chapter + verse_number',
        count: duplicateVerses.length,
        examples: duplicateVerses.slice(0, 5).map(([key, verses]) => ({
          key,
          count: verses.length,
          ids: verses.map(v => v.id)
        }))
      });
    } else {
      console.log('✅ 구절 중복 없음\n');
    }
  }

  // 2. words 테이블 중복 검사 (verse_id + hebrew + position 조합)
  console.log('2️⃣  Words 테이블 중복 검사...\n');
  const { data: wordsData } = await supabase
    .from('words')
    .select('id, verse_id, hebrew, meaning, position');

  if (wordsData) {
    const wordMap = new Map<string, any[]>();
    for (const word of wordsData) {
      // verse_id + hebrew + position 조합으로 중복 체크
      const key = `${word.verse_id}_${word.hebrew}_${word.position || 'null'}`;
      if (!wordMap.has(key)) {
        wordMap.set(key, []);
      }
      wordMap.get(key)!.push(word);
    }

    const duplicateWords = Array.from(wordMap.entries())
      .filter(([_, words]) => words.length > 1);

    if (duplicateWords.length > 0) {
      console.log(`❌ ${duplicateWords.length}개의 중복된 단어 발견:\n`);
      duplicateWords.slice(0, 10).forEach(([key, words]) => {
        console.log(`   ${words[0].hebrew} (verse_id: ${words[0].verse_id?.substring(0, 8) || 'null'}): ${words.length}개 중복`);
        console.log(`      IDs: ${words.map(w => w.id.substring(0, 8)).join(', ')}`);
      });
      if (duplicateWords.length > 10) {
        console.log(`   ... 외 ${duplicateWords.length - 10}개 더\n`);
      }
      duplicates.push({
        table: 'words',
        duplicateKey: 'verse_id + hebrew + position',
        count: duplicateWords.length,
        examples: duplicateWords.slice(0, 5).map(([key, words]) => ({
          key,
          count: words.length,
          hebrew: words[0].hebrew,
          ids: words.map(w => w.id)
        }))
      });
    } else {
      console.log('✅ 단어 중복 없음\n');
    }

    // 고아 단어 검사 (verse_id가 null)
    const orphanWords = wordsData.filter(w => !w.verse_id);
    if (orphanWords.length > 0) {
      console.log(`⚠️  ${orphanWords.length}개의 고아 단어 발견 (verse_id가 null):\n`);
      orphanWords.slice(0, 10).forEach(word => {
        console.log(`   ${word.hebrew} (${word.meaning}) - ID: ${word.id.substring(0, 8)}`);
      });
      if (orphanWords.length > 10) {
        console.log(`   ... 외 ${orphanWords.length - 10}개 더\n`);
      }
    }
  }

  // 3. commentaries 테이블 중복 검사 (verse_id)
  console.log('3️⃣  Commentaries 테이블 중복 검사...\n');
  const { data: commentariesData } = await supabase
    .from('commentaries')
    .select('id, verse_id');

  if (commentariesData) {
    const commentaryMap = new Map<string, any[]>();
    for (const commentary of commentariesData) {
      const key = commentary.verse_id;
      if (!commentaryMap.has(key)) {
        commentaryMap.set(key, []);
      }
      commentaryMap.get(key)!.push(commentary);
    }

    const duplicateCommentaries = Array.from(commentaryMap.entries())
      .filter(([_, commentaries]) => commentaries.length > 1);

    if (duplicateCommentaries.length > 0) {
      console.log(`❌ ${duplicateCommentaries.length}개의 중복된 주석 발견:\n`);
      duplicateCommentaries.slice(0, 10).forEach(([verseId, commentaries]) => {
        const verseIdDisplay = verseId ? verseId.substring(0, 8) : 'null';
        console.log(`   verse_id ${verseIdDisplay}: ${commentaries.length}개 중복`);
        console.log(`      IDs: ${commentaries.map(c => c.id.substring(0, 8)).join(', ')}`);
      });
      if (duplicateCommentaries.length > 10) {
        console.log(`   ... 외 ${duplicateCommentaries.length - 10}개 더\n`);
      }
      duplicates.push({
        table: 'commentaries',
        duplicateKey: 'verse_id',
        count: duplicateCommentaries.length,
        examples: duplicateCommentaries.slice(0, 5).map(([verseId, commentaries]) => ({
          verse_id: verseId,
          count: commentaries.length,
          ids: commentaries.map(c => c.id)
        }))
      });
    } else {
      console.log('✅ 주석 중복 없음\n');
    }
  }

  // 4. hebrew_roots 테이블 중복 검사 (root_hebrew)
  console.log('4️⃣  Hebrew Roots 테이블 중복 검사...\n');
  const { data: rootsData } = await supabase
    .from('hebrew_roots')
    .select('id, root_hebrew, root_meaning');

  if (rootsData) {
    const rootMap = new Map<string, any[]>();
    for (const root of rootsData) {
      const key = root.root_hebrew;
      if (!rootMap.has(key)) {
        rootMap.set(key, []);
      }
      rootMap.get(key)!.push(root);
    }

    const duplicateRoots = Array.from(rootMap.entries())
      .filter(([_, roots]) => roots.length > 1);

    if (duplicateRoots.length > 0) {
      console.log(`❌ ${duplicateRoots.length}개의 중복된 어근 발견:\n`);
      duplicateRoots.slice(0, 10).forEach(([rootHebrew, roots]) => {
        console.log(`   ${rootHebrew}: ${roots.length}개 중복`);
        console.log(`      의미: ${roots.map(r => r.root_meaning).join(' / ')}`);
        console.log(`      IDs: ${roots.map(r => r.id.substring(0, 8)).join(', ')}`);
      });
      if (duplicateRoots.length > 10) {
        console.log(`   ... 외 ${duplicateRoots.length - 10}개 더\n`);
      }
      duplicates.push({
        table: 'hebrew_roots',
        duplicateKey: 'root_hebrew',
        count: duplicateRoots.length,
        examples: duplicateRoots.slice(0, 5).map(([rootHebrew, roots]) => ({
          root_hebrew: rootHebrew,
          count: roots.length,
          meanings: roots.map(r => r.root_meaning),
          ids: roots.map(r => r.id)
        }))
      });
    } else {
      console.log('✅ 어근 중복 없음\n');
    }
  }

  // 5. word_metadata 테이블 중복 검사 (word_hebrew)
  console.log('5️⃣  Word Metadata 테이블 중복 검사...\n');
  const { data: metadataData } = await supabase
    .from('word_metadata')
    .select('id, word_hebrew');

  if (metadataData) {
    const metadataMap = new Map<string, any[]>();
    for (const metadata of metadataData) {
      const key = metadata.word_hebrew;
      if (!metadataMap.has(key)) {
        metadataMap.set(key, []);
      }
      metadataMap.get(key)!.push(metadata);
    }

    const duplicateMetadata = Array.from(metadataMap.entries())
      .filter(([_, metadata]) => metadata.length > 1);

    if (duplicateMetadata.length > 0) {
      console.log(`❌ ${duplicateMetadata.length}개의 중복된 메타데이터 발견:\n`);
      duplicateMetadata.slice(0, 10).forEach(([wordHebrew, metadata]) => {
        console.log(`   ${wordHebrew}: ${metadata.length}개 중복`);
        console.log(`      IDs: ${metadata.map(m => m.id.substring(0, 8)).join(', ')}`);
      });
      if (duplicateMetadata.length > 10) {
        console.log(`   ... 외 ${duplicateMetadata.length - 10}개 더\n`);
      }
      duplicates.push({
        table: 'word_metadata',
        duplicateKey: 'word_hebrew',
        count: duplicateMetadata.length,
        examples: duplicateMetadata.slice(0, 5).map(([wordHebrew, metadata]) => ({
          word_hebrew: wordHebrew,
          count: metadata.length,
          ids: metadata.map(m => m.id)
        }))
      });
    } else {
      console.log('✅ 메타데이터 중복 없음\n');
    }
  }

  // 6. word_derivations 테이블 중복 검사
  console.log('6️⃣  Word Derivations 테이블 중복 검사...\n');
  const { data: derivationsData } = await supabase
    .from('word_derivations')
    .select('id, word_hebrew, root_hebrew');

  if (derivationsData) {
    const derivationMap = new Map<string, any[]>();
    for (const derivation of derivationsData) {
      const key = `${derivation.word_hebrew}_${derivation.root_hebrew}`;
      if (!derivationMap.has(key)) {
        derivationMap.set(key, []);
      }
      derivationMap.get(key)!.push(derivation);
    }

    const duplicateDerivations = Array.from(derivationMap.entries())
      .filter(([_, derivations]) => derivations.length > 1);

    if (duplicateDerivations.length > 0) {
      console.log(`❌ ${duplicateDerivations.length}개의 중복된 파생어 발견:\n`);
      duplicateDerivations.slice(0, 10).forEach(([key, derivations]) => {
        const [wordHebrew, rootHebrew] = key.split('_');
        console.log(`   ${wordHebrew} → ${rootHebrew}: ${derivations.length}개 중복`);
        console.log(`      IDs: ${derivations.map(d => d.id.substring(0, 8)).join(', ')}`);
      });
      if (duplicateDerivations.length > 10) {
        console.log(`   ... 외 ${duplicateDerivations.length - 10}개 더\n`);
      }
      duplicates.push({
        table: 'word_derivations',
        duplicateKey: 'word_hebrew + root_hebrew',
        count: duplicateDerivations.length,
        examples: duplicateDerivations.slice(0, 5).map(([key, derivations]) => ({
          key,
          count: derivations.length,
          ids: derivations.map(d => d.id)
        }))
      });
    } else {
      console.log('✅ 파생어 중복 없음\n');
    }
  }

  // 최종 요약
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 중복 검사 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (duplicates.length === 0) {
    console.log('✅ 모든 테이블에서 중복이 발견되지 않았습니다!\n');
  } else {
    console.log(`⚠️  총 ${duplicates.length}개 테이블에서 중복 발견:\n`);
    duplicates.forEach(dup => {
      console.log(`   📋 ${dup.table}: ${dup.count}개 중복 (${dup.duplicateKey})`);
    });
    console.log('\n💡 중복 제거가 필요합니다.\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return duplicates;
}

checkDuplicates().catch(console.error);
