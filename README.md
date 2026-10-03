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
   - a timeline with checkboxes and progress
   - an **.ics export** for Google, Outlook or Apple Calendar
   - **job searches limited to the last 48 hours** (LinkedIn, Indeed)
   - **LinkedIn post drafts** tied to milestones, with copy and share buttons (we never post for you)
   - local and online **events**

The UI is available in **English, Gaeilge, Polski, Українська, Español, Deutsch and Français**, and the AI writes its output in the chosen language.

## How we use DigitalOcean

| | |
|---|---|
| **Gradient AI serverless inference** | Every AI call (pulse, roles, gap, plan, posts) uses an **open-weight model**, `llama3.3-70b-instruct` by default, through Gradient's OpenAI-compatible endpoint (`https://inference.do-ai.run/v1`). |
| **App Platform** | The Next.js app deploys from this repo on every push (`.do/app.yaml`). The server routes are a stateless proxy: they hold the model key and store nothing. |

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/MuhammadMurtuzaHussain/Droichead/tree/main)

## Open-source AI

- **Open-weight models only.** By default this is Meta Llama 3.3 70B Instruct, served by DigitalOcean Gradient. You can swap it with `DO_MODEL` for any open-weight model in the Gradient catalogue, such as Qwen, Mistral or DeepSeek.
- **MIT licensed.**
- **An Agent Skill** in [`skills/bridge-the-gap`](skills/bridge-the-gap/SKILL.md) packages the gap-analysis and planning method so any agent can run it.

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
App Platform service (Next.js route handlers, stateless)
  /api/pulse  RSS feeds -> Llama: summaries, role shifts, spotlight roles
  /api/gap    Llama: have / partial / build
  /api/plan   Llama + curated resource catalogue -> phased plan
  /api/posts  Llama: LinkedIn drafts
        |
        v
DigitalOcean Gradient serverless inference (open-weight Llama 3.3 70B)
```

## Run locally

```bash
npm install
echo "DO_MODEL_KEY=your-gradient-model-access-key" > .env.local
npm run dev
```

Without a key, the app still runs and uses the demo fixtures. Use `npm run check:i18n` to verify that every locale has every key.

## Credits

- Photography from Wikimedia Commons:
  - Samuel Beckett Bridge, Dublin, by DXR (CC BY-SA 4.0)
  - Brian Boru Bridge, Cork, by Joachim Kohler-HB (CC BY-SA 4.0)
- Icons by Phosphor. Type is Geist.

Career guidance, not financial advice.
