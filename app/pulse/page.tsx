"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowClockwise, ArrowRight, ArrowUpRight, ArrowsClockwise, CloudSun, Minus, PencilSimple, TrendUp } from "@phosphor-icons/react";
import { db, getCached, setCached } from "@/lib/db";
import { postJSON, profileForApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { Profile, Pulse, SpotlightRole } from "@/lib/types";

const pulseKey = (p: Profile, locale: string) => `pulse:${locale}:${p.updatedAt}`;
const ease = [0.16, 1, 0.3, 1] as const;

function Momentum({ m }: { m: SpotlightRole["momentum"] }) {
  const { t } = useI18n();
  return m === "rising" ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
      <TrendUp size={14} weight="bold" /> {t("p.rising")}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
      <Minus size={14} weight="bold" /> {t("p.steady")}
    </span>
  );
}

export default function PulsePage() {
  const { t, locale, ready, formatDate } = useI18n();
  const run = useRef(0);
  const ctrl = useRef<AbortController | null>(null);
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (force = false) => {
      if (!ready) return;
      const id = ++run.current;
      const live = () => id === run.current; // ignore responses from a superseded load
      ctrl.current?.abort();
      const ac = (ctrl.current = new AbortController());
      const p = await db.profile.get("me");
      if (!p) return router.replace("/start");
      setProfile(p);
      setError(false);
      const key = pulseKey(p, locale);
      const hit = !force && (await getCached<Pulse>(key));
      if (hit) {
        await setCached("pulse:last", hit);
        return live() && setPulse(hit);
      }
      setPulse(null);
      const body = { profile: profileForApi(p), locale };
      // Roles and news are separate calls so the roles (the main action) render first.
      const rolesP = postJSON<Pick<Pulse, "roles">>("/api/pulse", { ...body, part: "roles" }, ac.signal).then((r) => {
        if (!live()) return r;
        setPulse((cur) => ({ news: [], roleShifts: [], economy: "", ...cur, roles: r.roles, newsPending: !cur?.economy }) as Pulse);
        setCached("pulse:last", { news: [], roleShifts: [], economy: "", roles: r.roles });
        return r;
      });
      const newsP = postJSON<Pick<Pulse, "news" | "roleShifts" | "economy">>("/api/pulse", { ...body, part: "news" }, ac.signal).then((n) => {
        if (!live()) return n;
        setPulse((cur) => ({ roles: [], ...cur, ...n, newsPending: false }) as Pulse);
        return n;
      });
      try {
        const [r, n] = await Promise.all([rolesP, newsP]);
        if (!live()) return;
        const data: Pulse = { ...n, roles: r.roles };
        await setCached(key, data);
        await setCached("pulse:last", data);
      } catch {
        if (live()) setError(true);
      }
    },
    [locale, ready, router],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Cancel in-flight generations when leaving the page.
  useEffect(() => () => ctrl.current?.abort(), []);

  if (!profile) return null;
  const [top, ...rest] = pulse?.roles ?? [];

  return (
    <div className="pt-8 sm:pt-12 space-y-14">
      <header className="space-y-4 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.05]">{profile.name ? t("p.hello", { name: profile.name }) : t("p.hello.anon")}</h1>
        <p className="text-lg text-muted flex flex-wrap items-center gap-x-3 gap-y-1">
          {t("p.for", { role: profile.role, industry: t(`ind.${profile.industry}`), city: profile.city })}
          <Link href="/start" className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-brand">
            <PencilSimple size={14} /> {t("s.profile.edit")}
          </Link>
        </p>
        <p className="text-base border-l-2 border-brand pl-4">{t("p.calm")}</p>
      </header>

      {error && (
        <div role="alert" className="panel p-5 flex flex-wrap items-center gap-4">
          <span>{t("err.generic")}</span>
          <button className="btn btn-primary ml-auto" onClick={() => load(true)}>
            <ArrowClockwise size={16} /> {t("err.retry")}
          </button>
        </div>
      )}

      {/* Roles */}
      <section className="space-y-6">
        <div className="flex items-end gap-4">
          <div className="space-y-1 flex-1">
            <h2 className="text-2xl sm:text-3xl font-semibold">{t("p.roles")}</h2>
            <p className="text-muted">{t("p.roles.sub")}</p>
          </div>
          <button className="btn btn-quiet !py-2 !px-3.5 text-sm" onClick={() => load(true)} disabled={!pulse || pulse.newsPending} aria-label={t("p.refresh")}>
            <ArrowsClockwise size={16} /> <span className="hidden sm:inline">{t("p.refresh")}</span>
          </button>
        </div>

        {!pulse?.roles.length && !error && (
          <div className="grid lg:grid-cols-12 gap-4" aria-busy="true" aria-label={t("p.loading")}>
            <div className="lg:col-span-7 rounded-[20px] bg-surface-2 p-8 space-y-4">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-9 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <p className="text-sm text-muted pt-4">{t("p.loading")}</p>
            </div>
            <div className="lg:col-span-5 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="panel p-5 space-y-2">
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        )}

        {top && (
          <div className="grid lg:grid-cols-12 gap-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="lg:col-span-7">
              <Link href={`/role/${encodeURIComponent(top.slug)}`} className="group block h-full rounded-[20px] bg-deep text-on-deep p-7 sm:p-9">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-on-deep/70">{t("p.top")}</span>
                  <span className="font-mono text-sm">
                    <span className="text-3xl font-medium text-[#7fd8b2]">{Math.round(top.matchPct)}%</span> <span className="text-on-deep/60">{t("p.match")}</span>
                  </span>
                </div>
                <h3 className="mt-6 text-3xl sm:text-4xl font-semibold leading-tight">{top.title}</h3>
                <p className="mt-3 text-on-deep/80 max-w-[55ch]">{top.summary}</p>
                <p className="mt-4 text-sm text-on-deep/60 max-w-[55ch]">{top.why}</p>
                <span className="mt-8 btn btn-on-deep">
                  {t("p.explore")} <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
            <ul className="lg:col-span-5 flex flex-col gap-3">
              {rest.map((r, i) => (
                <motion.li key={r.slug} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.07 }} className="flex-1">
                  <Link href={`/role/${encodeURIComponent(r.slug)}`} className="group panel h-full p-5 flex flex-col gap-2 hover:border-brand transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold leading-snug">{r.title}</h3>
                      <span className="font-mono text-sm text-brand shrink-0">{Math.round(r.matchPct)}%</span>
                    </div>
                    <p className="text-sm text-muted line-clamp-2">{r.summary}</p>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <Momentum m={r.momentum} />
                      <ArrowUpRight size={18} className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-10">
        {/* News */}
        <section className="lg:col-span-7 space-y-5">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-semibold">{t("p.news")}</h2>
            <p className="text-muted">{t("p.news.sub")}</p>
          </div>
          {(!pulse || pulse.newsPending) && !error && (
            <div className="space-y-6" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-3 w-28" />
                  <div className="skeleton h-5 w-11/12" />
                  <div className="skeleton h-4 w-3/4" />
                </div>
              ))}
            </div>
          )}
          {pulse && !pulse.newsPending && pulse.economy && pulse.news.length === 0 && <p className="text-muted panel p-5">{t("p.noNews")}</p>}
          <ol className="divide-y divide-line">
            {pulse?.news.map((n, i) => (
              <motion.li key={n.url} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: i * 0.06 }} className="py-5 first:pt-0 space-y-2">
                <div className="text-xs text-muted font-mono">
                  {n.source}
                  {n.date && `, ${formatDate(n.date, { day: "numeric", month: "short" })}`}
                </div>
                <a href={n.url} target="_blank" rel="noopener noreferrer" className="group inline font-semibold text-lg leading-snug hover:text-brand">
                  {n.title}
                  <ArrowUpRight size={16} className="inline ml-1 -mt-0.5 text-muted group-hover:text-brand" />
                </a>
                {n.soWhat && (
                  <p className="text-[15px]">
                    <span className="font-semibold text-brand">{t("p.soWhat")}: </span>
                    {n.soWhat}
                  </p>
                )}
              </motion.li>
            ))}
          </ol>
        </section>

        <aside className="lg:col-span-5 space-y-10">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ArrowsClockwise size={22} className="text-brand" /> {t("p.shifts")}
            </h2>
            {(!pulse || pulse.newsPending) && <div className="skeleton h-24" />}
            <ul className="space-y-4">
              {pulse?.roleShifts.map((s, i) => (
                <li key={i} className="pl-4 border-l-2 border-line text-[15px] leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-[20px] bg-surface-2 p-6 space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CloudSun size={22} className="text-brand" /> {t("p.economy")}
            </h2>
            {(!pulse || pulse.newsPending) && <div className="skeleton h-20" />}
            <p className="text-[15px] leading-relaxed">{pulse?.economy}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
