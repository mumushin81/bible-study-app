import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ouzlnriafovnxlkywerk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emxucmlhZm92bnhsa3l3ZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk5NTAsImV4cCI6MjA3NjMzNTk1MH0.F_iR3qMNsLyoXKYwR6VgfhKgkrhtstNdAkUVGYJiafE'

const supabase = createClient(supabaseUrl, supabaseKey)

interface ChapterJPGStatus {
  chapter: number
  totalVerses: number
  totalWords: number
  wordsWithJPG: number
  wordsWithoutJPG: number
  jpgPercentage: number
  sampleWordsWithJPG: Array<{
    hebrew: string
    meaning: string
    icon_url: string | null
  }>
  sampleWordsWithoutJPG: Array<{
    hebrew: string
    meaning: string
  }>
}

async function checkGenesis21to25JPGStatus() {
  console.log('\n' + '='.repeat(80))
  console.log('AGENT 5 REPORT: Genesis 21-25 JPG Icon Status')
  console.log('='.repeat(80) + '\n')
  console.log('Date: ' + new Date().toISOString().split('T')[0])
  console.log('Scope: Genesis Chapters 21-25')
  console.log('Task: Analyze JPG icon (icon_url) status for all words\n')

  const chapters = [21, 22, 23, 24, 25]
  const results: ChapterJPGStatus[] = []

  for (const chapter of chapters) {
    console.log('\n' + '-'.repeat(80))
    console.log(`Chapter ${chapter}: Analyzing...`)
    console.log('-'.repeat(80))

    // Get all verses for this chapter
    const { data: verses, error: versesError } = await supabase
      .from('verses')
      .select('id, verse_number, reference')
      .eq('book_id', 'genesis')
      .eq('chapter', chapter)
      .order('verse_number', { ascending: true })

    if (versesError) {
      console.error(`ERROR: Failed to fetch verses:`, versesError)
      continue
    }

    if (!verses || verses.length === 0) {
      console.log(`WARNING: No verses found for chapter ${chapter}`)
      continue
    }

    console.log(`Total verses: ${verses.length}`)

    // Get all words for this chapter
    const verseIds = verses.map(v => v.id)
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, verse_id, hebrew, meaning, icon_url')
      .in('verse_id', verseIds)

    if (wordsError) {
      console.error(`ERROR: Failed to fetch words:`, wordsError)
      continue
    }

    if (!words || words.length === 0) {
      console.log(`WARNING: No words found for chapter ${chapter}`)
      results.push({
        chapter,
        totalVerses: verses.length,
        totalWords: 0,
        wordsWithJPG: 0,
        wordsWithoutJPG: 0,
        jpgPercentage: 0,
        sampleWordsWithJPG: [],
        sampleWordsWithoutJPG: []
      })
      continue
    }

    // Analyze JPG status
    const wordsWithJPG = words.filter(w => w.icon_url && w.icon_url.trim() !== '')
    const wordsWithoutJPG = words.filter(w => !w.icon_url || w.icon_url.trim() === '')
    const jpgPercentage = (wordsWithJPG.length / words.length) * 100

    // Get samples
    const sampleWith = wordsWithJPG.slice(0, 5).map(w => ({
      hebrew: w.hebrew,
      meaning: w.meaning,
      icon_url: w.icon_url
    }))

    const sampleWithout = wordsWithoutJPG.slice(0, 5).map(w => ({
      hebrew: w.hebrew,
      meaning: w.meaning
    }))

    console.log(`\nTotal words: ${words.length}`)
    console.log(`Words WITH JPG (icon_url): ${wordsWithJPG.length} (${jpgPercentage.toFixed(1)}%)`)
    console.log(`Words WITHOUT JPG: ${wordsWithoutJPG.length} (${(100 - jpgPercentage).toFixed(1)}%)`)

    if (sampleWith.length > 0) {
      console.log(`\nSample words WITH JPG:`)
      sampleWith.forEach((w, i) => {
        console.log(`  ${i + 1}. ${w.hebrew} (${w.meaning})`)
        console.log(`     URL: ${w.icon_url?.substring(0, 60)}...`)
      })
    }

    if (sampleWithout.length > 0) {
      console.log(`\nSample words WITHOUT JPG:`)
      sampleWithout.forEach((w, i) => {
        console.log(`  ${i + 1}. ${w.hebrew} (${w.meaning})`)
      })
    }

    results.push({
      chapter,
      totalVerses: verses.length,
      totalWords: words.length,
      wordsWithJPG: wordsWithJPG.length,
      wordsWithoutJPG: wordsWithoutJPG.length,
      jpgPercentage,
      sampleWordsWithJPG: sampleWith,
      sampleWordsWithoutJPG: sampleWithout
    })
  }

  // Generate summary table
  console.log('\n\n' + '='.repeat(80))
  console.log('SUMMARY TABLE: Genesis 21-25 JPG Icon Status')
  console.log('='.repeat(80) + '\n')

  console.log('Chapter | Verses | Total Words | With JPG | Without JPG | Coverage |  Status')
  console.log('--------|--------|-------------|----------|-------------|----------|----------')

  let totalVerses = 0
  let totalWords = 0
  let totalWithJPG = 0
  let totalWithoutJPG = 0

  results.forEach(r => {
    totalVerses += r.totalVerses
    totalWords += r.totalWords
    totalWithJPG += r.wordsWithJPG
    totalWithoutJPG += r.wordsWithoutJPG

    const status = r.jpgPercentage >= 100 ? 'COMPLETE' :
                   r.jpgPercentage >= 50 ? 'PARTIAL' :
                   r.jpgPercentage > 0 ? 'MINIMAL' : 'NONE'

    const statusIcon = r.jpgPercentage >= 100 ? '✓' :
                       r.jpgPercentage >= 50 ? '~' :
                       r.jpgPercentage > 0 ? '!' : 'X'

    console.log(
      `  ${r.chapter.toString().padStart(2)}    |   ${r.totalVerses.toString().padStart(2)}   |` +
      `    ${r.totalWords.toString().padStart(4)}     |` +
      `   ${r.wordsWithJPG.toString().padStart(4)}   |` +
      `    ${r.wordsWithoutJPG.toString().padStart(4)}     |` +
      ` ${r.jpgPercentage.toFixed(1).padStart(5)}%  |` +
      ` ${statusIcon} ${status.padEnd(8)}`
    )
  })

  console.log('--------|--------|-------------|----------|-------------|----------|----------')
  const overallPercentage = totalWords > 0 ? (totalWithJPG / totalWords) * 100 : 0
  console.log(
    ` TOTAL  |  ${totalVerses.toString().padStart(3)}   |` +
    `    ${totalWords.toString().padStart(4)}     |` +
    `   ${totalWithJPG.toString().padStart(4)}   |` +
    `    ${totalWithoutJPG.toString().padStart(4)}     |` +
    ` ${overallPercentage.toFixed(1).padStart(5)}%  |`
  )
  console.log('='.repeat(80) + '\n')

  // Overall statistics
  console.log('OVERALL STATISTICS:\n')
  console.log(`Total chapters analyzed: ${chapters.length}`)
  console.log(`Total verses: ${totalVerses}`)
  console.log(`Total words: ${totalWords}`)
  console.log(`Words with JPG icon: ${totalWithJPG} (${overallPercentage.toFixed(1)}%)`)
  console.log(`Words without JPG icon: ${totalWithoutJPG} (${(100 - overallPercentage).toFixed(1)}%)`)

  // Status breakdown
  const complete = results.filter(r => r.jpgPercentage >= 100).length
  const partial = results.filter(r => r.jpgPercentage >= 50 && r.jpgPercentage < 100).length
  const minimal = results.filter(r => r.jpgPercentage > 0 && r.jpgPercentage < 50).length
  const none = results.filter(r => r.jpgPercentage === 0).length

  console.log(`\nChapter Status Breakdown:`)
  console.log(`  COMPLETE (100%):     ${complete} chapters`)
  console.log(`  PARTIAL (50-99%):    ${partial} chapters`)
  console.log(`  MINIMAL (1-49%):     ${minimal} chapters`)
  console.log(`  NONE (0%):           ${none} chapters`)

  // Recommendations
  console.log('\n' + '='.repeat(80))
  console.log('RECOMMENDATIONS')
  console.log('='.repeat(80) + '\n')

  if (overallPercentage >= 100) {
    console.log('STATUS: EXCELLENT')
    console.log('All words in Genesis 21-25 have JPG icons.')
    console.log('No action required.')
  } else if (overallPercentage >= 80) {
    console.log('STATUS: GOOD')
    console.log('Most words have JPG icons. Minor gaps remain.')
    console.log('RECOMMENDED ACTION: Generate JPG icons for remaining words.')
  } else if (overallPercentage >= 50) {
    console.log('STATUS: MODERATE')
    console.log('About half of the words have JPG icons.')
    console.log('RECOMMENDED ACTION: Run JPG generation workflow for missing icons.')
  } else if (overallPercentage > 0) {
    console.log('STATUS: LOW')
    console.log('Only a few words have JPG icons.')
    console.log('RECOMMENDED ACTION: Execute full JPG generation pipeline.')
  } else {
    console.log('STATUS: CRITICAL')
    console.log('No JPG icons found for any words.')
    console.log('RECOMMENDED ACTION: Initialize JPG generation system immediately.')
  }

  console.log('\nNEXT STEPS:')
  console.log('1. Review JPG_GENERATION_GUIDE.md for generation workflow')
  console.log('2. Use Replicate MCP tool to generate missing icons')
  console.log('3. Upload JPG files to Supabase Storage (icons/ bucket)')
  console.log('4. Update icon_url field in words table')
  console.log('5. Verify all URLs are accessible')

  console.log('\n' + '='.repeat(80))
  console.log('END OF REPORT')
  console.log('='.repeat(80) + '\n')

  // Save results to JSON
  const report = {
    generated_at: new Date().toISOString(),
    scope: 'Genesis 21-25',
    chapters: results,
    summary: {
      total_chapters: chapters.length,
      total_verses: totalVerses,
      total_words: totalWords,
      words_with_jpg: totalWithJPG,
      words_without_jpg: totalWithoutJPG,
      coverage_percentage: overallPercentage,
      status_breakdown: {
        complete,
        partial,
        minimal,
        none
      }
    }
  }

  return report
}

checkGenesis21to25JPGStatus()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('FATAL ERROR:', err)
    process.exit(1)
  })
