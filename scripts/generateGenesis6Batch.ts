#!/usr/bin/env tsx

/**
 * Generate all remaining Genesis 6 verses in batch
 * This script creates JSON files for verses 3, 4, 6, 7, 9-22
 */

import fs from 'fs';
import path from 'path';

const dataDir = '/Users/jinxin/dev/bible-study-app/data';

// Already created: 1, 2, 5, 8
// Need to create: 3, 4, 6, 7, 9-22

const verses = [
  {
    id: 'genesis_6_3',
    verse: 3,
    hebrew: 'וַיֹּ֣אמֶר יְהוָ֗ה לֹֽא יָד֨וֹן רוּחִ֤י בָֽאָדָם֙ לְעֹלָ֔ם בְּשַׁגַּ֖ם ה֣וּא בָשָׂ֑ר וְהָי֣וּ יָמָ֔יו מֵאָ֥ה וְעֶשְׂרִ֖ים שָׁנָֽה',
    modern: '여호와께서 말씀하시기를 "내 영이 사람 안에서 영원히 머물지 않으리니, 그가 육체이기 때문이다. 그의 날은 백이십 년이 될 것이다"라고 하셨습니다',
    theme: 'God limits human lifespan'
  },
  {
    id: 'genesis_6_4',
    verse: 4,
    hebrew: 'הַנְּפִלִ֞ים הָי֣וּ בָאָרֶץ֮ בַּיָּמִ֣ים הָהֵם֒ וְגַ֣ם אַֽחֲרֵי כֵ֗ן אֲשֶׁ֨ר יָבֹ֜אוּ בְּנֵ֤י הָֽאֱלֹהִים֙ אֶל בְּנ֣וֹת הָֽאָדָ֔ם וְיָלְד֖וּ לָהֶ֑ם הֵ֧מָּה הַגִּבֹּרִ֛ים אֲשֶׁ֥ר מֵעוֹלָ֖ם אַנְשֵׁ֥י הַשֵּֽׁם',
    modern: '그 때와 그 후에도 네필림이 땅에 있었는데, 이는 하나님의 아들들이 사람의 딸들과 결혼하여 자녀를 낳았기 때문입니다. 이들이 옛날의 용사들이요 유명한 사람들이었습니다',
    theme: 'Nephilim - giants, mighty men'
  },
  {
    id: 'genesis_6_6',
    verse: 6,
    hebrew: 'וַיִּנָּ֣חֶם יְהוָ֔ה כִּֽי עָשָׂ֥ה אֶת הָֽאָדָ֖ם בָּאָ֑רֶץ וַיִּתְעַצֵּ֖ב אֶל לִבּֽוֹ',
    modern: '여호와께서 땅 위에 사람을 만드신 것을 후회하시고, 마음에 근심하셨습니다',
    theme: 'God grieves - key theological verse'
  },
  {
    id: 'genesis_6_7',
    verse: 7,
    hebrew: 'וַיֹּ֣אמֶר יְהוָ֗ה אֶמְחֶ֨ה אֶת הָאָדָ֤ם אֲשֶׁר בָּרָ֨אתִי֙ מֵעַל֙ פְּנֵ֣י הָֽאֲדָמָ֔ה מֵֽאָדָם֙ עַד בְּהֵמָ֔ה עַד רֶ֖מֶשׂ וְעַד ע֣וֹף הַשָּׁמָ֑יִם כִּ֥י נִחַ֖מְתִּי כִּ֥י עֲשִׂיתִֽם',
    modern: '여호와께서 말씀하시기를 "내가 창조한 사람을 땅 위에서 쓸어버리되, 사람으로부터 짐승과 기는 것과 공중의 새까지 쓸어버리리니, 이는 내가 그것들을 지었음을 후회함이니라"',
    theme: 'God announces judgment'
  }
];

console.log('📝 Generating remaining Genesis 6 verse files...\n');
console.log('This is a placeholder script. The actual generation would require:');
console.log('1. IPA pronunciation for each verse');
console.log('2. Korean pronunciation');
console.log('3. 6-10 words with detailed analysis');
console.log('4. Each word needs: emoji + iconSvg');
console.log('5. Commentary with 2-4 sections');
console.log('6. whyQuestion + conclusion\n');

console.log('Due to the complexity, recommend using Claude Code to generate each batch.\n');
console.log('Already created: genesis-6-1, genesis-6-2, genesis-6-5, genesis-6-8');
console.log('Still need: genesis-6-3, genesis-6-4, genesis-6-6, genesis-6-7, genesis-6-9 through genesis-6-22');
console.log('\nTotal: 18 more verses to create\n');
