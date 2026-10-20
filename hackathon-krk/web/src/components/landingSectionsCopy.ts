import type { LandingLanguage } from "@/components/landingTranslations";

type Step = { title: string; body: string };
type PayState = { label: string; title: string; body: string };
export type Stat = { text: string; source: string; href: string };

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
    note: string;
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
  stats: { hire: Stat; downtime: Stat; checkout: Stat };
};

export const SECTIONS_COPY: Record<LandingLanguage, SectionsCopy> = {
  en: {
    explore: {
      kicker: "Explore tasks",
      title: ["Find your next ", "task", "."],
      lead: "Short paid tasks with criteria agreed before work starts.",
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
          { title: "Agree", body: "Agree 3–5 criteria for the result and add a card via Stripe. Nothing is charged yet." },
          { title: "Qualify", body: "Specialists pass a short timed skill test." },
          { title: "Work", body: "The first qualified specialist takes the task." },
          { title: "Review", body: "A reviewer matched to your task checks the work. An auditor checks the review." },
          { title: "Charge", body: "Your card is charged automatically only after the work passes review." },
        ],
        worker: [
          { title: "Find", body: "Pick a task in your skill area. The criteria are clear before you start." },
          { title: "Qualify", body: "Pass a short timed test to prove your skills." },
          { title: "Work", body: "Get the task and do the work." },
          { title: "Submit", body: "Send the result against the brief." },
          { title: "Review", body: "Independent reviewers check your result." },
          { title: "Get paid", body: "When the work passes review, the client’s card is charged and you get paid." },
        ],
      },
      status: {
        client: ["Draft", "Card added", "Qualifying", "In progress", "In review", "Charged"],
        worker: ["Open", "Qualifying", "In progress", "Submitted", "In review", "Paid"],
      },
      rows: ["Criteria agreed · card added", "Qualification test", "Work submitted", "Review · primary + audit", "Card charged"],
    },
    why: {
      kicker: "Why Pico",
      title: ["Less searching. ", "More doing."],
      oldLabel: "The old way",
      picoLabel: "The Pico way",
      old: ["Write a long job post", "Sort through dozens of proposals", "Interview and negotiate", "Hope the work holds up"],
      pico: ["Post one clear task", "Skills tested before work starts", "Criteria agreed up front", "Card charged only after review"],
      oldTag: "Waiting for replies…",
      picoTag: "Specialist assigned",
      proposal: "Proposal",
    },
    pay: {
      kicker: "How payment works",
      title: ["Pay only for work ", "that passes."],
      amountLabel: "Task budget",
      network: "US dollars",
      note: "Card details are handled by Stripe - Pico never sees them.",
      states: [
        { label: "Card saved", title: "Card added", body: "When you publish the task, you agree 3–5 criteria and add a card via Stripe. Nothing is charged then." },
        { label: "Reviewed", title: "Work reviewed", body: "A reviewer checks the result against those criteria. An auditor checks the review." },
        { label: "Charged", title: "Charged only if it passes", body: "Criteria met: Stripe charges your card automatically. Not met: no charge. Disputes are reviewed by the Pico team." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Good questions.",
      items: [
        { q: "What kind of tasks fit Pico?", a: "Short development work with a clear result, measured in hours, not months: debugging, bug fixes, code review, QA. We start with developers — design tasks are coming soon." },
        { q: "How is the specialist chosen?", a: "Every specialist passes a timed skill test first. The first one who qualifies for your task picks it up — no CVs, no proposals to sort through." },
        { q: "When is my money charged?", a: "You add a card when you publish the task, and nothing is charged then. Stripe charges it automatically only after the work passes review against your 3–5 criteria. If the criteria aren’t met, you’re not charged. Prices are in US dollars, Pico’s 10% fee included." },
        { q: "Who checks the work?", a: "A separate reviewer checks the result against your criteria, and an auditor double-checks that review." },
        { q: "What if the work doesn’t meet the criteria?", a: "Then your card isn’t charged. If you and the specialist disagree, the Pico team reviews the case by hand. Write to us at team.hirepico@outlook.com." },
        { q: "Can I work with the same specialist again?", a: "Yes. Post your next task to them through Pico, or work with them directly. The 10% fee applies only to tasks created and paid through Pico." },
      ],
    },
    stats: {
      hire: { text: "At companies with fewer than 1,000 employees, hiring a developer takes 29 days on average, from job opening to offer. Your bug can’t wait that long.", source: "Source: HackerRank Tech Recruiting Benchmark Report, 2020", href: "https://www.hackerrank.com/wp-content/uploads/2025/10/Tech-Recruiting-Benchmark-Report.pdf" },
      downtime: { text: "90% of organizations require at least 99.99% uptime - about 52 minutes of unplanned downtime per server a year.", source: "Source: ITIC, 2024", href: "https://itic-corp.com/itic-2024-hourly-cost-of-downtime-part-2/" },
      checkout: { text: "17% of US online shoppers have abandoned an order because the site had errors or crashed.", source: "Source: Baymard Institute, 2025", href: "https://baymard.com/lists/cart-abandonment-rate" },
    },
    cta: {
      title: ["Your next task ", "starts here", "."],
      post: "Post a task",
      find: "Find work",
      note: "Nothing is charged up front. Your card is charged only after the work passes review.",
    },
  },

  es: {
    explore: {
      kicker: "Explorar tareas",
      title: ["Encuentra tu próxima ", "tarea", "."],
      lead: "Tareas cortas y pagadas, con criterios acordados antes de empezar.",
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
          { title: "Acordar", body: "Acuerda 3–5 criterios para el resultado y añade una tarjeta con Stripe. Aún no se cobra nada." },
          { title: "Calificar", body: "Los especialistas pasan una prueba corta con tiempo." },
          { title: "Trabajar", body: "El primer especialista calificado toma la tarea." },
          { title: "Revisar", body: "Un revisor elegido para tu tarea comprueba el trabajo. Un auditor comprueba la revisión." },
          { title: "Cobro", body: "Tu tarjeta se cobra automáticamente solo cuando el trabajo supera la revisión." },
        ],
        worker: [
          { title: "Encontrar", body: "Elige una tarea de tu área. Los criterios están claros antes de empezar." },
          { title: "Calificar", body: "Supera una prueba corta con tiempo para demostrar tus habilidades." },
          { title: "Trabajar", body: "Recibe la tarea y haz el trabajo." },
          { title: "Entregar", body: "Envía el resultado según el brief." },
          { title: "Revisión", body: "Revisores independientes comprueban tu resultado." },
          { title: "Cobrar", body: "Cuando el trabajo supera la revisión, se cobra la tarjeta del cliente y tú cobras." },
        ],
      },
      status: {
        client: ["Borrador", "Tarjeta añadida", "Calificación", "En curso", "En revisión", "Cobrado"],
        worker: ["Abierta", "Calificación", "En curso", "Entregada", "En revisión", "Pagado"],
      },
      rows: ["Criterios acordados · tarjeta añadida", "Prueba de calificación", "Trabajo entregado", "Revisión · principal + auditoría", "Tarjeta cobrada"],
    },
    why: {
      kicker: "Por qué Pico",
      title: ["Menos buscar. ", "Más hacer."],
      oldLabel: "A la antigua",
      picoLabel: "Con Pico",
      old: ["Escribir una oferta larga", "Revisar decenas de propuestas", "Entrevistar y negociar", "Esperar que salga bien"],
      pico: ["Publica una tarea clara", "Habilidades probadas antes de empezar", "Criterios acordados de antemano", "Tarjeta cobrada solo tras la revisión"],
      oldTag: "Esperando respuestas…",
      picoTag: "Especialista asignado",
      proposal: "Propuesta",
    },
    pay: {
      kicker: "Cómo funciona el pago",
      title: ["Paga solo por trabajo ", "que supera la revisión."],
      amountLabel: "Presupuesto de la tarea",
      network: "Dólares estadounidenses",
      note: "Los datos de tu tarjeta los gestiona Stripe - Pico nunca los ve.",
      states: [
        { label: "Tarjeta", title: "Tarjeta añadida", body: "Al publicar la tarea acuerdas 3–5 criterios y añades una tarjeta con Stripe. En ese momento no se cobra nada." },
        { label: "Revisado", title: "Trabajo revisado", body: "Un revisor compara el resultado con esos criterios. Un auditor comprueba la revisión." },
        { label: "Cobro", title: "Cobro solo si se aprueba", body: "Si se cumplen los criterios, Stripe cobra tu tarjeta automáticamente. Si no, no se cobra nada. Las disputas las revisa el equipo de Pico." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Buenas preguntas.",
      items: [
        { q: "¿Qué tareas encajan en Pico?", a: "Trabajo de desarrollo corto con un resultado claro, de horas y no de meses: depuración, corrección de bugs, code review, QA. Empezamos con desarrolladores; las tareas de diseño llegarán pronto." },
        { q: "¿Cómo se elige al especialista?", a: "Cada especialista pasa primero una prueba de habilidades con tiempo. El primero que califica para tu tarea la toma, sin CVs ni propuestas que revisar." },
        { q: "¿Cuándo se cobra mi dinero?", a: "Añades una tarjeta al publicar la tarea y en ese momento no se cobra nada. Stripe la cobra automáticamente solo cuando el trabajo supera la revisión según tus 3–5 criterios. Si no se cumplen, no se te cobra. Precios en dólares, con la comisión del 10% de Pico incluida." },
        { q: "¿Quién revisa el trabajo?", a: "Un revisor independiente compara el resultado con tus criterios, y un auditor comprueba esa revisión." },
        { q: "¿Y si el trabajo no cumple los criterios?", a: "Entonces no se cobra tu tarjeta. Si tú y el especialista no están de acuerdo, el equipo de Pico revisa el caso a mano. Escríbenos a team.hirepico@outlook.com." },
        { q: "¿Puedo volver a trabajar con el mismo especialista?", a: "Sí. Asígnale tu próxima tarea a través de Pico o trabaja con él directamente. La comisión del 10% solo se aplica a las tareas creadas y pagadas en Pico." },
      ],
    },
    stats: {
      hire: { text: "En empresas de menos de 1.000 empleados, contratar a un desarrollador lleva 29 días de media, desde la vacante hasta la oferta. Tu bug no puede esperar tanto.", source: "Fuente: HackerRank Tech Recruiting Benchmark Report, 2020", href: "https://www.hackerrank.com/wp-content/uploads/2025/10/Tech-Recruiting-Benchmark-Report.pdf" },
      downtime: { text: "El 90% de las organizaciones exige al menos un 99,99% de disponibilidad: unos 52 minutos de caída no planificada por servidor al año.", source: "Fuente: ITIC, 2024", href: "https://itic-corp.com/itic-2024-hourly-cost-of-downtime-part-2/" },
      checkout: { text: "El 17% de los compradores online en EE. UU. ha abandonado un pedido porque la web dio errores o se cayó.", source: "Fuente: Baymard Institute, 2025", href: "https://baymard.com/lists/cart-abandonment-rate" },
    },
    cta: {
      title: ["Tu próxima tarea ", "empieza aquí", "."],
      post: "Publicar tarea",
      find: "Buscar trabajo",
      note: "No se cobra nada por adelantado. Tu tarjeta se cobra solo cuando el trabajo supera la revisión.",
    },
  },

  pl: {
    explore: {
      kicker: "Zlecenia",
      title: ["Znajdź kolejne ", "zlecenie", "."],
      lead: "Krótkie, płatne zadania z kryteriami uzgodnionymi przed startem.",
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
          { title: "Uzgodnij", body: "Uzgodnij 3–5 kryteriów wyniku i dodaj kartę przez Stripe. Na razie nic nie pobieramy." },
          { title: "Kwalifikacja", body: "Specjaliści przechodzą krótki test na czas." },
          { title: "Praca", body: "Pierwszy zakwalifikowany specjalista bierze zadanie." },
          { title: "Sprawdzenie", body: "Recenzent dobrany do zadania sprawdza pracę. Audytor sprawdza recenzję." },
          { title: "Płatność", body: "Karta zostaje obciążona automatycznie dopiero, gdy praca przejdzie recenzję." },
        ],
        worker: [
          { title: "Znajdź", body: "Wybierz zadanie ze swojej dziedziny. Kryteria znasz przed startem." },
          { title: "Kwalifikacja", body: "Zdaj krótki test na czas i pokaż, co umiesz." },
          { title: "Praca", body: "Otrzymaj zadanie i wykonaj je." },
          { title: "Oddaj", body: "Wyślij wynik zgodny z briefem." },
          { title: "Recenzja", body: "Niezależni recenzenci sprawdzają wynik." },
          { title: "Wypłata", body: "Gdy praca przejdzie recenzję, karta klienta zostaje obciążona, a Ty dostajesz zapłatę." },
        ],
      },
      status: {
        client: ["Szkic", "Karta dodana", "Kwalifikacja", "W trakcie", "W recenzji", "Opłacone"],
        worker: ["Otwarte", "Kwalifikacja", "W trakcie", "Oddane", "W recenzji", "Opłacone"],
      },
      rows: ["Kryteria uzgodnione · karta dodana", "Test kwalifikacyjny", "Praca oddana", "Recenzja · główna + audyt", "Karta obciążona"],
    },
    why: {
      kicker: "Dlaczego Pico",
      title: ["Mniej szukania. ", "Więcej działania."],
      oldLabel: "Po staremu",
      picoLabel: "Z Pico",
      old: ["Długie ogłoszenie", "Dziesiątki ofert do przejrzenia", "Rozmowy i negocjacje", "Nadzieja, że się uda"],
      pico: ["Jedno jasne zadanie", "Umiejętności sprawdzone przed startem", "Kryteria uzgodnione z góry", "Karta obciążona dopiero po recenzji"],
      oldTag: "Czekamy na odpowiedzi…",
      picoTag: "Specjalista przypisany",
      proposal: "Oferta",
    },
    pay: {
      kicker: "Jak działa płatność",
      title: ["Płacisz tylko za pracę, ", "która przejdzie recenzję."],
      amountLabel: "Budżet zadania",
      network: "Dolary amerykańskie",
      note: "Dane karty obsługuje Stripe - Pico nigdy ich nie widzi.",
      states: [
        { label: "Karta", title: "Karta dodana", body: "Publikując zadanie, uzgadniasz 3–5 kryteriów i dodajesz kartę przez Stripe. Wtedy nic nie pobieramy." },
        { label: "Sprawdzone", title: "Praca sprawdzona", body: "Recenzent porównuje wynik z tymi kryteriami. Audytor sprawdza recenzję." },
        { label: "Płatność", title: "Płatność tylko po akceptacji", body: "Kryteria spełnione - Stripe automatycznie obciąża kartę. Niespełnione - nic nie płacisz. Spory rozpatruje zespół Pico." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Dobre pytania.",
      items: [
        { q: "Jakie zadania pasują do Pico?", a: "Krótka praca developerska z jasnym efektem, na godziny, nie miesiące: debugowanie, poprawki błędów, code review, QA. Zaczynamy od developerów — zadania designerskie już wkrótce." },
        { q: "Jak wybierany jest specjalista?", a: "Każdy specjalista najpierw przechodzi test umiejętności na czas. Zadanie bierze pierwszy, kto się zakwalifikuje — bez CV i przeglądania ofert." },
        { q: "Kiedy pobierane są moje pieniądze?", a: "Kartę dodajesz przy publikacji zadania i wtedy nic nie jest pobierane. Stripe obciąża ją automatycznie dopiero, gdy praca przejdzie recenzję według Twoich 3–5 kryteriów. Jeśli kryteria nie są spełnione, nic nie płacisz. Ceny w dolarach, 10% prowizji Pico w cenie." },
        { q: "Kto sprawdza pracę?", a: "Osobny recenzent porównuje wynik z Twoimi kryteriami, a audytor sprawdza tę recenzję." },
        { q: "Co jeśli praca nie spełnia kryteriów?", a: "Wtedy Twoja karta nie zostaje obciążona. Jeśli Ty i specjalista się nie zgadzacie, zespół Pico ręcznie rozpatruje sprawę. Napisz do nas: team.hirepico@outlook.com." },
        { q: "Czy mogę znowu pracować z tym samym specjalistą?", a: "Tak. Zleć mu kolejne zadanie przez Pico albo współpracuj bezpośrednio. Prowizja 10% dotyczy tylko zadań utworzonych i opłaconych w Pico." },
      ],
    },
    stats: {
      hire: { text: "W firmach do 1000 pracowników zatrudnienie programisty trwa średnio 29 dni - od otwarcia rekrutacji do oferty. Twój bug nie może tyle czekać.", source: "Źródło: HackerRank Tech Recruiting Benchmark Report, 2020", href: "https://www.hackerrank.com/wp-content/uploads/2025/10/Tech-Recruiting-Benchmark-Report.pdf" },
      downtime: { text: "90% organizacji wymaga co najmniej 99,99% dostępności - to około 52 minut nieplanowanego przestoju na serwer rocznie.", source: "Źródło: ITIC, 2024", href: "https://itic-corp.com/itic-2024-hourly-cost-of-downtime-part-2/" },
      checkout: { text: "17% kupujących online w USA porzuciło zamówienie, bo strona miała błędy lub się zawiesiła.", source: "Źródło: Baymard Institute, 2025", href: "https://baymard.com/lists/cart-abandonment-rate" },
    },
    cta: {
      title: ["Twoje kolejne zadanie ", "zaczyna się tu", "."],
      post: "Opublikuj zadanie",
      find: "Znajdź zlecenie",
      note: "Nic nie pobieramy z góry. Karta jest obciążana dopiero, gdy praca przejdzie recenzję.",
    },
  },

  de: {
    explore: {
      kicker: "Aufgaben entdecken",
      title: ["Finde deine nächste ", "Aufgabe", "."],
      lead: "Kurze, bezahlte Aufgaben mit Kriterien, die vor dem Start feststehen.",
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
          { title: "Vereinbaren", body: "Vereinbare 3–5 Kriterien für das Ergebnis und hinterlege eine Karte über Stripe. Noch wird nichts belastet." },
          { title: "Qualifizieren", body: "Fachkräfte absolvieren einen kurzen, zeitlich begrenzten Test." },
          { title: "Arbeiten", body: "Die erste qualifizierte Fachkraft übernimmt die Aufgabe." },
          { title: "Prüfen", body: "Ein passender Reviewer prüft die Arbeit. Ein Auditor prüft das Review." },
          { title: "Abbuchung", body: "Deine Karte wird erst automatisch belastet, wenn die Arbeit das Review besteht." },
        ],
        worker: [
          { title: "Finden", body: "Wähle eine Aufgabe aus deinem Bereich. Die Kriterien stehen vor dem Start fest." },
          { title: "Qualifizieren", body: "Bestehe einen kurzen Test und zeige deine Skills." },
          { title: "Arbeiten", body: "Übernimm die Aufgabe und erledige sie." },
          { title: "Abgeben", body: "Reiche das Ergebnis passend zum Briefing ein." },
          { title: "Review", body: "Unabhängige Reviewer prüfen dein Ergebnis." },
          { title: "Bezahlt werden", body: "Besteht die Arbeit das Review, wird die Karte des Kunden belastet und du wirst bezahlt." },
        ],
      },
      status: {
        client: ["Entwurf", "Karte hinterlegt", "Qualifizierung", "In Arbeit", "Im Review", "Belastet"],
        worker: ["Offen", "Qualifizierung", "In Arbeit", "Abgegeben", "Im Review", "Bezahlt"],
      },
      rows: ["Kriterien vereinbart · Karte hinterlegt", "Qualifizierungstest", "Arbeit abgegeben", "Review · Haupt + Audit", "Karte belastet"],
    },
    why: {
      kicker: "Warum Pico",
      title: ["Weniger suchen. ", "Mehr erledigen."],
      oldLabel: "Der alte Weg",
      picoLabel: "Der Pico-Weg",
      old: ["Lange Stellenanzeige schreiben", "Dutzende Angebote sichten", "Gespräche und Verhandlungen", "Hoffen, dass es passt"],
      pico: ["Eine klare Aufgabe posten", "Skills vor dem Start geprüft", "Kriterien vorab vereinbart", "Karte erst nach dem Review belastet"],
      oldTag: "Warte auf Antworten…",
      picoTag: "Fachkraft zugewiesen",
      proposal: "Angebot",
    },
    pay: {
      kicker: "So funktioniert die Zahlung",
      title: ["Zahle nur für Arbeit, ", "die das Review besteht."],
      amountLabel: "Aufgabenbudget",
      network: "US-Dollar",
      note: "Deine Kartendaten verarbeitet Stripe - Pico sieht sie nie.",
      states: [
        { label: "Karte", title: "Karte hinterlegt", body: "Beim Veröffentlichen vereinbarst du 3–5 Kriterien und hinterlegst eine Karte über Stripe. Dabei wird nichts belastet." },
        { label: "Geprüft", title: "Arbeit geprüft", body: "Ein Reviewer prüft das Ergebnis gegen diese Kriterien. Ein Auditor prüft das Review." },
        { label: "Belastung", title: "Belastet nur, wenn bestanden", body: "Kriterien erfüllt: Stripe belastet deine Karte automatisch. Nicht erfüllt: keine Belastung. Streitfälle prüft das Pico-Team." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Gute Fragen.",
      items: [
        { q: "Welche Aufgaben passen zu Pico?", a: "Kurze Entwicklungsarbeit mit klarem Ergebnis, Stunden statt Monate: Debugging, Bugfixes, Code-Review, QA. Wir starten mit Entwicklern – Design-Aufgaben folgen bald." },
        { q: "Wie wird die Fachkraft ausgewählt?", a: "Jede Fachkraft absolviert zuerst einen zeitlich begrenzten Skill-Test. Die erste, die sich für deine Aufgabe qualifiziert, übernimmt sie – ohne Lebensläufe und Angebote zu sichten." },
        { q: "Wann wird mein Geld belastet?", a: "Du hinterlegst beim Veröffentlichen eine Karte, belastet wird dabei nichts. Stripe belastet sie automatisch erst, wenn die Arbeit das Review gegen deine 3–5 Kriterien besteht. Sind die Kriterien nicht erfüllt, wird nichts belastet. Preise in US-Dollar, inklusive 10% Pico-Gebühr." },
        { q: "Wer prüft die Arbeit?", a: "Ein separater Reviewer prüft das Ergebnis gegen deine Kriterien, und ein Auditor prüft dieses Review." },
        { q: "Was, wenn die Arbeit die Kriterien nicht erfüllt?", a: "Dann wird deine Karte nicht belastet. Wenn du und die Fachkraft uneinig seid, prüft das Pico-Team den Fall manuell. Schreib uns an team.hirepico@outlook.com." },
        { q: "Kann ich wieder mit derselben Fachkraft arbeiten?", a: "Ja. Gib ihr die nächste Aufgabe über Pico oder arbeite direkt mit ihr. Die 10% Gebühr gilt nur für Aufgaben, die über Pico erstellt und bezahlt werden." },
      ],
    },
    stats: {
      hire: { text: "In Unternehmen mit weniger als 1.000 Beschäftigten dauert es im Schnitt 29 Tage von der Ausschreibung bis zum Angebot für einen Entwickler. So lange kann dein Bug nicht warten.", source: "Quelle: HackerRank Tech Recruiting Benchmark Report, 2020", href: "https://www.hackerrank.com/wp-content/uploads/2025/10/Tech-Recruiting-Benchmark-Report.pdf" },
      downtime: { text: "90% der Unternehmen verlangen mindestens 99,99% Verfügbarkeit - etwa 52 Minuten ungeplanter Ausfall pro Server und Jahr.", source: "Quelle: ITIC, 2024", href: "https://itic-corp.com/itic-2024-hourly-cost-of-downtime-part-2/" },
      checkout: { text: "17% der Online-Käufer in den USA haben eine Bestellung abgebrochen, weil die Seite Fehler hatte oder abstürzte.", source: "Quelle: Baymard Institute, 2025", href: "https://baymard.com/lists/cart-abandonment-rate" },
    },
    cta: {
      title: ["Deine nächste Aufgabe ", "startet hier", "."],
      post: "Aufgabe posten",
      find: "Arbeit finden",
      note: "Nichts wird im Voraus belastet. Deine Karte wird erst belastet, wenn die Arbeit das Review besteht.",
    },
  },

  uk: {
    explore: {
      kicker: "Завдання",
      title: ["Знайди наступне ", "завдання", "."],
      lead: "Короткі оплачувані задачі з критеріями, погодженими до початку роботи.",
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
          { title: "Погодь", body: "Погодь 3–5 критеріїв результату й додай картку через Stripe. Поки нічого не списується." },
          { title: "Кваліфікація", body: "Фахівці проходять короткий тест на час." },
          { title: "Робота", body: "Перший кваліфікований фахівець бере задачу." },
          { title: "Перевірка", body: "Рев’юер, підібраний під задачу, перевіряє роботу. Аудитор перевіряє рев’ю." },
          { title: "Оплата", body: "Кошти з картки списуються автоматично лише після того, як робота пройде перевірку." },
        ],
        worker: [
          { title: "Знайди", body: "Обери задачу у своїй сфері. Критерії відомі ще до старту." },
          { title: "Кваліфікація", body: "Пройди короткий тест на час і покажи навички." },
          { title: "Робота", body: "Отримай задачу й виконай її." },
          { title: "Здай", body: "Надішли результат відповідно до брифу." },
          { title: "Рев’ю", body: "Незалежні рев’юери перевіряють результат." },
          { title: "Отримай оплату", body: "Коли робота пройде перевірку, з картки клієнта списується оплата, і ти отримуєш гроші." },
        ],
      },
      status: {
        client: ["Чернетка", "Картку додано", "Кваліфікація", "У роботі", "На перевірці", "Оплачено"],
        worker: ["Відкрито", "Кваліфікація", "У роботі", "Здано", "На перевірці", "Оплачено"],
      },
      rows: ["Критерії погоджено · картку додано", "Кваліфікаційний тест", "Роботу здано", "Рев’ю · основне + аудит", "Кошти списано"],
    },
    why: {
      kicker: "Чому Pico",
      title: ["Менше пошуків. ", "Більше справ."],
      oldLabel: "Як було",
      picoLabel: "Як у Pico",
      old: ["Довга вакансія", "Десятки відгуків на розгляд", "Співбесіди й переговори", "Надія, що все вийде"],
      pico: ["Одна зрозуміла задача", "Навички перевірено до старту", "Критерії погоджено наперед", "Оплата з картки лише після перевірки"],
      oldTag: "Чекаємо на відповіді…",
      picoTag: "Фахівця призначено",
      proposal: "Відгук",
    },
    pay: {
      kicker: "Як працює оплата",
      title: ["Платиш лише за роботу, ", "що пройшла перевірку."],
      amountLabel: "Бюджет задачі",
      network: "Долари США",
      note: "Дані картки обробляє Stripe - Pico їх ніколи не бачить.",
      states: [
        { label: "Картка", title: "Картку додано", body: "Під час публікації задачі ти погоджуєш 3–5 критеріїв і додаєш картку через Stripe. У цей момент нічого не списується." },
        { label: "Перевірено", title: "Роботу перевірено", body: "Рев’юер звіряє результат із цими критеріями. Аудитор перевіряє рев’ю." },
        { label: "Оплата", title: "Списання лише після перевірки", body: "Критерії виконано - Stripe автоматично списує оплату з картки. Не виконано - нічого не списується. Спірні випадки розглядає команда Pico." },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Слушні питання.",
      items: [
        { q: "Які задачі підходять для Pico?", a: "Коротка робота з розробки з чітким результатом, на години, а не місяці: дебаг, виправлення багів, code review, QA. Починаємо з розробників — задачі для дизайнерів скоро." },
        { q: "Як обирають фахівця?", a: "Кожен фахівець спершу проходить тест навичок на час. Задачу бере перший, хто пройде кваліфікацію, — без резюме й розбору заявок." },
        { q: "Коли списуються мої гроші?", a: "Картку ти додаєш під час публікації задачі, і тоді нічого не списується. Stripe автоматично списує оплату лише після того, як робота пройде перевірку за твоїми 3–5 критеріями. Якщо критерії не виконано, гроші не списуються. Ціни в доларах США, комісія Pico 10% уже включена." },
        { q: "Хто перевіряє роботу?", a: "Окремий рев’юер звіряє результат із твоїми критеріями, а аудитор перевіряє це рев’ю." },
        { q: "А якщо робота не відповідає критеріям?", a: "Тоді кошти з твоєї картки не списуються. Якщо ви з фахівцем не згодні, команда Pico розглядає випадок вручну. Пиши нам на team.hirepico@outlook.com." },
        { q: "Чи можна знову працювати з тим самим фахівцем?", a: "Так. Дай йому наступну задачу через Pico або працюй напряму. Комісія 10% діє лише для задач, створених і оплачених через Pico." },
      ],
    },
    stats: {
      hire: { text: "У компаніях до 1000 працівників найм розробника від відкриття вакансії до офера триває в середньому 29 днів. Твій баг не може чекати так довго.", source: "Джерело: HackerRank Tech Recruiting Benchmark Report, 2020", href: "https://www.hackerrank.com/wp-content/uploads/2025/10/Tech-Recruiting-Benchmark-Report.pdf" },
      downtime: { text: "90% компаній вимагають доступності щонайменше 99,99% - це близько 52 хвилин незапланованого простою на сервер за рік.", source: "Джерело: ITIC, 2024", href: "https://itic-corp.com/itic-2024-hourly-cost-of-downtime-part-2/" },
      checkout: { text: "17% онлайн-покупців у США кидали замовлення, бо сайт видавав помилки або падав.", source: "Джерело: Baymard Institute, 2025", href: "https://baymard.com/lists/cart-abandonment-rate" },
    },
    cta: {
      title: ["Твоє наступне завдання ", "починається тут", "."],
      post: "Опублікувати задачу",
      find: "Знайти роботу",
      note: "Нічого не списується наперед. Оплата з картки - лише після того, як робота пройде перевірку.",
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
  contact: string;
  privacy: string;
};

export const EXTRA_COPY: Record<LandingLanguage, ExtraCopy> = {
  en: { helpTitle: "Still have a question?", helpCta: "Open help center", product: "Product", account: "Account", company: "Pico", balance: "Balance", activity: "Activity", settings: "Settings", about: "About", helpCenter: "Help center", rights: "All rights reserved.", contact: "Contact", privacy: "Privacy Policy" },
  es: { helpTitle: "¿Te queda alguna duda?", helpCta: "Abrir centro de ayuda", product: "Producto", account: "Cuenta", company: "Pico", balance: "Saldo", activity: "Actividad", settings: "Ajustes", about: "Acerca de", helpCenter: "Centro de ayuda", rights: "Todos los derechos reservados.", contact: "Contacto", privacy: "Política de privacidad" },
  pl: { helpTitle: "Masz jeszcze pytanie?", helpCta: "Otwórz centrum pomocy", product: "Produkt", account: "Konto", company: "Pico", balance: "Saldo", activity: "Aktywność", settings: "Ustawienia", about: "O nas", helpCenter: "Centrum pomocy", rights: "Wszelkie prawa zastrzeżone.", contact: "Kontakt", privacy: "Polityka prywatności" },
  de: { helpTitle: "Noch Fragen?", helpCta: "Hilfe-Center öffnen", product: "Produkt", account: "Konto", company: "Pico", balance: "Guthaben", activity: "Aktivität", settings: "Einstellungen", about: "Über uns", helpCenter: "Hilfe-Center", rights: "Alle Rechte vorbehalten.", contact: "Kontakt", privacy: "Datenschutz" },
  uk: { helpTitle: "Залишилися питання?", helpCta: "Відкрити центр допомоги", product: "Продукт", account: "Акаунт", company: "Pico", balance: "Баланс", activity: "Активність", settings: "Налаштування", about: "Про нас", helpCenter: "Центр допомоги", rights: "Усі права захищено.", contact: "Контакти", privacy: "Політика конфіденційності" },
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
  consentNote: string;
  faqNdaQ: string;
  faqNdaA: string;
  secTitle: [string, string];
  secLead: string;
  secItems: { title: string; body: string }[];
  secCard: { title: string; active: string; nda: string; id: string; env: string };
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
    securedOn: "Card charged after review",
    formSub: "Choose how you’ll use Pico.",
    hireSub: "Post short tasks",
    workSub: "Take paid tasks",
    nextTitle: "What happens next",
    next: ["Join the waitlist - it takes a minute.", "We email you when early access opens.", "Post your first task or take one."],
    editAnswer: "Edit answer",
    emailStep: "Last step - where should we send your early access invite?",
    focusNow: "For developers - now",
    focusSoon: "For designers - soon",
    soonTag: "Soon",
    faqPriceQ: "How much does a task cost?",
    faqPriceA: "Tasks start at $40, Pico’s 10% fee included. You see the full price before you publish. Prices are in US dollars, with no currency conversion.",
    whyOldW: ["Long or unexplained rejections to get in", "Frozen payments", "Refunds to the client after you deliver", "Account blocks with no appeal"],
    whyPicoW: ["A short skill test instead of manual approval", "Clear criteria agreed before you start", "Independent review of your work", "Paid when the work is approved - that’s when the client is charged"],
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
    consentNote: "By joining, you agree to receive emails about Pico’s launch. Unsubscribe anytime.",
    secTitle: ["Your code. ","Your rules."],
    secLead: "Handing your code to someone new is the scary part. On Pico you decide what a specialist sees, and the code is yours once you pay.",
    secItems: [{"title":"Confidentiality first","body":"Specialists accept confidentiality terms before they see your brief or code. The delivered code belongs to you after payment."},{"title":"Skill-tested specialists","body":"Every specialist passes a timed skill test before taking paid work."},{"title":"You control access","body":"Share only what the task needs: a separate branch, a fork or test data. Remove access when the task is done."},{"title":"No production keys","body":"Tasks don’t need production passwords or keys. We help you describe the bug so test data is enough."}],
    secCard: {"title":"Task access","active":"Active","nda":"Terms accepted","id":"Skill test passed","env":"Test data only"},
    faqNdaQ: "Is my task kept confidential?",
    faqNdaA: "Yes. Specialists, reviewers and auditors accept confidentiality terms before they see a task. We don’t publish or share your task, your code or the delivered work.",
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
    securedOn: "Cobro tras la revisión",
    formSub: "Elige cómo usarás Pico.",
    hireSub: "Publica tareas cortas",
    workSub: "Toma tareas pagadas",
    nextTitle: "Qué pasa después",
    next: ["Únete a la lista: es un minuto.", "Te escribimos cuando abra el acceso anticipado.", "Publica tu primera tarea o toma una."],
    editAnswer: "Editar respuesta",
    emailStep: "Último paso: ¿a dónde te enviamos la invitación de acceso anticipado?",
    focusNow: "Para desarrolladores - ya",
    focusSoon: "Para diseñadores - pronto",
    soonTag: "Pronto",
    faqPriceQ: "¿Cuánto cuesta una tarea?",
    faqPriceA: "Las tareas empiezan en $40, con la comisión del 10% de Pico incluida. Ves el precio completo antes de publicar. Los precios son en dólares, sin conversión de moneda.",
    whyOldW: ["Rechazos largos o sin motivo al entrar", "Pagos congelados", "Reembolsos al cliente tras la entrega", "Bloqueos sin apelación"],
    whyPicoW: ["Una prueba corta en vez de aprobación manual", "Criterios claros acordados antes de empezar", "Revisión independiente de tu trabajo", "Cobras cuando se aprueba el trabajo - es cuando se cobra al cliente"],
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
    consentNote: "Al unirte, aceptas recibir emails sobre el lanzamiento de Pico. Puedes darte de baja cuando quieras.",
    secTitle: ["Tu código. ","Tus reglas."],
    secLead: "Dar tu código a alguien nuevo es lo que más preocupa. En Pico tú decides qué ve el especialista, y el código es tuyo cuando pagas.",
    secItems: [{"title":"Confidencialidad primero","body":"Los especialistas aceptan los términos de confidencialidad antes de ver tu brief o tu código. El código entregado es tuyo tras el pago."},{"title":"Habilidades evaluadas","body":"Cada especialista supera una prueba de habilidades cronometrada antes de aceptar trabajo pagado."},{"title":"Tú controlas el acceso","body":"Comparte solo lo que la tarea necesita: una rama aparte, un fork o datos de prueba. Retira el acceso al terminar."},{"title":"Sin claves de producción","body":"Las tareas no necesitan contraseñas ni claves de producción. Te ayudamos a describir el bug para que basten los datos de prueba."}],
    secCard: {"title":"Acceso a la tarea","active":"Activo","nda":"Términos aceptados","id":"Prueba superada","env":"Solo datos de prueba"},
    faqNdaQ: "¿Mi tarea es confidencial?",
    faqNdaA: "Sí. Los especialistas, revisores y auditores aceptan términos de confidencialidad antes de ver una tarea. No publicamos ni compartimos tu tarea, tu código ni el trabajo entregado.",
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
    securedOn: "Płatność kartą po recenzji",
    formSub: "Wybierz, jak chcesz korzystać z Pico.",
    hireSub: "Zlecaj krótkie zadania",
    workSub: "Bierz płatne zlecenia",
    nextTitle: "Co dalej",
    next: ["Dołącz do listy - to minuta.", "Napiszemy, gdy ruszy wczesny dostęp.", "Opublikuj pierwsze zadanie albo weź zlecenie."],
    editAnswer: "Edytuj odpowiedź",
    emailStep: "Ostatni krok - gdzie wysłać zaproszenie do wczesnego dostępu?",
    focusNow: "Dla developerów - teraz",
    focusSoon: "Dla designerów - wkrótce",
    soonTag: "Wkrótce",
    faqPriceQ: "Ile kosztuje zadanie?",
    faqPriceA: "Zadania zaczynają się od $40, z 10% prowizją Pico. Pełną cenę widzisz przed publikacją. Ceny są w dolarach, bez przewalutowania.",
    whyOldW: ["Długie lub bezpodstawne odrzucenia na starcie", "Zamrożone płatności", "Zwroty dla klienta po oddaniu pracy", "Blokady bez odwołania"],
    whyPicoW: ["Krótki test zamiast ręcznej akceptacji", "Jasne kryteria uzgodnione przed startem", "Niezależna recenzja Twojej pracy", "Wypłata po akceptacji pracy - wtedy obciążany jest klient"],
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
    consentNote: "Dołączając, zgadzasz się na e-maile o starcie Pico. Możesz zrezygnować w każdej chwili.",
    secTitle: ["Twój kod. ","Twoje zasady."],
    secLead: "Oddanie kodu komuś nowemu to największa obawa. W Pico to Ty decydujesz, co widzi specjalista, a po zapłacie kod należy do Ciebie.",
    secItems: [{"title":"Najpierw poufność","body":"Specjaliści akceptują warunki poufności, zanim zobaczą brief lub kod. Po zapłacie oddany kod należy do Ciebie."},{"title":"Umiejętności sprawdzone testem","body":"Każdy specjalista przechodzi test umiejętności na czas, zanim weźmie płatne zlecenie."},{"title":"Ty kontrolujesz dostęp","body":"Udostępnij tylko to, czego wymaga zadanie: osobną gałąź, fork lub dane testowe. Po zakończeniu odbierz dostęp."},{"title":"Bez kluczy produkcyjnych","body":"Zadania nie wymagają haseł ani kluczy do produkcji. Pomożemy opisać błąd tak, by wystarczyły dane testowe."}],
    secCard: {"title":"Dostęp do zadania","active":"Aktywny","nda":"Warunki zaakceptowane","id":"Test zaliczony","env":"Tylko dane testowe"},
    faqNdaQ: "Czy moje zadanie jest poufne?",
    faqNdaA: "Tak. Specjaliści, recenzenci i audytorzy akceptują warunki poufności, zanim zobaczą zadanie. Nie publikujemy ani nie udostępniamy Twojego zadania, kodu ani oddanej pracy.",
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
    securedOn: "Kartenzahlung nach dem Review",
    formSub: "Wähle, wie du Pico nutzen willst.",
    hireSub: "Kurze Aufgaben posten",
    workSub: "Bezahlte Aufgaben übernehmen",
    nextTitle: "So geht’s weiter",
    next: ["Trag dich ein - dauert eine Minute.", "Wir schreiben dir, sobald Early Access startet.", "Poste deine erste Aufgabe oder übernimm eine."],
    editAnswer: "Antwort bearbeiten",
    emailStep: "Letzter Schritt: Wohin sollen wir deine Early-Access-Einladung schicken?",
    focusNow: "Für Entwickler - jetzt",
    focusSoon: "Für Designer - bald",
    soonTag: "Bald",
    faqPriceQ: "Was kostet eine Aufgabe?",
    faqPriceA: "Aufgaben starten bei $40, inklusive 10% Pico-Gebühr. Den vollen Preis siehst du vor dem Veröffentlichen. Preise in US-Dollar, ohne Währungsumrechnung.",
    whyOldW: ["Lange oder grundlose Ablehnungen beim Einstieg", "Eingefrorene Zahlungen", "Rückerstattung an den Kunden nach Abgabe", "Sperren ohne Einspruch"],
    whyPicoW: ["Kurzer Skill-Test statt manueller Freigabe", "Klare Kriterien, vor dem Start vereinbart", "Unabhängiges Review deiner Arbeit", "Bezahlung, wenn die Arbeit abgenommen ist - dann wird der Kunde belastet"],
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
    consentNote: "Mit dem Eintragen stimmst du E-Mails zum Start von Pico zu. Abmeldung jederzeit möglich.",
    secTitle: ["Dein Code. ","Deine Regeln."],
    secLead: "Code an jemand Neues zu geben, ist die größte Sorge. Bei Pico entscheidest du, was die Fachkraft sieht, und nach der Zahlung gehört der Code dir.",
    secItems: [{"title":"Vertraulichkeit zuerst","body":"Fachkräfte akzeptieren Vertraulichkeitsbedingungen, bevor sie Briefing oder Code sehen. Nach der Zahlung gehört der gelieferte Code dir."},{"title":"Mit Skill-Test","body":"Jede Fachkraft besteht einen zeitlich begrenzten Skill-Test, bevor sie bezahlte Arbeit übernimmt."},{"title":"Du steuerst den Zugriff","body":"Teile nur, was die Aufgabe braucht: einen eigenen Branch, einen Fork oder Testdaten. Entziehe den Zugriff, wenn die Aufgabe erledigt ist."},{"title":"Keine Produktionsschlüssel","body":"Aufgaben brauchen keine Passwörter oder Schlüssel für die Produktion. Wir helfen dir, den Bug so zu beschreiben, dass Testdaten reichen."}],
    secCard: {"title":"Aufgabenzugriff","active":"Aktiv","nda":"Bedingungen akzeptiert","id":"Skill-Test bestanden","env":"Nur Testdaten"},
    faqNdaQ: "Bleibt meine Aufgabe vertraulich?",
    faqNdaA: "Ja. Fachkräfte, Reviewer und Auditoren akzeptieren Vertraulichkeitsbedingungen, bevor sie eine Aufgabe sehen. Wir veröffentlichen oder teilen weder deine Aufgabe noch deinen Code oder die gelieferte Arbeit.",
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
    securedOn: "Оплата карткою після перевірки",
    formSub: "Обери, як користуватимешся Pico.",
    hireSub: "Публікуй короткі задачі",
    workSub: "Бери оплачувані задачі",
    nextTitle: "Що далі",
    next: ["Приєднайся до списку - це хвилина.", "Ми напишемо, коли відкриється ранній доступ.", "Опублікуй першу задачу або візьми її."],
    editAnswer: "Змінити відповідь",
    emailStep: "Останній крок - куди надіслати запрошення на ранній доступ?",
    focusNow: "Для розробників - зараз",
    focusSoon: "Для дизайнерів - скоро",
    soonTag: "Скоро",
    faqPriceQ: "Скільки коштує задача?",
    faqPriceA: "Задачі — від $40, комісія Pico 10% уже включена. Повну ціну видно до публікації. Ціни в доларах, без конвертації.",
    whyOldW: ["Довге або безпідставне відхилення на вході", "Заморожені платежі", "Повернення коштів клієнту після здачі", "Блокування без апеляції"],
    whyPicoW: ["Короткий тест замість ручного схвалення", "Чіткі критерії, погоджені до старту", "Незалежне рев’ю твоєї роботи", "Оплата після схвалення роботи - саме тоді списуються кошти клієнта"],
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
    consentNote: "Приєднуючись, ти погоджуєшся отримувати листи про запуск Pico. Відписатися можна будь-коли.",
    secTitle: ["Твій код. ","Твої правила."],
    secLead: "Віддати код новій людині - найбільший страх. У Pico ти сам вирішуєш, що бачить фахівець, а після оплати код належить тобі.",
    secItems: [{"title":"Спершу конфіденційність","body":"Фахівці приймають умови конфіденційності ще до того, як побачать бриф чи код. Після оплати зданий код належить тобі."},{"title":"Навички перевірено тестом","body":"Кожен фахівець проходить тест навичок на час, перш ніж братися за оплачувану роботу."},{"title":"Доступ контролюєш ти","body":"Давай лише те, що потрібно для задачі: окрему гілку, форк або тестові дані. Після завершення закрий доступ."},{"title":"Без ключів від продакшну","body":"Для задачі не потрібні паролі чи ключі від продакшну. Ми допоможемо описати баг так, щоб вистачило тестових даних."}],
    secCard: {"title":"Доступ до задачі","active":"Активний","nda":"Умови прийнято","id":"Тест пройдено","env":"Лише тестові дані"},
    faqNdaQ: "Чи конфіденційна моя задача?",
    faqNdaA: "Так. Фахівці, рев’юери й аудитори приймають умови конфіденційності ще до того, як побачать задачу. Ми не публікуємо й нікому не передаємо твою задачу, код чи здану роботу.",
  },
};
