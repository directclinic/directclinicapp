export type LanguageCode =
  | 'en'
  | 'es'
  | 'zh'
  | 'ru'
  | 'bn'
  | 'it'
  | 'tl'

export interface LanguageOption {
  code: LanguageCode
  label: string // native name
  englishLabel: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', englishLabel: 'English' },
  { code: 'es', label: 'Español', englishLabel: 'Spanish' },
  { code: 'zh', label: '廣東話', englishLabel: 'Cantonese' },
  { code: 'ru', label: 'Русский', englishLabel: 'Russian' },
  { code: 'bn', label: 'বাংলা', englishLabel: 'Bengali' },
  { code: 'it', label: 'Italiano', englishLabel: 'Italian' },
  { code: 'tl', label: 'Tagalog', englishLabel: 'Tagalog' },
]

export interface Strings {
  back: string
  language: string
  textSize: string
  decreaseText: string
  increaseText: string
  searchPlaceholder: string
  activeFilters: string
  insuranceFilter: string
  locationFilter: string
  doctorsFoundPrefix: string // "In-Network Doctors Found in NYC"
  verified: string
  copay: string
  deductible: string
  deductibleMet: string
  priceDisclaimer: string
  languagesSpoken: string
  bookAppointment: string
  mapDirections: string
  acceptingNew: string
  reviews: string
  allBoroughs: string
}

