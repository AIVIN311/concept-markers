# Concept Markers

Static concept-marker websites connected by a shared footer network.

This project is static-only (Cloudflare Pages style): no backend, no API server, no database.

## Purpose

This repository hosts a distributed reference series of concept pages.  
Each concept has its own folder and `index.html`, while a shared marker script renders:

- grouped related sites
- series-aware auto-expansion
- optional `Closest links` from page metadata

The main shared logic is in:

- `networklayer/markers.js` (single source of truth)

## Relational Layer

The repository also defines a relational layer for how domains connect as a structural topology.
This layer is architecture-first: it maps authority formation, allocation mechanics, synthetic
stability, and civilizational horizon interactions across core nodes.

中文摘要：
本專案不只管理單頁內容，也定義節點之間的關係層結構。
完整版本說明各軸線、鏡像分工與 Closest links 規則，作為長期維護基準。

[Read the full relational architecture](./RELATIONAL_LAYER.md)

## Project Layout

- `<domain>/index.html`: individual concept pages (one folder per domain)
- `domains.json`: canonical domain inventory (folder <-> host mapping)
- `domains.schema.json`: schema contract for `domains.json`
- `networklayer/markers.js`: shared footer/network rendering logic
- `networklayer/index.html`: minimal network-layer status page
- `infra/www-to-apex-redirects-v1.csv`: generated WWW->apex redirect rules
- `infra/www-to-apex-redirects.schema.json`: row-level CSV schema contract (for parsed rows)
- `run_prettier_all.ps1`: full formatting/check/report workflow
- `PRETTIER_UNIFY.md`: formatting SOP

## Marker Source Contract

- Canonical source: `networklayer/markers.js`
- Root `markers.js` is optional and not required for normal maintenance.
- `markers:audit` / `markers:audit:strict` will use a virtual in-memory mirror when root
  `markers.js` is missing.

## Domain Inventory Contract

- Canonical source: `domains.json`
- All `generate_*` scripts read `domains.json` instead of scanning folders.
- `domains.json` row contract is documented by `domains.schema.json`.
- `npm run domains:validate` is the guardrail before generation tasks.
- Redirect CSV schema design is documented in `infra/www-to-apex-redirects.schema.json`.

## Runbook (運行手冊)

1. Q: Where to change when adding a new site?  
   A: Only change `domains.json` and add `<folder>/index.html`.  
   中文：新增站點只改 `domains.json` 與 `<folder>/index.html`。  
   Details:
   - Add one row in `domains.json`: `{ "folder": "...", "host": "..." }`
   - Add `<folder>/index.html`
   - `host` must be lowercase canonical form
   - `folder` must be a single path segment (no `/` or `\`)

2. Q: What is the standard validation flow (one-click)?  
   A: Run `npm run verify:all`.  
   中文：標準驗證流程一鍵執行 `npm run verify:all`。  
   Internal order:
   1. `npm run domains:validate`
   2. `npm run redirects:generate`
   3. `npm run sitemaps:generate`
   4. `npm run sitemaps:index`
   5. `npm run sitemaps:validate`
   6. `npm run robots:generate`
   7. `npm run markers:audit:strict`
   8. `npm run format:check`

3. Q: What outputs are generated, and what must not be committed?  
   A: Commit tracked generated artifacts when changed; do not commit local ops artifacts.  
   中文：追蹤中的生成檔有變更就提交；本地運維輸出不要提交。  
   Commit when changed:
   - `infra/www-to-apex-redirects-v1.csv`
   - `<domain>/sitemap.xml`
   - `civilizationcaching/sitemap-index.xml`
   - `<domain>/robots.txt`

   Do not commit:
   - `_ops/` (already gitignored)

## Page Conventions

Each page should include:

1. `data-series` on `<html>` (example: `governance`, `monetary`, `civilization`)
2. `#markerFooter` in the page footer
3. marker script include:
   - `https://networklayer-bnf.pages.dev/markers.js?v=...`

Optional:

- `meta[name="related"]` for local nearest-neighbor links.

## Formatting and Validation

Formatting rules are defined by:

- `.prettierrc.json`
- `.prettierignore`
- `.editorconfig`

Commands:

```bash
npm run format
npm run format:check
npm run format:all
npm run format:check:all
npm run domains:validate
npm run markers:audit
npm run markers:audit:strict
npm run redirects:generate
npm run sitemaps:generate
npm run sitemaps:index
npm run robots:generate
```

Notes:

- `format:all` and `format:check:all` use `run_prettier_all.ps1`.
- `format:all` creates a backup zip in the parent directory unless skipped.
- Marker audit reports are written to `_ops/markers-audit-summary.json` and
  `_ops/markers-audit-mismatch.json`.

Pilot template note:

- Canonical crawler/head pilot spec: `ops/canonical-head-template-pilot.md`

## Deployment Notes

- Keep `markers.js?v=...` token aligned across pages to avoid cache/version drift.
- When `networklayer/markers.js` changes, deploy it first, then update token as needed.

## Current Scope

This is a static-site repository.  
No build pipeline or `src/` tree is required unless the architecture changes.

## Multi-TLD Mirrors (.com / .ai / .systems)

Some concepts may exist as a multi-TLD set (e.g., `.com` + `.ai` + `.systems`).

Recommended meaning:

- `.com` : canonical concept page (general definition)
- `.ai` : model / inference layer (scoring, prediction, policy-as-model)
- `.systems` : infrastructure / control-plane layer (quotas, gates, defaults)

Implementation options:

1. Full pages: each TLD has its own folder + `index.html`, and appears in footer groups.
2. Redirect-only: use `_redirects` to forward `.ai/.systems` to `.com` (avoid blank sites).

If full pages are used, add `meta[name="related"]` to connect the mirror set.
