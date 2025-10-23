import { supabase } from './utils/supabase.js'

async function fetchVerses() {
  const { data, error } = await supabase
    .from('verses')
    .select('id, reference, hebrew, chapter, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 12)
    .gte('verse_number', 16)
    .lte('verse_number', 20)
    .order('verse_number', { ascending: true });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

fetchVerses();
