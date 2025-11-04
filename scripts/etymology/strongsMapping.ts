/**
 * Strong's Number Mapping for Hebrew Roots
 * Maps Hebrew roots to their corresponding Strong's Concordance numbers
 */

export interface StrongsMapping {
  root: string;              // e.g., "ב-ר-א"
  root_hebrew: string;       // e.g., "ברא"
  strong_number: string;     // e.g., "H1254"
  strong_url: string;        // BlueLetterBible URL
  biblehub_url: string;      // BibleHub URL
  primary_form?: string;     // Primary dictionary form (usually Qal perfect 3ms)
}

/**
 * Manually curated Strong's Number mapping for common Hebrew roots
 * Based on most frequent/primary usage
 */
export const STRONGS_MAPPINGS: StrongsMapping[] = [
  // Creation and Making
  { root: 'ב-ר-א', root_hebrew: 'ברא', strong_number: 'H1254', strong_url: 'https://www.blueletterbible.org/lexicon/h1254/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/1254.htm', primary_form: 'בָּרָא' },
  { root: 'ע-ש-ה', root_hebrew: 'עשה', strong_number: 'H6213', strong_url: 'https://www.blueletterbible.org/lexicon/h6213/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/6213.htm', primary_form: 'עָשָׂה' },
  { root: 'י-צ-ר', root_hebrew: 'יצר', strong_number: 'H3335', strong_url: 'https://www.blueletterbible.org/lexicon/h3335/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/3335.htm', primary_form: 'יָצַר' },

  // Being and Existence
  { root: 'ה-י-ה', root_hebrew: 'היה', strong_number: 'H1961', strong_url: 'https://www.blueletterbible.org/lexicon/h1961/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/1961.htm', primary_form: 'הָיָה' },

  // Communication
  { root: 'א-מ-ר', root_hebrew: 'אמר', strong_number: 'H559', strong_url: 'https://www.blueletterbible.org/lexicon/h559/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/559.htm', primary_form: 'אָמַר' },
  { root: 'ד-ב-ר', root_hebrew: 'דבר', strong_number: 'H1696', strong_url: 'https://www.blueletterbible.org/lexicon/h1696/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/1696.htm', primary_form: 'דָּבַר' },
  { root: 'ק-ר-א', root_hebrew: 'קרא', strong_number: 'H7121', strong_url: 'https://www.blueletterbible.org/lexicon/h7121/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/7121.htm', primary_form: 'קָרָא' },

  // Perception
  { root: 'ר-א-ה', root_hebrew: 'ראה', strong_number: 'H7200', strong_url: 'https://www.blueletterbible.org/lexicon/h7200/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/7200.htm', primary_form: 'רָאָה' },
  { root: 'ש-מ-ע', root_hebrew: 'שמע', strong_number: 'H8085', strong_url: 'https://www.blueletterbible.org/lexicon/h8085/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/8085.htm', primary_form: 'שָׁמַע' },
  { root: 'י-ד-ע', root_hebrew: 'ידע', strong_number: 'H3045', strong_url: 'https://www.blueletterbible.org/lexicon/h3045/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/3045.htm', primary_form: 'יָדַע' },

  // Movement
  { root: 'ה-ל-ך', root_hebrew: 'הלך', strong_number: 'H1980', strong_url: 'https://www.blueletterbible.org/lexicon/h1980/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/1980.htm', primary_form: 'הָלַךְ' },
  { root: 'ב-ו-א', root_hebrew: 'בוא', strong_number: 'H935', strong_url: 'https://www.blueletterbible.org/lexicon/h935/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/935.htm', primary_form: 'בּוֹא' },
  { root: 'י-צ-א', root_hebrew: 'יצא', strong_number: 'H3318', strong_url: 'https://www.blueletterbible.org/lexicon/h3318/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/3318.htm', primary_form: 'יָצָא' },
  { root: 'ש-ו-ב', root_hebrew: 'שוב', strong_number: 'H7725', strong_url: 'https://www.blueletterbible.org/lexicon/h7725/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/7725.htm', primary_form: 'שׁוּב' },

  // Giving and Taking
  { root: 'נ-ת-ן', root_hebrew: 'נתן', strong_number: 'H5414', strong_url: 'https://www.blueletterbible.org/lexicon/h5414/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/5414.htm', primary_form: 'נָתַן' },
  { root: 'ל-ק-ח', root_hebrew: 'לקח', strong_number: 'H3947', strong_url: 'https://www.blueletterbible.org/lexicon/h3947/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/3947.htm', primary_form: 'לָקַח' },

  // Separation and Division
  { root: 'ב-ד-ל', root_hebrew: 'בדל', strong_number: 'H914', strong_url: 'https://www.blueletterbible.org/lexicon/h914/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/914.htm', primary_form: 'בָּדַל' },

  // Life and Death
  { root: 'ח-י-ה', root_hebrew: 'חיה', strong_number: 'H2421', strong_url: 'https://www.blueletterbible.org/lexicon/h2421/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/2421.htm', primary_form: 'חָיָה' },
  { root: 'מ-ו-ת', root_hebrew: 'מות', strong_number: 'H4191', strong_url: 'https://www.blueletterbible.org/lexicon/h4191/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/4191.htm', primary_form: 'מוּת' },

  // Growth and Multiplication
  { root: 'ז-ר-ע', root_hebrew: 'זרע', strong_number: 'H2232', strong_url: 'https://www.blueletterbible.org/lexicon/h2232/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/2232.htm', primary_form: 'זָרַע' },
  { root: 'פ-ר-ה', root_hebrew: 'פרה', strong_number: 'H6509', strong_url: 'https://www.blueletterbible.org/lexicon/h6509/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/6509.htm', primary_form: 'פָּרָה' },
  { root: 'ר-ב-ה', root_hebrew: 'רבה', strong_number: 'H7235', strong_url: 'https://www.blueletterbible.org/lexicon/h7235/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/7235.htm', primary_form: 'רָבָה' },

  // Blessing and Cursing
  { root: 'ב-ר-ך', root_hebrew: 'ברך', strong_number: 'H1288', strong_url: 'https://www.blueletterbible.org/lexicon/h1288/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/1288.htm', primary_form: 'בָּרַךְ' },
  { root: 'א-ר-ר', root_hebrew: 'ארר', strong_number: 'H779', strong_url: 'https://www.blueletterbible.org/lexicon/h779/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/779.htm', primary_form: 'אָרַר' },

  // Love and Hatred
  { root: 'א-ה-ב', root_hebrew: 'אהב', strong_number: 'H157', strong_url: 'https://www.blueletterbible.org/lexicon/h157/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/157.htm', primary_form: 'אָהַב' },

  // Work and Rest
  { root: 'ע-ב-ד', root_hebrew: 'עבד', strong_number: 'H5647', strong_url: 'https://www.blueletterbible.org/lexicon/h5647/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/5647.htm', primary_form: 'עָבַד' },
  { root: 'ש-ב-ת', root_hebrew: 'שבת', strong_number: 'H7673', strong_url: 'https://www.blueletterbible.org/lexicon/h7673/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/7673.htm', primary_form: 'שָׁבַת' },

  // Good and Evil
  { root: 'ט-ו-ב', root_hebrew: 'טוב', strong_number: 'H2896', strong_url: 'https://www.blueletterbible.org/lexicon/h2896/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/2896.htm', primary_form: 'טוֹב' },
  { root: 'ר-ע-ע', root_hebrew: 'רעע', strong_number: 'H7489', strong_url: 'https://www.blueletterbible.org/lexicon/h7489/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/7489.htm', primary_form: 'רָעַע' },

  // Remembering and Forgetting
  { root: 'ז-כ-ר', root_hebrew: 'זכר', strong_number: 'H2142', strong_url: 'https://www.blueletterbible.org/lexicon/h2142/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/2142.htm', primary_form: 'זָכַר' },
  { root: 'ש-כ-ח', root_hebrew: 'שכח', strong_number: 'H7911', strong_url: 'https://www.blueletterbible.org/lexicon/h7911/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/7911.htm', primary_form: 'שָׁכַח' },

  // Eating and Drinking
  { root: 'א-כ-ל', root_hebrew: 'אכל', strong_number: 'H398', strong_url: 'https://www.blueletterbible.org/lexicon/h398/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/398.htm', primary_form: 'אָכַל' },
  { root: 'ש-ת-ה', root_hebrew: 'שתה', strong_number: 'H8354', strong_url: 'https://www.blueletterbible.org/lexicon/h8354/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/8354.htm', primary_form: 'שָׁתָה' },

  // Building and Dwelling
  { root: 'ב-נ-ה', root_hebrew: 'בנה', strong_number: 'H1129', strong_url: 'https://www.blueletterbible.org/lexicon/h1129/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/1129.htm', primary_form: 'בָּנָה' },
  { root: 'י-ש-ב', root_hebrew: 'ישב', strong_number: 'H3427', strong_url: 'https://www.blueletterbible.org/lexicon/h3427/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/3427.htm', primary_form: 'יָשַׁב' },

  // Finding and Seeking
  { root: 'מ-צ-א', root_hebrew: 'מצא', strong_number: 'H4672', strong_url: 'https://www.blueletterbible.org/lexicon/h4672/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/4672.htm', primary_form: 'מָצָא' },
  { root: 'ב-ק-ש', root_hebrew: 'בקש', strong_number: 'H1245', strong_url: 'https://www.blueletterbible.org/lexicon/h1245/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/1245.htm', primary_form: 'בָּקַשׁ' },

  // Sending and Bringing
  { root: 'ש-ל-ח', root_hebrew: 'שלח', strong_number: 'H7971', strong_url: 'https://www.blueletterbible.org/lexicon/h7971/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/7971.htm', primary_form: 'שָׁלַח' },

  // Rising and Falling
  { root: 'ק-ו-ם', root_hebrew: 'קום', strong_number: 'H6965', strong_url: 'https://www.blueletterbible.org/lexicon/h6965/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/6965.htm', primary_form: 'קוּם' },
  { root: 'נ-פ-ל', root_hebrew: 'נפל', strong_number: 'H5307', strong_url: 'https://www.blueletterbible.org/lexicon/h5307/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/5307.htm', primary_form: 'נָפַל' },

  // Keeping and Guarding
  { root: 'ש-מ-ר', root_hebrew: 'שמר', strong_number: 'H8104', strong_url: 'https://www.blueletterbible.org/lexicon/h8104/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/8104.htm', primary_form: 'שָׁמַר' },

  // Writing and Reading
  { root: 'כ-ת-ב', root_hebrew: 'כתב', strong_number: 'H3789', strong_url: 'https://www.blueletterbible.org/lexicon/h3789/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/3789.htm', primary_form: 'כָּתַב' },
  { root: 'ק-ר-א', root_hebrew: 'קרא', strong_number: 'H7121', strong_url: 'https://www.blueletterbible.org/lexicon/h7121/kjv/wlc/0-1/', biblehub_url: 'https://biblehub.com/hebrew/7121.htm', primary_form: 'קָרָא' },
];

/**
 * Get Strong's mapping for a given Hebrew root
 */
export function getStrongsMapping(root: string): StrongsMapping | undefined {
  return STRONGS_MAPPINGS.find(m => m.root === root || m.root_hebrew === root);
}

/**
 * Get all mapped Strong's numbers
 */
export function getAllMappedRoots(): string[] {
  return STRONGS_MAPPINGS.map(m => m.root);
}
