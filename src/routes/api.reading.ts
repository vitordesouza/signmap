import { createFileRoute } from "@tanstack/react-router";
import { readingRequestSchema, readingResponseSchema } from "../schemas/reading";
import { getLocation } from "../server/geocoding";
import { calculateChart } from "../server/chart";
import { deriveFacts, fingerprint } from "../server/reading/facts";
import { runReading } from "../server/reading/pipeline";
import { ApiError, errorResponse } from "../server/errors";
import { readingConfigured } from "../server/reading/config";
let active = false;
export const Route = createFileRoute("/api/reading")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!readingConfigured())
            throw new ApiError(
              "Reading is disabled. Configure the model, credentials, provider privacy review, finite spend limit and deployment protection before enabling it.",
              503,
              "READING_DISABLED",
            );
          const reader = request.body?.getReader();
          if (!reader) throw new ApiError("Request body is required.");
          const chunks: Uint8Array[] = [];
          let size = 0;
          while (true) {
            const part = await reader.read();
            if (part.done) break;
            size += part.value.byteLength;
            if (size > 16000) {
              await reader.cancel();
              throw new ApiError("Request is too large.", 413);
            }
            chunks.push(part.value);
          }
          const raw = Buffer.concat(chunks).toString("utf8");
          const parsed = readingRequestSchema.safeParse(JSON.parse(raw));
          if (!parsed.success) throw new ApiError("Check the chart inputs and reading preset.");
          if (active)
            throw new ApiError(
              "A reading is already running. Please retry shortly.",
              429,
              "READING_BUSY",
            );
          active = true;
          try {
            const input = parsed.data.chart;
            const chart = calculateChart(input, await getLocation(input.locationId));
            const output = await runReading(
              deriveFacts(chart),
              fingerprint(input),
              request.signal,
              process.env.READING_MODEL!,
            );
            return Response.json(readingResponseSchema.parse(output), {
              headers: { "Cache-Control": "no-store" },
            });
          } finally {
            active = false;
          }
        } catch (error) {
          return errorResponse(
            error instanceof ApiError
              ? error
              : new ApiError(
                  "Reading could not finish. Retry manually; a retry may incur provider cost.",
                  502,
                  "READING_FAILED",
                ),
          );
        }
      },
    },
  },
});
