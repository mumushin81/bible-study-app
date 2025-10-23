-- Migration: Add getTotalWordsInBook RPC function
-- Purpose: Accurately count total words in a book using proper JOIN
-- Date: 2025-10-23

-- Drop function if exists (for safe re-migration)
DROP FUNCTION IF EXISTS get_total_words_in_book(TEXT);

-- Create RPC function to count total words in a book
CREATE OR REPLACE FUNCTION get_total_words_in_book(book_id_param TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(DISTINCT w.id)::INTEGER
  FROM words w
  INNER JOIN verses v ON w.verse_id = v.id
  WHERE v.book_id = book_id_param;
$$ LANGUAGE SQL STABLE;

-- Add comment
COMMENT ON FUNCTION get_total_words_in_book(TEXT) IS
'Returns the total count of unique words in a given book by joining words with verses table';

-- Test the function (optional)
-- SELECT get_total_words_in_book('genesis');
