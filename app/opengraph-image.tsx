import { ImageResponse } from "next/og";

export const alt = "Droichead: bridge the gap to the job that's coming";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Quadratic arc used across the brand: the bridge from the job you have to the job that's coming.
const P0 = [740, 560];
const P1 = [950, 330];
const P2 = [1160, 560];
const at = (t: number) => [
  (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t ** 2 * P2[0],
  (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t ** 2 * P2[1],
];

export default function OpengraphImage() {
  const words = ["Droichead", "Bridge", "Most", "Міст", "Puente", "Brücke", "Pont"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "#e8f0eb",
          background: "radial-gradient(70% 80% at 10% 0%, rgba(82,211,162,0.28), transparent 70%), radial-gradient(50% 60% at 100% 0%, rgba(239,198,92,0.12), transparent 70%), #07110e",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          <path d={`M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} fill="none" stroke="#52d3a2" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
          <path d={`M${P0[0] - 20} ${P0[1]} H${P2[0] + 10}`} stroke="#e8f0eb" strokeOpacity="0.16" strokeWidth="3" />
          {[0.15, 0.27, 0.39, 0.5, 0.61, 0.73, 0.85].map((t) => {
            const [x, y] = at(t);
            return <line key={t} x1={x} y1={y} x2={x} y2={560} stroke="#e8f0eb" strokeOpacity="0.1" strokeWidth="2" />;
          })}
          {[0, 1 / 3, 2 / 3, 1].map((t, i) => {
            const [x, y] = at(t);
            return <circle key={t} cx={x} cy={y} r={i === 3 ? 13 : 9} fill={i === 3 ? "#52d3a2" : "#e8f0eb"} />;
          })}
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: "#52d3a2", display: "flex", alignItems: "center", justifyContent: "center", color: "#03110b", fontSize: 30, fontWeight: 700 }}>D</div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>Droichead</div>
          <div style={{ marginLeft: 18, fontSize: 18, color: "#92a49b", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999, padding: "8px 18px", letterSpacing: 3 }}>HACK FOR HUMANITY, DUBLIN</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: -10 }}>
          <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>The work is changing.</div>
          <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: -4, lineHeight: 1, color: "#74e2b8" }}>So can you.</div>
          <div style={{ display: "flex", gap: 16, fontSize: 22, color: "#92a49b", marginTop: 22 }}>
            {words.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 26, color: "#c5d3cc", maxWidth: 600, lineHeight: 1.35 }}>Rising roles, an honest gap analysis and a dated plan to bridge it. Open-weight AI, private by design.</div>
        </div>
      </div>
    ),
    size,
  );
}
