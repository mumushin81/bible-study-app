#!/usr/bin/env tsx

import Replicate from 'replicate'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

const prompt = `
ABSTRACT PASTEL ART - ABSOLUTELY NO TEXT

MEANING: THE BEGINNING - First moment, origin point

VISUAL CONCEPT:
- Soft radial light rays from center point
- Pastel starburst pattern with 10-12 rays
- Multiple gentle rays in different pastel colors
- Dawn-like gradient spreading from center
- Simple but clearly visible ray pattern

STYLE:
- Clean digital pastel gradients
- Soft radiating pattern
- Multiple pastel colors blending
- Modern minimalist
- Pure visual - NO TYPOGRAPHY EVER

COMPOSITION (9:16 PORTRAIT):
- Upper 80%: Radial rays pattern from center
- Bottom 20%: Solid cream color (#FFF9E6)
- NO content in bottom 20%

COLORS:
- Golden yellow (#FFE66D), rose pink (#FFB3C6), sky blue (#A8D8FF)
- Mint (#B5E7D0), lavender (#DCC6FF), peach (#FFCCB8)
- ALL brightness > 180/255
- Soft smooth gradients between colors

CRITICAL RULES:
✅ 9:16 portrait vertical
✅ Bottom 20% empty solid pastel
✅ Bright pastels only
✅ Visible ray pattern
✅ NO TEXT - NO LETTERS - NO WORDS - NO TYPOGRAPHY WHATSOEVER

STRICTLY FORBIDDEN:
❌ ABSOLUTELY NO TEXT OR LETTERS OF ANY KIND IN ANY LANGUAGE
❌ NO WORDS
❌ NO TYPOGRAPHY
❌ NO dark colors
❌ NO watercolor texture

Pure abstract pastel radial rays - visual shapes only, never text.
`.trim()

async function main() {
  console.log('🔄 Regenerating bereshit (NO TEXT version)...\n')

  const output: any = await replicate.run('black-forest-labs/flux-schnell', {
    input: {
      prompt,
      num_outputs: 1,
      aspect_ratio: '9:16',
      output_format: 'jpg',
      output_quality: 90,
    }
  })

  const imageUrl = Array.isArray(output) ? output[0] : output
  console.log('⏱️  Image generated, downloading...')

  const response = await fetch(imageUrl)
  const buffer = await response.arrayBuffer()
  const filepath = join(
    process.cwd(),
    'output/genesis1_1_comparison/schnell/bereshit.jpg'
  )
  writeFileSync(filepath, Buffer.from(buffer))

  const sizeKB = buffer.byteLength / 1024
  console.log(`✅ bereshit.jpg regenerated (${sizeKB.toFixed(2)} KB)`)
  console.log('📁 Location: output/genesis1_1_comparison/schnell/bereshit.jpg\n')
}

main().catch(console.error)
