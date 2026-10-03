"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { LOCALES, type Locale } from "./types";
import en from "@/messages/en.json";
import ga from "@/messages/ga.json";
import pl from "@/messages/pl.json";
import uk from "@/messages/uk.json";
import es from "@/messages/es.json";
import de from "@/messages/de.json";
import fr from "@/messages/fr.json";

type Messages = Record<string, string>;
const MESSAGES: Record<Locale, Messages> = { en, ga, pl, uk, es, de, fr };
const STORAGE_KEY = "droichead.locale";

export type TFn = (key: string, vars?: Record<string, string | number>) => string;

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TFn;
  formatDate: (iso: string, opts?: Intl.DateTimeFormatOptions) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

function detect(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && LOCALES.includes(saved)) return saved;
  } catch {}
  const nav = (typeof navigator !== "undefined" ? navigator.language : "en").slice(0, 2) as Locale;
  return LOCALES.includes(nav) ? nav : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(detect());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const t = useCallback<TFn>(
    (key, vars) => {
      let s = MESSAGES[locale]?.[key] ?? MESSAGES.en[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    },
    [locale],
  );

  const formatDate = useCallback(
    (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) => {
      const d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
      if (isNaN(d.getTime())) return iso;
      // Irish date formatting support varies by browser; fall back to en-IE.
      try {
        return new Intl.DateTimeFormat(locale === "en" ? "en-IE" : locale, opts).format(d);
      } catch {
        return new Intl.DateTimeFormat("en-IE", opts).format(d);
      }
    },
    [locale],
  );

  return <Ctx.Provider value={{ locale, setLocale, t, formatDate }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n outside I18nProvider");
  return c;
}
