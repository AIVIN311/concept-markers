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

- `networklayer/markers.js`
- `markers.js` (kept in sync as a mirror copy)

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
- `networklayer/markers.js`: shared footer/network rendering logic
- `networklayer/index.html`: minimal network-layer status page
- `run_prettier_all.ps1`: full formatting/check/report workflow
- `PRETTIER_UNIFY.md`: formatting SOP

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
```

Notes:

- `format:all` and `format:check:all` use `run_prettier_all.ps1`.
- `format:all` creates a backup zip in the parent directory unless skipped.

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
