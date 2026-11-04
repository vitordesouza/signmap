# Handoff — implement the two-chapter reading POC

Date: 2026-11-02. Use this entry point for the next thread.

## Copy/paste kickoff

> Work in `/Users/vitorsouza/.t3/projects/mapa`. Read `docs/reading-poc-prd.md`, `docs/adr/002-reading-poc.md`, and `docs/reading-poc-handoff.md`. Implement the protected two-chapter reading POC: Sun-sign draft, ruling-planets draft, then editorial merge, using three logical model calls, versioned prompts/shared voice, reviewed minimal references, server-derived facts, Zod output validation, usage/timing metadata, and a rendered Generate reading UI. Keep everything in the current TypeScript application. No database, durable workflow, accounts, background jobs, full seven-chapter scope, or paid infrastructure provisioning. Use pnpm, Oxlint/Oxfmt, and generated Hey API/TanStack Query helpers for REST. Preserve the neutral deployed example, ignored local prefill, existing chart calculations and technical report. Inspect code before editing, verify the rendered UI, and distinguish mocked checks from actual provider and hosted verification. Treat the complete-version docs as future context; their durable-workflow spike is not part of this POC. Make reversible progress autonomously and surface only genuinely blocking decisions or credentials. Do not deploy or commit as an incidental step.

## Read order and scope authority

1. [POC PRD](reading-poc-prd.md): current product scope and acceptance criteria.
2. [ADR 002](adr/002-reading-poc.md): request-scoped execution and accepted tradeoffs.
3. [README](../README.md): application commands and architecture.
4. [Complete PRD](interpretive-reports-prd.md) and [ADR 001](adr/001-interpretive-report-generation.md): future destination only.

The [earlier full-version handoff](interpretive-reports-handoff.md) is preserved for later. Do not follow its workflow-spike/persistence sequence for this experiment. Nothing in these POC documents is a claim that generation has already been implemented.

## Repository baseline to verify

- One package: TanStack Start, React, TypeScript, Node 24, Vite/Nitro, Swiss Ephemeris (`sweph`), Temporal, and Zod.
- REST contracts generate OpenAPI plus Hey API clients and TanStack Query helpers. pnpm is required; Oxlint/Oxfmt are the established tooling.
- Nineteen chart points, configurable aspects/houses/rulership, summaries, vector wheel, exports, and a printable technical report exist. Existing short placement notes are not generated readings.
- No AI SDK, model integration, report database, or workflow runner was present when this handoff was written. Recheck actual state before changing dependencies.
- Start locally with `pnpm dev` at `http://localhost:5174`; the obsolete Flask command must not be revived. Identify an occupying process before stopping it.
- Production `https://mapa-boomich.vercel.app` is Vercel Authentication protected. Confirm protection covers the new endpoint before hosted generation testing. It is not customer report ownership.
- The last recorded application baseline passed 23 tests plus type/lint/format, Vercel build, and isolated artifact checks. Rerun checks relevant to implementation; this is historical evidence.
- Much of the project is untracked in Git. Inspect `git status`; preserve existing work and do not assume it has been committed.

## Files to inspect

| File                                              | Relevance                                                               |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/schemas/chart.ts`                            | Birth/calculation request, settings, chart response, provenance         |
| `src/server/chart.ts`, `src/lib/astrology.ts`     | Calculation and deterministic conventions; reuse rather than ask models |
| `src/routes/api.chart.ts`                         | Existing server-route/error style                                       |
| `scripts/openapi.ts`, `openapi-ts.config.ts`      | Add the reading API contract and regenerate clients                     |
| `src/routes/index.tsx`, `src/lib/workspace.tsx`   | Generate action, chart/result state, late-result handling               |
| `src/components/ChartReport.tsx`, `src/style.css` | Presentation idioms and design tokens; avoid unnecessary redesign       |
| `scripts/local-birth-data.ts`                     | Development-only private prefill boundary                               |
| `vite.config.ts`, `vercel.json`, `package.json`   | Real framework/deployment/runtime constraints                           |
| `tests/`, `scripts/verify-artifact.ts`            | Current verification and packaging patterns                             |

Suggested additions: a report/reading schema, a small server-only reading module with fact adapter and three stage functions, three prompt files/shared voice, reviewed references, a reading component, and neutral fixtures. Match actual local naming; do not create a new package or orchestration abstraction.

## Implementation sequence

1. Inspect current code and instructions. Define the endpoint/input/output contracts and a few neutral evaluation cases. Include same/different rulers and traditional/modern conventions.
2. Implement and test the deterministic fact adapter: Sun/Moon/Rising context, relevant placements/aspects, Sun-sign ruler, chart ruler, and ruled versus occupied houses. Return stable identifiers and an input fingerprint. The server calculates the chart from validated inputs; browser-provided longitudes are not authoritative.
3. Add reviewed minimum reference material and versioned chapter/editor prompts plus shared voice. Keep an explicitly labeled English internal preset initially; do not imply output-language coverage exists.
4. Select a configurable model/provider and verify its installed SDK APIs, structured-output support, pricing, credentials, and data handling. Use an available authorized credential mechanism; never ask for a key pasted into chat or commit one. If credentials are unavailable, continue contracts, adapter, mocks, and UI; report live generation as blocked/unverified.
5. Add the request-scoped three-call pipeline with time/output limits, bounded provider retries, validation before/after editing, sanitized failures, safe usage logs, and no model repair/critic loop. Disable automatic client retries. Preserve drafts only in memory for development comparison.
6. Wire the generated Query mutation and UI: explicit button, stable loading, error/retry, final reading, and memory-only notice. Handle chart changes and obsolete responses. Update privacy copy for model processing. No generation on every chart edit.
7. Review real readings on about five neutral charts, compare raw/edited versions, measure usage and duration, and verify the deployment timeout/protection if a deployment is explicitly undertaken. If runtime cannot fit, document the blocker instead of adding infrastructure silently.

## Privacy and local reference

`output/private/birth-draft.json` restores the owner's details only in development. Other files under `output/private/` and supplied exports under `prompt-files/` are ignored by Git/Vercel. Do not copy those values into committed fixtures, prompts, knowledge files, logs, or deployment assets. Production remains neutral. Use neutral charts for provider tests and screenshots.

The model needs derived chart facts, not email, name, gender, or raw birth date/time/location. Routine logs must not contain chart facts or generated content. Local/browser-only application storage does not establish zero retention at the model provider. Confirm and describe the selected provider's handling honestly.

## Required verification and handback

- `pnpm generate` after API contract changes; never hand-edit generated clients.
- `pnpm check`; meaningful tests for fact mapping/rulership, malformed/unsupported output, stage failure/timeout, and obsolete result handling.
- `pnpm build:vercel` and `pnpm verify:artifact` for changed server dependencies/packaging. A local artifact check is not hosted verification.
- View the actual rendered page and exercise real success and failure paths. Mocked model output proves wiring, not content quality.
- Check no credentials/private values enter the client artifact. Keep the billable endpoint protected and budgets finite; UI click prevention alone does not enforce server spending.
- Report what is implemented, actual provider versus mocked runs, draft/editor observations, measured usage/cost and timing, and any unverified hosting behavior. Do not claim the full product is complete.

No fixed word count, provider/model, dollar budget, or latency SLA has been approved. Choose conservative configurable values for an internal experiment, state them, and evaluate. If the editor does not improve the drafts, retain the evidence and recommend simplifying it. The next product step is saved, authorized, recoverable reports only after this experiment establishes useful writing.
