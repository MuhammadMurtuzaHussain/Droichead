"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { db, getCached, setCached } from "@/lib/db";
import { isoDate, postJSON, profileForApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { Gap, Plan, Profile, Pulse, SpotlightRole } from "@/lib/types";

const PRESETS = [3, 6, 12];

function addMonths(m: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + m);
  return isoDate(d);
}

function GapColumn({ title, items, tone, icon }: { title: string; items: string[]; tone: "brand" | "accent" | "warm"; icon: string }) {
  const bg = { brand: "bg-brand-soft", accent: "bg-accent-soft", warm: "bg-warm-soft" }[tone];
  const border = { brand: "border-brand", accent: "border-accent", warm: "border-warm" }[tone];
  return (
    <div className={`rounded-2xl p-4 ${bg} border-t-4 ${border}`}>
      <h3 className="font-bold mb-2">
        {icon} {title}
      </h3>
      <ul className="space-y-1.5 text-sm">
        {items.map((s, i) => (
          <motion.li key={s} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            {s}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function RolePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale } = useI18n();
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
      try {
        const g = await postJSON<Gap>("/api/gap", { profile: profileForApi(p), role: { slug: r.slug, title: r.title, summary: r.summary }, locale });
        await setCached(key, g);
        setGap(g);
      } catch {
        setGapError(true);
      }
    })();
  }, [decoded, locale, router]);

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
  const minDate = addMonths(1);

  return (
    <div className="space-y-8">
      <Link href="/pulse" className="text-sm font-semibold text-muted hover:text-brand">
        ← {t("r.back")}
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`chip text-xs ${role.momentum === "rising" ? "bg-accent-soft border-accent" : ""}`}>{role.momentum === "rising" ? `🔥 ${t("p.rising")}` : `📈 ${t("p.steady")}`}</span>
          <span className="chip text-xs text-brand">{t("p.match", { n: Math.round(role.matchPct) })}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold">{role.title}</h1>
        <p className="text-lg text-muted max-w-3xl">{role.summary}</p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        <section className="card p-5">
          <h2 className="font-bold text-lg mb-1">☀️ {t("r.day")}</h2>
          <p>{role.dayInLife}</p>
        </section>
        <section className="card p-5">
          <h2 className="font-bold text-lg mb-1">📈 {t("r.why")}</h2>
          <p>{role.why}</p>
        </section>
      </div>

      <section className="card p-5 sm:p-6 space-y-4">
        <h2 className="text-2xl font-bold">{t("r.gap")}</h2>
        {!gap && !gapError && <p className="text-muted animate-pulse">{t("r.gap.loading")}</p>}
        {gapError && <p className="text-warm">{t("err.generic")}</p>}
        {gap && (
          <>
            <div className="grid sm:grid-cols-3 gap-3">
              <GapColumn title={t("g.have")} items={gap.have} tone="brand" icon="✅" />
              <GapColumn title={t("g.partial")} items={gap.partial} tone="accent" icon="🟡" />
              <GapColumn title={t("g.build")} items={gap.build} tone="warm" icon="🧱" />
            </div>
            <p className="font-serif text-lg italic">{gap.encouragement}</p>
            <p className="text-sm text-muted font-semibold">⏱ {t("r.estimate", { weeks: Math.round(gap.weeksEstimate), hours: profile.hoursPerWeek })}</p>
          </>
        )}
      </section>

      <section className="rounded-[2rem] bg-brand-deep text-white p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="text-3xl font-bold">🌉 {t("r.cta")}</h2>
          <p className="text-white/80 text-lg">
            {t("b.title")}: {t("b.sub")}
          </p>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">{t("b.by")}</div>
          <div className="flex flex-wrap gap-2 items-center">
            {PRESETS.map((m) => {
              const v = addMonths(m);
              return (
                <button key={m} onClick={() => setGoal(v)} aria-pressed={goal === v} className={`chip border-white/30 ${goal === v ? "!bg-accent !text-ink !border-accent" : "!bg-transparent text-white"}`}>
                  {t("b.months", { n: m })}
                </button>
              );
            })}
            <input type="date" min={minDate} value={goal} onChange={(e) => e.target.value && setGoal(e.target.value)} className="rounded-full px-4 py-1.5 text-ink bg-white font-semibold" aria-label={t("b.by")} />
          </div>
        </div>
        <button className="btn bg-accent text-ink text-lg hover:brightness-105" onClick={build} disabled={building || !gap}>
          {building ? t("b.loading") : `${t("b.make")} →`}
        </button>
        {buildError && <p className="text-accent">{t("err.generic")}</p>}
      </section>
    </div>
  );
}
