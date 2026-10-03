# Droichead

**Bridge the gap to the job that's coming.** *Droichead* (DRUH-hed) is Irish for "bridge".

Droichead is a calm, private career navigator for people whose work is being reshaped by AI. It was built in Dublin for **Hack for Humanity** (Hacktoberfest Hack Day Dublin x The AI Collective), on the job-displacement track: *help people navigate changing roles, skills, opportunities and economic security.*

> A wish to switch jobs is a fantasy. Give it a deadline and it becomes a goal. Put a plan behind the goal and you have a strategy. Act on the strategy consistently and that is success.

## The problem, locally

AI anxiety is real, and it is not evenly spread. In Ireland, a big share of the workforce works in a second language. That includes large Polish and Ukrainian communities, and international workers in Dublin's tech and finance sectors. The advice they get is generic, English-only and often fear-based. Ireland also funds excellent upskilling through Springboard+, Skillnet Ireland and SOLAS eCollege, but most people never connect those programmes to a concrete next role.

## What it does

1. **A 90-second check-in.** It's a playful, tap-first survey: role, industry, experience, optional CV snippet, skills you enjoy, how you feel about AI, hours per week, and location. Every question can be skipped.
2. **Pulse.** You see real news from the last 7 days, pulled from Silicon Republic, RTÉ, the Irish Times, the Guardian and TechCrunch, and filtered to your industry. Each article gets one line on what it means for you. Pulse also covers how your current role is shifting and the economic weather.
3. **Roles to grow into.** These are emerging and changing roles, such as Forward Deployed Engineer, AI Solutions Engineer and AI-enabled Finance Analyst, ranked by honest fit.
4. **Gap analysis.** It shows *what you already have* first, then *partly there*, then *to build*, with a realistic time estimate.
5. **Bridge the gap.** You pick a goal date, and Droichead generates a phased, week-by-week strategy sized to your hours. It includes a portfolio project, and tasks link to real courses and certifications.
6. **My plan.** This includes:
   - a **printable wall planner**: an A4 goal poster, month-by-month calendars with every task day marked, and a week-by-week checklist
   - a timeline with checkboxes and progress
   - an **.ics export** for Google, Outlook or Apple Calendar
   - **job searches limited to the last 48 hours** (LinkedIn, Indeed)
   - **LinkedIn post drafts** tied to milestones, with copy and share buttons (we never post for you)
   - local and online **events**

The UI is available in **English, Gaeilge, Polski, Українська, Español, Deutsch and Français**, and the AI writes its output in the chosen language.

## Open-source AI, running locally

- **Open-weight Gemma 4 everywhere.** Every AI call (roles, news commentary, gap analysis, plan, LinkedIn drafts) runs on Google's open-weight **Gemma 4**:
  - **Hosted:** `gemma-4-26b-a4b-it` through Google AI Studio (set `GOOGLE_API_KEY`), with thinking set to minimal so a gap analysis takes about 4 seconds.
  - **Fully local:** `gemma4:12b` through [Ollama](https://ollama.com) when no key is set. The user's answers never leave the computer.
- **Provider-agnostic.** `lib/llm.ts` also speaks to any OpenAI-compatible endpoint that serves open-weight models, such as DigitalOcean Inference, Groq or vLLM. Set `LLM_PROVIDER=openai`, `LLM_BASE_URL`, `LLM_API_KEY` and `LLM_MODEL`.
- **MIT licensed.**
- **An Agent Skill** in [`skills/bridge-the-gap`](skills/bridge-the-gap/SKILL.md) packages the gap-analysis and planning method so any agent can run it.

Measured locally on an Apple M5 laptop with Gemma 4 12B (Q4_K_M). Hosted Gemma 4 26B-A4B is about 4 times faster (gap analysis in about 4 s, roles in about 9 s):

| Call | Time |
|---|---|
| Gap analysis | about 9 s |
| News commentary | about 21 s |
| Roles | about 28 s |
| Full 26-week plan | about 42 s |

Roles and news are separate requests, so the roles render first. The landing page warms the model while you read. The two demo personas ship with pre-written content for their headline role, so a live demo never waits, and any other role or language runs live.

## Privacy and safety by design

- **No accounts, no database, no tracking.** Profiles and plans live in the browser's IndexedDB. The user can export, import or delete everything in one tap.
- **Every link shown to a user is real.** News links come straight from RSS feeds, and courses come from a curated, human-checked catalogue (`data/resources.ts`). The model may only pick resources by id, and it never outputs URLs.
- **Fetched text is treated as untrusted data.** The system prompt tells the model never to follow instructions found in articles or CV text.
- **Model output is checked.** It's validated against a zod schema and retried once. If the model is unreachable, the demo profiles fall back to fixtures so the experience never dead-ends.

## Architecture

```
Browser (Next.js, React, Tailwind v4, Motion)
  IndexedDB (Dexie): profile, plans, 24h cache
        |  profile sent per request, never stored
        v
Next.js route handlers (stateless, store nothing)
  /api/pulse  RSS feeds -> Gemma: roles, news commentary, role shifts
  /api/gap    Gemma: have / partial / build
  /api/plan   Gemma + curated resource catalogue -> phased, dated plan
  /api/posts  Gemma: LinkedIn drafts
        |
        v
Ollama on localhost (open-weight Gemma 4 12B)
```

## Deploy on Render

The repo includes a Render Blueprint (`render.yaml`):

1. In Render, choose **New > Blueprint** and connect this repo.
2. When prompted, paste your Google AI Studio key as `GOOGLE_API_KEY`.

Render builds the app with `npm ci && npm run build` and starts it with `npm start`. The health check is `/api/health`.

## Run locally

```bash
ollama pull gemma4:12b
npm install
npm run dev
```

If no model is reachable, the app still runs and falls back to the demo fixtures. Use `npm run check:i18n` to verify that every locale has every key.

## Credits

- Photography from Wikimedia Commons:
  - Samuel Beckett Bridge, Dublin, by DXR (CC BY-SA 4.0)
  - Brian Boru Bridge, Cork, by Joachim Kohler-HB (CC BY-SA 4.0)
- Icons by Phosphor. Type is Geist.

Career guidance, not financial advice.
