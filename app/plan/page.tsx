"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "framer-motion";
import { RESOURCE_BY_ID } from "@/data/resources";
import { db } from "@/lib/db";
import { postJSON, profileForApi } from "@/lib/api";
import { downloadIcs, weekStart } from "@/lib/ics";
import { useI18n } from "@/lib/i18n";
import { eventLinks, jobLinks, linkedInShareUrl } from "@/lib/links";
import type { Plan, Post, Profile } from "@/lib/types";

const TABS = ["timeline", "resources", "jobs", "posts", "events"] as const;
type Tab = (typeof TABS)[number];
const PHASE_COLORS = ["var(--accent-2)", "var(--brand)", "var(--accent)", "var(--warm)", "var(--brand-deep)"];

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
      <div className="card p-8 text-center space-y-4">
        <p>{t("pl.none")}</p>
        <Link href="/pulse" className="btn btn-primary">{t("nav.pulse")} →</Link>
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

  async function remove() {
    if (confirm(`${t("pl.delete")}?`)) await db.plans.delete(plan.id);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] bg-brand-deep text-white p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="chip !bg-white/10 !border-white/20 text-white text-xs">🎯 {t("pl.goal", { date: formatDate(plan.goalDate) })}</span>
          {plans.length > 1 && (
            <select value={plan.id} onChange={(e) => onSelect(e.target.value)} className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-sm" aria-label={t("pl.other")}>
              {plans.map((p) => (
                <option key={p.id} value={p.id} className="text-ink">{p.roleTitle}</option>
              ))}
            </select>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">{t("pl.towards", { role: plan.roleTitle })}</h1>
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-white/15 overflow-hidden">
            <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.max(pct, 2)}%` }} />
          </div>
          <p className="text-sm text-white/85 font-semibold">{t("pl.progress", { week: currentWeek, total: plan.totalWeeks, pct })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn bg-accent text-ink hover:brightness-105" onClick={() => downloadIcs(plan)}>
            📅 {t("pl.export")}
          </button>
        </div>
        {/* Wish → Goal → Strategy → Action */}
        <ol className="flex flex-wrap gap-2 text-xs font-bold">
          {(["wish", "goal", "strategy", "action"] as const).map((s, i) => (
            <li key={s} className={`px-3 py-1 rounded-full ${i < 3 || done > 0 ? "bg-white/20" : "bg-white/5 text-white/60"}`}>
              {i < 3 || done > 0 ? "✓ " : ""}
              {t(`home.step.${s}`)}
            </li>
          ))}
        </ol>
      </header>

      <div role="tablist" className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${tab === k ? "bg-brand text-on-brand" : "hover:bg-brand-soft"}`}>
            {t(`tab.${k}`)}
          </button>
        ))}
      </div>

      {tab === "timeline" && (
        <div className="space-y-5">
          <section className="card p-5 border-l-4" style={{ borderLeftColor: "var(--accent)" }}>
            <h2 className="font-bold text-lg">🛠️ {t("pl.project")}: {plan.project.title}</h2>
            <p className="text-muted">{plan.project.brief}</p>
          </section>
          {done === 0 && <p className="text-center text-muted font-semibold">👣 {t("pl.nudge")}</p>}
          {plan.phases.map((ph, pi) => {
            const tasks = plan.tasks.filter((x) => x.phaseIndex === pi).sort((a, b) => a.week - b.week);
            const active = currentWeek >= ph.startWeek && currentWeek <= ph.endWeek;
            return (
              <section key={pi} className={`card p-5 space-y-3 ${active ? "ring-2 ring-brand" : ""}`}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ background: PHASE_COLORS[pi % PHASE_COLORS.length] }}>
                    {t("pl.phase", { n: pi + 1 })}
                  </span>
                  <h2 className="text-xl font-bold">{ph.name}</h2>
                  <span className="text-sm text-muted">
                    {t("pl.week", { n: ph.startWeek })}–{ph.endWeek} · {formatDate(weekStart(plan, ph.startWeek).toISOString(), { day: "numeric", month: "short" })}
                  </span>
                  {active && <span className="chip text-xs bg-accent-soft border-accent">{t("pl.thisWeek")}</span>}
                </div>
                <p className="text-muted text-sm">{ph.goal}</p>
                <ul className="space-y-2">
                  {tasks.map((task) => {
                    const res = task.resourceId ? RESOURCE_BY_ID[task.resourceId] : undefined;
                    return (
                      <li key={task.id} className="flex items-start gap-3 rounded-xl p-2 hover:bg-bg">
                        <input type="checkbox" checked={task.done} onChange={() => toggle(task.id)} className="mt-1 size-5 accent-[var(--brand)] shrink-0" aria-label={task.title} />
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold ${task.done ? "line-through text-muted" : ""}`}>{task.title}</div>
                          <div className="text-xs text-muted flex flex-wrap gap-x-3">
                            <span>{t("pl.week", { n: task.week })}</span>
                            <span>⏱ {t("pl.min", { n: task.minutes })}</span>
                            {res && (
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-brand font-semibold hover:underline">
                                {res.title} ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          <button onClick={remove} className="text-sm text-warm font-semibold underline underline-offset-4">
            {t("pl.delete")}
          </button>
        </div>
      )}

      {tab === "resources" && <Resources plan={plan} />}
      {tab === "jobs" && <Jobs plan={plan} profile={profile} />}
      {tab === "posts" && <Posts plan={plan} profile={profile} />}
      {tab === "events" && <Events plan={plan} profile={profile} />}
    </div>
  );
}

function Resources({ plan }: { plan: Plan }) {
  const { t } = useI18n();
  const list = plan.resourceIds.map((id) => RESOURCE_BY_ID[id]).filter(Boolean);
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {list.map((r) => (
        <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="card p-5 space-y-2 hover:border-brand">
          <div className="flex flex-wrap gap-1.5">
            <span className={`chip text-xs ${r.cost === "free" ? "bg-brand-soft" : r.cost === "funded" ? "bg-accent-soft" : ""}`}>{t(`res.${r.cost}`)}</span>
            <span className="chip text-xs">{t("res.hours", { n: r.hours })}</span>
            {r.irish && <span className="chip text-xs">☘️ {t("res.irish")}</span>}
          </div>
          <h3 className="font-bold text-lg leading-snug">{r.title}</h3>
          <p className="text-sm text-muted">{r.provider}</p>
          <span className="text-brand font-bold text-sm">{t("res.open")} ↗</span>
        </a>
      ))}
    </div>
  );
}

function Jobs({ plan, profile }: { plan: Plan; profile: Profile }) {
  const { t } = useI18n();
  const links = jobLinks(plan.roleTitle, profile);
  return (
    <section className="card p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold">⚡ {t("jobs.title")}</h2>
        <p className="text-muted">{t("jobs.sub")}</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {links.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost justify-between rounded-2xl py-4">
            <span>
              {t("jobs.on", { site: l.site })}
              {l.remote && <span className="block text-xs text-muted">{t("jobs.remote")}</span>}
            </span>
            <span aria-hidden>↗</span>
          </a>
        ))}
      </div>
      <p className="text-sm text-muted">
        🔎 {plan.roleTitle} · {profile.city}, {profile.country} · ≤ 48h
      </p>
    </section>
  );
}

function Posts({ plan, profile }: { plan: Plan; profile: Profile }) {
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const posts = plan.posts;

  async function make() {
    setLoading(true);
    try {
      const res = await postJSON<{ posts: Post[] }>("/api/posts", {
        profile: profileForApi(profile),
        roleTitle: plan.roleTitle,
        phases: plan.phases.map((p) => p.name),
        project: `${plan.project.title}: ${plan.project.brief}`.slice(0, 400),
        locale,
      });
      await db.plans.update(plan.id, { posts: res.posts });
    } finally {
      setLoading(false);
    }
  }

  async function updateText(i: number, text: string) {
    await db.plans.update(plan.id, { posts: (posts ?? []).map((p, j) => (j === i ? { ...p, text } : p)) });
  }

  return (
    <section className="space-y-4">
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">📣 {t("posts.title")}</h2>
          <p className="text-muted">{t("posts.sub")}</p>
        </div>
        <button className="btn btn-primary" onClick={make} disabled={loading}>
          {loading ? t("posts.loading") : t("posts.make")}
        </button>
      </div>
      {posts?.map((p, i) => (
        <article key={i} className="card p-5 space-y-3">
          <span className="chip text-xs bg-accent-soft border-accent">{p.milestone}</span>
          <textarea className="w-full min-h-40 bg-bg rounded-xl p-3 outline-none focus:ring-2 ring-brand" value={p.text} onChange={(e) => updateText(i, e.target.value)} />
          <div className="flex gap-2">
            <button
              className="btn btn-ghost text-sm py-1.5"
              onClick={async () => {
                await navigator.clipboard.writeText(p.text);
                setCopied(i);
                setTimeout(() => setCopied(null), 1500);
              }}
            >
              {copied === i ? `✓ ${t("posts.copied")}` : t("posts.copy")}
            </button>
            <a className="btn btn-primary text-sm py-1.5" href={linkedInShareUrl(p.text)} target="_blank" rel="noopener noreferrer">
              {t("posts.open")} ↗
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}

function Events({ plan, profile }: { plan: Plan; profile: Profile }) {
  const { t } = useI18n();
  const links = useMemo(() => eventLinks(plan.roleTitle, profile), [plan.roleTitle, profile]);
  return (
    <section className="card p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold">🤝 {t("ev.title")}</h2>
        <p className="text-muted">{t("ev.sub", { city: profile.city })}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost justify-between rounded-2xl py-4">
            {t("ev.on", { site: l.site })} <span aria-hidden>↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
