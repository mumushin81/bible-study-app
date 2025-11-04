const Replicate = require('replicate');

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN
});

async function testImageGeneration() {
  try {
    console.log('🧪 Replicate API 이미지 생성 테스트 시작');
    console.log('🔑 API 토큰:', process.env.VITE_REPLICATE_API_TOKEN ? '✅ 있음' : '❌ 없음');

    const output = await replicate.run(
      "stability-ai/stable-diffusion",
      {
        input: {
          prompt: "A beautiful artistic representation of the Hebrew word בראשית",
          width: 512,
          height: 512,
          num_outputs: 1,
          num_inference_steps: 50
        }
      }
    );

    console.log('✅ 이미지 생성 성공');
    console.log('🖼️ 이미지 URL:', output);
  } catch (error) {
    console.error('❌ 이미지 생성 실패:', error);
  }
}

testImageGeneration();