export const TRANSLATIONS: Record<LanguageCode, Strings> = {
  en: {
    back: 'Back',
    language: 'Language',
    textSize: 'Text size',
    decreaseText: 'Decrease text size',
    increaseText: 'Increase text size',
    searchPlaceholder: 'Search a particular area',
    activeFilters: 'Your active filters',
    insuranceFilter: 'Insurance: Blue Cross Blue Shield Medicare Advantage',
    locationFilter: 'Location: New York, NY',
    doctorsFoundPrefix: 'In-Network Doctors Found in NYC',
    verified: '100% Verified In-Network',
    copay: 'Your Co-pay',
    deductible: 'Deductible',
    deductibleMet: 'Met',
    priceDisclaimer:
      'Prices verified with insurance as of today. No hidden fees.',
    languagesSpoken: 'Languages spoken',
    bookAppointment: 'Book appointment',
    mapDirections: 'Map Directions',
    acceptingNew: 'Accepting new patients',
    reviews: 'reviews',
    allBoroughs: 'All Boroughs',
  },
  es: {
    back: 'Atrás',
    language: 'Idioma',
    textSize: 'Tamaño del texto',
    decreaseText: 'Reducir el tamaño del texto',
    increaseText: 'Aumentar el tamaño del texto',
    searchPlaceholder: 'Buscar una zona específica',
    activeFilters: 'Sus filtros activos',
    insuranceFilter: 'Seguro: Blue Cross Blue Shield Medicare Advantage',
    locationFilter: 'Ubicación: Nueva York, NY',
    doctorsFoundPrefix: 'Médicos en la red encontrados en NYC',
    verified: '100% Verificado en la red',
    copay: 'Su copago',
    deductible: 'Deducible',
    deductibleMet: 'Cumplido',
    priceDisclaimer:
      'Precios verificados con el seguro hoy. Sin cargos ocultos.',
    languagesSpoken: 'Idiomas que se hablan',
    bookAppointment: 'Reservar cita',
    mapDirections: 'Cómo llegar',
    acceptingNew: 'Acepta nuevos pacientes',
    reviews: 'reseñas',
    allBoroughs: 'Todos los distritos',
  },
  zh: {
    back: '返回',
    language: '語言',
    textSize: '文字大小',
    decreaseText: '縮小文字',
    increaseText: '放大文字',
    searchPlaceholder: '搜尋特定區域',
    activeFilters: '您的篩選條件',
    insuranceFilter: '保險：Blue Cross Blue Shield Medicare Advantage',
    locationFilter: '地點：紐約，NY',
    doctorsFoundPrefix: '在紐約找到的網絡內醫生',
    verified: '100% 已核實網絡內',
    copay: '您的自付額',
    deductible: '自付額度',
    deductibleMet: '已達到',
    priceDisclaimer: '價格已於今日經保險核實。沒有隱藏費用。',
    languagesSpoken: '會說的語言',
    bookAppointment: '預約',
    mapDirections: '地圖路線',
    acceptingNew: '接受新病人',
    reviews: '則評價',
    allBoroughs: '所有區',
  },
  ru: {
    back: 'Назад',
    language: 'Язык',
    textSize: 'Размер текста',
    decreaseText: 'Уменьшить текст',
    increaseText: 'Увеличить текст',
    searchPlaceholder: 'Искать определённый район',
    activeFilters: 'Ваши активные фильтры',
    insuranceFilter: 'Страховка: Blue Cross Blue Shield Medicare Advantage',
    locationFilter: 'Местоположение: Нью-Йорк, NY',
    doctorsFoundPrefix: 'Врачей в сети найдено в Нью-Йорке',
    verified: '100% Проверено в сети',
    copay: 'Ваша доплата',
    deductible: 'Франшиза',
    deductibleMet: 'Выполнена',
    priceDisclaimer:
      'Цены подтверждены страховкой на сегодня. Без скрытых платежей.',
    languagesSpoken: 'Языки общения',
    bookAppointment: 'Записаться на приём',
    mapDirections: 'Маршрут на карте',
    acceptingNew: 'Принимает новых пациентов',
    reviews: 'отзывов',
    allBoroughs: 'Все районы',
  },
  bn: {
    back: 'ফিরে যান',
    language: 'ভাষা',
    textSize: 'লেখার আকার',
    decreaseText: 'লেখা ছোট করুন',
    increaseText: 'লেখা বড় করুন',
    searchPlaceholder: 'একটি নির্দিষ্ট এলাকা খুঁজুন',
    activeFilters: 'আপনার সক্রিয় ফিল্টার',
    insuranceFilter: 'বীমা: Blue Cross Blue Shield Medicare Advantage',
    locationFilter: 'অবস্থান: নিউ ইয়র্ক, NY',
    doctorsFoundPrefix: 'NYC-তে নেটওয়ার্কভুক্ত ডাক্তার পাওয়া গেছে',
    verified: '১০০% যাচাইকৃত নেটওয়ার্কভুক্ত',
    copay: 'আপনার কো-পে',
    deductible: 'ডিডাক্টিবল',
    deductibleMet: 'পূরণ হয়েছে',
    priceDisclaimer: 'আজকের তারিখে বীমা দিয়ে দাম যাচাই করা হয়েছে। কোনো লুকানো খরচ নেই।',
    languagesSpoken: 'কথ্য ভাষা',
    bookAppointment: 'অ্যাপয়েন্টমেন্ট নিন',
    mapDirections: 'মানচিত্রে পথ',
    acceptingNew: 'নতুন রোগী নিচ্ছেন',
    reviews: 'পর্যালোচনা',
    allBoroughs: 'সব বরো',
  },
  it: {
    back: 'Indietro',
    language: 'Lingua',
    textSize: 'Dimensione del testo',
    decreaseText: 'Riduci il testo',
    increaseText: 'Ingrandisci il testo',
    searchPlaceholder: 'Cerca una zona specifica',
    activeFilters: 'I tuoi filtri attivi',
    insuranceFilter: 'Assicurazione: Blue Cross Blue Shield Medicare Advantage',
    locationFilter: 'Località: New York, NY',
    doctorsFoundPrefix: 'Medici in rete trovati a NYC',
    verified: '100% Verificato in rete',
    copay: 'Il tuo ticket',
    deductible: 'Franchigia',
    deductibleMet: 'Raggiunta',
    priceDisclaimer:
      'Prezzi verificati con l’assicurazione oggi. Nessun costo nascosto.',
    languagesSpoken: 'Lingue parlate',
    bookAppointment: 'Prenota appuntamento',
    mapDirections: 'Indicazioni sulla mappa',
    acceptingNew: 'Accetta nuovi pazienti',
    reviews: 'recensioni',
    allBoroughs: 'Tutti i distretti',
  },
  tl: {
    back: 'Bumalik',
    language: 'Wika',
    textSize: 'Laki ng teksto',
    decreaseText: 'Paliitin ang teksto',
    increaseText: 'Palakihin ang teksto',
    searchPlaceholder: 'Maghanap ng partikular na lugar',
    activeFilters: 'Ang iyong mga aktibong filter',
    insuranceFilter: 'Insurance: Blue Cross Blue Shield Medicare Advantage',
    locationFilter: 'Lokasyon: New York, NY',
    doctorsFoundPrefix: 'Mga In-Network na Doktor na Natagpuan sa NYC',
    verified: '100% Na-verify na In-Network',
    copay: 'Iyong Co-pay',
    deductible: 'Deductible',
    deductibleMet: 'Natugunan',
    priceDisclaimer:
      'Ang mga presyo ay na-verify sa insurance ngayon. Walang nakatagong bayarin.',
    languagesSpoken: 'Mga wikang sinasalita',
    bookAppointment: 'Mag-book ng appointment',
    mapDirections: 'Direksyon sa Mapa',
    acceptingNew: 'Tumatanggap ng bagong pasyente',
    reviews: 'mga review',
    allBoroughs: 'Lahat ng Borough',
  },
}
