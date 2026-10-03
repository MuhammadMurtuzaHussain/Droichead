// Offline-safe fixtures for the two demo profiles. Used when the model is
// unreachable so a live demo never dead-ends.
import type { Gap, Profile, SpotlightRole } from "@/lib/types";
import type { z } from "zod";
import type { PlanOut } from "@/lib/schemas";

type DemoProfile = Omit<Profile, "id" | "updatedAt">;

export const DEMO_PROFILES: Record<string, DemoProfile> = {
  aoife: {
    name: "Aoife",
    role: "Software Developer",
    industry: "tech",
    level: "mid",
    history: "4 years building payment APIs in TypeScript and Node at a Dublin fintech. Before that, 2 years as a support engineer. Comfortable with AWS, Postgres, and code review. Have used Copilot daily for a year.",
    skills: ["Coding", "Problem solving", "Talking to clients"],
    aiFeeling: 2,
    hoursPerWeek: 5,
    country: "Ireland",
    city: "Dublin",
    workMode: "hybrid",
    demo: "aoife",
  },
  oksana: {
    name: "Оксана",
    role: "Бухгалтерка",
    industry: "finance",
    level: "senior",
    history: "9 років бухгалтеркою в Харкові (МСФЗ, 1С, Excel). З 2023 року в Корку, працюю в адмініструванні рахунків. Англійська: B2.",
    skills: ["Numbers & finance", "Data & spreadsheets", "Organising projects"],
    aiFeeling: 1,
    hoursPerWeek: 5,
    country: "Ireland",
    city: "Cork",
    workMode: "any",
    demo: "oksana",
  },
};

type Fixture = {
  roleShifts: string[];
  economy: string;
  roles: Omit<SpotlightRole, "slug">[];
  gap: Gap;
  plan: z.infer<typeof PlanOut>;
};

