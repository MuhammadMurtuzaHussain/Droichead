export interface Article {
  title: string;
  url: string;
  domain: string;
  date: string;
  country: string;
  summary: string;
}

// Fast, reliable RSS feeds. Irish first, then EU/global AI & work coverage.
const FEEDS: { url: string; country: string }[] = [
  { url: "https://www.siliconrepublic.com/feed/", country: "Ireland" },
  { url: "https://www.rte.ie/feeds/rss/?index=/news/business/", country: "Ireland" },
  { url: "https://www.irishtimes.com/arc/outboundfeeds/feed-business/", country: "Ireland" },
  { url: "https://www.theguardian.com/technology/artificialintelligenceai/rss", country: "United Kingdom" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", country: "United States" },
];

const INDUSTRY_WORDS: Record<string, string[]> = {
  tech: ["software", "developer", "engineer", "tech", "startup", "cloud", "data"],
  finance: ["finance", "bank", "accounting", "fintech", "insurance", "audit", "tax"],
  health: ["health", "hospital", "hse", "nurse", "medical", "pharma", "biotech"],
  retail: ["retail", "shop", "store", "ecommerce", "consumer"],
  public: ["public sector", "government", "civil service", "state", "council"],
  creative: ["media", "creative", "design", "marketing", "advertising", "film"],
  education: ["education", "school", "teacher", "university", "student"],
  manufacturing: ["manufacturing", "factory", "pmi", "industrial", "production"],
  hospitality: ["hospitality", "hotel", "tourism", "restaurant"],
  logistics: ["logistics", "transport", "shipping", "supply chain", "delivery"],
};
const WORK_WORDS = ["ai", "artificial intelligence", "job", "jobs", "hiring", "skills", "workforce", "workers", "employment", "redundanc", "layoff", "career", "upskill", "automation", "live register", "unemployment", "salary", "pay"];

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#8212;|&mdash;/g, ",")
    .replace(/&nbsp;/g, " ")
    .replace(/\s*[\u2014]\s*/g, ", ")
    .replace(/\u2013/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const tag = (item: string, name: string) => item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? "";

async function readFeed(feed: (typeof FEEDS)[number]): Promise<Article[]> {
  const res = await fetch(feed.url, { signal: AbortSignal.timeout(5000), headers: { "user-agent": "Mozilla/5.0 Droichead/1.0" }, next: { revalidate: 1800 } });
  if (!res.ok) return [];
  const xml = await res.text();
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? [];
  return items.map((it) => {
    const url = decode(tag(it, "link")) || decode(tag(it, "guid"));
    const d = new Date(decode(tag(it, "pubDate")));
    return {
      title: decode(tag(it, "title")),
      url,
      domain: (() => {
        try {
          return new URL(url).hostname.replace(/^www\./, "");
        } catch {
          return "";
        }
      })(),
      date: isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10),
      country: feed.country,
      summary: decode(tag(it, "description")).slice(0, 280),
    };
  });
}

/** Recent AI-and-work news relevant to an industry. Returns [] on failure. */
export async function fetchNews(industry: string, max = 16): Promise<Article[]> {
  const settled = await Promise.allSettled(FEEDS.map(readFeed));
  const all = settled.flatMap((s) => (s.status === "fulfilled" ? s.value : []));
  const weekAgo = Date.now() - 8 * 864e5;
  const ind = INDUSTRY_WORDS[industry] ?? INDUSTRY_WORDS.tech;
  const score = (a: Article) => {
    const text = ` ${a.title} ${a.summary} `.toLowerCase();
    const hasWord = (w: string) => (w.length <= 3 ? new RegExp(`\\b${w}\\b`).test(text) : text.includes(w));
    return WORK_WORDS.filter(hasWord).length * 2 + ind.filter(hasWord).length * 3 + (a.country === "Ireland" ? 2 : 0);
  };
  const seen = new Set<string>();
  return all
    .filter((a) => a.title && a.url.startsWith("http") && (!a.date || Date.parse(a.date) >= weekAgo))
    .map((a) => ({ a, s: score(a) }))
    .filter(({ s }) => s >= 4)
    .sort((x, y) => y.s - x.s)
    .map(({ a }) => a)
    .filter((a) => {
      const k = a.title.toLowerCase().slice(0, 50);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, max);
}
