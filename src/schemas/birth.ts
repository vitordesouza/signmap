import { z } from "zod";
import { locationSchema } from "./chart";
export const placeOptionSchema = locationSchema.omit({
  latitude: true,
  longitude: true,
  timezone: true,
});
export const birthDraftSchema = z.object({
  name: z.string(),
  email: z.string(),
  gender: z.string(),
  date: z.iso.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  language: z.string(),
  place: placeOptionSchema.nullable(),
});
export type BirthDraft = z.infer<typeof birthDraftSchema>;
export type PlaceOption = z.infer<typeof placeOptionSchema>;
