/**
 * Create Genesis 5:22-24 verse entries in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const verses = [
    {
      id: 'gen5-22',
      book_id: 'genesis',
      chapter: 5,
      verse: 22,
      reference: '창세기 5:22',
      hebrew: 'וַיִּתְהַלֵּךְ חֲנוֹךְ אֶת־הָאֱלֹהִים, אַחֲרֵי הוֹלִידוֹ אֶת־מְתוּשֶׁלַח, שְׁלֹשׁ מֵאוֹת שָׁנָה; וַיּוֹלֶד בָּנִים, וּבָנוֹת.'
    },
    {
      id: 'gen5-23',
      book_id: 'genesis',
      chapter: 5,
      verse: 23,
      reference: '창세기 5:23',
      hebrew: 'וַיְהִי כָּל־יְמֵי חֲנוֹךְ, חָמֵשׁ וְשִׁשִּׁים שָׁנָה, וּשְׁלֹשׁ מֵאוֹת שָׁנָה.'
    },
    {
      id: 'gen5-24',
      book_id: 'genesis',
      chapter: 5,
      verse: 24,
      reference: '창세기 5:24',
      hebrew: 'וַיִּתְהַלֵּךְ חֲנוֹךְ, אֶת־הָאֱלֹהִים; וְאֵינֶנּוּ, כִּי־לָקַח אֹתוֹ אֱלֹהִים.'
    }
  ];

  for (const verse of verses) {
    // Check if exists
    const { data: existing } = await supabase
      .from('verses')
      .select('id')
      .eq('id', verse.id)
      .single();

    if (existing) {
      console.log(`✅ ${verse.id} already exists`);
      continue;
    }

    // Insert
    const { error } = await supabase
      .from('verses')
      .insert({
        id: verse.id,
        book_id: verse.book_id,
        chapter: verse.chapter,
        verse_number: verse.verse,
        reference: verse.reference,
        hebrew: verse.hebrew,
        ipa: '',
        korean_pronunciation: '',
        modern: ''
      });

    if (error) {
      console.error(`❌ Error inserting ${verse.id}:`, error);
    } else {
      console.log(`✅ Created ${verse.id}`);
    }
  }
}

main();
