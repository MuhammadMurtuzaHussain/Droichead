"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { IconContext } from "@phosphor-icons/react";
import { I18nProvider } from "@/lib/i18n";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 140, damping: 22 }}>
        <IconContext.Provider value={{ size: 20, weight: "regular" }}>{children}</IconContext.Provider>
      </MotionConfig>
    </I18nProvider>
  );
}
