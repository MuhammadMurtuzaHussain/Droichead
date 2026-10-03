import { z } from "zod";
import { LOCALES } from "./types";

const str = z.string().trim();

export const ProfileIn = z.object({
  name: str.max(60).optional(),
  role: str.min(1).max(120),
  industry: str.max(40),
  level: z.enum(["junior", "mid", "senior", "lead"]),
  history: str.max(4000).default(""),
  skills: z.array(str.max(60)).max(12).default([]),
  aiFeeling: z.number().int().min(1).max(4).default(3),
  hoursPerWeek: z.number().min(1).max(40).default(5),
  country: str.max(60).default("Ireland"),
  city: str.max(60).default("Dublin"),
  workMode: z.enum(["remote", "hybrid", "onsite", "any"]).default("any"),
  demo: str.optional(),
});
export type ProfileInput = z.infer<typeof ProfileIn>;

export const LocaleIn = z.enum(LOCALES).default("en");

export const RoleIn = z.object({
  slug: str.max(80),
  title: str.max(120),
  summary: str.max(1000).default(""),
});

// ---- model outputs ----

export const NewsOut = z.object({
  news: z
    .array(z.object({ i: z.coerce.number().int(), title: str, soWhat: str }))
    .max(8),
  roleShifts: z.array(str).min(1).max(5),
  economy: str,
});

export const RolesOut = z.object({
  roles: z
    .array(
      z.object({
        title: str,
        summary: str,
        why: str,
        dayInLife: str,
        momentum: z.enum(["rising", "steady"]).catch("rising"),
        matchPct: z.coerce.number().min(0).max(100),
      }),
    )
    .min(2)
    .max(6),
});

export const GapOut = z.object({
  have: z.array(str).max(8),
  partial: z.array(str).max(8),
  build: z.array(str).max(8),
  weeksEstimate: z.coerce.number().min(2).max(104),
  encouragement: str,
});

export const PlanOut = z.object({
  phases: z
    .array(
      z.object({
        name: str,
        goal: str,
        share: z.coerce.number().min(0.05).max(1).catch(0.25),
        tasks: z
          .array(z.object({ title: str, minutes: z.coerce.number().min(10).max(600).catch(60), resourceId: str.nullish() }))
          .min(1)
          .max(8),
      }),
    )
    .min(2)
    .max(5),
  project: z.object({ title: str, brief: str }),
  resourceIds: z.array(str).max(10),
});

export const PostsOut = z.object({
  posts: z.array(z.object({ milestone: str, text: str })).min(1).max(4),
});
