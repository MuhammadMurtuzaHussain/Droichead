import type { Profile } from "./types";

const enc = encodeURIComponent;

const INDEED_DOMAIN: Record<string, string> = {
  ireland: "ie.indeed.com",
  "united kingdom": "uk.indeed.com",
  uk: "uk.indeed.com",
  poland: "pl.indeed.com",
  germany: "de.indeed.com",
  france: "fr.indeed.com",
  spain: "es.indeed.com",
  netherlands: "nl.indeed.com",
};

export interface DeepLink {
  site: string;
  url: string;
  remote?: boolean;
}

/** Live job searches pre-filtered to postings from the last 48 hours. */
export function jobLinks(role: string, p: Pick<Profile, "city" | "country" | "workMode">): DeepLink[] {
  const loc = [p.city, p.country].filter(Boolean).join(", ");
  const indeed = INDEED_DOMAIN[p.country.trim().toLowerCase()] ?? "ie.indeed.com";
  const links: DeepLink[] = [
    { site: "LinkedIn", url: `https://www.linkedin.com/jobs/search/?keywords=${enc(role)}&location=${enc(loc)}&f_TPR=r172800` },
    { site: "Indeed", url: `https://${indeed}/jobs?q=${enc(role)}&l=${enc(p.city)}&fromage=2` },
  ];
  if (p.workMode === "remote" || p.workMode === "any" || p.workMode === "hybrid") {
    links.push({
      site: "LinkedIn",
      remote: true,
      url: `https://www.linkedin.com/jobs/search/?keywords=${enc(role)}&location=${enc(p.country || "Europe")}&f_TPR=r172800&f_WT=2`,
    });
  }
  return links;
}

export function eventLinks(role: string, p: Pick<Profile, "city" | "country">): DeepLink[] {
  const q = `${role} AI`;
  const city = p.city || "Dublin";
  const country = p.country || "Ireland";
  const slug = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-");
  return [
    { site: "Meetup", url: `https://www.meetup.com/find/?keywords=${enc(q)}&source=EVENTS&location=${enc(`${slug(country).slice(0, 2)}--${city}`)}` },
    { site: "Eventbrite", url: `https://www.eventbrite.com/d/${slug(country)}--${slug(city)}/${enc(slug(q))}/` },
    { site: "LinkedIn Events", url: `https://www.linkedin.com/search/results/events/?keywords=${enc(q)}` },
    { site: "Luma", url: `https://lu.ma/discover` },
  ];
}

export function linkedInShareUrl(text: string) {
  return `https://www.linkedin.com/feed/?shareActive=true&text=${enc(text)}`;
}
