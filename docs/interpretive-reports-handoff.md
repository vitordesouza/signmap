# Handoff — begin original interpretive reports

Prepared: 2026-11-02. This file is the entry point for a fresh implementation thread.

## Copy/paste kickoff

> Work in `/Users/vitorsouza/.t3/projects/mapa`. Read `docs/interpretive-reports-prd.md`, `docs/adr/001-interpretive-report-generation.md`, and this handoff before editing. Implement the first vertical slice: a chart-grounded Sun-sign chapter with a versioned prompt contract, reviewed minimum knowledge entries, structured output, validation, usage tracking, and an internal preview. Start by verifying the proposed durable workflow integration against the exact TanStack Start/Nitro versions; do not change frameworks to work around a problem silently. Keep the implementation lean and proceed with reversible implementation work. Use pnpm, TypeScript, Oxlint/Oxfmt, Zod, and generated TanStack Query clients for REST. Preserve existing chart/report functionality, neutral production defaults, and the ignored local personal prefill. Explicitly distinguish implemented behavior, mocked/development behavior, and remaining production gates. Ask only for decisions or credentials that actually block the next concrete step. Do not start the full seven-chapter product or deploy paid infrastructure as an incidental part of this slice.

## Source of truth

- [PRD](interpretive-reports-prd.md): reader promise, chapter scope, acceptance criteria, quality/business measures, privacy, rollout.
- [ADR 001](adr/001-interpretive-report-generation.md): pipeline, boundaries, versioning, durability, alternatives and integration gates.
- [README](../README.md): current application commands and architecture.
- [Reconciliation](reconciliation.md): chart comparison, vector rendering, printable report and prior hosted verification.
- [Earlier gap analysis](astrolink-gap-analysis.md): historical scope/background; current code and later documentation take precedence on completion status.

These generation documents record an agreed plan, not an implemented feature. Resolve product changes in the PRD and architecture changes in the ADR rather than relying on chat history.

## Verified repository baseline at handoff

- One package; TanStack Start/React/TypeScript, Node 24, Vite 8/Nitro 3 RC, native `sweph` with bundled ephemeris files, Temporal, Zod.
- REST contracts generate OpenAPI and Hey API Fetch/Query helpers. React uses TanStack Query.
- Chart engine produces nineteen placements, houses, configurable aspects, summaries, provenance, and warnings. Existing placement notes are not this planned generation system.
- Vector chart glyphs and the full technical `/report` printable view already exist. Workspace results are currently in memory; direct refresh of `/report` does not restore a saved report.
- No AI SDK, workflow runner, database, customer report ownership, or original long-form generation is implemented as of this handoff. Verify package/code state on resumption.
- Production URL: `https://mapa-boomich.vercel.app`; protected by Vercel Authentication. This protection is not per-customer ownership.
- The last completed local checks passed 23 tests plus type, lint, formatting, Vercel build, and isolated artifact checks. This is historical evidence, not a substitute for checking changes in the new thread.
- Much of the application is currently untracked in Git. Inspect `git status`; do not discard files or assume the current baseline is committed. No commit or deployment is requested by this documentation task.

## Local operation and privacy

Run `pnpm install` when needed, then `pnpm dev`; the application is at `http://localhost:5174`. Do not revive the obsolete Flask command. Node 24 is pinned through package/Volta and the local `.npmrc`; Vercel excludes `.npmrc` and uses its Node project/engine setting.

`output/private/birth-draft.json` restores the owner's profile only during development through `scripts/local-birth-data.ts`. `output/private/reference-input.json` and the local exports support reconciliation. Do not copy any of these values into fixtures, prompts, documentation, logs, or deployment assets. `output/` and `prompt-files/` are ignored by Git and Vercel. Deployed defaults remain neutral.

Development watching ignores generated clients and build/report output to prevent accidental reloads during artifact production. After deliberate generated API changes, restart the development server if necessary to load the new client. Do not kill an unrelated process if port 5174 is occupied; identify it first.

## Read these implementation seams

