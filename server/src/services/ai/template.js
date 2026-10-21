const OPENERS = {
  en: {
    5: ['Had a great experience.', 'I really enjoyed my visit.'],
    4: ['Good experience overall.', 'I had a good visit overall.'],
    3: ['It was an okay visit.', 'My visit was average.'],
    2: ['I was a bit disappointed with my visit.', 'My visit did not go as I hoped.'],
    1: ['I was disappointed with my visit.', 'I had a poor experience.'],
  },
  hi: {
    5: ['बहुत अच्छा अनुभव रहा।', 'मुझे यहाँ आकर अच्छा लगा।'],
    4: ['कुल मिलाकर अच्छा अनुभव रहा।', 'मेरी विज़िट अच्छी रही।'],
    3: ['यह एक ठीक-ठाक विज़िट थी।', 'अनुभव औसत रहा।'],
    2: ['विज़िट से थोड़ी निराशा हुई।', 'उम्मीद के अनुसार अनुभव नहीं रहा।'],
    1: ['मेरी विज़िट से मुझे निराशा हुई।', 'अनुभव अच्छा नहीं रहा।'],
  },
  mr: {
    5: ['खूप छान अनुभव आला.', 'इथे येऊन छान वाटले.'],
    4: ['एकंदरीत चांगला अनुभव आला.', 'माझी भेट चांगली झाली.'],
    3: ['भेट ठीकठाक होती.', 'अनुभव सरासरी होता.'],
    2: ['भेटीमुळे थोडी निराशा झाली.', 'अपेक्षेप्रमाणे अनुभव आला नाही.'],
    1: ['भेटीमुळे निराशा झाली.', 'अनुभव चांगला नव्हता.'],
  },
  hinglish: {
    5: ['Bahut accha experience raha.', 'Yahan aake accha laga.'],
    4: ['Overall accha experience raha.', 'Visit achhi rahi.'],
    3: ['Visit theek-thaak thi.', 'Experience average raha.'],
    2: ['Visit se thodi nirasha hui.', 'Expectation ke hisaab se experience nahi raha.'],
    1: ['Visit se nirasha hui.', 'Experience accha nahi raha.'],
  },
};

const TOPIC_NAMES = {
  en: { food: 'food', service: 'service', staff: 'staff', cleanliness: 'cleanliness', ambience: 'ambience' },
  hi: { food: 'खाना', service: 'सर्विस', staff: 'स्टाफ', cleanliness: 'साफ़-सफ़ाई', ambience: 'माहौल' },
  mr: { food: 'जेवण', service: 'सेवा', staff: 'कर्मचारी', cleanliness: 'स्वच्छता', ambience: 'वातावरण' },
  hinglish: { food: 'khana', service: 'service', staff: 'staff', cleanliness: 'safai', ambience: 'mahaul' },
};

const JOINER = { en: 'and', hi: 'और', mr: 'आणि', hinglish: 'aur' };
const STOP = { en: '.', hi: '।', mr: '.', hinglish: '.' };

// Topic-only lines: no facts beyond the topics and the rating's tone
const TOPIC_LINES = {
  en: {
    positive: 'I was happy with the {t}.',
    mixed: 'My feelings about the {t} were mixed.',
    negative: 'I was not happy with the {t}.',
  },
  hi: {
    positive: '{t} से संतुष्टि मिली।',
    mixed: '{t} को लेकर मिला-जुला अनुभव रहा।',
    negative: '{t} से संतुष्टि नहीं मिली।',
  },
  mr: {
    positive: '{t} बद्दल समाधान वाटले.',
    mixed: '{t} बद्दल संमिश्र अनुभव आला.',
    negative: '{t} बद्दल समाधान वाटले नाही.',
  },
  hinglish: {
    positive: '{t} se santushti mili.',
    mixed: '{t} ko lekar mila-jula experience raha.',
    negative: '{t} se santushti nahi mili.',
  },
};

const toneOf = (rating) => (rating >= 4 ? 'positive' : rating === 3 ? 'mixed' : 'negative');

function joinTopics(names, and) {
  if (names.length <= 1) return names[0] || '';
  return `${names.slice(0, -1).join(', ')} ${and} ${names[names.length - 1]}`;
}

// Split the guest's text into their own phrases, keeping order and meaning
function toClauses(feedback) {
  return (feedback || '')
    .split(/[,;.!?\n।]+/u)
    .map((c) => c.trim().replace(/^(and|aur|और|आणि)\s+/iu, ''))
    .filter((c) => /[\p{L}\p{N}]/u.test(c))
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1));
}

export function generateTemplate({ rating, language = 'en', topics = [], feedback = '', attempt = 1 }) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('template: rating must be an integer from 1 to 5');
  }
  const lang = OPENERS[language] ? language : 'en';
  const openers = OPENERS[lang][rating];
  const opener = openers[(Math.max(1, attempt) - 1) % openers.length];

  const clauses = toClauses(feedback);
  if (clauses.length > 0) {
    return [opener, ...clauses.map((c) => c + STOP[lang])].join(' ');
  }

  const names = (topics || []).map((t) => TOPIC_NAMES[lang][t]).filter(Boolean);
  if (names.length === 0) return opener;
  const line = TOPIC_LINES[lang][toneOf(rating)].replace('{t}', joinTopics(names, JOINER[lang]));
  return `${opener} ${line}`;
}