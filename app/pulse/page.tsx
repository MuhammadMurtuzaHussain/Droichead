"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { db, getCached, setCached } from "@/lib/db";
import { postJSON, profileForApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { Profile, Pulse } from "@/lib/types";

const pulseKey = (p: Profile, locale: string) => `pulse:${locale}:${p.updatedAt}`;

function Skeleton({ h = 20 }: { h?: number }) {
  return <div className="skeleton" style={{ height: h }} />;
}

export default function PulsePage() {
  const { t, locale, formatDate } = useI18n();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pulse, setPulse] = useState<(Pulse & { offline?: boolean }) | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (force = false) => {
      const p = await db.profile.get("me");
      if (!p) return router.replace("/start");
      setProfile(p);
      setError(false);
      const key = pulseKey(p, locale);
      const hit = !force && (await getCached<Pulse>(key));
      if (hit) return setPulse(hit);
      setPulse(null);
      try {
        const data = await postJSON<Pulse>("/api/pulse", { profile: profileForApi(p), locale });
        await setCached(key, data);
        await setCached("pulse:last", data);
        setPulse(data);
      } catch {
        setError(true);
      }
    },
    [locale, router],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold">{profile.name ? t("p.hello", { name: profile.name }) : t("p.hello.anon")}</h1>
        <p className="text-muted text-lg">
          {t("p.for", { role: profile.role, industry: t(`ind.${profile.industry}`), city: profile.city })}
          {" · "}
          <Link href="/start" className="underline underline-offset-4">
            {t("s.profile.edit")}
          </Link>
        </p>
        <p className="inline-flex items-center gap-2 rounded-2xl bg-brand-soft px-4 py-2 text-sm font-semibold">💚 {t("p.calm")}</p>
      </header>

      {error && (
        <div className="card p-5 flex items-center gap-4">
          <span>{t("err.generic")}</span>
          <button className="btn btn-primary ml-auto" onClick={() => load(true)}>
            {t("err.retry")}
          </button>
        </div>
      )}

      {/* Spotlight roles: the main call to action */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">{t("p.roles")}</h2>
            <p className="text-muted">{t("p.roles.sub")}</p>
          </div>
          <button className="btn btn-ghost text-sm py-1.5" onClick={() => load(true)} disabled={!pulse}>
            ↻ {t("p.refresh")}
          </button>
        </div>
        {!pulse && !error && <p className="text-muted animate-pulse">{t("p.loading")}</p>}
        <div className="grid sm:grid-cols-2 gap-4">
          {!pulse && !error && [0, 1, 2, 3].map((i) => <div key={i} className="card p-5 space-y-3"><Skeleton h={22} /><Skeleton h={14} /><Skeleton h={14} /></div>)}
          {pulse?.roles.map((r, i) => (
            <motion.div key={r.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link href={`/role/${encodeURIComponent(r.slug)}`} className="card p-5 flex flex-col gap-3 h-full hover:border-brand hover:-translate-y-0.5 transition">
                <div className="flex items-start gap-3">
                  <h3 className="text-xl font-bold flex-1">{r.title}</h3>
                  <span className={`chip text-xs ${r.momentum === "rising" ? "bg-accent-soft border-accent" : ""}`}>{r.momentum === "rising" ? `🔥 ${t("p.rising")}` : `📈 ${t("p.steady")}`}</span>
                </div>
                <p className="text-muted text-sm flex-1">{r.summary}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-line overflow-hidden" aria-hidden>
                    <div className="h-full bg-brand rounded-full" style={{ width: `${r.matchPct}%` }} />
                  </div>
                  <span className="text-sm font-bold text-brand">{t("p.match", { n: Math.round(r.matchPct) })}</span>
                </div>
                <span className="font-bold text-brand">{t("p.explore")} →</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* News */}
        <section className="lg:col-span-3 space-y-3">
          <div>
            <h2 className="text-2xl font-bold">{t("p.news")}</h2>
            <p className="text-muted text-sm">{t("p.news.sub")}</p>
          </div>
          {!pulse && !error && [0, 1, 2].map((i) => <div key={i} className="card p-4 space-y-2"><Skeleton h={18} /><Skeleton h={12} /></div>)}
          {pulse && pulse.news.length === 0 && <p className="card p-4 text-muted">{t("p.noNews")}</p>}
          {pulse?.news.map((n) => (
            <article key={n.url} className="card p-4 space-y-2">
              <a href={n.url} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-brand leading-snug block">
                {n.title} ↗
              </a>
              <div className="text-xs text-muted">
                {n.source}
                {n.date && ` · ${formatDate(n.date, { day: "numeric", month: "short" })}`}
              </div>
              {n.soWhat && (
                <p className="text-sm border-l-4 border-accent pl-3">
                  <span className="font-bold">{t("p.soWhat")}: </span>
                  {n.soWhat}
                </p>
              )}
            </article>
          ))}
        </section>

        <aside className="lg:col-span-2 space-y-4">
          <section className="card p-5 space-y-3">
            <h2 className="text-xl font-bold">🔄 {t("p.shifts")}</h2>
            {!pulse && <Skeleton h={60} />}
            <ul className="space-y-2">
              {pulse?.roleShifts.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-brand font-bold" aria-hidden>→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5 space-y-2 bg-accent-soft/40">
            <h2 className="text-xl font-bold">🌦️ {t("p.economy")}</h2>
            {!pulse && <Skeleton h={60} />}
            <p className="text-sm">{pulse?.economy}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
