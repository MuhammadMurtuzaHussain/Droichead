"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CalendarPlus,
  CheckCircle,
  Code,
  Cube,
  LinkedinLogo,
  LockSimple,
  MapPin,
  Newspaper,
  TrendUp,
  Translate,
} from "@phosphor-icons/react";
import { DEMO_PROFILES, FIXTURES } from "@/data/demo";
import { db } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import { IMAGES } from "@/lib/images";
import type { Locale } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;
const reveal = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.25 }, transition: { duration: 0.7, ease } };

export default function Home() {
  const { t, setLocale } = useI18n();
  const router = useRouter();
  const profile = useLiveQuery(() => db.profile.get("me"));
  const aoife = FIXTURES.aoife;

  // Load the local model into memory while the visitor reads the page.
  useEffect(() => {
    fetch("/api/health", { method: "POST" }).catch(() => {});
  }, []);

  async function tryDemo(key: "aoife" | "oksana", locale: Locale) {
    await db.profile.put({ ...DEMO_PROFILES[key], id: "me", updatedAt: Date.now() });
    setLocale(locale);
    router.push("/pulse");
  }

  return (
    <div className="space-y-28 sm:space-y-36 pt-8 sm:pt-14">
      {/* Hero: asymmetric split */}
      <section className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        <motion.div className="lg:col-span-7 space-y-7" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <p className="text-sm font-medium text-brand">{t("home.kicker")}</p>
          <h1 className="text-[2.6rem] leading-[1.04] sm:text-5xl xl:text-[3.6rem] font-semibold tracking-[-0.035em]">
            {t("home.title")
              .split(/(?<=[.!?])\s+/)
              .map((line, i) => (
                <span key={i} className={`block ${i > 0 ? "text-brand" : ""}`}>
                  {line}
                </span>
              ))}
          </h1>
          <p className="text-lg text-muted max-w-[46ch] leading-relaxed">{t("home.sub")}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={profile && !profile.demo ? "/pulse" : "/start"} className="btn btn-primary text-base px-6 py-4">
              {profile && !profile.demo ? t("home.continue") : t("home.cta")} <ArrowRight size={18} weight="bold" />
            </Link>
            <a href="#demo" className="btn btn-quiet text-base px-6 py-4">
              {t("home.demoCta")}
            </a>
          </div>
        </motion.div>

        <motion.div className="lg:col-span-5 relative" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease, delay: 0.1 }}>
          <div className="relative overflow-hidden rounded-[20px] aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] lift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGES.dublin.src} alt={IMAGES.dublin.alt} width={IMAGES.dublin.w} height={IMAGES.dublin.h} fetchPriority="high" className="absolute inset-0 size-full object-cover object-[60%_center]" />
          </div>
          {/* Real component preview: Aoife's gap, offset off the photo edge */}
          <motion.div
            className="panel lift absolute -bottom-8 left-4 right-4 sm:left-auto sm:-left-8 sm:right-auto sm:w-[340px] p-5 space-y-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.45 }}
          >
            <div className="text-sm">
              <span className="font-semibold">Aoife</span>
              <span className="text-muted"> {t("home.preview.to")} </span>
              <span className="font-semibold">Forward Deployed Engineer</span>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-brand">{t("g.have")}</div>
              <div className="flex flex-wrap gap-1.5">
                {aoife.gap.have.slice(0, 2).map((s) => (
                  <span key={s} className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-peat">{t("g.build")}</div>
              <div className="flex flex-wrap gap-1.5">
                {aoife.gap.build.slice(0, 2).map((s) => (
                  <span key={s} className="rounded-full bg-peat-soft px-2.5 py-1 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Wish, goal, strategy, action */}
      <motion.section {...reveal} className="space-y-10">
        <h2 className="text-3xl sm:text-4xl font-semibold max-w-[22ch]">{t("home.steps.title")}</h2>
        <ol className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {(["wish", "goal", "strategy", "action"] as const).map((s, i) => (
            <motion.li key={s} className="border-t-2 pt-5 space-y-2" style={{ borderColor: i === 3 ? "var(--brand)" : "var(--line)" }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: i * 0.09 }}>
              <div className={`text-2xl sm:text-3xl font-semibold tracking-tight ${i === 3 ? "text-brand" : ""}`}>{t(`home.step.${s}`)}</div>
              <p className="text-muted">{t(`home.step.${s}.d`)}</p>
            </motion.li>
          ))}
        </ol>
      </motion.section>

      {/* Bento: 3 items, 3 cells */}
      <section className="grid md:grid-cols-12 gap-4">
        <motion.div {...reveal} className="md:col-span-7 rounded-[20px] bg-brand-soft p-7 sm:p-9 flex flex-col gap-6">
          <TrendUp size={28} className="text-brand" />
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">{t("home.b1")}</h3>
            <p className="text-muted max-w-[48ch]">{t("home.b1.d")}</p>
          </div>
          <ul className="mt-auto divide-y divide-ink/10">
            {[...aoife.roles].sort((a, b) => b.matchPct - a.matchPct).map((r) => (
              <li key={r.title} className="flex items-center justify-between py-3 gap-4">
                <span className="font-medium">{r.title}</span>
                <span className="font-mono text-sm text-brand">{r.matchPct}%</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.08 }} className="md:col-span-5 panel overflow-hidden flex flex-col">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.cork.src} alt={IMAGES.cork.alt} width={IMAGES.cork.w} height={IMAGES.cork.h} loading="lazy" className="w-full aspect-[16/10] object-cover" />
          <div className="p-7 space-y-2">
            <Newspaper size={26} className="text-brand" />
            <h3 className="text-2xl font-semibold">{t("home.b2")}</h3>
            <p className="text-muted">{t("home.b2.d")}</p>
          </div>
        </motion.div>

        <motion.div {...reveal} className="md:col-span-12 rounded-[20px] bg-deep text-on-deep p-7 sm:p-9 grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-5 space-y-2">
            <h3 className="text-2xl sm:text-3xl font-semibold">{t("home.b3")}</h3>
            <p className="text-on-deep/70 max-w-[44ch]">{t("home.b3.d")}</p>
          </div>
          <ul className="lg:col-span-7 grid grid-cols-2 gap-x-6 gap-y-5">
            {[
              [CalendarPlus, "home.b3.cal"],
              [Briefcase, "home.b3.jobs"],
              [LinkedinLogo, "home.b3.posts"],
              [MapPin, "home.b3.events"],
            ].map(([Icon, key]) => {
              const I = Icon as typeof CalendarPlus;
              return (
                <li key={key as string} className="flex items-start gap-3">
                  <I size={22} className="shrink-0 text-[#7fd8b2]" />
                  <span className="text-sm text-on-deep/85">{t(key as string)}</span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </section>

      {/* Demo personas */}
      <section id="demo" className="scroll-mt-24 space-y-8">
        <motion.h2 {...reveal} className="text-3xl sm:text-4xl font-semibold">
          {t("demo.title")}
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-4">
          {(
            [
              ["aoife", "en", "A"],
              ["oksana", "uk", "О"],
            ] as const
          ).map(([key, loc, initial], i) => (
            <motion.button
              key={key}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.08 }}
              onClick={() => tryDemo(key, loc)}
              className="group panel p-7 text-left flex flex-col gap-5 hover:border-brand transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`grid place-items-center size-12 rounded-full text-lg font-semibold ${i === 0 ? "bg-brand-soft text-brand" : "bg-gorse-soft text-gorse"}`}>{initial}</span>
                <div>
                  <div className="font-semibold text-lg">{t(`demo.${key}.name`)}</div>
                  <div className="text-sm text-muted">{loc === "uk" ? "Українська" : "English"}</div>
                </div>
              </div>
              <p className="text-muted">{t(`demo.${key}.story`)}</p>
              <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
                {t("demo.open")} <ArrowUpRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Private and open */}
      <section className="grid lg:grid-cols-12 gap-10">
        <motion.h2 {...reveal} className="lg:col-span-5 text-3xl sm:text-4xl font-semibold max-w-[16ch]">
          {t("home.trust.title")}
        </motion.h2>
        <ul className="lg:col-span-7 divide-y divide-line border-y border-line">
          {[
            [LockSimple, "home.trust.1"],
            [Cube, "home.trust.2"],
            [Translate, "home.trust.3"],
            [Code, "home.trust.4"],
          ].map(([Icon, key], i) => {
            const I = Icon as typeof LockSimple;
            return (
              <motion.li key={key as string} className="flex gap-4 py-5" initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: i * 0.07 }}>
                <I size={22} className="shrink-0 text-brand mt-0.5" />
                <p>{t(key as string)}</p>
              </motion.li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-[20px] border border-line p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-semibold">{t("home.final")}</h2>
          <p className="text-muted flex items-center gap-2">
            <CheckCircle size={18} className="text-brand" /> {t("home.final.d")}
          </p>
        </div>
        <Link href="/start" className="btn btn-primary text-base px-6 py-4">
          {t("home.cta")} <ArrowRight size={18} weight="bold" />
        </Link>
      </section>
    </div>
  );
}
