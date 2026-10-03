"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, ArrowsClockwise, Briefcase, CalendarPlus, Check, Clock, Copy, Fire, Hammer, LinkedinLogo, MapPin, Printer, Sparkle, Trash } from "@phosphor-icons/react";
import { RESOURCE_BY_ID } from "@/data/resources";
import { celebrate, streak } from "@/lib/celebrate";
import { ListenButton } from "@/components/Voice";
import { db, getCached, setCached } from "@/lib/db";
import { postJSON, profileForApi } from "@/lib/api";
import { downloadIcs, weekStart } from "@/lib/ics";
import { useI18n } from "@/lib/i18n";
import { eventLinks, jobLinks, linkedInShareUrl } from "@/lib/links";
import type { CheckIn, Plan, Post, Profile } from "@/lib/types";

const TABS = ["timeline", "resources", "jobs", "posts", "events"] as const;
type Tab = (typeof TABS)[number];
const ease = [0.16, 1, 0.3, 1] as const;

export default function PlanPage() {
  const { t } = useI18n();
  const plans = useLiveQuery(() => db.plans.orderBy("createdAt").reverse().toArray());
  const profile = useLiveQuery(() => db.profile.get("me"));
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("timeline");

  if (!plans || profile === undefined) return null;
  const plan = plans.find((p) => p.id === selected) ?? plans[0];
  if (!plan || !profile)
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-36 max-w-xl space-y-6">
        <h1 className="text-3xl font-semibold">{t("pl.none")}</h1>
        <Link href="/pulse" className="btn btn-primary">
          {t("nav.pulse")} <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    );

  return <PlanView plan={plan} plans={plans} profile={profile} tab={tab} setTab={setTab} onSelect={setSelected} />;
}

