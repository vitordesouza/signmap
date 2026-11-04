/** Reconcile the user's local Astrolink export without publishing their birth record.
 * Local inputs and output are ignored by Git and deployment uploads.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
import { calculateChart } from "../src/server/chart";
import { DEFAULT_SETTINGS, type PointId } from "../src/schemas/chart";
import { separation } from "../src/lib/astrology";
const file = process.argv[2] ?? "prompt-files/My Birth Chart - Astrolink.html";
const inputPath = process.argv[3] ?? "output/private/reference-input.json";
const html = readFileSync(file, "utf8");
const image = html.match(/<graphic-map\s+image="([^"]+)"/);
assert.ok(image, "The export does not contain the expected chart image data.");
const parameters = new URL(image[1].replaceAll("&amp;", "&")).searchParams;
function deserialize(value: string | null) {
  assert.ok(value, "Missing serialized chart values");
  const result: Record<number, number> = {};
  for (const match of value.matchAll(/i:(\d+);(?:s:\d+:"([^"]*)"|d:([^;]+));/g)) {
    const n = Number((match[2] ?? match[3]).trim());
    assert.ok(Number.isFinite(n));
    result[Number(match[1])] = n;
  }
  return result;
}
const positions = deserialize(parameters.get("p1")),
  cusps = deserialize(parameters.get("hc1"));
const input = JSON.parse(readFileSync(inputPath, "utf8"));
const chart = calculateChart(
  { ...input, timeChoice: "reject", settings: DEFAULT_SETTINGS },
  input.location,
);
const pointMap: [PointId, number][] = [
  ["sun", 0],
  ["moon", 1],
  ["mercury", 2],
  ["venus", 3],
  ["mars", 4],
  ["jupiter", 5],
  ["saturn", 6],
  ["uranus", 7],
  ["neptune", 8],
  ["pluto", 9],
  ["chiron", 10],
  ["lilith", 11],
  ["northNode", 12],
  ["fortune", 13],
  ["rising", 27],
  ["midheaven", 28],
];
const rows = pointMap.map(([id, index]) => {
  const point = chart.points.find((p) => p.id === id)!;
  assert.ok(Number.isFinite(positions[index]), `Missing reference position for ${id}`);
  const deltaArcseconds = separation(point.longitude, positions[index]) * 3600;
  return {
    id,
    reference: positions[index],
    actual: point.longitude,
    deltaArcseconds,
    toleranceArcseconds: ["rising", "midheaven", "fortune"].includes(id) ? 60 : 1,
  };
});
const houses = Array.from({ length: 12 }, (_, i) => ({
  house: i + 1,
  reference: cusps[i + 1],
  actual: chart.cusps[i],
  deltaArcseconds: separation(cusps[i + 1], chart.cusps[i]) * 3600,
  toleranceArcseconds: 60,
}));
const visibleAspects = [
  { a: "mars", b: "jupiter", type: "square", referenceOrb: 3.86 },
  { a: "mars", b: "pluto", type: "square", referenceOrb: 6.99 },
].map((a) => {
  const x = chart.points.find((p) => p.id === a.a)!,
    y = chart.points.find((p) => p.id === a.b)!;
  const actualOrb = Math.abs(separation(x.longitude, y.longitude) - 90);
  return {
    ...a,
    actualOrb,
    roundedMatches: Number(actualOrb.toFixed(2)) === a.referenceOrb,
    includedAt6: actualOrb <= 6,
    includedAt7: actualOrb <= 7,
  };
});
const expectedHouses: Partial<Record<PointId, number>> = {
  mars: 2,
  chiron: 3,
  mercury: 4,
  venus: 4,
  sun: 5,
  jupiter: 5,
  pluto: 5,
  uranus: 7,
  neptune: 7,
  saturn: 8,
  fortune: 8,
  moon: 10,
  lilith: 11,
};
const houseAssignments = Object.entries(expectedHouses).map(([id, expected]) => ({
  id,
  reference: expected,
  actual: chart.points.find((p) => p.id === id)!.house,
}));
const maxPlanetArcseconds = Math.max(
  ...rows.filter((r) => r.toleranceArcseconds === 1).map((r) => r.deltaArcseconds),
);
const maxHouseArcseconds = Math.max(...houses.map((h) => h.deltaArcseconds));
const result = {
  source:
    "User-supplied Astrolink HTML export; numerical positions, cusps and two visible natal aspects only. Premium aspect rules and original calculation coordinates are not supplied.",
  input,
  utc: chart.metadata.utc,
  offset: chart.metadata.offset,
  rows,
  houses,
  houseAssignments,
  visibleAspects,
  maxPlanetArcseconds,
  maxHouseArcseconds,
  limits:
    "This is an external-application reconciliation, not an independent validation of the underlying astronomical theory. The original reference coordinates and full orb policy are unavailable. House/angle/Fortune tolerances are one arcminute; planet/node/Lilith tolerances are one arcsecond. Residual house/angle differences remain unresolved, potentially reflecting differing city coordinates or time conventions.",
};
mkdirSync("output/private", { recursive: true });
writeFileSync(
  "output/private/astrolink-reconciliation.json",
  JSON.stringify(result, null, 2) + "\n",
);
for (const row of [...rows, ...houses])
  assert.ok(
    row.deltaArcseconds <= row.toleranceArcseconds,
    `Reference difference exceeds tolerance: ${JSON.stringify(row)}`,
  );
for (const row of houseAssignments)
  assert.equal(row.actual, row.reference, `House assignment: ${row.id}`);
for (const aspect of visibleAspects)
  assert.ok(aspect.roundedMatches, `Aspect orb: ${aspect.a}/${aspect.b}`);
console.log(
  `Astrolink reconciliation passed: 13 planet/node/Lilith positions within 1 arcsecond (maximum ${maxPlanetArcseconds.toFixed(3)}″); 12 cusps within 1 arcminute (maximum ${maxHouseArcseconds.toFixed(2)}″); Rising, Midheaven and Fortune within 1 arcminute; 13 visible house assignments and 2 published aspect orbs match. Exact reference coordinates and complete aspect policy remain unknown. Detailed evidence is local-only: output/private/astrolink-reconciliation.json`,
);
