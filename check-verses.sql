-- Genesis 구절 수 확인
SELECT 
  COUNT(*) as total_verses,
  COUNT(DISTINCT id) as unique_ids,
  COUNT(DISTINCT hebrew) as unique_hebrew,
  MIN(chapter) as min_chapter,
  MAX(chapter) as max_chapter
FROM verses
WHERE book_id = 'genesis';

-- 장별 구절 수
SELECT chapter, COUNT(*) as count
FROM verses
WHERE book_id = 'genesis'
GROUP BY chapter
ORDER BY chapter
LIMIT 10;
