/**
 * 창세기 1장 이모지 사용 현황 분석
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versesPath = path.join(__dirname, '../src/data/verses.ts');
const content = fs.readFileSync(versesPath, 'utf-8');

// Genesis 1 구간만 추출
const gen1Start = content.indexOf("id: 'gen1-1'");
const gen1End = content.indexOf("id: 'gen2-1'");
const gen1Content = content.substring(gen1Start, gen1End > 0 ? gen1End : content.length);

// 모든 단어 객체 추출
const wordMatches = [...gen1Content.matchAll(/{\s*hebrew:\s*'([^']+)',\s*meaning:\s*'([^']+)',.*?emoji:\s*'([^']+)'/gs)];

interface EmojiStat {
  emoji: string;
  count: number;
  words: Array<{ hebrew: string; meaning: string }>;
}

const emojiStats = new Map<string, EmojiStat>();

wordMatches.forEach(match => {
  const [, hebrew, meaning, emoji] = match;

  if (!emojiStats.has(emoji)) {
    emojiStats.set(emoji, { emoji, count: 0, words: [] });
  }

  const stat = emojiStats.get(emoji)!;
  stat.count++;
  stat.words.push({ hebrew, meaning });
});

// 결과 출력
console.log('📊 창세기 1장 이모지 사용 분석\n');
console.log(`총 단어 수: ${wordMatches.length}개`);
console.log(`사용된 이모지 종류: ${emojiStats.size}개\n`);

// 중복 사용된 이모지 (5개 이상)
console.log('⚠️  중복 사용이 많은 이모지 (5개 이상):');
const duplicates = Array.from(emojiStats.values())
  .filter(stat => stat.count >= 5)
  .sort((a, b) => b.count - a.count);

duplicates.forEach(stat => {
  console.log(`\n${stat.emoji} - ${stat.count}개 단어:`);
  stat.words.slice(0, 10).forEach(w => {
    console.log(`  - ${w.hebrew} (${w.meaning})`);
  });
  if (stat.count > 10) {
    console.log(`  ... 외 ${stat.count - 10}개 더`);
  }
});

// 모든 이모지 사용 빈도
console.log('\n\n📈 전체 이모지 사용 빈도:');
Array.from(emojiStats.values())
  .sort((a, b) => b.count - a.count)
  .forEach(stat => {
    console.log(`${stat.emoji} : ${stat.count}개`);
  });

// 파일로 저장
const report = {
  totalWords: wordMatches.length,
  uniqueEmojis: emojiStats.size,
  duplicates: duplicates.map(stat => ({
    emoji: stat.emoji,
    count: stat.count,
    words: stat.words
  })),
  allStats: Array.from(emojiStats.values()).sort((a, b) => b.count - a.count)
};

fs.writeFileSync(
  path.join(__dirname, '../emoji-analysis.json'),
  JSON.stringify(report, null, 2),
  'utf-8'
);

console.log('\n✅ 분석 결과가 emoji-analysis.json에 저장되었습니다.');
