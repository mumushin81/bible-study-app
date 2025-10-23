import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface VerseData {
  verseId: string;
  modern?: string;
}

async function fillTranslations() {
  console.log('\n📝 Genesis 1-3 translation 필드 채우기 시작...\n');

  // Genesis 1-3 JSON 파일들 찾기
  const dataDir = path.join(process.cwd(), 'data/generated');
  const files = fs.readdirSync(dataDir)
    .filter(f => f.startsWith('genesis_') && (
      f.startsWith('genesis_1_') ||
      f.startsWith('genesis_2_') ||
      f.startsWith('genesis_3_')
    ))
    .filter(f => f.endsWith('.json'));

  console.log(`📁 발견된 파일: ${files.length}개\n`);

  let totalUpdated = 0;
  let totalFailed = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const verses: VerseData[] = JSON.parse(content);

      if (!Array.isArray(verses)) {
        console.log(`⚠️  ${file}: 배열 형식 아님, 스킵`);
        continue;
      }

      console.log(`\n🔄 ${file} 처리 중...`);

      for (const verse of verses) {
        if (!verse.verseId || !verse.modern) {
          console.log(`  ⚠️  ${verse.verseId || 'unknown'}: modern 필드 없음, 스킵`);
          continue;
        }

        // verseId에서 chapter와 verse_number 추출 (예: genesis_1_1 -> chapter: 1, verse: 1)
        const match = verse.verseId.match(/genesis_(\d+)_(\d+)/);
        if (!match) {
          console.log(`  ⚠️  ${verse.verseId}: verseId 형식 오류, 스킵`);
          continue;
        }
        const chapter = parseInt(match[1]);
        const verseNumber = parseInt(match[2]);

        // translation 필드 업데이트
        const { error } = await supabase
          .from('verses')
          .update({ translation: verse.modern })
          .eq('book_id', 'genesis')
          .eq('chapter', chapter)
          .eq('verse_number', verseNumber);

        if (error) {
          console.log(`  ❌ ${verse.verseId}: ${error.message}`);
          totalFailed++;
        } else {
          console.log(`  ✅ ${verse.verseId}: "${verse.modern.substring(0, 40)}..."`);
          totalUpdated++;
        }
      }
    } catch (err) {
      console.log(`❌ ${file}: ${err}`);
    }
  }

  console.log('\n' + '━'.repeat(50));
  console.log(`\n✅ 완료: ${totalUpdated}개 업데이트`);
  console.log(`❌ 실패: ${totalFailed}개\n`);
}

fillTranslations();
