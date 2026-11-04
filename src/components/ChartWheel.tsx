import { AstroGlyph } from "./AstroGlyph";
import type { ChartResult } from "../schemas/chart";
import { ASPECTS, ELEMENT_COLORS, SIGNS, normalize, sign, degree } from "../lib/astrology";
function labelPositions(points: ChartResult["points"]) {
  const sorted = [...points].sort((a, b) => a.longitude - b.longitude);
  if (!sorted.length) return [];
  // Cut at the largest empty arc, then distribute crowded labels with leader lines.
  let cut = 0,
    gap = -1;
  sorted.forEach((p, i) => {
    const next = sorted[(i + 1) % sorted.length];
    const g = normalize(next.longitude - p.longitude);
    if (g > gap) {
      gap = g;
      cut = (i + 1) % sorted.length;
    }
  });
  const order = [...sorted.slice(cut), ...sorted.slice(0, cut)];
  let last = -Infinity;
  const start = order[0].longitude;
  const labels = order.map((p) => {
    const actual = start + normalize(p.longitude - start),
      display = Math.max(actual, last + 11);
    last = display;
    return { point: p, actual, display };
  });
  // Center each connected crowd so displaced labels stay close to their true tick.
  for (let i = 0; i < labels.length;) {
    let end = i;
    while (end + 1 < labels.length && labels[end + 1].display - labels[end].display <= 11.001)
      end++;
    const shift = (labels[end].display - labels[end].actual) / 2;
    for (let j = i; j <= end; j++) labels[j].display -= shift;
    i = end + 1;
  }
  return labels;
}
export function ChartWheel({
  chart,
  showAspects,
  showExtra,
  selected,
  id = "natal-wheel",
}: {
  chart: ChartResult;
  showAspects: boolean;
  showExtra: boolean;
  selected: string | null;
  id?: string;
}) {
  const rising = chart.points.find((p) => p.id === "rising")!.longitude;
  const points = chart.points.filter(
    (p) =>
      p.kind === "planet" ||
      (showExtra && chart.settings.aspectPoints.includes(p.id) && p.kind === "point"),
  );
  const labels = labelPositions(points);
  const point = (a: number, r: number) => {
    const t = ((180 - a + rising) * Math.PI) / 180;
    return { x: 280 + r * Math.cos(t), y: 280 + r * Math.sin(t) };
  };
  const line = (a: number, r: number, b: number, s: number) => {
    const p = point(a, r),
      q = point(b, s);
    return { x1: p.x, y1: p.y, x2: q.x, y2: q.y };
  };
  const selectedAspect = chart.aspects.find((a) => a.id === selected);
  return (
    <svg
      id={id}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 560 560"
      role="img"
      aria-labelledby={`${id}-title ${id}-description`}
    >
      <title id={`${id}-title`}>Your natal chart</title>
      <desc id={`${id}-description`}>
        Tropical zodiac, twelve houses, planets and selected additional points. Exact values are
        available in Placements and Aspects. Displaced glyphs connect to their true positions with
        leader lines.
      </desc>
      <rect width="560" height="560" fill="#fcfbf7" />
      {[250, 219, 165, 115].map((r) => (
        <circle
          key={r}
          cx="280"
          cy="280"
          r={r}
          fill="none"
          stroke="#cdd1c5"
          strokeWidth={r === 250 ? 1.4 : 0.8}
        />
      ))}
      {Array.from({ length: 360 }, (_, a) => (
        <line key={a} {...line(a, a % 5 ? 247 : 242, a, 250)} stroke="#c5caba" strokeWidth=".6" />
      ))}
      {SIGNS.map((g, i) => (
        <g key={g}>
          <line {...line(i * 30, 219, i * 30, 250)} stroke="#cdd1c5" />
          <AstroGlyph
            id={g.toLowerCase()}
            x={point(i * 30 + 15, 233).x - 11}
            y={point(i * 30 + 15, 233).y - 11}
            size={22}
            color={ELEMENT_COLORS[i % 4]}
            title={g}
          />
          <line {...line(chart.cusps[i], 115, chart.cusps[i], 219)} stroke="#cdd1c5" />
          <text
            {...point(
              chart.cusps[i] + normalize(chart.cusps[(i + 1) % 12] - chart.cusps[i]) / 2,
              139,
            )}
            textAnchor="middle"
            fontSize="10"
            fill="#7a8572"
          >
            {i + 1}
          </text>
        </g>
      ))}
      {showAspects &&
        chart.aspects.map((a) => {
          const x = chart.points.find((p) => p.id === a.a)!,
            y = chart.points.find((p) => p.id === a.b)!;
          return (
            <line
              key={a.id}
              {...line(x.longitude, 114, y.longitude, 114)}
              stroke={ASPECTS[a.type].color}
              strokeWidth={selected === a.id ? 2 : 0.8}
              opacity={selected && selected !== a.id ? 0.12 : 0.65}
            >
              <title>
                {x.name} {ASPECTS[a.type].label.toLowerCase()} {y.name} · {a.orb.toFixed(2)}° orb
              </title>
            </line>
          );
        })}
      {labels.map(({ point: p, display }) => (
        <g key={p.id}>
          <line
            {...line(p.longitude, 165, display, 185)}
            stroke={ELEMENT_COLORS[Math.floor(p.longitude / 30) % 4]}
            strokeWidth=".7"
          />
          <circle
            {...{ cx: point(p.longitude, 165).x, cy: point(p.longitude, 165).y }}
            r="1.5"
            fill="#70836a"
          />
          <AstroGlyph
            id={p.id}
            x={point(display, 195).x - 10}
            y={point(display, 195).y - 10}
            size={20}
            color={ELEMENT_COLORS[Math.floor(p.longitude / 30) % 4]}
            title={`${p.name} in ${sign(p.longitude)} ${degree(p.longitude)}${p.speed !== null && p.speed < 0 ? " · retrograde" : ""}`}
          />
          <text {...point(display, 211)} textAnchor="middle" fontSize="8" fill="#63705e">
            {Math.floor(p.longitude % 30)}°{p.speed !== null && p.speed < 0 ? " R" : ""}
          </text>
        </g>
      ))}
      {chart.points
        .filter((p) => p.kind === "angle")
        .map((p) => (
          <g key={p.id}>
            <line {...line(p.longitude, 115, p.longitude, 255)} stroke="#73856c" strokeWidth=".8" />
            <AstroGlyph
              id={p.id}
              x={point(p.longitude, 267).x - 9}
              y={point(p.longitude, 267).y - 9}
              size={18}
              color="#354e3c"
              title={`${p.name}: ${sign(p.longitude)} ${degree(p.longitude)}`}
            />
          </g>
        ))}
      {selectedAspect && (
        <text x="280" y="285" textAnchor="middle" fontSize="10" fill="#354e3c">
          {ASPECTS[selectedAspect.type].label} · {selectedAspect.orb.toFixed(2)}°
        </text>
      )}
    </svg>
  );
}
