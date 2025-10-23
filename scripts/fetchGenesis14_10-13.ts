/**
 * Fetch Hebrew text for Genesis 14:10-13
 */

import { supabase } from './utils/supabase.js'
import { log } from './utils/logger.js'

async function fetchVerses() {
  try {
    const verseIds = [
      'genesis_14_10',
      'genesis_14_11',
      'genesis_14_12',
      'genesis_14_13'
    ]

    const { data, error } = await supabase
      .from('verses')
      .select('id, book_id, chapter, verse_number, reference, hebrew')
      .in('id', verseIds)
      .order('verse_number', { ascending: true })

    if (error) {
      log.error(`Query failed: ${error.message}`)
      throw error
    }

    if (!data || data.length === 0) {
      log.warn('No verses found')
      return
    }

    log.success(`Found ${data.length} verses`)

    data.forEach(verse => {
      console.log('\n' + '='.repeat(80))
      console.log(`ID: ${verse.id}`)
      console.log(`Reference: ${verse.reference}`)
      console.log(`Hebrew: ${verse.hebrew}`)
      console.log('='.repeat(80))
    })

  } catch (err) {
    log.error(`Error: ${err}`)
    throw err
  }
}

fetchVerses()
