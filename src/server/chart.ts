import * as swe from "sweph";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ChartPoint, ChartRequest, ChartResult, Location, PointId } from "../schemas/chart";
import { calculateAspects, houseOf, normalize, separation, summarize } from "../lib/astrology";
import { resolveBirthTime } from "./time";
import { ApiError } from "./errors";
const c = swe.constants;
const directory = dirname(fileURLToPath(import.meta.url));
const ephemerisPath = [
  resolve("ephemeris"),
  resolve(directory, "ephemeris"),
  resolve(directory, "../ephemeris"),
  resolve(directory, "../../ephemeris"),
].find((p): p is string => !!p && existsSync(resolve(p, "sepl_18.se1")));
if (!ephemerisPath) throw Error("Ephemeris data files are missing from this server build.");
swe.set_ephe_path(ephemerisPath);
const BODIES: [PointId, string, string, number][] = [
  ["sun", "Sun", "☉", c.SE_SUN],
  ["moon", "Moon", "☽", c.SE_MOON],
  ["mercury", "Mercury", "☿", c.SE_MERCURY],
  ["venus", "Venus", "♀", c.SE_VENUS],
  ["mars", "Mars", "♂", c.SE_MARS],
  ["jupiter", "Jupiter", "♃", c.SE_JUPITER],
  ["saturn", "Saturn", "♄", c.SE_SATURN],
  ["uranus", "Uranus", "♅", c.SE_URANUS],
  ["neptune", "Neptune", "♆", c.SE_NEPTUNE],
  ["pluto", "Pluto", "♇", c.SE_PLUTO],
  ["chiron", "Chiron", "⚷", c.SE_CHIRON],
];
const traditionalRulers = [4, 3, 2, 1, 0, 2, 3, 4, 5, 6, 6, 5],
  modernRulers = [4, 3, 2, 1, 0, 2, 3, 9, 5, 6, 7, 8];
