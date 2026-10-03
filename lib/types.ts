export const LOCALES = ["en", "ga", "pl", "uk", "es", "de", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ga: "Gaeilge",
  pl: "Polski",
  uk: "Українська",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
};

/** English name of each locale, used when instructing the model. */
export const LOCALE_ENGLISH: Record<Locale, string> = {
  en: "English",
  ga: "Irish (Gaeilge)",
  pl: "Polish",
  uk: "Ukrainian",
  es: "Spanish",
  de: "German",
  fr: "French",
};

export type Level = "junior" | "mid" | "senior" | "lead";
export type WorkMode = "remote" | "hybrid" | "onsite" | "any";

export interface Profile {
  id: "me";
  name?: string;
  role: string;
  industry: string;
  level: Level;
  history: string;
  skills: string[];
  aiFeeling: 1 | 2 | 3 | 4;
  hoursPerWeek: number;
  country: string;
  city: string;
  workMode: WorkMode;
  demo?: string;
  updatedAt: number;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  date?: string;
  soWhat: string;
}

export interface Pulse {
  news: NewsItem[];
  roleShifts: string[];
  economy: string;
  roles: SpotlightRole[];
  /** Client-only: news still loading. */
  newsPending?: boolean;
}

export interface SpotlightRole {
  slug: string;
  title: string;
  summary: string;
  why: string;
  dayInLife: string;
  momentum: "rising" | "steady";
  matchPct: number;
}

export interface Gap {
  have: string[];
  partial: string[];
  build: string[];
  weeksEstimate: number;
  encouragement: string;
}

export interface Phase {
  name: string;
  goal: string;
  startWeek: number;
  endWeek: number;
}

export interface PlanTask {
  id: string;
  phaseIndex: number;
  week: number;
  title: string;
  minutes: number;
  resourceId?: string;
  done: boolean;
}

export interface Post {
  milestone: string;
  text: string;
}

export interface Plan {
  id: string;
  roleSlug: string;
  roleTitle: string;
  goalDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  totalWeeks: number;
  locale: Locale;
  phases: Phase[];
  tasks: PlanTask[];
  project: { title: string; brief: string };
  resourceIds: string[];
  posts?: Post[];
  createdAt: number;
}

export interface CachedItem<T = unknown> {
  key: string;
  data: T;
  fetchedAt: number;
}
