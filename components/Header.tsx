"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "motion/react";
import { Bridge, CaretDown, Translate } from "@phosphor-icons/react";
import { db } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/types";

const ease = [0.32, 0.72, 0, 1] as const;

export function Mark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-grid place-items-center size-8 rounded-full bg-brand text-on-brand shadow-[0_6px_20px_-6px_rgb(82_211_162/0.7)] ${className}`} aria-hidden="true">
      <Bridge size={18} weight="bold" />
    </span>
  );
}

function LangSelect({ className = "" }: { className?: string }) {
  const { t, locale, setLocale } = useI18n();
  return (
    <label className={`relative items-center gap-1.5 rounded-full pl-3 pr-8 h-9 text-sm font-medium bg-white/[0.04] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.09)] hover:bg-white/[0.08] transition-colors ${className}`}>
      <Translate size={16} className="text-muted" aria-hidden />
      <span className="sr-only">{t("nav.language")}</span>
      <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} className="appearance-none bg-transparent outline-none cursor-pointer">
        {LOCALES.map((l) => (
          <option key={l} value={l} className="bg-surface">
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
      <CaretDown size={12} className="absolute right-3 text-muted pointer-events-none" aria-hidden />
    </label>
  );
}

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const path = usePathname();
  const profile = useLiveQuery(() => db.profile.get("me"));
  const planCount = useLiveQuery(() => db.plans.count());
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const links = [
    ...(profile ? [{ href: "/pulse", label: t("nav.pulse") }] : []),
    ...(planCount ? [{ href: "/plan", label: t("nav.plan") }] : []),
  ];

  return (
    <>
      <header className="print:hidden fixed top-4 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center gap-1 rounded-full p-1.5 pr-1.5 bg-[#0b1713]/70 backdrop-blur-xl shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_20px_50px_-20px_rgb(0_0_0/0.8)] w-full max-w-[720px] md:w-max">
          <Link href="/" className="flex items-center gap-2.5 pl-1 pr-3 mr-auto md:mr-2">
            <Mark />
            <span className="text-[15px] font-semibold tracking-tight">Droichead</span>
          </Link>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path.startsWith(l.href) ? "page" : undefined}
              className="hidden md:inline-flex px-4 h-9 items-center rounded-full text-sm font-medium text-muted hover:text-ink transition-colors aria-[current=page]:text-ink aria-[current=page]:bg-white/[0.07]"
            >
              {l.label}
            </Link>
          ))}
          <LangSelect className="hidden md:inline-flex ml-1" />
          {/* Hamburger morphs into an X */}
          <button
            className="md:hidden relative size-10 rounded-full bg-white/[0.05] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`absolute left-1/2 top-1/2 h-[1.5px] w-4 -translate-x-1/2 bg-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
            <span className={`absolute left-1/2 top-1/2 h-[1.5px] w-4 -translate-x-1/2 bg-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-20 md:hidden bg-[#07110e]/85 backdrop-blur-3xl pt-28 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <ul className="space-y-2">
              {[{ href: "/", label: "Droichead" }, ...links, { href: "/start", label: t("home.cta") }].map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.08 + i * 0.06 }}>
                  <Link href={l.href} className="block text-4xl font-semibold tracking-tight py-2">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div className="mt-10 flex flex-wrap gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.3 }}>
              {LOCALES.map((l) => (
                <button key={l} onClick={() => setLocale(l)} aria-pressed={locale === l} className="option rounded-full px-4 h-10 text-sm">
                  {LOCALE_NAMES[l]}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
