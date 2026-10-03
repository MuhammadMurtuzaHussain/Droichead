# Droichead — project plan

*Droichead* (DRUH-hed) is Irish for "bridge". The product helps people bridge the gap from the job they have to the job that's coming. Another name option: **Cosán** ("path").

> A wish to switch jobs is a fantasy. Give it a deadline and it becomes a goal.
> Put a plan behind the goal and you have a strategy. Act on the strategy consistently and you get there.

That sequence (**Wish → Goal → Strategy → Action**) runs through the whole product, and the UI shows it as four stages.

---

## 1. Principles

| Principle | What it means in practice |
|---|---|
| **No accounts, private by default** | No login and no database. The profile, plans and progress stay in the browser (IndexedDB). The server is a stateless proxy that stores nothing and logs nothing. |
| **Calm, not doom** | We never say "AI will replace you". The message is that the role is changing and here is how to change with it. Copy is reassuring and specific. |
| **Fast and playful onboarding** | The survey takes about 90 seconds, is tap-first, and lets users skip any question. |
| **Specific, sourced advice** | Every news item, certification, job or event links to a real source. The AI may not invent links. |
| **Native in seven languages** | English, Gaeilge, Polski, Українська, Español, Deutsch, Français. Both the UI and the AI output use the chosen language. |

---

## 2. User flow

```
Landing ──► Quick survey (~90s) ──► Pulse (dashboard) ──► Role detail ──► "Bridge the gap" ──► My Plan
   │                                    ▲                                                     │
   └── language picker                  └──────────── daily refresh / progress ◄──────────────┘
```

### 2.1 Quick survey: "Vibe check", 6–8 cards
A single card on screen at a time, a progress shamrock or knot that fills in as you go, and a "skip" option on every card.

1. **What do you do?** Type a role, with autocomplete, or pick from chips.
2. **Industry**: icon chips (Tech, Finance, Health, Retail, Public sector, Creative…).
3. **Experience**: a slider labelled *Just starting → Seasoned → Veteran*.
4. **Work history** (optional): paste a CV or LinkedIn "About" text, or add 1–3 past roles quickly. The AI parses this into skills.
5. **Skills you enjoy**: tap up to five from chips seeded by step 1.
6. **How do you feel about AI?** 😟 😐 🙂 🤩. This sets the tone of the copy.
7. **Hours per week you can invest**: 2 / 5 / 10 / 15+.
8. **Where?** Country and city for jobs and events, plus a remote, hybrid or on-site preference.

The result is a **profile card** ("You're a *Mid-level Software Developer* in *Fintech*, Dublin"). The user can edit it at any time.

### 2.2 Pulse (dashboard)
- **Industry pulse**: 5–7 AI-summarised news items from the last 7 days, each with its source link and a one-line "what this means for you".
- **How roles are shifting**: changes to the user's current role, for example "Software Dev → more AI-assisted delivery, more client-facing work".
- **Economic weather**: a short take on hiring trends and the economy in the user's country and sector, framed calmly.
- **Spotlight roles**: 3–6 emerging or hot roles matched to the profile, each showing a **match %**, a **momentum** tag (🔥 rising / 📈 steady), and a typical salary band where we can source one.
  *Examples: Forward Deployed Engineer, AI Solutions Engineer, Prompt/LLM Engineer, AI Product Manager, AI Governance Analyst.*

### 2.3 Role detail
- What the role is and what a typical day looks like, in plain language.
- Why it's emerging now, with sources.
- **Gap analysis**: the user's skills set against the role's requirements.
  - ✅ **You already have**: transferable skills. This is the first thing users see, because it reduces anxiety.
  - 🟡 **Partly there**
  - 🔴 **To build**
- Estimated time to bridge, based on the hours per week from the survey.
- A large CTA: **"Bridge the gap →"**

*Example (Software Developer → Forward Deployed Engineer):* the user already has shipping code, APIs, debugging and system design. To build: client discovery, solution architecture, demos and stakeholder communication, deploying in customer environments, and LLM integration patterns.

### 2.4 "Bridge the gap": the main feature
1. **Set the goal.** The user picks a target date with presets of 3, 6 or 12 months, or a custom date. That turns the wish into a goal.
2. The AI generates the **strategy**, a phased plan:
   - **Phases or milestones**, for example *Foundations → Applied project → Visibility → Applications*.
   - **Weekly actions** sized to the user's available hours.
   - **Resources**: certifications, courses, docs and free options first, each tagged with cost, time and a link.
   - **Portfolio project brief**: one concrete project to build that proves the new skill.
3. The user lands in **My Plan**.

