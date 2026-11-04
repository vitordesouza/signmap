import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { calculateChartMutation } from "../generated/@tanstack/react-query.gen";
import { useSettings } from "../lib/settings";
import { useWorkspace } from "../lib/workspace";
import { BirthForm } from "../components/BirthForm";
import { ChartWheel } from "../components/ChartWheel";
import {
  Aspects,
  Houses,
  Notes,
  Overview,
  Placements,
  PrimarySummary,
  Technical,
} from "../components/ChartDetails";
import { ASPECTS } from "../lib/astrology";
import type { ChartRequest } from "../schemas/chart";
import { ReadingPanel } from "../components/ReadingPanel";
const TABS = [
  "Chart wheel",
  "Overview",
  "Placements",
  "Houses",
  "Aspects",
  "Placement notes",
  "Technical details",
] as const;
type Tab = (typeof TABS)[number];
export const Route = createFileRoute("/")({ component: ChartPage });
function ChartPage() {
  const { settings, ready: settingsReady } = useSettings(),
    {
      draft,
      result,
      setResult,
      resultName,
      setResultName,
      ready: workspaceReady,
      readingInput,
      setReadingInput,
    } = useWorkspace();
  const ready = settingsReady && workspaceReady;
  const [tab, setTab] = useState<Tab>("Chart wheel"),
    [showAspects, setShowAspects] = useState(true),
    [showExtra, setShowExtra] = useState(true),
    [selected, setSelected] = useState<string | null>(null),
    [error, setError] = useState(""),
    [ambiguous, setAmbiguous] = useState<{
      body: ChartRequest;
      name: string;
      choices: { choice: "earlier" | "later"; utc: string; offset: string }[];
    } | null>(null);
  const initialized = useRef(false);
  const { mutate, isPending } = useMutation(calculateChartMutation());
  const run = useCallback(
    (body: ChartRequest, name: string) => {
      setError("");
      setAmbiguous(null);
      mutate(
        { body },
        {
          onSuccess: (data) => {
            setResult(data);
            setReadingInput(body);
            setResultName(name);
            setSelected(null);
          },
          onError: (failure) => {
            setError(
              failure?.error ?? "Unable to reach the calculation service. Please try again.",
            );
            if (failure?.choices) setAmbiguous({ body, name, choices: failure.choices });
          },
        },
      );
    },
    [mutate, setResult, setResultName, setReadingInput],
  );
  const generate = useCallback(() => {
    if (!draft.place) {
      setError("Choose your birth city from the search results first.");
      document.getElementById("location")?.focus();
      return;
    }
    run(
      {
        date: draft.date,
        time: draft.time,
        locationId: draft.place.id,
        timeChoice: "reject",
        settings,
      },
      draft.name,
    );
  }, [draft, settings, run]);
  // Bootstrap the example only after browser preferences have hydrated.
  /* oxlint-disable react/set-state-in-effect */
  useEffect(() => {
    if (ready && !initialized.current) {
      initialized.current = true;
      if (!result) generate();
    }
  }, [ready, result, generate]);
  /* oxlint-enable react/set-state-in-effect */
  const settingsChanged = result && JSON.stringify(result.settings) !== JSON.stringify(settings);
  const exportSvg = () => {
    const svg = document.getElementById("natal-wheel");
    if (!svg) return;
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "mapa-natal-chart.svg";
    link.click();
    URL.revokeObjectURL(url);
  };
  const exportJson = () => {
    if (!result) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "mapa-chart-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <main>
      <div className="intro">
        <div>
          <p className="eyebrow">YOUR SKY. YOUR COORDINATES.</p>
          <h1>
            A map of your beginning<span>.</span>
          </h1>
          <p>
            A precise snapshot of the sky at the moment you arrived.
            <br />
            Explore the placements and connections within.
          </p>
        </div>
        <div className="stamp">
          ✧
          <small>
            AS ABOVE
            <br />
            SO BELOW
          </small>
        </div>
      </div>
      <div className="workspace">
        <BirthForm
          key={workspaceReady ? "ready" : "loading"}
          pending={isPending || !ready}
          onGenerate={generate}
          onEdit={() => {
            setError("");
            setAmbiguous(null);
          }}
          error={error}
          choices={ambiguous?.choices}
          onChoice={(choice) => {
            if (ambiguous) run({ ...ambiguous.body, timeChoice: choice }, ambiguous.name);
          }}
        />
        <section className="result" aria-busy={isPending}>
          <div className="result-head">
            <div>
              <p className="eyebrow">THE SKY AT YOUR FIRST BREATH</p>
              <h2>
                {result ? resultName : "Your natal chart"} <span>/ Natal chart</span>
              </h2>
              <p className="muted">
                {result
                  ? `${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: result.location.timezone }).format(new Date(result.metadata.utc))} · ${result.location.name}, ${result.location.country}`
                  : "Your chart will appear here."}
              </p>
            </div>
            <div className="export-actions">
              <button
                disabled={!result || tab !== "Chart wheel"}
                title="Open the chart wheel to export SVG"
                onClick={exportSvg}
              >
                ↓ SVG
              </button>
              <button disabled={!result} onClick={exportJson}>
                ↓ Data
              </button>
              {result ? (
                <Link className="report-link" to="/report">
                  Report ↗
                </Link>
              ) : (
                <button disabled>Report ↗</button>
              )}
            </div>
          </div>
          {result ? (
            <>
              <PrimarySummary points={result.points} />
              {readingInput && (
                <ReadingPanel key={JSON.stringify(readingInput)} input={readingInput} />
              )}
              {settingsChanged && (
                <div className="settings-notice">
                  <p>Settings have changed. This chart still shows its previous calculation.</p>
                  <button disabled={isPending} onClick={generate}>
                    Apply settings to chart
                  </button>
                </div>
              )}
              <div className="tabs" role="tablist" aria-label="Chart sections">
                {TABS.map((t) => (
                  <button
                    key={t}
                    role="tab"
                    id={`tab-${TABS.indexOf(t)}`}
                    aria-selected={tab === t}
                    tabIndex={tab === t ? 0 : -1}
                    onKeyDown={(e) => {
                      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
                      e.preventDefault();
                      const index =
                        e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? TABS.length - 1
                            : (TABS.indexOf(t) + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) %
                              TABS.length;
                      setTab(TABS[index]);
                      document.getElementById(`tab-${index}`)?.focus();
                    }}
                    aria-controls="chart-panel"
                    className={tab === t ? "selected" : ""}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div
                id="chart-panel"
                className="panel"
                role="tabpanel"
                aria-labelledby={`tab-${TABS.indexOf(tab)}`}
              >
                {tab === "Chart wheel" && (
                  <>
                    <div className="chart-tools">
                      <span>
                        TROPICAL ·{" "}
                        {
                          { P: "PLACIDUS", W: "WHOLE SIGN", E: "EQUAL" }[
                            result.settings.houseSystem
                          ]
                        }
                      </span>
                      <label>
                        <input
                          type="checkbox"
                          checked={showAspects}
                          onChange={(e) => setShowAspects(e.target.checked)}
                        />{" "}
                        Aspects
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={showExtra}
                          onChange={(e) => setShowExtra(e.target.checked)}
                        />{" "}
                        Extra points
                      </label>
                      <Link to="/settings">Configure ↗</Link>
                    </div>
                    <div id="wheel">
                      <ChartWheel
                        chart={result}
                        showAspects={showAspects}
                        showExtra={showExtra}
                        selected={selected}
                      />
                    </div>
                    <div className="legend">
                      <span>● Fire</span>
                      <span>● Earth</span>
                      <span>● Air</span>
                      <span>● Water</span>
                    </div>
                    <div className="aspect-legend">
                      {result.settings.enabledAspects.map((type) => (
                        <span key={type}>
                          <i style={{ background: ASPECTS[type].color }} />
                          {ASPECTS[type].label}
                        </span>
                      ))}
                    </div>
                    <p className="wheel-help">
                      Leader lines connect spaced labels to their exact positions.
                    </p>
                    {selected && (
                      <button onClick={() => setSelected(null)}>Clear selected aspect</button>
                    )}
                    <p className="muted">
                      {result.aspects.length} aspects using your settings.{" "}
                      <button className="text-button" onClick={() => setTab("Aspects")}>
                        Explore connections ↗
                      </button>
                    </p>
                  </>
                )}
                {tab === "Overview" && <Overview chart={result} />}
                {tab === "Placements" && <Placements chart={result} />}
                {tab === "Houses" && <Houses chart={result} />}
                {tab === "Aspects" && (
                  <Aspects
                    chart={result}
                    selected={selected}
                    onSelect={(id) => {
                      setSelected(id);
                      if (id) {
                        setShowAspects(true);
                        setTab("Chart wheel");
                      }
                    }}
                  />
                )}
                {tab === "Placement notes" && (
                  <Notes chart={result} portuguese={draft.language.startsWith("Português")} />
                )}
                {tab === "Technical details" && <Technical chart={result} />}
              </div>
              <div className="note">
                <span>✧</span>
                <p>
                  A chart is a starting point, not a destination.
                  <br />
                  <small>
                    Use astrology as a language for reflection, not a prediction of your future.
                  </small>
                </p>
              </div>
            </>
          ) : (
            <div className="empty-chart" role="status">
              <span>✳</span>
              <h2>
                {isPending ? "Finding your sky…" : "Your chart starts with your birth details."}
              </h2>
              <p>
                {error
                  ? "Check the message in the birth form and try again."
                  : "The example birth details are ready to explore."}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
