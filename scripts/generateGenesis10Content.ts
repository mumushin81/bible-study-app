#!/usr/bin/env tsx

/**
 * Generate Genesis 10 key verses content
 * Table of Nations - Key theological verses
 */

import { supabase } from './utils/supabase'
import fs from 'fs'
import path from 'path'

const dataDir = '/Users/jinxin/dev/bible-study-app/data'

// Fetch Hebrew text from database
async function fetchVerse(chapter: number, verse: number) {
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', 'genesis')
    .eq('chapter', chapter)
    .eq('verse_number', verse)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    console.error(`Error fetching Genesis ${chapter}:${verse}:`, error)
    return null
  }

  return data[0]
}

// Main execution
async function main() {
  console.log('📖 Fetching Genesis 10 key verses from database...\n')

  const keyVerses = [1, 5, 8, 9, 10, 25, 32]

  for (const verseNum of keyVerses) {
    const data = await fetchVerse(10, verseNum)
    if (data) {
      console.log(`✅ Genesis 10:${verseNum}`)
      console.log(`   Hebrew: ${data.hebrew}\n`)
    } else {
      console.log(`❌ Genesis 10:${verseNum} - NOT FOUND\n`)
    }
  }

  console.log('\n📝 Now generating content for each verse...')
  console.log('(This will be done manually with proper Hebrew analysis)\n')
}

main()
