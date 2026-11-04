import type { z } from "zod";
import type { apiErrorSchema } from "../schemas/chart";
type Choice = NonNullable<z.infer<typeof apiErrorSchema>["choices"]>[number];
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "INVALID_INPUT",
    public choices?: Choice[],
  ) {
    super(message);
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof ApiError)
    return Response.json(
      {
        error: error.message,
        code: error.code,
        ...(error.choices ? { choices: error.choices } : {}),
      },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  console.error("Mapa API failure", error);
  return Response.json(
    { error: "We could not complete this request. Please try again.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
