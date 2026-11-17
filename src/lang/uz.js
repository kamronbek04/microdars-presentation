// Uzbek (Latin): the reference and only language of this deck. Every word on screen is here.
// oʻ and gʻ use ʻ (U+02BB); the tutuq belgisi is ʼ (U+02BC); subtraction uses − (U+2212).
// Source: the PowerPoint "1_sinf_matematika_mikrodars_taqdimot.pptx" (11 slides and their notes).
// m() keeps an expression on one line: m('3 + 1 = 4').
const m = (v) => `<span class="math">${v}</span>`;
const pill = (cls, v) => `<span class="pill ${cls}">${v}</span>`;
// A digit in its number's colour (1 coral, 2 yellow, 3 green, 4 sky, 5 purple), and an expression
// with every digit coloured: eq('3 + 1 = 4').
const dg = (d) => `<span class="d${d}">${d}</span>`;
const eq = (v) => m(String(v).replace(/[1-5]/g, dg));

export default {
  title: 'Mikrodars · 1 dan 5 gacha boʻlgan sonlar bilan amallar',
  ui: {
    next: 'Keyingi',
    theme: 'Daftar / doska (T)',
    lang: 'Til (L)',
  },
  credits: 'Jizzax, 2026',

  // The progress rail: one station per chapter.
  rail: {
    label: 'Taqdimot boʻlimlari',
    stations: ['Yondashuv', 'Maqsad', 'Dars ritmi', 'Oʻyinlar', 'Mustahkamlash', 'Baholash', 'Xulosa'],
  },

  // The words of each step, by the step's id in steps.js.
  steps: {
    open: {
      name: `${dg(1)} dan ${dg(5)} gacha boʻlgan sonlar bilan amallar bajarish`,
      sub: 'Raqamlar asosidagi didaktik oʻyinlar orqali arifmetik bilimlarni mustahkamlash',
      people: [
        ['Tayyorlovchilar', ['Ortiqova Shahlo', 'Nizomova Komila']],
        ['Tinglovchilar', ['Axmedova Xurshida Baxramovna', 'Esonova Mavjuda Hazrataliyevna']],
      ],
      sig: ['Mikrodars taqdimoti', '1-sinf', 'Matematika', 'Jizzax, 2026'],
    },
    idea: {
      title: 'Oʻyin = faol oʻrganish',
      body: '1-sinf oʻquvchisi sonni koʻrsa, harakat qilsa va izohlasa — bilim mustahkamroq qoladi.',
    },

    // 1 Yondashuv (slide 2)
    why: {
      title: 'Nega aynan oʻyinli yondashuv?',
      body: 'Oʻyin shunchaki qiziqish uchun emas: bola koʻradi va harakat qiladi.',
    },
    why2: {
      title: 'Bola gapiradi va tekshiradi',
      body: 'Bir vaqtning oʻzida matematik bilim, nutq va hamkorlik rivojlanadi.',
    },
    thinker: {
      title: 'Maqsad — bolani «javob aytuvchi» emas, «fikr yurituvchi» qilish',
      body: `${pill('p5', 'Diqqat + Mantiq + Muloqot')} ${pill('p3', 'Formativ baholash')}`,
    },

    // 2 Maqsad (slide 3)
    goal: {
      title: 'Mikrodars yakunida oʻquvchi nimalarni bajara oladi?',
    },
    goal2: {
      title: 'Maqsad: anglab hisoblash',
      body: 'Oʻquvchi natijani faqat topmaydi — uni raqam, predmet yoki gap bilan tushuntiradi.',
    },

    // 3 Dars ritmi (slide 4)
    rhythm: {
      title: 'Darsning ritmi',
      body: '45 daqiqalik dars — turli faoliyatlarning qisqa va mantiqiy ketma-ketligi.',
    },
    micro: {
      title: 'Mikrodars: 12 daqiqa',
      body: 'Faoliyat har 2–4 daqiqada almashadi → diqqat saqlanadi.',
    },

    // 4 Oʻyinlar (slide 4's plan, slides 5 to 8)
    order: {
      title: '«Raqamlarni tartibga keltir»',
      body: 'Mikrodarsning birinchi 2 daqiqasi: raqamlar 1 dan 5 gacha tartibga keltiriladi.',
    },
    g1: {
      title: 'Oʻyin 1 — «Yoʻqolgan son»',
      body: 'Maqsad: sonlar qatori, qoʻshni sonlar va tartib munosabatini tezkor takrorlash.',
    },
    g1why: {
      title: 'Oʻqituvchi: «Nega aynan shu son?»',
      body: 'Javob: «2 dan keyin 3 keladi, 4 dan oldin ham 3 turadi.»',
    },
    g1all: {
      title: 'Javob + izoh',
      body: 'Muhimi — javob bilan birga uning sababini aytish.',
    },
    g2: {
      title: 'Oʻyin 2 — «Raqamli zinapoya»',
      body: 'Qoʻshish — oldinga harakat, ayirish — orqaga harakat.',
    },
    g2up: {
      title: eq('3 + 1 = 4'),
      body: '«3 ga 1 qoʻshsak, 4-pogʻonaga chiqamiz.»',
    },
    g2down: {
      title: eq('5 − 2 = 3'),
      body: 'Ayirishda orqaga yuriladi. Bola nima qiladi?',
      rows: [
        ['target', 'Natijani topadi'],
        ['pointer', 'Pogʻonani koʻrsatadi'],
        ['mic', 'Tenglikni ovoz chiqarib oʻqiydi'],
      ],
    },
    g3: {
      title: 'Oʻyin 3 — «Sonni yasaymiz»',
      body: 'Son tarkibini predmet → raqam → ifoda ketma-ketligida anglash.',
    },
    g3a: {
      title: eq('5 = 2 + 3'),
      body: 'Predmetlar 2 va 3 ga ajraladi, soʻng raqam, keyin ifoda bilan yoziladi.',
    },
    g3b: {
      title: eq('5 = 1 + 4'),
      body: 'Maqsad: natijani yodlash emas, sonning qismlardan tuzilishini koʻrish.',
      note: 'Rangli choʻplar yoki kubiklardan foydalanish mumkin.',
    },
    g4: {
      title: 'Oʻyin 4 — «Matematik poyezd»',
      body: 'Savol: qaysi vagonlar lokomotivdagi 5 soniga mos keladi?',
    },
    g4match: {
      title: 'Faqat natijasi 5 boʻlgan vagonlar ulanadi',
      body: `Toʻgʻri javob: ${m('2 + 3')} va ${m('4 + 1')}. Bola natijani hisoblaydi va tanlaydi.`,
    },

    // 5 Mustahkamlash (slide 9)
    card: {
      title: 'Mustahkamlash — 3 daqiqalik mini-topshiriq',
      body: 'Bitta kartochka orqali ketma-ketlik, amal va son tarkibini tekshiramiz.',
    },
    cardDone: {
      title: 'Oʻqituvchi nimani kuzatadi?',
      body: 'Ketma-ketlik, qoʻshish, ayirish va son tarkibi. Natija → keyingi yordamni rejalash.',
      note: 'Kartadagi javoblar — namuna.',
    },
    cardHelp: {
      title: 'Qiynalsa — tayanch, kuchli boʻlsa — ochiq topshiriq',
      body: 'Qiynalgan oʻquvchi sanash choʻpi yoki nuqtali kartaga tayanadi; kuchli oʻquvchi 5 natijasini beradigan yana 2 ta misol tuzadi.',
      note: 'Misollar — namuna.',
    },

    // 6 Baholash (slide 10)
    svetofor: {
      title: 'Baholash — «Svetofor» refleksiyasi',
      body: 'Baholash jazolash emas — keyingi yordamni aniqlash vositasi.',
    },
    criteria: {
      title: 'Toʻrt mezon',
      body: 'Oʻquvchi oʻz holatini rang bilan koʻrsatadi, oʻqituvchi esa toʻrt mezonni kuzatadi. Natija keyingi dars rejasiga xizmat qiladi.',
    },

    // 7 Xulosa (slide 11)
    advice: {
      title: 'Xulosa va metodik tavsiyalar',
      body: 'Oʻyin oʻzi maqsad emas — matematik bilimni anglab mustahkamlash vositasi.',
    },
    quote: {
      title: '«Oʻyin orqali bola faqat hisoblamaydi — u koʻradi, tanlaydi, izohlaydi va oʻzini tekshiradi.»',
      body: 'Hisoblashdan tashqari muloqot va oʻzini baholash ham rivojlanadi.',
    },
    close: {
      name: 'Rahmat!',
      sub: '1 dan 5 gacha boʻlgan sonlar bilan amallar bajarish',
      people: [
        ['Tayyorlovchilar', ['Ortiqova Shahlo', 'Nizomova Komila']],
        ['Tinglovchilar', ['Axmedova Xurshida Baxramovna', 'Esonova Mavjuda Hazrataliyevna']],
      ],
      sig: ['Mikrodars taqdimoti', '1-sinf', 'Matematika', 'Jizzax, 2026'],
    },
  },

  // The words of the animated panels, by the data key a step gives its visual.
  viz: {
    balls: {},
    why: {
      nodes: [
        { icon: 'eye', title: 'Koʻradi', text: 'Raqam, nuqta, predmet' },
        { icon: 'hand', title: 'Harakat qiladi', text: 'Kartani joylaydi, pogʻonaga chiqadi' },
        { icon: 'messageCircle', title: 'Gapiradi', text: `${m('«3 + 1 = 4»')} deb izohlaydi` },
        { icon: 'checkCheck', title: 'Tekshiradi', text: 'Sherigi bilan javobni solishtiradi' },
      ],
    },
    goals: {
      items: [
        { title: 'Ketma-ketlik', figure: `${m('1→2→3→4→5')} va teskari` },
        { title: 'Son tarkibi', figure: `${m('4 = 1 + 3')}, ${m('5 = 2 + 3')} kabi` },
        { title: 'Qoʻshish / ayirish', figure: '1–5 doirasida sodda amallar' },
        { title: 'Izohlash', figure: '«Qanday bilding?» savoliga javob' },
      ],
    },
    lesson: {
      rows: [
        {
          label: 'Dars', total: '45 daqiqa',
          parts: [[3, 'Tashkiliy'], [7, 'Faollashtirish'], [20, 'Oʻyinli faoliyat'], [10, 'Mustahkamlash'], [5, 'Yakun']],
        },
        {
          label: 'Mikrodars', total: '12 daqiqa',
          parts: [[2, 'Raqamlarni tartibga keltir'], [3, 'Yoʻqolgan son'], [4, 'Raqamli zinapoya'], [2, '5 ni ikki qismga ajrat'], [1, 'Svetofor refleksiyasi']],
        },
      ],
      unit: 'daq.',
    },
    order: {
      // the cards as they lie before the pupil sorts them
      start: [3, 1, 5, 2, 4],
    },
    missing: {
      title: 'Qaysi son yoʻqolgan?',
      // each row: the numbers in order, and which one is hidden (counted from 0)
      rows: [
        { seq: [1, 2, 3, 4, 5], gap: 2 },
        { seq: [1, 2, 3, 4, 5], gap: 1 },
        { seq: [5, 4, 3, 2, 1], gap: 2 },
      ],
    },
    stairs: {
      up: '3 + 1 → 4',
      down: '5 − 2 → 3',
    },
    compose: {
      title: '5 sonining tarkibi',
      rows: ['Predmet', 'Raqam', 'Ifoda'],
    },
    train: {
      loco: 'Lokomotiv',
      wagons: ['2 + 3', '4 + 1', '5 − 1', '3 + 1', '5 − 2'],
      results: [5, 5, 4, 4, 3],
    },
    worksheet: {
      title: 'Oʻquvchi kartasi',
      tasks: ['Boʻsh joyni toʻldir:', 'Misollarni yech:', '5 sonini ikki qismga ajrat:'],
      star: 'Kuchli oʻquvchi: 5 natijasini beradigan yana 2 ta misol tuz.',
      watch: 'Oʻqituvchi kuzatadi',
      skills: ['Ketma-ketlik', 'Qoʻshish', 'Ayirish', 'Son tarkibi'],
      next: 'Natija → keyingi yordamni rejalash',
    },
    traffic: {
      title: 'Oʻzingni bahola',
      lamps: [
        ['ok', 'Men mustaqil bajara olaman'],
        ['warn', 'Menga yana mashq kerak'],
        ['bad', 'Menga yordam kerak'],
      ],
    },
    criteria: {
      title: 'Oʻqituvchi kuzatadi',
      sub: '4 mezon',
      items: [
        '<b>Sonlar qatori</b> — 1–5 ni xatosiz tartiblaydi',
        '<b>Qoʻshish-ayirish</b> — misolni yechadi va izohlaydi',
        '<b>Son tarkibi</b> — 4 va 5 ni ikki qismga ajratadi',
        '<b>Hamkorlik</b> — sherigini tinglaydi, qoidaga rioya qiladi',
      ],
      result: 'Tezkor → tushunarli → bolaga mos',
    },
    advice: {
      items: [
        { title: 'Bitta oʻyin — bitta aniq maqsad', text: 'Qoidani 2–3 sodda gap bilan tushuntiring.' },
        { title: 'Predmetdan ifodaga oʻting', text: 'Koʻrsatish → raqam → matematik yozuv.' },
        { title: 'Javobni izohlating', text: '«Qanday bilding?» savoli matematik nutqni rivojlantiradi.' },
      ],
    },
  },
};
