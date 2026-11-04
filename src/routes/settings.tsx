import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSettings } from "../lib/settings";
import {
  DEFAULT_SETTINGS,
  POINT_IDS,
  ASPECT_TYPES,
  settingsSchema,
  type CalculationSettings,
} from "../schemas/chart";
import { ASPECTS } from "../lib/astrology";
const NAMES: Record<string, string> = {
  sun: "Sun",
  rising: "Rising",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
  midheaven: "Midheaven",
  chiron: "Chiron",
  lilith: "Lilith",
  northNode: "North Node",
  southNode: "South Node",
  fortune: "Part of Fortune",
  descendant: "Descendant",
  ic: "IC",
};
export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Calculation settings — Mapa" }] }),
  component: SettingsRoute,
});
function SettingsRoute() {
  const { settings, ready } = useSettings();
  return (
    <main className="settings-page">
      <div className="intro">
        <div>
          <p className="eyebrow">MAKE THE METHOD YOURS</p>
          <h1>
            Calculation settings<span>.</span>
          </h1>
          <p>Choose the conventions behind your chart. Every result records the settings used.</p>
        </div>
      </div>
      {ready ? <SettingsForm initial={settings} /> : <p>Loading your settings…</p>}
    </main>
  );
}
function SettingsForm({ initial }: { initial: CalculationSettings }) {
  const { save, storageError } = useSettings();
  const [draft, setDraft] = useState(initial),
    [message, setMessage] = useState("");
  const update = <K extends keyof CalculationSettings>(key: K, value: CalculationSettings[K]) => {
    setDraft((s) => ({ ...s, [key]: value }));
    setMessage("");
  };
  return (
    <form
      className="settings-form"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = settingsSchema.safeParse(draft);
        if (!parsed.success) {
          setMessage("Select at least two points and one aspect, and check your orb values.");
          return;
        }
        save(parsed.data);
        setMessage("Settings saved. Your next chart will use these choices.");
      }}
    >
      <section>
        <p className="section-label">01 / CHART CONVENTIONS</p>
        <h2>The foundation</h2>
        <div className="settings-grid">
          <label>
            House system
            <select
              value={draft.houseSystem}
              onChange={(e) =>
                update("houseSystem", e.target.value as CalculationSettings["houseSystem"])
              }
            >
              <option value="P">Placidus</option>
              <option value="W">Whole sign</option>
              <option value="E">Equal</option>
            </select>
            <small>Placidus may be undefined near polar latitudes.</small>
          </label>
          <label>
            Lunar nodes
            <select
              value={draft.nodeMode}
              onChange={(e) =>
                update("nodeMode", e.target.value as CalculationSettings["nodeMode"])
              }
            >
              <option value="true">True node</option>
              <option value="mean">Mean node</option>
            </select>
            <small>The South Node is opposite the North Node.</small>
          </label>
          <label>
            Black Moon Lilith
            <select
              value={draft.lilithMode}
              onChange={(e) =>
                update("lilithMode", e.target.value as CalculationSettings["lilithMode"])
              }
            >
              <option value="mean">Mean lunar apogee</option>
              <option value="osculating">Osculating lunar apogee</option>
            </select>
            <small>Lilith here is a lunar point, not asteroid 1181.</small>
          </label>
          <label>
            Part of Fortune
            <select
              value={draft.fortuneMode}
              onChange={(e) =>
                update("fortuneMode", e.target.value as CalculationSettings["fortuneMode"])
              }
            >
              <option value="sect">Day / night formula</option>
              <option value="day">Day formula for all charts</option>
            </select>
            <small>Day/night uses the Sun’s geometric altitude.</small>
          </label>
          <label>
            Rulership convention
            <select
              value={draft.rulership}
              onChange={(e) =>
                update("rulership", e.target.value as CalculationSettings["rulership"])
              }
            >
              <option value="traditional">Traditional</option>
              <option value="modern">Modern</option>
            </select>
            <small>Used for chart ruler, domicile and detriment.</small>
          </label>
          <label>
            Cusp proximity notice (degrees)
            <input
              type="number"
              min="0"
              max="5"
              step="0.5"
              required
              value={Number.isNaN(draft.cuspOrb) ? "" : draft.cuspOrb}
              onChange={(e) => update("cuspOrb", e.target.valueAsNumber)}
            />
            <small>Shows proximity to the next house. Never moves a placement.</small>
          </label>
        </div>
      </section>
      <section>
        <p className="section-label">02 / ASPECTS</p>
        <h2>Choose your connections</h2>
        <p className="muted">
          An orb is the allowed distance from an exact angle. Keep the original 6° default, or set a
          different limit for each aspect. These are conventions, not precision controls.
        </p>
        <div className="aspect-settings">
          {ASPECT_TYPES.map((type) => (
            <div className="aspect-setting" key={type}>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={draft.enabledAspects.includes(type)}
                  onChange={(e) =>
                    update(
                      "enabledAspects",
                      e.target.checked
                        ? [...draft.enabledAspects, type]
                        : draft.enabledAspects.filter((t) => t !== type),
                    )
                  }
                />
                {ASPECTS[type].label} <small>{ASPECTS[type].angle}°</small>
              </label>
              <label className="orb-input">
                Orb °
                <input
                  aria-label={`${ASPECTS[type].label} orb`}
                  type="number"
                  step="0.25"
                  min="0"
                  max={
                    ASPECTS[type].angle % 30 === 0 &&
                    ["conjunction", "sextile", "square", "trine", "opposition"].includes(type)
                      ? 12
                      : 5
                  }
                  required
                  value={Number.isNaN(draft.orbs[type]) ? "" : draft.orbs[type]}
                  onChange={(e) =>
                    update("orbs", { ...draft.orbs, [type]: e.target.valueAsNumber })
                  }
                />
              </label>
            </div>
          ))}
        </div>
        <h2>Points included in aspects</h2>
        <div className="point-settings">
          {POINT_IDS.map((id) => (
            <label key={id} className="check-label">
              <input
                type="checkbox"
                checked={draft.aspectPoints.includes(id)}
                onChange={(e) =>
                  update(
                    "aspectPoints",
                    e.target.checked
                      ? [...draft.aspectPoints, id]
                      : draft.aspectPoints.filter((p) => p !== id),
                  )
                }
              />
              {NAMES[id]}
            </label>
          ))}
        </div>
        <p className="muted">
          Angle-to-angle aspects and the North–South Node pair are excluded because they add
          mechanically related connections. Other selected point pairs are included.
        </p>
      </section>
      <section>
        <p className="section-label">03 / SUMMARIES</p>
        <h2>A transparent weighting model</h2>
        <label>
          Distribution and emphasis
          <select
            value={draft.weighting}
            onChange={(e) =>
              update("weighting", e.target.value as CalculationSettings["weighting"])
            }
          >
            <option value="personal">Sun, Moon, Rising ×2; other planets ×1</option>
            <option value="equal">Ten planets and Rising, equally weighted</option>
          </select>
        </label>
        <p className="muted">
          Elements, modalities, polarity and sign emphasis include ten planets and Rising. House
          emphasis includes ten planets. Additional points are excluded. These scores describe the
          chosen model; they are not Astrolink’s proprietary percentages.
        </p>
      </section>
      <div className="settings-actions">
        <button className="generate" type="submit">
          Save settings ↗
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(structuredClone(DEFAULT_SETTINGS));
            setMessage("Defaults restored in the form. Save to apply.");
          }}
        >
          Restore defaults
        </button>
        <Link to="/">Back to chart</Link>
      </div>
      <p role="status">{message}</p>
      {storageError && <p role="alert">{storageError}</p>}
      <p className="muted">
        Saved in this browser only. Tropical zodiac · geocentric positions · Swiss ephemeris files ·
        supported years 1800–2399. Decans are equal 10° subdivisions. Combustion uses 8°30′, cazimi
        17′, and under the beams 17° for Mercury through Saturn.
      </p>
    </form>
  );
}
