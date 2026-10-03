"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, CircleHalf, Clock, Sun, TrendUp, type Icon } from "@phosphor-icons/react";
import { db, getCached, setCached } from "@/lib/db";
import { isoDate, postJSON, profileForApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { Gap, Plan, Profile, Pulse, SpotlightRole } from "@/lib/types";

const PRESETS = [3, 6, 12];
const ease = [0.16, 1, 0.3, 1] as const;

function addMonths(m: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + m);
  return isoDate(d);
}

function GapColumn({ title, items, tone, icon: I, delay }: { title: string; items: string[]; tone: "brand" | "gorse" | "peat"; icon: Icon; delay: number }) {
  const bg = { brand: "bg-brand-soft", gorse: "bg-gorse-soft", peat: "bg-peat-soft" }[tone];
  const fg = { brand: "text-brand", gorse: "text-gorse", peat: "text-peat" }[tone];
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease, delay }} className={`rounded-[22px] ${bg} p-6 space-y-4`}>
      <h3 className={`font-semibold flex items-center gap-2 ${fg}`}>
        <I size={20} weight="fill" /> {title}
      </h3>
      <ul className="space-y-2.5">
        {items.map((s) => (
          <li key={s} className="text-[15px] leading-snug">
            {s}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function RolePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale, ready } = useI18n();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<SpotlightRole | null>(null);
  const [gap, setGap] = useState<Gap | null>(null);
  const [gapError, setGapError] = useState(false);
  const [goal, setGoal] = useState(addMonths(6));
  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState(false);
  const decoded = useMemo(() => decodeURIComponent(slug), [slug]);

  useEffect(() => {
    if (!ready) return;
    let stale = false;
    (async () => {
      const p = await db.profile.get("me");
      if (!p) return router.replace("/start");
      setProfile(p);
      const pulse = await getCached<Pulse>("pulse:last", Infinity);
      const r = pulse?.roles.find((x) => x.slug === decoded);
      if (!r) return router.replace("/pulse");
      setRole(r);
      const key = `gap:${decoded}:${locale}:${p.updatedAt}`;
      const hit = await getCached<Gap>(key);
      if (hit) return setGap(hit);
      setGap(null);
      setGapError(false);
      try {
        const g = await postJSON<Gap>("/api/gap", { profile: profileForApi(p), role: { slug: r.slug, title: r.title, summary: r.summary }, locale });
        await setCached(key, g);
        if (!stale) setGap(g);
      } catch {
        if (!stale) setGapError(true);
      }
    })();
    return () => {
      stale = true;
    };
  }, [decoded, locale, ready, router]);

  async function build() {
    if (!profile || !role) return;
    setBuilding(true);
    setBuildError(false);
    try {
      const startDate = isoDate(new Date());
      const res = await postJSON<Omit<Plan, "id" | "roleSlug" | "roleTitle" | "goalDate" | "startDate" | "locale" | "createdAt">>("/api/plan", {
        profile: profileForApi(profile),
        role: { slug: role.slug, title: role.title, summary: role.summary },
        gap: gap ?? undefined,
        goalDate: goal,
        startDate,
        locale,
      });
      const plan: Plan = { ...res, id: `${role.slug}-${Date.now()}`, roleSlug: role.slug, roleTitle: role.title, goalDate: goal, startDate, locale, createdAt: Date.now() };
      await db.plans.put(plan);
      router.push("/plan");
    } catch {
      setBuildError(true);
      setBuilding(false);
    }
  }

  if (!role || !profile) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 space-y-16">
      <div className="space-y-6">
        <Link href="/pulse" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft size={16} /> {t("r.back")}
        </Link>
        <header className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 space-y-4">
            <h1 className="text-4xl sm:text-6xl font-semibold leading-[1.02] tracking-[-0.035em]">{role.title}</h1>
            <p className="text-lg text-muted max-w-[60ch]">{role.summary}</p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end items-baseline gap-3">
            <span className="font-mono text-5xl font-medium text-brand">{Math.round(role.matchPct)}%</span>
            <span className="text-muted">{t("p.match")}</span>
            {role.momentum === "rising" && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
                <TrendUp size={16} weight="bold" /> {t("p.rising")}
              </span>
            )}
          </div>
        </header>
      </div>

      <div className="grid md:grid-cols-2 gap-8 border-t border-line pt-8">
        <section className="space-y-2">
          <h2 className="font-semibold flex items-center gap-2">
            <Sun size={20} className="text-brand" /> {t("r.day")}
          </h2>
          <p className="text-[17px] leading-relaxed">{role.dayInLife}</p>
        </section>
        <section className="space-y-2">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendUp size={20} className="text-brand" /> {t("r.why")}
          </h2>
          <p className="text-[17px] leading-relaxed">{role.why}</p>
        </section>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-semibold">{t("r.gap")}</h2>
        {!gap && !gapError && (
          <div className="grid md:grid-cols-3 gap-4" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-[22px] bg-surface-2 p-6 space-y-3">
                <div className="skeleton h-5 w-1/2" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-4/5" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            ))}
            <p className="text-sm text-muted md:col-span-3">{t("r.gap.loading")}</p>
          </div>
        )}
        {gapError && (
          <p role="alert" className="text-peat">
            {t("err.generic")}
          </p>
        )}
        {gap && (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <GapColumn title={t("g.have")} items={gap.have} tone="brand" icon={CheckCircle} delay={0} />
              <GapColumn title={t("g.partial")} items={gap.partial} tone="gorse" icon={CircleHalf} delay={0.08} />
              <GapColumn title={t("g.build")} items={gap.build} tone="peat" icon={Circle} delay={0.16} />
            </div>
            <div className="grid lg:grid-cols-12 gap-4 items-start">
              <p className="lg:col-span-8 text-xl leading-relaxed">{gap.encouragement}</p>
              <p className="lg:col-span-4 lg:justify-self-end text-sm text-muted flex items-center gap-2">
                <Clock size={18} /> {t("r.estimate", { weeks: Math.round(gap.weeksEstimate), hours: profile.hoursPerWeek })}
              </p>
            </div>
          </>
        )}
      </section>

      <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="rounded-[28px] core-brand !rounded-[28px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] text-on-deep p-7 sm:p-10 grid lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-6 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-semibold">{t("r.cta")}</h2>
          <p className="text-on-deep/75 text-lg max-w-[42ch]">{t("b.sub")}</p>
        </div>
        <div className="lg:col-span-6 space-y-5">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-on-deep/75 mb-3">{t("b.by")}</legend>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESETS.map((m) => {
                const v = addMonths(m);
                const on = goal === v;
                return (
                  <button key={m} onClick={() => setGoal(v)} aria-pressed={on} className={`rounded-full px-4 h-10 text-sm font-semibold border transition-colors ${on ? "bg-on-deep text-deep border-on-deep" : "border-on-deep/30 hover:border-on-deep"}`}>
                    {t("b.months", { n: m })}
                  </button>
                );
              })}
              <input type="date" min={addMonths(1)} value={goal} onChange={(e) => e.target.value && setGoal(e.target.value)} aria-label={t("b.by")} className="rounded-full h-10 px-4 bg-transparent border border-on-deep/30 text-on-deep font-mono text-sm [color-scheme:dark]" />
            </div>
          </fieldset>
          <button className="btn btn-on-deep text-base px-6 py-4" onClick={build} disabled={building || !gap}>
            {building ? (
              <>
                <span className="size-4 rounded-full border-2 border-deep/30 border-t-deep animate-spin" aria-hidden /> {t("b.loading")}
              </>
            ) : (
              <>
                {t("b.make")} <ArrowRight size={18} weight="bold" />
              </>
            )}
          </button>
          {buildError && (
            <p role="alert" className="text-[#f3b9a5]">
              {t("err.generic")}
            </p>
          )}
        </div>
      </motion.section>
    </div>
  );
}
