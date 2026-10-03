// Fails if any locale is missing a key from en.json or contains em/en dashes.
import fs from "node:fs";
const dir = new URL("../messages/", import.meta.url);
const en = JSON.parse(fs.readFileSync(new URL("en.json", dir)));
let bad = 0;
for (const f of fs.readdirSync(dir)) {
  const m = JSON.parse(fs.readFileSync(new URL(f, dir)));
  const missing = Object.keys(en).filter((k) => !(k in m));
  const extra = Object.keys(m).filter((k) => !(k in en));
  const dashes = Object.entries(m).filter(([, v]) => /[–—]/.test(v)).map(([k]) => k);
  if (missing.length || extra.length || dashes.length) {
    bad++;
    console.log(f, { missing, extra, dashes });
  }
}
console.log(bad ? "i18n check failed" : "i18n ok");
process.exit(bad ? 1 : 0);
