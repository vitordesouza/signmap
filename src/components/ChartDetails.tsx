import { AstroGlyph } from "./AstroGlyph";
import type { ChartResult, ChartPoint } from "../schemas/chart";
import { ASPECTS, HOUSE_THEMES, sign, degree } from "../lib/astrology";
import { Link } from "@tanstack/react-router";
export function Placements({ chart }: { chart: ChartResult }) {
  const groups: [string, string[]][] = [
    ["Sun, Rising & Moon", ["sun", "rising", "moon"]],
    ["Personal planets", ["mercury", "venus", "mars"]],
    ["Social planets", ["jupiter", "saturn"]],
    ["Outer planets", ["uranus", "neptune", "pluto"]],
    ["Additional points", ["chiron", "lilith", "northNode", "southNode", "fortune"]],
    ["Other angles", ["midheaven", "descendant", "ic"]],
  ];
  return (
    <>
      <p className="muted">
        Rising is the Ascendant, an angle rather than a planet. Positions are tropical and
        geocentric. R means retrograde.
      </p>
      {groups.map(([title, ids]) => (
        <section key={title}>
          <h2>{title}</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Placement</th>
                  <th>Sign & degree</th>
                  <th>House</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {ids.map((id) => {
                  const p = chart.points.find((p) => p.id === id)!;
                  return (
                    <tr key={id}>
                      <th scope="row">
                        <AstroGlyph className="point-glyph" id={p.id} size={18} /> {p.name}
                      </th>
                      <td>
                        {sign(p.longitude)}
                        <small>{degree(p.longitude)}</small>
                      </td>
                      <td>
                        {p.house ?? "—"}
                        {p.nextCusp && (
                          <small>
                            Near house {p.nextCusp}
                            <br />
                            {p.cuspDistance!.toFixed(2)}° away
                          </small>
                        )}
                      </td>
                      <td>
                        {p.kind === "angle"
                          ? "Angle"
                          : p.speed === null
                            ? "Derived point"
                            : p.speed < 0
                              ? "Retrograde"
                              : "Direct"}
                        <small>
                          Decan {p.decan} · {p.conditions.join(" · ") || "—"}
                        </small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <p className="muted">
        Decans divide each sign into three equal 10° sections. Dignities follow{" "}
        {chart.settings.rulership} rulership; exaltations use the seven traditional planets. Cusp
        notices do not reassign houses.
      </p>
    </>
  );
}
export function Houses({ chart }: { chart: ChartResult }) {
  return (
    <>
      <h2>Your twelve houses</h2>
      <p className="muted">
        Each house represents an area of life. A house without planets is still part of your chart.
        Cusp proximity is a notice, not a change in placement.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>House / theme</th>
              <th>Cusp</th>
              <th>Placements</th>
            </tr>
          </thead>
          <tbody>
            {chart.cusps.map((l, i) => (
              <tr key={i}>
                <th scope="row">
                  {i + 1} · {HOUSE_THEMES[i]}
                </th>
                <td>
                  {sign(l)}
                  <small>{degree(l)}</small>
                </td>
                <td>
                  {chart.points
                    .filter((p) => p.house === i + 1)
                    .map((p) => p.name)
                    .join(", ") || "No planets or points"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">
        Rising and Midheaven are independent angles and may differ from house 1 and 10 cusps,
        depending on the house system.
      </p>
    </>
  );
}
export function Aspects({
  chart,
  selected,
  onSelect,
}: {
  chart: ChartResult;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <>
      <h2>{chart.aspects.length} aspects in your chart</h2>
      <p className="muted">
        Sorted by distance from exact alignment, called the orb. Selected bodies, points and limits
        come from <Link to="/settings">Settings</Link>. Select a connection to highlight it on the
        wheel.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Connection</th>
              <th>Aspect</th>
              <th>Orb / limit</th>
            </tr>
          </thead>
          <tbody>
            {chart.aspects.map((a) => (
              <tr key={a.id} className={selected === a.id ? "selected-row" : ""}>
                <td>
                  <button
                    className="aspect-link"
                    aria-pressed={selected === a.id}
                    onClick={() => onSelect(selected === a.id ? null : a.id)}
                  >
                    {chart.points.find((p) => p.id === a.a)!.name} ·{" "}
                    {chart.points.find((p) => p.id === a.b)!.name}
                  </button>
                </td>
                <td>
                  <span style={{ color: ASPECTS[a.type].color }}>●</span> {ASPECTS[a.type].label}
                  <small>{a.angle}° exact angle</small>
                </td>
                <td>
                  {a.orb.toFixed(2)}°<small>within {a.limit}°</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!chart.aspects.length && (
        <p>No aspects match these settings. Adjust the included points or orbs.</p>
      )}
      <p className="muted">
        Angle-to-angle connections and the opposed lunar-node pair are excluded. Other selected
        point pairs are eligible.
      </p>
    </>
  );
}
function Distribution({
  title,
  items,
}: {
  title: string;
  items: { label: string; score: number; percent: number }[];
}) {
  return (
    <section className="distribution">
      <h2>{title}</h2>
      {items.map((s, i) => (
        <div className="distribution-row" key={s.label}>
          <span>{s.label}</span>
          <div className="bar-track">
            <div
              style={{
                width: `${s.percent}%`,
                background: ["#b77e5d", "#809175", "#aa985a", "#7a9a9f"][i % 4],
              }}
            />
          </div>
          <strong>{Math.round(s.percent)}%</strong>
        </div>
      ))}
    </section>
  );
}
export function Overview({ chart, expanded = false }: { chart: ChartResult; expanded?: boolean }) {
  return (
    <>
      <p className="eyebrow">PATTERNS AT A GLANCE</p>
      <h2>The shape of your chart</h2>
      <p className="muted">
        A transparent summary of placements, using the weighting you choose. Percentages describe
        this model, not measured personality traits.
      </p>
      <div className="distributions">
        <Distribution title="Elements" items={chart.summary.elements} />
        <Distribution title="Modalities" items={chart.summary.modalities} />
        <Distribution title="Polarity" items={chart.summary.polarities} />
      </div>
      <div className="summary-facts">
        <p>
          Chart ruler <strong>{chart.summary.chartRuler}</strong>
          <small>
            {sign(chart.points.find((p) => p.id === "rising")!.longitude)} Rising ·{" "}
            {chart.settings.rulership} rulership
          </small>
        </p>
        <p>
          Sect <strong>{chart.metadata.dayChart ? "Day chart" : "Night chart"}</strong>
          <small>Sun {chart.metadata.sunAltitude.toFixed(2)}° above/below geometric horizon</small>
        </p>
      </div>
      <h2>Sign emphasis</h2>
      <div className="score-list">
        {chart.summary.signs
          .filter((s) => s.score > 0)
          .map((s) => (
            <p key={s.label}>
              <span>{s.label}</span>
              <strong>
                {s.score} points · {Math.round(s.percent)}%
              </strong>
            </p>
          ))}
      </div>
      <h2>House emphasis</h2>
      <div className="score-list">
        {chart.summary.houses
          .filter((s) => s.score > 0)
          .map((s) => (
            <p key={s.label}>
              <span>{s.label}</span>
              <strong>
                {s.score} points · {Math.round(s.percent)}%
              </strong>
            </p>
          ))}
      </div>
      <details className="method-note" open={expanded}>
        <summary>How these summaries are calculated</summary>
        <p>{chart.summary.weighting}</p>
        <p>
          Signs map to four elements, three modalities and two polarities. Sign and house emphasis
          simply aggregate those weights; no hidden dignity or aspect bonuses are added. Rounded
          percentages may not total exactly 100%.
        </p>
      </details>
    </>
  );
}
const qualities = [
  "initiative and independence",
  "steadiness and sensory awareness",
  "curiosity and communication",
  "care and belonging",
  "creativity and self-expression",
  "discernment and service",
  "balance and connection",
  "depth and transformation",
  "exploration and meaning",
  "structure and ambition",
  "originality and community",
  "imagination and empathy",
];
const portugueseQualities = [
  "iniciativa e independência",
  "estabilidade e consciência sensorial",
  "curiosidade e comunicação",
  "cuidado e pertença",
  "criatividade e expressão pessoal",
  "discernimento e serviço",
  "equilíbrio e ligação",
  "profundidade e transformação",
  "exploração e significado",
  "estrutura e ambição",
  "originalidade e comunidade",
  "imaginação e empatia",
];
export function Notes({ chart, portuguese }: { chart: ChartResult; portuguese: boolean }) {
  return (
    <>
      <p className="eyebrow">{portuguese ? "NOTAS SIMBÓLICAS" : "BRIEF PLACEMENT NOTES"}</p>
      <h2>{portuguese ? "Uma leitura inicial" : "A starting point for reflection"}</h2>
      <p className="muted">
        {portuguese
          ? "Estas notas breves não constituem uma interpretação detalhada. O restante interface está em inglês."
          : "These are brief sign templates, not a detailed or synthesized interpretation. Expanded interpretations are deferred."}
      </p>
      {chart.points
        .filter((p) => p.kind === "planet" || p.id === "rising")
        .map((p) => (
          <section key={p.id}>
            <h2>
              {p.name} · {sign(p.longitude)}
            </h2>
            <p>
              {portuguese ? "Esta posição simboliza" : "This placement symbolically emphasizes"}{" "}
              {(portuguese ? portugueseQualities : qualities)[Math.floor(p.longitude / 30)]}.{" "}
              {p.house
                ? `${portuguese ? "Casa" : "House"} ${p.house}.`
                : portuguese
                  ? "O Ascendente: a forma como se apresenta ao mundo."
                  : "Rising describes how you meet the world."}
            </p>
          </section>
        ))}
      <p className="muted">
        Astrology is a symbolic tradition and is not scientifically validated as a personality
        assessment or predictive method.
      </p>
    </>
  );
}
export function Technical({ chart }: { chart: ChartResult }) {
  return (
    <>
      <h2>From birth record to chart</h2>
      <ol className="pipeline">
        <li>Open-Meteo resolves the selected place to coordinates and an IANA timezone.</li>
        <li>
          Temporal resolves the local birth date and time with historical timezone rules. Repeated
          clock times require a choice; skipped times are rejected.
        </li>
        <li>
          Swiss Ephemeris converts UTC into Julian days in UT and TT, then computes tropical
          geocentric positions from bundled data files.
        </li>
        <li>
          UT, coordinates and the selected house system define cusps and angles. House membership
          uses longitude within cusp intervals.
        </li>
        <li>
          Selected point pairs are tested against enabled aspect angles and their individual orb
          limits.
        </li>
        <li>
          React renders the SVG wheel; leader lines preserve the true position when labels are
          spaced apart.
        </li>
      </ol>
      <dl className="technical-data">
        {Object.entries({
          Engine: chart.metadata.engine,
          Ephemeris: chart.metadata.ephemeris,
          "UTC instant": chart.metadata.utc,
          "Historical offset": chart.metadata.offset,
          Timezone: chart.location.timezone,
          "Timezone data": chart.metadata.timezoneData,
          Coordinates: `${chart.location.latitude}, ${chart.location.longitude}`,
          "Julian day UT": chart.metadata.julianDayUT,
          "Julian day TT": chart.metadata.julianDayTT,
          "Data revision": chart.metadata.dataRevision,
          "House system": chart.settings.houseSystem,
          "Node convention": chart.settings.nodeMode,
          "Lilith convention": chart.settings.lilithMode,
          "Fortune convention": chart.settings.fortuneMode,
        }).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <h2>Calculation notes</h2>
      {chart.warnings.map((w) => (
        <p className="muted" key={w}>
          {w}
        </p>
      ))}
      <p className="muted">
        Chiron requires the bundled asteroid file. Requested Swiss ephemeris calculations are
        checked for fallback. Birth details are processed in memory, not stored. Swiss Ephemeris
        licensing must be resolved before public distribution.
      </p>
      <details>
        <summary>Settings used for this chart</summary>
        <pre>{JSON.stringify(chart.settings, null, 2)}</pre>
      </details>
    </>
  );
}
export function PrimarySummary({ points }: { points: ChartPoint[] }) {
  return (
    <div className="bigthree">
      {["sun", "rising", "moon"].map((id, i) => {
        const p = points.find((p) => p.id === id)!;
        return (
          <div key={id}>
            <small>
              <AstroGlyph id={p.id} size={12} /> &nbsp; {p.name.toUpperCase()}
            </small>
            <strong>{sign(p.longitude)}</strong>
            <em>{degree(p.longitude)}</em>
            <p>{["Your core identity", "How you meet the world", "Your emotional world"][i]}</p>
          </div>
        );
      })}
    </div>
  );
}
