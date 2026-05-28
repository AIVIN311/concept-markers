# Domain Governance Ledger v0.2

This is the human-readable Cloudflare governance snapshot for `ops/domain-governance-ledger.v0.2.json`.
The JSON ledger is canonical.

## Snapshot

- Snapshot date: `2026-05-28`
- Total domains: `67`
- Scope: Cloudflare zone status, security settings, agent access rule, homepage access, and `index.md` access
- Mutation policy: read-only snapshot; no Cloudflare settings were changed by this pass
- Web Bot Auth: deferred; no `/.well-known/http-message-signatures-directory` support is declared

## Cloudflare Zone Status

| zone_status | count |
| ----------- | ----: |
| `active` |    67 |

## Public Access Checks

- Homepage challenged: `0`
- Missing Link header: `0`
- Markdown artifact issues: `0`
- Records with recommendations: `0`

## Recommendations

- None.

## Next Pass

1. Fix recommendations in small batches only.
2. Keep Web Bot Auth deferred until key management and response signing are designed.
3. Re-run `npm run cloudflare:governance:snapshot` after Cloudflare or Pages deploy changes.
