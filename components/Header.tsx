"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/types";

export function Logo({ size = 28 }: { size?: number }) {
  // A simple arch bridge over water.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      <path d="M4 20 Q16 6 28 20" fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M4 20 H28" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10 20 V15.5 M16 20 V13 M22 20 V15.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 25 q2.5 -2 5 0 t5 0 t5 0 t5 0" fill="none" stroke="#7FB3D5" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const profile = useLiveQuery(() => db.profile.get("me"));
  const planCount = useLiveQuery(() => db.plans.count());

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-bold">
          <Logo />
          <span>Droichead</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm font-semibold">
          {profile && (
            <Link href="/pulse" className="px-3 py-2 rounded-full hover:bg-brand-soft">
              {t("nav.pulse")}
            </Link>
          )}
          {!!planCount && (
            <Link href="/plan" className="px-3 py-2 rounded-full hover:bg-brand-soft">
              {t("nav.plan")}
            </Link>
          )}
          <label className="sr-only" htmlFor="lang">
            {t("nav.language")}
          </label>
          <select
            id="lang"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="ml-1 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold"
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_NAMES[l]}
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}
