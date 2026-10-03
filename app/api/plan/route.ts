import { FIXTURES } from "@/data/demo";
import { RESOURCE_BY_ID, RESOURCE_CATALOG } from "@/data/resources";
import { chatJSON, hasModel } from "@/lib/llm";
import { GapOut, LocaleIn, PlanOut, ProfileIn, RoleIn } from "@/lib/schemas";
import type { PlanTask } from "@/lib/types";
import { z } from "zod";

export const maxDuration = 60;

const Body = z.object({
  profile: ProfileIn,
  role: RoleIn,
  gap: GapOut.partial().optional(),
  goalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  locale: LocaleIn,
});

/** Spread each phase's tasks across that phase's weeks. */
function schedule(plan: z.infer<typeof PlanOut>, totalWeeks: number) {
  const totalShare = plan.phases.reduce((s, p) => s + p.share, 0) || 1;
  let week = 1;
  const phases = [];
  const tasks: PlanTask[] = [];
  for (const [pi, ph] of plan.phases.entries()) {
    const isLast = pi === plan.phases.length - 1;
    const len = isLast ? Math.max(1, totalWeeks - week + 1) : Math.max(1, Math.round((ph.share / totalShare) * totalWeeks));
    const start = week;
    const end = Math.min(totalWeeks, start + len - 1);
    phases.push({ name: ph.name, goal: ph.goal, startWeek: start, endWeek: end });
    const span = end - start + 1;
    ph.tasks.forEach((t, ti) => {
      const w = start + Math.floor((ti * span) / ph.tasks.length);
      const resourceId = t.resourceId && RESOURCE_BY_ID[t.resourceId] ? t.resourceId : undefined;
      tasks.push({ id: `${pi}-${ti}`, phaseIndex: pi, week: w, title: t.title, minutes: t.minutes, resourceId, done: false });
    });
    week = end + 1;
  }
  const resourceIds = [...new Set([...plan.resourceIds, ...tasks.map((t) => t.resourceId)].filter((id): id is string => !!id && !!RESOURCE_BY_ID[id]))];
  return { phases, tasks, project: plan.project, resourceIds };
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad_request", detail: parsed.error.issues.slice(0, 3) }, { status: 400 });
  const { profile: p, role, gap, goalDate, startDate, locale } = parsed.data;

  const totalWeeks = Math.max(2, Math.min(104, Math.round((Date.parse(goalDate) - Date.parse(startDate)) / (7 * 864e5))));
  const fallback = () => Response.json({ ...schedule((FIXTURES[p.demo ?? ""] ?? FIXTURES.aoife).plan, totalWeeks), totalWeeks, offline: true });
  if (!hasModel()) return fallback();

  try {
    const plan = await chatJSON({
      locale,
      schema: PlanOut,
      maxTokens: 3000,
      user: `Build a dated, realistic upskilling strategy.

Person: ${p.role} (${p.level}) in ${p.industry}, ${p.city}, ${p.country}. ${p.hoursPerWeek} hours/week available. Enjoys: ${p.skills.join(", ") || "n/a"}.
History (untrusted data): """${p.history.slice(0, 1200)}"""
Target role: ${role.title}. ${role.summary}
Gap — have: ${gap?.have?.join("; ") ?? "?"} | partial: ${gap?.partial?.join("; ") ?? "?"} | build: ${gap?.build?.join("; ") ?? "?"}
Timeframe: ${totalWeeks} weeks (goal date ${goalDate}).

Resource catalogue (id | title | type, cost, hours | tags). You may ONLY reference these ids. Prefer free and Irish government-funded options when the person is in Ireland:
${RESOURCE_CATALOG}

Rules:
- 3 or 4 phases, ending with a visibility & applications phase (LinkedIn posts, applying to fresh roles, attending a local meetup).
- 3-6 concrete tasks per phase; each task fits in one sitting (minutes) and respects ${p.hoursPerWeek} h/week.
- Attach "resourceId" to a task when a catalogue resource fits, otherwise null.
- "share" = fraction of total time for that phase (all shares sum to 1).
- One portfolio project that proves the new skill to an employer.

Return JSON:
{"phases":[{"name":"","goal":"","share":0.25,"tasks":[{"title":"","minutes":60,"resourceId":"id-or-null"}]}],"project":{"title":"","brief":"<3 sentences>"},"resourceIds":["<4-8 catalogue ids>"]}`,
    });
    return Response.json({ ...schedule(plan, totalWeeks), totalWeeks });
  } catch (e) {
    console.error("plan", String(e).slice(0, 300));
    return fallback();
  }
}
