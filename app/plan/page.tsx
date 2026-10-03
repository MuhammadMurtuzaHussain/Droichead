"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Briefcase, CalendarPlus, Check, Clock, Copy, Hammer, LinkedinLogo, MapPin, Sparkle, Trash } from "@phosphor-icons/react";
import { RESOURCE_BY_ID } from "@/data/resources";
import { db } from "@/lib/db";
import { postJSON, profileForApi } from "@/lib/api";
import { downloadIcs, weekStart } from "@/lib/ics";
import { useI18n } from "@/lib/i18n";
import { eventLinks, jobLinks, linkedInShareUrl } from "@/lib/links";
import type { Plan, Post, Profile } from "@/lib/types";

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
      <div className="pt-16 max-w-xl space-y-6">
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

  async function toggle(id: string) {
    await db.plans.update(plan.id, { tasks: plan.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) });
  }

  return (
    <div className="pt-8 sm:pt-12 space-y-10">
      <header className="rounded-[20px] bg-deep text-on-deep p-7 sm:p-10 space-y-8">
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
            <button className="btn btn-on-deep" onClick={() => downloadIcs(plan)}>
              <CalendarPlus size={18} /> {t("pl.export")}
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-12 gap-6 items-end">
          <div className="sm:col-span-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-on-deep/70">{t("pl.progress", { week: currentWeek, total: plan.totalWeeks })}</span>
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
                                <input type="checkbox" checked={task.done} onChange={() => toggle(task.id)} className="peer sr-only" />
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
              <section className="rounded-[20px] bg-brand-soft p-6 space-y-3 lg:sticky lg:top-24">
                <h2 className="font-semibold flex items-center gap-2">
                  <Hammer size={20} className="text-brand" /> {t("pl.project")}
                </h2>
                <p className="text-lg font-semibold leading-snug">{plan.project.title}</p>
                <p className="text-[15px] leading-relaxed">{plan.project.brief}</p>
                {done === 0 && <p className="text-sm text-muted border-t border-ink/10 pt-3">{t("pl.nudge")}</p>}
              </section>
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

function Resources({ plan }: { plan: Plan }) {
  const { t } = useI18n();
  const list = plan.resourceIds.map((id) => RESOURCE_BY_ID[id]).filter(Boolean);
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {list.map((r, i) => (
        <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className={`group rounded-[20px] p-6 flex flex-col gap-4 transition-colors ${i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2 bg-deep text-on-deep" : "panel hover:border-brand"}`}>
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

function Jobs({ plan, profile }: { plan: Plan; profile: Profile }) {
  const { t } = useI18n();
  return (
    <section className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2.5">
          <Briefcase size={26} className="text-brand" /> {t("jobs.title")}
        </h2>
        <p className="text-muted max-w-[60ch]">{t("jobs.sub")}</p>
        <p className="text-sm font-mono text-muted">
          {plan.roleTitle}, {profile.city}, {profile.country}
        </p>
      </div>
      <LinkTiles links={jobLinks(plan.roleTitle, profile)} label={(site) => t("jobs.on", { site })} />
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
