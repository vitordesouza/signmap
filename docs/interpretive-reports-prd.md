# Original interpretive reports — PRD

Status: accepted product direction; implementation not started.
Date: 2026-11-02.
Owner: Mapa product owner.
Architecture: [ADR 001](adr/001-interpretive-report-generation.md).
Execution entry point: [implementation handoff](interpretive-reports-handoff.md).

## Problem and outcome

Mapa calculates and displays a natal chart but does not yet produce an original, cohesive long-form interpretation. Readers should understand the chart's symbolism, recognize strengths and patterns under pressure, and leave with useful questions and practical experiments. The report should feel authored as a whole while allowing each chapter's quality to improve independently.

Success requires accurate use of the calculated chart, consistent editorial standards, traceable historical material, reliable delivery, and measurable cost per delivered report. Astrolink is a depth/reference benchmark, not a source to copy or a claim of exact content parity.

## Audience and editorial promise

The reader does not need astrological expertise. Explain unfamiliar terms when introduced and connect interpretation to concrete chart relationships. Technical readers can inspect supporting facts and calculation conventions through optional disclosure.

Use an educational, warm, specific, nonjudgmental voice. Prefer strengths, patterns under pressure, and opportunities for growth over good/bad personality labels. Astrology is presented as a symbolic framework for reflection; the report must not present personality, health, future events, or destiny as scientifically established by a natal chart.

The natal chart cannot establish how the reader currently behaves. Invite self-assessment rather than claiming to know their present emotional state. Do not infer life history or stereotypes from name, gender, or birthplace. No health diagnoses, guaranteed outcomes, or fear-based predictions.

## Content scope

The following is the initial information architecture. The owner will expand the individual briefs; headings and length budgets remain tunable.

| Chapter                | Required coverage and personalization                                                                                                                                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Your Sun sign          | Explain the sign's motivations, strengths, pressure patterns, and growth possibilities. Personalize through the Sun's house and selected aspects. Include relevant Moon/Rising context without treating the Sun as the whole person.                                                                 |
| Your ruling planets    | Distinguish the Sun sign's ruler from the chart ruler derived from Rising. Explain each relevant planet's symbolism, actual sign/house placement, houses it rules, and selected aspects. Honor the chart's traditional/modern rulership setting. Avoid duplicate treatment when the rulers coincide. |
| Greek mythology        | Retell reviewed source material in original prose; distinguish historical narrative from Mapa's contemporary symbolic interpretation and chart connections.                                                                                                                                          |
| Egyptian mythology     | Apply the same source discipline, with an independently appropriate structure. Do not invent a historical equivalent to a Greek figure. If relevant evidence is missing, disclose the limitation or omit the association.                                                                            |
| The twelve houses      | Cover every life area using cusp sign, house ruler, and occupants. Explain empty houses meaningfully. A planet's occupied house and houses it rules are separate relationships.                                                                                                                      |
| Your elemental balance | Explain chart-wide balance under the selected weighting convention and the Sun sign's element. Discuss mixed tendencies; missing/low representation is not proof of a personal deficiency.                                                                                                           |
| Purpose and direction  | Synthesize selected chart themes into possibilities, reflection questions, and practical experiments. No predetermined life mission.                                                                                                                                                                 |

Add an introduction and final synthesis after chapter drafting. Every chapter needs a distinct purpose; repeating the same sign description is not adequate personalization. All calculated aspects remain available in the technical chart, but prose should prioritize relevant relationships rather than mention every aspect.

## Reader workflow

1. Generate a valid chart using the existing calculation workflow.
2. Explicitly request an interpretation in a supported language and editorial preset.
3. See saved progress by stage/chapter, with clear retryable failure states.
4. Return to the report after navigation or refresh through an authorized report reference.
5. Read the coherent final edition, optionally inspect its chart evidence and sources, and print it through the existing report presentation.

Draft chapters may be available as clearly marked previews. Do not silently replace a published edition with a different generation. A changed chart or calculation setting produces a new report input; an older report remains labeled with the settings that produced it. Existing chart calculations, exports, and the technical report must continue working when generation is unavailable.

## Generation requirements

- Freeze an authoritative chart snapshot with calculation provenance and settings before generation. Calculate facts in application code, never in a model.
- Build stable fact identifiers and a shared editorial brief with language, tone, depth, chapter budgets, major themes, and allocation of repeated topics.
- Give each chapter its own versioned prompt contract, relevant facts, and approved reference entries.
- Return structured sections with content blocks, reflection questions, chart-fact references, and source references. Model evidence references require validation, not blind trust.
- Validate chapter drafts; repair only failed sections within a bounded attempt/cost budget.
- Run one cross-chapter editorial pass, preserving evidence and section identities. Compare a full rewrite against lighter editing before choosing the default.
- Validate the final edition again. Preserve drafts and revision lineage for diagnosis.
- Persist successful stages, support recovery and deduplicated requests, and record token usage, latency, cost estimates, model/configuration, and all content versions.
- Generate original prose from reviewed material. Do not scrape/rewrite Astrolink reports or let the model invent historical source citations.

