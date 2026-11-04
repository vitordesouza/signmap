# Astrolink reference: coverage and implementation plan

> Historical audit of the first prototype. The subsequent TypeScript migration implements additional points, configurable aspects, summaries, conditions and rendering improvements. See the root README for current behavior and remaining limits.

Evidence: user-supplied `prompt-files/My Birth Chart - Astrolink.html`, chart PNG, supplied Mapa HTML, and current app source. This is an audit of the saved reference, not a claim about every feature in Astrolink today. Premium and dynamically fetched interpretation bodies are not present in the export. Do not copy Astrolink's prose or reverse-engineer unavailable content.

## Latest reconciliation and report pass

- Thirteen external planet/node/Lilith positions agree within 1 arcsecond; the maximum observed difference is 0.250 arcseconds.
- All twelve external house cusps are within 1 arcminute (maximum 44.90 arcseconds), and Rising, Midheaven and Fortune meet the same tolerance. Exact reference coordinates are absent, so the residual differences are documented rather than treated as exact parity.
- All thirteen visible house assignments and the two published natal aspect orbs agree. The full premium aspect policy remains unknown.
- Reference birth details and the full comparison stay local under ignored `output/private`; the deployed default is a neutral example.
- All astrological glyphs are embedded SVG geometry; text fonts are self-hosted.
- The full `/report` view includes the wheel, overview, placements, houses, aspects, conventions and provenance, and prints independently of the current workspace tab.
- Detailed interpretations, comprehensive localization, named aspect presets and body-specific orb overrides remain deferred. See the README for current behavior and deployment verification.

## Why the chart has more lines

Mapa tests only Sun through Pluto: 10 bodies, 45 unique pairs, five major aspects (0°, 60°, 90°, 120°, 180°), and a uniform 6° orb. Rising and Midheaven are calculated but excluded from aspects. Additional points are not calculated.

The reference visibly includes Chiron, Lilith, a lunar node, Part of Fortune, and angles. Extra eligible points create more possible pairs, although the screenshot alone cannot establish which point pairs its renderer permits. The saved natal report shows Mars–Jupiter square at 3.86° and Mars–Pluto square at 6.99°, followed by “21 more” aspects: 23 reported natal aspects. The second square is explicitly excluded by our 6° rule. We cannot infer its complete aspect/orb configuration or whether minor aspects are enabled from these two examples.

A controlled calculation using the first ten planetary longitudes serialized in Astrolink's chart image URL yields 16 matches with our five-aspect, 6° policy. Changing only the cutoff to 7° yields 19; 8° yields 20. These are policy experiments on the reference's positions, not independent validation of our calculated positions or a reconstruction of Astrolink's 23. More lines do not imply more precise astronomy. Conjunctions may also be visually inconspicuous because endpoints nearly coincide.

The Mapa HTML is an application shell with default New York example inputs, not a saved generated chart response. Astrolink is a personal Scorpio / Cancer Rising / Aries Moon chart. Do not compare those screenshots as identical birth inputs. The “Sky now” section is a separate transit snapshot dated November 1, 2026; its aspect list is not natal evidence.

## Feature map

| Area                | Evidence in Astrolink export                                                  | Mapa after this copy/organization pass                                        | Work needed for comparable depth                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary placements  | Sun, Rising, Moon first                                                       | Same order in summary, placements, and interpretation                         | Add a concise integrated overview, rather than only separate entries                                                                                  |
| Planet groups       | Personal, social, transpersonal                                               | Personal, social, outer groups                                                | Explain the groups on demand                                                                                                                          |
| Additional points   | Chiron, Lilith, Part of Fortune; node on wheel                                | Absent                                                                        | Stable point IDs; Chiron data files; explicit mean/true node and Lilith definitions; day/night Fortune formula and horizon test                       |
| Angles              | Rising and Midheaven, wheel axes                                              | Rising and MC in placements; ASC/MC on wheel                                  | Descendant and IC, axis labels, optional angle aspects; avoid counting geometrically redundant axis pairs                                             |
| Positions           | Signs, degrees, retrograde labels                                             | Signs, degrees/minutes, direct/retrograde, house                              | Seconds if needed; stable rounding; tooltips and searchable/filterable entries                                                                        |
| Houses              | Planets by house, signs on houses, cusp proximity notices                     | New dedicated table of all 12 cusps, life themes and occupants                | Original planet-in-house and sign-on-house readings; explicit cusp-proximity rule; never silently reassign a planet                                   |
| Aspects             | 23 reported natal aspects; two visible orbs; many chart lines                 | Dedicated aspect table sorted by tightest orb; transparent 6° policy          | Configurable versioned aspect profiles, per-aspect/body orbs, optional points/angles/minor aspects; detail selection linked to wheel                  |
| Energy distribution | Elements, modalities, polarity percentages                                    | Absent                                                                        | Define included bodies/angles and weighting, then derive aggregates. Astrolink's exact weights are unknown; do not claim matching percentages         |
| Dominance           | Sign strength ranking, house emphasis; mostly locked                          | Absent                                                                        | Explicit scoring model with weights and rationale; independent ranking, not an asserted industry standard                                             |
| Extra conditions    | Sun decan; Venus retrograde/detriment (“exile”); Jupiter combustion           | Motion only                                                                   | Decan convention, dignity/rulership tables, combustion/cazimi rules; definitions vary by school                                                       |
| Interpretation      | Entries for signs, houses, aspects; long MC prose visible                     | Brief sign templates for all ten planets plus Rising; no integrated synthesis | Original or licensed editorial corpus, structured keys, reviewed localization, context-aware synthesis and quality checks                             |
| Reading navigation  | Seven numbered sections and expandable entries                                | Wheel, Placements, Houses, Aspects, Interpretation, Technical details         | Overview → placements → patterns → houses → aspects; expandable detail with links back to evidence                                                    |
| Chart drawing       | More symbols, degrees, axes and aspect lines; alternate summary image         | SVG wheel, aspect toggle, three house systems, export                         | Collision-aware glyph layout, leader lines, glyph font without emoji fallback, aspect colors/legend, point filters, hover/focus details, print layout |
| Product breadth     | Account, extra charts, synastry, transits, nodes, lunar cycles, premium tools | Single-session natal prototype                                                | Separate products and persistent accounts only if required; not prerequisites for natal parity                                                        |
| Feedback/export     | Per-entry agreement controls, sharing; graphical summary                      | SVG download                                                                  | Accessible report export and saved preferences; feedback controls are optional product choices                                                        |

