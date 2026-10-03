import { hasModel, providerInfo, warmUp } from "@/lib/llm";

export function GET() {
  return Response.json({ ok: true, ai: hasModel() ? providerInfo() : null });
}

/** Fire-and-forget warm-up so the local model is in memory before the first real call. */
export async function POST() {
  try {
    await warmUp();
    return Response.json({ warm: true });
  } catch {
    return Response.json({ warm: false });
  }
}
