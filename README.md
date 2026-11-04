<img src="assets/icon.svg" width="64" height="64" alt="">

# Mapa

A natal-chart prototype built with **TanStack Start, React, TypeScript, and Swiss Ephemeris**. One application and one package.

## Start here

```sh
pnpm install
pnpm dev
```

Open **http://localhost:5174**. The deployed app starts with neutral, editable example birth details. Local development optionally loads `output/private/birth-draft.json` through a development-only endpoint; this ignored file is never bundled or uploaded. Without it, the same neutral example is used. Choose a city, enter the recorded local birth time, and generate your chart. Calculation settings are at **/settings**.

Use `pnpm dev` for the local app; the former Flask command is obsolete. Development watches exclude generated clients and build/report output so producing artifacts does not reset the form.

Node 24 is pinned in `package.json` and the local `.npmrc`; pnpm downloads the project runtime automatically. `.npmrc` is excluded from Vercel uploads because Vercel rejects `use-node-version`; the cloud build uses the `package.json` engine and project setting. Volta users get the same project-local version. pnpm 10 is the package manager. The only allowed dependency build scripts are `sweph` and `esbuild`.

```sh
pnpm check          # TypeScript, Oxlint, Oxfmt, and Vitest
pnpm build          # Standalone Node production build
pnpm start          # Serve that build (default port 3000)
pnpm build:vercel   # Vercel Build Output API artifact
pnpm verify:artifact # Exercise a temporary isolated copy of the Vercel function
pnpm generate       # Zod schemas → OpenAPI → typed REST/Query client
```

No ESLint or Prettier configuration. TypeScript is pinned to 5.9 because the installed Hey API generator relies on its JavaScript compiler API; the TypeScript 7 package is not compatible with that generator yet.

## What is implemented

- Global, debounced city autocomplete through Open-Meteo / GeoNames; keyboard selection, cancellation through Query, retry and empty/error states.
- Birth-date-aware timezone conversion, including historical fractional offsets. Repeated DST hours offer both actual instants; nonexistent clock times are rejected.
- Ten planets, Chiron, mean/osculating Lilith, true/mean lunar nodes, Rising, Midheaven, Descendant, IC, and day/night Part of Fortune.
- Placidus, Whole sign and Equal houses; all twelve cusps, occupants and optional next-cusp proximity notices.
- Five major and six optional minor aspects. Select eligible points and an independent orb for every aspect. Original 6° major defaults are retained.
- Elements, modalities, polarity, sign/house emphasis and chart ruler, with explicit equal or personal weighting.
- Retrograde motion, equal 10° decans, domicile/detriment, traditional exaltation/fall, and documented combustion/cazimi/under-the-beams thresholds.
- SVG wheel with spaced glyph labels and leader lines; extra-point/aspect visibility; aspect selection linked from the table; color legend and accessible data tables.
- Font-independent vector glyphs for all zodiac signs, bodies, points and angles. Text fonts are self-hosted.
- SVG and JSON exports, plus a complete `/report` view with the wheel, overview, all placements, houses, aspects, conventions and provenance. Print it or choose Save as PDF. JSON includes settings and calculation provenance.
- Settings saved locally in this browser. Birth details and chart data remain in memory across navigation, and clear on page reload. In development, a private prefill is restored from the ignored file after reload. Supplied personal reference exports in `prompt-files/` are intentionally Git-ignored.

## Planned original interpretations

The current implementation is a **two-chapter reading POC**: [POC PRD](docs/reading-poc-prd.md), [ADR 002](docs/adr/002-reading-poc.md), and [POC handoff with kickoff prompt](docs/reading-poc-handoff.md). Implementation and live verification are described under Reading POC below.

The complete version remains documented separately: [full PRD](docs/interpretive-reports-prd.md), [ADR 001](docs/adr/001-interpretive-report-generation.md), and [full-version handoff](docs/interpretive-reports-handoff.md). Its durability/persistence requirements are deferred during the POC.

## Learn the architecture

Start with these files in order:

