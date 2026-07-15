import type { LanguageCode } from '@/lib/i18n'

// Translation strings for the patient dashboard and its cards. Kept in a
// separate dictionary from the main TRANSLATIONS object so the dashboard can be
// extended without touching the large shared Strings type.
export interface DashboardStrings {
  patientBadge: string
  findBookCare: string
  welcomeBack: string
  subtitle: string
  statUpcoming: string
  statPastVisits: string
  statDoctorNotes: string
  // Insurance card
  yourInsurance: string
  usedToFind: string
  change: string
  noInsuranceYet: string
  insuranceCarrier: string
  planWord: string
  selectYourPlan: string
  saveInsurance: string
  saving: string
  cancel: string
  // Appointments
  upcoming: string
  past: string
  reasonLabel: string
  doctorsNote: string
  noNoteYet: string
  noUpcoming: string
  noPast: string
  // Confirmation reminder
  confirmTitle: string
  confirmPrompt: string
  stillComing: string
  yesConfirm: string
  noDecline: string
  confirmedBadge: string
  declinedBadge: string
  awaitingConfirm: string
  // Call
  startCall: string
  joinCall: string
  callTitle: string
}

export const DASHBOARD_TRANSLATIONS: Record<LanguageCode, DashboardStrings> = {
  en: {
    patientBadge: 'Patient',
    findBookCare: 'Find & book care',
    welcomeBack: 'Welcome back',
    subtitle:
      'Track your upcoming and past appointments, and read the notes your doctor left after each visit.',
    statUpcoming: 'Upcoming',
    statPastVisits: 'Past visits',
    statDoctorNotes: 'Doctor notes',
    yourInsurance: 'Your insurance',
    usedToFind: 'Used to find in-network care.',
    change: 'Change',
    noInsuranceYet:
      "You haven't added your insurance yet. Add it so we can match you with in-network doctors.",
    insuranceCarrier: 'Insurance carrier',
    planWord: 'Plan',
    selectYourPlan: 'Select your plan',
    saveInsurance: 'Save insurance',
    saving: 'Saving…',
    cancel: 'Cancel',
    upcoming: 'Upcoming',
    past: 'Past',
    reasonLabel: 'Reason: ',
    doctorsNote: "Doctor's note",
    noNoteYet: 'No note from the doctor yet.',
    noUpcoming:
      'You have no upcoming appointments. Find a clinic to book your next visit.',
    noPast: 'No past appointments yet.',
    confirmTitle: 'Please confirm your appointment',
    confirmPrompt:
      'Your visit is coming up soon. Let the clinic know if you are still coming.',
    stillComing: 'Are you still coming to this appointment?',
    yesConfirm: "Yes, I'll be there",
    noDecline: "No, I can't make it",
    confirmedBadge: 'Confirmed',
    declinedBadge: 'Declined',
    awaitingConfirm: 'Awaiting your confirmation',
    startCall: 'Start call',
    joinCall: 'Join call',
    callTitle: 'Call',
  },
  es: {
    patientBadge: 'Paciente',
    findBookCare: 'Buscar y reservar atención',
    welcomeBack: 'Bienvenido de nuevo',
    subtitle:
      'Consulta tus próximas citas y las anteriores, y lee las notas que tu médico dejó después de cada visita.',
    statUpcoming: 'Próximas',
    statPastVisits: 'Visitas anteriores',
    statDoctorNotes: 'Notas del médico',
    yourInsurance: 'Tu seguro',
    usedToFind: 'Se usa para encontrar atención dentro de la red.',
    change: 'Cambiar',
    noInsuranceYet:
      'Aún no has agregado tu seguro. Agrégalo para conectarte con médicos dentro de la red.',
    insuranceCarrier: 'Compañía de seguros',
    planWord: 'Plan',
    selectYourPlan: 'Selecciona tu plan',
    saveInsurance: 'Guardar seguro',
    saving: 'Guardando…',
    cancel: 'Cancelar',
    upcoming: 'Próximas',
    past: 'Anteriores',
    reasonLabel: 'Motivo: ',
    doctorsNote: 'Nota del médico',
    noNoteYet: 'Aún no hay nota del médico.',
    noUpcoming:
      'No tienes citas próximas. Busca una clínica para reservar tu próxima visita.',
    noPast: 'Aún no hay citas anteriores.',
    confirmTitle: 'Confirma tu cita',
    confirmPrompt:
      'Tu visita es pronto. Avísale a la clínica si aún vas a asistir.',
    stillComing: '¿Todavía vas a asistir a esta cita?',
    yesConfirm: 'Sí, allí estaré',
    noDecline: 'No, no puedo asistir',
    confirmedBadge: 'Confirmada',
    declinedBadge: 'Cancelada',
    awaitingConfirm: 'Esperando tu confirmación',
    startCall: 'Iniciar llamada',
    joinCall: 'Unirse a la llamada',
    callTitle: 'Llamada',
  },
  zh: {
    patientBadge: '病人',
    findBookCare: '尋找及預約診症',
    welcomeBack: '歡迎回來',
    subtitle:
      '查看你即將到來同過往嘅預約，並閱讀醫生喺每次診症後留低嘅記錄。',
    statUpcoming: '即將到來',
    statPastVisits: '過往診症',
    statDoctorNotes: '醫生記錄',
    yourInsurance: '你嘅保險',
    usedToFind: '用嚟尋找網絡內嘅醫療服務。',
    change: '更改',
    noInsuranceYet:
      '你重未加入保險。加入之後我哋就可以幫你配對網絡內嘅醫生。',
    insuranceCarrier: '保險公司',
    planWord: '計劃',
    selectYourPlan: '選擇你嘅計劃',
    saveInsurance: '儲存保險',
    saving: '儲存緊…',
    cancel: '取消',
    upcoming: '即將到來',
    past: '過往',
    reasonLabel: '原因： ',
    doctorsNote: '醫生記錄',
    noNoteYet: '醫生重未有記錄。',
    noUpcoming: '你冇即將到來嘅預約。尋找診所預約下次診症。',
    noPast: '重未有過往預約。',
    confirmTitle: '請確認你嘅預約',
    confirmPrompt: '你嘅診症快到喇。請話俾診所知你係咪仲會嚟。',
    stillComing: '你係咪仲會嚟呢個預約？',
    yesConfirm: '係，我會嚟',
    noDecline: '唔係，我嚟唔到',
    confirmedBadge: '已確認',
    declinedBadge: '已取消',
    awaitingConfirm: '等緊你確認',
    startCall: '開始通話',
    joinCall: '加入通話',
    callTitle: '通話',
  },
  ru: {
    patientBadge: 'Пациент',
    findBookCare: 'Найти и записаться',
    welcomeBack: 'С возвращением',
    subtitle:
      'Следите за предстоящими и прошедшими приёмами и читайте заметки, которые врач оставил после каждого визита.',
    statUpcoming: 'Предстоящие',
    statPastVisits: 'Прошедшие визиты',
    statDoctorNotes: 'Заметки врача',
    yourInsurance: 'Ваша страховка',
    usedToFind: 'Используется для поиска врачей в вашей сети.',
    change: 'Изменить',
    noInsuranceYet:
      'Вы ещё не добавили страховку. Добавьте её, чтобы мы подобрали врачей в вашей сети.',
    insuranceCarrier: 'Страховая компания',
    planWord: 'План',
    selectYourPlan: 'Выберите план',
    saveInsurance: 'Сохранить страховку',
    saving: 'Сохранение…',
    cancel: 'Отмена',
    upcoming: 'Предстоящие',
    past: 'Прошедшие',
    reasonLabel: 'Причина: ',
    doctorsNote: 'Заметка врача',
    noNoteYet: 'Врач ещё не оставил заметку.',
    noUpcoming:
      'У вас нет предстоящих приёмов. Найдите клинику, чтобы записаться на следующий визит.',
    noPast: 'Прошедших приёмов пока нет.',
    confirmTitle: 'Пожалуйста, подтвердите приём',
    confirmPrompt:
      'Ваш визит уже скоро. Сообщите клинике, придёте ли вы.',
    stillComing: 'Вы всё ещё придёте на этот приём?',
    yesConfirm: 'Да, я приду',
    noDecline: 'Нет, не смогу прийти',
    confirmedBadge: 'Подтверждено',
    declinedBadge: 'Отменено',
    awaitingConfirm: 'Ожидает вашего подтверждения',
    startCall: 'Начать звонок',
    joinCall: 'Присоединиться к звонку',
    callTitle: 'Звонок',
  },
  bn: {
    patientBadge: 'রোগী',
    findBookCare: 'সেবা খুঁজুন ও বুক করুন',
    welcomeBack: 'আবার স্বাগতম',
    subtitle:
      'আপনার আসন্ন ও পূর্ববর্তী অ্যাপয়েন্টমেন্ট দেখুন এবং প্রতিটি ভিজিটের পর ডাক্তারের রেখে যাওয়া নোট পড়ুন।',
    statUpcoming: 'আসন্ন',
    statPastVisits: 'পূর্ববর্তী ভিজিট',
    statDoctorNotes: 'ডাক্তারের নোট',
    yourInsurance: 'আপনার বীমা',
    usedToFind: 'নেটওয়ার্কের মধ্যে সেবা খুঁজতে ব্যবহৃত হয়।',
    change: 'পরিবর্তন',
    noInsuranceYet:
      'আপনি এখনও আপনার বীমা যোগ করেননি। যোগ করুন যাতে আমরা আপনাকে নেটওয়ার্কের ডাক্তারদের সাথে মেলাতে পারি।',
    insuranceCarrier: 'বীমা কোম্পানি',
    planWord: 'প্ল্যান',
    selectYourPlan: 'আপনার প্ল্যান নির্বাচন করুন',
    saveInsurance: 'বীমা সংরক্ষণ করুন',
    saving: 'সংরক্ষণ হচ্ছে…',
    cancel: 'বাতিল',
    upcoming: 'আসন্ন',
    past: 'পূর্ববর্তী',
    reasonLabel: 'কারণ: ',
    doctorsNote: 'ডাক্তারের নোট',
    noNoteYet: 'ডাক্তার এখনও কোনো নোট দেননি।',
    noUpcoming:
      'আপনার কোনো আসন্ন অ্যাপয়েন্টমেন্ট নেই। পরবর্তী ভিজিট বুক করতে একটি ক্লিনিক খুঁজুন।',
    noPast: 'এখনও কোনো পূর্ববর্তী অ্যাপয়েন্টমেন্ট নেই।',
    confirmTitle: 'অনুগ্রহ করে আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত করুন',
    confirmPrompt:
      'আপনার ভিজিট শীঘ্রই আসছে। আপনি আসছেন কিনা ক্লিনিককে জানান।',
    stillComing: 'আপনি কি এখনও এই অ্যাপয়েন্টমেন্টে আসছেন?',
    yesConfirm: 'হ্যাঁ, আমি আসব',
    noDecline: 'না, আমি আসতে পারব না',
    confirmedBadge: 'নিশ্চিত',
    declinedBadge: 'বাতিল',
    awaitingConfirm: 'আপনার নিশ্চিতকরণের অপেক্ষায়',
    startCall: 'কল শুরু করুন',
    joinCall: 'কলে যোগ দিন',
    callTitle: 'কল',
  },
  it: {
    patientBadge: 'Paziente',
    findBookCare: 'Trova e prenota cure',
    welcomeBack: 'Bentornato',
    subtitle:
      'Tieni traccia dei tuoi appuntamenti futuri e passati e leggi le note lasciate dal medico dopo ogni visita.',
    statUpcoming: 'In arrivo',
    statPastVisits: 'Visite passate',
    statDoctorNotes: 'Note del medico',
    yourInsurance: 'La tua assicurazione',
    usedToFind: 'Usata per trovare cure in rete.',
    change: 'Cambia',
    noInsuranceYet:
      'Non hai ancora aggiunto la tua assicurazione. Aggiungila per trovare medici in rete.',
    insuranceCarrier: 'Compagnia assicurativa',
    planWord: 'Piano',
    selectYourPlan: 'Seleziona il tuo piano',
    saveInsurance: 'Salva assicurazione',
    saving: 'Salvataggio…',
    cancel: 'Annulla',
    upcoming: 'In arrivo',
    past: 'Passate',
    reasonLabel: 'Motivo: ',
    doctorsNote: 'Nota del medico',
    noNoteYet: 'Nessuna nota del medico ancora.',
    noUpcoming:
      'Non hai appuntamenti in arrivo. Trova una clinica per prenotare la prossima visita.',
    noPast: 'Nessun appuntamento passato.',
    confirmTitle: 'Conferma il tuo appuntamento',
    confirmPrompt:
      'La tua visita è imminente. Fai sapere alla clinica se verrai.',
    stillComing: 'Verrai ancora a questo appuntamento?',
    yesConfirm: 'Sì, ci sarò',
    noDecline: 'No, non posso venire',
    confirmedBadge: 'Confermato',
    declinedBadge: 'Annullato',
    awaitingConfirm: 'In attesa della tua conferma',
    startCall: 'Avvia chiamata',
    joinCall: 'Partecipa alla chiamata',
    callTitle: 'Chiamata',
  },
  tl: {
    patientBadge: 'Pasyente',
    findBookCare: 'Maghanap at mag-book ng pangangalaga',
    welcomeBack: 'Maligayang pagbabalik',
    subtitle:
      'Subaybayan ang iyong mga paparating at nakaraang appointment, at basahin ang mga tala na iniwan ng iyong doktor pagkatapos ng bawat pagbisita.',
    statUpcoming: 'Paparating',
    statPastVisits: 'Nakaraang pagbisita',
    statDoctorNotes: 'Mga tala ng doktor',
    yourInsurance: 'Ang iyong insurance',
    usedToFind: 'Ginagamit para makahanap ng in-network na pangangalaga.',
    change: 'Baguhin',
    noInsuranceYet:
      'Hindi mo pa naidaragdag ang iyong insurance. Idagdag ito para maitugma ka namin sa mga in-network na doktor.',
    insuranceCarrier: 'Kompanya ng insurance',
    planWord: 'Plano',
    selectYourPlan: 'Piliin ang iyong plano',
    saveInsurance: 'I-save ang insurance',
    saving: 'Sine-save…',
    cancel: 'Kanselahin',
    upcoming: 'Paparating',
    past: 'Nakaraan',
    reasonLabel: 'Dahilan: ',
    doctorsNote: 'Tala ng doktor',
    noNoteYet: 'Wala pang tala mula sa doktor.',
    noUpcoming:
      'Wala kang paparating na appointment. Maghanap ng klinika para mag-book ng susunod mong pagbisita.',
    noPast: 'Wala pang nakaraang appointment.',
    confirmTitle: 'Pakikumpirma ang iyong appointment',
    confirmPrompt:
      'Malapit na ang iyong pagbisita. Ipaalam sa klinika kung pupunta ka pa rin.',
    stillComing: 'Pupunta ka pa rin ba sa appointment na ito?',
    yesConfirm: 'Oo, pupunta ako',
    noDecline: 'Hindi, hindi ako makakapunta',
    confirmedBadge: 'Nakumpirma',
    declinedBadge: 'Kinansela',
    awaitingConfirm: 'Naghihintay ng iyong kumpirmasyon',
    startCall: 'Simulan ang tawag',
    joinCall: 'Sumali sa tawag',
    callTitle: 'Tawag',
  },
}