const exaltations: Record<string, number> = {
  sun: 0,
  moon: 1,
  mercury: 5,
  venus: 11,
  mars: 9,
  jupiter: 3,
  saturn: 6,
};
export function fortuneLongitude(
  rising: number,
  sun: number,
  moon: number,
  isDay: boolean,
  mode: "sect" | "day",
) {
  return normalize(rising + (isDay || mode === "day" ? moon - sun : sun - moon));
}
// All Swiss calls and derived calculations are synchronous. No per-request global settings are changed.
export function calculateChart(input: ChartRequest, location: Location): ChartResult {
  const time = resolveBirthTime(input.date, input.time, location.timezone, input.timeChoice),
    dt = time.dateTime,
    settings = input.settings;
  const jd = swe.utc_to_jd(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second, c.SE_GREG_CAL);
  if (jd.flag < 0) throw new ApiError("Unable to convert this birth instant.");
  const [tt, ut] = jd.data;
  const houses = swe.houses_ex2(ut, 0, location.latitude, location.longitude, settings.houseSystem);
  if (houses.flag < 0)
    throw new ApiError(
      "Placidus houses are undefined at this latitude. Choose Equal or Whole sign houses in Settings.",
      422,
      "POLAR_HOUSES",
    );
  const cusps = houses.data.houses;
  const makePoint = (
    id: PointId,
    name: string,
    glyph: string,
    longitude: number,
    latitude: number,
    speed: number | null,
    kind: ChartPoint["kind"],
  ): ChartPoint => {
    const house = kind === "angle" ? null : houseOf(longitude, cusps);
    const distance = house ? normalize(cusps[house % 12] - longitude) : null;
    return {
      id,
      name,
      glyph,
      kind,
      longitude: normalize(longitude),
      latitude,
      speed,
      house,
      nextCusp: distance !== null && distance <= settings.cuspOrb ? (house! % 12) + 1 : null,
      cuspDistance: distance !== null && distance <= settings.cuspOrb ? distance : null,
      decan: Math.floor((normalize(longitude) % 30) / 10) + 1,
      conditions: [],
    };
  };
  const flags = c.SEFLG_SWIEPH | c.SEFLG_SPEED;
  const body = (
    id: PointId,
    name: string,
    glyph: string,
    bodyId: number,
    kind: ChartPoint["kind"],
  ) => {
    const result = swe.calc(tt, bodyId, flags);
    if (result.flag < 0)
      throw new ApiError(
        `Ephemeris data unavailable for ${name} at this date.`,
        422,
        "EPHEMERIS_UNAVAILABLE",
      );
    if ((result.flag & c.SEFLG_SWIEPH) === 0)
      throw new ApiError(
        "Swiss ephemeris files were not used. Calculation stopped to prevent a silent precision fallback.",
        500,
        "EPHEMERIS_FALLBACK",
      );
    const [longitude, latitude, , speed] = result.data;
    return makePoint(id, name, glyph, longitude, latitude, speed, kind);
  };
  const points = BODIES.map(([id, name, glyph, bodyId], i) =>
    body(id, name, glyph, bodyId, i < 10 ? "planet" : "point"),
  );
  const angles = houses.data.points,
    speeds = houses.data.pointsSpeed;
  points.push(
    makePoint("rising", "Rising", "AC", angles[0], 0, speeds[0], "angle"),
    makePoint("midheaven", "Midheaven", "MC", angles[1], 0, speeds[1], "angle"),
    makePoint("descendant", "Descendant", "DC", angles[0] + 180, 0, speeds[0], "angle"),
    makePoint("ic", "IC", "IC", angles[1] + 180, 0, speeds[1], "angle"),
  );
  points.push(
    body(
      "northNode",
      "North Node",
      "☊",
      settings.nodeMode === "true" ? c.SE_TRUE_NODE : c.SE_MEAN_NODE,
      "point",
    ),
    body(
      "lilith",
      "Lilith",
      "⚸",
      settings.lilithMode === "mean" ? c.SE_MEAN_APOG : c.SE_OSCU_APOG,
      "point",
    ),
  );
  const north = points.find((p) => p.id === "northNode")!;
  points.push(
    makePoint(
      "southNode",
      "South Node",
      "☋",
      north.longitude + 180,
      -north.latitude,
      north.speed,
      "point",
    ),
  );
  const sun = points[0],
    moon = points[1];
  const horizontal = swe.azalt(ut, c.SE_ECL2HOR, [location.longitude, location.latitude, 0], 0, 0, [
    sun.longitude,
    sun.latitude,
    1,
  ]);
  const altitude = horizontal[1];
  const isDay = altitude >= 0;
  points.push(
    makePoint(
      "fortune",
      "Part of Fortune",
      "⊗",
      fortuneLongitude(angles[0], sun.longitude, moon.longitude, isDay, settings.fortuneMode),
      0,
      null,
      "point",
    ),
  );
  const rulers = settings.rulership === "traditional" ? traditionalRulers : modernRulers;
  for (let i = 0; i < 10; i++) {
    const p = points[i],
      index = Math.floor(p.longitude / 30);
    if (rulers[index] === i) p.conditions.push("Domicile");
    if (rulers[(index + 6) % 12] === i) p.conditions.push("Detriment");
    if (exaltations[p.id] === index) p.conditions.push("Exaltation");
    if (exaltations[p.id] !== undefined && (exaltations[p.id] + 6) % 12 === index)
      p.conditions.push("Fall");
    if (i >= 2 && i <= 6) {
      const distance = separation(sun.longitude, p.longitude);
      if (distance <= 17 / 60) p.conditions.push("Cazimi");
      else if (distance <= 8.5) p.conditions.push("Combust");
      else if (distance <= 17) p.conditions.push("Under the beams");
    }
  }
  const order: PointId[] = [
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
  ];
  points.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const warnings = [
    "Astrological summaries use our documented weighting model, not Astrolink’s proprietary scoring.",
  ];
  if (dt.year < 1970)
    warnings.push(
      "Historical timezone records, especially before 1970, can be incomplete. Confirm the recorded local time and historical jurisdiction.",
    );
  if (settings.houseSystem !== "P")
    warnings.push(
      "Rising and Midheaven are independent angles; they may differ from house 1 and house 10 cusps.",
    );
  return {
    points,
    cusps,
    aspects: calculateAspects(points, settings),
    summary: summarize(points, settings.weighting, settings.rulership),
    location,
    settings,
    metadata: {
      utc: time.utc,
      offset: time.offset,
      julianDayUT: ut,
      julianDayTT: tt,
      engine: `Swiss Ephemeris ${swe.version()} / sweph 2.10.3-8`,
      ephemeris: "Swiss files · 1800–2399",
      dataRevision: "94621aba9f3ff9c32cb721eac0380c30dbb153fe",
      timezoneData: `Node ${process.versions.node} / ICU ${process.versions.icu} / tz ${process.versions.tz ?? "runtime"}`,
      dayChart: isDay,
      sunAltitude: altitude,
      houseMethod:
        "Tropical geocentric longitudes; house membership by longitude within cusp intervals.",
      settingsVersion: 1,
    },
    warnings,
  };
}
