export const LANDING_LANGUAGES = [
  { code: "en", label: "English", locale: "en" },
  { code: "es", label: "Español", locale: "es" },
  { code: "pl", label: "Polski", locale: "pl" },
  { code: "de", label: "Deutsch", locale: "de" },
  { code: "uk", label: "Українська", locale: "uk" },
] as const;

export type LandingLanguage = (typeof LANDING_LANGUAGES)[number]["code"];

type LandingCopy = {
  languageLabel: string;
  nav: {
    how: string;
    clients: string;
    workers: string;
    signIn: string;
    hire: string;
    findWork: string;
    openMenu: string;
    closeMenu: string;
  };
  promo: { title: string; body: string; link: string };
  hero: {
    badge: string;
    headline: [string, string, string];
    description: string;
    postTask: string;
    exploreWork: string;
    proof: [string, string, string];
  };
  preview: {
    kicker: string;
    headline: [string, string];
    caption: string;
    people: [string, string, string];
    budget: string;
    payment: string;
    held: string;
    review: string;
    steps: string;
    example: string;
    inReview: string;
    taskTitle: string;
    taskDescription: string;
    submitted: string;
    primaryReview: string;
    auditReview: string;
    passed: string;
    inProgress: string;
    payout: string;
    execution: string;
  };
  problem: {
    eyebrow: string;
    title: string;
    description: string;
    pico: string;
    cards: { who: string; pain: string; fix: string }[];
  };
  flow: {
    eyebrow: string;
    title: string;
    steps: { title: string; body: string }[];
    note: string;
  };
  urgent: {
    eyebrow: string;
    title: string;
    description: string;
    benefits: [string, string, string];
    cta: string;
    note: string;
    visualLabel: string;
    briefLabel: string;
    status: string;
    briefTitle: string;
    briefSubtitle: string;
    taskOne: string;
    skillOne: string;
    taskTwo: string;
    skillTwo: string;
    verifiedLabel: string;
    verifiedDescription: string;
  };
  board: {
    titleSearch: string;
    skillSearch: string;
    search: string;
    skillLane: string;
    all: string;
    codeReview: string;
    debugging: string;
    qa: string;
    design: string;
    clear: string;
    securedBudget: string;
    minimumBudget: string;
    maximumBudget: string;
    slots: string;
    execution: string;
    primary: string;
    audit: string;
    slotDescription: string;
    postTask: string;
    openTasks: string;
    sortBy: string;
    recent: string;
    highestBudget: string;
    lookingToQualify: string;
    reviewCount: string;
    securedPayment: string;
    fixed: string;
    enterBoard: string;
    noMatches: string;
    postRealTask: string;
    saveTask: string;
    taskAges: [string, string, string, string, string, string];
  };
  footer: {
    description: string;
    app: string;
    post: string;
    clients: string;
    flow: string;
    tagline: string;
  };
  taskTitles: [string, string, string, string, string, string];
  taskDescriptions: [string, string, string, string, string, string];
};

