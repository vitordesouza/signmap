import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { generateReadingMutation } from "../generated/@tanstack/react-query.gen";
import type { ChartRequest } from "../schemas/chart";
import type { Chapter } from "../schemas/reading";
function ChapterContent({ chapter }: { chapter: Chapter }) {
  return (
    <section>
      <h3>{chapter.title}</h3>
      {chapter.paragraphs.map((p, i) => (
        <p key={i}>{p.text}</p>
      ))}
      <ul>
        {chapter.reflections.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
    </section>
  );
}
export function ReadingPanel({ input }: { input: ChartRequest }) {
  const mutation = useMutation({ ...generateReadingMutation(), retry: false });
  const [review, setReview] = useState(false);
  return (
    <section
      className="reading-panel"
      aria-label="Generated reading"
      aria-busy={mutation.isPending}
    >
      <p className="eyebrow">TWO-CHAPTER EXPERIMENT · ENGLISH INTERNAL PRESET</p>
      <h2>A reading of this sky</h2>
      <p className="muted">
        Your Sun sign and ruling planets, drafted separately and edited together. Generated only on
        request. This reading is lost on reload or leaving this view.
      </p>
      <p className="muted">
        Generation sends derived chart facts directly to OpenAI. API data is not used for training
        by default; abuse-monitoring logs may be retained for up to 30 days. Response storage is
        disabled. No name or raw birth details are sent to the model. Astrology offers symbolic
        reflection.
      </p>
      <button
        disabled={mutation.isPending}
        onClick={() => mutation.mutate({ body: { chart: input, preset: "english-internal-v1" } })}
      >
        {mutation.isPending
          ? "Writing and editing…"
          : mutation.isError
            ? "Retry reading"
            : "Generate reading"}
      </button>
      <div className="reading-status" role="status">
        {mutation.isPending &&
          "Generating two drafts, then an editorial edition. Keep this view open; there is no background recovery."}
      </div>
      {mutation.isError && (
        <p role="alert">
          {mutation.error?.error ?? "Unable to reach the reading service. Please retry manually."} A
          retry restarts all stages and may incur cost.
        </p>
      )}
      {mutation.data && (
        <>
          <p>{mutation.data.edition.introduction}</p>
          {mutation.data.edition.chapters.map((chapter) => (
            <ChapterContent key={chapter.id} chapter={chapter} />
          ))}
          <p>{mutation.data.edition.conclusion}</p>
          <p className="muted">
            {mutation.data.model} · {(mutation.data.durationMs / 1000).toFixed(1)} seconds ·{" "}
            {mutation.data.costUsd === null
              ? "Cost unknown"
              : `Estimated API usage $${mutation.data.costUsd.toFixed(4)} before credits`}
          </p>
          <details>
            <summary>Generation measurements</summary>
            <ul>
              {mutation.data.stages.map((s) => (
                <li key={s.stage}>
                  {s.stage}: {s.durationMs} ms · {s.inputTokens ?? "unknown"} input /{" "}
                  {s.outputTokens ?? "unknown"} output tokens
                </li>
              ))}
            </ul>
            <p>
              Prompt / voice / reference / schema version:{" "}
              {Object.values(mutation.data.versions).join(" / ")}
            </p>
          </details>
          {import.meta.env.DEV && mutation.data.drafts && (
            <>
              <button onClick={() => setReview(!review)}>Compare raw drafts</button>
              {review && (
                <div>
                  <p>
                    Review accuracy, specificity, tone, repetition, and useful reflection against
                    the edited edition above.
                  </p>
                  {mutation.data.drafts.map((chapter) => (
                    <ChapterContent key={chapter.id} chapter={chapter} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
