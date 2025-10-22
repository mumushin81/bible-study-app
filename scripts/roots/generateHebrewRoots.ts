import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 주요 히브리어 어근 데이터
 * 창세기에서 자주 나오는 어근들을 중심으로 구성
 */
const hebrewRoots = [
  // 창조 관련 어근
  {
    root: 'ב-ר-א',
    root_hebrew: 'ברא',
    core_meaning: 'to create',
    core_meaning_korean: '창조하다',
    semantic_field: 'creation, formation, divine action',
    frequency: 54,
    importance: 5,
    mnemonic: '바-라 → 바로 무에서 유를 창조하는 하나님의 능력',
    story: '오직 하나님만이 할 수 있는 무에서 유를 만드는 창조. 인간의 "만들기"와는 차원이 다른 신적 행위를 나타냅니다.',
    emoji: '✨',
  },
  {
    root: 'ע-ש-ה',
    root_hebrew: 'עשה',
    core_meaning: 'to make, do',
    core_meaning_korean: '만들다, 하다',
    semantic_field: 'making, doing, crafting',
    frequency: 2632,
    importance: 5,
    mnemonic: '아-사 → 아! 사람이 만드는 행위',
    story: '이미 있는 재료로 무언가를 만들거나 행동하는 것. ברא(창조)와 달리 인간도 할 수 있는 행위입니다.',
    emoji: '🔨',
  },
  {
    root: 'א-מ-ר',
    root_hebrew: 'אמר',
    core_meaning: 'to say, speak',
    core_meaning_korean: '말하다',
    semantic_field: 'speech, declaration, command',
    frequency: 5316,
    importance: 5,
    mnemonic: '아-마르 → 아! 말하다',
    story: '하나님의 말씀의 능력. "빛이 있으라" 하시매 빛이 있었다. 말씀으로 세상을 창조하신 능력입니다.',
    emoji: '💬',
  },
  {
    root: 'ה-י-ה',
    root_hebrew: 'היה',
    core_meaning: 'to be, become, exist',
    core_meaning_korean: '되다, 존재하다',
    semantic_field: 'existence, being, becoming',
    frequency: 3576,
    importance: 5,
    mnemonic: '하-야 → 하늘과 땅이 되었다',
    story: '존재의 동사. 하나님의 자기 계시 "나는 스스로 있는 자"(אהיה אשר אהיה)의 핵심 어근입니다.',
    emoji: '🌟',
  },

  // 보기/알기 관련 어근
  {
    root: 'ר-א-ה',
    root_hebrew: 'ראה',
    core_meaning: 'to see, perceive',
    core_meaning_korean: '보다, 인식하다',
    semantic_field: 'seeing, perceiving, understanding',
    frequency: 1311,
    importance: 4,
    mnemonic: '라-아 → 라! 아! 보다',
    story: '단순히 눈으로 보는 것을 넘어 영적으로 깨닫고 이해하는 것까지 포함합니다.',
    emoji: '👁️',
  },
  {
    root: 'י-ד-ע',
    root_hebrew: 'ידע',
    core_meaning: 'to know',
    core_meaning_korean: '알다',
    semantic_field: 'knowledge, intimacy, recognition',
    frequency: 956,
    importance: 5,
    mnemonic: '야-다 → 야! 다 알겠다',
    story: '머리로만 아는 지식이 아닌 체험적으로 친밀하게 아는 것. 부부 관계에도 사용되는 깊은 앎입니다.',
    emoji: '🧠',
  },

  // 주기/받기 관련 어근
  {
    root: 'נ-ת-ן',
    root_hebrew: 'נתן',
    core_meaning: 'to give, put',
    core_meaning_korean: '주다, 두다',
    semantic_field: 'giving, granting, placing',
    frequency: 2014,
    importance: 4,
    mnemonic: '나-탄 → 나! 탄생의 선물을 주다',
    story: '하나님이 인간에게 생명, 땅, 복을 주시는 은혜의 행위. 주권적 선물입니다.',
    emoji: '🎁',
  },
  {
    root: 'ל-ק-ח',
    root_hebrew: 'לקח',
    core_meaning: 'to take, receive',
    core_meaning_korean: '취하다, 받다',
    semantic_field: 'taking, receiving, acquiring',
    frequency: 967,
    importance: 4,
    mnemonic: '라-카흐 → 라! 카트에 담아 받다',
    story: '하나님이 주신 것을 받아들이거나, 선택하여 취하는 행위입니다.',
    emoji: '🤲',
  },

  // 가기/오기 관련 어근
  {
    root: 'ה-ל-ך',
    root_hebrew: 'הלך',
    core_meaning: 'to walk, go',
    core_meaning_korean: '걷다, 가다',
    semantic_field: 'walking, movement, lifestyle',
    frequency: 1554,
    importance: 4,
    mnemonic: '할-라크 → 할랄루야! 락앤롤처럼 걷다',
    story: '단순한 이동이 아닌 삶의 방식, 행실을 의미. "하나님과 동행하다"의 핵심 어근입니다.',
    emoji: '🚶',
  },
  {
    root: 'ב-ו-א',
    root_hebrew: 'בוא',
    core_meaning: 'to come, enter',
    core_meaning_korean: '오다, 들어가다',
    semantic_field: 'coming, entering, arriving',
    frequency: 2592,
    importance: 4,
    mnemonic: '보 → 보! 오다',
    story: '약속의 땅에 들어가다, 하나님의 임재 안으로 들어가다는 의미로 확장됩니다.',
    emoji: '🚪',
  },
  {
    root: 'י-צ-א',
    root_hebrew: 'יצא',
    core_meaning: 'to go out, exit',
    core_meaning_korean: '나가다, 나오다',
    semantic_field: 'going out, departure, exodus',
    frequency: 1076,
    importance: 4,
    mnemonic: '야-차 → 야! 차 타고 나가다',
    story: '애굽에서 나오다(출애굽)의 핵심 어근. 속박에서 자유로 나오는 구원의 행위입니다.',
    emoji: '🏃',
  },

  // 죽음/생명 관련 어근
  {
    root: 'ח-י-ה',
    root_hebrew: 'חיה',
    core_meaning: 'to live, be alive',
    core_meaning_korean: '살다, 생명을 얻다',
    semantic_field: 'life, living, vitality',
    frequency: 283,
    importance: 5,
    mnemonic: '하-야 → 하! 야! 살아있다',
    story: '단순한 생존이 아닌 하나님 안에서의 풍성한 생명. "생명의 기운"(נשמת חיים)의 근원입니다.',
    emoji: '💚',
  },
  {
    root: 'מ-ו-ת',
    root_hebrew: 'מות',
    core_meaning: 'to die, death',
    core_meaning_korean: '죽다',
    semantic_field: 'death, dying, mortality',
    frequency: 854,
    importance: 4,
    mnemonic: '무트 → 무! 트임 없이 죽다',
    story: '죄의 결과로 온 죽음. 그러나 하나님은 죽음을 이기시고 생명을 주십니다.',
    emoji: '☠️',
  },

  // 말하기/부르기 관련 어근
  {
    root: 'ק-ר-א',
    root_hebrew: 'קרא',
    core_meaning: 'to call, read, proclaim',
    core_meaning_korean: '부르다, 읽다, 선포하다',
    semantic_field: 'calling, naming, proclamation',
    frequency: 739,
    importance: 4,
    mnemonic: '카-라 → 카! 라! 부르다',
    story: '이름을 부르는 것은 존재를 인정하고 관계를 맺는 것. 하나님이 아브라함을 부르신 소명입니다.',
    emoji: '📣',
  },
  {
    root: 'ד-ב-ר',
    root_hebrew: 'דבר',
    core_meaning: 'to speak, word',
    core_meaning_korean: '말하다, 말씀',
    semantic_field: 'speaking, words, communication',
    frequency: 1125,
    importance: 5,
    mnemonic: '다-바르 → 다! 바로 말하다',
    story: '하나님의 말씀(דבר)은 능력이 있어 반드시 이루어집니다. "그 말씀대로 되리이다"의 확신입니다.',
    emoji: '📜',
  },

  // 축복/저주 관련 어근
  {
    root: 'ב-ר-ך',
    root_hebrew: 'ברך',
    core_meaning: 'to bless, kneel',
    core_meaning_korean: '축복하다, 무릎 꿇다',
    semantic_field: 'blessing, benediction, worship',
    frequency: 330,
    importance: 5,
    mnemonic: '바-라크 → 바로 라! 크게 축복하다',
    story: '하나님의 축복은 단순한 말이 아닌 실재하는 능력. 아브라함에게 "복의 근원"이 되라 하셨습니다.',
    emoji: '🙏',
  },
  {
    root: 'א-ר-ר',
    root_hebrew: 'ארר',
    core_meaning: 'to curse',
    core_meaning_korean: '저주하다',
    semantic_field: 'cursing, condemnation',
    frequency: 63,
    importance: 3,
    mnemonic: '아-라르 → 아! 라! 르! 저주',
    story: '죄의 결과로 오는 저주. 그러나 그리스도께서 우리를 위해 저주를 받으셨습니다.',
    emoji: '⚠️',
  },

  // 듣기/순종 관련 어근
  {
    root: 'ש-מ-ע',
    root_hebrew: 'שמע',
    core_meaning: 'to hear, listen, obey',
    core_meaning_korean: '듣다, 순종하다',
    semantic_field: 'hearing, listening, obedience',
    frequency: 1165,
    importance: 5,
    mnemonic: '샤-마 → 샤! 마! 들어라',
    story: '듣는 것은 순종으로 이어집니다. "쉐마 이스라엘"(들으라 이스라엘)의 핵심 어근입니다.',
    emoji: '👂',
  },

  // 사랑/미움 관련 어근
  {
    root: 'א-ה-ב',
    root_hebrew: 'אהב',
    core_meaning: 'to love',
    core_meaning_korean: '사랑하다',
    semantic_field: 'love, affection, devotion',
    frequency: 217,
    importance: 5,
    mnemonic: '아-하브 → 아! 하! 브라보! 사랑',
    story: '하나님의 무조건적인 사랑(아가페). "하나님이 세상을 이처럼 사랑하사"의 근원입니다.',
    emoji: '❤️',
  },
  {
    root: 'ש-נ-א',
    root_hebrew: 'שנא',
    core_meaning: 'to hate',
    core_meaning_korean: '미워하다',
    semantic_field: 'hatred, aversion',
    frequency: 148,
    importance: 3,
    mnemonic: '사-나 → 사! 나쁜 것을 미워하다',
    story: '하나님은 죄를 미워하시되 죄인은 사랑하십니다.',
    emoji: '😡',
  },

  // 기억/잊기 관련 어근
  {
    root: 'ז-כ-ר',
    root_hebrew: 'זכר',
    core_meaning: 'to remember, recall',
    core_meaning_korean: '기억하다',
    semantic_field: 'remembrance, memory, commemoration',
    frequency: 235,
    importance: 4,
    mnemonic: '자-카르 → 자! 카드로 기억하다',
    story: '하나님은 언약을 기억하시고 신실하게 지키십니다. 우리도 하나님의 은혜를 기억해야 합니다.',
    emoji: '🧩',
  },
  {
    root: 'ש-כ-ח',
    root_hebrew: 'שכח',
    core_meaning: 'to forget',
    core_meaning_korean: '잊다',
    semantic_field: 'forgetting, neglecting',
    frequency: 102,
    importance: 3,
    mnemonic: '샤-카흐 → 샤! 카! 흐려져 잊다',
    story: '인간은 하나님의 은혜를 쉽게 잊지만, 하나님은 우리를 결코 잊지 않으십니다.',
    emoji: '😶‍🌫️',
  },

  // 땅/하늘 관련 어근
  {
    root: 'י-ש-ב',
    root_hebrew: 'ישב',
    core_meaning: 'to sit, dwell, inhabit',
    core_meaning_korean: '앉다, 거주하다',
    semantic_field: 'dwelling, sitting, residing',
    frequency: 1088,
    importance: 4,
    mnemonic: '야-샤브 → 야! 샤! 브라보! 앉다',
    story: '약속의 땅에 정착하여 거주하다. 하나님과 함께 거하는 안식입니다.',
    emoji: '🏠',
  },
  {
    root: 'ע-ל-ה',
    root_hebrew: 'עלה',
    core_meaning: 'to go up, ascend',
    core_meaning_korean: '올라가다',
    semantic_field: 'ascending, going up, offering',
    frequency: 894,
    importance: 4,
    mnemonic: '알-라 → 알! 라! 올라가다',
    story: '예루살렘에 올라가다, 번제를 올리다. 하나님께 나아가는 상승의 여정입니다.',
    emoji: '⬆️',
  },
  {
    root: 'י-ר-ד',
    root_hebrew: 'ירד',
    core_meaning: 'to go down, descend',
    core_meaning_korean: '내려가다',
    semantic_field: 'descending, going down',
    frequency: 382,
    importance: 3,
    mnemonic: '야-라드 → 야! 라! 드! 내려가다',
    story: '애굽으로 내려가다. 때로는 낮아짐과 겸손의 의미도 있습니다.',
    emoji: '⬇️',
  },

  // 먹기/마시기 관련 어근
  {
    root: 'א-כ-ל',
    root_hebrew: 'אכל',
    core_meaning: 'to eat, consume',
    core_meaning_korean: '먹다',
    semantic_field: 'eating, consuming, devouring',
    frequency: 820,
    importance: 4,
    mnemonic: '아-칼 → 아! 칼로 자르며 먹다',
    story: '선악과를 먹지 말라는 금지령. 먹는 것은 생명 유지뿐 아니라 영적 의미도 있습니다.',
    emoji: '🍎',
  },
  {
    root: 'ש-ת-ה',
    root_hebrew: 'שתה',
    core_meaning: 'to drink',
    core_meaning_korean: '마시다',
    semantic_field: 'drinking, consuming liquids',
    frequency: 217,
    importance: 3,
    mnemonic: '샤-타 → 샤! 타! 마시다',
    story: '생수를 마시다. 영적 갈증을 해소하는 하나님의 말씀입니다.',
    emoji: '🥤',
  },

  // 선/악 관련 어근
  {
    root: 'ט-ו-ב',
    root_hebrew: 'טוב',
    core_meaning: 'to be good, pleasant',
    core_meaning_korean: '좋다, 선하다',
    semantic_field: 'goodness, pleasantness, beauty',
    frequency: 559,
    importance: 5,
    mnemonic: '토브 → 토! 브라보! 좋다',
    story: '하나님이 창조하신 모든 것이 "심히 좋았더라". 하나님의 성품과 창조의 완전함입니다.',
    emoji: '😊',
  },
  {
    root: 'ר-ע-ע',
    root_hebrew: 'רעע',
    core_meaning: 'to be evil, bad',
    core_meaning_korean: '악하다, 나쁘다',
    semantic_field: 'evil, wickedness, harm',
    frequency: 444,
    importance: 4,
    mnemonic: '라-아 → 라! 아! 악하다',
    story: '선악과의 "악". 하나님의 뜻에 반하는 모든 것입니다.',
    emoji: '😈',
  },

  // 일하기/쉬기 관련 어근
  {
    root: 'ע-ב-ד',
    root_hebrew: 'עבד',
    core_meaning: 'to work, serve',
    core_meaning_korean: '일하다, 섬기다',
    semantic_field: 'working, serving, worshiping',
    frequency: 289,
    importance: 4,
    mnemonic: '아-바드 → 아! 바! 드! 섬기다',
    story: '동산을 다스리고 지키라는 명령. 일은 저주가 아닌 하나님을 섬기는 거룩한 행위입니다.',
    emoji: '⚒️',
  },
  {
    root: 'ש-ב-ת',
    root_hebrew: 'שבת',
    core_meaning: 'to rest, cease',
    core_meaning_korean: '쉬다, 그치다',
    semantic_field: 'resting, ceasing, sabbath',
    frequency: 71,
    importance: 5,
    mnemonic: '샤-바트 → 샤! 바! 트! 안식',
    story: '안식일의 어근. 하나님이 창조를 마치시고 쉬신 날. 우리도 하나님 안에서 안식합니다.',
    emoji: '😌',
  },

  // 찾기/구하기 관련 어근
  {
    root: 'ב-ק-ש',
    root_hebrew: 'בקש',
    core_meaning: 'to seek, search',
    core_meaning_korean: '찾다, 구하다',
    semantic_field: 'seeking, searching, requesting',
    frequency: 225,
    importance: 4,
    mnemonic: '바-카쉬 → 바! 카! 쉬! 찾다',
    story: '하나님을 찾고 구하는 자에게 만나주시는 은혜. "구하라 그리하면 얻을 것이요"',
    emoji: '🔍',
  },
  {
    root: 'מ-צ-א',
    root_hebrew: 'מצא',
    core_meaning: 'to find, discover',
    core_meaning_korean: '찾아내다, 발견하다',
    semantic_field: 'finding, discovering, obtaining',
    frequency: 457,
    importance: 4,
    mnemonic: '마-차 → 마! 차! 발견하다',
    story: '찾는 자가 찾아낸다. 하나님을 간절히 찾는 자는 반드시 만나게 됩니다.',
    emoji: '🎯',
  },

  // 두려움/믿음 관련 어근
  {
    root: 'י-ר-א',
    root_hebrew: 'ירא',
    core_meaning: 'to fear, revere',
    core_meaning_korean: '두려워하다, 경외하다',
    semantic_field: 'fear, reverence, awe',
    frequency: 335,
    importance: 5,
    mnemonic: '야-레 → 야! 레! 경외하다',
    story: '"여호와를 경외하는 것이 지혜의 근본". 단순한 공포가 아닌 거룩한 경외심입니다.',
    emoji: '😨',
  },
  {
    root: 'א-מ-ן',
    root_hebrew: 'אמן',
    core_meaning: 'to believe, trust, be firm',
    core_meaning_korean: '믿다, 신뢰하다',
    semantic_field: 'faith, trust, faithfulness',
    frequency: 108,
    importance: 5,
    mnemonic: '아-멘 → 아멘! 믿다',
    story: '"아브람이 여호와를 믿으니 여호와께서 이를 그의 의로 여기시고". 믿음으로 의롭다 함을 받습니다.',
    emoji: '🙌',
  },

  // 소유/취하기 관련 어근
  {
    root: 'ה-י-ה',
    root_hebrew: 'היה',
    core_meaning: 'to be, have',
    core_meaning_korean: '있다, 가지다',
    semantic_field: 'possession, having',
    frequency: 3576,
    importance: 5,
    mnemonic: '하-야 → 하! 야! 있다',
    story: '존재와 소유. 하나님 안에 모든 것이 있습니다.',
    emoji: '✅',
  },

  // 선택/거부 관련 어근
  {
    root: 'ב-ח-ר',
    root_hebrew: 'בחר',
    core_meaning: 'to choose, select',
    core_meaning_korean: '택하다, 선택하다',
    semantic_field: 'choosing, selecting, electing',
    frequency: 172,
    importance: 4,
    mnemonic: '바-하르 → 바! 하! 르! 택하다',
    story: '하나님이 아브라함을 택하시고 부르신 선택. 우리도 생명을 택해야 합니다.',
    emoji: '☑️',
  },
  {
    root: 'מ-א-ס',
    root_hebrew: 'מאס',
    core_meaning: 'to reject, refuse',
    core_meaning_korean: '거부하다, 버리다',
    semantic_field: 'rejection, refusal, despising',
    frequency: 76,
    importance: 3,
    mnemonic: '마-아스 → 마! 아! 스! 거부',
    story: '하나님의 말씀을 거부하는 것은 곧 하나님을 거부하는 것입니다.',
    emoji: '❌',
  },

  // 보호/지키기 관련 어근
  {
    root: 'ש-מ-ר',
    root_hebrew: 'שמר',
    core_meaning: 'to keep, guard, watch',
    core_meaning_korean: '지키다, 보호하다',
    semantic_field: 'keeping, guarding, observing',
    frequency: 468,
    importance: 5,
    mnemonic: '샤-마르 → 샤! 마! 르! 지키다',
    story: '"동산을 다스리며 지키게 하시고". 하나님의 말씀과 언약을 지키는 책임입니다.',
    emoji: '🛡️',
  },

  // 번성/증가 관련 어근
  {
    root: 'ר-ב-ה',
    root_hebrew: 'רבה',
    core_meaning: 'to multiply, increase',
    core_meaning_korean: '번성하다, 증가하다',
    semantic_field: 'multiplication, growth, abundance',
    frequency: 229,
    importance: 4,
    mnemonic: '라-바 → 라! 바! 번성하다',
    story: '"생육하고 번성하여 땅에 충만하라". 하나님의 축복의 명령입니다.',
    emoji: '📈',
  },
  {
    root: 'פ-ר-ה',
    root_hebrew: 'פרה',
    core_meaning: 'to be fruitful, bear fruit',
    core_meaning_korean: '열매 맺다',
    semantic_field: 'fruitfulness, productivity',
    frequency: 29,
    importance: 4,
    mnemonic: '파-라 → 파! 라! 열매',
    story: '"생육하고 번성하라"의 생육. 영적으로도 열매 맺는 삶을 살아야 합니다.',
    emoji: '🍇',
  },

  // 통치/다스리기 관련 어근
  {
    root: 'מ-ל-ך',
    root_hebrew: 'מלך',
    core_meaning: 'to reign, rule',
    core_meaning_korean: '통치하다, 다스리다',
    semantic_field: 'reigning, ruling, kingship',
    frequency: 350,
    importance: 5,
    mnemonic: '멜-레크 → 멜로디의 레! 크! 왕',
    story: '하나님은 영원한 왕이시며, 인간에게도 피조세계를 다스릴 권한을 주셨습니다.',
    emoji: '👑',
  },
  {
    root: 'ר-ד-ה',
    root_hebrew: 'רדה',
    core_meaning: 'to have dominion, rule',
    core_meaning_korean: '다스리다, 지배하다',
    semantic_field: 'dominion, ruling, subduing',
    frequency: 25,
    importance: 4,
    mnemonic: '라-다 → 라! 다! 다스리다',
    story: '"바다의 물고기와 하늘의 새와... 모든 생물을 다스리라". 청지기로서의 책임입니다.',
    emoji: '⚡',
  },
];

async function insertHebrewRoots() {
  console.log('🌱 히브리어 어근 데이터 삽입 시작...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const root of hebrewRoots) {
    try {
      const { data, error } = await supabase
        .from('hebrew_roots')
        .upsert(root, {
          onConflict: 'root',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ 실패: ${root.root} (${root.core_meaning_korean})`, error.message);
        errorCount++;
      } else {
        console.log(`✅ 성공: ${root.root} (${root.core_meaning_korean}) - ${root.emoji}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ 예외: ${root.root}`, err);
      errorCount++;
    }
  }

  console.log('\n📊 삽입 완료!');
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${errorCount}개`);
  console.log(`📦 전체: ${hebrewRoots.length}개`);
}

// 실행
insertHebrewRoots()
  .then(() => {
    console.log('\n✨ 모든 작업 완료!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 오류 발생:', err);
    process.exit(1);
  });
