# Phase 4 Copy Harmonization Spec

Status: Draft v0.1 - audit first, no bulk rewrite

## Purpose

Phase 4 defines how existing concept-marker pages may be copy-audited and gently harmonized after
the Phase 3 machine-semantic pilot stabilizes.

The goal is to make the 67-domain network feel like one coherent reference system without making
every page read like a template.

## Principle

Unify the structural grammar. Preserve the individual concept voice.

This means:

- Yes: consistent page roles, paragraph jobs, disclaimers, and final anchoring lines.
- No: flattening every marker into identical SEO copy.
- No: adding stories, examples, or occurrence notes directly into marker HTML by default.

## Scope

In scope:

- Audit existing `*/index.html` body copy against the canonical marker grammar.
- Identify pages with missing disclaimer, purpose, minimalism, or stable-anchor language.
- Propose small copy-only edits for a limited pilot batch.
- Preserve bilingual EN/ZH paragraph alignment.

Out of scope unless explicitly requested:

- Bulk rewrite of all 67 pages.
- Runtime JavaScript changes.
- `networklayer/markers.js` changes.
- URL, canonical, sitemap, robots, or topology changes.
- Human story / occurrence sections inside marker pages.
- SEO landing-page conversion copy.

## Relationship To Existing Standards

This spec extends, but does not replace, `ops/new-marker-copy-standard.md`.

The existing standard governs newly created pages. This Phase 4 spec governs existing pages and
therefore uses a lighter touch:

- Existing pages do not need identical phrasing.
- Existing pages should satisfy the same structural jobs.
- Edits should be copy-only and reversible.

## Canonical Marker Grammar

Each existing marker page should be auditable against this 8-part grammar:

1. Reference-point framing of the concept.
2. Clarification of what does not solely define the concept.
3. Convergence mechanisms or conditions.
4. Structural effects on shared systems.
5. Explicit non-service / non-prescription disclaimer.
6. Purpose statement that marks the concept as a structural phenomenon.
7. Minimalism sentence.
8. Stable-term anchoring sentence.

Acceptable variation:

- Some pages may use 7-10 paragraphs if the jobs remain clear.
- The disclaimer can be one or two paragraphs.
- The final anchor may say `stable place to stand` or `stable foothold`.
- ZH copy may be semantically aligned rather than literal.

Non-acceptable drift:

- Turning a marker into a blog post.
- Adding promotional calls to action.
- Adding advice, tools, diagnostics, legal interpretation, or product claims.
- Removing the no-tracking / no-analytics / no-call-to-action posture.
- Making the page depend on marker/footer rendering to remain readable.

## Tone Rules

Default tone:

- structural
- precise
- quiet
- non-promotional
- non-alarmist
- readable by humans, stable for machines

Avoid:

- hype language
- marketing value propositions
- speculative prediction voice
- dense jargon clusters
- over-explaining obvious concepts
- moralizing the phenomenon instead of marking it

Prefer:

- concrete system nouns
- modest verbs like `emerges`, `marks`, `examines`, `defines`, `becomes visible`
- explicit boundaries between naming, advocacy, services, and examples

## Bilingual Alignment

EN and ZH should carry the same conceptual work in the same order.

Required checks:

- Same paragraph jobs appear in both languages.
- ZH is not a shortened summary of EN.
- EN is not a literal back-translation of ZH.
- Final anchoring line remains present in both languages.

Allowed variation:

- ZH may use more natural phrasing when literal translation would sound mechanical.
- EN/ZH sentence counts may differ if paragraph-level meaning stays aligned.

## Existing Page Audit Buckets

Use these labels when auditing:

- `pass`: structure and tone are already aligned; no edit recommended.
- `minor-copy`: small phrasing change recommended.
- `missing-job`: one canonical paragraph job is absent or unclear.
- `bilingual-drift`: EN/ZH paragraph meanings diverge.
- `template-risk`: page is too generic or reads like repeated boilerplate.
- `over-explained`: page contains more explanation than a marker page needs.

## Pilot Batch

Do not start with all 67 pages.

Recommended first audit batch:

- `civilizationcaching/index.html`
- `modelautophagy/index.html`
- `jurisdictionaldrift/index.html`
- `syntheticpersonhood/index.html`
- `computationalsovereignty/index.html`

Reason:

- Covers civilization, synthetic systems, governance, identity, and infrastructure.
- Includes pages that are likely to become external citation anchors.
- Keeps the pilot small enough to review line by line.

## Implementation Policy

Phase 4 copy harmonization should proceed in three stages.

1. Audit only
   - Create an audit table under `docs/tasks/` or `ops/`.
   - Record page bucket, missing jobs, and whether an edit is recommended.
   - Do not modify HTML in the audit step.

2. Five-page pilot
   - Edit only the pilot batch.
   - Keep changes copy-only inside `section[data-lang]`.
   - Do not alter head metadata, scripts, footer, topology, or styling.

3. Expansion decision
   - Expand only after review of the pilot diff.
   - Batch by concept axis, not by the entire repo at once.
   - Keep each batch small enough to reverse.

## Verification

Every Phase 4 copy-edit batch must run:

```powershell
npm run format:check
npm run markers:audit:strict
git diff --check
git status --short
```

Manual verification:

- Language toggle still works on edited pages.
- Page remains readable if marker script fails.
- Footer placeholder and marker script include remain intact.
- EN/ZH paragraphs remain semantically aligned.

## Rollback

Rollback should target only the edited marker pages.

Example:

```powershell
git restore -- modelautophagy/index.html jurisdictionaldrift/index.html
```

Do not roll back Phase 3 machine-semantic files while reverting Phase 4 copy edits unless the task
explicitly asks for that.
