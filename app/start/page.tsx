"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Bank,
  Buildings,
  Check,
  Factory,
  ForkKnife,
  GraduationCap,
  Heartbeat,
  Laptop,
  Leaf,
  Mountains,
  PaintBrush,
  Plant,
  Plus,
  Smiley,
  SmileyMeh,
  SmileyNervous,
  SmileyWink,
  Storefront,
  Tree,
  Truck,
  type Icon,
} from "@phosphor-icons/react";
import { db } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import type { Level, Profile, WorkMode } from "@/lib/types";

const INDUSTRIES: [string, Icon][] = [
  ["tech", Laptop],
  ["finance", Bank],
  ["health", Heartbeat],
  ["retail", Storefront],
  ["public", Buildings],
  ["creative", PaintBrush],
  ["education", GraduationCap],
  ["manufacturing", Factory],
  ["hospitality", ForkKnife],
  ["logistics", Truck],
];
const LEVELS: [Level, Icon][] = [
  ["junior", Plant],
  ["mid", Leaf],
  ["senior", Tree],
  ["lead", Mountains],
];
const FEELINGS: Icon[] = [SmileyNervous, SmileyMeh, Smiley, SmileyWink];
const SKILLS = ["problem", "coding", "data", "clients", "writing", "teaching", "design", "projects", "sales", "research", "leading", "numbers"];
const ROLE_SUGGESTIONS = ["Software Developer", "Accountant", "Customer Support", "Marketing Executive", "Nurse", "Teacher", "Data Analyst", "Project Manager", "Graphic Designer", "Sales Representative"];
const HOURS = [2, 5, 10, 15];
const MODES: WorkMode[] = ["remote", "hybrid", "onsite", "any"];

type Draft = Omit<Profile, "id" | "updatedAt">;
const EMPTY: Draft = { name: "", role: "", industry: "", level: "mid", history: "", skills: [], aiFeeling: 3, hoursPerWeek: 5, country: "Ireland", city: "Dublin", workMode: "any" };

const ease = [0.16, 1, 0.3, 1] as const;

