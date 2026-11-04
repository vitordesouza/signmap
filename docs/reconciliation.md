# Reference reconciliation and portable reports

## What was compared

The supplied Astrolink HTML contains numerical longitudes, house cusps, thirteen visible house assignments and two visible natal-aspect orbs. Its original calculation coordinates and full premium aspect policy are not included.

The current local birth record was calculated using the matching reference location, its IANA timezone and the historical date's UTC offset. A mismatched New York location ID in the hand-edited form defaults was identified and corrected. The deployed application now uses a neutral example; the personal record and full comparison are kept under ignored `output/private`.

## Findings

- All thirteen planet/node/Lilith longitudes agree within one arcsecond. The largest difference is **0.250 arcseconds**.
- All twelve house cusps agree within one arcminute. The largest difference is **44.90 arcseconds**.
- Rising, Midheaven and Part of Fortune also agree within one arcminute.
- All thirteen visible house assignments agree.
- Both visible natal aspect orbs agree when rounded to Astrolink's two decimals. The wider aspect is excluded at the default orb and included when that limit is increased. Exact private-reference aspects remain in the ignored local comparison.

These are external-application integration checks, not an independent verification of Swiss Ephemeris's underlying astronomical model. The residual angle/cusp differences remain unresolved: different city coordinates or time conventions are plausible explanations, but the export does not establish which. The unknown premium aspect policy prevents a claim that every Astrolink aspect has been reproduced.

Run `pnpm reconcile:astrolink` while the supplied local HTML and `output/private/reference-input.json` are present. The script writes `output/private/astrolink-reconciliation.json`; neither private directory is uploaded to Vercel.

## Portable rendering

`AstroGlyph.tsx` contains original SVG geometry for all zodiac signs and calculated bodies, points and angles. The same renderer is used in the wheel, placement tables, summary and full report. Standalone SVG downloads embed the geometry and do not need a font or external sprite. Text fonts are self-hosted via Fontsource.

## Complete report

The Report link opens `/report` within the application, preserving the calculated result in memory. It includes the wheel, primary placements, overview distributions, all nineteen placements, twelve houses, every calculated aspect, calculation conventions and provenance. Print / Save PDF waits for text fonts to load. Reloading the route clears the in-memory result and asks the user to generate a chart again.

The neutral example was exported and visually reviewed as a **seven-page A4 PDF**. Placement notes remain on the placement page, table headings repeat on continued aspect pages, and all sections are included independently of the selected workspace tab. More aspects or longer names can change the page count; no report content is truncated to force a fixed length.

## Hosted verification

Deployed on 2026-11-02 to **https://mapa-boomich.vercel.app**, project `boomich/mapa`. The generated deployment is https://mapa-jbs8gt42b-boomich.vercel.app, ID `dpl_ARiKRs32VwKE9KDatF38sFLaGTLG`. It uses Node 24 and Vercel Authentication for all deployments. The initial deployment uses the production environment because Vercel requires this for new projects; no custom domain was added.

Authenticated POST `/api/chart` returns 200 with nineteen placements, forty-four default aspects and Swiss-file metadata. The largest cross-platform placement/cusp difference for the neutral example was 5.23e-12 degrees. The hosted browser renders the vector wheel and complete report. Both generated URLs redirect unauthenticated requests to Vercel sign-in. No error/fatal runtime logs were returned for the verification window.

The cloud's first build rejected pnpm's local `use-node-version` setting. `.npmrc` is now excluded from uploads, while the hosted Node version is declared in `package.json` and project settings. Private reference records, export HTML and QA PDFs are also excluded by `.vercelignore`.
