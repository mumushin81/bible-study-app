import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ouzlnriafovnxlkywerk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emxucmlhZm92bnhsa3l3ZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk5NTAsImV4cCI6MjA3NjMzNTk1MH0.F_iR3qMNsLyoXKYwR6VgfhKgkrhtstNdAkUVGYJiafE'
);

async function fetchVerses() {
  const { data, error } = await supabase
    .from('verses')
    .select('id, reference, hebrew')
    .eq('book_id', 'genesis')
    .eq('chapter', 12)
    .gte('verse_number', 11)
    .lte('verse_number', 15)
    .order('verse_number', { ascending: true });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

fetchVerses();
