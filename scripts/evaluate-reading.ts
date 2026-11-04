/** Explicitly billable, neutral-only evaluation. Never run as part of check/build. */
import { mkdir, writeFile } from "node:fs/promises";
import { generateText } from "ai";
import { DEFAULT_SETTINGS, type ChartRequest } from "../src/schemas/chart";
import { calculateChart } from "../src/server/chart";
import { deriveFacts, fingerprint } from "../src/server/reading/facts";
import { runReading } from "../src/server/reading/pipeline";
if (
  process.env.READING_LIVE_EVAL !== "true" ||
  !process.env.READING_MODEL ||
  !process.env.OPENAI_API_KEY ||
  process.env.READING_SAFEGUARDS_CONFIRMED !== "true"
)
  throw new Error(
    "Set READING_LIVE_EVAL=true and READING_MODEL only after confirming the credited OpenAI organization and finite provider spending controls.",
  );
const location = {
  id: 5128581,
  name: "New York",
  region: "New York",
  country: "United States",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
};
const cases: { date: string; time: string; modern: boolean }[] = [
  { date: "1994-09-18", time: "14:30", modern: false },
  { date: "2000-02-12", time: "08:00", modern: false },
  { date: "2000-02-12", time: "08:00", modern: true },
  { date: "1999-11-22", time: "12:00", modern: true },
  { date: "2001-04-20", time: "07:00", modern: false },
];
const count = Number(process.env.READING_EVAL_CASES ?? 1);
if (!Number.isInteger(count) || count < 1 || count > 5)
  throw new Error("READING_EVAL_CASES must be 1–5.");
const start = Number(process.env.READING_EVAL_START ?? 1);
if (!Number.isInteger(start) || start < 1 || start + count - 1 > cases.length)
  throw new Error("Evaluation range must stay within cases 1–5.");
await mkdir("output/reading-evaluation", { recursive: true });
for (const [offset, test] of cases.slice(start - 1, start - 1 + count).entries()) {
  const index = offset + start - 1;
  const input: ChartRequest = {
    locationId: location.id,
    date: test.date,
    time: test.time,
    timeChoice: "reject",
    settings: { ...DEFAULT_SETTINGS, rulership: test.modern ? "modern" : "traditional" },
  };
  const chart = calculateChart(input, location),
    facts = deriveFacts(chart);
  const billing: { id: string; costUsd: number | null; provider: string }[] = [];
  const call: typeof generateText = async (options) => {
    const result = await generateText(options);
    billing.push({ id: result.response.id ?? "unknown", costUsd: null, provider: "openai" });
    return result;
  };
  try {
    const reading = await runReading(
      facts,
      fingerprint(input),
      new AbortController().signal,
      process.env.READING_MODEL,
      call,
    );
    const record = {
      case: index + 1,
      input,
      facts,
      reading,
      billing,
      humanReview:
        "pending: accuracy, specificity, tone, repetition/coherence, reflection usefulness",
    };
    await writeFile(
      `output/reading-evaluation/case-${index + 1}.json`,
      JSON.stringify(record, null, 2),
    );
    console.log(
      JSON.stringify({ case: index + 1, success: true, durationMs: reading.durationMs, billing }),
    );
  } catch {
    await writeFile(
      `output/reading-evaluation/case-${index + 1}-failure.json`,
      JSON.stringify({ case: index + 1, billing }),
    );
    console.error(JSON.stringify({ case: index + 1, success: false, billing }));
    process.exitCode = 1;
    break; // No automatic retry or continuation after a content/provider failure.
  }
}
