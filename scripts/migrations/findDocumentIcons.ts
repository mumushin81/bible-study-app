import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findDocumentIcons() {
  console.log('🔍 Finding words with document-style default icons...\n');

  // Get all words with SVG
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, grammar, icon_svg')
    .not('icon_svg', 'is', null)
    .limit(2000);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`📊 Checking ${words?.length || 0} words...\n`);

  // Find words with document-style icons (rect with rx="4" pattern)
  const documentIcons = words?.filter(w =>
    w.icon_svg &&
    w.icon_svg.includes('<rect') &&
    w.icon_svg.includes('rx="4"') &&
    w.icon_svg.includes('20') && // rect x/y positions
    w.icon_svg.includes('24') // rect width/height
  ) || [];

  console.log(`📄 Found ${documentIcons.length} words with document-style icons\n`);

  if (documentIcons.length > 0) {
    console.log('First 20 words with document icons:');
    documentIcons.slice(0, 20).forEach((word, i) => {
      console.log(`${i + 1}. ${word.hebrew} (${word.meaning}) - Grammar: ${word.grammar || 'N/A'}`);
    });

    if (documentIcons.length > 20) {
      console.log(`\n... and ${documentIcons.length - 20} more words`);
    }

    // Show a sample SVG
    console.log('\n📝 Sample document icon SVG:');
    console.log(documentIcons[0].icon_svg);
  }

  console.log(`\n📈 Document icon percentage: ${((documentIcons.length / words!.length) * 100).toFixed(1)}%`);
}

findDocumentIcons();