| File                                                      | Why it matters                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/schemas/chart.ts`                                    | Authoritative chart/settings contracts and calculation provenance.                    |
| `src/server/chart.ts`, `src/lib/astrology.ts`             | Existing calculated/derived facts; reuse these conventions rather than model guesses. |
| `src/routes/api.chart.ts`                                 | Current server-route style and error handling.                                        |
| `scripts/openapi.ts`, `openapi-ts.config.ts`              | Add REST contracts here, then regenerate rather than hand-edit clients.               |
| `src/lib/workspace.tsx`, `src/routes/index.tsx`           | Current state lifecycle and chart-generation interaction.                             |
| `src/components/ChartReport.tsx`, `src/routes/report.tsx` | Existing presentation/print integration.                                              |
| `vite.config.ts`, `vercel.json`, `package.json`           | Actual framework integration and deployment constraints.                              |
| `tests/` and `scripts/verify-artifact.ts`                 | Existing verification patterns and production/private-prefill isolation checks.       |

Suggested new areas, not existing files: `src/server/reports/`, `src/schemas/report.ts`, a versioned prompt directory, reviewed knowledge entries, and a neutral evaluation dataset. Adapt names to existing idioms; avoid an unnecessary monorepo or separate backend.

## First implementation sequence

1. Inspect the working tree and relevant instructions. Confirm the chart schema and baseline commands.
2. Run a minimal workflow compatibility spike against the installed Start/Nitro stack. Read the actual installed SDK docs; validate local and protected cloud execution before claiming compatibility. Record a specific blocker if deployment/auth/credentials prevent verification. A development-only harness can enable independent content work but is not proof of production durability.
3. Define the report input/fact adapter, Sun-sign section schema, editorial preset, prompt contract, and reviewed source entries. Keep interpretation of Sun/house/aspects distinct from calculated facts. Include Moon/Rising context without expanding into seven chapters.
4. Build an injectable generator so deterministic tests can cover validation and failure behavior without model spend. Use a real model on a few neutral charts for content review; synthetic outputs alone do not establish writing quality.
5. Implement the saved stage/provenance and internal preview. Provisioning managed services, model credentials, report access/retention, and production storage need concrete choices; surface those when required. Reuse authorized existing resources if available. Never embed keys in source.
6. Validate chart references, semantic fidelity, required topics, tone, controlled repair, and usage/cost reporting. Preserve the original chart flow and technical report when generation fails.
7. Render and inspect the actual preview, record measured quality/cost, and report limitations. Follow with ruling planets and editorial merge only after the first slice is reviewable.

Use the PRD's slice acceptance criteria. A real first slice is not complete merely because a provider returns prose or a JSON schema validates.

## Decisions to preserve

- The model writes interpretations; application code calculates astronomy and explicit chart facts.
- Sun-sign ruler and Rising-derived chart ruler can differ. Respect the selected traditional/modern rulership convention.
- A planet's occupied house is different from the houses it rules.
- Do not infer the reader's current behavior from a natal chart; use reflection questions.
- Historical mythology is reviewed and sourced; symbolic connections are identified as interpretation. No forced Greek/Egyptian equivalence.
- Independent prompts share an editorial plan. Editing retains evidence and is followed by validation.
- Compare whole-report rewriting with lighter editing; neither has been proven superior yet.
- Version prompts, source entries, schemas, model configuration, and final editions; cache/deduplicate only within authorized scope.
- Keep retry/cost budgets finite. Persistence changes the current privacy promise and must be accompanied by updated copy and access controls.

## Open decisions, not reasons to stop all progress

The owner will expand chapter briefs. Initial language/dialect, provider/model, target budgets, database/migration tooling, access/recovery, retention, and mythology reviewers remain open. Use a clearly labeled internal English preset for the initial neutral test harness if needed; do not advertise language coverage or select a paid provider plan without evidence/authorization. Model benchmarks should determine defaults.

No detailed mythology corpus or final numerical quality/latency/margin thresholds have been approved. Work on the fact adapter, contracts, fixtures, and integration spike can proceed independently of those choices.

## Verification and completion report

- Run `pnpm check` for the change and `pnpm generate` for REST contract changes.
- Run `pnpm build:vercel` and `pnpm verify:artifact` when server dependencies, build integration, or packaging change. Artifact execution is local; it does not prove hosted Linux execution.
- Add meaningful tests for fact mapping, invalid/unsupported claims, bounded repair, deduplication/recovery, and access control as those capabilities are implemented.
- Verify visible changes rendered in the browser. Use neutral evaluation data; keep private screenshots/artifacts in ignored `output/`.
- Separate live provider tests from deterministic tests; include actual usage/cost observations and any unverified behavior in the handback.
- Do not expose a generation endpoint with billable model access to anonymous callers without appropriate authorization/rate/spend controls.
- Summarize what changed, how it was verified, and remaining product/infrastructure choices. Keep the documentation synchronized with implementation status.
