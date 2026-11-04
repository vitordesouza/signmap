import { createFileRoute, Link } from "@tanstack/react-router";
import { useWorkspace } from "../lib/workspace";
import { ChartReport } from "../components/ChartReport";
export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Your complete natal chart report — Mapa" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReportPage,
});
function ReportPage() {
  const { result, resultName } = useWorkspace();
  if (!result)
    return (
      <main className="report-empty">
        <p className="eyebrow">YOUR REPORT</p>
        <h1>Start with your chart.</h1>
        <p>
          Generate a chart first, then open its complete report. Birth details are kept in memory
          and clear when you reload the page.
        </p>
        <Link to="/">Return to natal chart ↗</Link>
      </main>
    );
  return (
    <main className="report-page">
      <div className="report-toolbar">
        <Link to="/">← Back to chart</Link>
        <span>Complete report · wheel, overview, placements, houses, aspects, and method</span>
        <button
          className="generate"
          onClick={async () => {
            await document.fonts.ready;
            window.print();
          }}
        >
          Print / Save PDF ↗
        </button>
      </div>
      <ChartReport chart={result} name={resultName} />
    </main>
  );
}
