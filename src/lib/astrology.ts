import type { Aspect, CalculationSettings, ChartPoint } from "../schemas/chart";
export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];
export const SIGN_GLYPHS = ["♈︎", "♉︎", "♊︎", "♋︎", "♌︎", "♍︎", "♎︎", "♏︎", "♐︎", "♑︎", "♒︎", "♓︎"];
export const ELEMENT_COLORS = ["#ac6849", "#70836a", "#a18a46", "#5d8796"];
export const HOUSE_THEMES = [
  "Self & appearance",
  "Money & resources",
  "Communication & learning",
  "Home & roots",
  "Creativity & pleasure",
  "Routines & service",
  "Partnerships",
  "Shared resources",
  "Beliefs & exploration",
  "Career & public life",
  "Friends & community",
  "Solitude & reflection",
];
export const ASPECTS = {
  conjunction: { angle: 0, label: "Conjunction", color: "#8b8273" },
  sextile: { angle: 60, label: "Sextile", color: "#6d9580" },
  square: { angle: 90, label: "Square", color: "#bb7a65" },
  trine: { angle: 120, label: "Trine", color: "#6d9580" },
  opposition: { angle: 180, label: "Opposition", color: "#bb7a65" },
  semisextile: { angle: 30, label: "Semisextile", color: "#999573" },
  semisquare: { angle: 45, label: "Semisquare", color: "#af9284" },
  sesquiquadrate: { angle: 135, label: "Sesquiquadrate", color: "#af9284" },
  quincunx: { angle: 150, label: "Quincunx", color: "#999573" },
  quintile: { angle: 72, label: "Quintile", color: "#8296a7" },
  biquintile: { angle: 144, label: "Biquintile", color: "#8296a7" },
} as const;
export const normalize = (n: number) => ((n % 360) + 360) % 360;
export const separation = (a: number, b: number) =>
  Math.abs(((normalize(a) - normalize(b) + 540) % 360) - 180);
export const sign = (longitude: number) => SIGNS[Math.floor(normalize(longitude) / 30)];
export function degree(longitude: number) {
  const seconds = Math.floor((normalize(longitude) % 30) * 3600);
  return `${Math.floor(seconds / 3600)}° ${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}′ ${String(seconds % 60).padStart(2, "0")}″`;
}
export function houseOf(longitude: number, cusps: number[]) {
  return (
    cusps.findIndex((c, i) => normalize(longitude - c) < normalize(cusps[(i + 1) % 12] - c)) + 1
  );
}
export function calculateAspects(points: ChartPoint[], settings: CalculationSettings): Aspect[] {
  const eligible = points.filter((p) => settings.aspectPoints.includes(p.id));
  const aspects: Aspect[] = [];
  for (let i = 0; i < eligible.length; i++)
    for (const b of eligible.slice(i + 1)) {
      const a = eligible[i];
      // Angle-angle and the mechanically opposed node pair do not add independent information.
      if (
        (a.kind === "angle" && b.kind === "angle") ||
        ([a.id, b.id].includes("northNode") && [a.id, b.id].includes("southNode"))
      )
        continue;
      const distance = separation(a.longitude, b.longitude);
      for (const type of new Set(settings.enabledAspects)) {
        const angle = ASPECTS[type].angle,
          orb = Math.abs(distance - angle),
          limit = settings.orbs[type];
        if (orb <= limit + 1e-9)
          aspects.push({
            id: `${a.id}-${type}-${b.id}`,
            a: a.id,
            b: b.id,
            type,
            angle,
            separation: distance,
            orb,
            limit,
          });
      }
    }
  return aspects.sort((a, b) => a.orb - b.orb);
}
export function summarize(
  points: ChartPoint[],
  weighting: CalculationSettings["weighting"],
  rulership: CalculationSettings["rulership"],
) {
  const bodies = points.filter((p) => p.kind === "planet" || p.id === "rising");
  const weight = (p: ChartPoint) =>
    weighting === "personal" && ["sun", "moon", "rising"].includes(p.id) ? 2 : 1;
  const scores = (labels: string[], index: (p: ChartPoint) => number) => {
    const counts = labels.map(() => 0);
    for (const p of bodies) {
      const i = index(p);
      if (i >= 0) counts[i] += weight(p);
    }
    const total = counts.reduce((a, b) => a + b, 0);
    return labels.map((label, i) => ({
      label,
      score: counts[i],
      percent: total ? (counts[i] / total) * 100 : 0,
    }));
  };
  const rulers =
    rulership === "traditional"
      ? [
          "Mars",
          "Venus",
          "Mercury",
          "Moon",
          "Sun",
          "Mercury",
          "Venus",
          "Mars",
          "Jupiter",
          "Saturn",
          "Saturn",
          "Jupiter",
        ]
      : [
          "Mars",
          "Venus",
          "Mercury",
          "Moon",
          "Sun",
          "Mercury",
          "Venus",
          "Pluto",
          "Jupiter",
          "Saturn",
          "Uranus",
          "Neptune",
        ];
  const rising = points.find((p) => p.id === "rising")!;
  return {
    elements: scores(["Fire", "Earth", "Air", "Water"], (p) => Math.floor(p.longitude / 30) % 4),
    modalities: scores(["Cardinal", "Fixed", "Mutable"], (p) => Math.floor(p.longitude / 30) % 3),
    polarities: scores(["Yang / outward", "Yin / inward"], (p) => Math.floor(p.longitude / 30) % 2),
    signs: scores(SIGNS, (p) => Math.floor(p.longitude / 30)).sort((a, b) => b.score - a.score),
    houses: scores(
      HOUSE_THEMES.map((_, i) => `House ${i + 1}`),
      (p) => (p.kind === "angle" ? -1 : (p.house ?? 0) - 1),
    ).sort((a, b) => b.score - a.score),
    weighting:
      weighting === "personal"
        ? "Sun, Moon and Rising: 2 each; other planets: 1 each. House scores exclude Rising. Additional points are excluded."
        : "Ten planets and Rising: 1 each. House scores exclude Rising. Additional points are excluded.",
    chartRuler: rulers[Math.floor(rising.longitude / 30)],
  };
}
