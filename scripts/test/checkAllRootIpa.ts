/**
 * 모든 단어의 root_ipa 검사 및 수정 스크립트
 * Genesis 전체를 검사하여 root_ipa가 올바른지 확인
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface WordData {
  id: string;
  hebrew: string;
  meaning: string;
  root: string;
  ipa: string;
  root_ipa: string | null;
  is_combined_form: boolean;
  verse_reference: string;
}

async function checkAllRootIpa() {
  console.log('🔍 모든 단어의 root_ipa 검사 시작\n');

  // Genesis의 모든 단어 가져오기
  const { data: words, error } = await supabase
    .from('words')
    .select(`
      id,
      hebrew,
      meaning,
      root,
      ipa,
      root_ipa,
      is_combined_form,
      position,
      verses!inner (
        reference,
        chapter,
        verse_number
      )
    `)
    .eq('verses.book_id', 'genesis')
    .order('position', { ascending: true });

  if (error || !words) {
    console.error('❌ 단어 조회 실패:', error);
    return;
  }

  // JavaScript에서 정렬 (chapter, verse_number, position 순)
  words.sort((a: any, b: any) => {
    if (a.verses.chapter !== b.verses.chapter) {
      return a.verses.chapter - b.verses.chapter;
    }
    if (a.verses.verse_number !== b.verses.verse_number) {
      return a.verses.verse_number - b.verses.verse_number;
    }
    return a.position - b.position;
  });

  console.log(`✅ Genesis 총 ${words.length}개 단어 로드\n`);
  console.log('='.repeat(120));

  const issues: string[] = [];
  const corrections: string[] = [];

  words.forEach((word: any, idx: number) => {
    const verse_reference = word.verses.reference;
    const rootHebrew = word.root.split('(')[0].trim();

    console.log(`\n${idx + 1}. ${verse_reference} | ${word.hebrew} (${word.meaning})`);
    console.log(`   어근: ${rootHebrew}`);
    console.log(`   전체 IPA: ${word.ipa || 'NULL'}`);
    console.log(`   어근 IPA: ${word.root_ipa || 'NULL'}`);
    console.log(`   결합형: ${word.is_combined_form ? 'YES' : 'NO'}`);

    // 문제 감지
    const problems: string[] = [];

    // 1. root_ipa가 NULL
    if (!word.root_ipa) {
      problems.push('❌ root_ipa가 NULL');
    }

    // 2. 결합형인데 root_ipa가 full ipa와 동일
    if (word.is_combined_form && word.root_ipa === word.ipa) {
      problems.push('⚠️  결합형인데 root_ipa가 전체 IPA와 동일 (접두사 제거 안됨)');
    }

    // 3. 단독형인데 root_ipa가 full ipa와 다름
    if (!word.is_combined_form && word.root_ipa && word.root_ipa !== word.ipa) {
      problems.push('⚠️  단독형인데 root_ipa가 전체 IPA와 다름');
    }

    // 4. root_ipa가 여전히 접두사 패턴 포함
    if (word.root_ipa && word.is_combined_form) {
      if (word.root_ipa.match(/^(və|ve|bə|be|lə|le|mə|me|kə|ke|ha|he)/i)) {
        problems.push('⚠️  root_ipa에 여전히 접두사 패턴 포함');
      }
    }

    if (problems.length > 0) {
      console.log(`   ${problems.join('\n   ')}`);
      issues.push(`${verse_reference} | ${word.hebrew} | ${problems.join(', ')}`);

      // 수정 SQL 생성
      const suggestedRootIpa = word.root_ipa || 'NEEDS_MANUAL_REVIEW';
      corrections.push(
        `-- ${verse_reference} | ${word.hebrew} (${word.meaning})\n` +
        `-- Root: ${rootHebrew}\n` +
        `-- Full IPA: ${word.ipa}\n` +
        `-- Current root_ipa: ${word.root_ipa || 'NULL'}\n` +
        `-- Issues: ${problems.join(', ')}\n` +
        `UPDATE words SET root_ipa = '${suggestedRootIpa}' WHERE id = '${word.id}'; -- TODO: Verify and correct\n`
      );
    } else {
      console.log(`   ✅ 정상`);
    }
  });

  console.log('\n' + '='.repeat(120));
  console.log(`\n📊 검사 결과:\n`);
  console.log(`   총 단어: ${words.length}개`);
  console.log(`   문제 발견: ${issues.length}개`);
  console.log(`   정상: ${words.length - issues.length}개\n`);

  if (issues.length > 0) {
    console.log('❌ 문제가 있는 단어들:\n');
    issues.slice(0, 20).forEach(issue => {
      console.log(`   ${issue}`);
    });

    if (issues.length > 20) {
      console.log(`   ... 외 ${issues.length - 20}개 더`);
    }

    // 수정 SQL 파일 생성
    const sqlFilePath = path.join(process.cwd(), 'scripts/output/fix_root_ipa.sql');
    fs.mkdirSync(path.dirname(sqlFilePath), { recursive: true });

    const sqlContent = [
      '-- ============================================================================',
      '-- Root IPA Corrections',
      `-- Generated: ${new Date().toISOString()}`,
      `-- Total issues: ${issues.length}`,
      '-- ============================================================================\n',
      '-- ⚠️  IMPORTANT: Review and correct each root_ipa value before executing!\n',
      ...corrections
    ].join('\n');

    fs.writeFileSync(sqlFilePath, sqlContent, 'utf-8');

    console.log(`\n📝 수정 SQL 파일 생성됨: ${sqlFilePath}`);
    console.log(`   각 단어의 root_ipa를 검토하고 수정한 후 Supabase에서 실행하세요.\n`);
  } else {
    console.log('✅ 모든 단어의 root_ipa가 정상입니다!\n');
  }

  // Genesis 1:1 상세 출력
  console.log('\n' + '='.repeat(120));
  console.log('\n📖 Genesis 1:1 상세 확인:\n');

  const genesis1_1 = words.filter((w: any) => w.verses.reference === 'Genesis 1:1');
  genesis1_1.forEach((w: any) => {
    console.log(`${w.hebrew.padEnd(15)} | Full: ${(w.ipa || '').padEnd(15)} | Root: ${(w.root_ipa || 'NULL').padEnd(15)} | ${w.is_combined_form ? '결합형' : '단독형'}`);
  });

  console.log('\n' + '='.repeat(120));
}

checkAllRootIpa().catch(console.error);
