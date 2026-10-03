"use client";

import Dexie, { type EntityTable } from "dexie";
import type { CachedItem, Plan, Profile } from "./types";

class DroicheadDB extends Dexie {
  profile!: EntityTable<Profile, "id">;
  plans!: EntityTable<Plan, "id">;
  cache!: EntityTable<CachedItem, "key">;

  constructor() {
    super("droichead");
    this.version(1).stores({
      profile: "id",
      plans: "id, roleSlug, createdAt",
      cache: "key, fetchedAt",
    });
  }
}

export const db = new DroicheadDB();

const DAY = 24 * 60 * 60 * 1000;

export async function getCached<T>(key: string, maxAge = DAY): Promise<T | undefined> {
  const hit = await db.cache.get(key);
  if (hit && Date.now() - hit.fetchedAt < maxAge) return hit.data as T;
  return undefined;
}

export async function setCached<T>(key: string, data: T) {
  await db.cache.put({ key, data, fetchedAt: Date.now() });
}

export async function exportAll() {
  return {
    app: "droichead",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: await db.profile.get("me"),
    plans: await db.plans.toArray(),
  };
}

export async function importAll(json: { profile?: Profile; plans?: Plan[] }) {
  await db.transaction("rw", db.profile, db.plans, async () => {
    if (json.profile) await db.profile.put({ ...json.profile, id: "me" });
    if (json.plans) await db.plans.bulkPut(json.plans);
  });
}

export async function wipeAll() {
  await db.delete();
  await db.open();
}
