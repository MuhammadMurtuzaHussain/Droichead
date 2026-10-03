import { z } from "zod";

// Live openings from two free, keyless job boards:
// Arbeitnow (EU, mostly Germany, very fresh) and Remotive (remote roles worldwide).
export const maxDuration = 30;

const Body = z.object({ role: z.string().min(2).max(120), remote: z.boolean().default(true) });

export interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
  postedAt: number; // ms
  source: "Arbeitnow" | "Remotive";
  remote: boolean;
}

const GENERIC = new Set(["senior", "junior", "lead", "head", "of", "and", "the", "ai", "(ai", "a", "an", "for", "in", "-", "&", "i", "ii", "iii"]);
const BROAD = new Set(["engineer", "developer", "manager", "specialist", "analyst", "consultant", "associate", "officer"]);

function words(s: string) {
  return s
    .toLowerCase()
    .replace(/[()/,.]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !GENERIC.has(w));
}

/** Score a posting title against the target role: distinctive words count more than broad ones. */
function score(target: string[], title: string) {
  const t = new Set(words(title));
  // If the role names a job family (engineer, analyst...), the posting must share it unless it matches strongly.
  const family = target.filter((w) => BROAD.has(w));
  const sameFamily = family.length === 0 || family.some((w) => t.has(w));
  let s = sameFamily ? 0 : -3;
  for (const w of target) if (t.has(w)) s += BROAD.has(w) ? 1 : 3;
  // "AI" in the posting is a bonus for AI-era roles.
  if (/\bai\b|machine learning|llm|genai/i.test(title)) s += 1;
  return s;
}

// Arbeitnow pages are ~3.5 MB (too big for Next's data cache), so keep the parsed list in memory briefly.
let arbeitnowCache: { at: number; jobs: Job[] } | null = null;

async function arbeitnow(): Promise<Job[]> {
  if (arbeitnowCache && Date.now() - arbeitnowCache.at < 15 * 60 * 1000) return arbeitnowCache.jobs;
  const pages = await Promise.allSettled(
    [1, 2, 3].map((p) =>
      fetch(`https://www.arbeitnow.com/api/job-board-api?page=${p}`, { signal: AbortSignal.timeout(7000), cache: "no-store" }).then((r) => r.json() as Promise<{ data: { title: string; company_name: string; location: string; url: string; created_at: number; remote: boolean }[] }>),
    ),
  );
  const jobs = pages.flatMap((p) =>
    p.status === "fulfilled"
      ? p.value.data.map((j) => ({ title: j.title, company: j.company_name, location: j.location, url: j.url, postedAt: j.created_at * 1000, source: "Arbeitnow" as const, remote: j.remote }))
      : [],
  );
  if (jobs.length) arbeitnowCache = { at: Date.now(), jobs };
  return jobs;
}

async function remotive(role: string): Promise<Job[]> {
  const q = words(role).filter((w) => !BROAD.has(w)).join(" ") || role;
  const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q)}&limit=60`, { signal: AbortSignal.timeout(7000), next: { revalidate: 900 } }).catch(() => null);
  if (!res?.ok) return [];
  const d = (await res.json()) as { jobs: { title: string; company_name: string; candidate_required_location: string; url: string; publication_date: string }[] };
  return d.jobs.map((j) => ({ title: j.title, company: j.company_name, location: j.candidate_required_location, url: j.url, postedAt: Date.parse(j.publication_date + "Z"), source: "Remotive" as const, remote: true }));
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad_request" }, { status: 400 });
  const { role } = parsed.data;
  const target = words(role);

  const [a, r] = await Promise.allSettled([arbeitnow(), remotive(role)]);
  const all = [...(a.status === "fulfilled" ? a.value : []), ...(r.status === "fulfilled" ? r.value : [])];
  const now = Date.now();
  const seen = new Set<string>();
  const jobs = all
    .filter((j) => j.url && now - j.postedAt < 14 * 864e5)
    .map((j) => ({ j, s: score(target, j.title) }))
    .filter(({ s }) => s >= 3)
    .sort((x, y) => y.s - x.s || y.j.postedAt - x.j.postedAt)
    .map(({ j }) => j)
    .filter((j) => {
      const k = `${j.title}|${j.company}`.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 8)
    .sort((x, y) => y.postedAt - x.postedAt);

  return Response.json({ jobs, fresh: jobs.filter((j) => now - j.postedAt <= 48 * 36e5).length });
}
