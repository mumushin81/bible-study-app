import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseStorage() {
  console.log('🔍 Supabase Storage 확인 중...\n');

  try {
    // hebrew-icons 버킷의 파일 목록 조회
    const { data: files, error } = await supabase
      .storage
      .from('hebrew-icons')
      .list('icons', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('❌ Storage 조회 실패:', error.message);

      // 버킷 목록 확인
      console.log('\n📦 사용 가능한 버킷 확인 중...');
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

      if (bucketsError) {
        console.error('버킷 목록 조회 실패:', bucketsError.message);
      } else {
        console.log('\n사용 가능한 버킷:');
        buckets?.forEach((bucket, i) => {
          console.log(`${i + 1}. ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
        });
      }
      return;
    }

    console.log(`✅ Supabase Storage에 저장된 파일: ${files?.length || 0}개\n`);

    if (files && files.length > 0) {
      console.log('📁 파일 샘플 (처음 10개):');
      files.slice(0, 10).forEach((file, i) => {
        const sizeKB = (file.metadata?.size || 0) / 1024;
        console.log(`${i + 1}. ${file.name} (${sizeKB.toFixed(1)} KB)`);
      });

      // 전체 용량 계산
      const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
      const totalMB = totalSize / (1024 * 1024);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Storage 통계');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`총 파일 수: ${files.length}개`);
      console.log(`총 용량: ${totalMB.toFixed(2)} MB`);
      console.log(`평균 파일 크기: ${(totalSize / files.length / 1024).toFixed(1)} KB`);
    } else {
      console.log('⚠️  hebrew-icons/icons/ 폴더가 비어있습니다!');
    }

    // DB의 icon_url 개수와 비교
    const { count: dbCount } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .not('icon_url', 'is', null);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 Storage vs DB 비교');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Storage 파일 수: ${files?.length || 0}개`);
    console.log(`DB icon_url 수: ${dbCount || 0}개`);

    if ((files?.length || 0) === (dbCount || 0)) {
      console.log('✅ 일치함!');
    } else {
      console.log(`⚠️  차이: ${Math.abs((files?.length || 0) - (dbCount || 0))}개`);

      if ((files?.length || 0) > (dbCount || 0)) {
        console.log('   → Storage에 파일은 있지만 DB에 URL이 없는 단어가 있습니다.');
      } else {
        console.log('   → DB에 URL이 있지만 실제 파일이 없을 수 있습니다.');
      }
    }

  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

checkSupabaseStorage();
