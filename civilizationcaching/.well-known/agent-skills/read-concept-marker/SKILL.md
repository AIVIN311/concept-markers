---
name: read-concept-marker
description: Read and interpret the public Civilization Caching concept marker without assuming API, OAuth, MCP, or write capabilities.
---

# Read Concept Marker

Use this skill when an agent needs to read, summarize, cite, or compare the
Civilization Caching concept marker.

## Scope

This site is static public content. It exposes no backend API, OAuth/OIDC
issuer, MCP server, payment endpoint, account system, or write action.

## Preferred Reading Order

1. Fetch `https://civilizationcaching.com/index.md` for the canonical
   agent-readable Markdown page.
2. Use `https://civilizationcaching.com/` when HTML metadata, canonical tags, or
   JSON-LD structure are needed.
3. Use `https://civilizationcaching.com/sitemap.xml` and
   `https://civilizationcaching.com/sitemap-index.xml` for URL discovery.
4. Use `https://civilizationcaching.com/robots.txt` for crawler directives and
   content signals.

## Interpretation Notes

- Treat the page as a concept marker, not as a product, service, or API.
- Preserve the bilingual English and Traditional Chinese framing when
  summarizing.
- Do not infer authentication, registration, MCP tools, OAuth scopes, or
  commerce features from this domain.
- When citing, prefer the canonical URL `https://civilizationcaching.com/`.
