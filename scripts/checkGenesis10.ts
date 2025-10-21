#!/usr/bin/env tsx

/**
 * Check if Genesis 10 verses exist in Supabase
 */

import { supabase } from './utils/supabase'

async function checkGenesis10() {
  console.log('🔍 Checking Genesis 10 verses in database...\n')

  const keyVerses = [1, 5, 8, 9, 10, 25, 32]

  for (const verse of keyVerses) {
    const { data, error } = await supabase
      .from('verses')
      .select('verse_id, hebrew')
      .eq('verse_id', `genesis_10_${verse}`)
      .single()

    if (error) {
      console.log(`❌ Genesis 10:${verse} - NOT FOUND`)
    } else {
      console.log(`✅ Genesis 10:${verse} - Found`)
      console.log(`   Hebrew: ${data.hebrew}\n`)
    }
  }

  // Check all Genesis 10 verses with various ID formats
  const { data: allVerses1, error: err1 } = await supabase
    .from('verses')
    .select('*')
    .like('verse_id', 'genesis_10_%')
    .order('verse_id')

  const { data: allVerses2, error: err2 } = await supabase
    .from('verses')
    .select('*')
    .like('verse_id', 'genesis10-%')
    .order('verse_id')

  const { data: allVerses3, error: err3 } = await supabase
    .from('verses')
    .select('*')
    .eq('chapter', 10)
    .eq('book_id', 'genesis')
    .order('verse_number')

  if (!err1 && allVerses1 && allVerses1.length > 0) {
    console.log(`\n📊 Found ${allVerses1.length} verses with format 'genesis_10_X'`)
    console.log('Sample:', allVerses1[0])
  }

  if (!err2 && allVerses2 && allVerses2.length > 0) {
    console.log(`\n📊 Found ${allVerses2.length} verses with format 'genesis10-X'`)
    console.log('Sample:', allVerses2[0])
  }

  if (!err3 && allVerses3 && allVerses3.length > 0) {
    console.log(`\n📊 Found ${allVerses3.length} verses with chapter=10`)
    console.log('Sample verse_id format:', allVerses3[0].verse_id)
    console.log('First verse:', allVerses3[0].hebrew)
  }
}

checkGenesis10()
