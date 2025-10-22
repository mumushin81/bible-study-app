import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 기존 하드코딩 파생어 데이터
 * 상세한 Binyan/Pattern 정보 포함
 */
interface WordDerivation {
  word_hebrew: string;
  root: string;
  binyan?: string;
  pattern?: string;
  derivation_note?: string;
}

const hardcodedDerivations: WordDerivation[] = [
  // ב-ר-א (창조하다) 어근 파생어
  {
    word_hebrew: 'בָּרָא',
    root: 'ב-ר-א',
    binyan: 'Qal',
    pattern: 'CaCaC',
    derivation_note: 'Qal perfect 3ms - 그가 창조했다',
  },
  {
    word_hebrew: 'בְּרֵאשִׁית',
    root: 'ר-א-ש',
    pattern: 'BeReShit',
    derivation_note: '처음, 태초 - ראש(머리)의 시간적 시작점',
  },

  // ע-ש-ה (만들다) 어근 파생어
  {
    word_hebrew: 'עָשָׂה',
    root: 'ע-ש-ה',
    binyan: 'Qal',
    pattern: 'CaCaC',
    derivation_note: 'Qal perfect 3ms - 그가 만들었다',
  },
  {
    word_hebrew: 'וַיַּעַשׂ',
    root: 'ע-ש-ה',
    binyan: 'Qal',
    pattern: 'wayyiqtol',
    derivation_note: 'Qal imperfect consecutive 3ms - 그리고 그가 만들었다',
  },

  // א-מ-ר (말하다) 어근 파생어
  {
    word_hebrew: 'וַיֹּאמֶר',
    root: 'א-מ-ר',
    binyan: 'Qal',
    pattern: 'wayyiqtol',
    derivation_note: 'Qal imperfect consecutive 3ms - 그리고 그가 말했다',
  },
  {
    word_hebrew: 'אָמַר',
    root: 'א-מ-ר',
    binyan: 'Qal',
    pattern: 'CaCaC',
    derivation_note: 'Qal perfect 3ms - 그가 말했다',
  },

  // ה-י-ה (되다) 어근 파생어
  {
    word_hebrew: 'הָיָה',
    root: 'ה-י-ה',
    binyan: 'Qal',
    pattern: 'CaCaC',
    derivation_note: 'Qal perfect 3ms - 그것이 되었다',
  },
  {
    word_hebrew: 'וַיְהִי',
    root: 'ה-י-ה',
    binyan: 'Qal',
    pattern: 'wayyiqtol',
    derivation_note: 'Qal imperfect consecutive 3ms - 그리고 되었다',
  },
  {
    word_hebrew: 'יְהִי',
    root: 'ה-י-ה',
    binyan: 'Qal',
    pattern: 'yiqtol',
    derivation_note: 'Qal imperfect/jussive 3ms - ~이 있으라 (Let there be)',
  },

  // ר-א-ה (보다) 어근 파생어
  {
    word_hebrew: 'וַיַּרְא',
    root: 'ר-א-ה',
    binyan: 'Qal',
    pattern: 'wayyiqtol',
    derivation_note: 'Qal imperfect consecutive 3ms - 그리고 그가 보았다',
  },
  {
    word_hebrew: 'רָאָה',
    root: 'ר-א-ה',
    binyan: 'Qal',
    pattern: 'CaCaC',
    derivation_note: 'Qal perfect 3ms - 그가 보았다',
  },

  // ק-ר-א (부르다) 어근 파생어
  {
    word_hebrew: 'וַיִּקְרָא',
    root: 'ק-ר-א',
    binyan: 'Qal',
    pattern: 'wayyiqtol',
    derivation_note: 'Qal imperfect consecutive 3ms - 그리고 그가 불렀다 (이름을 주었다)',
  },
  {
    word_hebrew: 'קָרָא',
    root: 'ק-ר-א',
    binyan: 'Qal',
    pattern: 'CaCaC',
    derivation_note: 'Qal perfect 3ms - 그가 불렀다',
  },

  // ב-ד-ל (분리하다) 어근 파생어
  {
    word_hebrew: 'וַיַּבְדֵּל',
    root: 'ב-ד-ל',
    binyan: 'Hiphil',
    pattern: 'wayyiqtol',
    derivation_note: 'Hiphil imperfect consecutive 3ms - 그리고 그가 분리했다 (사역형)',
  },
  {
    word_hebrew: 'לְהַבְדִּיל',
    root: 'ב-ד-ל',
    binyan: 'Hiphil',
    pattern: 'infinitive',
    derivation_note: 'Hiphil infinitive - 분리하기 위하여',
  },

  // נ-ת-ן (주다) 어근 파생어
  {
    word_hebrew: 'וַיִּתֵּן',
    root: 'נ-ת-ן',
    binyan: 'Qal',
    pattern: 'wayyiqtol',
    derivation_note: 'Qal imperfect consecutive 3ms - 그리고 그가 주었다',
  },
  {
    word_hebrew: 'נָתַן',
    root: 'נ-ת-ן',
    binyan: 'Qal',
    pattern: 'CaCaC',
    derivation_note: 'Qal perfect 3ms - 그가 주었다',
  },

  // ע-ל-ה (올라가다) 어근 파생어
  {
    word_hebrew: 'עֹלֶה',
    root: 'ע-ל-ה',
    binyan: 'Qal',
    pattern: 'participle',
    derivation_note: 'Qal participle ms - 올라가는 것',
  },

  // ח-י-ה (살다) 어근 파생어
  {
    word_hebrew: 'חַיָּה',
    root: 'ח-י-ה',
    pattern: 'CaCCaC',
    derivation_note: '생물, 살아있는 것',
  },
  {
    word_hebrew: 'חַי',
    root: 'ח-י-ה',
    pattern: 'CaC',
    derivation_note: '살아있는, 생명의',
  },

  // ר-מ-שׂ (기다) 어근 파생어
  {
    word_hebrew: 'רֶמֶשׂ',
    root: 'ר-מ-שׂ',
    pattern: 'CeCeC',
    derivation_note: '기는 것들, 파충류',
  },
  {
    word_hebrew: 'רֹמֵשׂ',
    root: 'ר-מ-שׂ',
    binyan: 'Qal',
    pattern: 'participle',
    derivation_note: 'Qal participle ms - 기는 것',
  },

  // פ-ר-ה (열매 맺다) 어근 파생어
  {
    word_hebrew: 'פְּרִי',
    root: 'פ-ר-ה',
    pattern: 'CeCi',
    derivation_note: '열매, 과일',
  },
  {
    word_hebrew: 'וּפְרוּ',
    root: 'פ-ר-ה',
    binyan: 'Qal',
    pattern: 'imperative',
    derivation_note: 'Qal imperative mp - 열매 맺으라 (생육하라)',
  },

  // ר-ב-ה (번성하다) 어근 파생어
  {
    word_hebrew: 'וּרְבוּ',
    root: 'ר-ב-ה',
    binyan: 'Qal',
    pattern: 'imperative',
    derivation_note: 'Qal imperative mp - 번성하라',
  },
  {
    word_hebrew: 'רַב',
    root: 'ר-ב-ה',
    pattern: 'CaC',
    derivation_note: '많은, 크다',
  },

  // מ-ל-א (채우다) 어근 파생어
  {
    word_hebrew: 'וּמִלְאוּ',
    root: 'מ-ל-א',
    binyan: 'Qal',
    pattern: 'imperative',
    derivation_note: 'Qal imperative mp - 채우라 (충만하라)',
  },
  {
    word_hebrew: 'מָלֵא',
    root: 'מ-ל-א',
    pattern: 'CaCeC',
    derivation_note: '가득한, 충만한',
  },

  // כ-ב-שׁ (정복하다) 어근 파생어
  {
    word_hebrew: 'וְכִבְשֻׁהָ',
    root: 'כ-ב-שׁ',
    binyan: 'Qal',
    pattern: 'imperative',
    derivation_note: 'Qal imperative mp + 3fs suffix - 그것을 정복하라',
  },

  // ר-ד-ה (다스리다) 어근 파생어
  {
    word_hebrew: 'וּרְדוּ',
    root: 'ר-ד-ה',
    binyan: 'Qal',
    pattern: 'imperative',
    derivation_note: 'Qal imperative mp - 다스리라',
  },

  // ב-ר-ך (축복하다) 어근 파생어
  {
    word_hebrew: 'וַיְבָרֶךְ',
    root: 'ב-ר-ך',
    binyan: 'Piel',
    pattern: 'wayyiqtol',
    derivation_note: 'Piel imperfect consecutive 3ms - 그리고 그가 축복했다',
  },
  {
    word_hebrew: 'בֵּרַךְ',
    root: 'ב-ר-ך',
    binyan: 'Piel',
    pattern: 'CiCeC',
    derivation_note: 'Piel perfect 3ms - 그가 축복했다',
  },

  // ט-ו-ב (좋다) 어근 파생어
  {
    word_hebrew: 'טוֹב',
    root: 'ט-ו-ב',
    pattern: 'CoC',
    derivation_note: '좋은, 선한 (형용사)',
  },

  // ש-ב-ת (쉬다) 어근 파생어
  {
    word_hebrew: 'וַיִּשְׁבֹּת',
    root: 'ש-ב-ת',
    binyan: 'Qal',
    pattern: 'wayyiqtol',
    derivation_note: 'Qal imperfect consecutive 3ms - 그리고 그가 쉬었다',
  },
  {
    word_hebrew: 'שַׁבָּת',
    root: 'ש-ב-ת',
    pattern: 'CaCCaC',
    derivation_note: '안식일',
  },

  // ק-ד-שׁ (거룩하게 하다) 어근 파생어
  {
    word_hebrew: 'וַיְקַדֵּשׁ',
    root: 'ק-ד-שׁ',
    binyan: 'Piel',
    pattern: 'wayyiqtol',
    derivation_note: 'Piel imperfect consecutive 3ms - 그리고 그가 거룩하게 했다',
  },
  {
    word_hebrew: 'קֹדֶשׁ',
    root: 'ק-ד-שׁ',
    pattern: 'CoCeC',
    derivation_note: '거룩함, 성소',
  },

  // כ-ל-ה (완성하다) 어근 파생어
  {
    word_hebrew: 'וַיְכַל',
    root: 'כ-ל-ה',
    binyan: 'Piel',
    pattern: 'wayyiqtol',
    derivation_note: 'Piel imperfect consecutive 3ms - 그리고 그가 완성했다',
  },
  {
    word_hebrew: 'כָּלָה',
    root: 'כ-ל-ה',
    binyan: 'Qal',
    pattern: 'CaCaC',
    derivation_note: 'Qal perfect 3ms - 완성되다, 끝나다',
  },

  // א-כ-ל (먹다) 어근 파생어
  {
    word_hebrew: 'אָכַל',
    root: 'א-כ-ל',
    binyan: 'Qal',
    pattern: 'CaCaC',
    derivation_note: 'Qal perfect 3ms - 그가 먹었다',
  },
  {
    word_hebrew: 'תֹאכַל',
    root: 'א-כ-ל',
    binyan: 'Qal',
    pattern: 'yiqtol',
    derivation_note: 'Qal imperfect 2ms - 너는 먹을 것이다',
  },
  {
    word_hebrew: 'לֶאֱכֹל',
    root: 'א-כ-ל',
    binyan: 'Qal',
    pattern: 'infinitive',
    derivation_note: 'Qal infinitive - 먹기 위하여',
  },

  // ע-ב-ד (섬기다, 일하다) 어근 파생어
  {
    word_hebrew: 'לְעָבְדָהּ',
    root: 'ע-ב-ד',
    binyan: 'Qal',
    pattern: 'infinitive',
    derivation_note: 'Qal infinitive + 3fs suffix - 그것을 섬기기/일하기 위하여',
  },
  {
    word_hebrew: 'עֹבֵד',
    root: 'ע-ב-ד',
    binyan: 'Qal',
    pattern: 'participle',
    derivation_note: 'Qal participle ms - 일하는 자, 종',
  },

  // ש-מ-ר (지키다) 어근 파생어
  {
    word_hebrew: 'וּלְשָׁמְרָהּ',
    root: 'ש-מ-ר',
    binyan: 'Qal',
    pattern: 'infinitive',
    derivation_note: 'Qal infinitive + 3fs suffix - 그것을 지키기 위하여',
  },
  {
    word_hebrew: 'שָׁמַר',
    root: 'ש-מ-ר',
    binyan: 'Qal',
    pattern: 'CaCaC',
    derivation_note: 'Qal perfect 3ms - 그가 지켰다',
  },

  // צ-ו-ה (명령하다) 어근 파생어
  {
    word_hebrew: 'וַיְצַו',
    root: 'צ-ו-ה',
    binyan: 'Piel',
    pattern: 'wayyiqtol',
    derivation_note: 'Piel imperfect consecutive 3ms - 그리고 그가 명령했다',
  },
  {
    word_hebrew: 'צִוָּה',
    root: 'צ-ו-ה',
    binyan: 'Piel',
    pattern: 'CiCCaC',
    derivation_note: 'Piel perfect 3ms - 그가 명령했다',
  },

  // י-ד-ע (알다) 어근 파생어
  {
    word_hebrew: 'יָדַע',
    root: 'י-ד-ע',
    binyan: 'Qal',
    pattern: 'CaCaC',
    derivation_note: 'Qal perfect 3ms - 그가 알았다',
  },
  {
    word_hebrew: 'דַּעַת',
    root: 'י-ד-ע',
    pattern: 'CaCaC',
    derivation_note: '지식, 앎',
  },

  // מ-ו-ת (죽다) 어근 파생어
  {
    word_hebrew: 'מוֹת',
    root: 'מ-ו-ת',
    binyan: 'Qal',
    pattern: 'infinitive absolute',
    derivation_note: 'Qal infinitive absolute - 확실히 죽다',
  },
  {
    word_hebrew: 'תָּמוּת',
    root: 'מ-ו-ת',
    binyan: 'Qal',
    pattern: 'yiqtol',
    derivation_note: 'Qal imperfect 2ms - 너는 죽을 것이다',
  },
];

