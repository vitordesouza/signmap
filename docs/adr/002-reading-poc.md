# ADR 002 — Request-scoped two-chapter POC

Date: 2026-11-02.
Status: accepted and implemented and verified with neutral actual-provider and hosted tests; partner editorial review pending.
Related: [POC PRD](../reading-poc-prd.md), [handoff](../reading-poc-handoff.md).
Future architecture: [ADR 001](001-interpretive-report-generation.md).

## Context and precedence

The complete report design deliberately includes durable execution, application persistence, reviewed source material, independent chapters, and a final editor. Before investing in delivery infrastructure, we need evidence that the writing workflow produces a useful reading.

ADR 001 remains the complete-version direction. This ADR temporarily replaces its execution and persistence requirements for the smaller experiment; it does not declare durable delivery unnecessary for the future product.

## Decision

Keep one TypeScript application and the current TanStack Start server routes. Add a request-scoped pipeline using Vercel AI SDK and Zod for structured generation. Verify APIs against the actual installed SDK documentation during implementation.

Proposed flow:

1. `POST /api/reading` accepts a validated existing chart request and an explicitly supported reading preset, not arbitrary prompts or trusted browser placements.
2. Calculate the chart server-side with the existing engine and settings, derive a minimal fact bundle and stable fact IDs, then select the reviewed reference entries in code.
3. Generate Sun-sign and ruling-planets drafts using separate prompt contracts and a shared voice. Both calls can run concurrently with a fixed concurrency of at most two.
4. Validate both drafts. If either fails, return a sanitized failure; cancel remaining work where possible.
5. Send approved drafts and necessary supporting facts to the editor. It returns ordered chapters, introduction, and conclusion while preserving evidence references.
6. Validate the final output and return the reading, chart-input fingerprint, prompt/reference/schema versions, model identifier, and safe usage/timing metadata. Development review may also return drafts.

Three logical generation calls per successful attempt; no additional model critic, planner, semantic-repair loop, tool use, or browsing. Transport retries must be explicitly bounded and included in the spend budget; three logical calls is not a guarantee of three billable provider attempts.

## Storage and client behavior

Do not add a database or workflow package. Run the pipeline in the HTTP request, with an application deadline within the verified hosting limit, bounded output, and cancellation propagation where supported. If measured execution cannot fit the target deployment, reduce the workload or record the blocker; do not silently add durable infrastructure.

Use a generated TanStack Query mutation with automatic client retries disabled for this billable endpoint. Disable duplicate submissions while pending. Store the result in existing in-memory client state; refresh loses it. A manual retry restarts the full pipeline and may incur cost again. Page closure or request cancellation does not guarantee provider billing stops.

Capture the input snapshot when generation starts. Associate results with that snapshot/fingerprint, and discard late responses for an obsolete chart. Do not render an old reading as the interpretation of a new chart. Use typed content blocks rather than executable generated HTML.

## Validation, reference material, and privacy

Prompts and a small reviewed reference file live in Git and carry explicit version identifiers. Use stable chart-fact IDs and approved reference IDs, and check output structure and reference membership in code. Test rulership mappings and occupied-versus-ruled houses. Human review is required for prose fidelity: a schema and valid citation ID do not prove that a sentence is true.

No mythology corpus is required for this experiment. Do not invent historical material or copy Astrolink content. Send the model compact derived facts without unnecessary identity/birth inputs. Routine logs exclude prompts, generated prose, birth data, and fact bundles; retain safe model/version, timing, usage, and sanitized error metadata. Update the UI's current no-server-storage/privacy wording to accurately describe transient processing and the selected provider's handling.

Keep the endpoint behind verified deployment protection, server-side credentials, bounded input/output/deadlines/concurrency, and a finite provider spend limit. This experiment must not become an anonymous billable endpoint. Local in-process concurrency limits are not a global distributed rate limiter; public access requires a separate decision and safeguards.

## Tradeoffs

| Choice                               | Benefit                                        | Accepted limitation                             |
| ------------------------------------ | ---------------------------------------------- | ----------------------------------------------- |
| Request-scoped generation            | Smallest integration and no job infrastructure | Timeout/reload loses delivery; no resume        |
| Browser memory only                  | No report database or ownership system         | No saved report or share link                   |
| One model                            | Simple configuration and cost measurement      | No cost/quality routing optimization            |
| Two chapters plus editor             | Tests modular writing and coherence            | Does not prove full-report or mythology quality |
| No semantic repair loop              | Predictable baseline cost and easier diagnosis | More visible failures requiring manual retry    |
| Small identifier-selected references | Reviewable and sufficient for narrow content   | Limited breadth                                 |

Keep stages as small ordinary functions so later durable execution can wrap them, but do not build an abstract orchestration framework now.

## Exit criteria and future migration

Review roughly five neutral charts and compare drafts with edited output. Record content failures, measured latency/token usage/cost, and whether the editor improves quality. Verify the real hosted endpoint and protection before a cloud success claim. No model/provider or latency budget is considered validated by this ADR alone.

If quality is promising, return to ADR 001 for persisted snapshots, authorized report access, durable stage recovery, selective regeneration, broader evaluation, and additional chapters. The POC needs no production data migration because it stores no reports in the application backend.
