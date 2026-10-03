// Ireland's Central Statistics Office open data (PxStat, JSON-stat 2.0). No key needed.
// MUM01: seasonally adjusted monthly unemployment.

export interface CsoUnemployment {
  month: string; // e.g. "2026 August"
  rate: number; // 15-74, both sexes, %
  prev: number;
  youth: number; // 15-24, both sexes, %
}

type JsonStat = {
  id: string[];
  size: number[];
  value: (number | null)[];
  dimension: Record<string, { category: { index: Record<string, number> | string[]; label: Record<string, string> } }>;
};

const idx = (cat: JsonStat["dimension"][string]["category"], code: string) => (Array.isArray(cat.index) ? cat.index.indexOf(code) : cat.index[code]);

export async function fetchUnemployment(): Promise<CsoUnemployment | null> {
  try {
    const res = await fetch("https://ws.cso.ie/public/api.restful/PxStat.Data.Cube_API.ReadDataset/MUM01/JSON-stat/2.0/en", {
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 43200 },
    });
    if (!res.ok) return null;
    const d = (await res.json()) as JsonStat;
    const [dStat, dTime, dAge, dSex] = d.id;
    const cat = (k: string) => d.dimension[k].category;
    const times = Object.keys(cat(dTime).label);
    const at = (stat: string, t: number, age: string, sex: string) => {
      const c = [idx(cat(dStat), stat), t, idx(cat(dAge), age), idx(cat(dSex), sex)];
      let flat = 0;
      for (let i = 0; i < c.length; i++) flat = flat * d.size[i] + c[i];
      return d.value[flat];
    };
    // Walk back from the newest month to the latest one with data.
    for (let t = times.length - 1; t > 0; t--) {
      const rate = at("MUM01C02", idx(cat(dTime), times[t]), "316", "-");
      if (rate == null) continue;
      const prev = at("MUM01C02", idx(cat(dTime), times[t - 1]), "316", "-");
      const youth = at("MUM01C02", idx(cat(dTime), times[t]), "310", "-");
      return { month: cat(dTime).label[times[t]], rate, prev: prev ?? rate, youth: youth ?? 0 };
    }
    return null;
  } catch {
    return null;
  }
}