### 2.5 My Plan (the planner), with tabs or panels
| Panel | Contents |
|---|---|
| **Timeline / Calendar** | Week and month views, with tasks shown as blocks. The user can drag tasks to reschedule, tick them off, and see a streak. **Export .ics** works with Google, Outlook and Apple Calendar without OAuth. |
| **Path to success** | A milestone roadmap and progress bar ("Week 4 of 24, 18% there"), plus a gentle nudge when tasks are overdue. |
| **Resources** | Certifications and courses from the plan, with a "mark done" button. |
| **Job alerts (48h)** | Postings for the target role from the last 48 hours, filtered by location and remote preference. Each has a link to apply. Refreshes when the panel is opened. |
| **LinkedIn posts** | 3–5 draft posts tied to plan progress, such as "Starting my journey to…", "What I learned building…" or a milestone post. Each has **Copy** and **Open LinkedIn** buttons. We never post on the user's behalf. |
| **Events** | Nearby and online meetups, conferences and webinars, plus deep links to Meetup, Eventbrite and Luma searches that are already filtered. |
| **Weekly check-in** | A 30-second card ("How did this week go?"). The AI adjusts the plan if the user is behind, with no guilt-tripping. |

---

## 3. Architecture

```
┌──────────────────────── Browser ────────────────────────┐
│  Next.js (React) UI · next-intl · Tailwind               │
│  IndexedDB (Dexie): profile, plans, tasks, cache          │
│  Export/Import JSON (optionally passphrase-encrypted)     │
└───────────────┬──────────────────────────────────────────┘
                │ profile sent per-request, never stored
┌───────────────▼──────── Stateless edge API ──────────────┐
│  /api/pulse    → news + role shifts (LLM + web search)    │
│  /api/roles    → spotlight roles + gap analysis           │
│  /api/plan     → bridge-the-gap plan (structured JSON)    │
│  /api/jobs     → job APIs, filtered to ≤48h               │
│  /api/events   → web search + deep links                  │
│  /api/posts    → LinkedIn drafts                          │
│  Holds API keys · rate-limits · no DB · no request logs   │
└──────────────────────────────────────────────────────────┘
```

### Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui, Framer Motion for the survey card animations.
- **i18n**: `next-intl` with ICU messages, which handles the complex plurals in Irish, Polish and Ukrainian.
- **Storage**: Dexie.js (IndexedDB). Optional AES-GCM encryption through the Web Crypto API with a user passphrase.
- **AI**: Claude API through the server route.
  - **Sonnet 5.5** for gap analysis and plan generation. These are the high-value calls.
  - **Haiku 4.5** for news summaries, LinkedIn drafts and translations. These are high-volume and cheap.
  - The built-in **web search tool** grounds news and events in current, cited sources.
  - **Structured outputs** (JSON schema) so the UI always gets typed data.
  - A `locale` parameter is passed on every call, so the AI replies in the UI language.
- **Jobs data**:
  - **Adzuna API** covers DE, FR, ES, PL, GB and more.
  - **Jooble API** covers Ireland and Ukraine, which Adzuna doesn't.
  - Results are filtered by date posted ≤ 48h.
- **Events**: Claude web search for "AI / <role> events near <city>", plus deep links to search pages. The public Eventbrite search API is gone, so we don't rely on it.
- **Hosting**: Vercel. Route handlers run as edge functions with logging off for request bodies.

### Data model (IndexedDB)
```ts
Profile   { id, role, industry, level, skills[], history[], aiFeeling, hoursPerWeek, location, workMode, locale, updatedAt }
PulseCache{ key, locale, data, fetchedAt }            // TTL 24h
Role      { id, title, summary, momentum, matchPct, salaryBand?, sources[] }
Plan      { id, roleId, goalDate, phases[], createdAt, status }
Task      { id, planId, phaseId, title, dueDate, minutes, resourceUrl?, done, doneAt? }
Resource  { id, planId, title, provider, type, cost, hours, url, done }
PostDraft { id, planId, milestone, text, locale }
CheckIn   { id, planId, week, mood, note }
```

### Privacy and security checklist
- [ ] Nothing is stored server-side. Request bodies are never logged.
- [ ] Rate limiting by IP is done in memory or at the edge, and IPs are not persisted.
- [ ] A strict CSP and no third-party trackers. If analytics are needed, use Plausible-style, cookieless analytics.
- [ ] **"Delete everything"** button, plus Export and Import so users can move between devices.
- [ ] Fetched news and pages are treated as data, never as instructions, to guard against prompt injection.
- [ ] Every link the LLM outputs must come from a tool result or web search citation. Any other link is stripped.
- [ ] A clear disclaimer: career guidance, not financial advice.

---

## 4. Irish palette

Inspired by Connemara marble, the Atlantic, gorse, peat and limestone. Text tokens are chosen to pass WCAG AA on their intended backgrounds.

| Token | Name | Light | Dark | Use |
|---|---|---|---|---|
| `--brand` | Emerald | `#0B6E4F` | `#3FBF8F` | Primary buttons, links, active states |
| `--brand-deep` | Shamrock night | `#08483A` | `#0E2B24` | Headers, hero background |
| `--accent` | Gorse gold | `#E8B83A` | `#F2C94C` | Highlights, streaks, "🔥 rising" tags |
| `--accent-2` | Atlantic slate | `#2E5E7E` | `#7FB3D5` | Info, charts, secondary accents |
| `--warm` | Peat / heather | `#8A4F3D` | `#D9937A` | Warnings, "to build" gap chips |
| `--bg` | Limestone cream | `#F7F4EC` | `#0F1A17` | Page background |
| `--surface` | Wool white | `#FFFFFF` | `#16241F` | Cards |
| `--ink` | Basalt | `#1B2420` | `#E8EFEA` | Body text |
| `--muted` | Burren grey | `#5F6B66` | `#9AA8A1` | Secondary text |
| `--line` | Drystone | `#E2DDD0` | `#26362F` | Borders, dividers |

