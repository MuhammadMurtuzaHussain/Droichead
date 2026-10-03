"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import QRCode from "qrcode";
import { ArrowLeft, Bridge, Printer } from "@phosphor-icons/react";
import { RESOURCE_BY_ID } from "@/data/resources";
import { db } from "@/lib/db";
import { taskDate, weekStart } from "@/lib/ics";
import { useI18n } from "@/lib/i18n";
import type { Plan } from "@/lib/types";

// Print palette: fixed hex values so sheets look the same on any printer.
const INK = "#10201a";
const MUTED = "#5a6862";
const RULE = "#d9e1db";
const PHASE = ["#0a6b4d", "#2e5e7e", "#a87a0c", "#94452e", "#4b3f72"];

const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <section className="sheet mx-auto mb-8 w-[210mm] min-h-[297mm] bg-white rounded-[6px] p-[14mm] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] flex flex-col" style={{ color: INK }}>
      {children}
    </section>
  );
}

function SheetHeader({ title, plan }: { title: string; plan: Plan }) {
  return (
    <header className="flex items-center justify-between pb-4 mb-6" style={{ borderBottom: `1.5px solid ${INK}` }}>
      <div className="flex items-center gap-2.5">
        <span className="grid place-items-center size-7 rounded-full text-white" style={{ background: PHASE[0] }}>
          <Bridge size={16} weight="bold" />
        </span>
        <span className="font-semibold tracking-tight">Droichead</span>
      </div>
      <div className="text-right">
        <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: MUTED }}>
          {title}
        </div>
        <div className="text-sm font-semibold">{plan.roleTitle}</div>
      </div>
    </header>
  );
}

