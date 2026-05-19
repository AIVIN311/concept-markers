# Domain Governance Ledger v0.1

This is the human-readable summary for `ops/domain-governance-ledger.v0.1.json`.
The JSON ledger is canonical; this document explains the current snapshot and the next governance
pass.

## Snapshot

- Snapshot date: `2026-05-19`
- Total domains: `67`
- Canonical source for host/folder inventory: `domains.json`
- Marker group source: `networklayer/markers.js`
- Semantic axis source: `RELATIONAL_LAYER.md`
- External platform state: manual snapshot, not live API truth

## Marker Group Counts

| marker_group               | count |
| -------------------------- | ----: |
| `governance`               |    18 |
| `civilization`             |    14 |
| `synthetic_systems`        |    12 |
| `identity_data`            |    10 |
| `monetary_infrastructure`  |    10 |
| `sovereign_infrastructure` |     3 |

## Governance Roles

| governance_role | count | meaning                                  |
| --------------- | ----: | ---------------------------------------- |
| `core`          |    56 | Published primary concept marker         |
| `bridge`        |     7 | Cross-axis concept that carries topology |
| `mirror`        |     4 | Multi-TLD mirror / layer variant         |

Bridge nodes:

- `computationalscarcity.com`
- `defaultpower.com`
- `energyjurisdiction.com`
- `humanintelligenceisirreplaceable.com`
- `jurisdictionaldrift.com`
- `strategicresourceresilience.com`
- `volatilityasinfrastructure.com`

Mirror / multi-TLD nodes:

- `algorithmicallocation.ai`
- `algorithmicallocation.systems`
- `algorithmiclegitimacy.ai`
- `syntheticsolvency.ai`

## Search Console Snapshot

All 67 domains are recorded as:

- `property_type`: `domain`
- `sitemap_status`: `submitted_success`
- `last_checked`: `2026-05-19`

This reflects the completed Search Console browser workflow from `2026-05-19`. It should be treated
as a dated governance snapshot, not as a continuously refreshed Google API status.

## Cloudflare Snapshot

All 67 records currently use:

- `cloudflare.zone_status`: `unknown`
- `cloudflare.last_checked`: `null`

Cloudflare status is intentionally deferred to a later audit pass. Do not infer missing zones from
this v0.1 ledger.

## Next Governance Pass

1. Run `npm run domains:governance:check` after any `domains.json` or marker group change.
2. Add a Cloudflare audit pass that records zone status and `last_checked` without changing zone
   settings.
3. Review `strategic_priority` after external intent becomes clearer: keep the v0.1 default of
   `active` unless a domain becomes explicitly core, supporting, or reserve.
4. Re-check Search Console in batches and update `last_checked` only when the property page confirms
   the sitemap row.
