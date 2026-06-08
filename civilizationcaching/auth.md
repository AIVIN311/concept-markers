# Auth.md

Civilization Caching is a public, static site that serves human- and machine-readable concept-definition Markdown/HTML files (no dynamic server-side generation).

Automated agents (web crawlers, bots, and LLM-driven clients) do not need to register or authenticate before reading public pages on this site. However, all access must comply with the Access precedence rules below, including `/robots.txt` and Content-Signal directives. There are no protected API resources, OAuth or OIDC flows, MCP server endpoints, account scopes, or write actions exposed by this domain.

When crawling, identify as 'YourAgentName/1.0 (+mailto:you@example.com)' in the User-Agent header and provide a contact email for crawl-related issues.

## Access precedence rules

1. Check `/robots.txt` and obey its Disallow rules.
2. If a site-provided Content-Signal directive exists at `/.well-known/content-signal.json`, parse it and follow its precedence rules.
3. If it conflicts with `/robots.txt`, follow the directive that explicitly lists precedence. If neither lists precedence, follow `/robots.txt`.
4. Fetch `/.well-known/agent-skills/index.json` and validate it as JSON. If it contains fields 'skills' or 'policies', use them to adjust agent behavior; if schema validation fails, treat the file as untrusted and log an error.
5. Only then fetch listed public Markdown/HTML resources for allowed uses.
6. If `/robots.txt` disallows access to any listed resource, do not fetch, index, or summarize that resource; report its URL and the Disallow rule used.
7. If the Content-Signal directive is missing or malformed, default to obeying `/robots.txt` and log the parsing error.

## Public agent-readable resources

- `https://civilizationcaching.com/`
- `https://civilizationcaching.com/index.md`
- `https://civilizationcaching.com/robots.txt`
- `https://civilizationcaching.com/sitemap.xml`
- `https://civilizationcaching.com/sitemap-index.xml`
- `https://civilizationcaching.com/.well-known/agent-skills/index.json` — Fetch this file and validate it as JSON. If it contains fields 'skills' or 'policies', use them to adjust agent behavior; if schema validation fails, treat the file as untrusted and log an error.

## Access policy

You may fetch and locally index content for semantic search and summarization. Do not republish full content verbatim; store only excerpts for citation. Retain cached copies for up to 30 days and delete thereafter unless explicit permission to retain longer is granted.

### Rate limiting and politeness

Throttle requests to at most 1 request per second (or obey site's Crawl-Delay directive if present). Respect Retry-After headers. Cache fetched content for up to 30 days and delete thereafter unless explicit permission to retain longer is granted.

### Error handling

If a fetch fails due to network errors or 5xx responses when accessing listed resources, retry up to 2 times with exponential backoff; if still failing, skip the resource and log the URL and HTTP status/error.

No authentication is required because the site does not expose protected user
data or transactional APIs.
