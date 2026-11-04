import { estimateCost } from "../src/server/reading/pricing";
import { readingConfigured } from "../src/server/reading/config";
import { describe, it, expect, vi } from "vitest";
import { calculateChart } from "../src/server/chart";
import { DEFAULT_SETTINGS, type ChartRequest } from "../src/schemas/chart";
import { deriveFacts, ruler, fingerprint } from "../src/server/reading/facts";
import { runReading, validateEvidence } from "../src/server/reading/pipeline";
import { chapterSchema, type Chapter } from "../src/schemas/reading";
const input: ChartRequest = {
  locationId: 1,
  date: "1994-09-18",
  time: "14:30",
  timeChoice: "reject",
  settings: DEFAULT_SETTINGS,
};
const place = {
  id: 1,
  name: "New York",
  region: "NY",
  country: "US",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
};
const facts = deriveFacts(calculateChart(input, place));
const chapter = (id: "sun" | "rulers"): Chapter => ({
  id,
  title: "Synthetic test chapter",
  paragraphs: [1, 2].map(() => ({
    text: "This is synthetic prose used only to verify the reading pipeline wiring.",
    assertions: [{ factId: "placement:sun", property: "planet", value: JSON.stringify("sun") }],
    factIds: ["placement:sun"],
    referenceIds: ["sun"],
  })),
  reflections: ["What possibilities do you notice?", "Where might you explore this theme?"],
});
describe("reading deterministic contracts and mocked pipeline (not writing quality)", () => {
  it("maps traditional/modern rulers including coincident cases", () => {
    expect(ruler(220, false)).toBe("mars");
    expect(ruler(220, true)).toBe("pluto");
    expect(ruler(310, false)).toBe("saturn");
    expect(ruler(310, true)).toBe("uranus");
    expect(ruler(340, false)).toBe("jupiter");
    expect(ruler(340, true)).toBe("neptune");
    expect(ruler(40, false)).toBe(ruler(190, true));
  });
  it("derives neutral cases without identity/birth inputs and distinguishes houses", () => {
    for (const date of ["1994-09-18", "2000-02-12", "1988-07-04", "1999-11-22", "2001-04-20"]) {
      const chart = calculateChart({ ...input, date }, place),
        bundle = deriveFacts(chart);
      expect(JSON.stringify(bundle)).not.toContain(date);
      for (const fact of bundle)
        if ("planet" in fact) {
          expect(fact.occupiedHouse).toBe(chart.points.find((p) => p.id === fact.planet)?.house);
          expect(fact.ruledHouses).toEqual(
            chart.cusps.flatMap((c, i) => (ruler(c, false) === fact.planet ? [i + 1] : [])),
          );
        }
    }
    expect(
      facts
        .filter((f) => f.id.startsWith("aspect:"))
        .every(
          (f) =>
            !("a" in f) ||
            (!["lilith", "chiron", "northNode", "southNode", "fortune", "midheaven"].includes(
              f.a,
            ) &&
              !["lilith", "chiron", "northNode", "southNode", "fortune", "midheaven"].includes(
                f.b,
              )),
        ),
    ).toBe(true);
    expect(fingerprint(input)).not.toBe(fingerprint({ ...input, time: "14:31" }));
  });
  it("rejects malformed chapters and unsupported evidence", () => {
    expect(chapterSchema.safeParse({ id: "sun" }).success).toBe(false);
    const c = chapter("sun");
    c.paragraphs[0].factIds = ["invented"];
    expect(() => validateEvidence([c], facts)).toThrow();
  });
  it("rejects an incorrect occupied-versus-ruled relationship", () => {
    const c = chapter("sun");
    c.paragraphs[0].assertions = [
      { factId: "placement:sun", property: "occupiedHouse", value: "99" },
    ];
    expect(() => validateEvidence([c], facts)).toThrow("Invalid fact relationship");
  });
  it("runs exactly two drafts then editor with retries disabled", async () => {
    const call = vi.fn().mockImplementation(async (options) => {
      expect(options.maxRetries).toBe(0);
      const prompt = JSON.parse(options.prompt);
      const id = prompt.instruction.startsWith("Sun") ? "sun" : "rulers";
      return {
        output: prompt.drafts
          ? {
              introduction: "A synthetic introduction for deterministic pipeline testing.",
              chapters: prompt.drafts,
              conclusion: "A synthetic conclusion for deterministic pipeline testing.",
            }
          : chapter(id),
        usage: { inputTokens: 10, outputTokens: 20 },
      };
    });
    const output = await runReading(
      facts,
      "test",
      new AbortController().signal,
      "test/model",
      call as unknown as Parameters<typeof runReading>[4],
    );
    expect(call).toHaveBeenCalledTimes(3);
    expect(call.mock.calls[0][0].providerOptions).toEqual({
      openai: { store: false, reasoningEffort: "none" },
    });
    expect(output.stages).toHaveLength(3);
    expect(output.costUsd).toBeNull();
  });
  it("propagates cancellation without an editorial call", async () => {
    const controller = new AbortController();
    controller.abort();
    const call = vi.fn().mockImplementation(async (options) => {
      options.abortSignal.throwIfAborted();
    });
    await expect(
      runReading(
        facts,
        "test",
        controller.signal,
        "test/model",
        call as unknown as Parameters<typeof runReading>[4],
      ),
    ).rejects.toThrow("Reading generation failed");
    expect(call).toHaveBeenCalledTimes(2);
  });
  it("fails without editing after provider failure", async () => {
    const call = vi.fn().mockRejectedValue(new Error("private provider diagnostics"));
    await expect(
      runReading(
        facts,
        "test",
        new AbortController().signal,
        "test/model",
        call as unknown as Parameters<typeof runReading>[4],
      ),
    ).rejects.toThrow("Reading generation failed");
    expect(call).toHaveBeenCalledTimes(2);
  });
});

describe("reading credential gates", () => {
  const flags = {
    READING_ENABLED: "true",
    READING_MODEL: "gpt-6.1-terra",
    READING_SAFEGUARDS_CONFIRMED: "true",
  };
  it("requires the credited organization's OpenAI key; OIDC cannot fund direct requests", () => {
    expect(readingConfigured({ ...flags, OPENAI_API_KEY: "synthetic-test-token" })).toBe(true);
    expect(readingConfigured(flags)).toBe(false);
    expect(readingConfigured({ ...flags, VERCEL_OIDC_TOKEN: "synthetic-test-token" })).toBe(false);
    expect(
      readingConfigured({
        ...flags,
        OPENAI_API_KEY: "synthetic-test-token",
        READING_ENABLED: "false",
      }),
    ).toBe(false);
  });
});

it("estimates known standard prices before grants without treating unknowns as zero", () => {
  expect(estimateCost("gpt-6.1-terra", 1000000, 1000000)).toBe(6);
  expect(estimateCost("gpt-6.1-terra", 1000000, 0, 1000000)).toBe(0.05);
  expect(estimateCost("unknown", 100, 100)).toBeNull();
});
