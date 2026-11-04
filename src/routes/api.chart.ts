import { createFileRoute } from "@tanstack/react-router";
import { chartRequestSchema, chartResponseSchema } from "../schemas/chart";
import { getLocation } from "../server/geocoding";
import { calculateChart } from "../server/chart";
import { ApiError, errorResponse } from "../server/errors";
export const Route = createFileRoute("/api/chart")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const parsed = chartRequestSchema.safeParse(await request.json());
          if (!parsed.success)
            throw new ApiError("Check the birth details and calculation settings.");
          const location = await getLocation(parsed.data.locationId);
          const chart = chartResponseSchema.parse(calculateChart(parsed.data, location));
          return Response.json(chart, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          if (error instanceof SyntaxError)
            return errorResponse(new ApiError("Request body must be valid JSON."));
          return errorResponse(error);
        }
      },
    },
  },
});
