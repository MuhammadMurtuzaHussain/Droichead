"use client";

import { useEffect, useRef, useState } from "react";
import { Microphone, SpeakerHigh, Stop } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

// BCP-47 tags for speech in each supported language.
const SPEECH_LANG: Record<Locale, string> = { en: "en-IE", ga: "ga-IE", pl: "pl-PL", uk: "uk-UA", es: "es-ES", de: "de-DE", fr: "fr-FR" };

function pickVoice(lang: string) {
  const voices = speechSynthesis.getVoices();
  const base = lang.slice(0, 2);
  return voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(base)) ?? null;
}

/** Reads text aloud in the UI language using the browser's built-in voices. */
export function ListenButton({ text, className = "" }: { text: string; className?: string }) {
  const { t, locale } = useI18n();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    };
  }, []);
  if (!supported) return null;

  function toggle() {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_LANG[locale];
    const v = pickVoice(u.lang);
    if (v) u.voice = v;
    u.rate = 0.95;
    u.onend = u.onerror = () => setSpeaking(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    setSpeaking(true);
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={speaking} className={`btn btn-quiet !py-2 !px-3.5 text-sm ${className}`}>
      {speaking ? <Stop size={16} weight="fill" /> : <SpeakerHigh size={16} />} {speaking ? t("a11y.stop") : t("a11y.listen")}
    </button>
  );
}

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};

/** Dictation into a field via the Web Speech API, where the browser supports it. */
export function MicButton({ onText, className = "" }: { onText: (text: string) => void; className?: string }) {
  const { t, locale } = useI18n();
  const [listening, setListening] = useState(false);
  const [Ctor, setCtor] = useState<(new () => Recognition) | null>(null);
  const rec = useRef<Recognition | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    setCtor(() => w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null);
    return () => rec.current?.stop();
  }, []);
  if (!Ctor) return null;

  function toggle() {
    if (listening) {
      rec.current?.stop();
      return;
    }
    const r = new Ctor!();
    r.lang = SPEECH_LANG[locale];
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      const text = Array.from(e.results)
        .map((res) => res[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (text) onText(text);
    };
    r.onend = r.onerror = () => setListening(false);
    rec.current = r;
    r.start();
    setListening(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={listening}
      aria-label={listening ? t("a11y.listening") : t("a11y.speak")}
      className={`btn !py-2 !px-3.5 text-sm ${listening ? "btn-primary" : "btn-quiet"} ${className}`}
    >
      <Microphone size={16} weight={listening ? "fill" : "regular"} className={listening ? "animate-pulse" : ""} /> {listening ? t("a11y.listening") : t("a11y.speak")}
    </button>
  );
}
