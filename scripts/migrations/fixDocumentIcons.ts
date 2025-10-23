/**
 * Fix document-style default icons with better SVGs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Same SVG generation function from generateGuidelineSVGs.ts
function generateGradientId(hebrew: string, meaning: string, index: number): string {
  const cleanMeaning = meaning.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
  return `${cleanMeaning || 'word'}-fix-${index}`;
}

function getColorByMeaning(meaning: string): { start: string, end: string } {
  const m = meaning.toLowerCase();

  if (m.includes('하나님') || m.includes('여호와') || m.includes('주') || m.includes('거룩')) {
    return { start: '#FFD700', end: '#FFA500' };
  }
  if (m.includes('영') || m.includes('하늘') || m.includes('영혼') || m.includes('말씀')) {
    return { start: '#7B68EE', end: '#4A90E2' };
  }
  if (m.includes('생명') || m.includes('살') || m.includes('생') || m.includes('피')) {
    return { start: '#e74c3c', end: '#FF69B4' };
  }
  if (m.includes('땅') || m.includes('나무') || m.includes('식물') || m.includes('흙')) {
    return { start: '#8B4513', end: '#228B22' };
  }
  if (m.includes('물') || m.includes('바다') || m.includes('강')) {
    return { start: '#4A90E2', end: '#87CEEB' };
  }
  if (m.includes('빛') || m.includes('밝') || m.includes('햇')) {
    return { start: '#FFD700', end: '#FFF8DC' };
  }
  if (m.includes('사람') || m.includes('남자') || m.includes('여자') || m.includes('아들') || m.includes('딸') || m.includes('아버지') || m.includes('어머니')) {
    return { start: '#8D6E63', end: '#D7CCC8' };
  }
  if (m.includes('동물') || m.includes('짐승') || m.includes('가축')) {
    return { start: '#8B4513', end: '#D2691E' };
  }
  if (m.includes('새') || m.includes('날')) {
    return { start: '#87CEEB', end: '#B0E0E6' };
  }
  if (m.includes('기') || m.includes('움직')) {
    return { start: '#9370DB', end: '#BA55D3' };
  }

  return { start: '#7B68EE', end: '#4A90E2' };
}

function generateBetterSVG(hebrew: string, meaning: string, grammar: string, index: number): string {
  const gradientId = generateGradientId(hebrew, meaning, index);
  const colors = getColorByMeaning(meaning);
  const m = meaning.toLowerCase();
  const g = grammar?.toLowerCase() || '';

  let shape = '';

  // More specific shape selection based on meaning and grammar
  if (g.includes('동사')) {
    // Action shapes for verbs - arrows, motion
    shape = `<circle cx="24" cy="32" r="8" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><path d="M24 32 L40 32 L36 28 M40 32 L36 36" stroke="url(#${gradientId})" stroke-width="3" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>`;
  } else if (m.includes('가축') || m.includes('짐승') || m.includes('동물')) {
    // Animal shape
    shape = `<ellipse cx="32" cy="36" rx="14" ry="10" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="32" cy="24" r="8" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="27" cy="23" r="2" fill="#FFFFFF"/><circle cx="37" cy="23" r="2" fill="#FFFFFF"/>`;
  } else if (m.includes('기') || m.includes('기는')) {
    // Crawling creature - wavy line
    shape = `<path d="M12 32 Q20 28 28 32 Q36 36 44 32 Q52 28 60 32" stroke="url(#${gradientId})" stroke-width="4" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="16" cy="32" r="3" fill="url(#${gradientId})"/><circle cx="48" cy="32" r="3" fill="url(#${gradientId})"/>`;
  } else if (m.includes('새')) {
    // Bird shape
    shape = `<circle cx="36" cy="28" r="6" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><path d="M20 28 Q28 24 36 28" stroke="url(#${gradientId})" stroke-width="3" fill="none"/><path d="M36 28 Q44 24 52 28" stroke="url(#${gradientId})" stroke-width="3" fill="none"/><path d="M36 34 L34 42 L38 42 Z" fill="url(#${gradientId})"/>`;
  } else if (m.includes('돋아') || m.includes('채소') || m.includes('풀')) {
    // Plant/sprout shape
    shape = `<ellipse cx="32" cy="48" rx="10" ry="6" fill="url(#${gradientId})" opacity="0.5"/><path d="M32 48 Q28 38 28 28 Q28 20 32 16 Q36 20 36 28 Q36 38 32 48" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><ellipse cx="26" cy="30" rx="4" ry="8" fill="url(#${gradientId})" opacity="0.8"/><ellipse cx="38" cy="30" rx="4" ry="8" fill="url(#${gradientId})" opacity="0.8"/>`;
  } else if (m.includes('나누') || m.includes('구별')) {
    // Division/separation - split circle
    shape = `<circle cx="28" cy="32" r="10" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="40" cy="32" r="10" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><line x1="32" y1="20" x2="32" y2="44" stroke="#FFFFFF" stroke-width="2"/>`;
  } else if (m.includes('충만') || m.includes('가득')) {
    // Fullness - filled container
    shape = `<rect x="18" y="22" width="28" height="20" rx="3" fill="none" stroke="url(#${gradientId})" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><rect x="20" y="32" width="24" height="8" fill="url(#${gradientId})" opacity="0.7"/>`;
  } else if (m.includes('형상') || m.includes('모양')) {
    // Image/likeness - reflection
    shape = `<circle cx="32" cy="26" r="10" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><ellipse cx="32" cy="44" rx="10" ry="4" fill="url(#${gradientId})" opacity="0.4"/>`;
  } else if (m.includes('죽')) {
    // Death - fading shape
    shape = `<circle cx="32" cy="32" r="12" fill="url(#${gradientId})" opacity="0.6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="32" cy="32" r="6" fill="url(#${gradientId})" opacity="0.3"/>`;
  } else if (m.includes('날') || m.includes('시간') || m.includes('년')) {
    // Time - clock-like
    shape = `<circle cx="32" cy="32" r="14" stroke="url(#${gradientId})" stroke-width="3" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><line x1="32" y1="32" x2="32" y2="22" stroke="url(#${gradientId})" stroke-width="2"/><line x1="32" y1="32" x2="40" y2="32" stroke="url(#${gradientId})" stroke-width="2"/>`;
  } else if (m.includes('숨') || m.includes('감추')) {
    // Hidden - partial circle
    shape = `<path d="M20 32 A 12 12 0 1 1 44 32" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><rect x="18" y="32" width="28" height="4" fill="url(#${gradientId})" opacity="0.5"/>`;
  } else {
    // Generic meaningful shape - concentric circles
    shape = `<circle cx="32" cy="32" r="14" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="32" cy="32" r="8" fill="#FFFFFF" opacity="0.3"/><circle cx="32" cy="32" r="4" fill="url(#${gradientId})"/>`;
  }

  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${colors.start}"/><stop offset="100%" stop-color="${colors.end}"/></linearGradient></defs>${shape}</svg>`;
}

async function main() {
  console.log('🔧 Fixing document-style default icons...\n');

  // Get words with document-style icons
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, grammar, icon_svg')
    .not('icon_svg', 'is', null)
    .limit(2000);

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Filter to document icons
  const documentIcons = words?.filter(w =>
    w.icon_svg &&
    w.icon_svg.includes('<rect') &&
    w.icon_svg.includes('rx="4"') &&
    w.icon_svg.includes('20') &&
    w.icon_svg.includes('24')
  ) || [];

  console.log(`📄 Found ${documentIcons.length} words with document icons\n`);

  if (documentIcons.length === 0) {
    console.log('✅ No document icons to fix!');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < documentIcons.length; i++) {
    const word = documentIcons[i];

    if (i % 10 === 0) {
      console.log(`[${i + 1}/${documentIcons.length}] ${word.hebrew} (${word.meaning})`);
    }

    try {
      const newSVG = generateBetterSVG(word.hebrew, word.meaning, word.grammar, i);

      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_svg: newSVG })
        .eq('id', word.id);

      if (updateError) {
        console.error(`  ❌ ${word.hebrew}: ${updateError.message}`);
        failCount++;
      } else {
        successCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (error: any) {
      console.error(`  ❌ ${word.hebrew}: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Success: ${successCount}/${documentIcons.length}`);
  console.log(`❌ Failed: ${failCount}/${documentIcons.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
