import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AstroGlyph, GLYPH_IDS } from "../src/components/AstroGlyph";
import { ChartReport } from "../src/components/ChartReport";
import { calculateChart } from "../src/server/chart";
import { DEFAULT_SETTINGS, POINT_IDS } from "../src/schemas/chart";
import { SIGNS } from "../src/lib/astrology";
const chart = calculateChart(
  {
    locationId: 1,
    date: "1994-09-18",
    time: "14:30",
    timeChoice: "reject",
    settings: DEFAULT_SETTINGS,
  },
  {
    id: 1,
    name: "Example city",
    region: "Region",
    country: "Country",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
  },
);
describe("portable glyph rendering", () => {
  it("renders all supported signs and points without text, fonts or external images", () => {
    for (const id of [...POINT_IDS, ...SIGNS.map((s) => s.toLowerCase())]) {
      expect(GLYPH_IDS).toContain(id);
      const svg = renderToStaticMarkup(<AstroGlyph id={id} title={id} />);
      expect(svg).toMatch(/<(path|circle|g) /);
      expect(svg).not.toContain("<text");
      expect(svg).not.toContain("<image");
      expect(svg).not.toContain("<use");
      expect(svg).toContain(`aria-label="${id}"`);
    }
  });
  it("uses separate title IDs for multiple chart instances", () => {
    const html = renderToStaticMarkup(<ChartReport chart={chart} name="Example" />);
    expect(html).toContain('id="report-wheel-title"');
    expect(html).not.toContain('id="wheel-title"');
  });
});
it("includes complete report data regardless of active workspace tab", () => {
  const report = renderToStaticMarkup(<ChartReport chart={chart} name={"Example <script>"} />);
  expect(report).toContain("Example &lt;script&gt;");
  for (const heading of [
    "01 / OVERVIEW",
    "02 / PLACEMENTS",
    "03 / HOUSES",
    "04 / ASPECTS",
    "05 / METHOD &amp; PROVENANCE",
  ])
    expect(report).toContain(heading);
  for (const point of chart.points) expect(report).toContain(point.name);
  expect(report).toContain(chart.metadata.utc);
  expect(report).toContain(chart.metadata.dataRevision);
  expect(report).toContain("Part of Fortune");
  expect(report).toContain("Eligible placements");
  expect(report).toContain("Domicile");
});
