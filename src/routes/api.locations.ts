import { createFileRoute } from "@tanstack/react-router";
import { searchLocations } from "../server/geocoding";
import { errorResponse } from "../server/errors";
export const Route = createFileRoute("/api/locations")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return Response.json(
            await searchLocations(new URL(request.url).searchParams.get("q") ?? ""),
          );
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },
});