**Gap chips**: ✅ have = `--brand`, 🟡 partial = `--accent`, 🔴 build = `--warm`. These deliberately avoid alarm red.

**Type** (both fonts cover Latin Extended and Cyrillic, which we need for fadas, Polish diacritics and Ukrainian):
- Headings: **Source Serif 4**, which has an editorial, bookish feel.
- UI and body: **Manrope** or **Inter**.

**Motifs** (use sparingly): a thin Celtic-knot line as the survey progress indicator, and a subtle Atlantic wave divider. No leprechauns or clichés.

---

## 5. Multilingual plan

| Code | Language | Endonym in switcher | Notes |
|---|---|---|---|
| `en` | English | English | Fallback and source strings |
| `ga` | Irish | Gaeilge | 5 plural forms; needs native review. Job and news *content* may stay in English, with an AI summary in Irish. |
| `pl` | Polish | Polski | 3+ plural forms |
| `uk` | Ukrainian | Українська | Cyrillic; check font coverage |
| `es` | Spanish | Español | |
| `de` | German | Deutsch | Strings are about 30% longer, so buttons and chips must wrap gracefully |
| `fr` | French | Français | Non-breaking spaces before `: ; ! ?` |

- URLs are locale-prefixed (`/ga/plan`). On first visit we auto-detect from `navigator.language` and remember the choice locally.
- Dates and numbers use `Intl.DateTimeFormat` and `Intl.NumberFormat`. Currency defaults to EUR, with PLN for Polish and UAH for Ukrainian users.
- The AI system prompt says: *"Respond in {locale}. Keep proper nouns, company names and certification titles in their original form."*
- Translation workflow: the English JSON is the source. The other locales are AI-drafted, then reviewed by a native speaker. Gaeilge needs this most.
- Write a test that fails the build if any locale is missing a key.

---

## 6. AI prompt design (outline)

| Call | Model | Input | Output schema |
|---|---|---|---|
| Parse history | Haiku | Pasted CV text | `{ roles[], skills[], level }` |
| Pulse | Haiku + web search | Profile, locale | `{ news[{title, source, url, date, soWhat}], roleShifts[], economy }` |
| Spotlight roles | Sonnet + web search | Profile | `{ roles[{title, why, momentum, matchPct, sources[]}] }` |
| Gap analysis | Sonnet | Profile, role | `{ have[], partial[], build[], weeksEstimate }` |
| Plan | Sonnet + web search | Profile, role, gap, goalDate, hours | `{ phases[{name, weeks, tasks[{title, minutes, week}], resources[]}], project }` |
| LinkedIn posts | Haiku | Plan, milestone, locale | `{ posts[{hook, body, hashtags[]}] }` |
| Re-plan | Sonnet | Plan, check-ins | Changes to the plan as a diff |

Tone guardrail for every prompt: *encouraging, concrete, honest; never fear-based; lead with transferable strengths.*

Cache Pulse responses for 24 hours per (role, industry, country, locale) on the client, and optionally at the edge, since that key carries no personal data. This keeps costs down.

---

## 7. Build phases

### Phase 0: Setup
Next.js, Tailwind, palette tokens, fonts, next-intl with all 7 locales, the Dexie schema, and the API proxy skeleton.

### Phase 1: MVP (the demo path)
1. Landing page and language switcher
2. Quick survey, ending in the profile card
3. Pulse: news and spotlight roles
4. Role detail with gap analysis
5. Bridge the gap: goal date in, plan out
6. My Plan with timeline, tasks and checkboxes, plus **.ics export**

### Phase 2: "Wow" panels
7. Job alerts (48h)
8. LinkedIn post drafts with Copy and Open LinkedIn
9. Events with deep links
10. Streaks and weekly check-ins

### Phase 3: Polish
11. Encrypted export and import, and the "Delete everything" button
12. Native review of translations, plus a long-string (German) layout pass
13. Accessibility pass (keyboard navigation, contrast, reduced motion) and mobile pass
14. Seeded demo profile ("Try as Aoife, a mid-level dev in Dublin") so judges can skip onboarding

---

## 8. Open questions
1. **Timeframe**: is this for a specific hackathon, and how many hours are available? That decides how much of Phase 2 makes the demo.
2. **API keys**: should the stateless proxy hold our keys (recommended for UX), or should users bring their own key (fully client-side, but worse UX)?
3. **Geography**: is this Ireland-first, with the other languages serving Ireland's diaspora and migrant communities, or pan-EU from day one? This affects which job APIs and salary data we prioritise.
4. **Final name**: Droichead, Cosán, or something else?
