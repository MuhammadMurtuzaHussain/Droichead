"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { db } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import type { Level, Profile, WorkMode } from "@/lib/types";

const INDUSTRIES = ["tech", "finance", "health", "retail", "public", "creative", "education", "manufacturing", "hospitality", "logistics"];
const IND_ICON: Record<string, string> = { tech: "💻", finance: "💶", health: "🩺", retail: "🛍️", public: "🏛️", creative: "🎨", education: "📚", manufacturing: "🏭", hospitality: "🍽️", logistics: "🚚" };
const LEVELS: Level[] = ["junior", "mid", "senior", "lead"];
const SKILLS = ["problem", "coding", "data", "clients", "writing", "teaching", "design", "projects", "sales", "research", "leading", "numbers"];
const ROLE_SUGGESTIONS = ["Software Developer", "Accountant", "Customer Support", "Marketing Executive", "Nurse", "Teacher", "Data Analyst", "Project Manager", "Graphic Designer", "Sales Representative"];
const HOURS = [2, 5, 10, 15];
const MODES: WorkMode[] = ["remote", "hybrid", "onsite", "any"];
const AI_FACES = ["😟", "😐", "🙂", "🤩"];

type Draft = Omit<Profile, "id" | "updatedAt">;
const EMPTY: Draft = { name: "", role: "", industry: "", level: "mid", history: "", skills: [], aiFeeling: 3, hoursPerWeek: 5, country: "Ireland", city: "Dublin", workMode: "any" };

function Knot({ step, total }: { step: number; total: number }) {
  // Celtic-knot-ish progress: interlocking rings that fill in.
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} width="22" height="14" viewBox="0 0 22 14">
          <ellipse cx="11" cy="7" rx="9" ry="5" fill="none" stroke={i <= step ? "var(--brand)" : "var(--line)"} strokeWidth="2.4" />
          {i <= step && <circle cx="11" cy="7" r="2" fill="var(--accent)" />}
        </svg>
      ))}
    </div>
  );
}

