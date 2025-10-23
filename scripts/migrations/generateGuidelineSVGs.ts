/**
 * Generate SVG icons following Eden SVG Guidelines
 * Based on SVG_GUIDELINES_SUMMARY.md
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate unique gradient ID
function generateGradientId(hebrew: string, meaning: string, index: number): string {
  const cleanHebrew = hebrew.replace(/[^a-zA-Z0-9]/g, '');
  const cleanMeaning = meaning.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
  return `${cleanMeaning || 'word'}-${index}`;
}

// Get color based on meaning (following guidelines)
function getColorByMeaning(meaning: string): { start: string, end: string } {
  const m = meaning.toLowerCase();

  // Divine/Holy - Gold
  if (m.includes('하나님') || m.includes('여호와') || m.includes('주') || m.includes('거룩')) {
    return { start: '#FFD700', end: '#FFA500' };
  }

  // Spiritual - Blue/Purple
  if (m.includes('영') || m.includes('하늘') || m.includes('영혼') || m.includes('말씀')) {
    return { start: '#7B68EE', end: '#4A90E2' };
  }

  // Life - Red/Pink
  if (m.includes('생명') || m.includes('살') || m.includes('생') || m.includes('피')) {
    return { start: '#e74c3c', end: '#FF69B4' };
  }

  // Earth/Nature - Green/Brown
  if (m.includes('땅') || m.includes('나무') || m.includes('식물') || m.includes('흙')) {
    return { start: '#8B4513', end: '#228B22' };
  }

  // Water - Blue
  if (m.includes('물') || m.includes('바다') || m.includes('강')) {
    return { start: '#4A90E2', end: '#87CEEB' };
  }

  // Light - Yellow
  if (m.includes('빛') || m.includes('밝') || m.includes('햇')) {
    return { start: '#FFD700', end: '#FFF8DC' };
  }

  // People - Brown/Tan
  if (m.includes('사람') || m.includes('남자') || m.includes('여자') || m.includes('아들') || m.includes('딸') || m.includes('아버지') || m.includes('어머니')) {
    return { start: '#8D6E63', end: '#D7CCC8' };
  }

  // Default - Purple/Blue gradient
  return { start: '#7B68EE', end: '#4A90E2' };
}

// Generate simple geometric SVG based on meaning
function generateSVG(hebrew: string, meaning: string, index: number): string {
  const gradientId = generateGradientId(hebrew, meaning, index);
  const colors = getColorByMeaning(meaning);
  const m = meaning.toLowerCase();

  let shape = '';

  // Choose shape based on meaning
  if (m.includes('하나님') || m.includes('여호와') || m.includes('주')) {
    // Crown/Star for divine
    shape = `<path d="M32 18 L35 26 L43 26 L37 31 L39 39 L32 34 L25 39 L27 31 L21 26 L29 26 Z" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>`;
  } else if (m.includes('사람') || m.includes('남자') || m.includes('여자') || m.includes('아들') || m.includes('딸') || m.includes('아버지') || m.includes('어머니') || m.includes('형제')) {
    // Person silhouette
    shape = `<circle cx="32" cy="24" r="7" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><ellipse cx="32" cy="42" rx="12" ry="10" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>`;
  } else if (m.includes('땅')) {
    // Circle for earth
    shape = `<circle cx="32" cy="35" r="15" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><ellipse cx="32" cy="42" rx="20" ry="8" fill="url(#${gradientId})" opacity="0.5"/>`;
  } else if (m.includes('하늘')) {
    // Clouds
    shape = `<circle cx="25" cy="28" r="6" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="35" cy="26" r="8" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="42" cy="30" r="5" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>`;
  } else if (m.includes('물') || m.includes('바다')) {
    // Waves
    shape = `<path d="M10 35 Q18 30 26 35 Q34 40 42 35 Q50 30 58 35" stroke="url(#${gradientId})" stroke-width="3" fill="none" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><path d="M10 42 Q18 37 26 42 Q34 47 42 42 Q50 37 58 42" stroke="url(#${gradientId})" stroke-width="3" fill="none" opacity="0.6"/>`;
  } else if (m.includes('빛')) {
    // Sun/Light rays
    shape = `<circle cx="32" cy="32" r="8" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><line x1="32" y1="16" x2="32" y2="22" stroke="url(#${gradientId})" stroke-width="2"/><line x1="32" y1="42" x2="32" y2="48" stroke="url(#${gradientId})" stroke-width="2"/><line x1="16" y1="32" x2="22" y2="32" stroke="url(#${gradientId})" stroke-width="2"/><line x1="42" y1="32" x2="48" y2="32" stroke="url(#${gradientId})" stroke-width="2"/>`;
  } else if (m.includes('나무')) {
    // Tree
    shape = `<rect x="30" y="35" width="4" height="15" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="32" cy="28" r="10" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>`;
  } else {
    // Default: Simple circle with inner detail
    shape = `<circle cx="32" cy="32" r="16" fill="url(#${gradientId})" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/><circle cx="32" cy="32" r="8" fill="#FFFFFF" opacity="0.3"/>`;
  }

  // Construct SVG following guidelines
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${colors.start}"/><stop offset="100%" stop-color="${colors.end}"/></linearGradient></defs>${shape}</svg>`;
}

async function main() {
  console.log('🎨 Generating guideline-compliant SVG icons...\n');

  // Get words without SVG (limit to first 1000)
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning')
    .is('icon_svg', null)
    .limit(1000);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!words || words.length === 0) {
    console.log('✅ All words already have SVG icons!');
    return;
  }

  console.log(`📊 Words to process: ${words.length}\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (i % 50 === 0) {
      console.log(`[${i + 1}/${words.length}] Processing...`);
    }

    try {
      const svg = generateSVG(word.hebrew, word.meaning, i);

      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_svg: svg })
        .eq('id', word.id);

      if (updateError) {
        console.error(`  ❌ ${word.hebrew}: ${updateError.message}`);
        failCount++;
      } else {
        successCount++;
      }

      // Small delay every 10 words
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }

    } catch (error: any) {
      console.error(`  ❌ ${word.hebrew}: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Success: ${successCount}/${words.length} (${((successCount / words.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failCount}/${words.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋 SVG Guidelines Applied:');
  console.log('  ✅ viewBox="0 0 64 64"');
  console.log('  ✅ xmlns="http://www.w3.org/2000/svg"');
  console.log('  ✅ <defs> with gradients');
  console.log('  ✅ Unique gradient IDs');
  console.log('  ✅ drop-shadow effects');
  console.log('  ✅ Meaning-based colors');
}

main();
