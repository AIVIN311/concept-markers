# Phase 3 Machine Semantic Layer Spec

Status: Draft v0.2 - single-page pilot only

## Purpose

Phase 3 institutionalizes the machine-verifiable origin layer for the concept-marker network.
The goal is not more traffic, SEO copy, or human-facing explanation. The goal is to make the
origin of a term readable as structured, stable, versioned machine context.

This spec defines the smallest semantic contract that can be tested on one page before any broader
rollout.

## Guardrails

- Default rule: no HTML modifications in Phase 3.
- Pilot exception: `civilizationcaching/index.html` may receive a head-only JSON-LD update.
- No bulk rollout to the full domain set.
- No visible `firstDefined` timestamps in marker body copy.
- No human occurrence stories in marker HTML.
- No changes to `networklayer/markers.js` for this pilot.

## Pilot Target

- Page: `civilizationcaching/index.html`
- Scope: replace the existing JSON-LD pilot block only.
- Body copy: unchanged.
- Footer and marker behavior: unchanged.
- Term set namespace: `https://civilizationcaching.com/termsets/v1/core`

## Core Contract Fields

| Local field        | JSON-LD representation                       | Required | Notes                                                                 |
| ------------------ | -------------------------------------------- | -------- | --------------------------------------------------------------------- |
| `firstDefined`     | `dateCreated`                                | yes      | ISO date only, no time. First pilot value: `2024-11-01`.              |
| `termVersion`      | `version`                                    | yes      | First pilot value: `v1.0`. Increment only when definition changes.    |
| `DefinedTermSet`   | `@type: DefinedTermSet` plus canonical `@id` | yes      | Pilot `@id`: `https://civilizationcaching.com/termsets/v1/core`.      |
| `inDefinedTermSet` | `inDefinedTermSet`                           | yes      | Use the canonical URL, not the string `Distributed Concept Markers`.  |
| `related`          | `relatedLink` on the `WebPage` node          | no       | Max 3 pilot URLs, sourced from local topology / `meta[name=related]`. |

Compatibility note:

- `firstDefined` and `termVersion` are internal contract names.
- The emitted schema.org JSON-LD should prefer standard terms: `dateCreated` and `version`.
- Do not emit raw custom keys until a namespace policy is introduced.

## Schema.org Alignment

Use official schema.org terms where possible:

- `DefinedTermSet`
- `DefinedTerm`
- `hasDefinedTerm`
- `inDefinedTermSet`
- `termCode`
- `relatedLink`

`relatedLink` is attached to the WebPage node because schema.org defines it for pages, while the
term-set relationship is represented through `hasDefinedTerm` and `inDefinedTermSet`.

## Pilot JSON-LD

Use an `@graph` so the page keeps its existing WebPage readability while adding the canonical
term-set object.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://civilizationcaching.com/#webpage",
      "name": "Civilization Caching",
      "alternateName": "文明緩存",
      "url": "https://civilizationcaching.com/",
      "inLanguage": ["en", "zh-Hant"],
      "description": "A concept marker for examining how civilizations store, accumulate, and reuse structures, knowledge, and systems over time.",
      "about": [
        "civilization caching",
        "institutional memory",
        "knowledge continuity",
        "infrastructural persistence"
      ],
      "mainEntity": {
        "@id": "https://civilizationcaching.com/termsets/v1/core"
      },
      "relatedLink": ["https://defaultpower.com/", "https://civilizationprotocols.com/"]
    },
    {
      "@type": "DefinedTermSet",
      "@id": "https://civilizationcaching.com/termsets/v1/core",
      "name": "Civilization Caching Core Terms",
      "url": "https://civilizationcaching.com/",
      "dateCreated": "2024-11-01",
      "version": "v1.0",
      "creator": {
        "@type": "Organization",
        "name": "civilizationcaching.com",
        "url": "https://civilizationcaching.com/"
      },
      "hasDefinedTerm": [
        {
          "@type": "DefinedTerm",
          "@id": "https://civilizationcaching.com/#civilization-caching",
          "name": "Civilization Caching",
          "alternateName": "文明緩存",
          "url": "https://civilizationcaching.com/",
          "description": "A concept marker for examining how civilizations store, accumulate, and reuse structures, knowledge, and systems over time.",
          "termCode": "civilization-caching",
          "dateCreated": "2024-11-01",
          "inDefinedTermSet": "https://civilizationcaching.com/termsets/v1/core"
        }
      ]
    }
  ]
}
```

## Future Individual Term Template

Do not roll this out during the pilot. This is the future page-level shape after validation.

```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "@id": "https://modelautophagy.com/#model-autophagy",
  "name": "Model Autophagy",
  "alternateName": "模型自噬",
  "url": "https://modelautophagy.com/",
  "description": "A concept marker for examining how AI systems increasingly consume, recycle, and train on their own generated outputs rather than independent human data sources.",
  "termCode": "model-autophagy",
  "dateCreated": "2024-11-01",
  "inDefinedTermSet": "https://civilizationcaching.com/termsets/v1/core",
  "isPartOf": {
    "@id": "https://civilizationcaching.com/termsets/v1/core"
  }
}
```

## Pilot Verification

Local verification:

1. JSON-LD parses as valid JSON.
2. `npm run format:check` passes.
3. `git status --short` contains only the intended files.

External observation:

1. Validate with schema.org validator.
2. Observe crawl logs for 14-30 days.
3. Record extraction or crawl observations under `docs/tasks/` before expanding.

## What Not To Do

- Do not add stories or occurrence notes to marker HTML.
- Do not add visible timestamps to body copy.
- Do not modify `networklayer/markers.js`.
- Do not update all existing `DefinedTerm` pages yet.
- Do not replace existing topology rules with JSON-LD-only topology.

## Phase 4 Handoff

After pilot validation, create `docs/occurrences/` for human-readable field notes. Start with at
most three terms:

- `modelautophagy.com`
- `jurisdictionaldrift.com`
- `syntheticpersonhood.com`

Occurrence notes should link back to marker pages, not replace marker-page minimalism.