## Knowledge and editorial control

Begin with small, reviewed, versioned repository files for signs, planets, houses, rulership conventions, and mythology. Each historical entry records provenance, tradition/context, approved claims, caveats, and permitted symbolic use. Distinguish historical facts, astrological conventions, and Mapa's interpretation.

Select entries by identifiers first. Live research per report and a vector database are out of initial scope. Mythology chapters must not ship until their supporting source entries are reviewed. Prompt changes and source changes are independently versioned.

Each section contract specifies its purpose, required topics, allowed facts/sources, shared voice, section-specific guidance, length budget, examples, output schema, and evaluation rubric. Start with configuration in Git; a prompt-management UI can follow demonstrated operational need.

## Quality and business measures

Build a synthetic/neutral evaluation set of roughly 20–30 diverse charts before tuning at scale. Cover varied Sun/Moon/Rising combinations, house systems, rulership settings, retrogrades, empty houses, element distributions, close boundaries, and supported languages. Reuse calculation edge cases where relevant. Human reviewers compare editions blind where feasible.

| Measure           | Evaluation and release policy                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Chart fidelity    | Check placement/ruler/aspect references against the snapshot. Detected mismatches block publication. Reference checks alone cannot prove prose fidelity; review semantic claims too. |
| Source fidelity   | Verify source identifiers and approved historical claims; review whether symbolic interpretation is clearly distinguished. Unsupported historical claims block publication.          |
| Coverage          | Required chapter topics and all twelve houses are present in the complete product; slice-specific coverage applies during development.                                               |
| Personalization   | Human rubric checks specific chart relationships and contrasts against generic, interchangeable prose.                                                                               |
| Editorial quality | Blind review of clarity, voice, repetition, contradictions, transitions, and usefulness.                                                                                             |
| Reader value      | Separate clarity/actionability feedback from subjective recognition or "sounds like me" feedback.                                                                                    |
| Reliability       | Completion rate, recovery success, stage failures, repair rate, and time to first preview/final report, including p50/p95.                                                           |
| Unit economics    | Input/output tokens, estimated provider cost, workflow/storage cost, and total cost per successfully delivered report, including failed attempts.                                    |
| Product value     | Chapter engagement, report completion, preview-to-purchase conversion when payment exists, and refund reasons when applicable.                                                       |

Automated editorial judges assist triage and must be calibrated against human review. Do not optimize solely for flattery or recognition. Numeric quality thresholds, latency goals, word budgets, and margin targets must be established from the baseline and business requirements; they are not yet agreed service guarantees.

## Privacy and access

Send models derived chart facts and necessary editorial inputs, not email or unnecessary identity/birth data. Keep name insertion in presentation where possible. Treat generated profiles and fact snapshots as private data. Persist only what is required, scope every report/status read to its authorized viewer, and do not expose content through predictable IDs or cross-user cache hits.

The current deployment uses Vercel Authentication; this is not customer report ownership. Decide report access, retention, deletion, and diagnostic-log redaction before customer-facing persistence. The owner's reference stays in ignored local files. Use synthetic examples in committed fixtures and source material. Existing privacy copy must be updated before introducing server persistence or third-party model calls.

## Delivery slices and acceptance

### Slice 1 — Sun-sign chapter

Deliver the fact adapter, one shared editorial preset, one chapter contract, reviewed minimum knowledge entries, structured generation, validation, saved stage/provenance, and an internal preview. Demonstrate chart-specific content on several neutral cases, a controlled failure/repair path, measured usage, and preservation of existing chart behavior. A development harness may precede cloud persistence but is not production completion.

### Slice 2 — Ruling planets and editorial merge

Add the Sun-sign ruler/chart-ruler distinction, settings-aware rulership, a second chapter, and cross-chapter editing. Test same-ruler and different-ruler charts, evidence preservation, contradiction/repetition handling, recovery without regenerating a completed section, and bounded retries. Compare full rewrite with lighter editing using the same inputs.

### Slice 3 — Complete outline and delivery

Add reviewed mythology, twelve houses, elemental balance, purpose/direction, introduction/conclusion, authorized resumable delivery, and printable integration. Publish only after final validation. Evaluate language quality separately; do not advertise a language based only on successful translation.

### Slice 4 — Optimization

Tune prompts, model routing, budgets, caching, and editorial variants using measured quality/cost. Add administrative tooling, retrieval infrastructure, or more providers only when evidence warrants them.

## Non-goals and unresolved choices

No autonomous research agents, model-calculated astronomy, copied competitor prose, chat product, payment system, or expansive administrative interface in the first slice. Authentication/payments are separate product scopes except for the minimum access control required to store private reports.

Open choices: final chapter briefs; Greek/Egyptian source corpus and reviewer; initial language/dialect; model/provider and data policies; word/latency/cost budgets; workflow compatibility with the exact Start/Nitro build; database provider and schema migration tooling; reader ownership/recovery; retention/deletion; full rewrite versus lighter edit. The architecture ADR records the default direction without pretending these choices are implemented.
