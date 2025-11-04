/**
 * Replicate API 인증 테스트
 */

import Replicate from 'replicate';
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url)).slice(0, -1);

// .env.local 로드
config({ path: join(__dirname, '../../.env.local') });

console.log('🔍 환경 변수 확인:');
console.log('  VITE_REPLICATE_API_TOKEN:', process.env.VITE_REPLICATE_API_TOKEN ? `설정됨 (${process.env.VITE_REPLICATE_API_TOKEN.length}자)` : '❌ 없음');
console.log('  REPLICATE_API_TOKEN:', process.env.REPLICATE_API_TOKEN ? `설정됨 (${process.env.REPLICATE_API_TOKEN.length}자)` : '❌ 없음');

const token = process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;

if (!token) {
  console.error('\n❌ API 토큰이 없습니다!');
  process.exit(1);
}

console.log(`\n✅ 사용할 토큰: ${token.substring(0, 10)}...${token.substring(token.length - 4)}\n`);

const replicate = new Replicate({ auth: token });

console.log('🔧 Replicate 클라이언트 초기화 완료\n');

async function testAPI() {
  try {
    console.log('📡 Replicate API 테스트 중...\n');

    // 간단한 모델 실행 테스트
    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro" as any,
      {
        input: {
          prompt: "Simple test image: a red circle on white background",
          aspect_ratio: "9:16",
          output_format: "jpg",
          output_quality: 80
        }
      }
    );

    console.log('\n📦 API 응답:');
    console.log('  Type:', typeof output);
    console.log('  Content:', JSON.stringify(output, null, 2));

    if (typeof output === 'string') {
      console.log('\n✅ 이미지 생성 성공!');
      console.log('  URL:', output);
    } else if (Array.isArray(output)) {
      console.log('\n✅ 이미지 생성 성공 (배열)!');
      console.log('  URL:', output[0]);
    } else {
      console.log('\n⚠️  예상치 못한 응답 형식');
    }

  } catch (error: any) {
    console.error('\n❌ API 테스트 실패:');
    console.error('  Error:', error.message);
    if (error.response) {
      console.error('  Response:', JSON.stringify(error.response, null, 2));
    }
  }
}

testAPI();
