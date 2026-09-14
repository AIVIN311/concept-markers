# Citation experiment — batch 2 — 2026-09-14

## Goal

Test whether the narrow, natural-language opening-definition intervention first used on
`computationalsovereignty.com` is followed by observable answer-engine source appearance
across three concept types.

This is a replication attempt, not a claim that wording causes citation.

## Sites and roles

| Site                           | Role                                         | Intervention                                                                 |
| ------------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------- |
| `offworldassetrights.com`      | Emerging offworld-governance concept         | Replace only the indirect opening with one independently quotable definition |
| `modelautophagy.com`           | Existing research-adjacent concept           | Replace only the indirect opening with one independently quotable definition |
| `energyjurisdiction.com`       | Energy and infrastructure governance concept | Replace only the indirect opening with one independently quotable definition |
| `computationalsovereignty.com` | Prior positive observation                   | No change                                                                    |
| `jurisdictionaldrift.com`      | Unchanged control                            | No change                                                                    |

Titles, H1s, metadata, crawler rules, sitemaps, links, page depth, and structure remain
unchanged. No joined/spaced/hyphenated keyword variants are inserted.

## Pre-intervention source hashes

| File                             | SHA-256                                                            |
| -------------------------------- | ------------------------------------------------------------------ |
| `offworldassetrights/index.html` | `0A5D6E028539D19F71BC756B7BCEF0599B2D1BE91E4651C5731F59C2AF2D63B5` |
| `offworldassetrights/index.md`   | `D9212328A3A6E1791AA7242B33FAA69F5C03352D0ED9BBE39173AAB3F925E0E8` |
| `modelautophagy/index.html`      | `5D61C0D0E6D573458A6498E54DBFBA097A14C287489FD42EECBB1B60728D970B` |
| `modelautophagy/index.md`        | `0634526BD8D4C5472E68241E4553A4A67366BCFC464F8F117BDD84D26215FFE7` |
| `energyjurisdiction/index.html`  | `7576A5FBF9F9A82B614836594165B9ACC400AB7AB98FE66E8A50A3B22EF2DAEC` |
| `energyjurisdiction/index.md`    | `C706BC5B2D487578902ACD2143697B8E0880DFB8A7E05CEE1A9D1E66CA5EF972` |

## Retest protocol

For each concept, use separate fresh private-browsing conversations and record the UTC or
Asia/Taipei timestamp, product/mode, answer mention, source appearance, source position,
and inline citation. Test four question families:

1. Joined label: `What is [joined label]?`
2. Natural term: `What is [natural term]?`
3. Explanatory: `Explain [natural term].`
4. Semantic: a natural question describing the underlying governance or system problem
   without naming the concept or domain.

Repeat at low frequency after a relevant crawler revisit or whenever a later spot check is
practical. Preserve negative results. Do not interpret crawl access as indexing or citation.

## Verification

- Run `npm run format:check`.
- Confirm the diff contains only the three HTML/Markdown page pairs and this record.
- Deploy only the three changed Pages projects.
- Purge only `/`, `/index.html`, and `/index.md` for apex and `www` on the three changed
  zones; do not purge whole zones.
- Verify HTTP 200, new opening present, old opening absent, and record cache status.
