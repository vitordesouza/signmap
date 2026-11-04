import { describe, it, expect } from "vitest";
import * as swe from "sweph";
import { DEFAULT_SETTINGS, settingsSchema, type ChartPoint } from "../src/schemas/chart";
import { calculateChart, fortuneLongitude } from "../src/server/chart";
import { calculateAspects, houseOf, normalize, separation, summarize } from "../src/lib/astrology";
import { resolveBirthTime } from "../src/server/time";
import { ApiError } from "../src/server/errors";
import fixtures from "./fixtures/python-swiss.json";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const location = {
  id: 1,
  name: "New York",
  region: "New York",
  country: "US",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
};
const request = {
  locationId: 1,
  date: "1994-09-18",
  time: "14:30",
  timeChoice: "reject" as const,
  settings: DEFAULT_SETTINGS,
};
const point = (
  id: ChartPoint["id"],
  longitude: number,
  kind: ChartPoint["kind"] = "planet",
): ChartPoint => ({
  id,
  name: id,
  glyph: "",
  kind,
  longitude,
  latitude: 0,
  speed: 1,
  house: 1,
  nextCusp: null,
  cuspDistance: null,
  decan: 1,
  conditions: [],
});
describe("Node ↔ Python Swiss Ephemeris migration fixtures", () => {
  for (const f of fixtures.fixtures)
    it(f.name, () => {
      const [year, month, day, hour, minute, second] = f.utc;
      const jd = swe.utc_to_jd(year, month, day, hour, minute, second, swe.constants.SE_GREG_CAL);
      expect(jd.flag).toBe(0);
      expect(jd.data[0]).toBeCloseTo(f.tt, 8);
      expect(jd.data[1]).toBeCloseTo(f.ut, 8);
      f.bodyIds.forEach((id, i) => {
        const p = swe.calc(jd.data[0], id, swe.constants.SEFLG_SWIEPH | swe.constants.SEFLG_SPEED);
        expect(p.flag & swe.constants.SEFLG_SWIEPH).toBeTruthy();
        p.data.forEach((value, j) => expect(value).toBeCloseTo(f.values[i][j], 6));
      });
      const houses = swe.houses_ex2(jd.data[1], 0, f.latitude, f.longitude, f.houseSystem);
      expect(houses.flag).toBe(0);
      houses.data.houses.forEach((value, i) => expect(value).toBeCloseTo(f.cusps[i], 7));
      houses.data.points.forEach((value, i) => expect(value).toBeCloseTo(f.angles[i], 7));
    });
});
describe("historical time conversion", () => {
  it("resolves offsets at birth, including fractional historical offsets", () => {
    expect(resolveBirthTime("1994-01-18", "12:00", "America/New_York").offset).toBe("-05:00");
    expect(resolveBirthTime("1994-07-18", "12:00", "America/New_York").offset).toBe("-04:00");
    expect(resolveBirthTime("1980-01-01", "12:00", "Asia/Kathmandu").offset).toBe("+05:30");
    expect(resolveBirthTime("1994-01-01", "12:00", "Asia/Kathmandu").offset).toBe("+05:45");
  });
  it("offers the two actual instants in a repeated hour", () => {
    try {
      resolveBirthTime("2024-11-03", "01:30", "America/New_York");
      throw Error("Expected ambiguity");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).code).toBe("AMBIGUOUS_TIME");
      expect((e as ApiError).choices?.map((c) => c.utc)).toEqual([
        "2024-11-03T05:30:00Z",
        "2024-11-03T06:30:00Z",
      ]);
    }
    expect(resolveBirthTime("2024-11-03", "01:30", "America/New_York", "later").utc).toBe(
      "2024-11-03T06:30:00Z",
    );
  });
  it("rejects nonexistent local times and invalid dates", () => {
    expect(() => resolveBirthTime("2024-03-10", "02:30", "America/New_York", "later")).toThrow(
      "did not occur",
    );
    expect(() => resolveBirthTime("2024-02-30", "12:00", "UTC")).toThrow("valid birth date");
    expect(() => resolveBirthTime("1799-01-01", "12:00", "UTC")).toThrow("1800");
  });
});
describe("aspects and geometric boundaries", () => {
  it("wraps angles and includes exact cutoffs without rounding before comparison", () => {
    expect(separation(359, 1)).toBe(2);
    expect(normalize(-1)).toBe(359);
    const points = [point("sun", 0), point("pluto", 96.99)];
    expect(calculateAspects(points, DEFAULT_SETTINGS)).toHaveLength(0);
    expect(
      calculateAspects(points, {
        ...DEFAULT_SETTINGS,
        orbs: { ...DEFAULT_SETTINGS.orbs, square: 7 },
      })[0].orb,
    ).toBeCloseTo(6.99, 8);
    expect(calculateAspects([point("sun", 0), point("moon", 96)], DEFAULT_SETTINGS)).toHaveLength(
      1,
    );
  });
  it("adds selected angles and additional points, excludes mechanically related pairs", () => {
    const points = [
      point("sun", 0),
      point("rising", 90, "angle"),
      point("midheaven", 180, "angle"),
      point("chiron", 120, "point"),
    ];
    const aspects = calculateAspects(points, DEFAULT_SETTINGS);
    expect(aspects.some((a) => a.a === "sun" && a.b === "rising")).toBe(true);
    expect(aspects.some((a) => a.b === "chiron")).toBe(true);
    expect(aspects.some((a) => a.a === "rising" && a.b === "midheaven")).toBe(false);
    expect(new Set(aspects.map((a) => a.id)).size).toBe(aspects.length);
  });
  it("assigns cusp boundaries to the new house across zero", () => {
    const cusps = Array.from({ length: 12 }, (_, i) => normalize(350 + i * 30));
    expect(houseOf(349.999, cusps)).toBe(12);
    expect(houseOf(350, cusps)).toBe(1);
    expect(houseOf(20, cusps)).toBe(2);
  });
  it("uses day and night Fortune formulae", () => {
    expect(fortuneLongitude(100, 200, 50, true, "sect")).toBe(310);
    expect(fortuneLongitude(100, 200, 50, false, "sect")).toBe(250);
    expect(fortuneLongitude(100, 200, 50, false, "day")).toBe(310);
  });
});
describe("full chart contract", () => {
  it("includes all points, real angles and transparent summaries", () => {
    const result = calculateChart(request, location);
    expect(result.points).toHaveLength(19);
    expect(result.points.slice(0, 3).map((p) => p.id)).toEqual(["sun", "rising", "moon"]);
    expect(result.points.find((p) => p.id === "rising")?.house).toBeNull();
    expect(result.points.find((p) => p.id === "chiron")?.longitude).toBeGreaterThan(0);
    expect(result.metadata.ephemeris).toContain("Swiss files");
    expect(result.summary.elements.reduce((n, e) => n + e.score, 0)).toBe(14);
    expect(result.summary.elements.reduce((n, e) => n + e.percent, 0)).toBeCloseTo(100);
    expect(result.aspects.some((a) => a.a === "rising" || a.b === "rising")).toBe(true);
  });
  it("preserves independent angles in whole sign houses and changes conventions", () => {
    const result = calculateChart(
      {
        ...request,
        settings: {
          ...DEFAULT_SETTINGS,
          houseSystem: "W",
          nodeMode: "mean",
          lilithMode: "osculating",
        },
      },
      location,
    );
    const rising = result.points.find((p) => p.id === "rising")!;
    expect(result.cusps[0] % 30).toBeCloseTo(0);
    expect(Math.abs(result.cusps[0] - rising.longitude)).toBeGreaterThan(1);
    expect(result.warnings.length).toBeGreaterThan(1);
  });
  it("rejects undefined polar houses rather than silently changing systems", () => {
    expect(() => calculateChart(request, { ...location, latitude: 89 })).toThrow("undefined");
    expect(() =>
      calculateChart(
        { ...request, settings: { ...DEFAULT_SETTINGS, houseSystem: "W" } },
        { ...location, latitude: 89 },
      ),
    ).not.toThrow();
  });
  it("allows configurable scoring and validates extreme orb input", () => {
    const result = calculateChart(request, location);
    expect(
      summarize(result.points, "equal", "traditional").elements.reduce((n, e) => n + e.score, 0),
    ).toBe(11);
    expect(
      settingsSchema.safeParse({
        ...DEFAULT_SETTINGS,
        orbs: { ...DEFAULT_SETTINGS.orbs, square: 99 },
      }).success,
    ).toBe(false);
  });
});
it("bundles the pinned ephemeris files without corruption", () => {
  const hashes: Record<string, string> = {
    seas_18: "a2cd8fc33807c78ca9a700c91c2e042258b12fc4796519e00781440b5ad8b2e2",
    semo_18: "1ca07bd67c24374d77226180c20a4f9996cba013697894810518e7eb582ca4f7",
    sepl_18: "ca1393ceab3a44fbc895887cf789c68819ae6a1cbc9b22225872dbe4ccd99a66",
  };
  for (const [name, hash] of Object.entries(hashes))
    expect(
      createHash("sha256")
        .update(readFileSync(`ephemeris/${name}.se1`))
        .digest("hex"),
    ).toBe(hash);
});
