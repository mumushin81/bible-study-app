import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';
import crypto from 'crypto';

const REPLICATE_API_TOKEN = process.env.VITE_REPLICATE_API_TOKEN || '';
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// 히브리어 니크드 제거 함수
function removeNikkud(hebrewWord: string): string {
  return hebrewWord.replace(/[\u0591-\u05C7]/g, '');
}

// MD5 해시 생성 함수
function generateHash(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex');
}

// 단어 중요도 판별 로직
function isImportantWord(word: { hebrew: string, grammar?: string }): boolean {
  const importantGrammars = ['명사', '동사'];
  const importantWords = [
    '하나님', '하늘', '땅', '빛', '어둠',
    '창조하다', '만들다', '말씀하시다',
    '영', '생명', '선', '악', '복',
    '나무', '열매', '동물', '사람'
  ];

  // 문법으로 중요도 판별
  if (word.grammar && importantGrammars.includes(word.grammar)) {
    return true;
  }

  // 특정 단어 목록으로 중요도 판별
  const hebrewWithoutNikkud = removeNikkud(word.hebrew);
  return importantWords.some(w => hebrewWithoutNikkud.includes(w));
}

// 프롬프트 생성 함수
function generatePrompt(word: { hebrew: string, meaning: string }): string {
  const basePrompt = `
    ${word.meaning}, divine concept visualization,
    bright pastel colors, multi-colored palette with pink, blue, purple, yellow, mint,
    soft gradients, NO dark colors,
    9:16 portrait aspect ratio, fill entire frame edge to edge, bottom 20% empty space,
    biblical sacred art, professional color grading, high quality, detailed,
    ethereal glow, soft lighting
  `.trim();

  return basePrompt;
}

// Replicate API 호출 래퍼
async function generateImage(word: {
  hebrew: string,
  meaning: string,
  grammar?: string
}): Promise<string | null> {
  const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
  const isImportant = isImportantWord(word);

  try {
    const prompt = generatePrompt(word);
    const model = isImportant
      ? "lucataco/animate-diff"
      : "black-forest-labs/flux-schnell";

    const modelInputs = isImportant
      ? {
          prompt,
          steps: 25,
          guidance_scale: 7.5,
          num_frames: 16,
          fps: 8,
        }
      : {
          prompt,
          num_outputs: 1,
          aspect_ratio: "16:9",
          output_format: "jpg",
          output_quality: 90,
        };

    const output = await replicate.run(model, { input: modelInputs }) as string[];

    if (output.length === 0) return null;

    // 이미지 다운로드 및 저장
    const imageResponse = await fetch(output[0]);
    const imageBuffer = await imageResponse.arrayBuffer();

    // 파일명 생성 (MD5 해시 기반)
    const hash = generateHash(removeNikkud(word.hebrew));
    const filename = `word_${hash}.${isImportant ? 'gif' : 'jpg'}`;

    // Supabase Storage에 업로드
    const bucket = isImportant ? 'animated-icons' : 'hebrew-icons';
    const path = isImportant ? 'gifs' : 'icons';

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`${path}/${filename}`, imageBuffer, {
        contentType: isImportant ? 'image/gif' : 'image/jpeg'
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    // 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(`${path}/${filename}`);

    return publicUrl;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

export { generateImage, isImportantWord, generateHash, removeNikkud };