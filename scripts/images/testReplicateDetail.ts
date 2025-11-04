/**
 * Replicate API 상세 테스트
 */

import Replicate from 'replicate';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local 로드
config({ path: join(__dirname, '../../.env.local') });

const token = process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;

if (!token) {
  console.error('❌ API 토큰이 없습니다!');
  process.exit(1);
}

console.log(`✅ 토큰: ${token.substring(0, 10)}...${token.substring(token.length - 4)}\n`);

const replicate = new Replicate({ auth: token });

async function testAPI() {
  try {
    console.log('📡 Replicate API 테스트 중...\n');

    const model = "black-forest-labs/flux-1.1-pro";
    const input = {
      prompt: "Simple test: a red circle on white background",
      aspect_ratio: "9:16",
      output_format: "jpg",
      output_quality: 80
    };

    console.log('모델:', model);
    console.log('입력:', JSON.stringify(input, null, 2));
    console.log('\n⏳ 실행 중...\n');

    // API 호출
    const output = await replicate.run(model as any, { input });

    // 응답 분석
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 응답 상세:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('1. Type:', typeof output);
    console.log('2. Is Array:', Array.isArray(output));
    console.log('3. Is null:', output === null);
    console.log('4. Is undefined:', output === undefined);

    console.log('\n5. Constructor:', output?.constructor?.name);
    console.log('6. Object keys:', output ? Object.keys(output) : 'N/A');
    console.log('7. Object.entries:', output ? Object.entries(output) : 'N/A');

    console.log('\n8. JSON stringify:');
    console.log(JSON.stringify(output, null, 2));

    console.log('\n9. toString():');
    console.log(output?.toString ? output.toString() : 'N/A');

    console.log('\n10. valueOf():');
    console.log(output?.valueOf ? output.valueOf() : 'N/A');

    // FileOutput 확인
    if (output && typeof output === 'object') {
      console.log('\n11. 속성 확인:');
      console.log('  - output.url:', (output as any).url);
      console.log('  - output.data:', (output as any).data);
      console.log('  - output.output:', (output as any).output);
      console.log('  - output[0]:', (output as any)[0]);
      console.log('  - output.toString():', output.toString());
    }

    // FileOutput의 read() 메서드 확인
    if (output && typeof output === 'object' && 'read' in output) {
      console.log('\n12. FileOutput.read() 시도...');
      const data = await (output as any).read();
      console.log('  Read result type:', typeof data);
      console.log('  Read result:', data);
    }

    // FileOutput의 url() 메서드 확인
    if (output && typeof output === 'object' && 'url' in output) {
      console.log('\n13. output.url:', (output as any).url);
    }

  } catch (error: any) {
    console.error('\n❌ 오류:');
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
  }
}

testAPI();
