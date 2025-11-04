import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for uploads

const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAME = 'hebrew-icons'
const FOLDER_PATH = 'icons'
const LOCAL_DIR = 'output/all_words_jpg_v2'

async function uploadAllJpgs() {
  console.log('📦 Starting JPG upload to Supabase Storage\n')

  // Get all JPG files
  const files = readdirSync(LOCAL_DIR).filter(f => f.endsWith('.jpg'))
  console.log(`📊 Found ${files.length} JPG files to upload\n`)

  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const localPath = join(LOCAL_DIR, filename)
    const storagePath = `${FOLDER_PATH}/${filename}`

    try {
      // Read file as buffer
      const fileBuffer = readFileSync(localPath)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true, // Replace if exists
        })

      if (error) {
        throw error
      }

      successCount++
      if ((i + 1) % 50 === 0 || i === files.length - 1) {
        console.log(`✅ [${i + 1}/${files.length}] ${filename}`)
      }
    } catch (error) {
      errorCount++
      const errorMsg = `❌ [${i + 1}/${files.length}] ${filename}: ${error}`
      errors.push(errorMsg)
      if (errorCount <= 10) {
        console.error(errorMsg)
      }
    }

    // Rate limiting - wait 10ms between uploads
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Upload Summary')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Success: ${successCount}/${files.length}`)
  console.log(`❌ Failed: ${errorCount}/${files.length}`)

  if (errors.length > 0 && errors.length <= 20) {
    console.log('\n🔍 Errors:')
    errors.forEach(e => console.log(e))
  } else if (errors.length > 20) {
    console.log(`\n⚠️  Too many errors (${errors.length}). Showing first 20:`)
    errors.slice(0, 20).forEach(e => console.log(e))
  }

  if (successCount === files.length) {
    console.log('\n🎉 All files uploaded successfully!')
  }
}

uploadAllJpgs().catch(console.error)
