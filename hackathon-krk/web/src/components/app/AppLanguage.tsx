"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  LANDING_LANGUAGES,
  type LandingLanguage,
} from "@/components/landingTranslations";

export const APP_LANGUAGE_STORAGE_KEY = "pico:appLanguage";

export function isLandingLanguage(value: string | null): value is LandingLanguage {
  return LANDING_LANGUAGES.some((item) => item.code === value);
}

export const APP_COPY = {
  en: {
    language: "Language",
    languages: LANDING_LANGUAGES,
    chrome: {
      workspace: "Workspace", account: "Account", pico: "Pico", tools: "Tools",
      home: "Home", tasks: "My tasks", chats: "Chats", balance: "Balance",
      history: "History", profile: "Company profile", settings: "Settings",
      help: "Help & disputes", about: "About Pico", how: "How it works",
      createTask: "Create task", operator: "Operator", workroom: "Workroom",
      taskDetails: "Task details", search: "Search…", searchTasks: "Search tasks",
      hiring: "Hiring", working: "Working", mode: "Mode", notifications: "Notifications",
      howItWorks: "How it works", devnetWallet: "Devnet wallet",
      workerAccount: "Worker account", companyAccount: "Company account",
      connectWallet: "Connect wallet",
    },
    home: {
      eyebrow: "Workspace · Hiring", title: "Home",
      description: "Find a qualified specialist for urgent work — even a single task. Pico helps you move from brief to delivery without a lengthy hiring process.",
      postTask: "Post a task", workspace: "Your workspace",
      heroTitle: "Need a specialist, fast?",
      heroDescription: "Describe the result you need. Connect with qualified people ready to take on focused work, from a quick fix to a second pair of expert eyes.",
      briefPlaceholder: "What do you need done?",
      briefLabel: "Task description", createTask: "Find a specialist",
      activeTasks: "Active tasks", totalTasks: "Total tasks", inEscrow: "Held for tasks",
      devnet: "USDC · Devnet", balance: "Balance", available: "Available",
      locked: "Held for tasks", paid: "Paid out", balanceDetails: "View balance details →",
      updates: "Recent updates", notifications: "Notifications", allActivity: "All activity →",
      caughtUp: "You’re all caught up.", tasks: "My tasks", newTask: "New task",
      filterTasks: "Filter tasks", all: "All", active: "Active", completed: "Completed",
      drafts: "Drafts", cancelled: "Cancelled", noTasks: "No tasks in this filter.",
      worker: "Specialist",
    },
  },
  es: {
    language: "Idioma",
    languages: LANDING_LANGUAGES,
    chrome: {
      workspace: "Espacio de trabajo", account: "Cuenta", pico: "Pico", tools: "Herramientas",
      home: "Inicio", tasks: "Mis tareas", chats: "Chats", balance: "Saldo",
      history: "Historial", profile: "Perfil de empresa", settings: "Ajustes",
      help: "Ayuda y disputas", about: "Acerca de Pico", how: "Cómo funciona",
      createTask: "Crear tarea", operator: "Operador", workroom: "Sala de trabajo",
      taskDetails: "Detalles de la tarea", search: "Buscar…", searchTasks: "Buscar tareas",
      hiring: "Contratación", working: "Trabajo", mode: "Modo", notifications: "Notificaciones",
      howItWorks: "Cómo funciona", devnetWallet: "Billetera Devnet",
      workerAccount: "Cuenta de especialista", companyAccount: "Cuenta de empresa",
      connectWallet: "Conectar billetera",
    },
    home: {
      eyebrow: "Espacio de trabajo · Contratación", title: "Inicio",
      description: "Encuentra a un especialista cualificado para trabajos urgentes, incluso una sola tarea. Pasa del encargo a la entrega sin un largo proceso de contratación.",
      postTask: "Publicar tarea", workspace: "Tu espacio de trabajo",
      heroTitle: "¿Necesitas un especialista pronto?",
      heroDescription: "Describe el resultado que buscas. Encuentra profesionales cualificados para tareas concretas, desde una solución rápida hasta una segunda opinión experta.",
      briefPlaceholder: "¿Qué necesitas resolver?",
      briefLabel: "Descripción de la tarea", createTask: "Encontrar especialista",
      activeTasks: "Tareas activas", totalTasks: "Tareas totales", inEscrow: "Reservado para tareas",
      devnet: "USDC · Devnet", balance: "Saldo", available: "Disponible",
      locked: "Reservado para tareas", paid: "Pagado", balanceDetails: "Ver detalles del saldo →",
      updates: "Novedades recientes", notifications: "Notificaciones", allActivity: "Toda la actividad →",
      caughtUp: "Estás al día.", tasks: "Mis tareas", newTask: "Nueva tarea",
      filterTasks: "Filtrar tareas", all: "Todas", active: "Activas", completed: "Completadas",
      drafts: "Borradores", cancelled: "Canceladas", noTasks: "No hay tareas con este filtro.",
      worker: "Especialista",
    },
  },
  pl: {
    language: "Język",
    languages: LANDING_LANGUAGES,
    chrome: {
      workspace: "Przestrzeń robocza", account: "Konto", pico: "Pico", tools: "Narzędzia",
      home: "Strona główna", tasks: "Moje zadania", chats: "Czaty", balance: "Saldo",
      history: "Historia", profile: "Profil firmy", settings: "Ustawienia",
      help: "Pomoc i spory", about: "O Pico", how: "Jak to działa",
      createTask: "Utwórz zadanie", operator: "Operator", workroom: "Pokój pracy",
      taskDetails: "Szczegóły zadania", search: "Szukaj…", searchTasks: "Szukaj zadań",
      hiring: "Zlecanie", working: "Praca", mode: "Tryb", notifications: "Powiadomienia",
      howItWorks: "Jak to działa", devnetWallet: "Portfel Devnet",
      workerAccount: "Konto specjalisty", companyAccount: "Konto firmy",
      connectWallet: "Połącz portfel",
    },
    home: {
      eyebrow: "Przestrzeń robocza · Zlecanie", title: "Strona główna",
      description: "Znajdź sprawdzonego specjalistę do pilnego zadania, nawet jednego. Przejdź od opisu do realizacji bez długiego procesu rekrutacji.",
      postTask: "Opublikuj zadanie", workspace: "Twoja przestrzeń robocza",
      heroTitle: "Potrzebujesz specjalisty na już?",
      heroDescription: "Opisz, czego potrzebujesz. Znajdź sprawdzone osoby do konkretnego zadania — od szybkiej poprawki po ekspercką konsultację.",
      briefPlaceholder: "Co trzeba zrobić?",
      briefLabel: "Opis zadania", createTask: "Znajdź specjalistę",
      activeTasks: "Aktywne zadania", totalTasks: "Wszystkie zadania", inEscrow: "Zabezpieczone na zadania",
      devnet: "USDC · Devnet", balance: "Saldo", available: "Dostępne",
      locked: "Zabezpieczone na zadania", paid: "Wypłacone", balanceDetails: "Szczegóły salda →",
      updates: "Ostatnie aktualizacje", notifications: "Powiadomienia", allActivity: "Cała aktywność →",
      caughtUp: "Wszystko jest aktualne.", tasks: "Moje zadania", newTask: "Nowe zadanie",
      filterTasks: "Filtruj zadania", all: "Wszystkie", active: "Aktywne", completed: "Ukończone",
      drafts: "Wersje robocze", cancelled: "Anulowane", noTasks: "Brak zadań z tym filtrem.",
      worker: "Specjalista",
    },
  },
  de: {
    language: "Sprache",
    languages: LANDING_LANGUAGES,
    chrome: {
      workspace: "Arbeitsbereich", account: "Konto", pico: "Pico", tools: "Werkzeuge",
      home: "Startseite", tasks: "Meine Aufgaben", chats: "Chats", balance: "Guthaben",
      history: "Verlauf", profile: "Unternehmensprofil", settings: "Einstellungen",
      help: "Hilfe & Konflikte", about: "Über Pico", how: "So funktioniert es",
      createTask: "Aufgabe erstellen", operator: "Operator", workroom: "Arbeitsraum",
      taskDetails: "Aufgabendetails", search: "Suchen…", searchTasks: "Aufgaben suchen",
      hiring: "Auftraggeber", working: "Arbeit", mode: "Modus", notifications: "Benachrichtigungen",
      howItWorks: "So funktioniert es", devnetWallet: "Devnet-Wallet",
      workerAccount: "Fachkraft-Konto", companyAccount: "Unternehmenskonto",
      connectWallet: "Wallet verbinden",
    },
    home: {
      eyebrow: "Arbeitsbereich · Beauftragen", title: "Startseite",
      description: "Finde schnell qualifizierte Fachkräfte für dringende Arbeit, auch für einzelne Aufgaben. Vom Briefing bis zur Lieferung ohne langwierige Personalsuche.",
      postTask: "Aufgabe einstellen", workspace: "Dein Arbeitsbereich",
      heroTitle: "Du brauchst schnell Fachwissen?",
      heroDescription: "Beschreibe das gewünschte Ergebnis. Finde qualifizierte Fachkräfte für konkrete Aufgaben – von der schnellen Korrektur bis zur Expertenmeinung.",
      briefPlaceholder: "Was soll erledigt werden?",
      briefLabel: "Aufgabenbeschreibung", createTask: "Fachkraft finden",
      activeTasks: "Aktive Aufgaben", totalTasks: "Aufgaben gesamt", inEscrow: "Für Aufgaben reserviert",
      devnet: "USDC · Devnet", balance: "Guthaben", available: "Verfügbar",
      locked: "Für Aufgaben reserviert", paid: "Ausgezahlt", balanceDetails: "Guthabendetails ansehen →",
      updates: "Neueste Updates", notifications: "Benachrichtigungen", allActivity: "Alle Aktivitäten →",
      caughtUp: "Du bist auf dem neuesten Stand.", tasks: "Meine Aufgaben", newTask: "Neue Aufgabe",
      filterTasks: "Aufgaben filtern", all: "Alle", active: "Aktiv", completed: "Abgeschlossen",
      drafts: "Entwürfe", cancelled: "Abgebrochen", noTasks: "Keine Aufgaben für diesen Filter.",
      worker: "Fachkraft",
    },
  },
  uk: {
    language: "Мова",
    languages: LANDING_LANGUAGES,
    chrome: {
      workspace: "Робочий простір", account: "Обліковий запис", pico: "Pico", tools: "Інструменти",
      home: "Головна", tasks: "Мої завдання", chats: "Чати", balance: "Баланс",
      history: "Історія", profile: "Профіль компанії", settings: "Налаштування",
      help: "Допомога та спори", about: "Про Pico", how: "Як це працює",
      createTask: "Створити завдання", operator: "Оператор", workroom: "Робоча кімната",
      taskDetails: "Деталі завдання", search: "Пошук…", searchTasks: "Шукати завдання",
      hiring: "Замовник", working: "Виконавець", mode: "Режим", notifications: "Сповіщення",
      howItWorks: "Як це працює", devnetWallet: "Гаманець Devnet",
      workerAccount: "Обліковий запис фахівця", companyAccount: "Обліковий запис компанії",
      connectWallet: "Підключити гаманець",
    },
    home: {
      eyebrow: "Робочий простір · Замовлення", title: "Головна",
      description: "Швидко знайдіть кваліфікованого фахівця для термінової роботи — навіть для одного завдання. Від опису до результату без довгого найму.",
      postTask: "Опублікувати завдання", workspace: "Ваш робочий простір",
      heroTitle: "Терміново потрібен фахівець?",
      heroDescription: "Опишіть потрібний результат. Знайдіть перевірених фахівців для конкретних задач — від швидкого виправлення до експертної оцінки.",
      briefPlaceholder: "Що потрібно зробити?",
      briefLabel: "Опис завдання", createTask: "Знайти фахівця",
      activeTasks: "Активні завдання", totalTasks: "Усього завдань", inEscrow: "Зарезервовано на завдання",
      devnet: "USDC · Devnet", balance: "Баланс", available: "Доступно",
      locked: "Зарезервовано на завдання", paid: "Виплачено", balanceDetails: "Деталі балансу →",
      updates: "Останні оновлення", notifications: "Сповіщення", allActivity: "Уся активність →",
      caughtUp: "Ви переглянули всі оновлення.", tasks: "Мої завдання", newTask: "Нове завдання",
      filterTasks: "Фільтрувати завдання", all: "Усі", active: "Активні", completed: "Завершені",
      drafts: "Чернетки", cancelled: "Скасовані", noTasks: "Немає завдань за цим фільтром.",
      worker: "Фахівець",
    },
  },
} satisfies Record<LandingLanguage, {
  language: string;
  languages: typeof LANDING_LANGUAGES;
  chrome: Record<string, string>;
  home: Record<string, string>;
}>;

type AppLanguageContextValue = {
  language: LandingLanguage;
  setLanguage: (language: LandingLanguage) => void;
};

const AppLanguageContext = createContext<AppLanguageContextValue | null>(null);

export function AppLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LandingLanguage>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
      if (isLandingLanguage(stored)) setLanguageState(stored);
    } catch {
      return;
    }
  }, []);

  function setLanguage(nextLanguage: LandingLanguage) {
    setLanguageState(nextLanguage);
    try {
      window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      return;
    }
  }

  return (
    <AppLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </AppLanguageContext.Provider>
  );
}

export function useAppLanguage() {
  const value = useContext(AppLanguageContext);
  if (!value) throw new Error("useAppLanguage must be used within AppLanguageProvider");
  return value;
}
