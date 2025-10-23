import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function testSVGBuild() {
  console.log('\n🔍 SVG Build Test Report\n');
  console.log('='.repeat(80));

  // 1. Check database SVG content
  console.log('\n📊 1. Database SVG Content Check');
  console.log('-'.repeat(80));

  const { data: words, error } = await supabase
    .from('words')
    .select('hebrew, icon_svg')
    .not('icon_svg', 'is', null)
    .limit(10);

  if (error) {
    console.error('❌ Database error:', error);
    return;
  }

  console.log(`✅ Found ${words?.length || 0} words with SVG icons in database`);

  const validSVGs = words?.filter(w => w.icon_svg?.includes('<svg')) || [];
  const invalidSVGs = words?.filter(w => !w.icon_svg?.includes('<svg')) || [];

  console.log(`   - Valid SVG: ${validSVGs.length}`);
  console.log(`   - Invalid SVG: ${invalidSVGs.length}`);

  if (validSVGs.length > 0) {
    console.log(`\n   Sample valid SVG (${validSVGs[0].hebrew}):`);
    console.log(`   ${validSVGs[0].icon_svg?.substring(0, 150)}...`);
  }

  // 2. Check build output
  console.log('\n📦 2. Build Output Check');
  console.log('-'.repeat(80));

  const distPath = path.join(process.cwd(), 'dist');

  if (!fs.existsSync(distPath)) {
    console.log('⚠️  dist/ folder not found. Running build...');
    return;
  }

  const assetsPath = path.join(distPath, 'assets');
  const jsFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js'));

  console.log(`✅ Found ${jsFiles.length} JS bundles in dist/assets/`);

  // Check for iconSvg references
  let foundIconSvgRef = false;
  let foundDangerouslySetInnerHTML = false;
  let foundSVGContent = false;

  for (const jsFile of jsFiles) {
    const filePath = path.join(assetsPath, jsFile);
    const content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes('iconSvg') || content.includes('icon_svg')) {
      foundIconSvgRef = true;
      console.log(`✅ iconSvg reference found in: ${jsFile}`);
    }

    if (content.includes('dangerouslySetInnerHTML')) {
      foundDangerouslySetInnerHTML = true;
      console.log(`✅ dangerouslySetInnerHTML found in: ${jsFile}`);
    }

    // Check for SVG content (look for viewBox which is common in SVGs)
    if (content.includes('viewBox')) {
      foundSVGContent = true;
      // Count occurrences
      const matches = content.match(/viewBox/g);
      console.log(`✅ SVG content found in: ${jsFile} (${matches?.length} occurrences)`);
    }
  }

  // 3. Summary
  console.log('\n📋 3. Summary');
  console.log('-'.repeat(80));
  console.log(`Database has valid SVG data: ${validSVGs.length > 0 ? '✅' : '❌'}`);
  console.log(`Build includes iconSvg references: ${foundIconSvgRef ? '✅' : '❌'}`);
  console.log(`Build includes dangerouslySetInnerHTML: ${foundDangerouslySetInnerHTML ? '✅' : '❌'}`);
  console.log(`Build includes SVG content: ${foundSVGContent ? '✅' : '❌'}`);

  // 4. Potential Issues
  console.log('\n⚠️  4. Potential Issues');
  console.log('-'.repeat(80));

  const issues = [];

  if (validSVGs.length === 0) {
    issues.push('No valid SVG data in database');
  }

  if (!foundIconSvgRef) {
    issues.push('iconSvg field reference missing from bundle');
  }

  if (!foundDangerouslySetInnerHTML) {
    issues.push('dangerouslySetInnerHTML missing from bundle (HebrewIcon may not be included)');
  }

  if (!foundSVGContent) {
    issues.push('No SVG content in bundle (hardcoded SVG icons from BereshitIcon, ElohimIcon, etc. missing)');
  }

  if (issues.length === 0) {
    console.log('✅ No issues detected!');
    console.log('\n💡 If SVGs are not showing on Vercel:');
    console.log('   1. Check browser console for CSP errors');
    console.log('   2. Verify Supabase environment variables are set correctly');
    console.log('   3. Check network tab to ensure SVG data is being fetched');
    console.log('   4. Inspect DOM to see if dangerouslySetInnerHTML is rendering');
  } else {
    console.log('Found the following issues:');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  }

  // 5. Recommendations
  console.log('\n💡 5. Recommendations');
  console.log('-'.repeat(80));
  console.log('For Vercel deployment:');
  console.log('   - Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  console.log('   - Check Vercel deployment logs for build warnings');
  console.log('   - Verify CSP headers are not blocking inline SVG');
  console.log('   - Test with Vercel preview URL before production deployment');

  console.log('\n' + '='.repeat(80));
}

testSVGBuild();
