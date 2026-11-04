import { ChartWheel } from "./ChartWheel";
import { Overview, PrimarySummary } from "./ChartDetails";
import { AstroGlyph } from "./AstroGlyph";
import { ASPECTS, HOUSE_THEMES, degree, sign } from "../lib/astrology";
import type { ChartResult } from "../schemas/chart";
export function ChartReport({ chart, name }: { chart: ChartResult; name: string }) {
  const local = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: chart.location.timezone,
  }).format(new Date(chart.metadata.utc));
  const houses = { P: "Placidus", W: "Whole sign", E: "Equal" };
  return (
    <article className="chart-report">
      <section className="report-cover">
        <div className="report-masthead">
          <span>✳ mapa</span>
          <span>YOUR NATAL CHART</span>
        </div>
        <p className="eyebrow">A MAP OF YOUR BEGINNING</p>
        <h1>{name}</h1>
        <p className="report-birth">
          {local}
          <br />
          {chart.location.name}, {chart.location.country} · UTC{chart.metadata.offset}
        </p>
        <PrimarySummary points={chart.points} />
        <div className="report-wheel">
          <ChartWheel chart={chart} showAspects showExtra selected={null} id="report-wheel" />
        </div>
        <p className="report-caption">
          Tropical zodiac · {houses[chart.settings.houseSystem]} houses · {chart.aspects.length}{" "}
          aspects
          <br />
          Spaced glyphs connect to their exact positions with leader lines.
        </p>
        <p className="report-reflection">
          A chart is a starting point, not a destination.
          <br />
          Use astrology as a language for reflection, not a prediction of your future.
        </p>
      </section>
      <section className="report-chapter">
        <p className="eyebrow">01 / OVERVIEW</p>
        <Overview chart={chart} expanded />
      </section>
      <section className="report-chapter">
        <p className="eyebrow">02 / PLACEMENTS</p>
        <h2>Sun, Rising, Moon, and the rest of your sky</h2>
        <p className="muted">
          All positions use the tropical zodiac. Rising and the other angles do not receive a house
          assignment. Decans divide each sign into three equal 10° sections.
        </p>
        <table className="report-placements">
          <thead>
            <tr>
              <th>Placement</th>
              <th>Sign & position</th>
              <th>House</th>
              <th>Motion / conditions</th>
            </tr>
          </thead>
          <tbody>
            {chart.points.map((p) => (
              <tr key={p.id}>
                <th scope="row">
                  <AstroGlyph id={p.id} size={15} />
                  {p.name}
                </th>
                <td>
                  {sign(p.longitude)}
                  <small>{degree(p.longitude)}</small>
                </td>
                <td>
                  {p.house ?? "—"}
                  {p.nextCusp && (
                    <small>
                      Near {p.nextCusp}
                      <br />
                      {p.cuspDistance!.toFixed(2)}°
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
                    Decan {p.decan}
                    {p.conditions.length ? ` · ${p.conditions.join(" · ")}` : ""}
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">
          House proximity notices do not reassign placements. Domicile/detriment use{" "}
          {chart.settings.rulership} rulership. Exaltation/fall use traditional assignments.
          Combustion conditions apply to Mercury through Saturn: cazimi within 17′, combust within
          8°30′, under the beams within 17°.
        </p>
      </section>
      <section className="report-chapter">
        <p className="eyebrow">03 / HOUSES</p>
        <h2>The twelve areas of life</h2>
        <table>
          <thead>
            <tr>
              <th>House / theme</th>
              <th>Cusp</th>
              <th>Occupants</th>
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
        <p className="muted">
          A house without planets is still part of your chart. Rising and Midheaven are independent
          angles and can differ from the first and tenth house cusps in some house systems.
        </p>
        <h2>Calculation conventions</h2>
        <dl className="report-conventions">
          {Object.entries({
            "House system": houses[chart.settings.houseSystem],
            "Lunar nodes": chart.settings.nodeMode,
            "Black Moon Lilith":
              chart.settings.lilithMode === "mean"
                ? "Mean lunar apogee"
                : "Osculating lunar apogee",
            "Part of Fortune":
              chart.settings.fortuneMode === "sect"
                ? "Day / night formula"
                : "Day formula for all charts",
            Rulership: chart.settings.rulership,
            "Cusp notice": `${chart.settings.cuspOrb}°`,
          }).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="muted">
          Fortune uses ASC + Moon − Sun by day, and ASC + Sun − Moon at night when the day/night
          convention is selected. Day/night uses the Sun’s geometric altitude at sea level, without
          refraction or terrain.
        </p>
      </section>
      <section className="report-chapter">
        <p className="eyebrow">04 / ASPECTS</p>
        <h2>{chart.aspects.length} connections in your chart</h2>
        <p className="muted">
          Sorted by smallest orb first. The orb is the distance from an exact aspect angle.
          Angle-to-angle connections and the opposed lunar-node pair are excluded.
        </p>
        <table className="report-aspects">
          <thead>
            <tr>
              <th>Connection</th>
              <th>Aspect</th>
              <th>Orb</th>
              <th>Limit</th>
            </tr>
          </thead>
          <tbody>
            {chart.aspects.map((a) => (
              <tr key={a.id}>
                <th scope="row">
                  {chart.points.find((p) => p.id === a.a)!.name} ·{" "}
                  {chart.points.find((p) => p.id === a.b)!.name}
                </th>
                <td>
                  {ASPECTS[a.type].label} ({a.angle}°)
                </td>
                <td>{a.orb.toFixed(2)}°</td>
                <td>{a.limit}°</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!chart.aspects.length && <p>No connections match the selected rules.</p>}
      </section>
      <section className="report-chapter report-method">
        <p className="eyebrow">05 / METHOD & PROVENANCE</p>
        <h2>The information behind this report</h2>
        <p>
          The selected city resolves to coordinates and an IANA timezone. Historical timezone rules
          convert the recorded local time to UTC. Swiss Ephemeris converts UTC to UT and TT Julian
          days, then computes positions, angles, and house cusps from bundled data files. House
          membership uses ecliptic longitude within cusp intervals.
        </p>
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
            "Calculation schema": `v${chart.metadata.settingsVersion}`,
            Sect: `${chart.metadata.dayChart ? "Day" : "Night"} chart · Sun altitude ${chart.metadata.sunAltitude.toFixed(3)}°`,
          }).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <h2>Aspect rules</h2>
        <p>
          {chart.settings.enabledAspects
            .map((t) => `${ASPECTS[t].label}: ${chart.settings.orbs[t]}°`)
            .join(" · ")}
        </p>
        <p>
          <strong>Eligible placements:</strong>{" "}
          {chart.settings.aspectPoints
            .map((id) => chart.points.find((p) => p.id === id)!.name)
            .join(", ")}
          .
        </p>
        <h2>Summary model and limitations</h2>
        <p>{chart.summary.weighting}</p>
        {chart.warnings.map((w) => (
          <p key={w}>{w}</p>
        ))}
        <p>
          Astrology is a symbolic tradition, not a scientifically validated personality assessment
          or predictive method. This report presents placements and summaries; detailed
          interpretations remain outside its scope. Historical timezone records and boundaries,
          especially before 1970, may need independent verification.
        </p>
        <p className="report-end">MAPA · A map of your beginning.</p>
      </section>
    </article>
  );
}
