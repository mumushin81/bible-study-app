import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Hebrew text from database
const verses = [
  {
    verseId: "genesis_11_1",
    hebrew: "וַֽיְהִ֥י כָל הָאָ֖רֶץ שָׂפָ֣ה אֶחָ֑ת וּדְבָרִ֖ים אֲחָדִֽים"
  },
  {
    verseId: "genesis_11_2",
    hebrew: "וַֽיְהִ֖י בְּנָסְעָ֣ם מִקֶּ֑דֶם וַֽיִּמְצְא֥וּ בִקְעָ֛ה בְּאֶ֥רֶץ שִׁנְעָ֖ר וַיֵּ֥שְׁבוּ שָֽׁם"
  },
  {
    verseId: "genesis_11_3",
    hebrew: "וַיֹּאמְר֞וּ אִ֣ישׁ אֶל רֵעֵ֗הוּ הָ֚בָה נִלְבְּנָ֣ה לְבֵנִ֔ים וְנִשְׂרְפָ֖ה לִשְׂרֵפָ֑ה וַתְּהִ֨י לָהֶ֤ם הַלְּבֵנָה֙ לְאָ֔בֶן וְהַ֣חֵמָ֔ר הָיָ֥ה לָהֶ֖ם לַחֹֽמֶר"
  },
  {
    verseId: "genesis_11_4",
    hebrew: "וַיֹּאמְר֞וּ הָ֣בָה נִבְנֶה לָּ֣נוּ עִ֗יר וּמִגְדָּל֙ וְרֹאשׁ֣וֹ בַשָּׁמַ֔יִם וְנַֽעֲשֶׂה לָּ֖נוּ שֵׁ֑ם פֶּן נָפ֖וּץ עַל פְּנֵ֥י כָל הָאָֽרֶץ"
  },
  {
    verseId: "genesis_11_5",
    hebrew: "וַיֵּ֣רֶד יְהוָ֔ה לִרְאֹ֥ת אֶת הָעִ֖יר וְאֶת הַמִּגְדָּ֑ל אֲשֶׁ֥ר בָּנ֖וּ בְּנֵ֥י הָאָדָֽם"
  },
  {
    verseId: "genesis_11_6",
    hebrew: "וַיֹּ֣אמֶר יְהוָ֗ה הֵ֣ן עַ֤ם אֶחָד֙ וְשָׂפָ֤ה אַחַת֙ לְכֻלָּ֔ם וְזֶ֖ה הַחִלָּ֣ם לַעֲשׂ֑וֹת וְעַתָּה֙ לֹֽא יִבָּצֵ֣ר מֵהֶ֔ם כֹּ֛ל אֲשֶׁ֥ר יָזְמ֖וּ לַֽעֲשֽׂוֹת"
  },
  {
    verseId: "genesis_11_7",
    hebrew: "הָ֚בָה נֵֽרְדָ֔ה וְנָבְלָ֥ה שָׁ֖ם שְׂפָתָ֑ם אֲשֶׁר֙ לֹ֣א יִשְׁמְע֔וּ אִ֖ישׁ שְׂפַ֥ת רֵעֵֽהוּ"
  },
  {
    verseId: "genesis_11_8",
    hebrew: "וַיָּ֨פֶץ יְהוָ֥ה אֹתָ֛ם מִשָּׁ֖ם עַל פְּנֵ֣י כָל הָאָ֑רֶץ וַֽיַּחְדְּל֖וּ לִבְנֹ֥ת הָעִֽיר"
  }
];

const prompt = `You are an expert Hebrew scholar and theologian creating comprehensive educational content for Genesis 11:1-8 (Tower of Babel story) for a Korean Bible study app.

**CRITICAL REQUIREMENTS:**

1. **iconSvg gradient IDs MUST be unique**: Use format "{hebrew-word-romanized}-{identifier}"
   - Example: id="babel-tower1", id="shem-name1", id="safah-tongue1"
   - NEVER use generic IDs like "grad1", "sun1", "point1"

2. **Section titles MUST follow exact format**: "Hebrew (pronunciation) - description"
   - Example: "בָּבֶל (babel) - confusion and scattering"
   - Example: "שָׂפָה (safah) - one language"

3. **All fields are required**: verseId, ipa, koreanPronunciation, modern, words (with letters, iconSvg), commentary (intro, sections, whyQuestion, conclusion)

Generate complete JSON content for these 8 verses:

${verses.map((v, i) => `
**Verse ${i + 1}: ${v.verseId}**
Hebrew: ${v.hebrew}
`).join('\n')}

For each verse, provide:

1. **verseId**: Exact ID from above (e.g., "genesis_11_1")

2. **ipa**: International Phonetic Alphabet transcription

3. **koreanPronunciation**: Korean pronunciation (easy to read for Koreans)

4. **modern**: Natural Korean paraphrase (not literal translation)

5. **words**: Array of word objects, each with:
   - hebrew: Hebrew word with nikud
   - meaning: Korean meaning
   - ipa: IPA pronunciation
   - korean: Korean pronunciation
   - letters: Letter breakdown (e.g., "ב(b) + ָ(a) + בֶל(vel)")
   - root: Hebrew root (e.g., "ב-ב-ל (babel)")
   - grammar: Simple part of speech (명사/동사/형용사/전치사/접속사/부사/대명사)
   - emoji: Single emoji representing the word
   - iconSvg: Custom 64x64 SVG with UNIQUE gradient IDs (format: "{word}-{id}")
   - relatedWords (optional): Array of related Hebrew words

6. **commentary**: Complete commentary with:
   - intro: 2-3 sentences introducing the verse
   - sections: 2-4 sections, each with:
     * emoji: "1️⃣", "2️⃣", "3️⃣", "4️⃣"
     * title: MUST be "Hebrew (pronunciation) - description" format
     * description: 2-3 sentences explaining the word/concept
     * points: 3-4 key points
     * color: "purple", "blue", "green", "pink", "orange", or "yellow"
   - whyQuestion:
     * question: Simple question for children
     * answer: 3-5 sentences, child-friendly explanation
     * bibleReferences: 2-4 related verses in format "Book chapter:verse - 'quote'"
   - conclusion:
     * title: Always "💡 신학적 의미"
     * content: 2-3 sentences on theological significance

**Important Context for Genesis 11:1-8:**
- This is the Tower of Babel story
- Key themes: unity → pride → judgment → scattering → language diversity
- Key words: babel (בָּבֶל), safah/language (שָׂפָה), migdal/tower (מִגְדָּל), shamayim/heaven (שָּׁמַיִם), shem/name (שֵׁם), naphatz/scatter (נָפוּץ), balal/confuse (בָּלַל)
- Theological significance: Human pride vs God's sovereignty, judgment through confusion, basis for linguistic diversity
- Connection to Genesis 1:28 "fill the earth" - humans trying to avoid scattering
- Connects to Pentecost (Acts 2) where languages are unified in the Spirit

Return ONLY valid JSON array with all 8 verses. No markdown, no explanation, just the JSON array starting with [ and ending with ].`;

async function generateContent() {
  console.log('Generating comprehensive content for Genesis 11:1-8...\n');

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 16000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const content = message.content[0];
  if (content.type === 'text') {
    // Extract JSON from response (remove any markdown code blocks)
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return JSON.parse(jsonText);
  }

  throw new Error('Unexpected response format');
}

generateContent()
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
