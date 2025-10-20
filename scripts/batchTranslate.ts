import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TranslationData {
  id: string;
  modern: string;
  ipa: string;
  korean_pronunciation: string;
}

async function batchUpdate(translations: TranslationData[]) {
  console.log(`🚀 ${translations.length}개 구절 업데이트 시작...\n`);

  let success = 0;
  let failed = 0;

  for (const trans of translations) {
    try {
      const { error } = await supabase
        .from('verses')
        .update({
          modern: trans.modern,
          ipa: trans.ipa,
          korean_pronunciation: trans.korean_pronunciation
        })
        .eq('id', trans.id);

      if (error) {
        console.error(`❌ ${trans.id}: ${error.message}`);
        failed++;
      } else {
        console.log(`✅ ${trans.id}`);
        success++;
      }
    } catch (error: any) {
      console.error(`❌ ${trans.id}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ 완료: ${success}/${translations.length}`);
  console.log(`❌ 실패: ${failed}/${translations.length}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

async function main() {
  const translationsFile = process.argv[2] || 'translations.json';

  if (!fs.existsSync(translationsFile)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${translationsFile}`);
    process.exit(1);
  }

  const translations: TranslationData[] = JSON.parse(fs.readFileSync(translationsFile, 'utf-8'));

  await batchUpdate(translations);
}

main();
