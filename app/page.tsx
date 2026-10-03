"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "framer-motion";
import { DEMO_PROFILES } from "@/data/demo";
import { db } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const STEPS = ["wish", "goal", "strategy", "action"] as const;
const STEP_ICON = { wish: "✨", goal: "🎯", strategy: "🗺️", action: "👣" };

export default function Home() {
  const { t, setLocale } = useI18n();
  const router = useRouter();
  const profile = useLiveQuery(() => db.profile.get("me"));

  async function tryDemo(key: "aoife" | "oksana", locale: Locale) {
    await db.profile.put({ ...DEMO_PROFILES[key], id: "me", updatedAt: Date.now() });
    setLocale(locale);
    router.push("/pulse");
  }

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-brand-deep text-white px-6 py-12 sm:px-12 sm:py-16">
        <svg className="absolute -right-10 -bottom-6 opacity-20 w-[420px] max-w-[80%]" viewBox="0 0 400 200" aria-hidden="true">
          <path d="M0 160 Q200 0 400 160" fill="none" stroke="#E8B83A" strokeWidth="10" />
          <path d="M0 160 H400" stroke="#fff" strokeWidth="8" />
          {[60, 110, 160, 200, 240, 290, 340].map((x) => (
            <path key={x} d={`M${x} 160 V${160 - Math.sin((x / 400) * Math.PI) * 120 + 20}`} stroke="#fff" strokeWidth="4" />
          ))}
        </svg>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative max-w-2xl space-y-5">
          <p className="text-accent font-bold tracking-wide text-sm uppercase">{t("home.kicker")}</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">{t("home.title")}</h1>
          <p className="text-lg text-white/85">{t("home.sub")}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/start" className="btn bg-accent text-ink hover:brightness-105 text-base">
              {t("home.cta")} →
            </Link>
            {profile && (
              <Link href="/pulse" className="btn border border-white/40 text-white hover:bg-white/10">
                {t("home.continue")}
              </Link>
            )}
          </div>
          <div className="pt-3 text-sm text-white/80 flex flex-wrap items-center gap-2">
            <span>{t("home.demo")}:</span>
            <button onClick={() => tryDemo("aoife", "en")} className="underline underline-offset-4 hover:text-accent">
              {t("home.demo.aoife")}
            </button>
            <span aria-hidden>·</span>
            <button onClick={() => tryDemo("oksana", "uk")} className="underline underline-offset-4 hover:text-accent">
              {t("home.demo.oksana")}
            </button>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Wish, goal, strategy, action">
        {STEPS.map((s, i) => (
          <motion.div key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className="card p-5 relative">
            <div className="text-2xl" aria-hidden>
              {STEP_ICON[s]}
            </div>
            <div className="mt-2 font-serif text-xl font-bold">{t(`home.step.${s}`)}</div>
            <div className="text-muted text-sm">{t(`home.step.${s}.d`)}</div>
            {i < 3 && <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 text-brand font-bold z-10">→</div>}
          </motion.div>
        ))}
      </section>

      <blockquote className="text-center max-w-3xl mx-auto font-serif text-xl sm:text-2xl italic text-ink/80 leading-relaxed">“{t("home.quote")}”</blockquote>

      <section className="grid sm:grid-cols-3 gap-4">
        {(["f1", "f2", "f3"] as const).map((f, i) => (
          <div key={f} className="card p-6">
            <div className="h-1.5 w-10 rounded-full mb-4" style={{ background: ["var(--accent-2)", "var(--accent)", "var(--brand)"][i] }} />
            <h3 className="text-xl font-bold mb-1">{t(`home.${f}`)}</h3>
            <p className="text-muted">{t(`home.${f}.d`)}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm text-muted text-center">
        <span className="chip">🔒 {t("home.privacy")}</span>
        <span className="chip">🌊 {t("home.powered")}</span>
      </section>
    </div>
  );
}
