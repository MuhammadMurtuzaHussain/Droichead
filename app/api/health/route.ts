import { hasModel, MODEL } from "@/lib/llm";

export function GET() {
  return Response.json({ ok: true, model: hasModel() ? MODEL : null });
}
