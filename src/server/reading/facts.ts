import { createHash } from "node:crypto";
import { sign } from "../../lib/astrology";
import type { ChartRequest, ChartResult } from "../../schemas/chart";
export const ruler = (longitude: number, modern: boolean) =>
  (modern
    ? [
        "mars",
        "venus",
        "mercury",
        "moon",
        "sun",
        "mercury",
        "venus",
        "pluto",
        "jupiter",
        "saturn",
        "uranus",
        "neptune",
      ]
    : [
        "mars",
        "venus",
        "mercury",
        "moon",
        "sun",
        "mercury",
        "venus",
        "mars",
        "jupiter",
        "saturn",
        "saturn",
        "jupiter",
      ])[Math.floor(longitude / 30)];
export function deriveFacts(chart: ChartResult) {
  const modern = chart.settings.rulership === "modern";
  const sun = chart.points.find((p) => p.id === "sun")!;
  const rising = chart.points.find((p) => p.id === "rising")!;
  const sunRuler = ruler(sun.longitude, modern),
    chartRuler = ruler(rising.longitude, modern);
  const relevant = new Set(["sun", "moon", "rising", sunRuler, chartRuler]);
  const reviewedAspectPoints = new Set([
    "sun",
    "moon",
    "rising",
    "mercury",
    "venus",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
  ]);
  return [
    { id: "rulership", convention: chart.settings.rulership, sunRuler, chartRuler },
    ...chart.points
      .filter((p) => relevant.has(p.id))
      .map((p) => ({
        id: `placement:${p.id}`,
        planet: p.id,
        sign: sign(p.longitude),
        occupiedHouse: p.house,
        ruledHouses: chart.cusps.flatMap((c, i) => (ruler(c, modern) === p.id ? [i + 1] : [])),
      })),
    ...chart.aspects
      .filter(
        (a) =>
          (relevant.has(a.a) || relevant.has(a.b)) &&
          reviewedAspectPoints.has(a.a) &&
          reviewedAspectPoints.has(a.b),
      )
      .slice(0, 12)
      .map((a) => ({ id: `aspect:${a.id}`, a: a.a, b: a.b, type: a.type, orb: a.orb })),
  ];
}
export const fingerprint = (input: ChartRequest) =>
  createHash("sha256").update(JSON.stringify(input)).digest("hex");
