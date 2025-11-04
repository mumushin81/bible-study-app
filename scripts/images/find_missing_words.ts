#!/usr/bin/env tsx

import { readFileSync } from 'fs'
import { join } from 'path'
import { readdirSync } from 'fs'

const jsonPath1 = join(process.cwd(), 'scripts/images/genesis1-words.json')
const jsonPath2 = join(process.cwd(), 'scripts/images/genesis1-verse2-31.json')
const imagesDir = join(process.cwd(), 'public/images/words')

function hebrewToFilename(hebrew: string): string {
  const withoutNikkud = hebrew.replace(/[\u0591-\u05C7]/g, '')
  return withoutNikkud.trim().replace(/\s+/g, '_')
}

function findMissingWords() {
  const data1 = JSON.parse(readFileSync(jsonPath1, 'utf-8'))
  const data2 = JSON.parse(readFileSync(jsonPath2, 'utf-8'))

  const allWords = [...(data1.wordsToGenerate || []), ...(data2.wordsToGenerate || [])]
  const generatedImages = new Set(readdirSync(imagesDir).map(filename => filename.replace(/\.jpg$/, '')))

  const missingWords = allWords.filter(word => {
    const filename = hebrewToFilename(word.hebrew)
    return !generatedImages.has(filename)
  })

  console.log('Missing Words:')
  missingWords.forEach(word => {
    console.log(`Hebrew: ${word.hebrew}, Meaning: ${word.meaning}, Korean: ${word.korean}`)
  })

  console.log(`\nTotal words: ${allWords.length}`)
  console.log(`Generated images: ${generatedImages.size}`)
  console.log(`Missing words: ${missingWords.length}`)
}

findMissingWords()