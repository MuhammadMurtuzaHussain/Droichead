"use client";

import confetti from "canvas-confetti";
import type { Plan } from "./types";

const COLORS = ["#52d3a2", "#74e2b8", "#efc65c", "#e8f0eb"];
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Small burst from the element that was ticked; bigger for phase or plan completion. */
export function celebrate(el: Element | null, size: "task" | "phase" | "all") {
  if (reduced()) return;
  const r = el?.getBoundingClientRect();
  const origin = r ? { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight } : { x: 0.5, y: 0.6 };
  if (size === "task") return void confetti({ particleCount: 26, spread: 55, startVelocity: 22, scalar: 0.7, ticks: 90, origin, colors: COLORS, disableForReducedMotion: true });
  const count = size === "all" ? 260 : 120;
  confetti({ particleCount: count, spread: 100, startVelocity: 45, origin: { x: 0.5, y: 0.7 }, colors: COLORS, disableForReducedMotion: true });
  if (size === "all") setTimeout(() => confetti({ particleCount: 160, angle: 60, spread: 70, origin: { x: 0, y: 0.8 }, colors: COLORS }), 250);
  if (size === "all") setTimeout(() => confetti({ particleCount: 160, angle: 120, spread: 70, origin: { x: 1, y: 0.8 }, colors: COLORS }), 400);
}

/** Consecutive plan weeks, ending this week or last, with at least one finished task. */
export function streak(plan: Plan) {
  const wk = (ts: number) => Math.floor((ts - Date.parse(plan.startDate)) / (7 * 864e5));
  const weeks = new Set(plan.tasks.filter((t) => t.done && t.doneAt).map((t) => wk(t.doneAt!)));
  let w = wk(Date.now());
  if (!weeks.has(w)) w -= 1;
  let n = 0;
  while (weeks.has(w)) {
    n++;
    w--;
  }
  return n;
}
