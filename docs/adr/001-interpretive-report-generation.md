# ADR 001 — Evidence-grounded, staged report generation

Date: 2026-11-02.
Status: accepted architectural direction; provider selection and framework integration pending validation.
Related: [PRD](../interpretive-reports-prd.md), [handoff](../interpretive-reports-handoff.md).

## Context

Mapa is one TanStack Start/React/TypeScript package using Node 24, Vite/Nitro, Swiss Ephemeris, Zod, REST, generated Hey API clients, and TanStack Query. It runs locally with pnpm and is deployed on Vercel. The existing workspace keeps chart state in memory; there is no report-job database, model integration, or durable generation runner.

The product needs original chapters with independent editorial control and a coherent final edition. One large prompt makes diagnosis and selective regeneration difficult. Independent prompts alone create repetition and inconsistency. Historical mythology introduces a different evidence requirement from symbolic chart interpretation.

## Decision

Keep the existing application and package. Add a deterministic fact adapter and a staged generation service behind server-only boundaries:

1. Validate and freeze the authoritative calculated chart, settings, engine/data provenance, and relevant interpretation conventions.
2. Derive stable, explicit chart facts and select approved knowledge entries in code.
3. Create a shared editorial plan, initially deterministic where practical. Introduce a model planner only if evaluations justify it.
4. Generate independent chapter drafts with bounded concurrency and versioned contracts.
5. Validate and, within configured limits, repair individual failures.
6. Edit the report across chapters while retaining fact/source references and section identity.
7. Revalidate and persist an immutable final edition.

Generation is explicitly requested; it must not run on every form edit or chart refresh. Native calculations remain independent of model availability.

### Model calls and execution

Use Vercel AI SDK for schema-based model outputs with Zod. Schema correctness is necessary but does not prove prose accuracy. Keep provider/model choice configurable and select defaults from an evaluation set; do not hard-code an unbenchmarked model recommendation.

Use a durable runner for saved stage progress, retry/recovery, and observability. Vercel Workflow is the preferred candidate given the hosting choice. Verify compilation, server boundaries, local execution, and deployed execution with the exact TanStack Start/Nitro versions before adopting its integration. Do not silently migrate frameworks or add a separate service to bypass an integration problem. If the spike fails, document the concrete blocker and compare alternatives.

Use managed Postgres for application-owned jobs, snapshots, section revisions, final editions, and evaluation/usage metadata. Workflow execution history does not replace application report storage. Select the provider and migration tooling during implementation; no database has been provisioned by this ADR.

### Proposed server and client boundary

- Proposed `POST /api/reports`: accept a chart reference/input plus editorial configuration, validate ownership, obtain the authoritative server-side chart snapshot, deduplicate, and return a report/job reference promptly. Do not trust arbitrary client-supplied placements.
- Proposed `GET /api/reports/:id`: return authorized status, progress, and the available edition; exclude raw prompts and internal diagnostics from reader responses.
- Start with TanStack Query polling and generated Hey API options. Add streaming only if measured UX needs it.
- Render typed content blocks through application components, not executable generated HTML. Reuse the printable report shell.

These routes and paths are proposals, not existing APIs. Customer access control and persistence/privacy copy must be resolved before making them customer-facing.

### Records and versioning

Conceptual records, subject to migration design:

- Report job: authorized viewer/owner, status, input fingerprint, stage progress, retry budget, timestamps.
- Chart snapshot: schema version, calculated data/settings, calculation provenance, stable fact identifiers.
- Section revision: contract version, source-entry versions, input dependencies, model/configuration, content blocks, fact/source references, validation results, usage and timing.
- Report edition: ordered section revisions, editorial-pass version, final validation, publication status, prior-edition reference.
- Evaluation run: dataset version, configurations compared, automated/human rubric results, cost/latency.

Statuses should distinguish queued, running, validating, editing, completed, and failed; exact enums follow schema design. A terminal failure must preserve completed stages and explain whether retry is possible. A failed final validator cannot produce a published edition.

Fingerprint the canonical chart snapshot, conventions, language/editorial preset, prompt/source/schema versions, and model configuration. Deduplicate within authorized scope and guard concurrent identical requests atomically. Stage dependency hashes allow selective regeneration; a changed section invalidates its editorial merge and final validation. Do not promise byte-for-byte model reproducibility: retain actual outputs and lineage.

Retry transient provider failures with limits and timeouts; semantic repair has its own small attempt budget. Enforce per-stage and per-report token/cost limits. Persist step completion idempotently. Completed stages must not be deliberately rerun merely because a later stage failed. An interrupted external call can still have incurred provider charges; record unknown outcomes and avoid claiming exactly-once billing.

### Knowledge and validation

Keep an initially small curated corpus in Git, with source provenance, approved claims, tradition/context, caveats, and stable identifiers. Select facts by IDs; no live research or vector database initially. Historical evidence and modern symbolic interpretation remain distinct.

Validate output structure, fact/source identifier membership, required coverage, and objective constraints in code. Check semantic prose fidelity and coherence through targeted model checks and calibrated human evaluation; acknowledge that automated checks cannot guarantee zero hallucinations. Block detected chart errors and unsupported historical claims. Validate again after editing.

Keep a shared voice specification plus independent section contracts. Compare full rewriting with lighter editing before selecting the production default. Preserve the original drafts so the experiment is reviewable.

## Alternatives and consequences

| Option                                          | Decision and consequence                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| One prompt for the whole report                 | Rejected as the primary design: low orchestration cost, but poor section-level tuning, diagnosis, and recovery. Useful as an evaluation baseline. |
| Separate prompts without editorial coordination | Rejected: simple parallel generation but weak continuity and repetition control.                                                                  |
| Full editorial rewrite every time               | Candidate, not an assumption. Can improve cohesion but may erase quality, alter facts, and increase cost.                                         |
| Open-ended agent with browsing                  | Deferred: variable runtime/cost and harder source control. Fixed stages fit the known output.                                                     |
| Vector retrieval from day one                   | Deferred: a small identifier-selected corpus is easier to review and sufficient initially.                                                        |
| Separate Python/backend service or monorepo     | Unnecessary for this feature; keep the existing TypeScript application.                                                                           |

The chosen pipeline adds persisted stages, schemas, and evaluation work. In exchange, we gain independent chapter tuning, traceability, selective regeneration, bounded spend, and resumable delivery. It also changes the current privacy model: stored reports and model processors must be disclosed and access-controlled.

## Implementation evidence required

Before treating this direction as production-ready: demonstrate Start/Nitro workflow compatibility locally and on a protected deployment; validate structured generation against actual installed SDK docs; show persistence/recovery and duplicate-request handling; verify unauthorized reads are rejected; measure representative report quality/cost; and preserve the neutral deployed example and ignored local reference.

## Reference documentation

These references support tool capabilities, not a claim that Mapa already integrates them. Recheck version-matched documentation when implementing.

- [AI SDK structured generation](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)
- [Workflow SDK and managed execution](https://github.com/vercel/workflow)
