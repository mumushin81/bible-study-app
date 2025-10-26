import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorageFiles() {
  console.log('🔍 Supabase Storage 파일 확인\n');

  try {
    // hebrew-icons 버킷의 icons 폴더 목록 확인
    const { data: files, error } = await supabase.storage
      .from('hebrew-icons')
      .list('icons', {
        limit: 20,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('❌ Storage 에러:', error);
      return;
    }

    console.log(`📁 hebrew-icons/icons 폴더에 ${files?.length || 0}개 파일 존재:\n`);

    files?.forEach((file, idx) => {
      console.log(`${idx + 1}. ${file.name} (${file.metadata?.size || 'unknown size'})`);
    });

    // 실제 DB에 저장된 URL 패턴 확인
    console.log('\n\n📋 DB에 저장된 URL 패턴:\n');
    const { data: words } = await supabase
      .from('words')
      .select('hebrew, meaning, icon_url')
      .not('icon_url', 'is', null)
      .limit(3);

    words?.forEach((word: any, idx: number) => {
      const fileName = word.icon_url?.split('/').pop() || '';
      console.log(`${idx + 1}. ${word.hebrew}: ${fileName}`);
    });

  } catch (err) {
    console.error('❌ 에러:', err);
  }
}

checkStorageFiles();