export const LANDING_COPY: Record<LandingLanguage, LandingCopy> = {
  en: {
    languageLabel: "Language",
    nav: {
      how: "How it works",
      clients: "For clients",
      workers: "For workers",
      signIn: "Sign in",
      hire: "Hire for a task",
      findWork: "Find work",
      openMenu: "Open navigation menu",
      closeMenu: "Close navigation menu",
    },
    promo: {
      title: "A deadline coming up?",
      body: "Get qualified help for the one or two tasks holding up your project.",
      link: "See how it works",
    },
    hero: {
      badge: "A faster lane for expert work",
      headline: ["Great work,", "without the", "long wait."],
      description:
        "When a deadline is close, post the one or two tasks holding up your project. Pico helps you find a qualified specialist quickly, with work reviewed before payment is released.",
      postTask: "Post a task",
      exploreWork: "Explore open work",
      proof: ["Payments secured up front", "Skills proven up front", "Independent review"],
    },
    preview: {
      kicker: "HOW PICO WORKS",
      headline: ["Small task.", "Serious follow-through."],
      caption:
        "A clear brief, a proven specialist, and a payment that moves when the work is verified.",
      people: ["CLIENT", "SPECIALIST", "REVIEW"],
      budget: "Task budget",
      payment: "Payment",
      held: "Secured",
      review: "Review",
      steps: "2 steps",
      example: "EXAMPLE TASK · QA & TESTING",
      inReview: "In review",
      taskTitle: "Checkout flow regression pass",
      taskDescription:
        "Check the payment flow across mobile and desktop before release.",
      submitted: "Execution submitted",
      primaryReview: "Primary review",
      auditReview: "Audit review",
      passed: "Passed",
      inProgress: "In progress",
      payout: "Payment released after review",
      execution: "Execution",
    },
    problem: {
      eyebrow: "WHY PICO",
      title: "Built for the work that gets stuck in the hiring process",
      description:
        "For focused projects that need the right specialist now, without turning a few hours of work into a week of searching.",
      pico: "Pico:",
      cards: [
        {
          who: "CLIENTS",
          pain: "Hiring theatre for a 2–4 hour job",
          fix: "Post and fund once. The first qualified podium fills the seats — no CV browsing.",
        },
        {
          who: "CLIENTS",
          pain: "“I can do it” with no proof",
          fix: "Three timed tests. See the results. The fastest qualified specialist gets the task.",
        },
        {
          who: "SPECIALISTS",
          pain: "Rejection or non-payment after you start",
          fix: "The task budget is secured before work begins, so payment is ready when the work is approved.",
        },
        {
          who: "CLIENTS",
          pain: "A delivery with no independent check",
          fix: "A primary reviewer checks the work; an auditor checks that review.",
        },
        {
          who: "EVERYONE",
          pain: "Slow cross-border micropayments",
          fix: "A clear budget and payout split are set before the task begins.",
        },
      ],
    },
    flow: {
      eyebrow: "THE PROCESS",
      title: "From a clear budget to a verified payout",
      steps: [
        { title: "Set budget", body: "Choose the budget and payout split" },
        { title: "Qualify", body: "Timed skill tests" },
        { title: "Assign", body: "Work and review slots" },
        { title: "Verify", body: "Independent review" },
        { title: "Pay", body: "Release payment after review" },
      ],
      note: "The same timed qualification identifies the specialist and the reviewers. If someone declines, only that seat is refilled.",
    },
    urgent: {
      eyebrow: "WHEN THE DEADLINE IS CLOSING IN",
      title: "Don’t let one stuck task hold the whole project back.",
      description:
        "Bring the one or two things blocking progress to Pico. Find a qualified specialist for focused work—without the long hiring cycle.",
      benefits: [
        "Post a clear task with your budget",
        "Review demonstrated skills before choosing",
        "Approve the work before payment is released",
      ],
      cta: "Get help with a task",
      note: "Focused work, without another long hiring process.",
      visualLabel: "Example of a focused task brief",
      briefLabel: "PRIORITY BRIEF",
      status: "2 focused tasks",
      briefTitle: "What needs to get done?",
      briefSubtitle: "A clear scope helps the right specialist get started.",
      taskOne: "Fix checkout errors before launch",
      skillOne: "Development",
      taskTwo: "Test checkout on mobile and desktop",
      skillTwo: "QA & testing",
      verifiedLabel: "Skills shown before selection",
      verifiedDescription: "Choose based on demonstrated ability.",
    },
    board: {
      titleSearch: "Task title or keyword",
      skillSearch: "Skill lane",
      search: "Search",
      skillLane: "Skill lane",
      all: "All",
      codeReview: "Code review",
      debugging: "Debugging",
      qa: "QA",
      design: "Design",
      clear: "Clear",
      securedBudget: "Secured budget",
      minimumBudget: "Minimum budget",
      maximumBudget: "Maximum budget",
      slots: "Slots",
      execution: "Execution",
      primary: "Primary",
      audit: "Audit",
      slotDescription: "Execution does the work. Primary reviews it. Audit checks that review.",
      postTask: "Post a task",
      openTasks: "Open tasks",
      sortBy: "Sort tasks",
      recent: "Most recent",
      highestBudget: "Highest budget",
      lookingToQualify: "interested",
      reviewCount: "reviews",
      securedPayment: "Payment secured",
      fixed: "Fixed",
      enterBoard: "View task",
      noMatches: "No sample tasks match these filters.",
      postRealTask: "Post a real task",
      saveTask: "Save task",
      taskAges: ["2h ago", "5h ago", "1d ago", "1d ago", "2d ago", "3d ago"],
    },
    footer: {
      description:
        "Verified work without the hiring overhead — clear budgets, qualified specialists, independent review.",
      app: "App",
      post: "Post a task",
      clients: "For clients",
      flow: "How it works",
      tagline: "Short tasks. Qualified people. Secure payments.",
    },
    taskTitles: [
      "Review API access controls",
      "Fix an unreliable sign-in flow",
      "QA the booking and checkout journey",
      "Improve the dashboard table layout",
      "Audit invoice and payout calculations",
      "Fix a file upload issue",
    ],
    taskDescriptions: [
      "Check role permissions and access rules before a new feature goes live.",
      "Find why users are sometimes signed out while moving between pages.",
      "Test the booking and checkout journey on mobile and desktop.",
      "Make the most important dashboard information easier to scan on mobile.",
      "Check invoices and payout totals for rounding or calculation errors.",
      "Investigate why larger files fail during upload and recommend a fix.",
    ],
  },
  es: {
    languageLabel: "Idioma",
    nav: {
      how: "Cómo funciona",
      clients: "Para clientes",
      workers: "Para especialistas",
      signIn: "Iniciar sesión",
      hire: "Publicar una tarea",
      findWork: "Buscar trabajo",
      openMenu: "Abrir menú de navegación",
      closeMenu: "Cerrar menú de navegación",
    },
    promo: {
      title: "¿Se acerca la fecha límite?",
      body: "Encuentra ayuda cualificada para las una o dos tareas que frenan tu proyecto.",
      link: "Descubre cómo funciona",
    },
    hero: {
      badge: "Una vía más rápida para el trabajo especializado",
      headline: ["Buen trabajo,", "sin tanta", "espera."],
      description:
        "Cuando se acerca la fecha límite, publica las una o dos tareas que están frenando tu proyecto. Pico te ayuda a encontrar rápidamente a un especialista cualificado; el pago se libera tras revisar el trabajo.",
      postTask: "Publicar una tarea",
      exploreWork: "Ver tareas disponibles",
      proof: ["Pagos protegidos desde el inicio", "Habilidades demostradas", "Revisión independiente"],
    },
    preview: {
      kicker: "CÓMO FUNCIONA PICO",
      headline: ["Una tarea breve.", "Un resultado serio."],
      caption:
        "Un encargo claro, un especialista cualificado y un pago que se libera cuando el trabajo queda verificado.",
      people: ["CLIENTE", "ESPECIALISTA", "REVISIÓN"],
      budget: "Presupuesto",
      payment: "Pago",
      held: "Protegido",
      review: "Revisión",
      steps: "2 pasos",
      example: "TAREA DE EJEMPLO · QA Y PRUEBAS",
      inReview: "En revisión",
      taskTitle: "Pruebas de regresión del pago",
      taskDescription:
        "Revisa el flujo de pago en móvil y escritorio antes del lanzamiento.",
      submitted: "Trabajo entregado",
      primaryReview: "Revisión inicial",
      auditReview: "Auditoría",
      passed: "Aprobada",
      inProgress: "En curso",
      payout: "El pago se libera tras la revisión",
      execution: "Ejecución",
    },
    problem: {
      eyebrow: "POR QUÉ PICO",
      title: "Para el trabajo que se atasca en el proceso de contratación",
      description:
        "Para proyectos concretos que necesitan al especialista adecuado ahora, sin convertir unas horas de trabajo en una semana de búsqueda.",
      pico: "Pico:",
      cards: [
        {
          who: "CLIENTES",
          pain: "Todo un proceso de selección para unas horas de trabajo",
          fix: "Publica y financia la tarea una vez. El primer grupo cualificado ocupa los puestos, sin revisar currículos.",
        },
        {
          who: "CLIENTES",
          pain: "«Puedo hacerlo» sin demostrarlo",
          fix: "Tres pruebas cronometradas. Consulta los resultados y asigna la tarea al especialista cualificado más rápido.",
        },
        {
          who: "ESPECIALISTAS",
          pain: "Rechazo o impago después de empezar",
          fix: "El presupuesto queda protegido antes de empezar, para que el pago esté listo cuando se apruebe el trabajo.",
        },
        {
          who: "CLIENTES",
          pain: "Una entrega sin revisión independiente",
          fix: "Un revisor principal comprueba el trabajo y un auditor verifica esa revisión.",
        },
        {
          who: "TODOS",
          pain: "Pagos transfronterizos lentos y pequeños",
          fix: "El presupuesto y el reparto del pago quedan claros antes de empezar la tarea.",
        },
      ],
    },
    flow: {
      eyebrow: "EL PROCESO",
      title: "De un presupuesto claro a un pago verificado",
      steps: [
        { title: "Presupuesto", body: "Define el presupuesto y el reparto" },
        { title: "Demuestra", body: "Pruebas de habilidad cronometradas" },
        { title: "Asigna", body: "Trabajo y puestos de revisión" },
        { title: "Verifica", body: "Revisión independiente" },
        { title: "Paga", body: "Libera el pago tras la revisión" },
      ],
      note: "La misma prueba cronometrada selecciona al especialista y a quienes revisan. Si alguien renuncia, solo se vuelve a cubrir ese puesto.",
    },
    urgent: {
      eyebrow: "SI SE ACERCA LA FECHA LÍMITE",
      title: "Que una tarea atascada no frene todo el proyecto.",
      description:
        "Trae a Pico una o dos tareas que bloquean el avance. Encuentra a un especialista cualificado para un trabajo concreto, sin un largo proceso de selección.",
      benefits: [
        "Publica una tarea clara con su presupuesto",
        "Revisa las habilidades demostradas antes de elegir",
        "Aprueba el trabajo antes de liberar el pago",
      ],
      cta: "Encuentra ayuda para una tarea",
      note: "Trabajo concreto, sin otro largo proceso de selección.",
      visualLabel: "Ejemplo de una tarea concreta",
      briefLabel: "TAREA PRIORITARIA",
      status: "2 tareas concretas",
      briefTitle: "¿Qué hay que resolver?",
      briefSubtitle: "Un alcance claro ayuda al especialista adecuado a empezar.",
      taskOne: "Corregir errores del pago antes del lanzamiento",
      skillOne: "Desarrollo",
      taskTwo: "Probar el pago en móvil y escritorio",
      skillTwo: "QA y pruebas",
      verifiedLabel: "Habilidades demostradas antes de elegir",
      verifiedDescription: "Elige según la capacidad demostrada.",
    },
    board: {
      titleSearch: "Título o palabra clave",
      skillSearch: "Especialidad",
      search: "Buscar",
      skillLane: "Especialidad",
      all: "Todas",
      codeReview: "Revisión de código",
      debugging: "Depuración",
      qa: "Pruebas de calidad",
      design: "Diseño",
      clear: "Borrar",
      securedBudget: "Presupuesto protegido",
      minimumBudget: "Presupuesto mínimo",
      maximumBudget: "Presupuesto máximo",
      slots: "Puestos",
      execution: "Ejecución",
      primary: "Revisión inicial",
      audit: "Auditoría",
      slotDescription: "Ejecución realiza el trabajo. La revisión inicial lo comprueba y la auditoría verifica esa revisión.",
      postTask: "Publicar una tarea",
      openTasks: "Tareas disponibles",
      sortBy: "Ordenar tareas",
      recent: "Más recientes",
      highestBudget: "Mayor presupuesto",
      lookingToQualify: "interesados",
      reviewCount: "revisiones",
      securedPayment: "Pago protegido",
      fixed: "Precio fijo",
      enterBoard: "Ver tarea",
      noMatches: "No hay tareas de ejemplo con estos filtros.",
      postRealTask: "Publica una tarea real",
      saveTask: "Guardar tarea",
      taskAges: ["hace 2 h", "hace 5 h", "hace 1 día", "hace 1 día", "hace 2 días", "hace 3 días"],
    },
    footer: {
      description:
        "Trabajo verificado sin procesos de selección interminables: presupuestos claros, especialistas cualificados y revisión independiente.",
      app: "Aplicación",
      post: "Publicar una tarea",
      clients: "Para clientes",
      flow: "Cómo funciona",
      tagline: "Tareas breves. Profesionales cualificados. Pagos seguros.",
    },
    taskTitles: [
      "Revisar los permisos de acceso de la API",
      "Corregir un inicio de sesión poco fiable",
      "Probar el proceso de reserva y pago",
      "Mejorar el diseño de la tabla del panel",
      "Revisar los cálculos de facturas y pagos",
      "Corregir un problema al subir archivos",
    ],
    taskDescriptions: [
      "Comprueba los permisos y las reglas de acceso antes de lanzar una nueva función.",
      "Averigua por qué a veces se cierra la sesión al cambiar de página.",
      "Prueba el proceso de reserva y pago en móvil y escritorio.",
      "Facilita la lectura de la información más importante del panel en móvil.",
      "Comprueba las facturas y los pagos para detectar errores de cálculo.",
      "Investiga por qué fallan las subidas de archivos grandes y recomienda una solución.",
    ],
  },
  pl: {
    languageLabel: "Język",
    nav: {
      how: "Jak to działa",
      clients: "Dla klientów",
      workers: "Dla specjalistów",
      signIn: "Zaloguj się",
      hire: "Dodaj zlecenie",
      findWork: "Znajdź zlecenie",
      openMenu: "Otwórz menu nawigacji",
      closeMenu: "Zamknij menu nawigacji",
    },
    promo: {
      title: "Goni Cię termin?",
      body: "Znajdź sprawdzonego specjalistę do jednego lub dwóch zadań, które blokują projekt.",
      link: "Zobacz, jak to działa",
    },
    hero: {
      badge: "Szybsza droga do specjalistycznej pracy",
      headline: ["Świetna praca,", "bez długiego", "czekania."],
      description:
        "Gdy zbliża się termin, dodaj jedno lub dwa zadania, które blokują projekt. Pico pomaga szybko znaleźć sprawdzonego specjalistę; wypłata następuje po weryfikacji pracy.",
      postTask: "Dodaj zadanie",
      exploreWork: "Przeglądaj zadania",
      proof: ["Płatność zabezpieczona od początku", "Umiejętności sprawdzone przed startem", "Niezależna weryfikacja"],
    },
    preview: {
      kicker: "JAK DZIAŁA PICO",
      headline: ["Krótkie zadanie.", "Rzetelna realizacja."],
      caption:
        "Jasny zakres, sprawdzony specjalista i wypłata po zweryfikowaniu pracy.",
      people: ["KLIENT", "SPECJALISTA", "WERYFIKACJA"],
      budget: "Budżet zadania",
      payment: "Płatność",
      held: "Zabezpieczona",
      review: "Weryfikacja",
      steps: "2 etapy",
      example: "PRZYKŁADOWE ZADANIE · TESTY QA",
      inReview: "Weryfikacja",
      taskTitle: "Testy regresji procesu płatności",
      taskDescription:
        "Sprawdź płatności na urządzeniach mobilnych i komputerach przed premierą.",
      submitted: "Praca przesłana",
      primaryReview: "Pierwsza weryfikacja",
      auditReview: "Audyt",
      passed: "Zaliczona",
      inProgress: "W toku",
      payout: "Wypłata po zatwierdzeniu weryfikacji",
      execution: "Realizacja",
    },
    problem: {
      eyebrow: "DLACZEGO PICO",
      title: "Do zadań, które grzęzną w procesie rekrutacji",
      description:
        "Dla konkretnych projektów, które wymagają właściwego specjalisty od zaraz — bez zamieniania kilku godzin pracy w tydzień poszukiwań.",
      pico: "Pico:",
      cards: [
        {
          who: "KLIENCI",
          pain: "Rozbudowana rekrutacja do zadania na kilka godzin",
          fix: "Dodaj zadanie i zasil je raz. Pierwsza zakwalifikowana grupa zajmuje miejsca — bez przeglądania CV.",
        },
        {
          who: "KLIENCI",
          pain: "„Potrafię” bez żadnego potwierdzenia",
          fix: "Trzy testy na czas. Zobacz wyniki i powierz zadanie najszybszemu zakwalifikowanemu specjaliście.",
        },
        {
          who: "SPECJALIŚCI",
          pain: "Odrzucenie lub brak zapłaty po rozpoczęciu pracy",
          fix: "Budżet jest zabezpieczony przed rozpoczęciem pracy, więc wypłata czeka na akceptację zadania.",
        },
        {
          who: "KLIENCI",
          pain: "Realizacja bez niezależnej kontroli",
          fix: "Pierwszy recenzent sprawdza pracę, a audytor weryfikuje recenzję.",
        },
        {
          who: "WSZYSCY",
          pain: "Powolne, transgraniczne mikropłatności",
          fix: "Budżet i podział wypłaty są jasno określone przed rozpoczęciem zadania.",
        },
      ],
    },
    flow: {
      eyebrow: "JAK TO DZIAŁA",
      title: "Od jasnego budżetu do zweryfikowanej wypłaty",
      steps: [
        { title: "Ustal budżet", body: "Wybierz budżet i podział wypłaty" },
        { title: "Sprawdź", body: "Testy umiejętności na czas" },
        { title: "Przydziel", body: "Praca i miejsca weryfikacji" },
        { title: "Zweryfikuj", body: "Niezależna kontrola" },
        { title: "Wypłać", body: "Zwolnij płatność po weryfikacji" },
      ],
      note: "Ten sam test na czas wybiera specjalistę i osoby weryfikujące. Jeśli ktoś zrezygnuje, ponownie obsadzane jest tylko jego miejsce.",
    },
    urgent: {
      eyebrow: "GDY ZBLIŻA SIĘ TERMIN",
      title: "Nie pozwól, by jedno zadanie zatrzymało cały projekt.",
      description:
        "Przekaż Pico jedno lub dwa zadania, które blokują postęp. Znajdź sprawdzonego specjalistę do konkretnej pracy — bez długiej rekrutacji.",
      benefits: [
        "Opisz zadanie i podaj budżet",
        "Sprawdź potwierdzone umiejętności przed wyborem",
        "Zatwierdź pracę przed wypłatą",
      ],
      cta: "Znajdź pomoc do zadania",
      note: "Konkretna praca bez kolejnej długiej rekrutacji.",
      visualLabel: "Przykład konkretnego zlecenia",
      briefLabel: "PILNE ZLECENIE",
      status: "2 konkretne zadania",
      briefTitle: "Co trzeba zrobić?",
      briefSubtitle: "Jasny zakres ułatwia start właściwemu specjaliście.",
      taskOne: "Napraw błędy płatności przed premierą",
      skillOne: "Programowanie",
      taskTwo: "Przetestuj płatność na telefonie i komputerze",
      skillTwo: "Testowanie",
      verifiedLabel: "Umiejętności potwierdzone przed wyborem",
      verifiedDescription: "Wybierz na podstawie sprawdzonych umiejętności.",
    },
    board: {
      titleSearch: "Tytuł zadania lub słowo kluczowe",
      skillSearch: "Specjalizacja",
      search: "Szukaj",
      skillLane: "Specjalizacja",
      all: "Wszystkie",
      codeReview: "Przegląd kodu",
      debugging: "Debugowanie",
      qa: "Testy QA",
      design: "Projektowanie",
      clear: "Wyczyść",
      securedBudget: "Zabezpieczony budżet",
      minimumBudget: "Minimalny budżet",
      maximumBudget: "Maksymalny budżet",
      slots: "Role",
      execution: "Realizacja",
      primary: "Recenzent",
      audit: "Audytor",
      slotDescription: "Wykonawca realizuje zadanie. Recenzent sprawdza pracę, a audytor weryfikuje recenzję.",
      postTask: "Dodaj zadanie",
      openTasks: "Otwarte zadania",
      sortBy: "Sortuj zadania",
      recent: "Najnowsze",
      highestBudget: "Najwyższy budżet",
      lookingToQualify: "zainteresowanych",
      reviewCount: "weryfikacje",
      securedPayment: "Płatność zabezpieczona",
      fixed: "Stała cena",
      enterBoard: "Zobacz zadanie",
      noMatches: "Brak przykładowych zadań dla tych filtrów.",
      postRealTask: "Dodaj prawdziwe zadanie",
      saveTask: "Zapisz zadanie",
      taskAges: ["2 godz. temu", "5 godz. temu", "1 dzień temu", "1 dzień temu", "2 dni temu", "3 dni temu"],
    },
    footer: {
      description:
        "Zweryfikowana praca bez zbędnej rekrutacji — jasne budżety, sprawdzeni specjaliści i niezależna kontrola.",
      app: "Aplikacja",
      post: "Dodaj zadanie",
      clients: "Dla klientów",
      flow: "Jak to działa",
      tagline: "Krótkie zadania. Sprawdzeni specjaliści. Bezpieczne płatności.",
    },
    taskTitles: [
      "Sprawdź uprawnienia dostępu do API",
      "Napraw niestabilny proces logowania",
      "Przetestuj rezerwację i płatność",
      "Popraw układ tabeli w panelu",
      "Sprawdź obliczenia faktur i wypłat",
      "Napraw problem z przesyłaniem plików",
    ],
    taskDescriptions: [
      "Sprawdź uprawnienia i zasady dostępu przed uruchomieniem nowej funkcji.",
      "Ustal, dlaczego użytkownicy są czasem wylogowywani podczas przechodzenia między stronami.",
      "Przetestuj rezerwację i płatność na telefonie i komputerze.",
      "Ułatw odczyt najważniejszych informacji w panelu na urządzeniach mobilnych.",
      "Sprawdź faktury i kwoty wypłat pod kątem błędów obliczeń.",
      "Ustal, dlaczego przesyłanie większych plików kończy się błędem, i zaproponuj poprawkę.",
    ],
  },
  de: {
    languageLabel: "Sprache",
    nav: {
      how: "So funktioniert’s",
      clients: "Für Auftraggeber",
      workers: "Für Fachkräfte",
      signIn: "Anmelden",
      hire: "Auftrag einstellen",
      findWork: "Aufträge finden",
      openMenu: "Navigationsmenü öffnen",
      closeMenu: "Navigationsmenü schließen",
    },
    promo: {
      title: "Steht eine Deadline bevor?",
      body: "Finden Sie schnell qualifizierte Hilfe für die ein oder zwei Aufgaben, die Ihr Projekt aufhalten.",
      link: "So funktioniert’s",
    },
    hero: {
      badge: "Der schnellere Weg zu qualifizierter Arbeit",
      headline: ["Gute Arbeit,", "ohne langes", "Warten."],
      description:
        "Wenn die Deadline näher rückt, stellen Sie die ein oder zwei Aufgaben ein, die Ihr Projekt aufhalten. Pico hilft Ihnen, schnell eine qualifizierte Fachkraft zu finden. Die Zahlung wird erst nach Prüfung der Arbeit freigegeben.",
      postTask: "Auftrag einstellen",
      exploreWork: "Offene Aufträge ansehen",
      proof: ["Zahlung von Anfang an abgesichert", "Fähigkeiten vorab geprüft", "Unabhängige Prüfung"],
    },
    preview: {
      kicker: "SO FUNKTIONIERT PICO",
      headline: ["Kurze Aufgabe.", "Sorgfältig erledigt."],
      caption:
        "Ein klarer Auftrag, eine geprüfte Fachkraft und eine Zahlung nach erfolgreicher Verifizierung.",
      people: ["AUFTRAGGEBER", "FACHKRAFT", "PRÜFUNG"],
      budget: "Auftragsbudget",
      payment: "Zahlung",
      held: "Abgesichert",
      review: "Prüfung",
      steps: "2 Schritte",
      example: "BEISPIELAUFTRAG · QA & TESTS",
      inReview: "In Prüfung",
      taskTitle: "Regressionstest des Bezahlvorgangs",
      taskDescription:
        "Prüfe den Bezahlvorgang auf Mobilgeräten und Desktop vor der Veröffentlichung.",
      submitted: "Arbeit eingereicht",
      primaryReview: "Erste Prüfung",
      auditReview: "Audit-Prüfung",
      passed: "Bestanden",
      inProgress: "In Bearbeitung",
      payout: "Zahlung nach erfolgreicher Prüfung",
      execution: "Umsetzung",
    },
    problem: {
      eyebrow: "WARUM PICO",
      title: "Für Aufgaben, die im Einstellungsprozess stecken bleiben",
      description:
        "Für klar umrissene Projekte, die sofort die passende Fachkraft brauchen – ohne aus wenigen Arbeitsstunden eine Woche Suche zu machen.",
      pico: "Pico:",
      cards: [
        {
          who: "AUFTRAGGEBER",
          pain: "Aufwendige Suche für einen Auftrag über wenige Stunden",
          fix: "Auftrag einstellen und einmal finanzieren. Qualifizierte Personen besetzen die Plätze – ganz ohne Lebenslauf-Suche.",
        },
        {
          who: "AUFTRAGGEBER",
          pain: "„Das kann ich“ ohne Beleg",
          fix: "Drei zeitbegrenzte Tests. Sieh die Ergebnisse und vergib den Auftrag an die schnellste qualifizierte Fachkraft.",
        },
        {
          who: "FACHKRÄFTE",
          pain: "Ablehnung oder keine Zahlung nach Arbeitsbeginn",
          fix: "Das Budget ist vor Arbeitsbeginn abgesichert, damit die Zahlung nach Freigabe der Arbeit bereitsteht.",
        },
        {
          who: "AUFTRAGGEBER",
          pain: "Ein Ergebnis ohne unabhängige Prüfung",
          fix: "Eine erste prüfende Person kontrolliert die Arbeit; ein Auditor prüft diese Bewertung.",
        },
        {
          who: "ALLE",
          pain: "Langsame internationale Kleinstzahlungen",
          fix: "Budget und Auszahlungsanteile werden vor Beginn des Auftrags klar festgelegt.",
        },
      ],
    },
    flow: {
      eyebrow: "DER ABLAUF",
      title: "Vom klaren Budget zur geprüften Auszahlung",
      steps: [
        { title: "Budget festlegen", body: "Budget und Auszahlungsanteile wählen" },
        { title: "Qualifizieren", body: "Zeitbegrenzte Fähigkeitstests" },
        { title: "Zuweisen", body: "Auftrag und Prüfplätze vergeben" },
        { title: "Verifizieren", body: "Unabhängige Prüfung" },
        { title: "Auszahlen", body: "Zahlung nach der Prüfung freigeben" },
      ],
      note: "Derselbe zeitbegrenzte Test wählt die Fachkraft und die Prüfenden aus. Lehnt jemand ab, wird nur dieser Platz neu vergeben.",
    },
    urgent: {
      eyebrow: "WENN DER TERMIN NÄHER RÜCKT",
      title: "Lass nicht zu, dass eine offene Aufgabe das ganze Projekt aufhält.",
      description:
        "Bring die ein oder zwei Aufgaben zu Pico, die den Fortschritt blockieren. Finde eine qualifizierte Fachkraft für gezielte Arbeit – ohne lange Personalsuche.",
      benefits: [
        "Stelle eine klare Aufgabe mit Budget ein",
        "Prüfe nachgewiesene Fähigkeiten vor der Auswahl",
        "Gib die Arbeit frei, bevor die Zahlung erfolgt",
      ],
      cta: "Hilfe für eine Aufgabe finden",
      note: "Gezielte Arbeit statt einer weiteren langen Personalsuche.",
      visualLabel: "Beispiel für einen konkreten Auftrag",
      briefLabel: "PRIORITÄTSAUFTRAG",
      status: "2 konkrete Aufgaben",
      briefTitle: "Was muss erledigt werden?",
      briefSubtitle: "Ein klarer Umfang hilft der passenden Fachkraft beim Start.",
      taskOne: "Fehler im Checkout vor dem Start beheben",
      skillOne: "Entwicklung",
      taskTwo: "Checkout auf Smartphone und Desktop testen",
      skillTwo: "Qualitätssicherung",
      verifiedLabel: "Fähigkeiten vor der Auswahl belegt",
      verifiedDescription: "Wähle anhand nachgewiesener Fähigkeiten.",
    },
    board: {
      titleSearch: "Auftragstitel oder Stichwort",
      skillSearch: "Fachgebiet",
      search: "Suchen",
      skillLane: "Fachgebiet",
      all: "Alle",
      codeReview: "Code-Review",
      debugging: "Fehlersuche",
      qa: "Qualitätssicherung",
      design: "Design",
      clear: "Zurücksetzen",
      securedBudget: "Gesichertes Budget",
      minimumBudget: "Mindestbudget",
      maximumBudget: "Höchstbudget",
      slots: "Rollen",
      execution: "Umsetzung",
      primary: "Erste Prüfung",
      audit: "Audit",
      slotDescription: "Die Umsetzung erledigt den Auftrag. Die erste Prüfung kontrolliert die Arbeit, das Audit diese Prüfung.",
      postTask: "Auftrag einstellen",
      openTasks: "Offene Aufträge",
      sortBy: "Aufträge sortieren",
      recent: "Neueste zuerst",
      highestBudget: "Höchstes Budget",
      lookingToQualify: "interessiert",
      reviewCount: "Prüfungen",
      securedPayment: "Zahlung gesichert",
      fixed: "Festpreis",
      enterBoard: "Auftrag ansehen",
      noMatches: "Keine Beispielaufträge passen zu diesen Filtern.",
      postRealTask: "Echten Auftrag einstellen",
      saveTask: "Auftrag speichern",
      taskAges: ["vor 2 Std.", "vor 5 Std.", "vor 1 Tag", "vor 1 Tag", "vor 2 Tagen", "vor 3 Tagen"],
    },
    footer: {
      description:
        "Geprüfte Arbeit ohne aufwendige Personalsuche – klare Budgets, qualifizierte Fachkräfte und unabhängige Prüfung.",
      app: "App",
      post: "Auftrag einstellen",
      clients: "Für Auftraggeber",
      flow: "So funktioniert’s",
      tagline: "Kurze Aufgaben. Geprüfte Fachkräfte. Sichere Zahlungen.",
    },
    taskTitles: [
      "API-Zugriffsrechte überprüfen",
      "Unzuverlässigen Anmeldeablauf beheben",
      "Buchungs- und Bezahlvorgang testen",
      "Tabellenlayout im Dashboard verbessern",
      "Rechnungs- und Auszahlungsberechnungen prüfen",
      "Fehler beim Datei-Upload beheben",
    ],
    taskDescriptions: [
      "Prüfe Zugriffsrechte und Berechtigungen vor der Veröffentlichung einer neuen Funktion.",
      "Finde heraus, warum Nutzer beim Wechsel zwischen Seiten manchmal abgemeldet werden.",
      "Teste Buchung und Bezahlung auf Smartphone und Desktop.",
      "Stelle die wichtigsten Dashboard-Informationen auf dem Smartphone übersichtlicher dar.",
      "Prüfe Rechnungen und Auszahlungsbeträge auf Rundungs- und Rechenfehler.",
      "Finde heraus, warum große Dateien nicht hochgeladen werden, und schlage eine Lösung vor.",
    ],
  },
  uk: {
    languageLabel: "Мова",
    nav: {
      how: "Як це працює",
      clients: "Для клієнтів",
      workers: "Для фахівців",
      signIn: "Увійти",
      hire: "Створити завдання",
      findWork: "Знайти роботу",
      openMenu: "Відкрити меню навігації",
      closeMenu: "Закрити меню навігації",
    },
    promo: {
      title: "Горять терміни?",
      body: "Знайдіть перевіреного фахівця для 1–2 завдань, що затримують проєкт.",
      link: "Як це працює",
    },
    hero: {
      badge: "Швидший шлях до фахової роботи",
      headline: ["Якісна робота,", "без довгого", "очікування."],
      description:
        "Коли дедлайн наближається, опишіть одне-два завдання, через які стоїть проєкт. Pico допоможе швидко знайти перевіреного фахівця, а оплату буде здійснено після перевірки роботи.",
      postTask: "Створити завдання",
      exploreWork: "Переглянути завдання",
      proof: ["Оплата захищена від початку", "Навички перевірено заздалегідь", "Незалежна перевірка"],
    },
    preview: {
      kicker: "ЯК ПРАЦЮЄ PICO",
      headline: ["Коротке завдання.", "Результат із перевіркою."],
      caption:
        "Чіткий опис, перевірений фахівець і виплата після підтвердження результату.",
      people: ["КЛІЄНТ", "ФАХІВЕЦЬ", "ПЕРЕВІРКА"],
      budget: "Бюджет завдання",
      payment: "Оплата",
      held: "Захищена",
      review: "Перевірка",
      steps: "2 етапи",
      example: "ПРИКЛАД ЗАВДАННЯ · QA І ТЕСТУВАННЯ",
      inReview: "На перевірці",
      taskTitle: "Регресійне тестування оплати",
      taskDescription:
        "Перевірте процес оплати на мобільних пристроях і комп’ютерах перед запуском.",
      submitted: "Роботу надіслано",
      primaryReview: "Основна перевірка",
      auditReview: "Аудит",
      passed: "Пройдено",
      inProgress: "У процесі",
      payout: "Оплата надійде після перевірки",
      execution: "Виконавець",
    },
    problem: {
      eyebrow: "ЧОМУ PICO",
      title: "Для завдань, що застрягають у процесі найму",
      description:
        "Для чітких проєктів, яким потрібен відповідний фахівець уже зараз — без тижня пошуків заради кількох годин роботи.",
      pico: "Pico:",
      cards: [
        {
          who: "КЛІЄНТИ",
          pain: "Довгий найм для завдання на кілька годин",
          fix: "Опублікуйте завдання й заздалегідь визначте бюджет. Перевірені фахівці займуть місця — без перегляду резюме.",
        },
        {
          who: "КЛІЄНТИ",
          pain: "«Я вмію» без жодного підтвердження",
          fix: "Три завдання на час. Перегляньте результати й оберіть найшвидшого фахівця, який пройшов перевірку.",
        },
        {
          who: "ФАХІВЦІ",
          pain: "Відмова або несплата після початку роботи",
          fix: "Бюджет захищено до початку роботи, тож після схвалення завдання оплата буде готова.",
        },
        {
          who: "КЛІЄНТИ",
          pain: "Результат без незалежної перевірки",
          fix: "Основний рецензент перевіряє роботу, а аудитор — саму перевірку.",
        },
        {
          who: "УСІ",
          pain: "Повільні міжнародні мікровиплати",
          fix: "Бюджет і частки виплати чітко визначаються до початку роботи.",
        },
      ],
    },
    flow: {
      eyebrow: "ПРОЦЕС",
      title: "Від чіткого бюджету до перевіреної виплати",
      steps: [
        { title: "Визначити бюджет", body: "Обрати бюджет і частки виплати" },
        { title: "Перевірити", body: "Тестування навичок на час" },
        { title: "Призначити", body: "Виконавця та рецензентів" },
        { title: "Підтвердити", body: "Незалежна перевірка" },
        { title: "Виплатити", body: "Підтвердити оплату після перевірки" },
      ],
      note: "Той самий тест на час відбирає виконавця й рецензентів. Якщо хтось відмовиться, повторно заповнюється лише його місце.",
    },
    urgent: {
      eyebrow: "КОЛИ ДЕДЛАЙН НАБЛИЖАЄТЬСЯ",
      title: "Не дозволь одному завданню загальмувати весь проєкт.",
      description:
        "Передай Pico одне чи два завдання, що блокують роботу. Знайди кваліфікованого фахівця для конкретної задачі — без тривалого найму.",
      benefits: [
        "Опиши завдання та вкажи бюджет",
        "Перевір підтверджені навички перед вибором",
        "Підтвердь роботу до того, як буде здійснено оплату",
      ],
      cta: "Знайти фахівця для завдання",
      note: "Конкретна робота без тривалого процесу найму.",
      visualLabel: "Приклад конкретного завдання",
      briefLabel: "ТЕРМІНОВЕ ЗАВДАННЯ",
      status: "2 конкретні завдання",
      briefTitle: "Що потрібно зробити?",
      briefSubtitle: "Чіткий опис допоможе потрібному фахівцю швидко розпочати.",
      taskOne: "Виправити помилки оплати до запуску",
      skillOne: "Розробка",
      taskTwo: "Перевірити оплату на телефоні й комп’ютері",
      skillTwo: "Тестування",
      verifiedLabel: "Навички підтверджено до вибору",
      verifiedDescription: "Обирай за підтвердженими навичками.",
    },
    board: {
      titleSearch: "Назва завдання або ключове слово",
      skillSearch: "Спеціалізація",
      search: "Шукати",
      skillLane: "Спеціалізація",
      all: "Усі",
      codeReview: "Перевірка коду",
      debugging: "Налагодження",
      qa: "Тестування",
      design: "Дизайн",
      clear: "Очистити",
      securedBudget: "Захищений бюджет",
      minimumBudget: "Мінімальний бюджет",
      maximumBudget: "Максимальний бюджет",
      slots: "Ролі",
      execution: "Виконавець",
      primary: "Рецензент",
      audit: "Аудитор",
      slotDescription: "Виконавець виконує роботу. Рецензент її перевіряє, а аудитор перевіряє рецензію.",
      postTask: "Створити завдання",
      openTasks: "Відкриті завдання",
      sortBy: "Сортувати завдання",
      recent: "Найновіші",
      highestBudget: "Найбільший бюджет",
      lookingToQualify: "зацікавлених",
      reviewCount: "перевірки",
      securedPayment: "Оплату захищено",
      fixed: "Фіксована ціна",
      enterBoard: "Переглянути завдання",
      noMatches: "За цими фільтрами немає прикладів завдань.",
      postRealTask: "Створити справжнє завдання",
      saveTask: "Зберегти завдання",
      taskAges: ["2 год тому", "5 год тому", "1 день тому", "1 день тому", "2 дні тому", "3 дні тому"],
    },
    footer: {
      description:
        "Перевірена робота без зайвого найму — чіткі бюджети, кваліфіковані фахівці й незалежна перевірка.",
      app: "Застосунок",
      post: "Створити завдання",
      clients: "Для клієнтів",
      flow: "Як це працює",
      tagline: "Короткі завдання. Перевірені фахівці. Захищені виплати.",
    },
    taskTitles: [
      "Перевірити права доступу до API",
      "Виправити нестабільний вхід до системи",
      "Перевірити процес бронювання й оплати",
      "Покращити таблицю на панелі керування",
      "Перевірити розрахунки рахунків і виплат",
      "Виправити помилку завантаження файлів",
    ],
    taskDescriptions: [
      "Перевірити права й правила доступу перед запуском нової функції.",
      "З’ясувати, чому користувачі іноді виходять із системи під час переходу між сторінками.",
      "Перевірити процес бронювання й оплати на телефоні та комп’ютері.",
      "Зробити найважливішу інформацію на панелі зручнішою для перегляду з телефона.",
      "Перевірити рахунки й суми виплат на помилки в розрахунках.",
      "З’ясувати, чому не завантажуються великі файли, і запропонувати виправлення.",
    ],
  },
};

