import type { LandingLanguage } from "@/components/landingTranslations";

type Step = { title: string; body: string };
type PayState = { label: string; title: string; body: string };

export type SectionsCopy = {
  explore: {
    kicker: string;
    title: [string, string, string];
    lead: string;
    viewAll: string;
    example: string;
    budget: string;
    deadlines: [string, string, string, string];
  };
  how: {
    kicker: string;
    title: [string, string, string];
    modeLabel: string;
    client: string;
    worker: string;
    step: string;
    example: string;
    steps: { client: Step[]; worker: Step[] };
    status: { client: string[]; worker: string[] };
    rows: [string, string, string, string, string];
  };
  why: {
    kicker: string;
    title: [string, string];
    oldLabel: string;
    picoLabel: string;
    old: [string, string, string, string];
    pico: [string, string, string, string];
    oldTag: string;
    picoTag: string;
    proposal: string;
  };
  pay: {
    kicker: string;
    title: [string, string];
    amountLabel: string;
    network: string;
    states: [PayState, PayState, PayState];
  };
  faq: {
    kicker: string;
    title: string;
    items: { q: string; a: string }[];
  };
  cta: {
    title: [string, string, string];
    post: string;
    find: string;
    note: string;
  };
};

export const SECTIONS_COPY: Record<LandingLanguage, SectionsCopy> = {
  en: {
    explore: {
      kicker: "Explore tasks",
      title: ["Find your next ", "task", "."],
      lead: "Short paid tasks. The budget is locked before work starts.",
      viewAll: "View all tasks",
      example: "Example tasks",
      budget: "Budget",
      deadlines: ["Due in 24h", "Due in 48h", "Due in 24h", "Due in 3 days"],
    },
    how: {
      kicker: "How it works",
      title: ["From task to ", "done", "."],
      modeLabel: "Show steps for",
      client: "Client",
      worker: "Worker",
      step: "Step",
      example: "Example task",
      steps: {
        client: [
          { title: "Create", body: "Describe the task, the skills it needs and the deadline." },
          { title: "Fund", body: "Set the budget. It is locked before anyone starts." },
          { title: "Qualify", body: "Specialists pass a short timed skill test." },
          { title: "Work", body: "The first qualified specialist takes the task." },
          { title: "Verify", body: "A reviewer matched to your task checks the work. An auditor checks the review." },
          { title: "Pay", body: "Payment is released with a transaction proof." },
        ],
        worker: [
          { title: "Find", body: "Pick a task in your skill area. The budget is already locked." },
          { title: "Qualify", body: "Pass a short timed test to prove your skills." },
          { title: "Work", body: "Get the task and do the work." },
          { title: "Submit", body: "Send the result against the brief." },
          { title: "Review", body: "Independent reviewers check your result." },
          { title: "Get paid", body: "Payment arrives with a transaction proof." },
        ],
      },
      status: {
        client: ["Draft", "Budget locked", "Qualifying", "In progress", "In review", "Paid"],
        worker: ["Open", "Qualifying", "In progress", "Submitted", "In review", "Paid"],
      },
      rows: ["Budget locked", "Qualification test", "Work submitted", "Review · primary + audit", "Payment released"],
    },
    why: {
      kicker: "Why Pico",
      title: ["Less searching. ", "More doing."],
      oldLabel: "The old way",
      picoLabel: "The Pico way",
      old: ["Write a long job post", "Sort through dozens of proposals", "Interview and negotiate", "Hope the work holds up"],
      pico: ["Post one clear task", "Skills tested before work starts", "Budget locked up front", "Work reviewed before payout"],
      oldTag: "Waiting for replies…",
      picoTag: "Specialist assigned",
      proposal: "Proposal",
    },
    pay: {
      kicker: "Secure payments",
      title: ["Your money. ", "Protected."],
      amountLabel: "Task budget",
      network: "USDC on Solana",
      states: [
        { label: "Locked", title: "Budget locked", body: "The budget is locked when the task goes live. Specialists can see the money is there." },
        { label: "Verified", title: "Work verified", body: "A reviewer and an auditor check the result against the brief." },
        { label: "Released", title: "Payment released", body: "The specialist is paid, with a transaction proof anyone can check." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Good questions.",
      items: [
        { q: "What kind of tasks fit Pico?", a: "Short, focused development work with a clear result: debugging, code review, QA. We start with developers — design tasks are coming soon." },
        { q: "How is the specialist chosen?", a: "Specialists pass a short timed skill test. The first qualified specialist gets the task — no CV browsing." },
        { q: "When is my money charged?", a: "The budget is locked when you publish the task and released only after the work passes review." },
        { q: "Who checks the work?", a: "A separate reviewer, matched by Pico to your task, checks the result against your brief. An auditor checks that review." },
        { q: "Do I need to understand crypto?", a: "Not really. Payments run in USDC on Solana, and in Pico you see the budget, your balance and a proof for every payment." },
      ],
    },
    cta: {
      title: ["Your next task ", "starts here", "."],
      post: "Post a task",
      find: "Find work",
      note: "Budget locked up front. Work reviewed before payout.",
    },
  },

  es: {
    explore: {
      kicker: "Explorar tareas",
      title: ["Encuentra tu próxima ", "tarea", "."],
      lead: "Tareas cortas y pagadas. El presupuesto se bloquea antes de empezar.",
      viewAll: "Ver todas las tareas",
      example: "Tareas de ejemplo",
      budget: "Presupuesto",
      deadlines: ["Plazo: 24 h", "Plazo: 48 h", "Plazo: 24 h", "Plazo: 3 días"],
    },
    how: {
      kicker: "Cómo funciona",
      title: ["De la tarea al ", "resultado", "."],
      modeLabel: "Ver pasos para",
      client: "Cliente",
      worker: "Especialista",
      step: "Paso",
      example: "Tarea de ejemplo",
      steps: {
        client: [
          { title: "Crear", body: "Describe la tarea, las habilidades necesarias y el plazo." },
          { title: "Financiar", body: "Fija el presupuesto. Se bloquea antes de que nadie empiece." },
          { title: "Calificar", body: "Los especialistas pasan una prueba corta con tiempo." },
          { title: "Trabajar", body: "El primer especialista calificado toma la tarea." },
          { title: "Verificar", body: "Un revisor elegido para tu tarea comprueba el trabajo. Un auditor comprueba la revisión." },
          { title: "Pagar", body: "El pago se libera con prueba de transacción." },
        ],
        worker: [
          { title: "Encontrar", body: "Elige una tarea de tu área. El presupuesto ya está bloqueado." },
          { title: "Calificar", body: "Supera una prueba corta con tiempo para demostrar tus habilidades." },
          { title: "Trabajar", body: "Recibe la tarea y haz el trabajo." },
          { title: "Entregar", body: "Envía el resultado según el brief." },
          { title: "Revisión", body: "Revisores independientes comprueban tu resultado." },
          { title: "Cobrar", body: "El pago llega con prueba de transacción." },
        ],
      },
      status: {
        client: ["Borrador", "Presupuesto bloqueado", "Calificación", "En curso", "En revisión", "Pagado"],
        worker: ["Abierta", "Calificación", "En curso", "Entregada", "En revisión", "Pagado"],
      },
      rows: ["Presupuesto bloqueado", "Prueba de calificación", "Trabajo entregado", "Revisión · principal + auditoría", "Pago liberado"],
    },
    why: {
      kicker: "Por qué Pico",
      title: ["Menos buscar. ", "Más hacer."],
      oldLabel: "A la antigua",
      picoLabel: "Con Pico",
      old: ["Escribir una oferta larga", "Revisar decenas de propuestas", "Entrevistar y negociar", "Esperar que salga bien"],
      pico: ["Publica una tarea clara", "Habilidades probadas antes de empezar", "Presupuesto bloqueado por adelantado", "Trabajo revisado antes del pago"],
      oldTag: "Esperando respuestas…",
      picoTag: "Especialista asignado",
      proposal: "Propuesta",
    },
    pay: {
      kicker: "Pagos seguros",
      title: ["Tu dinero. ", "Protegido."],
      amountLabel: "Presupuesto de la tarea",
      network: "USDC en Solana",
      states: [
        { label: "Bloqueado", title: "Presupuesto bloqueado", body: "El presupuesto se bloquea al publicar la tarea. Los especialistas ven que el dinero está ahí." },
        { label: "Verificado", title: "Trabajo verificado", body: "Un revisor y un auditor comprueban el resultado según el brief." },
        { label: "Liberado", title: "Pago liberado", body: "El especialista cobra, con una prueba de transacción verificable." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Buenas preguntas.",
      items: [
        { q: "¿Qué tareas encajan en Pico?", a: "Trabajo de desarrollo corto y concreto con un resultado claro: depuración, code review, QA. Empezamos con desarrolladores; las tareas de diseño llegarán pronto." },
        { q: "¿Cómo se elige al especialista?", a: "Los especialistas pasan una prueba corta con tiempo. El primero que califica recibe la tarea, sin revisar CVs." },
        { q: "¿Cuándo se cobra mi dinero?", a: "El presupuesto se bloquea al publicar la tarea y se libera solo cuando el trabajo supera la revisión." },
        { q: "¿Quién revisa el trabajo?", a: "Un revisor independiente, elegido por Pico según tu tarea, compara el resultado con tu brief. Un auditor comprueba esa revisión." },
        { q: "¿Necesito entender de cripto?", a: "No mucho. Los pagos van en USDC sobre Solana, y en Pico ves el presupuesto, tu saldo y una prueba de cada pago." },
      ],
    },
    cta: {
      title: ["Tu próxima tarea ", "empieza aquí", "."],
      post: "Publicar tarea",
      find: "Buscar trabajo",
      note: "Presupuesto bloqueado por adelantado. Trabajo revisado antes del pago.",
    },
  },

  pl: {
    explore: {
      kicker: "Zlecenia",
      title: ["Znajdź kolejne ", "zlecenie", "."],
      lead: "Krótkie, płatne zadania. Budżet jest zablokowany, zanim zaczniesz.",
      viewAll: "Wszystkie zlecenia",
      example: "Przykładowe zlecenia",
      budget: "Budżet",
      deadlines: ["Termin: 24 h", "Termin: 48 h", "Termin: 24 h", "Termin: 3 dni"],
    },
    how: {
      kicker: "Jak to działa",
      title: ["Od zadania do ", "efektu", "."],
      modeLabel: "Pokaż kroki dla",
      client: "Klient",
      worker: "Wykonawca",
      step: "Krok",
      example: "Przykładowe zadanie",
      steps: {
        client: [
          { title: "Utwórz", body: "Opisz zadanie, potrzebne umiejętności i termin." },
          { title: "Zasil", body: "Ustal budżet. Zostaje zablokowany, zanim ktokolwiek zacznie." },
          { title: "Weryfikacja", body: "Specjaliści przechodzą krótki test na czas." },
          { title: "Praca", body: "Pierwszy zakwalifikowany specjalista bierze zadanie." },
          { title: "Sprawdzenie", body: "Recenzent dobrany do zadania sprawdza pracę. Audytor sprawdza recenzję." },
          { title: "Wypłata", body: "Płatność zostaje zwolniona z potwierdzeniem transakcji." },
        ],
        worker: [
          { title: "Znajdź", body: "Wybierz zadanie ze swojej dziedziny. Budżet jest już zablokowany." },
          { title: "Weryfikacja", body: "Zdaj krótki test na czas i pokaż, co umiesz." },
          { title: "Praca", body: "Otrzymaj zadanie i wykonaj je." },
          { title: "Oddaj", body: "Wyślij wynik zgodny z briefem." },
          { title: "Recenzja", body: "Niezależni recenzenci sprawdzają wynik." },
          { title: "Wypłata", body: "Płatność przychodzi z potwierdzeniem transakcji." },
        ],
      },
      status: {
        client: ["Szkic", "Budżet zablokowany", "Weryfikacja", "W trakcie", "W recenzji", "Opłacone"],
        worker: ["Otwarte", "Weryfikacja", "W trakcie", "Oddane", "W recenzji", "Opłacone"],
      },
      rows: ["Budżet zablokowany", "Test kwalifikacyjny", "Praca oddana", "Recenzja · główna + audyt", "Płatność zwolniona"],
    },
    why: {
      kicker: "Dlaczego Pico",
      title: ["Mniej szukania. ", "Więcej działania."],
      oldLabel: "Po staremu",
      picoLabel: "Z Pico",
      old: ["Długie ogłoszenie", "Dziesiątki ofert do przejrzenia", "Rozmowy i negocjacje", "Nadzieja, że się uda"],
      pico: ["Jedno jasne zadanie", "Umiejętności sprawdzone przed startem", "Budżet zablokowany z góry", "Praca sprawdzona przed wypłatą"],
      oldTag: "Czekamy na odpowiedzi…",
      picoTag: "Specjalista przypisany",
      proposal: "Oferta",
    },
    pay: {
      kicker: "Bezpieczne płatności",
      title: ["Twoje pieniądze. ", "Chronione."],
      amountLabel: "Budżet zadania",
      network: "USDC w sieci Solana",
      states: [
        { label: "Zablokowane", title: "Budżet zablokowany", body: "Budżet zostaje zablokowany w chwili publikacji. Specjaliści widzą, że pieniądze są na miejscu." },
        { label: "Sprawdzone", title: "Praca sprawdzona", body: "Recenzent i audytor porównują wynik z briefem." },
        { label: "Wypłacone", title: "Płatność zwolniona", body: "Specjalista dostaje wypłatę z potwierdzeniem transakcji, które każdy może sprawdzić." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Dobre pytania.",
      items: [
        { q: "Jakie zadania pasują do Pico?", a: "Krótka, konkretna praca developerska z jasnym efektem: debugowanie, code review, QA. Zaczynamy od developerów — zadania designerskie już wkrótce." },
        { q: "Jak wybierany jest specjalista?", a: "Specjaliści przechodzą krótki test na czas. Zadanie dostaje pierwszy zakwalifikowany — bez przeglądania CV." },
        { q: "Kiedy pobierane są moje pieniądze?", a: "Budżet zostaje zablokowany przy publikacji i zwolniony dopiero, gdy praca przejdzie recenzję." },
        { q: "Kto sprawdza pracę?", a: "Osobny recenzent, dobrany przez Pico do Twojego zadania, porównuje wynik z briefem. Audytor sprawdza tę recenzję." },
        { q: "Czy muszę znać się na krypto?", a: "Niekoniecznie. Płatności idą w USDC w sieci Solana, a w Pico widzisz budżet, saldo i potwierdzenie każdej płatności." },
      ],
    },
    cta: {
      title: ["Twoje kolejne zadanie ", "zaczyna się tu", "."],
      post: "Opublikuj zadanie",
      find: "Znajdź zlecenie",
      note: "Budżet zablokowany z góry. Praca sprawdzona przed wypłatą.",
    },
  },

  de: {
    explore: {
      kicker: "Aufgaben entdecken",
      title: ["Finde deine nächste ", "Aufgabe", "."],
      lead: "Kurze, bezahlte Aufgaben. Das Budget ist vor dem Start gesperrt.",
      viewAll: "Alle Aufgaben",
      example: "Beispielaufgaben",
      budget: "Budget",
      deadlines: ["Frist: 24 Std.", "Frist: 48 Std.", "Frist: 24 Std.", "Frist: 3 Tage"],
    },
    how: {
      kicker: "So funktioniert’s",
      title: ["Von der Aufgabe zum ", "Ergebnis", "."],
      modeLabel: "Schritte zeigen für",
      client: "Auftraggeber",
      worker: "Fachkraft",
      step: "Schritt",
      example: "Beispielaufgabe",
      steps: {
        client: [
          { title: "Erstellen", body: "Beschreibe Aufgabe, benötigte Skills und Frist." },
          { title: "Finanzieren", body: "Lege das Budget fest. Es wird gesperrt, bevor jemand startet." },
          { title: "Qualifizieren", body: "Fachkräfte absolvieren einen kurzen, zeitlich begrenzten Test." },
          { title: "Arbeiten", body: "Die erste qualifizierte Fachkraft übernimmt die Aufgabe." },
          { title: "Prüfen", body: "Ein passender Reviewer prüft die Arbeit. Ein Auditor prüft das Review." },
          { title: "Bezahlen", body: "Die Zahlung wird mit Transaktionsnachweis freigegeben." },
        ],
        worker: [
          { title: "Finden", body: "Wähle eine Aufgabe aus deinem Bereich. Das Budget ist schon gesperrt." },
          { title: "Qualifizieren", body: "Bestehe einen kurzen Test und zeige deine Skills." },
          { title: "Arbeiten", body: "Übernimm die Aufgabe und erledige sie." },
          { title: "Abgeben", body: "Reiche das Ergebnis passend zum Briefing ein." },
          { title: "Review", body: "Unabhängige Reviewer prüfen dein Ergebnis." },
          { title: "Bezahlt werden", body: "Die Zahlung kommt mit Transaktionsnachweis." },
        ],
      },
      status: {
        client: ["Entwurf", "Budget gesperrt", "Qualifizierung", "In Arbeit", "Im Review", "Bezahlt"],
        worker: ["Offen", "Qualifizierung", "In Arbeit", "Abgegeben", "Im Review", "Bezahlt"],
      },
      rows: ["Budget gesperrt", "Qualifizierungstest", "Arbeit abgegeben", "Review · Haupt + Audit", "Zahlung freigegeben"],
    },
    why: {
      kicker: "Warum Pico",
      title: ["Weniger suchen. ", "Mehr erledigen."],
      oldLabel: "Der alte Weg",
      picoLabel: "Der Pico-Weg",
      old: ["Lange Stellenanzeige schreiben", "Dutzende Angebote sichten", "Gespräche und Verhandlungen", "Hoffen, dass es passt"],
      pico: ["Eine klare Aufgabe posten", "Skills vor dem Start geprüft", "Budget im Voraus gesperrt", "Arbeit vor der Auszahlung geprüft"],
      oldTag: "Warte auf Antworten…",
      picoTag: "Fachkraft zugewiesen",
      proposal: "Angebot",
    },
    pay: {
      kicker: "Sichere Zahlungen",
      title: ["Dein Geld. ", "Geschützt."],
      amountLabel: "Aufgabenbudget",
      network: "USDC auf Solana",
      states: [
        { label: "Gesperrt", title: "Budget gesperrt", body: "Das Budget wird gesperrt, sobald die Aufgabe live ist. Fachkräfte sehen, dass das Geld da ist." },
        { label: "Geprüft", title: "Arbeit geprüft", body: "Ein Reviewer und ein Auditor prüfen das Ergebnis gegen das Briefing." },
        { label: "Freigegeben", title: "Zahlung freigegeben", body: "Die Fachkraft wird bezahlt – mit einem Transaktionsnachweis, den jeder prüfen kann." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Gute Fragen.",
      items: [
        { q: "Welche Aufgaben passen zu Pico?", a: "Kurze, klar umrissene Entwicklungsarbeit: Debugging, Code-Review, QA. Wir starten mit Entwicklern – Design-Aufgaben folgen bald." },
        { q: "Wie wird die Fachkraft ausgewählt?", a: "Fachkräfte absolvieren einen kurzen, zeitlich begrenzten Test. Die erste qualifizierte bekommt die Aufgabe – ohne Lebensläufe zu sichten." },
        { q: "Wann wird mein Geld belastet?", a: "Das Budget wird beim Veröffentlichen gesperrt und erst freigegeben, wenn die Arbeit das Review besteht." },
        { q: "Wer prüft die Arbeit?", a: "Ein separater Reviewer, von Pico passend zu deiner Aufgabe ausgewählt, prüft das Ergebnis gegen dein Briefing. Ein Auditor prüft dieses Review." },
        { q: "Muss ich mich mit Krypto auskennen?", a: "Kaum. Zahlungen laufen in USDC auf Solana, und in Pico siehst du Budget, Guthaben und einen Nachweis für jede Zahlung." },
      ],
    },
    cta: {
      title: ["Deine nächste Aufgabe ", "startet hier", "."],
      post: "Aufgabe posten",
      find: "Arbeit finden",
      note: "Budget im Voraus gesperrt. Arbeit vor der Auszahlung geprüft.",
    },
  },

  uk: {
    explore: {
      kicker: "Завдання",
      title: ["Знайди наступне ", "завдання", "."],
      lead: "Короткі оплачувані задачі. Бюджет заблоковано ще до початку роботи.",
      viewAll: "Усі завдання",
      example: "Приклади завдань",
      budget: "Бюджет",
      deadlines: ["Термін: 24 год", "Термін: 48 год", "Термін: 24 год", "Термін: 3 дні"],
    },
    how: {
      kicker: "Як це працює",
      title: ["Від задачі до ", "результату", "."],
      modeLabel: "Показати кроки для",
      client: "Клієнт",
      worker: "Виконавець",
      step: "Крок",
      example: "Приклад задачі",
      steps: {
        client: [
          { title: "Створи", body: "Опиши задачу, потрібні навички та термін." },
          { title: "Профінансуй", body: "Вкажи бюджет. Його блокують до того, як хтось почне." },
          { title: "Кваліфікація", body: "Фахівці проходять короткий тест на час." },
          { title: "Робота", body: "Перший кваліфікований фахівець бере задачу." },
          { title: "Перевірка", body: "Рев’юер, підібраний під задачу, перевіряє роботу. Аудитор перевіряє рев’ю." },
          { title: "Оплата", body: "Оплату розблоковують разом із доказом транзакції." },
        ],
        worker: [
          { title: "Знайди", body: "Обери задачу у своїй сфері. Бюджет уже заблоковано." },
          { title: "Кваліфікація", body: "Пройди короткий тест на час і покажи навички." },
          { title: "Робота", body: "Отримай задачу й виконай її." },
          { title: "Здай", body: "Надішли результат відповідно до брифу." },
          { title: "Рев’ю", body: "Незалежні рев’юери перевіряють результат." },
          { title: "Отримай оплату", body: "Оплата надходить разом із доказом транзакції." },
        ],
      },
      status: {
        client: ["Чернетка", "Бюджет заблоковано", "Кваліфікація", "У роботі", "На перевірці", "Оплачено"],
        worker: ["Відкрито", "Кваліфікація", "У роботі", "Здано", "На перевірці", "Оплачено"],
      },
      rows: ["Бюджет заблоковано", "Кваліфікаційний тест", "Роботу здано", "Рев’ю · основне + аудит", "Оплату розблоковано"],
    },
    why: {
      kicker: "Чому Pico",
      title: ["Менше пошуків. ", "Більше справ."],
      oldLabel: "Як було",
      picoLabel: "Як у Pico",
      old: ["Довга вакансія", "Десятки відгуків на розгляд", "Співбесіди й переговори", "Надія, що все вийде"],
      pico: ["Одна зрозуміла задача", "Навички перевірено до старту", "Бюджет заблоковано наперед", "Роботу перевірено до виплати"],
      oldTag: "Чекаємо на відповіді…",
      picoTag: "Фахівця призначено",
      proposal: "Відгук",
    },
    pay: {
      kicker: "Безпечні платежі",
      title: ["Твої гроші. ", "Захищені."],
      amountLabel: "Бюджет задачі",
      network: "USDC у Solana",
      states: [
        { label: "Заблоковано", title: "Бюджет заблоковано", body: "Бюджет блокують у момент публікації. Фахівці бачать, що гроші на місці." },
        { label: "Перевірено", title: "Роботу перевірено", body: "Рев’юер і аудитор звіряють результат із брифом." },
        { label: "Виплачено", title: "Оплату розблоковано", body: "Фахівець отримує оплату з доказом транзакції, який може перевірити будь-хто." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Слушні питання.",
      items: [
        { q: "Які задачі підходять для Pico?", a: "Коротка конкретна робота з розробки з чітким результатом: дебаг, code review, QA. Починаємо з розробників — задачі для дизайнерів скоро." },
        { q: "Як обирають фахівця?", a: "Фахівці проходять короткий тест на час. Задачу отримує перший кваліфікований — без перегляду резюме." },
        { q: "Коли списуються мої гроші?", a: "Бюджет блокують під час публікації й розблоковують лише після того, як робота пройде перевірку." },
        { q: "Хто перевіряє роботу?", a: "Окремий рев’юер, якого Pico підбирає під твою задачу, звіряє результат із брифом. Аудитор перевіряє це рев’ю." },
        { q: "Чи треба розумітися на крипті?", a: "Не обов’язково. Платежі йдуть в USDC у мережі Solana, а в Pico ти бачиш бюджет, баланс і доказ кожної оплати." },
      ],
    },
    cta: {
      title: ["Твоє наступне завдання ", "починається тут", "."],
      post: "Опублікувати задачу",
      find: "Знайти роботу",
      note: "Бюджет заблоковано наперед. Роботу перевірено до виплати.",
    },
  },
};

export type ExtraCopy = {
  helpTitle: string;
  helpCta: string;
  product: string;
  account: string;
  company: string;
  balance: string;
  activity: string;
  settings: string;
  about: string;
  helpCenter: string;
  rights: string;
};

export const EXTRA_COPY: Record<LandingLanguage, ExtraCopy> = {
  en: { helpTitle: "Still have a question?", helpCta: "Open help center", product: "Product", account: "Account", company: "Pico", balance: "Balance", activity: "Activity", settings: "Settings", about: "About", helpCenter: "Help center", rights: "All rights reserved." },
  es: { helpTitle: "¿Te queda alguna duda?", helpCta: "Abrir centro de ayuda", product: "Producto", account: "Cuenta", company: "Pico", balance: "Saldo", activity: "Actividad", settings: "Ajustes", about: "Acerca de", helpCenter: "Centro de ayuda", rights: "Todos los derechos reservados." },
  pl: { helpTitle: "Masz jeszcze pytanie?", helpCta: "Otwórz centrum pomocy", product: "Produkt", account: "Konto", company: "Pico", balance: "Saldo", activity: "Aktywność", settings: "Ustawienia", about: "O nas", helpCenter: "Centrum pomocy", rights: "Wszelkie prawa zastrzeżone." },
  de: { helpTitle: "Noch Fragen?", helpCta: "Hilfe-Center öffnen", product: "Produkt", account: "Konto", company: "Pico", balance: "Guthaben", activity: "Aktivität", settings: "Einstellungen", about: "Über uns", helpCenter: "Hilfe-Center", rights: "Alle Rechte vorbehalten." },
  uk: { helpTitle: "Залишилися питання?", helpCta: "Відкрити центр допомоги", product: "Продукт", account: "Акаунт", company: "Pico", balance: "Баланс", activity: "Активність", settings: "Налаштування", about: "Про нас", helpCenter: "Центр допомоги", rights: "Усі права захищено." },
};

/* ------------------------------------------------------------------
   Pre-launch waitlist copy (hero CTA, nav, waitlist form, footer).
   ------------------------------------------------------------------ */
export type WaitlistCopy = {
  badge: string;
  navFaq: string;
  navJoin: string;
  heroCta: string;
  tasksCta: string;
  lead: string;
  roleLabel: string;
  hire: string;
  work: string;
  email: string;
  emailPlaceholder: string;
  interestHire: string;
  interestHirePh: string;
  interestWork: string;
  interestWorkPh: string;
  optional: string;
  consent: string;
  submit: string;
  submitting: string;
  errEmail: string;
  errConsent: string;
  errServer: string;
  duplicate: string;
  successTitle: string;
  successBody: string;
  successHire: string;
  successWork: string;
  again: string;
  privacy: string;
  faqLaunchQ: string;
  faqLaunchA: string;
  readyTitle: string;
  footerEarly: string;
  footerTasks: string;
  securedOn: string;
  formSub: string;
  hireSub: string;
  workSub: string;
  nextTitle: string;
  next: [string, string, string];
  editAnswer: string;
  emailStep: string;
  focusNow: string;
  focusSoon: string;
  soonTag: string;
  faqPriceQ: string;
  faqPriceA: string;
  whyOldW: [string, string, string, string];
  whyPicoW: [string, string, string, string];
  whyOldTagW: string;
  whyProposalW: string;
  whyPicoTagW: string;
  gotIt: string;
  close: string;
  dupTitle: string;
  dupBody: string;
  nextTitles: [string, string, string];
  nextDescs: [string, string, string];
  readySub: string;
};

export const WAITLIST_COPY: Record<LandingLanguage, WaitlistCopy> = {
  en: {
    badge: "Early access · Launching soon",
    navFaq: "FAQ",
    navJoin: "Join waitlist",
    heroCta: "Join the waitlist",
    tasksCta: "Join the waitlist to post or take tasks",
    lead: "Pico opens soon. Join the waitlist to get early access as a client or a specialist.",
    roleLabel: "I want to",
    hire: "Hire specialists",
    work: "Find work",
    email: "Email",
    emailPlaceholder: "you@company.com",
    interestHire: "What do you need done?",
    interestHirePh: "e.g. Fix a bug, API integration",
    interestWork: "What do you do?",
    interestWorkPh: "e.g. React, Node.js, QA testing",
    optional: "Optional",
    consent: "Email me about Pico’s launch. I can unsubscribe anytime.",
    submit: "Join the waitlist",
    submitting: "Joining…",
    errEmail: "Enter a valid email address, like name@company.com.",
    errConsent: "Tick the box so we can email you when access opens.",
    errServer: "We couldn’t save your spot. Check your connection and try again.",
    duplicate: "This email is already on the waitlist. We’ll be in touch.",
    successTitle: "You’re on the list.",
    successBody: "We’ll email {email} as soon as early access opens.",
    successHire: "Joined as a client",
    successWork: "Joined as a specialist",
    again: "Add another email",
    privacy: "No spam. Launch updates only.",
    faqLaunchQ: "When does Pico launch?",
    faqLaunchA: "Early access opens soon. Join the waitlist and we’ll email you as soon as your spot is ready.",
    readyTitle: "Ready to try Pico?",
    footerEarly: "Early access",
    footerTasks: "Example tasks",
    securedOn: "Payments secured on Solana",
    formSub: "Choose how you’ll use Pico.",
    hireSub: "Post short tasks",
    workSub: "Take paid tasks",
    nextTitle: "What happens next",
    next: ["Join the waitlist — it takes a minute.", "We email you when early access opens.", "Post your first task or take one."],
    editAnswer: "Edit answer",
    emailStep: "Last step — where should we send your early access invite?",
    focusNow: "For developers — now",
    focusSoon: "For designers — soon",
    soonTag: "Soon",
    faqPriceQ: "How much does a task cost?",
    faqPriceA: "Tasks start at $40, Pico’s fee included. Prices are in US dollars, with no currency conversion.",
    whyOldW: ["Long or unexplained rejections to get in", "Frozen payments", "Refunds to the client after you deliver", "Account blocks with no appeal"],
    whyPicoW: ["A short skill test instead of manual approval", "Budget locked before you start", "Independent review of your work", "Payment with a transaction proof"],
    whyOldTagW: "Application under review…",
    whyProposalW: "Application",
    whyPicoTagW: "Task assigned",
    gotIt: "Got it",
    close: "Close",
    dupTitle: "You’re already on the list.",
    dupBody: "{email} is already on the waitlist. We’ll email you as soon as early access opens.",
    nextTitles: ["Join the list", "Get your invite", "Get to work"],
    nextDescs: ["Takes about a minute.", "We email you when early access opens.", "Post your first task or take one."],
    readySub: "Early access opens soon. Save your spot.",
  },
  es: {
    badge: "Acceso anticipado · Muy pronto",
    navFaq: "FAQ",
    navJoin: "Lista de espera",
    heroCta: "Unirme a la lista",
    tasksCta: "Únete a la lista para publicar o tomar tareas",
    lead: "Pico abre pronto. Únete a la lista de espera para tener acceso anticipado como cliente o especialista.",
    roleLabel: "Quiero",
    hire: "Contratar especialistas",
    work: "Encontrar trabajo",
    email: "Email",
    emailPlaceholder: "tu@empresa.com",
    interestHire: "¿Qué necesitas hacer?",
    interestHirePh: "p. ej. Corregir un bug, integración de API",
    interestWork: "¿A qué te dedicas?",
    interestWorkPh: "p. ej. React, Node.js, QA",
    optional: "Opcional",
    consent: "Quiero recibir emails sobre el lanzamiento de Pico. Puedo darme de baja cuando quiera.",
    submit: "Unirme a la lista",
    submitting: "Uniéndote…",
    errEmail: "Introduce un email válido, como nombre@empresa.com.",
    errConsent: "Marca la casilla para que podamos avisarte cuando abra el acceso.",
    errServer: "No pudimos guardar tu plaza. Revisa tu conexión e inténtalo de nuevo.",
    duplicate: "Este email ya está en la lista. Te escribiremos pronto.",
    successTitle: "Ya estás en la lista.",
    successBody: "Escribiremos a {email} en cuanto abra el acceso anticipado.",
    successHire: "Te uniste como cliente",
    successWork: "Te uniste como especialista",
    again: "Añadir otro email",
    privacy: "Sin spam. Solo novedades del lanzamiento.",
    faqLaunchQ: "¿Cuándo se lanza Pico?",
    faqLaunchA: "El acceso anticipado abre pronto. Únete a la lista y te escribiremos en cuanto tu plaza esté lista.",
    readyTitle: "¿Listo para probar Pico?",
    footerEarly: "Acceso anticipado",
    footerTasks: "Tareas de ejemplo",
    securedOn: "Pagos protegidos en Solana",
    formSub: "Elige cómo usarás Pico.",
    hireSub: "Publica tareas cortas",
    workSub: "Toma tareas pagadas",
    nextTitle: "Qué pasa después",
    next: ["Únete a la lista: es un minuto.", "Te escribimos cuando abra el acceso anticipado.", "Publica tu primera tarea o toma una."],
    editAnswer: "Editar respuesta",
    emailStep: "Último paso: ¿a dónde te enviamos la invitación de acceso anticipado?",
    focusNow: "Para desarrolladores — ya",
    focusSoon: "Para diseñadores — pronto",
    soonTag: "Pronto",
    faqPriceQ: "¿Cuánto cuesta una tarea?",
    faqPriceA: "Las tareas empiezan en $40, con la comisión de Pico incluida. Los precios son en dólares, sin conversión de moneda.",
    whyOldW: ["Rechazos largos o sin motivo al entrar", "Pagos congelados", "Reembolsos al cliente tras la entrega", "Bloqueos sin apelación"],
    whyPicoW: ["Una prueba corta en vez de aprobación manual", "Presupuesto bloqueado antes de empezar", "Revisión independiente de tu trabajo", "Pago con prueba de transacción"],
    whyOldTagW: "Solicitud en revisión…",
    whyProposalW: "Solicitud",
    whyPicoTagW: "Tarea asignada",
    gotIt: "Entendido",
    close: "Cerrar",
    dupTitle: "Ya estás en la lista.",
    dupBody: "{email} ya está en la lista de espera. Te escribiremos en cuanto abra el acceso anticipado.",
    nextTitles: ["Únete", "Recibe la invitación", "Empieza"],
    nextDescs: ["Te lleva un minuto.", "Te escribimos cuando abra el acceso anticipado.", "Publica tu primera tarea o toma una."],
    readySub: "El acceso anticipado abre pronto. Reserva tu plaza.",
  },
  pl: {
    badge: "Wczesny dostęp · Już wkrótce",
    navFaq: "FAQ",
    navJoin: "Lista oczekujących",
    heroCta: "Dołącz do listy",
    tasksCta: "Dołącz do listy, aby zlecać lub brać zadania",
    lead: "Pico rusza wkrótce. Dołącz do listy oczekujących i zyskaj wczesny dostęp jako klient lub specjalista.",
    roleLabel: "Chcę",
    hire: "Zatrudniać specjalistów",
    work: "Znaleźć zlecenia",
    email: "E-mail",
    emailPlaceholder: "ty@firma.pl",
    interestHire: "Co trzeba zrobić?",
    interestHirePh: "np. Naprawa błędu, integracja API",
    interestWork: "Czym się zajmujesz?",
    interestWorkPh: "np. React, Node.js, testy QA",
    optional: "Opcjonalnie",
    consent: "Chcę dostawać e-maile o starcie Pico. Mogę zrezygnować w każdej chwili.",
    submit: "Dołącz do listy",
    submitting: "Dołączanie…",
    errEmail: "Wpisz poprawny adres e-mail, np. imie@firma.pl.",
    errConsent: "Zaznacz pole, żebyśmy mogli napisać, gdy ruszy dostęp.",
    errServer: "Nie udało się zapisać miejsca. Sprawdź połączenie i spróbuj ponownie.",
    duplicate: "Ten e-mail jest już na liście. Odezwiemy się.",
    successTitle: "Jesteś na liście.",
    successBody: "Napiszemy na {email}, gdy tylko ruszy wczesny dostęp.",
    successHire: "Dołączono jako klient",
    successWork: "Dołączono jako specjalista",
    again: "Dodaj inny e-mail",
    privacy: "Bez spamu. Tylko informacje o starcie.",
    faqLaunchQ: "Kiedy startuje Pico?",
    faqLaunchA: "Wczesny dostęp ruszy wkrótce. Dołącz do listy, a napiszemy, gdy tylko Twoje miejsce będzie gotowe.",
    readyTitle: "Chcesz wypróbować Pico?",
    footerEarly: "Wczesny dostęp",
    footerTasks: "Przykładowe zlecenia",
    securedOn: "Płatności zabezpieczone w sieci Solana",
    formSub: "Wybierz, jak chcesz korzystać z Pico.",
    hireSub: "Zlecaj krótkie zadania",
    workSub: "Bierz płatne zlecenia",
    nextTitle: "Co dalej",
    next: ["Dołącz do listy — to minuta.", "Napiszemy, gdy ruszy wczesny dostęp.", "Opublikuj pierwsze zadanie albo weź zlecenie."],
    editAnswer: "Edytuj odpowiedź",
    emailStep: "Ostatni krok — gdzie wysłać zaproszenie do wczesnego dostępu?",
    focusNow: "Dla developerów — teraz",
    focusSoon: "Dla designerów — wkrótce",
    soonTag: "Wkrótce",
    faqPriceQ: "Ile kosztuje zadanie?",
    faqPriceA: "Zadania zaczynają się od $40, z prowizją Pico. Ceny są w dolarach, bez przewalutowania.",
    whyOldW: ["Długie lub bezpodstawne odrzucenia na starcie", "Zamrożone płatności", "Zwroty dla klienta po oddaniu pracy", "Blokady bez odwołania"],
    whyPicoW: ["Krótki test zamiast ręcznej akceptacji", "Budżet zablokowany przed startem", "Niezależna recenzja Twojej pracy", "Wypłata z potwierdzeniem transakcji"],
    whyOldTagW: "Zgłoszenie w weryfikacji…",
    whyProposalW: "Zgłoszenie",
    whyPicoTagW: "Zadanie przypisane",
    gotIt: "Rozumiem",
    close: "Zamknij",
    dupTitle: "Już jesteś na liście.",
    dupBody: "{email} jest już na liście oczekujących. Napiszemy, gdy tylko ruszy wczesny dostęp.",
    nextTitles: ["Dołącz", "Odbierz zaproszenie", "Zaczynaj"],
    nextDescs: ["Zajmie to minutę.", "Napiszemy, gdy ruszy wczesny dostęp.", "Opublikuj pierwsze zadanie albo weź zlecenie."],
    readySub: "Wczesny dostęp rusza wkrótce. Zajmij miejsce.",
  },
  de: {
    badge: "Early Access · Bald verfügbar",
    navFaq: "FAQ",
    navJoin: "Warteliste",
    heroCta: "Auf die Warteliste",
    tasksCta: "Trag dich ein, um Aufgaben zu posten oder zu übernehmen",
    lead: "Pico startet bald. Trag dich in die Warteliste ein und erhalte Early Access als Auftraggeber oder Fachkraft.",
    roleLabel: "Ich möchte",
    hire: "Fachkräfte finden",
    work: "Aufträge finden",
    email: "E-Mail",
    emailPlaceholder: "du@firma.de",
    interestHire: "Was soll erledigt werden?",
    interestHirePh: "z. B. Bug fixen, API-Integration",
    interestWork: "Was machst du?",
    interestWorkPh: "z. B. React, Node.js, QA-Tests",
    optional: "Optional",
    consent: "Ich möchte E-Mails zum Start von Pico erhalten. Abmeldung jederzeit möglich.",
    submit: "Auf die Warteliste",
    submitting: "Wird eingetragen…",
    errEmail: "Gib eine gültige E-Mail-Adresse ein, z. B. name@firma.de.",
    errConsent: "Setz das Häkchen, damit wir dich zum Start benachrichtigen können.",
    errServer: "Dein Platz konnte nicht gespeichert werden. Prüfe deine Verbindung und versuch es erneut.",
    duplicate: "Diese E-Mail steht schon auf der Warteliste. Wir melden uns.",
    successTitle: "Du stehst auf der Liste.",
    successBody: "Wir schreiben an {email}, sobald Early Access startet.",
    successHire: "Als Auftraggeber eingetragen",
    successWork: "Als Fachkraft eingetragen",
    again: "Weitere E-Mail eintragen",
    privacy: "Kein Spam. Nur Neuigkeiten zum Start.",
    faqLaunchQ: "Wann startet Pico?",
    faqLaunchA: "Early Access startet bald. Trag dich ein und wir schreiben dir, sobald dein Platz bereit ist.",
    readyTitle: "Bereit für Pico?",
    footerEarly: "Early Access",
    footerTasks: "Beispielaufgaben",
    securedOn: "Zahlungen gesichert auf Solana",
    formSub: "Wähle, wie du Pico nutzen willst.",
    hireSub: "Kurze Aufgaben posten",
    workSub: "Bezahlte Aufgaben übernehmen",
    nextTitle: "So geht’s weiter",
    next: ["Trag dich ein – dauert eine Minute.", "Wir schreiben dir, sobald Early Access startet.", "Poste deine erste Aufgabe oder übernimm eine."],
    editAnswer: "Antwort bearbeiten",
    emailStep: "Letzter Schritt: Wohin sollen wir deine Early-Access-Einladung schicken?",
    focusNow: "Für Entwickler — jetzt",
    focusSoon: "Für Designer — bald",
    soonTag: "Bald",
    faqPriceQ: "Was kostet eine Aufgabe?",
    faqPriceA: "Aufgaben starten bei $40, inklusive Pico-Gebühr. Preise in US-Dollar, ohne Währungsumrechnung.",
    whyOldW: ["Lange oder grundlose Ablehnungen beim Einstieg", "Eingefrorene Zahlungen", "Rückerstattung an den Kunden nach Abgabe", "Sperren ohne Einspruch"],
    whyPicoW: ["Kurzer Skill-Test statt manueller Freigabe", "Budget vor dem Start gesperrt", "Unabhängiges Review deiner Arbeit", "Zahlung mit Transaktionsnachweis"],
    whyOldTagW: "Bewerbung wird geprüft…",
    whyProposalW: "Bewerbung",
    whyPicoTagW: "Aufgabe zugewiesen",
    gotIt: "Alles klar",
    close: "Schließen",
    dupTitle: "Du stehst schon auf der Liste.",
    dupBody: "{email} steht schon auf der Warteliste. Wir schreiben dir, sobald Early Access startet.",
    nextTitles: ["Eintragen", "Einladung erhalten", "Loslegen"],
    nextDescs: ["Dauert etwa eine Minute.", "Wir schreiben dir, sobald Early Access startet.", "Poste deine erste Aufgabe oder übernimm eine."],
    readySub: "Early Access startet bald. Sichere dir deinen Platz.",
  },
  uk: {
    badge: "Ранній доступ · Скоро запуск",
    navFaq: "FAQ",
    navJoin: "Список очікування",
    heroCta: "Приєднатися",
    tasksCta: "Приєднуйся до списку, щоб публікувати або брати задачі",
    lead: "Pico скоро запуститься. Приєднуйся до списку очікування й отримай ранній доступ як клієнт або фахівець.",
    roleLabel: "Я хочу",
    hire: "Наймати фахівців",
    work: "Знайти роботу",
    email: "Email",
    emailPlaceholder: "you@company.com",
    interestHire: "Що потрібно зробити?",
    interestHirePh: "напр. Виправити баг, інтеграція API",
    interestWork: "Чим ти займаєшся?",
    interestWorkPh: "напр. React, Node.js, QA-тестування",
    optional: "Необов’язково",
    consent: "Хочу отримувати листи про запуск Pico. Можу відписатися будь-коли.",
    submit: "Приєднатися до списку",
    submitting: "Додаємо…",
    errEmail: "Введи коректний email, наприклад name@company.com.",
    errConsent: "Постав позначку, щоб ми могли написати, коли відкриється доступ.",
    errServer: "Не вдалося зберегти місце. Перевір з’єднання й спробуй ще раз.",
    duplicate: "Цей email уже в списку. Ми напишемо.",
    successTitle: "Ти в списку.",
    successBody: "Ми напишемо на {email}, щойно відкриється ранній доступ.",
    successHire: "Приєднано як клієнт",
    successWork: "Приєднано як фахівець",
    again: "Додати інший email",
    privacy: "Без спаму. Лише новини про запуск.",
    faqLaunchQ: "Коли запуск Pico?",
    faqLaunchA: "Ранній доступ відкриється скоро. Приєднуйся до списку, і ми напишемо, щойно твоє місце буде готове.",
    readyTitle: "Готовий спробувати Pico?",
    footerEarly: "Ранній доступ",
    footerTasks: "Приклади завдань",
    securedOn: "Платежі захищені в Solana",
    formSub: "Обери, як користуватимешся Pico.",
    hireSub: "Публікуй короткі задачі",
    workSub: "Бери оплачувані задачі",
    nextTitle: "Що далі",
    next: ["Приєднайся до списку — це хвилина.", "Ми напишемо, коли відкриється ранній доступ.", "Опублікуй першу задачу або візьми її."],
    editAnswer: "Змінити відповідь",
    emailStep: "Останній крок — куди надіслати запрошення на ранній доступ?",
    focusNow: "Для розробників — зараз",
    focusSoon: "Для дизайнерів — скоро",
    soonTag: "Скоро",
    faqPriceQ: "Скільки коштує задача?",
    faqPriceA: "Задачі — від $40, комісія Pico вже включена. Ціни в доларах, без конвертації.",
    whyOldW: ["Довге або безпідставне відхилення на вході", "Заморожені платежі", "Повернення коштів клієнту після здачі", "Блокування без апеляції"],
    whyPicoW: ["Короткий тест замість ручного схвалення", "Бюджет заблоковано до старту", "Незалежне рев’ю твоєї роботи", "Оплата з доказом транзакції"],
    whyOldTagW: "Заявка на розгляді…",
    whyProposalW: "Заявка",
    whyPicoTagW: "Задачу призначено",
    gotIt: "Зрозуміло",
    close: "Закрити",
    dupTitle: "Ти вже в списку.",
    dupBody: "{email} уже в списку очікування. Ми напишемо, щойно відкриється ранній доступ.",
    nextTitles: ["Приєднайся", "Отримай запрошення", "Починай"],
    nextDescs: ["Це займе хвилину.", "Ми напишемо, коли відкриється ранній доступ.", "Опублікуй першу задачу або візьми її."],
    readySub: "Ранній доступ скоро. Займи своє місце.",
  },
};