1. [`src/routes/__root.tsx`](src/routes/__root.tsx): document shell, navigation, Query provider, local settings and in-memory workspace.
2. [`src/router.tsx`](src/router.tsx): creates a router and QueryClient per application instance. Start generates `routeTree.gen.ts`; do not edit it.
3. [`src/routes/index.tsx`](src/routes/index.tsx): chart workspace, generated calculation mutation, result snapshots and tabs. React owns the interaction state; the backend owns astronomy.
4. [`src/routes/settings.tsx`](src/routes/settings.tsx): editable calculation conventions. Saving preferences does not relabel an old result: the user explicitly applies them to a chart.
5. [`src/schemas/chart.ts`](src/schemas/chart.ts): Zod request, response and settings contracts; shared types and defaults.
6. [`scripts/openapi.ts`](scripts/openapi.ts) and [`openapi-ts.config.ts`](openapi-ts.config.ts): derive OpenAPI from those contracts, then Hey API generates Fetch clients, query keys/options and mutation helpers into `src/generated`. No manually maintained duplicate API schema.
7. [`src/routes/api.locations.ts`](src/routes/api.locations.ts) and [`src/routes/api.chart.ts`](src/routes/api.chart.ts): Start server routes using standard Request/Response. No Fastify service. Native engine imports are removed from the client build by Start's server-route boundary.
8. [`src/server/time.ts`](src/server/time.ts), [`geocoding.ts`](src/server/geocoding.ts), [`chart.ts`](src/server/chart.ts): time normalization, provider resolution and synchronous native calculations.
9. [`src/lib/astrology.ts`](src/lib/astrology.ts): pure aspect geometry, house membership and scoring rules, independently testable.
10. [`src/components/ChartWheel.tsx`](src/components/ChartWheel.tsx): SVG projection relative to Rising. Glyph labels can move for readability; their leader lines preserve exact positions.

### Request workflow

The browser sends a location ID, local date/time, optional repeated-hour choice, and calculation settings to `POST /api/chart`. Name, email and gender are not sent. Python is not involved.

The server resolves the location ID to coordinates and an IANA timezone, converts local time to UTC using Temporal, then uses Swiss Ephemeris's UTC conversion to obtain separate UT and TT Julian days. TT drives planetary calculations; UT drives houses and geometric solar altitude. House membership uses ecliptic longitude within cusp intervals, rather than three-dimensional house position.

The engine checks native status flags and rejects silent ephemeris fallback. Derived points, conditions, summaries and selected pairwise aspects are computed next. The response carries exact values, the settings snapshot, data revision, UTC offset and timezone-data version. React renders the wheel and tables; presentation toggles do not recalculate astronomy.

`GET /api/locations?q=...` is queried through generated TanStack Query options. Chart generation uses a generated mutation. Calculation responses use `Cache-Control: no-store`. The geocoder has a bounded 256-entry, 24-hour in-process cache; this is an optimization, not persistent storage.

## Conventions and limits

Tropical zodiac, geocentric apparent ecliptic positions, Gregorian calendar. Bundled ephemeris coverage is constrained to birth years 1800–2399. Files are pinned and hash-checked; see [`ephemeris/README.md`](ephemeris/README.md).

- Orbs are eligibility conventions, not astronomical precision settings. There is no automatic wider luminary orb. Minor aspects default off with 2° limits.
- Angle-to-angle aspects and the mechanically opposed North/South Node pair are excluded. Both opposite angles/nodes can otherwise be enabled explicitly, so corresponding planet connections may represent the same axis.
- Part of Fortune uses ASC + Moon − Sun by day, ASC + Sun − Moon by night, unless the day-only option is selected. Sect uses the Sun's geometric altitude at sea level, without refraction or local terrain.
- Cusp notices never move a planet into the next house. Placidus failures near the poles are errors; the app does not silently switch house systems.
- Traditional rulership uses seven planets; modern rulership substitutes Pluto/Uranus/Neptune for Scorpio/Aquarius/Pisces. Traditional exaltations are retained. More elaborate dignity systems are intentionally omitted.
- Combustion conditions apply to Mercury through Saturn: cazimi within 17′, combustion within 8°30′, under the beams within 17°. Decans are simple thirds, without decan rulers.
- Personal weighting gives Sun/Moon/Rising 2 points each and other planets 1. Equal weighting gives each 1. House scores exclude Rising. Additional points and aspects do not add hidden score bonuses. This is our model, not a reproduction of Astrolink's unpublished weighting.
- Historical timezone boundaries and records, especially before 1970, may be incomplete. Future offsets rely on the runtime's current rules. Metadata records Node/ICU/tz versions for reproducibility.
- Detailed interpretations, integrated personality claims, accounts, synastry, transits and payment flows remain deferred. Existing brief notes are retained. Portuguese is limited to those notes; the rest of the interface is English.
- Dense charts can still need manual visual inspection. Astrological glyphs are original SVG paths, embedded directly in standalone SVG exports. No icon font or external sprite is needed.

## Production and Vercel

`vite.config.ts` uses Start → Nitro → React plugins, externalizes `sweph` for the server, traces its package and copies ephemeris data into the server output. `vercel.json` selects Start and `pnpm build:vercel`. The generated function targets Node 24. Ephemeris files are server assets and are not exposed in the public asset directory.

The Node and Vercel artifacts are tested locally, and the hosted Linux deployment was verified on 2026-11-02. The live calculation endpoint returns nineteen placements and forty-four default aspects using Swiss files, including Chiron. Its largest placement/cusp difference from the same local calculation was approximately 5.23e-12 degrees. The hosted UI and complete report were checked in Chromium. Build on the target platform rather than publishing a Mac-built native artifact blindly.

