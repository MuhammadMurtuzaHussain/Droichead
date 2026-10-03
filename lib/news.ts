export interface Article {
  title: string;
  url: string;
  domain: string;
  date: string;
  country: string;
}

const INDUSTRY_TERMS: Record<string, string> = {
  tech: '(software OR developers OR "tech sector")',
  finance: '(finance OR banking OR accounting OR fintech)',
  health: '(healthcare OR hospitals OR nursing OR "health sector")',
  retail: '(retail OR ecommerce OR shops)',
  public: '("public sector" OR government OR "civil service")',
  creative: '(media OR creative OR design OR marketing)',
  education: '(education OR teachers OR universities)',
  manufacturing: '(manufacturing OR factories OR industry)',
  hospitality: '(hospitality OR hotels OR tourism)',
  logistics: '(logistics OR transport OR "supply chain")',
};

const tidy = (s: string) => s.replace(/\s+([,.:;!?%)])/g, "$1").replace(/([(])\s+/g, "$1").replace(/\s+-\s+/g, "-").replace(/\s{2,}/g, " ").trim();

function gdeltDate(s: string) {
  // 20260929T114500Z -> 2026-09-29
  return s ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : "";
}

/** Recent AI-and-work news for an industry from GDELT (free, no key). Returns [] on any failure. */
export async function fetchNews(industry: string, max = 14): Promise<Article[]> {
  const term = INDUSTRY_TERMS[industry] ?? INDUSTRY_TERMS.tech;
  const query = `(AI OR "artificial intelligence") (jobs OR hiring OR workforce OR skills OR careers) ${term} sourcelang:english`;
  const url =
    "https://api.gdeltproject.org/api/v2/doc/doc?" +
    new URLSearchParams({ query, mode: "artlist", maxrecords: "40", format: "json", timespan: "7d", sort: "hybridrel" });
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(9000), next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const text = await res.text();
    if (!text.startsWith("{")) return []; // GDELT returns plain-text errors when rate limited
    const json = JSON.parse(text) as { articles?: { title: string; url: string; domain: string; seendate: string; sourcecountry: string }[] };
    const seen = new Set<string>();
    const out: Article[] = [];
    // Prefer Irish / UK / EU sources first, then the rest.
    const pref = ["Ireland", "United Kingdom", "Germany", "France", "Spain", "Poland", "Ukraine"];
    const arts = [...(json.articles ?? [])].sort((a, b) => Number(pref.includes(b.sourcecountry)) - Number(pref.includes(a.sourcecountry)));
    for (const a of arts) {
      const key = tidy(a.title).toLowerCase().slice(0, 60);
      if (!a.url || seen.has(key)) continue;
      seen.add(key);
      out.push({ title: tidy(a.title), url: a.url, domain: a.domain, date: gdeltDate(a.seendate), country: a.sourcecountry });
      if (out.length >= max) break;
    }
    return out;
  } catch {
    return [];
  }
}
