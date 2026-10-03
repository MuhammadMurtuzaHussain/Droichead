import { RESOURCE_BY_ID } from "@/data/resources";
import type { Plan } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

/** Monday-of-week date for week N (1-based) of a plan. */
export function weekStart(plan: Pick<Plan, "startDate">, week: number) {
  const d = new Date(plan.startDate + "T09:00:00");
  d.setDate(d.getDate() + (week - 1) * 7);
  return d;
}

/** The calendar day a task is scheduled on: tasks in a week spread across Tue, Thu and Sat. */
export function taskDate(plan: Pick<Plan, "startDate">, week: number, index: number) {
  const d = weekStart(plan, week);
  d.setDate(d.getDate() + [1, 3, 5][index % 3]);
  return d;
}

export function planToIcs(plan: Plan): string {
  const now = new Date();
  const stamp = `${ymd(now)}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Droichead//Bridge the gap//EN", "CALSCALE:GREGORIAN", `X-WR-CALNAME:${esc("Droichead · " + plan.roleTitle)}`];

  plan.tasks.forEach((task, i) => {
    const d = taskDate(plan, task.week, i);
    const end = new Date(d);
    end.setDate(end.getDate() + 1);
    const res = task.resourceId ? RESOURCE_BY_ID[task.resourceId] : undefined;
    const phase = plan.phases[task.phaseIndex]?.name ?? "";
    lines.push(
      "BEGIN:VEVENT",
      `UID:${plan.id}-${task.id}@droichead`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(d)}`,
      `DTEND;VALUE=DATE:${ymd(end)}`,
      `SUMMARY:${esc(`🌉 ${task.title} (${task.minutes} min)`)}`,
      `DESCRIPTION:${esc(`${phase}${res ? `\n${res.title}: ${res.url}` : ""}\nDroichead plan → ${plan.roleTitle}`)}`,
      ...(res ? [`URL:${res.url}`] : []),
      "END:VEVENT",
    );
  });

  const goal = new Date(plan.goalDate + "T09:00:00");
  const goalEnd = new Date(goal);
  goalEnd.setDate(goalEnd.getDate() + 1);
  lines.push(
    "BEGIN:VEVENT",
    `UID:${plan.id}-goal@droichead`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(goal)}`,
    `DTEND;VALUE=DATE:${ymd(goalEnd)}`,
    `SUMMARY:${esc(`🎯 Goal: ready for ${plan.roleTitle}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  );
  return lines.join("\r\n");
}

export function downloadIcs(plan: Plan) {
  const blob = new Blob([planToIcs(plan)], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `droichead-${plan.roleSlug}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
