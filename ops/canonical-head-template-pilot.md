# Canonical Head Template (Pilot Only)

This template is for crawler-readability improvements without changing the "network monument" voice.

## Scope

- Single-page pilot only: `civilizationcaching/index.html`
- No bulk rollout in this phase
- Template-level changes only (`<head>` + machine-readable metadata)
- Keep body narrative style unchanged

## Canonical Head Template (Minimal)

```html
<title>{{TITLE_EN_ZH}}</title>
<meta name="description" content="{{BILINGUAL_DESCRIPTION}}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="{{ABSOLUTE_URL}}" />

<meta property="og:title" content="{{TITLE_EN_ZH}}" />
<meta property="og:description" content="{{DESCRIPTION_EN}}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="{{ABSOLUTE_URL}}" />
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="zh_TW" />

<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="{{TITLE_EN_ZH}}" />
<meta name="twitter:description" content="{{DESCRIPTION_EN}}" />

<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "{{NAME_EN}}",
    "alternateName": "{{NAME_ZH}}",
    "url": "{{ABSOLUTE_URL}}",
    "inLanguage": ["en", "zh-Hant"],
    "description": "{{DESCRIPTION_EN}}",
    "about": {{ABOUT_KEYWORDS_JSON_ARRAY}}
  }
</script>
```

## 30-Day Observation Spec

Observe for 30 days before any expansion.

1. Search snippet stability
   - Are title and description snippets more consistent across crawls?
2. Machine extraction completeness
   - Are structured fields (name, description, language, about) extractable from JSON-LD?
3. Human audit
   - Monument tone remains intact in the body.
   - Neutrality and definitional clarity are not weakened.
4. Safety
   - Marker/footer rendering behavior remains unchanged.

## Rollback (Safe + Reversible)

If pilot quality drops, revert only the pilot files:

```powershell
git restore -- civilizationcaching/index.html ops/canonical-head-template-pilot.md
```

Then verify:

```powershell
npm run format:check
git status --short
```