async function mergeDerivations() {
  console.log('🔄 파생어 병합 시작...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. 모든 어근 가져오기
    const { data: roots, error: rootsError } = await supabase
      .from('hebrew_roots')
      .select('id, root');

    if (rootsError) throw rootsError;

    const rootMap = new Map<string, string>();
    roots.forEach(root => {
      rootMap.set(root.root, root.id);
    });

    console.log(`📚 ${roots.length}개 어근 로드됨`);

    // 2. 모든 단어 가져오기
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, hebrew');

    if (wordsError) throw wordsError;

    const wordMap = new Map<string, string>();
    words.forEach(word => {
      wordMap.set(word.hebrew, word.id);
    });

    console.log(`📖 ${words.length}개 단어 로드됨\n`);

    // 3. 하드코딩 데이터 업데이트
    console.log('🔧 하드코딩 데이터 업데이트 중...\n');

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const derivation of hardcodedDerivations) {
      const rootId = rootMap.get(derivation.root);
      const wordId = wordMap.get(derivation.word_hebrew);

      if (!rootId) {
        console.warn(`⚠️  어근 없음: ${derivation.root}`);
        notFoundCount++;
        continue;
      }

      if (!wordId) {
        console.warn(`⚠️  단어 없음: ${derivation.word_hebrew}`);
        notFoundCount++;
        continue;
      }

      // 기존 매핑이 있는지 확인
      const { data: existing } = await supabase
        .from('word_derivations')
        .select('id')
        .eq('root_id', rootId)
        .eq('word_id', wordId)
        .single();

      if (existing) {
        // 업데이트: Binyan/Pattern 정보 추가
        const { error: updateError } = await supabase
          .from('word_derivations')
          .update({
            binyan: derivation.binyan || null,
            pattern: derivation.pattern || null,
            derivation_note: derivation.derivation_note || null,
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`❌ 업데이트 실패: ${derivation.word_hebrew}`, updateError.message);
        } else {
          console.log(`✅ 업데이트: ${derivation.word_hebrew} (${derivation.binyan || 'N/A'})`);
          updatedCount++;
        }
      } else {
        // 삽입: 새로운 매핑
        const { error: insertError } = await supabase
          .from('word_derivations')
          .insert({
            root_id: rootId,
            word_id: wordId,
            binyan: derivation.binyan || null,
            pattern: derivation.pattern || null,
            derivation_note: derivation.derivation_note || null,
          });

        if (insertError) {
          console.error(`❌ 삽입 실패: ${derivation.word_hebrew}`, insertError.message);
        } else {
          console.log(`✅ 삽입: ${derivation.word_hebrew} (${derivation.binyan || 'N/A'})`);
          updatedCount++;
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 병합 완료:');
    console.log(`   ✅ 업데이트/삽입: ${updatedCount}개`);
    console.log(`   ⚠️  미발견: ${notFoundCount}개`);
    console.log(`   📦 하드코딩 데이터: ${hardcodedDerivations.length}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 4. 최종 통계
    const { count: finalCount } = await supabase
      .from('word_derivations')
      .select('*', { count: 'exact', head: true });

    const { count: withBinyanCount } = await supabase
      .from('word_derivations')
      .select('*', { count: 'exact', head: true })
      .not('binyan', 'is', null);

    console.log('\n✨ 최종 결과:');
    console.log(`   전체 파생어: ${finalCount}개`);
    console.log(`   상세 정보 (Binyan 포함): ${withBinyanCount}개`);
    console.log(`   기본 정보만: ${finalCount! - withBinyanCount!}개`);

  } catch (err) {
    console.error('❌ 오류 발생:', err);
    process.exit(1);
  }

  console.log('\n✅ 병합 완료!');
  process.exit(0);
}

mergeDerivations();