export default function Survey() {
  const { t } = useI18n();
  const router = useRouter();
  const [d, setD] = useState<Draft>(EMPTY);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [customSkill, setCustomSkill] = useState("");

  useEffect(() => {
    db.profile.get("me").then((p) => {
      if (p && !p.demo) {
        const { id: _i, updatedAt: _u, ...rest } = p;
        setD({ ...EMPTY, ...rest });
      }
    });
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const toggleSkill = (s: string) =>
    setD((x) => ({ ...x, skills: x.skills.includes(s) ? x.skills.filter((y) => y !== s) : x.skills.length >= 5 ? x.skills : [...x.skills, s] }));

  const cards: { key: string; title: string; sub?: string; body: ReactNode; required?: boolean; autoNext?: boolean }[] = [
    {
      key: "name",
      title: t("s.name"),
      sub: t("s.name.sub"),
      body: <input autoFocus className="w-full text-2xl font-serif bg-transparent border-b-2 border-line focus:border-brand outline-none py-2" placeholder={t("s.name.ph")} value={d.name} onChange={(e) => set("name", e.target.value)} onKeyDown={(e) => e.key === "Enter" && next()} />,
    },
    {
      key: "role",
      title: t("s.role"),
      sub: t("s.role.sub"),
      required: true,
      body: (
        <div className="space-y-4">
          <input autoFocus className="w-full text-2xl font-serif bg-transparent border-b-2 border-line focus:border-brand outline-none py-2" placeholder={t("s.role.ph")} value={d.role} onChange={(e) => set("role", e.target.value)} onKeyDown={(e) => e.key === "Enter" && d.role && next()} />
          <div className="flex flex-wrap gap-2">
            {ROLE_SUGGESTIONS.map((r) => (
              <button key={r} className="chip" aria-pressed={d.role === r} onClick={() => set("role", r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "industry",
      title: t("s.industry"),
      required: true,
      autoNext: true,
      body: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INDUSTRIES.map((i) => (
            <button key={i} className="chip justify-start py-3 text-base" aria-pressed={d.industry === i} onClick={() => { set("industry", i); setTimeout(next, 220); }}>
              <span aria-hidden>{IND_ICON[i]}</span> {t(`ind.${i}`)}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "level",
      title: t("s.level"),
      body: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LEVELS.map((l, i) => (
            <button key={l} className="chip flex-col items-start py-3 rounded-2xl" aria-pressed={d.level === l} onClick={() => { set("level", l); setTimeout(next, 220); }}>
              <span className="text-lg" aria-hidden>{["🌱", "🌿", "🌳", "🏔️"][i]}</span>
              <span>{t(`lvl.${l}`)}</span>
              <span className="text-xs opacity-75 font-medium">{t(`lvl.${l}.d`)}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "history",
      title: t("s.history"),
      sub: t("s.history.sub"),
      body: <textarea className="w-full min-h-36 card p-4 outline-none focus:border-brand" placeholder={t("s.history.ph")} value={d.history} onChange={(e) => set("history", e.target.value)} />,
    },
    {
      key: "skills",
      title: t("s.skills"),
      sub: t("s.skills.sub"),
      body: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[...SKILLS.map((s) => t(`sk.${s}`)), ...d.skills.filter((s) => !SKILLS.some((k) => t(`sk.${k}`) === s))].map((s) => (
              <button key={s} className="chip" aria-pressed={d.skills.includes(s)} onClick={() => toggleSkill(s)}>
                {s}
              </button>
            ))}
          </div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (customSkill.trim()) { toggleSkill(customSkill.trim()); setCustomSkill(""); } }}>
            <input className="flex-1 card px-4 py-2 outline-none focus:border-brand" placeholder={t("s.skills.add")} value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} />
            <button className="btn btn-ghost">+</button>
          </form>
        </div>
      ),
    },
    {
      key: "ai",
      title: t("s.ai"),
      body: (
        <div className="grid grid-cols-4 gap-2">
          {AI_FACES.map((f, i) => (
            <button key={i} className="chip flex-col py-4 rounded-2xl" aria-pressed={d.aiFeeling === i + 1} onClick={() => { set("aiFeeling", (i + 1) as Draft["aiFeeling"]); setTimeout(next, 220); }}>
              <span className="text-3xl" aria-hidden>{f}</span>
              <span className="text-sm">{t(`ai.${i + 1}`)}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "hours",
      title: t("s.hours"),
      body: (
        <div className="grid grid-cols-4 gap-2">
          {HOURS.map((h) => (
            <button key={h} className="chip justify-center py-4 text-lg rounded-2xl" aria-pressed={d.hoursPerWeek === h} onClick={() => { set("hoursPerWeek", h); setTimeout(next, 220); }}>
              {t("s.hours.n", { n: h === 15 ? "15+" : h })}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "where",
      title: t("s.where"),
      body: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-sm text-muted font-semibold">{t("s.country")}</span>
              <input className="w-full card px-4 py-2.5 outline-none focus:border-brand" value={d.country} onChange={(e) => set("country", e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-muted font-semibold">{t("s.city")}</span>
              <input className="w-full card px-4 py-2.5 outline-none focus:border-brand" value={d.city} onChange={(e) => set("city", e.target.value)} />
            </label>
          </div>
          <div>
            <div className="text-sm text-muted font-semibold mb-2">{t("s.mode")}</div>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button key={m} className="chip" aria-pressed={d.workMode === m} onClick={() => set("workMode", m)}>
                  {t(`mode.${m}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const total = cards.length;
  const card = cards[step];
  const isLast = step === total - 1;
  const canNext = !card.required || Boolean(d[card.key as keyof Draft]);

  function next() {
    setDir(1);
    setStep((s) => Math.min(s + 1, total));
  }
  function back() {
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  }

  async function finish() {
    await db.profile.put({ ...d, role: d.role.trim() || "Professional", industry: d.industry || "tech", id: "me", updatedAt: Date.now() });
    await db.cache.clear();
    router.push("/pulse");
  }

  if (step >= total) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto card p-8 space-y-5 text-center">
        <div className="text-5xl" aria-hidden>🌉</div>
        <h1 className="text-3xl font-bold">{t("s.profile")}</h1>
        <div className="flex flex-wrap justify-center gap-2">
          {d.name && <span className="chip">👋 {d.name}</span>}
          <span className="chip">💼 {d.role || "—"}</span>
          {d.industry && <span className="chip">{IND_ICON[d.industry]} {t(`ind.${d.industry}`)}</span>}
          <span className="chip">{t(`lvl.${d.level}`)}</span>
          <span className="chip">📍 {d.city}, {d.country}</span>
          <span className="chip">⏱ {t("s.hours.n", { n: d.hoursPerWeek })}</span>
          <span className="chip">{AI_FACES[d.aiFeeling - 1]} {t(`ai.${d.aiFeeling}`)}</span>
          {d.skills.map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button className="btn btn-ghost" onClick={() => { setDir(-1); setStep(0); }}>
            {t("s.profile.edit")}
          </button>
          <button className="btn btn-primary" onClick={finish} disabled={!d.role}>
            {t("s.finish")} →
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Knot step={step} total={total} />
        <span className="text-sm text-muted font-semibold">{t("s.step", { n: step + 1, total })}</span>
      </div>
      <div className="relative min-h-[380px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.section
            key={card.key}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40, rotate: dir * 1.5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: dir * -40, rotate: dir * -1.5 }}
            transition={{ duration: 0.22 }}
            className="card p-6 sm:p-8 space-y-5 shadow-[0_10px_30px_-15px_rgba(8,72,58,0.35)]"
          >
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{card.title}</h1>
              {card.sub && <p className="text-muted">{card.sub}</p>}
            </div>
            {card.body}
          </motion.section>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost" onClick={back} disabled={step === 0}>
          ← {t("s.back")}
        </button>
        {!card.required && !isLast && (
          <button className="text-muted font-semibold underline underline-offset-4 px-2" onClick={next}>
            {t("s.skip")}
          </button>
        )}
        <button className="btn btn-primary ml-auto" onClick={next} disabled={!canNext}>
          {isLast ? t("s.finish") : t("s.next")} →
        </button>
      </div>
    </div>
  );
}
