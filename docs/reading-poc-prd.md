# Two-chapter reading POC — PRD

Date: 2026-11-02.
Status: implemented and verified with neutral actual-provider and hosted tests; partner editorial review pending.
Architecture: [ADR 002](adr/002-reading-poc.md).
Start implementation: [POC handoff](reading-poc-handoff.md).
Future destination: [complete-version PRD](interpretive-reports-prd.md).

## Objective

Prove that chapter-specific prompts followed by editing produce accurate, specific, coherent writing that readers want to read, at an observable cost. This is a protected experiment, not a customer-ready report service.

The complete seven-chapter plan remains intact. This document defines the smaller next implementation and takes precedence on immediate scope: do not build durable workflows, persistence, or the full content outline for this POC.

## Reader experience

The existing chart workspace gains a Generate reading button. Generation happens only on explicit request, never on form edits or automatic chart calculation. Show a stable loading state, then a two-chapter reading with a short introduction and conclusion. Provide an actionable error and manual retry on failure; do not imply the request will resume in the background.

Keep the reading in browser memory only. Reload loses it; navigation may retain it through the existing workspace pattern. Explain this limitation. Tie the reading to the chart input/settings snapshot that generated it: changed calculated charts must clear it or clearly identify it as belonging to the earlier chart. An older request finishing late must not attach its reading to a newer chart.

Render structured content through existing application components. Follow local design tokens and patterns. The technical chart, exports, and current report remain usable independently of generation. Print/PDF integration, streaming, and chapter-progress subscriptions are not required.

## Content

### Chapter 1 — Your Sun sign

Explain motivations, strengths, patterns under pressure, and growth possibilities. Personalize using the Sun's occupied house and selected existing aspects; include relevant Moon/Rising context without turning the chapter into a whole-chart report. Offer a few specific reflection questions rather than asserting how the reader currently behaves.

### Chapter 2 — Your ruling planets

Distinguish the Sun sign's ruling planet from the Rising-derived chart ruler. Respect the selected traditional/modern rulership convention. Describe relevant planets' symbolism, actual signs/houses, selected aspects, and houses they rule. Handle coincident rulers without repeating a planet introduction. A planet's occupied house and houses it rules are different facts.

### Editorial pass

Combine the two drafts, remove repetition, improve transitions, and add a brief introduction and conclusion. Preserve chapter identities and evidence references. Compare raw drafts with the edited edition; editing must demonstrate value rather than be assumed beneficial.

Use an educational, warm, clear, nonjudgmental voice. Avoid good/bad personality labels, generic flattery, invented biography, current-state assumptions, diagnoses, guaranteed predictions, or predetermined destiny. Present astrology as a symbolic framework for reflection. Do not copy competitor prose.

## Minimal implementation

- One server endpoint, proposed `POST /api/reading`.
- Recalculate an authoritative chart on the server from validated birth inputs/settings; never accept browser placements as truth.
- Derive a compact set of explicit facts with stable identifiers. Reuse current calculation conventions.
- Three logical model calls: Sun chapter, ruling-planets chapter, then editorial merge. The first two may run concurrently; editing depends on both. No agent loop.
- Three versioned prompt files plus one shared voice specification, and a small reviewed reference file sufficient for these chapters.
- One configurable model used for all stages initially. Provider/model selection and credentials remain implementation decisions; do not provision a paid plan incidentally.
- Zod schemas for typed output, plus checks for referenced fact membership, required chapters, length bounds, and invalid relationships. Structural validity alone does not establish semantic accuracy.
- Bounded input/output, request timeout, finite provider retries, and basic timing/token/cost metadata. No automatic semantic repair loop in this slice; fail clearly and let the reader retry.
- Generated Hey API client and TanStack Query mutation for the REST call, using the existing schema-generation workflow.
- Reading and draft comparison stay in browser memory; drafts can be shown behind a development-only review control. Do not expose raw prompts or private diagnostics in production responses.

Target English for the initial internal preset, explicitly labeled as such. Do not promise the existing placement-note language options apply to generated readings. Exact word/token budgets and model choice should be small, configurable, and reported after measured runs.

## Evaluation and acceptance

Use about five synthetic/neutral charts with varied Sun/Moon/Rising, houses, aspects, and same/different ruling planets. Include traditional/modern rulership differences. Do not commit or send the owner's private reference as evaluation data.

The POC is reviewable when:

1. The visible button generates both chapters and their edited edition from server-derived chart facts, with actual provider output on representative neutral cases.
2. Existing chart behavior survives provider failure, timeout, navigation, and a chart change while generation is running.
3. Schemas and fact-reference checks reject malformed/unsupported output. Human review checks semantic claims against the chart and reviewed references; detected factual errors are not displayed as a valid reading.
4. The raw-versus-edited comparison makes repetition, coherence, factual drift, and loss of specificity assessable.
5. Duration and token usage are recorded per stage and total. Cost is estimated from verified model pricing when available; unknown cost remains unknown rather than zero. Include failed attempts where observable.
6. Real model tests are separated from deterministic mocked tests; mock success is not claimed as evidence of writing quality.
7. The actual rendered UI is inspected, existing relevant checks pass, and request duration/server behavior is verified against the target deployment before claiming hosted compatibility.

Use a short human rubric: chart accuracy, personalization, clarity/tone, repetition/coherence, and usefulness of reflection. Treat observed timings/costs as measurements, not agreed SLAs. If editing adds little value or causes factual drift, simplify it or defer it based on evidence.

## Privacy and access

The model receives derived facts and minimal editorial inputs, not email, name, gender, exact birth date/time, or birthplace unless a specific content need is established. Insert names in presentation if desired. Do not log prompt/report bodies or personal facts to routine server logs. Server logs hold stage/version/model identifiers, timing, usage, and sanitized errors. Chart facts themselves are still private profile data.

Keep the experiment behind the existing Vercel deployment protection. Protection is not a substitute for endpoint safeguards: validate requests, constrain lengths/concurrency, disable repeated clicks, enforce request/output limits, and keep provider account spend limits finite. Verify protection covers the generation endpoint. Anonymous production exposure is outside scope; revisit authorization, rate limiting and spend enforcement before enabling it. Memory-only app storage does not imply a model provider has no retention: verify provider handling and update privacy copy before enabling generation.

Preserve neutral production defaults and the ignored development prefill. No model keys in source, frontend bundles, or generated clients.

## Deliberately deferred

No database, saved-report links, accounts/customer ownership, durable runner, background recovery, cross-request cache, prompt-management UI, model routing/benchmark platform, vector database, live research, payments, mythology, full twelve-house chapter, elemental chapter, life-purpose chapter, or complete-report print integration.

The next MVP step, if content quality justifies it, is authorized saved reports and recoverable delivery. Expand content from the complete PRD after reviewing this experiment. Do not call this POC a finished customer-facing MVP.
