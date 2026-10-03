"use client";

import type { Profile } from "./types";

export async function postJSON<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

/** Strip local-only fields before sending a profile to the stateless API. */
export function profileForApi(p: Profile) {
  const { id: _id, updatedAt: _u, ...rest } = p;
  return rest;
}

export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