function PlanView({ plan, plans, profile, tab, setTab, onSelect }: { plan: Plan; plans: Plan[]; profile: Profile; tab: Tab; setTab: (t: Tab) => void; onSelect: (id: string) => void }) {
  const { t, formatDate } = useI18n();
  const done = plan.tasks.filter((x) => x.done).length;
  const pct = plan.tasks.length ? Math.round((done / plan.tasks.length) * 100) : 0;
  const currentWeek = Math.min(plan.totalWeeks, Math.max(1, Math.floor((Date.now() - Date.parse(plan.startDate)) / (7 * 864e5)) + 1));

  const [toast, setToast] = useState<string | null>(null);
  const weeksInRow = streak(plan);

  async function toggle(id: string, el: Element | null) {
    const tasks = plan.tasks.map((x) => (x.id === id ? { ...x, done: !x.done, doneAt: !x.done ? Date.now() : undefined } : x));
    await db.plans.update(plan.id, { tasks });
    const task = tasks.find((x) => x.id === id)!;
    if (!task.done) return;
    const phaseDone = tasks.filter((x) => x.phaseIndex === task.phaseIndex).every((x) => x.done);
    const allDone = tasks.every((x) => x.done);
    celebrate(el, allDone ? "all" : phaseDone ? "phase" : "task");
    if (allDone || phaseDone) {
      setToast(t(allDone ? "pl.allDone" : "pl.phaseDone"));
      setTimeout(() => setToast(null), 3200);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 space-y-10">
      <AnimatePresence>
        {toast && (
          <motion.div role="status" className="fixed bottom-6 inset-x-0 z-30 flex justify-center px-4 pointer-events-none" initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.5, ease }}>
            <div className="rounded-full bg-brand text-on-brand px-5 py-3 font-semibold shadow-[0_20px_50px_-15px_rgb(82_211_162/0.7)] flex items-center gap-2">
              <Sparkle size={18} weight="fill" /> {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="rounded-[28px] core-brand !rounded-[28px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] text-on-deep p-7 sm:p-10 space-y-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-1 min-w-[260px] space-y-3">
            <p className="text-sm text-on-deep/70">{t("pl.goal", { date: formatDate(plan.goalDate, { day: "numeric", month: "long", year: "numeric" }) })}</p>
            <h1 className="text-3xl sm:text-5xl font-semibold leading-[1.05]">{t("pl.towards", { role: plan.roleTitle })}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {plans.length > 1 && (
              <select value={plan.id} onChange={(e) => onSelect(e.target.value)} className="h-11 rounded-full bg-transparent border border-on-deep/30 px-4 text-sm" aria-label={t("pl.other")}>
                {plans.map((p) => (
                  <option key={p.id} value={p.id} className="text-ink">
                    {p.roleTitle}
                  </option>
                ))}
              </select>
            )}
            <Link href={`/plan/print?id=${encodeURIComponent(plan.id)}`} className="btn btn-quiet">
              <Printer size={18} /> {t("pl.print")}
            </Link>
            <button className="btn btn-on-deep" onClick={() => downloadIcs(plan)}>
              <CalendarPlus size={18} /> {t("pl.export")}
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-12 gap-6 items-end">
          <div className="sm:col-span-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-on-deep/70 flex items-center gap-3">
                {t("pl.progress", { week: currentWeek, total: plan.totalWeeks })}
                {weeksInRow > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gorse/15 text-gorse px-2.5 py-0.5 text-xs font-semibold">
                    <Fire size={13} weight="fill" /> {t("pl.streak", { n: weeksInRow })}
                  </span>
                )}
              </span>
              <span className="font-mono">{t("pl.done", { pct })}</span>
            </div>
            <div className="h-1.5 rounded-full bg-on-deep/15 overflow-hidden">
              <motion.div className="h-full rounded-full bg-[#7fd8b2] origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: Math.max(pct, 1.5) / 100 }} transition={{ duration: 0.8, ease }} />
            </div>
          </div>
          <ol className="sm:col-span-4 flex sm:justify-end flex-wrap gap-x-4 gap-y-1 text-sm">
            {(["wish", "goal", "strategy", "action"] as const).map((s, i) => {
              const reached = i < 3 || done > 0;
              return (
                <li key={s} className={`inline-flex items-center gap-1 ${reached ? "" : "text-on-deep/45"}`}>
                  {reached && <Check size={14} weight="bold" className="text-[#7fd8b2]" />}
                  {t(`home.step.${s}`)}
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <div role="tablist" aria-label={t("pl.towards", { role: plan.roleTitle })} className="inline-flex max-w-full overflow-x-auto rounded-full border border-line bg-surface p-1 gap-1">
        {TABS.map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="relative px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap text-muted aria-selected:text-on-brand">
            {tab === k && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className="relative">{t(`tab.${k}`)}</span>
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
        {tab === "timeline" && (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <ol className="relative border-l border-line ml-3 space-y-12">
                {plan.phases.map((ph, pi) => {
                  const tasks = plan.tasks.filter((x) => x.phaseIndex === pi).sort((a, b) => a.week - b.week);
                  const active = currentWeek >= ph.startWeek && currentWeek <= ph.endWeek;
                  const allDone = tasks.length > 0 && tasks.every((x) => x.done);
                  return (
                    <li key={pi} className="pl-8 relative">
                      <span className={`absolute -left-[9px] top-1 size-[17px] rounded-full border-2 ${allDone ? "bg-brand border-brand" : active ? "bg-bg border-brand" : "bg-bg border-line"}`} aria-hidden />
                      <div className="space-y-1 mb-4">
                        <div className="text-sm text-muted font-mono">
                          {t("pl.weeks", { a: ph.startWeek, b: ph.endWeek })}, {formatDate(weekStart(plan, ph.startWeek).toISOString(), { day: "numeric", month: "short" })}
                          {active && <span className="ml-2 font-sans font-semibold text-brand">{t("pl.thisWeek")}</span>}
                        </div>
                        <h2 className="text-2xl font-semibold">{ph.name}</h2>
                        <p className="text-muted">{ph.goal}</p>
                      </div>
                      <ul className="space-y-2">
                        {tasks.map((task) => {
                          const res = task.resourceId ? RESOURCE_BY_ID[task.resourceId] : undefined;
                          return (
                            <li key={task.id}>
                              <label className={`flex items-start gap-3 rounded-[14px] border p-4 cursor-pointer transition-colors ${task.done ? "border-transparent bg-surface-2" : "border-line bg-surface hover:border-brand/50"}`}>
                                <input type="checkbox" checked={task.done} onChange={(e) => toggle(task.id, e.currentTarget.parentElement)} className="peer sr-only" />
                                <span className={`mt-0.5 grid place-items-center size-5 shrink-0 rounded-md border-2 transition-colors peer-focus-visible:ring-2 ring-brand ring-offset-2 ${task.done ? "bg-brand border-brand text-on-brand" : "border-line"}`} aria-hidden>
                                  {task.done && <Check size={12} weight="bold" />}
                                </span>
                                <span className="flex-1 min-w-0 space-y-1">
                                  <span className={`block font-medium leading-snug ${task.done ? "line-through text-muted" : ""}`}>{task.title}</span>
                                  <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                                    <span className="font-mono">{t("pl.week", { n: task.week })}</span>
                                    <span className="inline-flex items-center gap-1">
                                      <Clock size={13} /> {t("pl.min", { n: task.minutes })}
                                    </span>
                                    {res && (
                                      <a href={res.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-0.5 font-medium text-brand hover:underline">
                                        {res.title} <ArrowUpRight size={12} />
                                      </a>
                                    )}
                                  </span>
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ol>
            </div>
            <aside className="lg:col-span-4 space-y-6">
              {(() => {
                const pi = Math.max(0, plan.phases.findIndex((ph) => currentWeek >= ph.startWeek && currentWeek <= ph.endWeek));
                const ph = plan.phases[pi];
                const todo = plan.tasks.filter((x) => x.phaseIndex === pi && !x.done).map((x) => x.title);
                return ph ? <ListenButton text={`${t("pl.towards", { role: plan.roleTitle })}. ${ph.name}: ${ph.goal}. ${todo.join(". ")}.`} /> : null;
              })()}
              <section className="rounded-[22px] bg-brand-soft p-6 space-y-3 lg:sticky lg:top-24">
                <h2 className="font-semibold flex items-center gap-2">
                  <Hammer size={20} className="text-brand" /> {t("pl.project")}
                </h2>
                <p className="text-lg font-semibold leading-snug">{plan.project.title}</p>
                <p className="text-[15px] leading-relaxed">{plan.project.brief}</p>
                {done === 0 && <p className="text-sm text-muted border-t border-ink/10 pt-3">{t("pl.nudge")}</p>}
              </section>
              <CheckInCard plan={plan} profile={profile} currentWeek={currentWeek} />
              <button
                onClick={async () => {
                  if (confirm(`${t("pl.delete")}?`)) await db.plans.delete(plan.id);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-peat hover:underline"
              >
                <Trash size={16} /> {t("pl.delete")}
              </button>
            </aside>
          </div>
        )}
        {tab === "resources" && <Resources plan={plan} />}
        {tab === "jobs" && <Jobs plan={plan} profile={profile} />}
        {tab === "posts" && <Posts plan={plan} profile={profile} />}
        {tab === "events" && <Events plan={plan} profile={profile} />}
      </motion.div>
    </div>
  );
}

function CheckInCard({ plan, profile, currentWeek }: { plan: Plan; profile: Profile; currentWeek: number }) {
  const { t, locale, formatDate } = useI18n();
  const [status, setStatus] = useState<CheckIn["status"]>("on");
  const [hours, setHours] = useState(profile.hoursPerWeek);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [moved, setMoved] = useState<number | null>(null);
  const last = plan.checkins?.at(-1);

  async function submit() {
    setBusy(true);
    setMoved(null);
    try {
      const res = await postJSON<{ moves: { id: string; week: number }[]; message: string; nextStep: { title: string; minutes: number } | null }>("/api/replan", {
        locale,
        name: profile.name,
        roleTitle: plan.roleTitle,
        currentWeek,
        totalWeeks: plan.totalWeeks,
        doneCount: plan.tasks.filter((x) => x.done).length,
        tasks: plan.tasks.map(({ id, title, week, minutes, done }) => ({ id, title, week, minutes, done })),
        checkin: { status, hours, note: note || undefined },
      });
      const weekOf = new Map(res.moves.map((m) => [m.id, m.week]));
      const phaseNow = Math.max(0, plan.phases.findIndex((ph) => currentWeek >= ph.startWeek && currentWeek <= ph.endWeek));
      const tasks = plan.tasks.map((x) => (weekOf.has(x.id) ? { ...x, week: weekOf.get(x.id)! } : x));
      if (res.nextStep) tasks.push({ id: `ci-${Date.now()}`, phaseIndex: phaseNow, week: currentWeek, title: res.nextStep.title, minutes: res.nextStep.minutes, done: false });
      const entry: CheckIn = { at: Date.now(), week: currentWeek, status, hours, note: note || undefined, message: res.message || t("ci.done") };
      await db.plans.update(plan.id, { tasks, checkins: [...(plan.checkins ?? []), entry] });
      setMoved(res.moves.length);
      setNote("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel p-6 space-y-5">
      <div className="space-y-1">
        <h2 className="font-semibold flex items-center gap-2">
          <ArrowsClockwise size={20} className="text-brand" /> {t("ci.title")}
        </h2>
        <p className="text-sm text-muted">{t("ci.sub")}</p>
      </div>
      {last && (
        <motion.div key={last.at} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="rounded-2xl bg-brand/10 p-4 space-y-1" role="status">
          <p className="text-[15px] leading-relaxed">{last.message}</p>
          <p className="text-xs text-muted">
            {t("ci.last", { date: formatDate(new Date(last.at).toISOString(), { day: "numeric", month: "short" }) })}
          </p>
        </motion.div>
      )}
      <fieldset className="space-y-2">
        <legend className="sr-only">{t("ci.title")}</legend>
        <div className="flex flex-wrap gap-2">
          {(["on", "behind", "way"] as const).map((k) => (
            <button key={k} type="button" aria-pressed={status === k} onClick={() => setStatus(k)} className="option rounded-full px-3.5 h-9 text-sm">
              {t(`ci.${k}`)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="text-sm text-muted mb-2">{t("ci.hours")}</legend>
        <div className="flex gap-2">
          {[2, 5, 10, 15].map((h) => (
            <button key={h} type="button" aria-pressed={hours === h} onClick={() => setHours(h)} className="option rounded-full px-3.5 h-9 text-sm font-mono">
              {h}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block space-y-2">
        <span className="text-sm text-muted">{t("ci.note")}</span>
        <input className="field !py-2.5 text-sm" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <button className="group btn btn-primary btn-island w-full justify-between" onClick={submit} disabled={busy}>
        {busy ? t("ci.loading") : t("ci.submit")}
        <span className="btn-orb">{busy ? <span className="size-3.5 rounded-full border-2 border-on-brand/30 border-t-on-brand animate-spin" /> : <ArrowRight size={16} weight="bold" />}</span>
      </button>
    </section>
  );
}

function Resources({ plan }: { plan: Plan }) {
  const { t } = useI18n();
  const list = plan.resourceIds.map((id) => RESOURCE_BY_ID[id]).filter(Boolean);
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {list.map((r, i) => (
        <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className={`group rounded-[22px] p-6 flex flex-col gap-4 transition-colors ${i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2 core-brand !rounded-[22px] text-on-deep" : "panel hover:border-brand"}`}>
          <div className="flex flex-wrap gap-1.5 text-xs font-medium">
            <span className={`rounded-full px-2.5 py-1 ${i === 0 ? "bg-on-deep/10" : r.cost === "free" ? "bg-brand-soft" : r.cost === "funded" ? "bg-gorse-soft" : "bg-surface-2"}`}>{t(`res.${r.cost}`)}</span>
            <span className={`rounded-full px-2.5 py-1 font-mono ${i === 0 ? "bg-on-deep/10" : "bg-surface-2"}`}>{t("res.hours", { n: r.hours })}</span>
            {r.irish && <span className={`rounded-full px-2.5 py-1 ${i === 0 ? "bg-on-deep/10" : "bg-surface-2"}`}>{t("res.irish")}</span>}
          </div>
          <h3 className={`font-semibold leading-snug ${i === 0 ? "text-2xl" : "text-lg"}`}>{r.title}</h3>
          <p className={`text-sm mt-auto flex items-center justify-between ${i === 0 ? "text-on-deep/70" : "text-muted"}`}>
            {r.provider}
            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </p>
        </a>
      ))}
    </div>
  );
}

function LinkTiles({ links, label }: { links: { site: string; url: string; remote?: boolean }[]; label: (site: string) => string }) {
  const { t } = useI18n();
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {links.map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="group panel p-5 flex items-center justify-between gap-3 hover:border-brand transition-colors">
          <span>
            <span className="block font-semibold">{label(l.site)}</span>
            {l.remote && <span className="block text-sm text-muted">{t("jobs.remote")}</span>}
          </span>
          <ArrowUpRight size={20} className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
        </a>
      ))}
    </div>
  );
}

type LiveJob = { title: string; company: string; location: string; url: string; postedAt: number; source: string; remote: boolean };

function Jobs({ plan, profile }: { plan: Plan; profile: Profile }) {
  const { t } = useI18n();
  const [jobs, setJobs] = useState<LiveJob[] | null>(null);
  useEffect(() => {
    let live = true;
    const key = `jobs:${plan.roleTitle}`;
    (async () => {
      const hit = await getCached<LiveJob[]>(key, 30 * 60 * 1000);
      if (hit) return live && setJobs(hit);
      try {
        const res = await postJSON<{ jobs: LiveJob[] }>("/api/jobs", { role: plan.roleTitle });
        await setCached(key, res.jobs);
        if (live) setJobs(res.jobs);
      } catch {
        if (live) setJobs([]);
      }
    })();
    return () => {
      live = false;
    };
  }, [plan.roleTitle]);

  const ago = (ms: number) => {
    const h = Math.max(1, Math.round((Date.now() - ms) / 36e5));
    return h < 48 ? t("jobs.ago.h", { n: h }) : t("jobs.ago.d", { n: Math.round(h / 24) });
  };

  return (
    <section className="space-y-10 max-w-4xl">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2.5">
          <Briefcase size={26} className="text-brand" /> {t("jobs.title")}
        </h2>
        <p className="text-muted max-w-[60ch]">{t("jobs.sub")}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="relative flex size-2.5" aria-hidden>
              <span className="absolute inline-flex size-full rounded-full bg-brand opacity-60 animate-ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
            </span>
            {t("jobs.live")}
          </h3>
          <span className="text-xs text-muted">{t("jobs.src")}</span>
        </div>
        {!jobs && (
          <div className="grid sm:grid-cols-2 gap-3" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="panel p-5 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}
        {jobs && jobs.length === 0 && <p className="panel p-5 text-muted">{t("jobs.none")}</p>}
        {jobs && jobs.length > 0 && (
          <ul className="grid sm:grid-cols-2 gap-3">
            {jobs.map((j, i) => (
              <motion.li key={j.url} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease, delay: i * 0.05 }}>
                <a href={j.url} target="_blank" rel="noopener noreferrer" className="group panel h-full p-5 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold leading-snug">{j.title}</span>
                    <ArrowUpRight size={18} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
                  </div>
                  <span className="text-sm text-muted">
                    {j.company}
                    {j.location ? `, ${j.location}` : ""}
                  </span>
                  <span className="mt-auto flex items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-mono ${Date.now() - j.postedAt <= 48 * 36e5 ? "bg-brand/15 text-brand" : "bg-white/5 text-muted"}`}>{ago(j.postedAt)}</span>
                    <span className="text-muted">{j.source}</span>
                    {j.remote && <span className="text-muted">{t("mode.remote")}</span>}
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("jobs.searches")}</h3>
        <p className="text-sm font-mono text-muted">
          {plan.roleTitle}, {profile.city}, {profile.country}
        </p>
        <LinkTiles links={jobLinks(plan.roleTitle, profile)} label={(site) => t("jobs.on", { site })} />
      </div>
    </section>
  );
}

function Posts({ plan, profile }: { plan: Plan; profile: Profile }) {
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const posts = plan.posts;

  async function make() {
    setLoading(true);
    setError(false);
    try {
      const res = await postJSON<{ posts: Post[] }>("/api/posts", {
        profile: profileForApi(profile),
        roleTitle: plan.roleTitle,
        phases: plan.phases.map((p) => p.name),
        project: `${plan.project.title}: ${plan.project.brief}`.slice(0, 400),
        locale,
      });
      await db.plans.update(plan.id, { posts: res.posts });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function updateText(i: number, text: string) {
    await db.plans.update(plan.id, { posts: (posts ?? []).map((p, j) => (j === i ? { ...p, text } : p)) });
  }

  return (
    <section className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2.5">
            <LinkedinLogo size={26} className="text-brand" /> {t("posts.title")}
          </h2>
          <p className="text-muted max-w-[60ch]">{t("posts.sub")}</p>
        </div>
        <button className="btn btn-primary" onClick={make} disabled={loading}>
          {loading ? (
            <>
              <span className="size-4 rounded-full border-2 border-on-brand/30 border-t-on-brand animate-spin" aria-hidden /> {t("posts.loading")}
            </>
          ) : (
            <>
              <Sparkle size={16} weight="fill" /> {t("posts.make")}
            </>
          )}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-peat">
          {t("err.generic")}
        </p>
      )}
      {loading && !posts && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="panel p-6 space-y-2">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
            </div>
          ))}
        </div>
      )}
      <div className="space-y-4">
        {posts?.map((p, i) => (
          <motion.article key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease, delay: i * 0.07 }} className="panel p-6 space-y-4">
            <div className="text-sm font-semibold text-brand">{p.milestone}</div>
            <label className="sr-only" htmlFor={`post-${i}`}>
              {p.milestone}
            </label>
            <textarea id={`post-${i}`} className="field min-h-44 leading-relaxed bg-bg" value={p.text} onChange={(e) => updateText(i, e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-quiet !py-2.5"
                onClick={async () => {
                  await navigator.clipboard.writeText(p.text);
                  setCopied(i);
                  setTimeout(() => setCopied(null), 1500);
                }}
              >
                {copied === i ? <Check size={16} weight="bold" className="text-brand" /> : <Copy size={16} />} {copied === i ? t("posts.copied") : t("posts.copy")}
              </button>
              <a className="btn btn-primary !py-2.5" href={linkedInShareUrl(p.text)} target="_blank" rel="noopener noreferrer">
                {t("posts.open")} <ArrowUpRight size={16} />
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Events({ plan, profile }: { plan: Plan; profile: Profile }) {
  const { t } = useI18n();
  const links = useMemo(() => eventLinks(plan.roleTitle, profile), [plan.roleTitle, profile]);
  return (
    <section className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2.5">
          <MapPin size={26} className="text-brand" /> {t("ev.title")}
        </h2>
        <p className="text-muted">{t("ev.sub", { city: profile.city })}</p>
      </div>
      <LinkTiles links={links} label={(site) => t("ev.on", { site })} />
    </section>
  );
}
