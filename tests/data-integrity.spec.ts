import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 로드
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

test.describe('데이터 무결성 테스트', () => {
  test('Genesis 1-3장: Words & Commentaries 존재 검증', async () => {
    console.log('\n🔍 Genesis 1-3장 데이터 무결성 검증 시작\n');

    const criticalIssues: string[] = [];
    const warnings: string[] = [];

    for (let chapter = 1; chapter <= 3; chapter++) {
      // 구절 조회
      const { data: verses } = await supabase
        .from('verses')
        .select('id, reference')
        .eq('book_id', 'genesis')
        .eq('chapter', chapter);

      if (!verses || verses.length === 0) {
        criticalIssues.push(`❌ Genesis ${chapter}장: 구절이 없습니다`);
        continue;
      }

      // Words 조회
      const { count: wordsCount } = await supabase
        .from('words')
        .select('id', { count: 'exact' })
        .in('verse_id', verses.map(v => v.id));

      // Commentaries 조회
      const { count: commCount } = await supabase
        .from('commentaries')
        .select('id', { count: 'exact' })
        .in('verse_id', verses.map(v => v.id));

      console.log(`Genesis ${chapter}장: ${verses.length}개 구절, Words ${wordsCount}개, Commentaries ${commCount}개`);

      // Genesis 1장만 엄격하게 검증 (완전한 데이터 기대)
      if (chapter === 1) {
        const expectedMinWords = verses.length * 3; // 평균 구절당 최소 3개 단어

        if (wordsCount === 0) {
          criticalIssues.push(`❌ Genesis ${chapter}장: Words가 없습니다 (0개)`);
        } else if (wordsCount < expectedMinWords) {
          criticalIssues.push(`⚠️  Genesis ${chapter}장: Words가 부족합니다 (${wordsCount}개, 예상 최소 ${expectedMinWords}개)`);
        }

        if (commCount === 0) {
          criticalIssues.push(`❌ Genesis ${chapter}장: Commentaries가 없습니다`);
        }
      } else {
        // Genesis 2-3장은 진행 중이므로 경고만 출력
        if (wordsCount === 0) {
          warnings.push(`📝 Genesis ${chapter}장: Words 미완성 (0개) - 생성 진행 중`);
        } else if (wordsCount < verses.length * 3) {
          warnings.push(`📝 Genesis ${chapter}장: Words 일부 완성 (${wordsCount}개/${verses.length * 3}개 예상) - 진행 중`);
        }

        if (commCount === 0) {
          warnings.push(`📝 Genesis ${chapter}장: Commentaries 미완성 - 생성 진행 중`);
        }
      }
    }

    // 경고 출력 (테스트 실패 아님)
    if (warnings.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 진행 중인 작업:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      warnings.forEach(warning => console.log(warning));
      console.log('');
    }

    // 결과 출력 (critical issues만 실패 처리)
    if (criticalIssues.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔴 데이터 무결성 문제 발견:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      criticalIssues.forEach(issue => console.log(issue));
      console.log('');

      throw new Error(`데이터 무결성 문제: ${criticalIssues.length}개 발견\n${criticalIssues.join('\n')}`);
    }

    console.log('\n✅ Genesis 1장 데이터 무결성 검증 통과');
    console.log('📝 Genesis 2-3장은 진행 중입니다\n');
  });

  test('모든 구절: 번역 필드 완성도 검증', async () => {
    console.log('\n🔍 Genesis 1-3장 번역 필드 완성도 검증\n');

    const { data: verses } = await supabase
      .from('verses')
      .select('id, reference, hebrew, ipa, korean_pronunciation, modern, translation')
      .eq('book_id', 'genesis')
      .gte('chapter', 1)
      .lte('chapter', 3);

    if (!verses) {
      throw new Error('구절 조회 실패');
    }

    const incomplete: string[] = [];

    verses.forEach(verse => {
      const missing: string[] = [];

      if (!verse.hebrew || verse.hebrew.includes('[TODO')) missing.push('hebrew');
      if (!verse.ipa || verse.ipa.includes('[TODO')) missing.push('ipa');
      if (!verse.korean_pronunciation || verse.korean_pronunciation.includes('[TODO')) missing.push('korean_pronunciation');
      if (!verse.modern || verse.modern.includes('[TODO')) missing.push('modern');
      if (!verse.translation || verse.translation.includes('[TODO')) missing.push('translation');

      if (missing.length > 0) {
        incomplete.push(`${verse.reference}: ${missing.join(', ')} 누락`);
      }
    });

    if (incomplete.length > 0) {
      console.log('❌ 불완전한 구절:');
      incomplete.forEach(issue => console.log(`   ${issue}`));
      throw new Error(`${incomplete.length}개 구절이 불완전합니다`);
    }

    console.log(`✅ ${verses.length}개 구절 모두 완성됨\n`);
  });

  test('Foreign Key 무결성 검증', async () => {
    console.log('\n🔍 Foreign Key 무결성 검증\n');

    // 모든 유효한 verse_id 가져오기
    const { data: verses } = await supabase
      .from('verses')
      .select('id')
      .eq('book_id', 'genesis');

    if (!verses) {
      throw new Error('구절 조회 실패');
    }

    const validVerseIds = new Set(verses.map(v => v.id));

    // Words의 verse_id가 모두 유효한지 확인
    const { data: allWords } = await supabase
      .from('words')
      .select('id, verse_id')
      .limit(1000);

    const orphanWords = allWords?.filter(w => !validVerseIds.has(w.verse_id)) || [];

    if (orphanWords.length > 0) {
      console.log('❌ 유효하지 않은 verse_id를 가진 Words:');
      orphanWords.slice(0, 10).forEach(w => console.log(`   ${w.id} → ${w.verse_id}`));
      throw new Error(`${orphanWords.length}개의 고아 Words 발견`);
    }

    // Commentaries의 verse_id가 모두 유효한지 확인
    const { data: allComm } = await supabase
      .from('commentaries')
      .select('id, verse_id')
      .limit(1000);

    const orphanComm = allComm?.filter(c => !validVerseIds.has(c.verse_id)) || [];

    if (orphanComm.length > 0) {
      console.log('❌ 유효하지 않은 verse_id를 가진 Commentaries:');
      orphanComm.slice(0, 10).forEach(c => console.log(`   ${c.id} → ${c.verse_id}`));
      throw new Error(`${orphanComm.length}개의 고아 Commentaries 발견`);
    }

    console.log(`✅ Foreign Key 무결성 확인 (Words: ${allWords?.length || 0}개, Commentaries: ${allComm?.length || 0}개)\n`);
  });
});