## What the content engine actually needs

Current sign text is a shared sign-quality sentence, not a planet-specific interpretation. Merely adding more paragraphs would not reproduce the reference's depth. A first serious corpus covering ten planets requires up to 120 planet/sign entries, 120 planet/house entries, 144 sign/house combinations, plus Rising and Midheaven sign entries. Five major aspects across 45 planetary pairs create up to 225 pair/aspect keys before editorial applicability rules. Additional points, localization and synthesis expand that surface. These are content key-space estimates, not required article counts.

Keep calculation results separate from interpretation. Return normalized point IDs, exact coordinates, speed, house, angle IDs, cusp array, aspect angle/orb, calculation settings, data versions and provenance. A content resolver selects reviewed text by placement or aspect key; a synthesis layer highlights a small number of themes and resolves repetition. If a language model is added later, ground it in these facts, validate every named placement, and keep calculation out of generated prose.

## Delivery sequence

1. **Calculation contract and reference fixtures.** Configure Swiss ephemeris files, verify returned flags, establish supported dates, pin timezone data, and compare matched date/time/coordinates/house-system fixtures with trusted outputs. Handle DST overlaps by offering the two actual instants; do not ask users to alter their real birth time. Use Rising independently from first-house cusp under whole-sign/equal systems. Test house boundaries and polar behavior.
2. **Point and aspect coverage.** Add node/Lilith conventions, Chiron and Fortune with provenance. Extract aspect logic into a pure tested function; version profiles and return rules with results. Test 0°/360° wrap, exact cutoffs, uniqueness, retrograde speed and unsupported data. Make any broader orb profile an explicit choice; do not add lines just to resemble the reference.
3. **Drawing engine.** Add collision layout and reliable glyphs before increasing point density. Bind wheel lines to the aspect table, provide filters, legend, accessible focus details and responsive/print output. SVG remains adequate; a different chart library alone does not supply missing calculation or editorial coverage.
4. **Interpretation and summaries.** Write/license and review the corpus, complete Portuguese translation, then add documented element/modality/polarity weighting and chart synthesis. Separate measured positions from astrological interpretation. Include source placement links for each statement.
5. **Product delivery.** Optional persistence, report export, accounts and additional chart types. Resolve Swiss Ephemeris and geocoder commercial licensing before public/commercial rollout.

## Copy decisions implemented

- “Rising” is the primary user-facing label. “Ascendant” remains a valid synonym in explanations, and ASC remains a conventional wheel label. Reference: https://www.astro.com/astrowiki/en/Asc
- Sun → Rising → Moon consistently precede all other placements.
- Placements grouped into primary, personal, social, outer, and other angles; Rising is explicitly an angle, not a planet, and receives no fabricated house number.
- Dedicated Houses and Aspects tabs expose existing calculation output. Aspect scope and orb limits are visible beside the results.
- Interpretations cover the primary trio and remaining planets, with the brief/template nature disclosed. This pass does not implement Astrolink-level original interpretive depth or broader aspect policy.
- Avoid deterministic personality claims, gendered energy labels, unsupported “dominance” precision and premium-style clutter. Keep technical settings accessible without placing them in the birth-data form.
