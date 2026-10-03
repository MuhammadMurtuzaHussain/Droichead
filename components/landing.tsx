"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, TrendUp } from "@phosphor-icons/react";

export const ease = [0.32, 0.72, 0, 1] as const;

/** Heavy fade-up with blur as an element enters the viewport. */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 48, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Pointer-tracked glow. Writes CSS vars directly, no React re-renders. */
export function Spotlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`spotlight ${className}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}

/** Number that counts up once it scrolls into view. */
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reduce) {
      ref.current.textContent = `${to}${suffix}`;
      return;
    }
    const c = animate(0, to, {
      duration: 1.4,
      ease,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => c.stop();
  }, [inView, to, suffix, reduce]);
  return <span ref={ref}>0{suffix}</span>;
}

/** Cycles through real "from → to" examples produced by Droichead. */
export function RoleMorph({ pairs, fromLabel, toLabel, fitLabel, caption }: { pairs: { from: string; to: string; fit: number }[]; fromLabel: string; toLabel: string; fitLabel: string; caption: string }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((x) => (x + 1) % pairs.length), 3200);
    return () => clearInterval(id);
  }, [pairs.length, reduce]);
  const p = pairs[i];
  const slide = { initial: { y: "110%", opacity: 0 }, animate: { y: "0%", opacity: 1 }, exit: { y: "-110%", opacity: 0 }, transition: { duration: 0.7, ease } };
  return (
    <div className="bezel lift">
      <div className="core p-6 sm:p-7 space-y-5">
        <div className="space-y-1.5">
          <div className="text-xs text-muted">{fromLabel}</div>
          <div className="relative h-8 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={p.from} {...slide} className="absolute inset-0 text-xl font-medium text-ink/80">
                {p.from}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-3" aria-hidden>
          <div className="h-px flex-1 bg-gradient-to-r from-white/5 via-brand/60 to-white/5" />
          <span className="grid place-items-center size-8 rounded-full bg-brand/15 text-brand">
            <ArrowRight size={14} weight="bold" />
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-white/5 via-brand/60 to-white/5" />
        </div>
        <div className="space-y-1.5">
          <div className="text-xs text-muted">{toLabel}</div>
          <div className="relative h-9 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={p.to} {...slide} className="absolute inset-0 text-2xl font-semibold tracking-tight">
                {p.to}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-end justify-between pt-1">
          <div className="flex gap-1.5" aria-hidden>
            {pairs.map((_, j) => (
              <span key={j} className={`h-1 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${j === i ? "w-6 bg-brand" : "w-1.5 bg-white/15"}`} />
            ))}
          </div>
          <div className="text-right">
            <div className="font-mono text-3xl font-medium text-brand tabular-nums">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={p.fit} className="inline-block" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease }}>
                  {p.fit}%
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="text-xs text-muted">{fitLabel}</div>
          </div>
        </div>
        <p className="text-[11px] text-muted/80 flex items-center gap-1.5">
          <TrendUp size={12} /> {caption}
        </p>
      </div>
    </div>
  );
}

/** "Bridge" in each supported language, cycling. */
export function WordCycle({ words }: { words: { word: string; lang: string }[] }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 1800);
    return () => clearInterval(id);
  }, [words.length, reduce]);
  const w = words[i];
  return (
    <div className="relative h-[5.5rem] sm:h-[6.5rem] overflow-hidden" aria-live="off">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={w.word} className="absolute inset-0" initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }} animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }} exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.8, ease }}>
          <div className="text-6xl sm:text-7xl font-semibold tracking-[-0.04em] text-gradient pb-2 leading-[1.1]">{w.word}</div>
          <div className="text-sm text-muted -mt-1">{w.lang}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---- Scroll-driven bridge: Wish, Goal, Strategy, Action ----

const P0 = [40, 300];
const P1 = [500, -60];
const P2 = [960, 300];
const at = (t: number) => [
  (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t ** 2 * P2[0],
  (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t ** 2 * P2[1],
];

function Node({ progress, t, label, desc, final }: { progress: MotionValue<number>; t: number; label: string; desc: string; final: boolean }) {
  const start = 0.08 + t * 0.72;
  const opacity = useTransform(progress, [start - 0.06, start], [0.25, 1]);
  const scale = useTransform(progress, [start - 0.06, start], [0.6, 1]);
  const y = useTransform(progress, [start - 0.06, start], [16, 0]);
  const [x, yy] = at(t);
  return (
    <motion.div className="absolute -translate-x-1/2 flex flex-col items-center text-center w-[22%]" style={{ left: `${(x / 1000) * 100}%`, top: `${(yy / 360) * 100}%`, opacity }}>
      <motion.span className={`block -mt-[9px] size-[18px] rounded-full ring-4 ring-bg ${final ? "bg-brand shadow-[0_0_30px_rgb(82_211_162/0.9)]" : "bg-ink"}`} style={{ scale }} />
      <motion.div style={{ y }} className="mt-4 space-y-1">
        <div className={`text-xl sm:text-3xl font-semibold tracking-tight ${final ? "text-brand" : ""}`}>{label}</div>
        <div className="hidden sm:block text-sm text-muted">{desc}</div>
      </motion.div>
    </motion.div>
  );
}

export function BridgeStory({ title, steps }: { title: string; steps: { label: string; desc: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(1);
  const progress = reduce ? still : scrollYProgress;
  const draw = useTransform(progress, [0.05, 0.85], [0, 1]);
  const deck = useTransform(progress, [0, 0.2], [0, 1]);
  return (
    <section ref={ref} className={reduce ? "" : "relative h-[260vh]"} aria-label={title}>
      <div className={`${reduce ? "py-24" : "sticky top-0 min-h-[100dvh]"} flex flex-col justify-center mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8`}>
        <h2 className="text-3xl sm:text-5xl font-semibold max-w-[20ch] leading-[1.05] mb-16 sm:mb-24">{title}</h2>
        <div className="relative w-full aspect-[1000/360] mb-28 sm:mb-20">
          <svg viewBox="0 0 1000 360" className="absolute inset-x-0 top-0 w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="arc" x1="0" x2="1">
                <stop offset="0" stopColor="#e8f0eb" stopOpacity="0.5" />
                <stop offset="1" stopColor="#52d3a2" />
              </linearGradient>
            </defs>
            <path d="M40 300 Q500 -60 960 300" fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="2" />
            <motion.path d="M40 300 Q500 -60 960 300" fill="none" stroke="url(#arc)" strokeWidth="3" strokeLinecap="round" style={{ pathLength: draw }} />
            <motion.path d="M40 300 H960" stroke="rgb(255 255 255 / 0.14)" strokeWidth="2" style={{ pathLength: deck }} />
            {[0.18, 0.3, 0.42, 0.58, 0.7, 0.82].map((t) => {
              const [x, y] = at(t);
              return <line key={t} x1={x} y1={y} x2={x} y2={300} stroke="rgb(255 255 255 / 0.06)" strokeWidth="1.5" />;
            })}
          </svg>
          {steps.map((s, i) => (
            <Node key={s.label} progress={progress} t={i / (steps.length - 1)} label={s.label} desc={s.desc} final={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Slow parallax drift for the hero photo. */
export function useHeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);
  return { ref, y, fade };
}
