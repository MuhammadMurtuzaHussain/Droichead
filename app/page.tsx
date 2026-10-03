"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Briefcase, CalendarPlus, Cube, LinkedinLogo, LockSimple, MapPin, Newspaper, Printer, SealCheck, Translate, TrendUp } from "@phosphor-icons/react";
import { BridgeStory, CountUp, Reveal, RoleMorph, Spotlight, WordCycle, ease, useHeroParallax } from "@/components/landing";
import { DEMO_PROFILES, FIXTURES } from "@/data/demo";
import { db } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import { IMAGES } from "@/lib/images";
import type { Locale } from "@/lib/types";

// Real outputs from Droichead runs (demo personas and a live Gemma run).
const PAIRS = [
  { from: "Software developer", to: "Forward Deployed Engineer", fit: 84 },
  { from: "Accountant", to: "AI-enabled Finance Analyst", fit: 86 },
  { from: "Customer support agent", to: "AI Solutions Engineer", fit: 85 },
];
const BRIDGE_WORDS = [
  { word: "Droichead", lang: "Gaeilge" },
  { word: "Bridge", lang: "English" },
  { word: "Most", lang: "Polski" },
  { word: "Міст", lang: "Українська" },
  { word: "Puente", lang: "Español" },
  { word: "Brücke", lang: "Deutsch" },
  { word: "Pont", lang: "Français" },
];
const wrap = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

