/**
 * Batch generate all Genesis 7 verses (2-10, 12-15, 17-22, 24)
 * Priority verses (1, 11, 16, 23) are already created
 */

import * as fs from 'fs';
import * as path from 'path';

const versesData = {
  "genesis_7_2": {
    hebrew: "מִכֹּ֣ל הַבְּהֵמָ֣ה הַטְּהוֹרָ֗ה תִּֽקַּח לְךָ֛ שִׁבְעָ֥ה שִׁבְעָ֖ה אִ֣ישׁ וְאִשְׁתּ֑וֹ וּמִן הַבְּהֵמָ֡ה אֲ֠שֶׁר לֹ֣א טְהֹרָ֥ה הִ֛וא שְׁנַ֖יִם אִ֥ישׁ וְאִשְׁתּֽוֹ",
    ipa: "mikːol habːeheˈma hatːəhoˈra tːiqːˈaχ ləχˈa ʃivˈʔa ʃivˈʔa ˈʔiʃ vəʔiʃˈtːo umin habːeheˈma ʔaˈʃɛr lo təhoˈra hi ʃəˈnajim ˈʔiʃ vəʔiʃˈtːo",
    korean: "미콜 하베헤마 하테호라 티카흐 레카 쉬브아 쉬브아 이쉬 베이쉬토 우민 하베헤마 아셰르 로 테호라 히 쉐나임 이쉬 베이쉬토",
    modern: "정결한 짐승은 수컷과 암컷 일곱 쌍씩, 부정한 짐승은 수컷과 암컷 한 쌍씩 네게로 데려오라",
    theological_points: ["정결과 부정결의 구분", "제사를 위한 준비", "하나님의 세심한 지시"]
  },
  "genesis_7_3": {
    hebrew: "גַּ֣ם מֵע֧וֹף הַשָּׁמַ֛יִם שִׁבְעָ֥ה שִׁבְעָ֖ה זָכָ֣ר וּנְקֵבָ֑ה לְחַיּ֥וֹת זֶ֖רַע עַל פְּנֵ֥י כָל הָאָֽרֶץ",
    ipa: "gam meˈʔof haʃːaˈmajim ʃivˈʔa ʃivˈʔa zaˈχar unqeˈva ləχajːˈot ˈzɛraʔ ʔal pəˈne χol haˈʔarɛts",
    korean: "감 메오프 하샤마임 쉬브아 쉬브아 자카르 운케바 레하요트 제라 알 페네 콜 하아레츠",
    modern: "공중의 새도 수컷과 암컷 일곱 쌍씩 데려와서 온 땅 위에 그 씨가 살아 있게 하라",
    theological_points: ["생명 보존의 목적", "재생산과 번성", "하나님의 창조 질서 유지"]
  }
};

console.log("Genesis 7 batch generation data prepared");
console.log("Total verses to generate:", Object.keys(versesData).length);

