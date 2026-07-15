import type { CareId } from '@/lib/intake'

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
  addressPlaceholder: string
  useMyLocation: string
  searchingLocation: string
  locationNotFound: string
  nearYouPrefix: string
  milesAway: string
  clearLocation: string
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
  intake: IntakeStrings
  booking: BookingStrings
}

export interface BookingStrings {
  scheduleWith: string
  selectDate: string
  selectTime: string
  morning: string
  afternoon: string
  slotTaken: string
  monthLabel: string
  weekdays: [string, string, string, string, string, string, string]
  addressLabel: string
  contactHeading: string
  phoneLabel: string
  insuranceHeading: string
  confirmPrefix: string
  cancelBooking: string
  confirmedTitle: string
  confirmedLead: string
  whenLabel: string
  done: string
  yourDetails: string
  yourNameLabel: string
  yourNamePlaceholder: string
  yourPhoneLabel: string
  reasonLabel: string
  reasonPlaceholder: string
  saving: string
}

export interface IntakeStrings {
  welcomeTitle: string
  welcomeSubtitle: string
  step1Label: string
  step1Help: string
  selectCarrier: string
  planLabel: string
  selectPlan: string
  step2Label: string
  step2Help: string
  care: Record<CareId, string>
  careDescriptions: Record<CareId, string>
  findButton: string
  privacyBadge: string
  selectedSummary: string
  stepFormat: string // e.g. "Step {step} of {total}"
  continueButton: string
  usingInsurance: string
  changeInsurance: string
}