export default function Home() {
  const { t, setLocale } = useI18n();
  const router = useRouter();
  const profile = useLiveQuery(() => db.profile.get("me"));
  const aoife = FIXTURES.aoife;
  const hero = useHeroParallax();

  // Load the local model into memory while the visitor reads the page.
  useEffect(() => {
    fetch("/api/health", { method: "POST" }).catch(() => {});
  }, []);

  async function tryDemo(key: "aoife" | "oksana", locale: Locale) {
    await db.profile.put({ ...DEMO_PROFILES[key], id: "me", updatedAt: Date.now() });
    setLocale(locale);
    router.push("/pulse");
  }

  const startHref = profile && !profile.demo ? "/pulse" : "/start";
  const words = t("home.title").split(/(?<=[.!?])\s+/);

  return (
    <div>
      {/* HERO: full-bleed photo, editorial split */}
      <section ref={hero.ref} className="relative min-h-[100dvh] flex items-end overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: hero.y, opacity: hero.fade }} aria-hidden>
          <motion.img
            src={IMAGES.dublin.src}
            alt=""
            width={IMAGES.dublin.w}
            height={IMAGES.dublin.h}
            fetchPriority="high"
            className="size-full object-cover object-[65%_center]"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.4, ease }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/20" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" aria-hidden />

        <div className={`${wrap} relative grid lg:grid-cols-12 gap-12 items-end pt-36 pb-16 sm:pb-24`}>
          <div className="lg:col-span-7 space-y-8">
            <motion.span className="pill-tag" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.2 }}>
              <span className="size-1.5 rounded-full bg-brand" aria-hidden /> {t("home.kicker")}
            </motion.span>
            <h1 className="text-[2.9rem] leading-[1] sm:text-7xl xl:text-[5.6rem] font-semibold tracking-[-0.045em]">
              {words.map((line, i) => (
                <span key={i} className="block overflow-hidden pb-[0.08em]">
                  <motion.span className={`block ${i > 0 ? "text-gradient" : ""}`} initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, ease, delay: 0.3 + i * 0.12 }}>
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p className="text-lg sm:text-xl text-ink/75 max-w-[44ch] leading-relaxed" initial={{ opacity: 0, y: 16, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1, ease, delay: 0.6 }}>
              {t("home.sub")}
            </motion.p>
            <motion.div className="flex flex-wrap items-center gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.75 }}>
              <Link href={startHref} className="group btn btn-primary btn-island text-base">
                {profile && !profile.demo ? t("home.continue") : t("home.cta")}
                <span className="btn-orb">
                  <ArrowRight size={16} weight="bold" />
                </span>
              </Link>
              <a href="#demo" className="btn btn-quiet text-base">
                {t("home.demoCta")}
              </a>
            </motion.div>
          </div>
          <motion.div className="lg:col-span-5" initial={{ opacity: 0, y: 40, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.1, ease, delay: 0.9 }}>
            <RoleMorph pairs={PAIRS} fromLabel={t("home.morph.from")} toLabel={t("home.morph.to")} fitLabel={t("home.morph.fit")} caption={t("home.morph.caption")} />
          </motion.div>
        </div>
      </section>

      {/* Scroll story: the bridge draws itself */}
      <BridgeStory
        title={t("home.steps.title")}
        steps={(["wish", "goal", "strategy", "action"] as const).map((s) => ({ label: t(`home.step.${s}`), desc: t(`home.step.${s}.d`) }))}
      />

      {/* Asymmetric bento: 4 items, 4 cells */}
      <section className={`${wrap} py-24 sm:py-32`}>
        <div className="grid md:grid-cols-12 gap-4">
          <Reveal className="md:col-span-7 md:row-span-2">
            <Spotlight className="bezel h-full">
              <div className="core-brand h-full p-8 sm:p-10 flex flex-col gap-8">
                <TrendUp size={32} weight="light" className="text-brand" />
                <div className="space-y-3">
                  <h3 className="text-3xl sm:text-4xl font-semibold leading-tight">{t("home.b1")}</h3>
                  <p className="text-muted max-w-[46ch]">{t("home.b1.d")}</p>
                </div>
                <ul className="mt-auto space-y-1">
                  {[...aoife.roles]
                    .sort((a, b) => b.matchPct - a.matchPct)
                    .map((r, i) => (
                      <li key={r.title} className="flex items-center justify-between gap-4 rounded-2xl px-4 py-3.5 transition-colors hover:bg-white/[0.04]">
                        <span className="font-medium">{r.title}</span>
                        <span className={`font-mono text-lg tabular-nums ${i === 0 ? "text-brand" : "text-muted"}`}>
                          <CountUp to={r.matchPct} suffix="%" />
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </Spotlight>
          </Reveal>

          <Reveal className="md:col-span-5" delay={0.08}>
            <Spotlight className="bezel h-full">
              <div className="core h-full overflow-hidden flex flex-col">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={IMAGES.cork.src} alt={IMAGES.cork.alt} width={IMAGES.cork.w} height={IMAGES.cork.h} loading="lazy" className="w-full aspect-[16/9] object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" aria-hidden />
                </div>
                <div className="p-7 space-y-2 -mt-6 relative">
                  <Newspaper size={28} weight="light" className="text-brand" />
                  <h3 className="text-2xl font-semibold">{t("home.b2")}</h3>
                  <p className="text-muted">{t("home.b2.d")}</p>
                </div>
              </div>
            </Spotlight>
          </Reveal>

          <Reveal className="md:col-span-5" delay={0.14}>
            <Spotlight className="bezel h-full">
              <div className="core h-full p-7 flex flex-col justify-between gap-6">
                <WordCycle words={BRIDGE_WORDS} />
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <Translate size={24} weight="light" className="text-brand" /> {t("home.b4")}
                  </h3>
                  <p className="text-muted">{t("home.b4.d")}</p>
                </div>
              </div>
            </Spotlight>
          </Reveal>

          <Reveal className="md:col-span-12">
            <Spotlight className="bezel">
              <div className="core p-8 sm:p-10 grid lg:grid-cols-12 gap-10 items-end">
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-3xl sm:text-4xl font-semibold leading-tight">{t("home.b3")}</h3>
                  <p className="text-muted max-w-[44ch]">{t("home.b3.d")}</p>
                </div>
                <ul className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
                  {(
                    [
                      [CalendarPlus, "home.b3.cal"],
                      [Printer, "home.b3.print"],
                      [Briefcase, "home.b3.jobs"],
                      [LinkedinLogo, "home.b3.posts"],
                      [MapPin, "home.b3.events"],
                      [SealCheck, "home.trust.4"],
                    ] as const
                  ).map(([I, key], i) => (
                    <motion.li key={key} className="flex items-start gap-3 rounded-2xl p-4 bg-white/[0.025] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: i * 0.06 }}>
                      <I size={22} weight="light" className="shrink-0 text-brand mt-0.5" />
                      <span className="text-sm text-ink/85 leading-relaxed">{t(key)}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Spotlight>
          </Reveal>
        </div>
      </section>

      {/* Personas */}
      <section id="demo" className={`${wrap} scroll-mt-28 py-24 sm:py-32 space-y-12`}>
        <Reveal>
          <h2 className="text-4xl sm:text-6xl font-semibold max-w-[16ch] leading-[1.02]">{t("demo.title")}</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-4">
          {(
            [
              ["aoife", "en", "A"],
              ["oksana", "uk", "О"],
            ] as const
          ).map(([key, loc, initial], i) => (
            <Reveal key={key} delay={i * 0.1}>
              <Spotlight className="bezel h-full">
                <button onClick={() => tryDemo(key, loc)} className="group core w-full h-full p-8 text-left flex flex-col gap-8">
                  <div className="flex items-center gap-4">
                    <span className={`grid place-items-center size-14 rounded-[18px] text-xl font-semibold ${i === 0 ? "bg-brand/15 text-brand" : "bg-gorse/15 text-gorse"}`}>{initial}</span>
                    <div>
                      <div className="font-semibold text-xl">{t(`demo.${key}.name`)}</div>
                      <div className="text-sm text-muted">{loc === "uk" ? "Українська" : "English"}</div>
                    </div>
                  </div>
                  <p className="text-ink/75 text-lg leading-relaxed">{t(`demo.${key}.story`)}</p>
                  <span className="mt-auto inline-flex items-center gap-3 font-semibold">
                    {t("demo.open")}
                    <span className="grid place-items-center size-9 rounded-full bg-white/[0.06] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:bg-brand group-hover:text-on-brand">
                      <ArrowUpRight size={16} weight="bold" />
                    </span>
                  </span>
                </button>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className={`${wrap} py-24 sm:py-32 grid lg:grid-cols-12 gap-12`}>
        <Reveal className="lg:col-span-5">
          <h2 className="text-4xl sm:text-5xl font-semibold leading-[1.04] max-w-[14ch]">{t("home.trust.title")}</h2>
        </Reveal>
        <ul className="lg:col-span-7 space-y-3">
          {(
            [
              [LockSimple, "home.trust.1"],
              [Cube, "home.trust.2"],
              [Translate, "home.trust.3"],
            ] as const
          ).map(([I, key], i) => (
            <Reveal key={key} delay={i * 0.08}>
              <li className="flex gap-5 items-start rounded-[22px] p-6 bg-white/[0.025] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]">
                <span className="grid place-items-center size-11 shrink-0 rounded-full bg-brand/12 text-brand">
                  <I size={20} weight="light" />
                </span>
                <p className="text-ink/85 text-lg leading-relaxed">{t(key)}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Final CTA */}
      <section className={`${wrap} pb-12`}>
        <Reveal>
          <div className="bezel">
            <div className="core-brand relative overflow-hidden px-8 py-16 sm:px-16 sm:py-24 text-center flex flex-col items-center gap-8">
              <h2 className="text-4xl sm:text-6xl font-semibold leading-[1.02] max-w-[18ch]">{t("home.final")}</h2>
              <p className="text-muted text-lg">{t("home.final.d")}</p>
              <Link href={startHref} className="group btn btn-primary btn-island text-base">
                {profile && !profile.demo ? t("home.continue") : t("home.cta")}
                <span className="btn-orb">
                  <ArrowRight size={16} weight="bold" />
                </span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
