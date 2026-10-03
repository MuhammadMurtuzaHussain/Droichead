import { chatJSON, hasModel } from "@/lib/llm";
import { LocaleIn, PostsOut, ProfileIn } from "@/lib/schemas";
import { z } from "zod";

export const maxDuration = 60;

const Body = z.object({
  profile: ProfileIn,
  roleTitle: z.string().max(120),
  phases: z.array(z.string().max(200)).max(6),
  project: z.string().max(400),
  locale: LocaleIn,
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad_request" }, { status: 400 });
  const { profile: p, roleTitle, phases, project, locale } = parsed.data;

  const fallback = () =>
    Response.json({
      posts: [
        { milestone: "Kick-off", text: `I'm starting a ${phases.length}-phase plan to grow from ${p.role} into ${roleTitle}. AI is changing how we work, and I'd rather shape that change than wait for it.\n\nFirst up: ${phases[0] ?? "the foundations"}. If you've made a similar move, I'd love to hear what helped.\n\n#upskilling #AI #careers` },
        { milestone: "Project shipped", text: `Built something I'm proud of: ${project}.\n\nBiggest lesson: the tech was the easy part; understanding the user's real problem took the most work.\n\n#buildinpublic #${roleTitle.replace(/\s+/g, "")}` },
        { milestone: "Ready", text: `A few months ago I set a goal: become a ${roleTitle}. Today I'm ready and open to opportunities in ${p.city}${p.workMode === "remote" ? " or remote" : ""}.\n\nThank you to everyone who shared advice along the way. 🙏\n\n#opentowork #${roleTitle.replace(/\s+/g, "")}` },
      ],
      offline: true,
    });

  if (!hasModel()) return fallback();
  try {
    const out = await chatJSON({
      locale,
      schema: PostsOut,
      maxTokens: 1500,
      temperature: 0.8,
      user: `Write 3 LinkedIn posts for ${p.name || "this person"}, currently a ${p.role} in ${p.city}, who is upskilling towards ${roleTitle}.
Plan phases: ${phases.join(" → ")}. Portfolio project: ${project}.
Posts: (1) kick-off announcing the journey, (2) sharing a lesson from the portfolio project, (3) milestone "ready & open to opportunities".
Style: first person, human, specific, humble, no corporate buzzwords, 60-120 words, a hook in the first line, 2-4 relevant hashtags at the end. Use line breaks.
Return JSON: {"posts":[{"milestone":"<short label>","text":"<post>"}]}`,
    });
    return Response.json(out);
  } catch (e) {
    console.error("posts", String(e).slice(0, 300));
    return fallback();
  }
}
