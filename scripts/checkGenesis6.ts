#!/usr/bin/env tsx

import { supabase } from './utils/supabase.js';

async function checkGenesis6() {
  const { data, error } = await supabase
    .from('verses')
    .select('id, chapter, verse_number, hebrew, ipa, korean_pronunciation, modern')
    .eq('book_id', 'genesis')
    .eq('chapter', 6)
    .order('verse_number');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

checkGenesis6();