function Lines({ n }: { n: number }) {
  return (
    <div className="space-y-[9mm] pt-[7mm]">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${RULE}` }} />
      ))}
    </div>
  );
}

function Month({ year, month, tasksByDay, goal, start, locale }: { year: number; month: number; tasksByDay: Map<string, number>; goal: string; start: string; locale: string }) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday first
  const name = new Intl.DateTimeFormat(locale === "en" ? "en-IE" : locale, { month: "long", year: "numeric" }).format(first);
  const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale === "en" ? "en-IE" : locale, { weekday: "narrow" }).format(new Date(2024, 0, 1 + i)));
  return (
    <div className="break-inside-avoid">
      <div className="text-sm font-semibold mb-2 capitalize">{name}</div>
      <div className="grid grid-cols-7 gap-[3px] text-center text-[10px]">
        {weekdays.map((w, i) => (
          <div key={i} style={{ color: MUTED }}>
            {w}
          </div>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <div key={`l${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const d = new Date(year, month, i + 1);
          const phase = tasksByDay.get(key(d));
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
          const isGoal = iso === goal;
          const isStart = iso === start;
          return (
            <div
              key={i}
              className="aspect-square grid place-items-center rounded-full font-medium"
              style={
                isGoal
                  ? { background: INK, color: "#fff" }
                  : phase !== undefined
                    ? { background: PHASE[phase % PHASE.length], color: "#fff" }
                    : isStart
                      ? { boxShadow: `inset 0 0 0 1.5px ${INK}` }
                      : { color: INK }
              }
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PrintPlanner() {
  const { t, locale, formatDate } = useI18n();
  const [id, setId] = useState<string | null>(null);
  useEffect(() => setId(new URLSearchParams(window.location.search).get("id")), []);
  const plans = useLiveQuery(() => db.plans.orderBy("createdAt").reverse().toArray());
  const plan = plans?.find((p) => p.id === id) ?? plans?.[0];

  // QR codes so a printed poster links straight to each course.
  const [qrs, setQrs] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!plan) return;
    let live = true;
    Promise.all(
      plan.resourceIds
        .map((rid) => RESOURCE_BY_ID[rid])
        .filter(Boolean)
        .map(async (r) => [r.id, await QRCode.toDataURL(r.url, { margin: 0, width: 260, errorCorrectionLevel: "M", color: { dark: INK, light: "#ffffff" } })] as const),
    ).then((pairs) => live && setQrs(Object.fromEntries(pairs)));
    return () => {
      live = false;
    };
  }, [plan]);

  const { months, tasksByDay } = useMemo(() => {
    const tasksByDay = new Map<string, number>();
    if (!plan) return { months: [] as [number, number][], tasksByDay };
    plan.tasks.forEach((task, i) => tasksByDay.set(key(taskDate(plan, task.week, i)), task.phaseIndex));
    const months: [number, number][] = [];
    const s = new Date(plan.startDate + "T12:00:00");
    const g = new Date(plan.goalDate + "T12:00:00");
    for (let d = new Date(s.getFullYear(), s.getMonth(), 1); d <= g && months.length < 12; d.setMonth(d.getMonth() + 1)) months.push([d.getFullYear(), d.getMonth()]);
    return { months, tasksByDay };
  }, [plan]);

  if (!plans) return null;
  if (!plan)
    return (
      <div className="pt-36 mx-auto max-w-xl px-4 space-y-6">
        <h1 className="text-3xl font-semibold">{t("pl.none")}</h1>
      </div>
    );

  const long = { day: "numeric", month: "long", year: "numeric" } as const;

  return (
    <div className="pt-28 pb-10 print:p-0">
      {/* Toolbar (screen only) */}
      <div className="print:hidden mx-auto w-full max-w-[210mm] px-4 sm:px-0 mb-6 flex flex-wrap items-center gap-3">
        <Link href="/plan" className="btn btn-quiet">
          <ArrowLeft size={16} /> {t("print.back")}
        </Link>
        <button className="group btn btn-primary btn-island ml-auto" onClick={() => window.print()}>
          {t("print.print")}
          <span className="btn-orb">
            <Printer size={16} weight="bold" />
          </span>
        </button>
      </div>

      <div className="overflow-x-auto print:overflow-visible px-4 sm:px-0">
        {/* Sheet 1: goal poster */}
        <Sheet>
          <SheetHeader title={t("print.title")} plan={plan} />
          <div className="flex-1 flex flex-col">
            <div className="text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: MUTED }}>
              {t("print.goal")}
            </div>
            <h1 className="text-[42px] leading-[1.02] font-semibold tracking-[-0.03em] mb-5">{plan.roleTitle}</h1>
            <p className="text-lg mb-8">{t("print.goalLine", { role: plan.roleTitle, date: formatDate(plan.goalDate, long) })}</p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                [t("print.start"), formatDate(plan.startDate, long)],
                [t("print.goal"), formatDate(plan.goalDate, long)],
                [t("print.weeksLeft", { n: plan.totalWeeks }), ""],
              ].map(([a, b], i) => (
                <div key={i} className="rounded-[10px] p-4" style={{ background: i === 2 ? PHASE[0] : "#f1f4f2", color: i === 2 ? "#fff" : INK }}>
                  <div className={i === 2 ? "text-3xl font-semibold" : "text-[11px] uppercase tracking-[0.16em]"} style={i === 2 ? {} : { color: MUTED }}>
                    {a}
                  </div>
                  {b && <div className="mt-1 font-semibold">{b}</div>}
                </div>
              ))}
            </div>

            {/* Phase bar */}
            <div className="mb-3 flex h-3 overflow-hidden rounded-full">
              {plan.phases.map((ph, i) => (
                <div key={i} style={{ flex: ph.endWeek - ph.startWeek + 1, background: PHASE[i % PHASE.length] }} />
              ))}
            </div>
            <div className="grid gap-3 mb-10" style={{ gridTemplateColumns: `repeat(${plan.phases.length}, minmax(0, 1fr))` }}>
              {plan.phases.map((ph, i) => (
                <div key={i}>
                  <div className="text-[10px] font-mono" style={{ color: PHASE[i % PHASE.length] }}>
                    {t("pl.weeks", { a: ph.startWeek, b: ph.endWeek })}
                  </div>
                  <div className="text-sm font-semibold leading-snug">{ph.name}</div>
                  <div className="text-[11px] leading-snug" style={{ color: MUTED }}>
                    {ph.goal}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[10px] p-5 mb-8" style={{ background: "#f1f4f2" }}>
              <div className="text-[11px] uppercase tracking-[0.16em] mb-1" style={{ color: MUTED }}>
                {t("pl.project")}
              </div>
              <div className="font-semibold mb-1">{plan.project.title}</div>
              <div className="text-sm leading-relaxed">{plan.project.brief}</div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-semibold">{t("print.why")}</div>
                <Lines n={4} />
              </div>
              <div>
                <div className="font-semibold">{t("print.reward")}</div>
                <Lines n={4} />
              </div>
            </div>
            <p className="mt-auto pt-8 text-center text-sm" style={{ color: MUTED }}>
              {t("print.footer")}
            </p>
          </div>
        </Sheet>

        {/* Sheet 2: month calendars */}
        <Sheet>
          <SheetHeader title={t("print.months")} plan={plan} />
          <div className="grid grid-cols-3 gap-x-8 gap-y-7">
            {months.map(([y, m]) => (
              <Month key={`${y}-${m}`} year={y} month={m} tasksByDay={tasksByDay} goal={plan.goalDate} start={plan.startDate} locale={locale} />
            ))}
          </div>
          <div className="mt-auto pt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs items-center">
            {plan.phases.map((ph, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ background: PHASE[i % PHASE.length] }} /> {ph.name}
              </span>
            ))}
            <span className="inline-flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ background: INK }} /> {t("print.goal")}
            </span>
          </div>
        </Sheet>

        {/* Sheet 3: week-by-week checklist */}
        <Sheet>
          <SheetHeader title={t("print.checklist")} plan={plan} />
          <div className="space-y-6">
            {plan.phases.map((ph, pi) => (
              <div key={pi} className="break-inside-avoid">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="size-2.5 rounded-full" style={{ background: PHASE[pi % PHASE.length] }} />
                  <span className="font-semibold">{ph.name}</span>
                  <span className="text-xs font-mono" style={{ color: MUTED }}>
                    {t("pl.weeks", { a: ph.startWeek, b: ph.endWeek })}
                  </span>
                </div>
                <ul>
                  {plan.tasks.map((task, i) => {
                    if (task.phaseIndex !== pi) return null;
                    const res = task.resourceId ? RESOURCE_BY_ID[task.resourceId] : undefined;
                    return (
                      <li key={task.id} className="flex items-start gap-3 py-2 text-[13px]" style={{ borderBottom: `1px solid ${RULE}` }}>
                        <span className="mt-0.5 size-4 shrink-0 rounded-[3px]" style={{ boxShadow: `inset 0 0 0 1.5px ${INK}`, background: task.done ? INK : "transparent" }} />
                        <span className="w-[24mm] shrink-0 font-mono text-[11px] pt-0.5" style={{ color: MUTED }}>
                          {formatDate(taskDate(plan, task.week, i).toISOString(), { day: "numeric", month: "short" })}
                        </span>
                        <span className="flex-1">
                          <span className="font-medium">{task.title}</span>
                          {res && (
                            <span className="block text-[11px]" style={{ color: MUTED }}>
                              {res.title}: {res.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] pt-0.5" style={{ color: MUTED }}>
                          {t("pl.min", { n: task.minutes })}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 break-inside-avoid">
            <div className="text-sm font-semibold mb-2">{t("pl.weeks", { a: 1, b: plan.totalWeeks })}</div>
            <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${Math.min(plan.totalWeeks, 26)}, minmax(0, 1fr))` }}>
              {Array.from({ length: plan.totalWeeks }, (_, w) => (
                <div key={w} className="aspect-square grid place-items-center rounded-[3px] text-[8px] font-mono" style={{ boxShadow: `inset 0 0 0 1px ${RULE}`, color: MUTED }} title={formatDate(weekStart(plan, w + 1).toISOString(), { day: "numeric", month: "short" })}>
                  {w + 1}
                </div>
              ))}
            </div>
          </div>
        </Sheet>

        {/* Sheet 4: scan-to-open resources */}
        <Sheet>
          <SheetHeader title={t("print.resources")} plan={plan} />
          <div className="grid grid-cols-3 gap-5">
            {plan.resourceIds
              .map((rid) => RESOURCE_BY_ID[rid])
              .filter(Boolean)
              .map((r) => (
                <div key={r.id} className="rounded-[10px] p-4 flex flex-col gap-3 break-inside-avoid" style={{ boxShadow: `inset 0 0 0 1px ${RULE}` }}>
                  {qrs[r.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrs[r.id]} alt={`${t("print.scan")}: ${r.title}`} className="w-[32mm] h-[32mm]" />
                  ) : (
                    <div className="w-[32mm] h-[32mm]" style={{ background: "#f1f4f2" }} />
                  )}
                  <div>
                    <div className="text-[13px] font-semibold leading-snug">{r.title}</div>
                    <div className="text-[11px]" style={{ color: MUTED }}>
                      {r.provider}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em]" style={{ color: PHASE[0] }}>
                      {t("print.scan")}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <p className="mt-auto pt-8 text-center text-sm" style={{ color: MUTED }}>
            {t("print.footer")}
          </p>
        </Sheet>
      </div>
    </div>
  );
}
