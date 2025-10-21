#!/usr/bin/env tsx

/**
 * Upload Genesis 10 content to Supabase
 */

import { supabase } from './utils/supabase'
import fs from 'fs'
import path from 'path'

const dataDir = '/Users/jinxin/dev/bible-study-app/data'

const verses = [1, 5, 8, 9, 10, 25, 32]

async function uploadVerse(verseNum: number) {
  const filePath = path.join(dataDir, `genesis-10-${verseNum}-content.json`)

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`)
    return false
  }

  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  console.log(`\n📤 Uploading Genesis 10:${verseNum}...`)

  // Update verses table with IPA, pronunciation, modern
  const { error: verseError } = await supabase
    .from('verses')
    .update({
      ipa: content.ipa,
      korean_pronunciation: content.korean_pronunciation,
      modern: content.modern
    })
    .eq('book_id', 'genesis')
    .eq('chapter', 10)
    .eq('verse_number', verseNum)

  if (verseError) {
    console.error(`❌ Error updating verse: ${verseError.message}`)
    return false
  }

  // Insert words (skip related_words if not in schema)
  for (const word of content.words) {
    const wordData: any = {
      verse_id: content.verse_id,
      hebrew: word.hebrew,
      meaning: word.meaning,
      ipa: word.ipa,
      korean: word.korean,
      letters: word.letters,
      root: word.root,
      grammar: word.grammar,
      emoji: word.emoji,
      icon_svg: word.iconSvg
    }

    const { error: wordError } = await supabase
      .from('words')
      .upsert(wordData, {
        onConflict: 'verse_id,hebrew'
      })

    if (wordError) {
      console.error(`❌ Error inserting word ${word.hebrew}: ${wordError.message}`)
    }
  }

  // Insert commentary (without bible_references for now)
  const { error: commError } = await supabase
    .from('commentaries')
    .upsert({
      verse_id: content.verse_id,
      intro: content.commentary.intro,
      why_question: content.commentary.whyQuestion.question,
      why_answer: content.commentary.whyQuestion.answer,
      conclusion_title: content.commentary.conclusion.title,
      conclusion_content: content.commentary.conclusion.content
    }, {
      onConflict: 'verse_id'
    })

  if (commError) {
    console.error(`❌ Error inserting commentary: ${commError.message}`)
    return false
  }

  // Insert commentary sections
  for (let i = 0; i < content.commentary.sections.length; i++) {
    const section = content.commentary.sections[i]
    const { error: sectionError } = await supabase
      .from('commentary_sections')
      .upsert({
        verse_id: content.verse_id,
        section_order: i + 1,
        emoji: section.emoji,
        title: section.title,
        description: section.description,
        points: section.points,
        color: section.color
      }, {
        onConflict: 'verse_id,section_order'
      })

    if (sectionError) {
      console.error(`❌ Error inserting section: ${sectionError.message}`)
    }
  }

  console.log(`✅ Successfully uploaded Genesis 10:${verseNum}`)
  return true
}

async function main() {
  console.log('📖 Uploading Genesis 10 content to Supabase...\n')

  let successCount = 0
  for (const verseNum of verses) {
    const success = await uploadVerse(verseNum)
    if (success) successCount++
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`\n✅ Completed: ${successCount}/${verses.length} verses uploaded`)
}

main()
