import { z } from "zod";

export const POINT_IDS = [
  "sun",
  "rising",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "midheaven",
  "chiron",
  "lilith",
  "northNode",
  "southNode",
  "fortune",
  "descendant",
  "ic",
] as const;
export const ASPECT_TYPES = [
  "conjunction",
  "sextile",
  "square",
  "trine",
  "opposition",
  "semisextile",
  "semisquare",
  "sesquiquadrate",
  "quincunx",
  "quintile",
  "biquintile",
] as const;
export const pointIdSchema = z.enum(POINT_IDS);
export const aspectTypeSchema = z.enum(ASPECT_TYPES);
export const settingsSchema = z.object({
  houseSystem: z.enum(["P", "W", "E"]),
  nodeMode: z.enum(["true", "mean"]),
  lilithMode: z.enum(["mean", "osculating"]),
  fortuneMode: z.enum(["sect", "day"]),
  rulership: z.enum(["traditional", "modern"]),
  weighting: z.enum(["equal", "personal"]),
  cuspOrb: z.number().min(0).max(5),
  aspectPoints: z.array(pointIdSchema).min(2).max(19),
  enabledAspects: z.array(aspectTypeSchema).min(1).max(11),
  orbs: z.object({
    conjunction: z.number().min(0).max(12),
    sextile: z.number().min(0).max(12),
    square: z.number().min(0).max(12),
    trine: z.number().min(0).max(12),
    opposition: z.number().min(0).max(12),
    semisextile: z.number().min(0).max(5),
    semisquare: z.number().min(0).max(5),
    sesquiquadrate: z.number().min(0).max(5),
    quincunx: z.number().min(0).max(5),
    quintile: z.number().min(0).max(5),
    biquintile: z.number().min(0).max(5),
  }),
});
export type CalculationSettings = z.infer<typeof settingsSchema>;
export const DEFAULT_SETTINGS: CalculationSettings = {
  houseSystem: "P",
  nodeMode: "true",
  lilithMode: "mean",
  fortuneMode: "sect",
  rulership: "traditional",
  weighting: "personal",
  cuspOrb: 3,
  aspectPoints: [
    "sun",
    "rising",
    "moon",
    "mercury",
    "venus",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
    "midheaven",
    "chiron",
    "lilith",
    "northNode",
    "fortune",
  ],
  enabledAspects: ["conjunction", "sextile", "square", "trine", "opposition"],
  orbs: {
    conjunction: 6,
    sextile: 6,
    square: 6,
    trine: 6,
    opposition: 6,
    semisextile: 2,
    semisquare: 2,
    sesquiquadrate: 2,
    quincunx: 2,
    quintile: 2,
    biquintile: 2,
  },
};
export const locationSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  region: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
});
export const locationListSchema = z.object({
  results: z.array(locationSchema.omit({ latitude: true, longitude: true, timezone: true })),
});
export const chartRequestSchema = z.object({
  locationId: z.number().int().positive(),
  date: z.iso.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  timeChoice: z.enum(["reject", "earlier", "later"]).default("reject"),
  settings: settingsSchema,
});
export const pointSchema = z.object({
  id: pointIdSchema,
  name: z.string(),
  glyph: z.string(),
  kind: z.enum(["planet", "angle", "point"]),
  longitude: z.number(),
  latitude: z.number(),
  speed: z.number().nullable(),
  house: z.number().nullable(),
  nextCusp: z.number().nullable(),
  cuspDistance: z.number().nullable(),
  decan: z.number(),
  conditions: z.array(z.string()),
});
export const aspectSchema = z.object({
  id: z.string(),
  a: pointIdSchema,
  b: pointIdSchema,
  type: aspectTypeSchema,
  angle: z.number(),
  separation: z.number(),
  orb: z.number(),
  limit: z.number(),
});
const scoreSchema = z.object({ label: z.string(), score: z.number(), percent: z.number() });
export const chartResponseSchema = z.object({
  points: z.array(pointSchema),
  cusps: z.array(z.number()),
  aspects: z.array(aspectSchema),
  summary: z.object({
    elements: z.array(scoreSchema),
    modalities: z.array(scoreSchema),
    polarities: z.array(scoreSchema),
    signs: z.array(scoreSchema),
    houses: z.array(scoreSchema),
    weighting: z.string(),
    chartRuler: z.string(),
  }),
  location: locationSchema,
  settings: settingsSchema,
  metadata: z.object({
    utc: z.string(),
    offset: z.string(),
    julianDayUT: z.number(),
    julianDayTT: z.number(),
    engine: z.string(),
    ephemeris: z.string(),
    dataRevision: z.string(),
    timezoneData: z.string(),
    dayChart: z.boolean(),
    sunAltitude: z.number(),
    houseMethod: z.string(),
    settingsVersion: z.number(),
  }),
  warnings: z.array(z.string()),
});
export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  choices: z
    .array(z.object({ choice: z.enum(["earlier", "later"]), utc: z.string(), offset: z.string() }))
    .optional(),
});
export type ChartRequest = z.infer<typeof chartRequestSchema>;
export type ChartResult = z.infer<typeof chartResponseSchema>;
export type ChartPoint = z.infer<typeof pointSchema>;
export type Aspect = z.infer<typeof aspectSchema>;
export type Location = z.infer<typeof locationSchema>;
export type PointId = z.infer<typeof pointIdSchema>;
