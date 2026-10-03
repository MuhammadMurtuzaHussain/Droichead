"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { DownloadSimple, GithubLogo, LockSimple, Trash, UploadSimple } from "@phosphor-icons/react";
import { exportAll, importAll, wipeAll } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import { IMAGES } from "@/lib/images";
import { Mark } from "./Header";

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

  const small = "inline-flex items-center gap-1.5 rounded-full border border-line px-3 h-8 text-xs font-medium hover:border-ink/40";

  return (
    <footer className="print:hidden mt-24 border-t border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Mark />
            <span className="font-semibold">Droichead</span>
          </div>
          <p className="text-sm text-muted max-w-[42ch]">{t("brand.tagline")}</p>
          <a href="https://github.com/MuhammadMurtuzaHussain/Droichead" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-brand">
            <GithubLogo size={16} /> {t("f.source")}
          </a>
        </div>
        <div className="md:col-span-7 space-y-4">
          <p className="flex items-start gap-2 text-sm">
            <LockSimple size={18} className="mt-0.5 shrink-0 text-brand" />
            <span>{t("f.private")}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button className={small} onClick={doExport}>
              <DownloadSimple size={14} /> {t("f.export")}
            </button>
            <button className={small} onClick={() => file.current?.click()}>
              <UploadSimple size={14} /> {t("f.import")}
            </button>
            <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
            <button className={`${small} text-peat`} onClick={doWipe}>
              <Trash size={14} /> {t("f.wipe")}
            </button>
          </div>
          <p className="text-xs text-muted">{t("f.disclaimer")}</p>
          <p className="text-xs text-muted">
            {Object.values(IMAGES).map((img, i) => (
              <span key={img.page}>
                {i > 0 && ". "}
                <a href={img.page} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {img.credit}
                </a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