Deployment: **https://mapa-boomich.vercel.app** (generated deployment: https://mapa-jbs8gt42b-boomich.vercel.app). Vercel requires a new project's first deployment to use its production environment. It was deployed with domain promotion skipped; Vercel also assigned its generated `vercel.app` alias. Authentication protection is enabled for **all** deployments, and anonymous requests to both URLs redirect to Vercel sign-in. No custom domain or public access was enabled.

For a managed Node host, deploy the standalone `.output` artifact and run `node server/index.mjs` from inside it. No VPS administration is necessary. The Vercel project is `boomich/mapa`, with Node 24 and Vercel Authentication protection. Birth-reference exports, temporary PDFs and private reconciliation data are excluded from deployment uploads.

## Validation

`tests/fixtures/python-swiss.json` preserves three fixtures from the original Python wrapper using the same pinned Swiss data: New York/Placidus, Lisbon/Whole sign, and São Paulo/Equal. Tests compare positions, speeds, cusps and angles against the Node wrapper. These are cross-wrapper migration checks, not an independent astronomical audit.

Vitest also covers historical offsets, DST overlaps/gaps, angle wraparound, exact orb cutoffs, point eligibility, Fortune formulae, cusp boundaries, summaries, polar failures, geocoding failures and data-file hashes. Browser verification covers the real geocoding → calculation → SVG/table flow, setting save/apply/reload, aspect selection, mobile layout, vector glyphs, and the full report. The suite also checks complete-report composition, portable vector glyphs, and the development-only private prefill. The neutral example PDF is visually inspected after export, including physical pagination.

`pnpm reconcile:astrolink` compares the supplied local HTML export with `output/private/reference-input.json`. Both inputs and the detailed result remain excluded from Git and deployment uploads. Thirteen planet/node/Lilith positions agree within one arcsecond (largest difference 0.250 arcseconds); twelve cusps and the Rising/Midheaven/Fortune positions agree within one arcminute (largest cusp difference 44.90 arcseconds). All thirteen visible house assignments and both published aspect orbs agree. This validates integration against an external application, not an independent astronomical theory. Exact reference coordinates and the full premium aspect policy are unavailable, so those residual differences remain unresolved.

## Before public use

