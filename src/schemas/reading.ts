import { z } from "zod";
import { chartRequestSchema } from "./chart";
export const readingRequestSchema = z.object({
  chart: chartRequestSchema,
  preset: z.literal("english-internal-v1"),
});
export const chapterSchema = z.object({
  id: z.enum(["sun", "rulers"]),
  title: z.string().min(3).max(100),
  paragraphs: z
    .array(
      z.object({
        text: z.string().min(40).max(1400),
        assertions: z
          .array(z.object({ factId: z.string(), property: z.string(), value: z.string().max(200) }))
          .min(1)
          .max(12),
        factIds: z.array(z.string()).min(1).max(12),
        referenceIds: z.array(z.string()).min(1).max(8),
      }),
    )
    .min(2)
    .max(5),
  reflections: z.array(z.string().min(15).max(240)).min(2).max(3),
});
export const editionSchema = z.object({
  introduction: z.string().min(40).max(700),
  chapters: z.array(chapterSchema).length(2),
  conclusion: z.string().min(40).max(700),
});
export const stageSchema = z.object({
  stage: z.enum(["sun", "rulers", "editor"]),
  durationMs: z.number(),
  inputTokens: z.number().nullable(),
  outputTokens: z.number().nullable(),
  costUsd: z.number().nullable(),
  success: z.boolean(),
});
export const readingResponseSchema = z.object({
  edition: editionSchema,
  fingerprint: z.string(),
  model: z.string(),
  versions: z.object({
    prompts: z.string(),
    voice: z.string(),
    references: z.string(),
    schema: z.string(),
  }),
  stages: z.array(stageSchema),
  durationMs: z.number(),
  costUsd: z.number().nullable(),
  drafts: z.array(chapterSchema).optional(),
});
export type Reading = z.infer<typeof readingResponseSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
