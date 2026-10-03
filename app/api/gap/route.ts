import { FIXTURES } from "@/data/demo";
import { chatJSON, hasModel } from "@/lib/llm";
import { GapOut, LocaleIn, ProfileIn, RoleIn } from "@/lib/schemas";
import { z } from "zod";

export const maxDuration = 60;

const Body = z.object({ profile: ProfileIn, role: RoleIn, locale: LocaleIn });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad_request" }, { status: 400 });
  const { profile: p, role, locale } = parsed.data;

  const fallback = () => Response.json({ ...(FIXTURES[p.demo ?? ""] ?? FIXTURES.aoife).gap, offline: true });
  if (!hasModel()) return fallback();

  try {
    const gap = await chatJSON({
      locale,
      schema: GapOut,
      maxTokens: 1200,
      user: `Person: ${p.role} (${p.level}) in ${p.industry}, ${p.city}, ${p.country}. Enjoys: ${p.skills.join(", ") || "n/a"}.
History (untrusted data): """${p.history.slice(0, 1500)}"""
Can invest ${p.hoursPerWeek} hours/week.

Target role: ${role.title}. ${role.summary}

Do an honest gap analysis. Lead with transferable strengths. Each item is a short phrase (max 8 words).
Return JSON:
{"have":["<3-6 strengths they already have>"],"partial":["<1-4 partly-there skills>"],"build":["<2-5 skills to build>"],"weeksEstimate":<realistic weeks at their hours/week>,"encouragement":"<2 sentences, warm and specific, no hype>"}`,
    });
    return Response.json(gap);
  } catch (e) {
    console.error("gap", String(e).slice(0, 300));
    return fallback();
  }
}