function Tick({ on }: { on: boolean }) {
  return (
    <span className={`ml-auto grid place-items-center size-5 rounded-full border transition-colors ${on ? "bg-brand border-brand text-on-brand" : "border-line"}`} aria-hidden>
      {on && <Check size={12} weight="bold" />}
    </span>
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
  const pickThenNext = (fn: () => void) => {
    fn();
    setTimeout(next, 260);
  };

  const bigInput = "w-full bg-transparent text-3xl sm:text-4xl font-semibold tracking-tight outline-none border-b-2 border-line focus:border-brand pb-3 placeholder:text-muted/50";

  const cards: { key: string; title: string; sub?: string; body: ReactNode; required?: boolean }[] = [
    {
      key: "name",
      title: t("s.name"),
      sub: t("s.name.sub"),
      body: <input autoFocus aria-label={t("s.name")} className={bigInput} placeholder={t("s.name.ph")} value={d.name} onChange={(e) => set("name", e.target.value)} onKeyDown={(e) => e.key === "Enter" && next()} />,
    },
    {
      key: "role",
      title: t("s.role"),
      sub: t("s.role.sub"),
      required: true,
      body: (
        <div className="space-y-6">
          <input autoFocus aria-label={t("s.role")} className={bigInput} placeholder={t("s.role.ph")} value={d.role} onChange={(e) => set("role", e.target.value)} onKeyDown={(e) => e.key === "Enter" && d.role && next()} />
          <div className="flex flex-wrap gap-2">
            {ROLE_SUGGESTIONS.map((r) => (
              <button key={r} className="option rounded-full px-3.5 py-2 text-sm" aria-pressed={d.role === r} onClick={() => set("role", r)}>
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
      body: (
        <div className="grid grid-cols-2 gap-2">
          {INDUSTRIES.map(([key, I]) => (
            <button key={key} className="option rounded-[14px] px-4 py-3.5 text-left" aria-pressed={d.industry === key} onClick={() => pickThenNext(() => set("industry", key))}>
              <I size={22} className="text-brand shrink-0" />
              <span>{t(`ind.${key}`)}</span>
              <Tick on={d.industry === key} />
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "level",
      title: t("s.level"),
      body: (
        <div className="grid grid-cols-2 gap-2">
          {LEVELS.map(([l, I]) => (
            <button key={l} className="option rounded-[14px] p-4 flex-col !items-start text-left" aria-pressed={d.level === l} onClick={() => pickThenNext(() => set("level", l))}>
              <div className="flex w-full items-center">
                <I size={26} className="text-brand" />
                <Tick on={d.level === l} />
              </div>
              <span className="font-semibold">{t(`lvl.${l}`)}</span>
              <span className="text-sm text-muted -mt-1.5">{t(`lvl.${l}.d`)}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "history",
      title: t("s.history"),
      sub: t("s.history.sub"),
      body: <textarea aria-label={t("s.history")} className="field min-h-44 text-base leading-relaxed" placeholder={t("s.history.ph")} value={d.history} onChange={(e) => set("history", e.target.value)} />,
    },
    {
      key: "skills",
      title: t("s.skills"),
      sub: t("s.skills.sub"),
      body: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[...SKILLS.map((s) => t(`sk.${s}`)), ...d.skills.filter((s) => !SKILLS.some((k) => t(`sk.${k}`) === s))].map((s) => (
              <button key={s} className="option rounded-full px-3.5 py-2 text-sm" aria-pressed={d.skills.includes(s)} onClick={() => toggleSkill(s)}>
                {d.skills.includes(s) && <Check size={14} weight="bold" className="text-brand" />}
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (customSkill.trim()) {
                toggleSkill(customSkill.trim());
                setCustomSkill("");
              }
            }}
          >
            <label className="sr-only" htmlFor="custom-skill">
              {t("s.skills.add")}
            </label>
            <input id="custom-skill" className="field" placeholder={t("s.skills.add")} value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} />
            <button className="btn btn-quiet !px-4" aria-label={t("s.skills.add")}>
              <Plus size={18} />
            </button>
          </form>
        </div>
      ),
    },
    {
      key: "ai",
      title: t("s.ai"),
      body: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FEELINGS.map((I, i) => (
            <button key={i} className="option rounded-[14px] flex-col py-5" aria-pressed={d.aiFeeling === i + 1} onClick={() => pickThenNext(() => set("aiFeeling", (i + 1) as Draft["aiFeeling"]))}>
              <I size={34} weight={d.aiFeeling === i + 1 ? "fill" : "regular"} className="text-brand" />
              <span className="text-sm font-medium">{t(`ai.${i + 1}`)}</span>
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
            <button key={h} className="option rounded-[14px] flex-col py-5" aria-pressed={d.hoursPerWeek === h} onClick={() => pickThenNext(() => set("hoursPerWeek", h))}>
              <span className="font-mono text-3xl font-medium">{h === 15 ? "15+" : h}</span>
              <span className="text-xs text-muted">{t("s.hours.n", { n: "" }).trim()}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "where",
      title: t("s.where"),
      body: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2 block">
              <span className="text-sm font-medium">{t("s.country")}</span>
              <input className="field" value={d.country} onChange={(e) => set("country", e.target.value)} />
            </label>
            <label className="space-y-2 block">
              <span className="text-sm font-medium">{t("s.city")}</span>
              <input className="field" value={d.city} onChange={(e) => set("city", e.target.value)} />
            </label>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium mb-2">{t("s.mode")}</legend>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button key={m} className="option rounded-full px-4 py-2 text-sm" aria-pressed={d.workMode === m} onClick={() => set("workMode", m)}>
                  {t(`mode.${m}`)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      ),
    },
  ];

  const total = cards.length;
  const done = step >= total;
  const card = cards[Math.min(step, total - 1)];
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

  const industryIcon = INDUSTRIES.find(([k]) => k === d.industry)?.[1];
  const FeelingIcon = FEELINGS[d.aiFeeling - 1];

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 min-h-[80dvh]">
      {/* Segmented progress */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }} aria-hidden>
          {cards.map((c, i) => (
            <div key={c.key} className="h-1 rounded-full bg-line overflow-hidden">
              <motion.div className="h-full bg-brand origin-left" initial={false} animate={{ scaleX: i < step || done ? 1 : i === step ? 0.5 : 0 }} transition={{ duration: 0.4, ease }} />
            </div>
          ))}
        </div>
        <span className="font-mono text-sm text-muted tabular-nums">{t("s.step", { n: Math.min(step + 1, total), total })}</span>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        {done ? (
          <motion.section key="summary" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease }} className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-3">
              <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.05]">{t("s.profile")}</h1>
              <p className="text-muted">{t("s.profile.sub")}</p>
            </div>
            <div className="lg:col-span-7 panel p-6 sm:p-8 space-y-6">
              <div>
                <div className="text-2xl font-semibold">
                  {d.name ? `${d.name}, ` : ""}
                  {d.role || "Professional"}
                </div>
                <div className="text-muted mt-1 flex items-center gap-2">
                  {industryIcon && (() => {
                    const I = industryIcon;
                    return <I size={18} className="text-brand" />;
                  })()}
                  {[d.industry && t(`ind.${d.industry}`), t(`lvl.${d.level}`), `${d.city}, ${d.country}`].filter(Boolean).join(", ")}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <dt className="text-muted">{t("s.hours")}</dt>
                  <dd className="font-mono text-lg">{d.hoursPerWeek}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t("s.ai")}</dt>
                  <dd className="flex items-center gap-1.5 font-medium">
                    <FeelingIcon size={18} className="text-brand" /> {t(`ai.${d.aiFeeling}`)}
                  </dd>
                </div>
              </dl>
              {d.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {d.skills.map((s) => (
                    <span key={s} className="rounded-full bg-brand-soft px-3 py-1 text-sm font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <button className="btn btn-primary" onClick={finish} disabled={!d.role}>
                  {t("s.finish")} <ArrowRight size={18} weight="bold" />
                </button>
                <button
                  className="btn btn-quiet"
                  onClick={() => {
                    setDir(-1);
                    setStep(0);
                  }}
                >
                  {t("s.profile.edit")}
                </button>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key={card.key}
            custom={dir}
            initial={{ opacity: 0, x: dir * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -32 }}
            transition={{ duration: 0.32, ease }}
            className="grid lg:grid-cols-12 gap-8 lg:gap-12"
          >
            <div className="lg:col-span-5 space-y-3">
              <h1 className="text-3xl sm:text-[2.6rem] font-semibold leading-[1.08]">{card.title}</h1>
              {card.sub && <p className="text-muted text-lg max-w-[40ch]">{card.sub}</p>}
            </div>
            <div className="lg:col-span-7">{card.body}</div>
          </motion.section>
        )}
      </AnimatePresence>

      {!done && (
        <div className="mt-12 flex items-center gap-3">
          <button className="btn btn-quiet" onClick={back} disabled={step === 0}>
            <ArrowLeft size={16} /> {t("s.back")}
          </button>
          {!card.required && !isLast && (
            <button className="px-3 text-sm font-medium text-muted hover:text-ink" onClick={next}>
              {t("s.skip")}
            </button>
          )}
          <button className="btn btn-primary ml-auto" onClick={next} disabled={!canNext}>
            {isLast ? t("s.finish") : t("s.next")} <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}