export const FIXTURES: Record<string, Fixture> = {
  aoife: {
    roleShifts: [
      "Writing boilerplate code is increasingly AI-assisted. The value is moving to judgement: system design, review and knowing what to build.",
      "Teams want developers who can sit with customers, scope a problem, and ship a working AI integration in their environment.",
      "Evaluating LLM output (tests, evals, guardrails) is becoming a core engineering skill, not a niche.",
    ],
    economy:
      "Irish tech hiring is selective rather than frozen. Multinationals are trimming generalist roles while hiring for AI deployment, solutions and security. Mid-level developers who can show client-facing AI delivery stand out.",
    roles: [
      { title: "Forward Deployed Engineer", summary: "An engineer embedded with customers who turns a product into a working solution inside their systems: integrating, configuring, debugging and demoing.", why: "AI companies now win deals on deployment, not features. Every enterprise rollout needs engineers who can code and talk to the customer.", dayInLife: "Morning discovery call with a bank's ops team, afternoon wiring an LLM agent into their ticketing API, end of day a demo to their head of support.", momentum: "rising", matchPct: 84 },
      { title: "AI Solutions Engineer", summary: "A pre-sales and post-sales technical expert who designs AI solutions for clients and proves them with prototypes.", why: "Buyers need help separating AI hype from value; solutions engineers bridge that gap.", dayInLife: "Scoping a retrieval-augmented assistant, building a quick prototype, and presenting the architecture.", momentum: "rising", matchPct: 72 },
      { title: "LLM Application Engineer", summary: "Builds production features on top of language models: prompts, retrieval, tool use, evaluation and monitoring.", why: "Most companies are moving from AI pilots to production and need engineers who can make LLM features reliable.", dayInLife: "Improving an eval suite, tuning retrieval, shipping a guarded tool-calling feature.", momentum: "rising", matchPct: 81 },
      { title: "Platform Engineer (AI infrastructure)", summary: "Keeps model-serving, data pipelines and developer tooling fast, safe and cheap.", why: "Inference cost and reliability are now board-level topics.", dayInLife: "Rolling out a model gateway, adding cost dashboards, hardening deployments.", momentum: "steady", matchPct: 64 },
    ],
    gap: {
      have: ["Shipping production TypeScript & Node APIs", "Payments domain knowledge (regulated environments)", "Debugging under pressure from support work", "AWS & Postgres", "Daily AI-assisted coding"],
      partial: ["Client communication (support experience counts)", "Solution architecture write-ups", "Integrating LLM APIs"],
      build: ["Customer discovery & scoping", "Live technical demos", "LLM evaluation & guardrails", "Deploying in customer environments (VPCs, SSO)"],
      weeksEstimate: 20,
      encouragement: "You're closer than you think. Support plus fintech engineering is the exact mix forward-deployed teams look for. The gap is mostly about practising in front of customers.",
    },
    plan: {
      phases: [
        { name: "Foundations", goal: "Get fluent with LLM integration patterns", share: 0.25, tasks: [
          { title: "Complete Anthropic prompt engineering course (chapters 1-4)", minutes: 120, resourceId: "anthropic-courses" },
          { title: "DeepLearning.AI short course: functions, tools & agents", minutes: 90, resourceId: "dlai-short" },
          { title: "Write a one-page note: 3 LLM failure modes you've seen", minutes: 45 },
        ] },
        { name: "Applied project", goal: "Build and deploy a customer-style AI integration", share: 0.35, tasks: [
          { title: "Build a support-ticket triage agent with tool calling", minutes: 180, resourceId: "hf-agents" },
          { title: "Add an eval set of 30 real-looking tickets", minutes: 120 },
          { title: "Deploy it on DigitalOcean App Platform", minutes: 90, resourceId: "do-gradient" },
        ] },
        { name: "Customer skills", goal: "Practise discovery and demos", share: 0.2, tasks: [
          { title: "Read The Mom Test and write 10 discovery questions", minutes: 120, resourceId: "mom-test" },
          { title: "Run a mock discovery call with a friend or colleague", minutes: 60 },
          { title: "Record a 5-minute demo of your project", minutes: 60, resourceId: "toastmasters" },
        ] },
        { name: "Visibility & applications", goal: "Get in front of FDE hiring managers", share: 0.2, tasks: [
          { title: "Publish a LinkedIn post about your project", minutes: 45 },
          { title: "Apply to 3 forward-deployed roles posted in the last 48h", minutes: 90 },
          { title: "Attend one AI meetup in Dublin", minutes: 120 },
        ] },
      ],
      project: { title: "Ticket triage agent for a fintech support team", brief: "An LLM agent that reads support tickets, looks up account state through mock APIs, drafts a reply and routes urgent cases. Ship it with an eval suite and a short demo video. This is exactly what an FDE does in week one with a customer." },
      resourceIds: ["anthropic-courses", "dlai-short", "hf-agents", "do-gradient", "aws-saa", "mom-test", "toastmasters", "springboard"],
    },
  },
  oksana: {
    roleShifts: [
      "Рутинне введення даних і звірки дедалі більше автоматизує ШІ. Цінність переходить до аналізу, контролю якості та пояснення цифр.",
      "Фінансові команди шукають людей, які поєднують знання бухобліку з Power BI, Excel Copilot та автоматизацією звітів.",
      "Знання МСФЗ і досвід роботи з кількома системами: це сильна перевага під час впровадження ШІ-інструментів.",
    ],
    economy:
      "В Ірландії стабільний попит на фінансових аналітиків і спеціалістів зі звітності, особливо в Корку та Дубліні. Роботодавці цінують досвід + цифрові навички більше, ніж ідеальну англійську.",
    roles: [
      { title: "AI-enabled Finance Analyst", summary: "Фінансовий аналітик, який використовує ШІ-інструменти для звітності, прогнозів і пояснення відхилень.", why: "Компанії автоматизують рутину, але потребують людей, які розуміють цифри й можуть перевірити ШІ.", dayInLife: "Зранку автоматичний звіт у Power BI, вдень аналіз відхилень бюджету, ввечері коротка презентація для менеджера.", momentum: "rising", matchPct: 86 },
      { title: "Finance Automation Specialist", summary: "Налаштовує автоматизацію бухгалтерських процесів: звірки, рахунки, закриття місяця.", why: "Закриття місяця за 3 дні замість 10: пріоритет для багатьох фінансових відділів.", dayInLife: "Опис процесу, налаштування автоматизації, перевірка результатів з командою.", momentum: "rising", matchPct: 74 },
      { title: "Financial Reporting Accountant (IFRS)", summary: "Готує звітність за МСФЗ для міжнародних компаній з офісами в Ірландії.", why: "Багато міжнародних компаній в Ірландії потребують МСФЗ-експертизи.", dayInLife: "Консолідація, примітки до звітності, робота з аудиторами.", momentum: "steady", matchPct: 79 },
    ],
    gap: {
      have: ["9 років бухобліку", "МСФЗ", "Excel на високому рівні", "Робота з кількома обліковими системами", "Точність і контроль якості"],
      partial: ["Англійська для презентацій", "Ірландські податкові правила"],
      build: ["Power BI", "Excel Copilot та ШІ-асистенти", "Базовий SQL", "Портфоліо з 1-2 звітів"],
      weeksEstimate: 18,
      encouragement: "Ваш досвід: це фундамент. Бракує лише кількох цифрових інструментів, і більшість із них можна вивчити безкоштовно або за державні кошти.",
    },
    plan: {
      phases: [
        { name: "Основи", goal: "Зрозуміти ШІ для фінансів", share: 0.25, tasks: [
          { title: "Elements of AI українською, модулі 1-3", minutes: 120, resourceId: "elements-of-ai" },
          { title: "Зареєструватися в Skillnet Ireland / Springboard+", minutes: 45, resourceId: "springboard" },
        ] },
        { name: "Інструменти", goal: "Power BI та SQL", share: 0.4, tasks: [
          { title: "Kaggle Learn: курс SQL", minutes: 120, resourceId: "kaggle-learn" },
          { title: "Microsoft Learn: шлях PL-300, модулі 1-4", minutes: 180, resourceId: "pl-300" },
          { title: "Побудувати дашборд витрат у Power BI", minutes: 150 },
        ] },
        { name: "Видимість і заявки", goal: "Показати результат роботодавцям", share: 0.35, tasks: [
          { title: "Допис у LinkedIn про ваш дашборд", minutes: 45 },
          { title: "Подати 3 заявки на вакансії за останні 48 год", minutes: 90, resourceId: "jobsireland" },
          { title: "Відвідати зустріч фінансистів або ШІ-мітап у Корку", minutes: 120 },
        ] },
      ],
      project: { title: "Дашборд витрат малого бізнесу", brief: "Дашборд у Power BI на відкритих даних: витрати за категоріями, прогноз на 3 місяці, пояснення відхилень за допомогою ШІ. Покажіть його на співбесіді." },
      resourceIds: ["elements-of-ai", "springboard", "skillnet", "kaggle-learn", "pl-300", "google-data", "jobsireland"],
    },
  },
};

/** Locale and target role each demo fixture was written for. Other combinations run live. */
export const FIXTURE_META: Record<string, { locale: string; role: string }> = {
  aoife: { locale: "en", role: "Forward Deployed Engineer" },
  oksana: { locale: "uk", role: "AI-enabled Finance Analyst" },
};