Swiss Ephemeris and its data have AGPL/professional licensing requirements. Resolve the application's distribution model before public distribution or running a public service. See the [official terms](https://www.astro.com/swisseph/swephprg.htm). Open-Meteo's free endpoint is for non-commercial use; review its [terms](https://open-meteo.com/en/terms) before commercial rollout. No billing changes are included here.

The original reference audit is retained in [`docs/astrolink-gap-analysis.md`](docs/astrolink-gap-analysis.md); its initial-state feature map is historical. The migration above implements the calculation, summary and presentation gaps while intentionally deferring detailed editorial content and unrelated products.

The current external comparison and report QA are summarized in [`docs/reconciliation.md`](docs/reconciliation.md). A visually checked neutral example is available locally at `output/pdf/mapa-example-report.pdf` (not uploaded).

## Reading POC (protected internal experiment)

`POST /api/reading` recalculates the submitted chart and sends only derived facts to three AI SDK structured calls: Sun and rulers in parallel, then an editor. The workspace has an explicit **Generate reading** control using generated Hey API Query helpers with client retries disabled. Readings clear on chart changes or leaving the view; late results stay in their old component and cannot attach to the replacement chart. Technical reports remain independent.

Server-only configuration (no values belong in frontend variables):

- `READING_ENABLED=true`, `READING_MODEL=gpt-6.1-terra`, `OPENAI_API_KEY`, and `READING_SAFEGUARDS_CONFIRMED=true`. The key must belong to the OpenAI organization holding the claimed ChatGPT API-credit grant. Calls use the AI SDK's direct OpenAI Responses provider; no Gateway credits, OIDC, automatic provider fallback, or paid infrastructure purchase is required.
- `READING_SAFEGUARDS_CONFIRMED` attests that deployment protection covers `/api/reading`, provider handling has been reviewed, and provider funding/spend controls are finite. It is not authentication or a distributed rate limiter. Leave unset until verified. Keep Auto Recharge disabled if the intent is to use only the grant. Purchased OpenAI credits, if present, can fund requests after the grant expires; an API key cannot distinguish those balances.
- `READING_TIMEOUT_MS` defaults/maxes at 90000 (minimum 1000). `READING_DRAFT_TOKENS` defaults/maxes at 2000 and `READING_EDITOR_TOKENS` at 4000 (minimum 500). Invalid values use defaults. The Vercel function packages a 120-second limit. One active request per instance, at most two concurrent calls, zero SDK/client retries. These are experiment bounds, not measured hosting guarantees.

### Provider, privacy and credits (2026-11-02)

The owner chose their ChatGPT Pro API-credit grant instead of purchasing Gateway credits. OpenAI confirms eligible Pro subscriptions can claim monthly API credits by linking an owned API organization. The grant must be activated; a subscription alone does not prove its current balance. Credits are used before purchased API credits and expire at the billing-cycle boundary. No credit purchase, top-up, or plan upgrade was performed. See [claiming API credits](https://developers.openai.com/api/docs/guides/chatgpt-api-credits).

GPT-6.1 Terra was selected for clear writing, editing, structured output, and low cost. Official Standard prices checked on 2026-11-02: $1/million input, $0.05/million cached input, $5/million output. Usage estimates are before promotional credits, not verified charges or remaining grant. Other configured models return unknown cost until their pricing is reviewed. See [model and pricing](https://developers.openai.com/api/docs/models/gpt-6.1-terra).

`store:false` disables saved Responses state; it does not establish ZDR. OpenAI does not train on API data by default, but abuse-monitoring logs can be retained for up to 30 days unless approved data controls apply. Prompts include derived chart facts, not names or raw birth details. Routine application logs exclude generated prose and facts. See [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data).

### Evaluation status

Actual-provider evaluation was completed on five neutral charts with GPT-6.1 Terra using prompt/voice v2. All five passed output/evidence validation, including traditional/modern differences and coincident Venus rulers. Observed processing times were 37.9–49.9 seconds; their combined estimated Standard API usage was $0.147003 before credits. This is a measured sample, not an SLA or proof of writing quality. The owner confirmed that the grant is visible and Auto Recharge is off; grant consumption and the remaining account balance were not independently verified.

`scripts/evaluate-reading.ts` is an explicitly billable manual runner, excluded from check/build. With the approved organization's key loaded securely, use `READING_SAFEGUARDS_CONFIRMED=true READING_LIVE_EVAL=true READING_MODEL=gpt-6.1-terra NODE_ENV=development pnpm exec tsx scripts/evaluate-reading.ts`. It defaults to one case; `READING_EVAL_CASES=5` covers different rulers, traditional/modern differences, and coincident Venus rulers. It stops on failure and writes only to ignored `output/reading-evaluation/`, including drafts for comparison. Provider request identifiers support billing investigation, but proving grant consumption still requires the OpenAI billing dashboard.

Human review must compare prose against the facts and references for accuracy, specificity, tone, coherence, and useful reflection. Valid assertions/citations do not prove prose fidelity. Local checks use pnpm, TypeScript, Oxlint/Oxfmt, Vitest, the Vercel build, and isolated artifact execution. No commit has been made.

### Live verification evidence

On 2026-11-02 the Vercel Linux endpoint completed a real three-stage reading: HTTP 200, 42.438 seconds of server processing, 42.883 seconds end-to-end, estimated API usage $0.02857 before credits. Production omitted raw drafts. A browser-driven local request completed in 43.128 seconds with $0.0276112 estimated usage; both chapters, duplicate-click prevention, measurements and development draft comparison were inspected rendered. These are real provider calls, separate from deterministic mocked tests. Type/lint/format, all 32 tests, Vercel build and isolated artifact checks passed. No credential was found in the build artifacts.

One browser attempt was interrupted by `ERR_NETWORK_IO_SUSPENDED`; the editor's final usage was unavailable. It did not silently resume or retry. A later manual submission succeeded. Observed usage from the interrupted attempt is recorded with unknown total cost, not zero. The full evaluation comprised five baseline readings, five revised readings, one hosted reading, one successful browser reading and one interrupted browser request. Known usage estimates total $0.3573862, plus unknown editor usage from that interrupted attempt. Estimates describe API usage before credits and do not establish cash charges.

The initial content review caught references to extra chart points absent from the reviewed material and an internal reference note in reader-facing prose. Version 2 restricts selected aspects to reviewed planets/Rising, keeps ruler introductions in chapter two, and excludes implementation commentary from the voice. Baseline outputs remain in `output/reading-evaluation/baseline-v1/`; current neutral outputs and usage records remain in the ignored parent directory. These test files contain no owner's private reference data and are not uploaded.

Review of current prose against the supplied facts found no mismatched placements or occupied/ruled-house assignments. Editorial improvements are incremental: transitions and some repetition improved, but the Sun/Moon tension can still recur across chapters and some reflection questions repeat within paragraph text and the question list. No extra model critic/repair loop was added. The partner's content and voice review remains pending; this remains an internal POC, not a finished customer report.

The OpenAI key is a production-only Vercel Secret and is also held in ignored, mode-600 `.env.local` for local use. No Gateway credits, budget, automatic top-up, subscription upgrade, database or durable workflow was provisioned. Deployment Protection remains enabled for all deployments.
