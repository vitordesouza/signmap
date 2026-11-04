import { openai } from "@ai-sdk/openai";
import { estimateCost } from "./pricing";
import { z } from "zod";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { chapterSchema, editionSchema, type Chapter, type Reading } from "../../schemas/reading";
import { references } from "./references";
import voice from "./voice";
import sun from "./sun";
import rulers from "./rulers";
import editor from "./editor";
import type { deriveFacts } from "./facts";
export function validateEvidence(chapters: Chapter[], facts: ReturnType<typeof deriveFacts>) {
  const ids = new Set(facts.map((f) => f.id));
  for (const chapter of chapters)
    for (const p of chapter.paragraphs) {
      for (const assertion of p.assertions) {
        const fact = facts.find((f) => f.id === assertion.factId);
        if (
          !fact ||
          !p.factIds.includes(assertion.factId) ||
          !(assertion.property in fact) ||
          JSON.stringify((fact as unknown as Record<string, unknown>)[assertion.property]) !==
            assertion.value
        )
          throw new Error("Invalid fact relationship");
      }
      if (
        p.factIds.some((id) => !ids.has(id)) ||
        p.referenceIds.some((id) => !Object.hasOwn(references, id))
      )
        throw new Error("Unsupported evidence");
    }
}
export async function runReading(
  facts: ReturnType<typeof deriveFacts>,
  fingerprint: string,
  signal: AbortSignal,
  model: string,
  call = generateText,
): Promise<Reading> {
  const started = Date.now();
  const limit = (name: string, fallback: number, min: number, max: number) => {
    const n = Number(process.env[name]);
    return Number.isFinite(n) && n >= min && n <= max ? Math.floor(n) : fallback;
  };
  const timeoutMs = limit("READING_TIMEOUT_MS", 90000, 1000, 90000);
  const controller = new AbortController();
  const combined = AbortSignal.any([signal, controller.signal, AbortSignal.timeout(timeoutMs)]);
  const stages: Reading["stages"] = [];
  async function stage(id: "sun" | "rulers" | "editor", drafts?: Chapter[]) {
    const start = Date.now();
    try {
      const result = await call({
        model: openai.responses(model),
        system: voice,
        prompt: JSON.stringify({
          instruction: { sun, rulers, editor }[id],
          facts,
          references,
          ...(drafts ? { drafts } : {}),
        }),
        output: Output.object({
          schema: (id === "editor" ? editionSchema : chapterSchema) as z.ZodType<unknown>,
        }),
        maxOutputTokens:
          id === "editor"
            ? limit("READING_EDITOR_TOKENS", 4000, 500, 4000)
            : limit("READING_DRAFT_TOKENS", 2000, 500, 2000),
        providerOptions: { openai: { store: false, reasoningEffort: "none" } },
        maxRetries: 0,
        abortSignal: combined,
      });
      stages.push({
        stage: id,
        durationMs: Date.now() - start,
        inputTokens: result.usage.inputTokens ?? null,
        outputTokens: result.usage.outputTokens ?? null,
        costUsd: estimateCost(
          model,
          result.usage.inputTokens,
          result.usage.outputTokens,
          result.usage.inputTokenDetails?.cacheReadTokens ?? 0,
        ),
        success: true,
      });
      const output = result.output;
      if (id === "editor") {
        const edition = editionSchema.parse(output);
        if (edition.chapters[0].id !== "sun" || edition.chapters[1].id !== "rulers")
          throw new Error("Invalid chapter order");
        validateEvidence(edition.chapters, facts);
        return edition;
      }
      const chapter = chapterSchema.parse(output);
      if (chapter.id !== id) throw new Error("Invalid chapter identity");
      validateEvidence([chapter], facts);
      return chapter;
    } catch (error) {
      const failedUsage = NoObjectGeneratedError.isInstance(error) ? error.usage : undefined;
      const observed = stages.find((s) => s.stage === id);
      if (observed) observed.success = false;
      else
        stages.push({
          stage: id,
          durationMs: Date.now() - start,
          inputTokens: failedUsage?.inputTokens ?? null,
          outputTokens: failedUsage?.outputTokens ?? null,
          costUsd: null,
          success: false,
        });
      controller.abort();
      throw new Error("Reading generation failed");
    }
  }
  try {
    const results = await Promise.allSettled([stage("sun"), stage("rulers")]);
    if (results.some((r) => r.status === "rejected")) throw new Error("Reading generation failed");
    const drafts = results.map((r) => (r as PromiseFulfilledResult<Chapter>).value);
    const edition = editionSchema.parse(await stage("editor", drafts));
    return {
      edition,
      fingerprint,
      model,
      versions: { prompts: "2", voice: "2", references: "1", schema: "1" },
      stages,
      durationMs: Date.now() - started,
      costUsd: stages.every((s) => s.costUsd !== null)
        ? stages.reduce((total, s) => total + s.costUsd!, 0)
        : null,
      ...(process.env.NODE_ENV === "development" ? { drafts } : {}),
    };
  } finally {
    console.info("Mapa reading", { model, version: "2", stages, durationMs: Date.now() - started });
  }
}
