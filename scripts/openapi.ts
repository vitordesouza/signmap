import { writeFileSync } from "node:fs";
import { z } from "zod";
import {
  chartRequestSchema,
  chartResponseSchema,
  locationListSchema,
  apiErrorSchema,
} from "../src/schemas/chart";
import { readingRequestSchema, readingResponseSchema } from "../src/schemas/reading";
const json = (schema: z.ZodType) => ({
  "application/json": { schema: z.toJSONSchema(schema, { target: "openapi-3.0" }) },
});
const errorResponse = {
  description: "Validation or calculation error",
  content: json(apiErrorSchema),
};
const document = {
  openapi: "3.0.3",
  info: { title: "Mapa calculation API", version: "1.0.0" },
  paths: {
    "/api/reading": {
      post: {
        operationId: "generateReading",
        requestBody: { required: true, content: json(readingRequestSchema) },
        responses: {
          "200": { description: "Two chapter reading", content: json(readingResponseSchema) },
          "400": errorResponse,
          "413": errorResponse,
          "429": errorResponse,
          "502": errorResponse,
          "503": errorResponse,
        },
      },
    },
    "/api/locations": {
      get: {
        operationId: "searchLocations",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string", minLength: 2, maxLength: 120 },
          },
        ],
        responses: {
          "200": { description: "Matching places", content: json(locationListSchema) },
          "400": errorResponse,
          "502": errorResponse,
        },
      },
    },
    "/api/chart": {
      post: {
        operationId: "calculateChart",
        requestBody: { required: true, content: json(chartRequestSchema) },
        responses: {
          "200": { description: "Calculated natal chart", content: json(chartResponseSchema) },
          "400": errorResponse,
          "422": errorResponse,
          "500": errorResponse,
          "502": errorResponse,
        },
      },
    },
  },
};
writeFileSync("openapi.json", JSON.stringify(document, null, 2) + "\n");
