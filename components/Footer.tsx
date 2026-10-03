"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { exportAll, importAll, wipeAll } from "@/lib/db";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);

  async function doExport() {
    const blob = new Blob([JSON.stringify(await exportAll(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "droichead-my-data.json";
    a.click();
  }

  async function doImport(f: File) {
    try {
      await importAll(JSON.parse(await f.text()));
      router.push("/pulse");
    } catch {
      alert(t("err.generic"));
    }
  }

  async function doWipe() {
    if (!confirm(t("f.wipe.confirm"))) return;
    await wipeAll();
    router.push("/");
  }

  return (
    <footer className="border-t border-line mt-10">
      <div className="wave" aria-hidden="true" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-4 sm:items-center text-sm text-muted">
        <p className="flex-1">
          🔒 {t("f.private")}
          <br />
          <span className="text-xs">{t("f.disclaimer")}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost text-xs py-1.5 px-3" onClick={doExport}>
            {t("f.export")}
          </button>
          <button className="btn btn-ghost text-xs py-1.5 px-3" onClick={() => file.current?.click()}>
            {t("f.import")}
          </button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
          <button className="btn btn-ghost text-xs py-1.5 px-3 text-warm" onClick={doWipe}>
            {t("f.wipe")}
          </button>
        </div>
      </div>
    </footer>
  );
}
