#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in .env.local')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🔍 Listing Supabase Storage buckets...\n')

  const { data, error } = await supabase.storage.listBuckets()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No buckets found')
    return
  }

  console.log(`Found ${data.length} bucket(s):\n`)
  data.forEach((bucket, i) => {
    console.log(`${i + 1}. ${bucket.name}`)
    console.log(`   ID: ${bucket.id}`)
    console.log(`   Public: ${bucket.public}`)
    console.log(`   Created: ${bucket.created_at}\n`)
  })
}

main().catch(console.error)
