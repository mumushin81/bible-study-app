import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTestPage() {
  console.log('🔍 SVG 테스트 페이지 생성 중...\n');

  // Genesis 1:1 verse 가져오기
  const { data: verse } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('reference', '창세기 1:1')
    .single();

  if (!verse) {
    console.error('❌ Verse not found');
    return;
  }

  // 모든 단어 가져오기
  const { data: words } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_svg, position')
    .eq('verse_id', verse.id)
    .order('position');

  if (!words) {
    console.error('❌ Words not found');
    return;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SVG 테스트: ${verse.reference}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: white;
      text-align: center;
      margin-bottom: 40px;
      font-size: 2.5em;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.4);
    }

    .card-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .hebrew {
      font-size: 2.5em;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    .meaning {
      font-size: 1.2em;
      color: #666;
    }

    .svg-container {
      width: 100%;
      max-width: 200px;
      margin: 20px auto;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
    }

    .svg-info {
      margin-top: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 0.9em;
    }

    .svg-info div {
      margin: 5px 0;
      display: flex;
      justify-content: space-between;
    }

    .svg-info label {
      font-weight: 600;
      color: #555;
    }

    .svg-info span {
      color: #888;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #4CAF50;
      color: white;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
    }

    .all-together {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      margin-top: 40px;
    }

    .all-together h2 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
      font-size: 2em;
    }

    .inline-svgs {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      padding: 30px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
    }

    .inline-item {
      text-align: center;
    }

    .inline-item .hebrew {
      font-size: 1.5em;
      margin-top: 10px;
    }

    footer {
      text-align: center;
      color: white;
      margin-top: 40px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📖 ${verse.reference} - SVG 아이콘 테스트</h1>

    <div class="grid">
${words
  .map((word, index) => {
    const svg = word.icon_svg || '';
    const idCount = (svg.match(/id="/g) || []).length;
    const elementCount =
      (svg.match(/<path/g) || []).length +
      (svg.match(/<circle/g) || []).length +
      (svg.match(/<rect/g) || []).length +
      (svg.match(/<line/g) || []).length +
      (svg.match(/<ellipse/g) || []).length;

    return `      <div class="card">
        <div class="card-header">
          <div class="hebrew">${word.hebrew}</div>
          <div class="meaning">${word.meaning}</div>
          <span class="badge">단어 ${index + 1}</span>
        </div>
        <div class="svg-container">
          ${svg || '<p style="text-align:center;color:#999;">SVG 없음</p>'}
        </div>
        <div class="svg-info">
          <div><label>SVG 길이:</label><span>${svg.length} 문자</span></div>
          <div><label>ID 개수:</label><span>${idCount}개</span></div>
          <div><label>요소 개수:</label><span>${elementCount}개</span></div>
        </div>
      </div>`;
  })
  .join('\n')}
    </div>

    <div class="all-together">
      <h2>🎨 모든 SVG 한번에 렌더링 (ID 충돌 테스트)</h2>
      <p style="text-align: center; color: #666; margin-bottom: 20px;">
        아래에 모든 단어의 SVG가 동시에 표시됩니다. 각 SVG가 올바르게 렌더링되는지 확인하세요.
      </p>
      <div class="inline-svgs">
${words
  .map(word => {
    return `        <div class="inline-item">
          <div style="width: 80px; height: 80px;">
            ${word.icon_svg || ''}
          </div>
          <div class="hebrew">${word.hebrew}</div>
        </div>`;
  })
  .join('\n')}
      </div>
    </div>

    <footer>
      <p>Generated: ${new Date().toLocaleString('ko-KR')}</p>
      <p>Total Words: ${words.length} | Total SVGs: ${words.filter(w => w.icon_svg).length}</p>
    </footer>
  </div>

  <script>
    // SVG ID 충돌 감지
    window.addEventListener('DOMContentLoaded', () => {
      const allIds = new Map();
      const svgs = document.querySelectorAll('svg [id]');

      svgs.forEach(el => {
        const id = el.getAttribute('id');
        if (allIds.has(id)) {
          allIds.set(id, allIds.get(id) + 1);
        } else {
          allIds.set(id, 1);
        }
      });

      const duplicates = Array.from(allIds.entries()).filter(([_, count]) => count > 1);

      if (duplicates.length > 0) {
        console.warn('⚠️ ID 충돌 감지:', duplicates);
        alert('⚠️ ID 충돌이 감지되었습니다! 콘솔을 확인하세요.');
      } else {
        console.log('✅ ID 충돌 없음');
      }
    });
  </script>
</body>
</html>`;

  const outputPath = '/tmp/svg_test_genesis_1_1.html';
  fs.writeFileSync(outputPath, htmlContent);

  console.log('✅ 테스트 페이지 생성 완료!');
  console.log(`📄 파일: ${outputPath}`);
  console.log('\n브라우저에서 열기:');
  console.log(`  open ${outputPath}`);
}

createTestPage();
