# New Marker Copy Standard (Future Pages Only)

This document defines the authoring standard for new marker pages only.
Existing tracked pages stay unchanged unless a separate request is made.

## Scope

- In scope: content authoring for newly created `*/index.html` marker pages.
- Out of scope: rewriting existing markers, HTML/CSS/JS structure changes, marker runtime changes.

## Stability Contract

- No JavaScript API changes.
- No marker-footer contract changes.
- No URL/canonical/topology behavior changes.
- No schema/type additions.

## Default Copy Profile

- Tone: middle (structural and precise, but not overly academic).
- Bilingual strategy: EN/ZH semantic alignment per paragraph, not literal translation.
- Safety posture: minimal, reversible, behavior-stable edits.

## Required Body Structure

Keep the normal marker page structure and bilingual sections:

- `<section data-lang="en"> ... </section>`
- `<section data-lang="zh"> ... </section>`

Use this 8-paragraph flow in both languages:

1. Reference-point framing of the concept.
2. Clarify what does not solely trigger or define the concept.
3. Convergence mechanisms (3-5 concrete mechanisms).
4. Structural effects on shared systems (trust, coordination, legitimacy, etc.).
5. Explicit non-service/non-prescription disclaimer.
6. Purpose statement (marking a structural transition across concrete systems).
7. Minimalism sentence.
8. Stable-term anchoring sentence.

## Language Rules

- Prefer concrete system nouns (`platforms`, `infrastructures`, `governance mechanisms`) over vague abstractions.
- Avoid dense jargon clusters. Use specialist terms only when they add precision.
- Avoid prescriptive mitigation/regulatory advice unless the concept explicitly requires it.
- Keep disclaimer and purpose lines explicit and separate from marketing language.
- Keep the final anchoring sentence in place:
  - EN: `stable foothold` or `stable place to stand`
  - ZH: `穩定的立足點`

## Authoring Workflow

1. Draft English first using the 8-paragraph flow.
2. Draft Chinese with semantic alignment paragraph-by-paragraph.
3. Copy QA pass against `README.md` and `RELATIONAL_LAYER.md` conventions.
4. Keep runtime behavior unchanged unless separately requested.

## Identity Batch Extension (12-Site Stack)

For the Synthetic Identity Infrastructure Stack batch, copy authoring is additionally constrained by
the identity metadata lock process.

Reference specs:

- `ops/new-sites-locksheet.md` (locksheet schema, bridge rules, identity sentence quality gate)
- `ops/identity-radar-map.md` (spine mapping, JSON-LD identity contract, termset namespace policy)

In case of conflict for the 12-site batch:

- Copy tone/structure stays governed by this file.
- Identity metadata, JSON-LD, and bridge-edge requirements follow the identity batch specs above.

## QA Checklist

Content QA:

1. EN/ZH paragraphs are aligned in meaning and order.
2. Disclaimer paragraph is explicit and non-promotional.
3. Purpose paragraph is explicit and concept-marker oriented.
4. Minimalism line is present.
5. Stable-term anchoring line is present.

Behavior QA:

1. Language toggle still works.
2. Page remains readable if marker/footer script fails.
3. Footer placeholder and marker script include remain intact.
4. No unrelated pages are edited.

Repository verification:

1. `npm run format:check`
2. If `networklayer/markers.js` changed: `npm run markers:audit:strict`
3. `git status --short` includes only intended files.

## Rollback

Revert only the affected new marker files. Do not touch existing tracked markers.

Example:

```powershell
git restore -- <new-marker-folder>/index.html
```