export type HeroMode = "hire" | "work";

type HeroModeCopy = {
  /** [before accent, accent word, after accent] — keep both modes about the same length */
  headline: [string, string, string];
  subtitle: string;
  placeholder: string;
  inputLabel: string;
  cta: string;
  suggestions: [string, string, string, string];
};

type HeroCopy = {
  modeLabel: string;
  hire: string;
  work: string;
  popular: string;
  modes: Record<HeroMode, HeroModeCopy>;
};

export const HERO_COPY: Record<LandingLanguage, HeroCopy> = {
  en: {
    modeLabel: "What do you want to do?",
    hire: "Hire",
    work: "Work",
    popular: "Popular:",
    modes: {
      hire: {
        headline: ["", "Hire", " fast. Get it done."],
        subtitle: "Deadline close? Get a verified specialist for 1–2 tasks, fast.",
        placeholder: "What do you need done?",
        inputLabel: "Describe your task",
        cta: "Post a task",
        suggestions: ["Fix a bug", "Code review", "QA testing", "API integration"],
      },
      work: {
        headline: ["", "Work", " smart. Earn faster."],
        subtitle: "Take short paid tasks that match your verified skills.",
        placeholder: "What can you do? React, Node.js, QA…",
        inputLabel: "Your skills",
        cta: "Find work",
        suggestions: ["React", "Node.js", "QA testing", "Code review"],
      },
    },
  },
  es: {
    modeLabel: "¿Qué quieres hacer?",
    hire: "Contratar",
    work: "Trabajar",
    popular: "Populares:",
    modes: {
      hire: {
        headline: ["", "Contrata", " ya. Hecho hoy."],
        subtitle: "¿Plazo encima? Un especialista verificado para 1–2 tareas, rápido.",
        placeholder: "¿Qué necesitas resolver?",
        inputLabel: "Describe tu tarea",
        cta: "Publicar tarea",
        suggestions: ["Corregir un error", "Revisión de código", "Pruebas QA", "Integración de API"],
      },
      work: {
        headline: ["", "Trabaja", " mejor. Cobra ya."],
        subtitle: "Toma tareas cortas y pagadas según tus habilidades verificadas.",
        placeholder: "¿Qué sabes hacer? React, Node.js, QA…",
        inputLabel: "Tus habilidades",
        cta: "Buscar trabajo",
        suggestions: ["React", "Node.js", "Pruebas QA", "Revisión de código"],
      },
    },
  },
  pl: {
    modeLabel: "Co chcesz zrobić?",
    hire: "Zlecaj",
    work: "Pracuj",
    popular: "Popularne:",
    modes: {
      hire: {
        headline: ["", "Zlecaj", " szybko. Gotowe."],
        subtitle: "Termin goni? Zweryfikowany specjalista do 1–2 zadań, szybko.",
        placeholder: "Co trzeba zrobić?",
        inputLabel: "Opisz zadanie",
        cta: "Opublikuj zadanie",
        suggestions: ["Naprawa błędu", "Code review", "Testy QA", "Integracja API"],
      },
      work: {
        headline: ["", "Pracuj", " mądrze. Zarabiaj."],
        subtitle: "Bierz krótkie płatne zadania pasujące do Twoich umiejętności.",
        placeholder: "Co potrafisz? React, Node.js, QA…",
        inputLabel: "Twoje umiejętności",
        cta: "Znajdź pracę",
        suggestions: ["React", "Node.js", "Testy QA", "Code review"],
      },
    },
  },
  de: {
    modeLabel: "Was möchtest du tun?",
    hire: "Beauftragen",
    work: "Arbeiten",
    popular: "Beliebt:",
    modes: {
      hire: {
        headline: ["", "Beauftragen.", " Erledigt."],
        subtitle: "Deadline naht? Ein verifizierter Profi für 1–2 Aufgaben, schnell.",
        placeholder: "Was soll erledigt werden?",
        inputLabel: "Beschreibe deine Aufgabe",
        cta: "Aufgabe posten",
        suggestions: ["Bug beheben", "Code-Review", "QA-Tests", "API-Integration"],
      },
      work: {
        headline: ["", "Arbeiten.", " Gut verdienen."],
        subtitle: "Übernimm kurze bezahlte Aufgaben passend zu deinen Skills.",
        placeholder: "Was kannst du? React, Node.js, QA…",
        inputLabel: "Deine Fähigkeiten",
        cta: "Arbeit finden",
        suggestions: ["React", "Node.js", "QA-Tests", "Code-Review"],
      },
    },
  },
  uk: {
    modeLabel: "Що ви хочете зробити?",
    hire: "Найняти",
    work: "Працювати",
    popular: "Популярне:",
    modes: {
      hire: {
        headline: ["", "Наймай", " швидко. Готово."],
        subtitle: "Горить дедлайн? Перевірений фахівець для 1–2 задач, швидко.",
        placeholder: "Що потрібно зробити?",
        inputLabel: "Опишіть задачу",
        cta: "Опублікувати задачу",
        suggestions: ["Виправити баг", "Код-рев'ю", "QA-тестування", "Інтеграція API"],
      },
      work: {
        headline: ["", "Працюй", " розумно. Заробляй."],
        subtitle: "Беріть короткі оплачувані задачі під свої перевірені навички.",
        placeholder: "Що ви вмієте? React, Node.js, QA…",
        inputLabel: "Ваші навички",
        cta: "Знайти роботу",
        suggestions: ["React", "Node.js", "QA-тестування", "Код-рев'ю"],
      },
    },
  },
};
