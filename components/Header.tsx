"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Bridge, CaretDown, Translate } from "@phosphor-icons/react";
import { db } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/types";

export function Mark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-grid place-items-center size-8 rounded-[10px] bg-brand text-on-brand ${className}`} aria-hidden="true">
      <Bridge size={20} weight="bold" />
    </span>
  );
}

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const path = usePathname();
  const profile = useLiveQuery(() => db.profile.get("me"));
  const planCount = useLiveQuery(() => db.plans.count());

  const link = (href: string, label: string) => (
    <Link
      href={href}
      aria-current={path.startsWith(href) ? "page" : undefined}
      className="hidden sm:inline-flex px-3.5 py-2 rounded-full text-sm font-medium text-muted hover:text-ink aria-[current=page]:text-ink aria-[current=page]:bg-surface-2"
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2.5 mr-auto">
          <Mark />
          <span className="text-[17px] font-semibold tracking-tight">Droichead</span>
        </Link>
        {profile && link("/pulse", t("nav.pulse"))}
        {!!planCount && link("/plan", t("nav.plan"))}
        <label className="relative inline-flex items-center gap-1.5 rounded-full border border-line bg-surface pl-3 pr-8 h-9 text-sm font-medium hover:border-ink/40 focus-within:border-brand">
          <Translate size={16} className="text-muted" aria-hidden />
          <span className="sr-only">{t("nav.language")}</span>
          <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} className="appearance-none bg-transparent outline-none cursor-pointer">
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_NAMES[l]}
              </option>
            ))}
          </select>
          <CaretDown size={12} className="absolute right-3 text-muted pointer-events-none" aria-hidden />
        </label>
      </div>
    </header>
  );
}
