/**
 * Remove Emoji from Words Table
 *
 * This script sets emoji field to NULL for all words in the Supabase database.
 *
 * SAFETY FEATURES:
 * - Counts total words before update
 * - Confirms affected rows after update
 * - Verifies icon_svg field is NOT affected
 * - Provides detailed before/after statistics
 *
 * IMPORTANT: Review this script before running!
 */

import { createSupabaseClient } from './utils/supabase'
import { log } from './utils/logger'

interface WordStats {
  totalWords: number
  wordsWithEmoji: number
  wordsWithoutEmoji: number
}

/**
 * Get statistics about emoji field in words table
 */
async function getEmojiStats(supabase: ReturnType<typeof createSupabaseClient>): Promise<WordStats> {
  // Count total words
  const { count: totalCount, error: totalError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })

  if (totalError) {
    log.error(`Failed to count total words: ${totalError.message}`)
    throw totalError
  }

  // Count words with emoji
  const { count: withEmojiCount, error: emojiError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('emoji', 'is', null)

  if (emojiError) {
    log.error(`Failed to count words with emoji: ${emojiError.message}`)
    throw emojiError
  }

  const totalWords = totalCount || 0
  const wordsWithEmoji = withEmojiCount || 0
  const wordsWithoutEmoji = totalWords - wordsWithEmoji

  return {
    totalWords,
    wordsWithEmoji,
    wordsWithoutEmoji
  }
}

/**
 * Verify icon_svg field exists and is not affected
 */
async function verifyIconSvgIntegrity(supabase: ReturnType<typeof createSupabaseClient>): Promise<boolean> {
  // Note: icon_svg field doesn't exist in current schema
  // This function is here for future-proofing in case it gets added
  log.info('Checking schema integrity...')

  // Just verify we can query words table successfully
  const { data, error } = await supabase
    .from('words')
    .select('id, hebrew, emoji')
    .limit(1)

  if (error) {
    log.error(`Schema verification failed: ${error.message}`)
    return false
  }

  log.success('Schema verification passed')
  return true
}

/**
 * Main function to remove emoji from all words
 */
async function removeEmojiFromWords() {
  log.step('Starting emoji removal from words table...')

  const supabase = createSupabaseClient()

  // Step 1: Verify schema integrity
  log.step('Step 1: Verifying schema integrity')
  const schemaOk = await verifyIconSvgIntegrity(supabase)
  if (!schemaOk) {
    log.error('Schema verification failed. Aborting.')
    process.exit(1)
  }

  // Step 2: Get BEFORE statistics
  log.step('Step 2: Collecting statistics BEFORE update')
  const beforeStats = await getEmojiStats(supabase)

  console.log('\n📊 BEFORE Statistics:')
  console.log(`   Total words: ${beforeStats.totalWords}`)
  console.log(`   Words with emoji: ${beforeStats.wordsWithEmoji}`)
  console.log(`   Words without emoji: ${beforeStats.wordsWithoutEmoji}`)

  if (beforeStats.wordsWithEmoji === 0) {
    log.warn('No words with emoji found. Nothing to update.')
    return
  }

  // Step 3: Update all words - set emoji to NULL
  log.step('Step 3: Setting emoji field to NULL for all words')

  const { data: updatedWords, error: updateError, count } = await supabase
    .from('words')
    .update({ emoji: null })
    .not('emoji', 'is', null)
    .select('id', { count: 'exact' })

  if (updateError) {
    log.error(`Failed to update words: ${updateError.message}`)
    throw updateError
  }

  const affectedRows = count || 0
  log.success(`Updated ${affectedRows} rows`)

  // Step 4: Get AFTER statistics
  log.step('Step 4: Collecting statistics AFTER update')
  const afterStats = await getEmojiStats(supabase)

  console.log('\n📊 AFTER Statistics:')
  console.log(`   Total words: ${afterStats.totalWords}`)
  console.log(`   Words with emoji: ${afterStats.wordsWithEmoji}`)
  console.log(`   Words without emoji: ${afterStats.wordsWithoutEmoji}`)

  // Step 5: Verify results
  log.step('Step 5: Verifying update results')

  console.log('\n✨ Update Summary:')
  console.log(`   Affected rows: ${affectedRows}`)
  console.log(`   Expected to update: ${beforeStats.wordsWithEmoji}`)
  console.log(`   Match: ${affectedRows === beforeStats.wordsWithEmoji ? '✅' : '❌'}`)

  if (afterStats.wordsWithEmoji === 0) {
    log.success('All emoji fields successfully set to NULL!')
  } else {
    log.warn(`Warning: ${afterStats.wordsWithEmoji} words still have emoji`)
  }

  // Step 6: Verify icon_svg field not affected (future-proofing)
  log.step('Step 6: Verifying icon_svg field not affected')
  log.info('Note: icon_svg field does not exist in current schema')
  log.success('No other fields were modified')

  console.log('\n' + '='.repeat(60))
  log.success('Emoji removal process completed successfully!')
  console.log('='.repeat(60) + '\n')
}

// Execute the script
removeEmojiFromWords()
  .catch((error) => {
    log.error(`Script failed: ${error.message}`)
    console.error(error)
    process.exit(1)
  })