export const TRANSLATIONS: Record<LanguageCode, Strings> = {
  en: {
    back: 'Back',
    language: 'Language',
    textSize: 'Text size',
    decreaseText: 'Decrease text size',
    increaseText: 'Increase text size',
      searchPlaceholder: 'Search a particular area',
      addressPlaceholder: 'Enter your address to find clinics nearby',
      useMyLocation: 'Use my location',
      searchingLocation: 'Finding your address…',
      locationNotFound: 'We could not find that address. Try adding a borough or ZIP.',
      nearYouPrefix: 'Near',
      milesAway: 'mi away',
      clearLocation: 'Clear',
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
    intake: {
      welcomeTitle: 'Find a Doctor Near You',
      welcomeSubtitle:
        'Answer a few quick questions and we\u2019ll show you in-network clinics with clear, upfront prices.',
      step1Label: '1. Select Your Insurance Provider',
      step1Help: 'Choose the company shown on your insurance card.',
      selectCarrier: 'Choose your insurance provider',
      planLabel: 'Select Your Plan Type',
      selectPlan: 'Choose your plan type',
      step2Label: '2. What type of care do you need today?',
      step2Help: 'Tap the option that best matches your visit.',
      care: {
        pcp: 'General Checkup / PCP',
        dental: 'Dental Care',
        eye: 'Eye Exam',
        physical: 'Physical Therapy',
        geriatric: 'Senior Geriatric Care',
      },
      careDescriptions: {
        pcp: 'A routine visit with a primary care doctor for check-ups, common illnesses, prescriptions, and referrals.',
        dental:
          'Cleanings, cavities, fillings, and tooth pain — general dentist care to keep your teeth and gums healthy.',
        eye: 'A vision test and eye-health exam, including prescriptions for glasses or contact lenses.',
        physical:
          'Guided exercises and treatment to recover from injury, surgery, or pain and restore movement and strength.',
        geriatric:
          'Specialized care for older adults, covering chronic conditions, mobility, memory, and managing multiple medications.',
      },
      findButton: 'Find In-Network Clinics & See Prices',
      privacyBadge:
        'Privacy Guaranteed: We do not ask for or save personal medical conditions. Your search is safe and anonymous.',
      selectedSummary: 'Your selections',
      stepFormat: 'Step {step} of {total}',
      continueButton: 'Continue',
      usingInsurance: 'Using your insurance:',
      changeInsurance: 'Change insurance',
    },
    booking: {
      scheduleWith: 'Schedule with',
      selectDate: 'Select a Date',
      selectTime: 'Select a Time',
      morning: 'Morning',
      afternoon: 'Afternoon',
      slotTaken: 'Booked',
      monthLabel: 'April 2026',
      weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      addressLabel: 'Clinic address',
      contactHeading: 'Clinic Contact',
      phoneLabel: 'Phone',
      insuranceHeading: 'Insurance Accepted Here',
      confirmPrefix: 'Confirm Appointment with',
      cancelBooking: 'Cancel',
      confirmedTitle: 'Appointment Confirmed!',
      confirmedLead: 'You\u2019re all set with',
      whenLabel: 'When',
      done: 'Done',
      yourDetails: 'Your details',
      yourNameLabel: 'Your full name',
      yourNamePlaceholder: 'Jane Doe',
      yourPhoneLabel: 'Phone number',
      reasonLabel: 'Reason for visit (optional)',
      reasonPlaceholder: 'Briefly describe why you need care',
      saving: 'Booking…',
    },
  },
  es: {
    back: 'Atrás',
    language: 'Idioma',
    textSize: 'Tamaño del texto',
    decreaseText: 'Reducir el tamaño del texto',
    increaseText: 'Aumentar el tamaño del texto',
      searchPlaceholder: 'Buscar una zona específica',
      addressPlaceholder: 'Ingrese su dirección para encontrar clínicas cercanas',
      useMyLocation: 'Usar mi ubicación',
      searchingLocation: 'Buscando su dirección…',
      locationNotFound: 'No encontramos esa dirección. Intente agregar un distrito o código postal.',
      nearYouPrefix: 'Cerca de',
      milesAway: 'mi de distancia',
      clearLocation: 'Borrar',
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
    intake: {
      welcomeTitle: 'Encuentre un médico cerca de usted',
      welcomeSubtitle:
        'Responda unas preguntas rápidas y le mostraremos clínicas en su red con precios claros y por adelantado.',
      step1Label: '1. Seleccione su proveedor de seguro',
      step1Help: 'Elija la compañía que aparece en su tarjeta de seguro.',
      selectCarrier: 'Elija su proveedor de seguro',
      planLabel: 'Seleccione su tipo de plan',
      selectPlan: 'Elija su tipo de plan',
      step2Label: '2. ¿Qué tipo de atención necesita hoy?',
      step2Help: 'Toque la opción que mejor describa su visita.',
      care: {
        pcp: 'Chequeo general / Médico de cabecera',
        dental: 'Atención dental',
        eye: 'Examen de la vista',
        physical: 'Fisioterapia',
        geriatric: 'Atención geriátrica para adultos mayores',
      },
      careDescriptions: {
        pcp: 'Una visita de rutina con un médico de cabecera para chequeos, enfermedades comunes, recetas y remisiones.',
        dental:
          'Limpiezas, caries, empastes y dolor de muelas: atención dental general para mantener sanos sus dientes y encías.',
        eye: 'Un examen de la vista y de la salud ocular, incluidas recetas para lentes o lentes de contacto.',
        physical:
          'Ejercicios guiados y tratamiento para recuperarse de lesiones, cirugías o dolor y restaurar el movimiento y la fuerza.',
        geriatric:
          'Atención especializada para adultos mayores: enfermedades crónicas, movilidad, memoria y manejo de varios medicamentos.',
      },
      findButton: 'Buscar clínicas en la red y ver precios',
      privacyBadge:
        'Privacidad garantizada: No preguntamos ni guardamos condiciones médicas personales. Su búsqueda es segura y anónima.',
      selectedSummary: 'Sus selecciones',
      stepFormat: 'Paso {step} de {total}',
      continueButton: 'Continuar',
      usingInsurance: 'Usando su seguro:',
      changeInsurance: 'Cambiar seguro',
    },
    booking: {
      scheduleWith: 'Programar con',
      selectDate: 'Seleccione una fecha',
      selectTime: 'Seleccione una hora',
      morning: 'Mañana',
      afternoon: 'Tarde',
      slotTaken: 'Reservado',
      monthLabel: 'Abril 2026',
      weekdays: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
      addressLabel: 'Dirección de la clínica',
      contactHeading: 'Contacto de la clínica',
      phoneLabel: 'Teléfono',
      insuranceHeading: 'Seguros aceptados aquí',
      confirmPrefix: 'Confirmar cita con',
      cancelBooking: 'Cancelar',
      confirmedTitle: '¡Cita confirmada!',
      confirmedLead: 'Todo listo con',
      whenLabel: 'Cuándo',
      done: 'Listo',
      yourDetails: 'Sus datos',
      yourNameLabel: 'Su nombre completo',
      yourNamePlaceholder: 'Juana Pérez',
      yourPhoneLabel: 'Número de teléfono',
      reasonLabel: 'Motivo de la visita (opcional)',
      reasonPlaceholder: 'Describa brevemente por qué necesita atención',
      saving: 'Reservando…',
    },
  },
  zh: {
    back: '返回',
    language: '語言',
    textSize: '文字大小',
    decreaseText: '縮小文字',
    increaseText: '放大文字',
      searchPlaceholder: '搜尋特定區域',
      addressPlaceholder: '輸入你嘅地址搵附近嘅診所',
      useMyLocation: '用我嘅位置',
      searchingLocation: '搵緊你嘅地址…',
      locationNotFound: '搵唔到呢個地址，試吓加上區份或郵政編碼。',
      nearYouPrefix: '鄰近',
      milesAway: '英里',
      clearLocation: '清除',
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
    intake: {
      welcomeTitle: '尋找附近的醫生',
      welcomeSubtitle:
        '回答幾條簡單問題，我哋就會為你顯示網絡內診所同清晰嘅價格。',
      step1Label: '1. 選擇你嘅保險公司',
      step1Help: '請選擇你保險卡上顯示嘅公司。',
      selectCarrier: '選擇你嘅保險公司',
      planLabel: '選擇你嘅計劃類型',
      selectPlan: '選擇你嘅計劃類型',
      step2Label: '2. 你今日需要邊種護理？',
      step2Help: '揀選最符合你就診情況嘅選項。',
      care: {
        pcp: '一般檢查 / 家庭醫生',
        dental: '牙科護理',
        eye: '眼睛檢查',
        physical: '物理治療',
        geriatric: '長者老年護理',
      },
      careDescriptions: {
        pcp: '同家庭醫生嘅一般就診，包括健康檢查、常見疾病、處方同轉介。',
        dental: '洗牙、蛀牙、補牙同牙痛——一般牙科護理，令你嘅牙齒同牙肉保持健康。',
        eye: '視力測試同眼睛健康檢查，包括眼鏡或隱形眼鏡嘅處方。',
        physical:
          '有指導嘅運動同治療，幫你由受傷、手術或痛症中恢復，重建活動能力同力量。',
        geriatric:
          '為長者提供嘅專科護理，涵蓋慢性疾病、行動能力、記憶同管理多種藥物。',
      },
      findButton: '尋找網絡內診所並查看價格',
      privacyBadge:
        '私隱保證：我哋唔會詢問或儲存你嘅個人醫療狀況。你嘅搜尋安全又匿名。',
      selectedSummary: '你嘅選擇',
      stepFormat: '第 {step} 步，共 {total} 步',
      continueButton: '繼續',
      usingInsurance: '使用你嘅保險：',
      changeInsurance: '更改保險',
    },
    booking: {
      scheduleWith: '預約',
      selectDate: '選擇日期',
      selectTime: '選擇時間',
      morning: '上午',
      afternoon: '下午',
      slotTaken: '已預約',
      monthLabel: '2026年4月',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      addressLabel: '診所地址',
      contactHeading: '診所聯絡',
      phoneLabel: '電話',
      insuranceHeading: '此診所接受嘅保險',
      confirmPrefix: '確認預約：',
      cancelBooking: '取消',
      confirmedTitle: '預約已確認！',
      confirmedLead: '已為你預約',
      whenLabel: '時間',
      done: '完成',
      yourDetails: '你嘅資料',
      yourNameLabel: '你嘅全名',
      yourNamePlaceholder: '陳大文',
      yourPhoneLabel: '電話號碼',
      reasonLabel: '就診原因（可選）',
      reasonPlaceholder: '簡單講吓你需要咩護理',
      saving: '預約緊…',
    },
  },
  ru: {
    back: 'Назад',
    language: 'Язык',
    textSize: 'Размер текста',
    decreaseText: 'Уменьшить текст',
    increaseText: 'Увеличить текст',
      searchPlaceholder: 'Искать определённый район',
      addressPlaceholder: 'Введите адрес, чтобы найти клиники рядом',
      useMyLocation: 'Моё местоположение',
      searchingLocation: 'Ищем ваш адрес…',
      locationNotFound: 'Не удалось найти этот адрес. Добавьте район или почтовый индекс.',
      nearYouPrefix: 'Рядом с',
      milesAway: 'миль',
      clearLocation: 'Очистить',
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
    intake: {
      welcomeTitle: 'Найдите врача рядом с вами',
      welcomeSubtitle:
        'Ответьте на несколько быстрых вопросов, и мы покажем вам клиники в сети с понятными ценами.',
      step1Label: '1. Выберите вашу страховую компанию',
      step1Help: 'Выберите компанию, указанную на вашей страховой карте.',
      selectCarrier: 'Выберите страховую компанию',
      planLabel: 'Выберите тип вашего плана',
      selectPlan: 'Выберите тип плана',
      step2Label: '2. Какая помощь вам нужна сегодня?',
      step2Help: 'Нажмите вариант, который лучше всего подходит для вашего визита.',
      care: {
        pcp: 'Общий осмотр / Терапевт',
        dental: 'Стоматология',
        eye: 'Проверка зрения',
        physical: 'Физиотерапия',
        geriatric: 'Гериатрическая помощь пожилым',
      },
      careDescriptions: {
        pcp: 'Плановый приём у терапевта: осмотры, распространённые заболевания, рецепты и направления.',
        dental:
          'Чистка, кариес, пломбы и зубная боль — общая стоматологическая помощь для здоровья зубов и дёсен.',
        eye: 'Проверка зрения и осмотр здоровья глаз, включая рецепты на очки или контактные линзы.',
        physical:
          'Упражнения под контролем и лечение для восстановления после травм, операций или боли и возвращения подвижности и силы.',
        geriatric:
          'Специализированная помощь пожилым: хронические заболевания, подвижность, память и приём нескольких лекарств.',
      },
      findButton: 'Найти клиники в сети и узнать цены',
      privacyBadge:
        'Конфиденциальность гарантирована: Мы не спрашиваем и не сохраняем личные медицинские данные. Ваш поиск безопасен и анонимен.',
      selectedSummary: 'Ваш выбор',
      stepFormat: 'Шаг {step} из {total}',
      continueButton: 'Продолжить',
      usingInsurance: 'Используется ваша страховка:',
      changeInsurance: 'Изменить страховку',
    },
    booking: {
      scheduleWith: 'Запись к',
      selectDate: 'Выберите дату',
      selectTime: 'Выберите время',
      morning: 'Утро',
      afternoon: 'День',
      slotTaken: 'Занято',
      monthLabel: 'Апрель 2026',
      weekdays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      addressLabel: 'Адрес клиники',
      contactHeading: 'Контакты клиники',
      phoneLabel: 'Телефон',
      insuranceHeading: 'Принимаемые страховки',
      confirmPrefix: 'Подтвердить приём у',
      cancelBooking: 'Отмена',
      confirmedTitle: 'Приём подтверждён!',
      confirmedLead: 'Всё готово для приёма у',
      whenLabel: 'Когда',
      done: 'Готово',
      yourDetails: 'Ваши данные',
      yourNameLabel: 'Ваше полное имя',
      yourNamePlaceholder: 'Иван Иванов',
      yourPhoneLabel: 'Номер телефона',
      reasonLabel: 'Причина визита (необязательно)',
      reasonPlaceholder: 'Кратко опишите, зачем вам нужна помощь',
      saving: 'Запись…',
    },
  },
  bn: {
    back: 'ফিরে যান',
    language: 'ভাষা',
    textSize: 'লেখার আকার',
    decreaseText: 'লেখা ছোট করুন',
    increaseText: 'লেখা বড় করুন',
      searchPlaceholder: 'একটি নির্দিষ্ট এলাকা খুঁজুন',
      addressPlaceholder: 'কাছের ক্লিনিক খুঁজতে আপনার ঠিকানা লিখুন',
      useMyLocation: 'আমার অবস্থান ব্যবহার করুন',
      searchingLocation: 'আপনার ঠিকানা খোঁজা হচ্ছে…',
      locationNotFound: 'ঠিকানাটি পাওয়া যায়নি। একটি বরো বা জিপ কোড যোগ করে দেখুন।',
      nearYouPrefix: 'কাছে',
      milesAway: 'মাইল দূরে',
      clearLocation: 'মুছুন',
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
    intake: {
      welcomeTitle: 'আপনার কাছে একজন ডাক্তার খুঁজুন',
      welcomeSubtitle:
        'কয়েকটি দ্রুত প্রশ্নের উত্তর দিন, আমরা আপনাকে নেটওয়ার্কভুক্ত ক্লিনিক ও স্পষ্ট দাম দেখাব।',
      step1Label: '১. আপনার বীমা প্রদানকারী নির্বাচন করুন',
      step1Help: 'আপনার বীমা কার্ডে দেখানো কোম্পানিটি বেছে নিন।',
      selectCarrier: 'আপনার বীমা প্রদানকারী বেছে নিন',
      planLabel: 'আপনার প্ল্যানের ধরন নির্বাচন করুন',
      selectPlan: 'আপনার প্ল্যানের ধরন বেছে নিন',
      step2Label: '২. আজ আপনার কোন ধরনের সেবা প্রয়োজন?',
      step2Help: 'আপনার সফরের সাথে সবচেয়ে মানানসই বিকল্পটি বেছে নিন।',
      care: {
        pcp: 'সাধার��� চেকআপ / প্রাথমিক ডাক্তার',
        dental: 'দাঁতের যত্ন',
        eye: 'চোখ পরীক্ষা',
        physical: 'ফিজিক্যাল থেরাপি',
        geriatric: 'প্রবীণ বয়স্কদের সেবা',
      },
      careDescriptions: {
        pcp: 'চেকআপ, সাধারণ অসুস্থতা, প্রেসক্রিপশন ও রেফারেলের জন্য একজন প্রাথমিক ডাক্তারের সাথে নিয়মিত সাক্ষাৎ।',
        dental:
          'দাঁত পরিষ্কার, ক্যাভিটি, ফিলিং ও দাঁতব্যথা — দাঁত ও মাড়ি সুস্থ রাখতে সাধারণ দাঁতের যত্ন।',
        eye: 'দৃষ্টি পরীক্ষা ও চোখের স্বাস্থ্য পরীক্ষা, চশমা বা কন্টাক্ট লেন্সের প্রেসক্রিপশনসহ।',
        physical:
          'আঘাত, অস্ত্রোপচার বা ব্যথা থেকে সেরে উঠতে এবং চলাফেরা ও শক্তি ফিরে পেতে নির্দেশিত ব্যায়াম ও চিকিৎসা।',
        geriatric:
          'প্রবীণদের জন্য বিশেষ যত্ন — দীর্ঘমেয়াদি রোগ, চলাফেরা, স্মৃতি ও একাধিক ওষুধ ব্যবস্থাপনা।',
      },
      findButton: 'নেটওয়ার্কভুক্ত ক্লিনিক খুঁজুন ও দাম দেখুন',
      privacyBadge:
        'গোপনীয়তা নিশ্চিত: আমরা ব্যক্তিগত চিকিৎসা তথ্য জিজ্ঞাসা করি না বা সংরক্ষণ করি না। আপনার অনুসন্ধান নিরাপদ ও নামহীন।',
      selectedSummary: 'আপনার নির্বাচন',
      stepFormat: 'ধাপ {step} / {total}',
      continueButton: 'চালিয়ে যান',
      usingInsurance: 'আপনার বীমা ব্যবহার করা হচ্ছে:',
      changeInsurance: 'বীমা পরিবর্তন করুন',
    },
    booking: {
      scheduleWith: 'সাক্ষাৎ নির্ধারণ করুন',
      selectDate: 'একটি তারিখ নির্বাচন করুন',
      selectTime: 'একটি সময় নির্বাচন করুন',
      morning: 'সকাল',
      afternoon: 'বিকাল',
      slotTaken: 'বুক করা হয়েছে',
      monthLabel: 'এপ্রিল ২০২৬',
      weekdays: ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'],
      addressLabel: 'ক্লিনিকের ঠিকানা',
      contactHeading: 'ক্লিনিকের যোগাযোগ',
      phoneLabel: 'ফোন',
      insuranceHeading: 'এখানে গৃহীত বীমা',
      confirmPrefix: 'অ্যাপয়েন্টমেন্ট নিশ্চিত করুন:',
      cancelBooking: 'বাতিল',
      confirmedTitle: 'অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে!',
      confirmedLead: 'আপনার সব প্রস্তুত',
      whenLabel: 'কখন',
      done: 'সম্পন্ন',
      yourDetails: 'আপনার তথ্য',
      yourNameLabel: 'আপনার পুরো নাম',
      yourNamePlaceholder: 'জেন ডো',
      yourPhoneLabel: 'ফোন নম্বর',
      reasonLabel: 'ভিজিটের কারণ (ঐচ্ছিক)',
      reasonPlaceholder: 'সংক্ষেপে লিখুন কেন আপনার সেবা প্রয়োজন',
      saving: 'বুকিং হচ্ছে…',
    },
  },
  it: {
    back: 'Indietro',
    language: 'Lingua',
    textSize: 'Dimensione del testo',
    decreaseText: 'Riduci il testo',
    increaseText: 'Ingrandisci il testo',
      searchPlaceholder: 'Cerca una zona specifica',
      addressPlaceholder: 'Inserisci il tuo indirizzo per trovare cliniche vicine',
      useMyLocation: 'Usa la mia posizione',
      searchingLocation: 'Ricerca del tuo indirizzo…',
      locationNotFound: 'Indirizzo non trovato. Prova ad aggiungere un distretto o un CAP.',
      nearYouPrefix: 'Vicino a',
      milesAway: 'mi di distanza',
      clearLocation: 'Cancella',
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
    intake: {
      welcomeTitle: 'Trova un medico vicino a te',
      welcomeSubtitle:
        'Rispondi a poche brevi domande e ti mostreremo le cliniche in rete con prezzi chiari e trasparenti.',
      step1Label: '1. Seleziona la tua assicurazione',
      step1Help: 'Scegli la compagnia indicata sulla tua tessera assicurativa.',
      selectCarrier: 'Scegli la tua assicurazione',
      planLabel: 'Seleziona il tipo di piano',
      selectPlan: 'Scegli il tipo di piano',
      step2Label: '2. Di quale assistenza hai bisogno oggi?',
      step2Help: 'Tocca l\u2019opzione che descrive meglio la tua visita.',
      care: {
        pcp: 'Visita generale / Medico di base',
        dental: 'Cure dentistiche',
        eye: 'Esame della vista',
        physical: 'Fisioterapia',
        geriatric: 'Assistenza geriatrica per anziani',
      },
      careDescriptions: {
        pcp: 'Una visita di routine con un medico di base per controlli, malattie comuni, ricette e referti.',
        dental:
          'Pulizie, carie, otturazioni e mal di denti: cure dentistiche generali per mantenere sani denti e gengive.',
        eye: 'Un test della vista e un esame della salute oculare, comprese le ricette per occhiali o lenti a contatto.',
        physical:
          'Esercizi guidati e trattamenti per riprendersi da infortuni, interventi o dolore e recuperare movimento e forza.',
        geriatric:
          'Assistenza specializzata per gli anziani: malattie croniche, mobilità, memoria e gestione di più farmaci.',
      },
      findButton: 'Trova cliniche in rete e vedi i prezzi',
      privacyBadge:
        'Privacy garantita: Non chiediamo né salviamo condizioni mediche personali. La tua ricerca è sicura e anonima.',
      selectedSummary: 'Le tue scelte',
      stepFormat: 'Passo {step} di {total}',
      continueButton: 'Continua',
      usingInsurance: 'Utilizzando la tua assicurazione:',
      changeInsurance: 'Cambia assicurazione',
    },
    booking: {
      scheduleWith: 'Prenota con',
      selectDate: 'Seleziona una data',
      selectTime: 'Seleziona un orario',
      morning: 'Mattina',
      afternoon: 'Pomeriggio',
      slotTaken: 'Prenotato',
      monthLabel: 'Aprile 2026',
      weekdays: ['D', 'L', 'M', 'M', 'G', 'V', 'S'],
      addressLabel: 'Indirizzo della clinica',
      contactHeading: 'Contatto della clinica',
      phoneLabel: 'Telefono',
      insuranceHeading: 'Assicurazioni accettate qui',
      confirmPrefix: 'Conferma appuntamento con',
      cancelBooking: 'Annulla',
      confirmedTitle: 'Appuntamento confermato!',
      confirmedLead: 'Tutto pronto con',
      whenLabel: 'Quando',
      done: 'Fatto',
      yourDetails: 'I tuoi dati',
      yourNameLabel: 'Il tuo nome completo',
      yourNamePlaceholder: 'Maria Rossi',
      yourPhoneLabel: 'Numero di telefono',
      reasonLabel: 'Motivo della visita (facoltativo)',
      reasonPlaceholder: 'Descrivi brevemente perché hai bisogno di cure',
      saving: 'Prenotazione…',
    },
  },
  tl: {
    back: 'Bumalik',
    language: 'Wika',
    textSize: 'Laki ng teksto',
    decreaseText: 'Paliitin ang teksto',
    increaseText: 'Palakihin ang teksto',
      searchPlaceholder: 'Maghanap ng partikular na lugar',
      addressPlaceholder: 'Ilagay ang inyong address para makahanap ng malapit na klinika',
      useMyLocation: 'Gamitin ang aking lokasyon',
      searchingLocation: 'Hinahanap ang inyong address…',
      locationNotFound: 'Hindi namin nahanap ang address na iyon. Subukang magdagdag ng borough o ZIP.',
      nearYouPrefix: 'Malapit sa',
      milesAway: 'mi ang layo',
      clearLocation: 'I-clear',
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
    intake: {
      welcomeTitle: 'Maghanap ng Doktor na Malapit sa Iyo',
      welcomeSubtitle:
        'Sagutin ang ilang mabilis na tanong at ipapakita namin ang mga in-network na klinika na may malinaw na presyo.',
      step1Label: '1. Piliin ang Iyong Insurance Provider',
      step1Help: 'Piliin ang kompanyang nakasaad sa iyong insurance card.',
      selectCarrier: 'Piliin ang iyong insurance provider',
      planLabel: 'Piliin ang Uri ng Iyong Plan',
      selectPlan: 'Piliin ang uri ng iyong plan',
      step2Label: '2. Anong uri ng pangangalaga ang kailangan mo ngayon?',
      step2Help: 'Pindutin ang opsyon na pinakaangkop sa iyong pagpapatingin.',
      care: {
        pcp: 'Pangkalahatang Checkup / PCP',
        dental: 'Pangangalaga sa Ngipin',
        eye: 'Eksaminasyon sa Mata',
        physical: 'Physical Therapy',
        geriatric: 'Pangangalaga sa Matatanda',
      },
      careDescriptions: {
        pcp: 'Karaniwang pagpapatingin sa isang primary care doctor para sa check-up, karaniwang sakit, reseta, at referral.',
        dental:
          'Paglilinis, bulok na ngipin, pasta, at sakit ng ngipin — pangkalahatang pangangalaga sa ngipin para manatiling malusog ang iyong ngipin at gilagid.',
        eye: 'Pagsusuri ng paningin at kalusugan ng mata, kabilang ang reseta para sa salamin o contact lens.',
        physical:
          'Ginagabayang ehersisyo at paggamot para makabawi mula sa pinsala, operasyon, o sakit at maibalik ang galaw at lakas.',
        geriatric:
          'Espesyal na pangangalaga para sa matatanda, saklaw ang malalang sakit, paggalaw, memorya, at pamamahala ng maraming gamot.',
      },
      findButton: 'Hanapin ang In-Network na Klinika at Tingnan ang Presyo',
      privacyBadge:
        'Garantisadong Privacy: Hindi kami nagtatanong o nag-iimbak ng personal na kondisyong medikal. Ligtas at anonimo ang iyong paghahanap.',
      selectedSummary: 'Ang iyong mga pinili',
      stepFormat: 'Hakbang {step} sa {total}',
      continueButton: 'Magpatuloy',
      usingInsurance: 'Ginagamit ang iyong insurance:',
      changeInsurance: 'Palitan ang insurance',
    },
    booking: {
      scheduleWith: 'Mag-iskedyul kay',
      selectDate: 'Pumili ng Petsa',
      selectTime: 'Pumili ng Oras',
      morning: 'Umaga',
      afternoon: 'Hapon',
      slotTaken: 'Nakabook',
      monthLabel: 'Abril 2026',
      weekdays: ['Li', 'Lu', 'Ma', 'Mi', 'Hu', 'Bi', 'Sa'],
      addressLabel: 'Address ng klinika',
      contactHeading: 'Kontak ng klinika',
      phoneLabel: 'Telepono',
      insuranceHeading: 'Mga Insurance na Tinatanggap Dito',
      confirmPrefix: 'Kumpirmahin ang Appointment kay',
      cancelBooking: 'Kanselahin',
      confirmedTitle: 'Nakumpirma na ang Appointment!',
      confirmedLead: 'Handa ka na kay',
      whenLabel: 'Kailan',
      done: 'Tapos',
      yourDetails: 'Ang iyong detalye',
      yourNameLabel: 'Iyong buong pangalan',
      yourNamePlaceholder: 'Juan dela Cruz',
      yourPhoneLabel: 'Numero ng telepono',
      reasonLabel: 'Dahilan ng pagpapatingin (opsyonal)',
      reasonPlaceholder: 'Maikling ilarawan kung bakit kailangan mo ng pangangalaga',
      saving: 'Nagbu-book…',
    },
  },
}
