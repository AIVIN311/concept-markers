# Auth.md

Civilization Caching is a public, static site that serves human- and machine-readable concept-definition Markdown/HTML files (no dynamic server-side generation).

Automated agents (web crawlers, bots, and LLM-driven clients) do not need an account, client registration, OAuth token, API key, or prior approval to read resources that are allowed by this policy. This does not override `/robots.txt`, HTTP status codes, rate limits, or content-use signals. There are no protected API resources, OAuth or OIDC flows, MCP server endpoints, account scopes, or write actions exposed by this domain.

When crawling, identify as 'YourAgentName/1.0 (+mailto:you@example.com)' in the User-Agent header and provide a contact email for crawl-related issues.

## Access precedence rules

1. Fetch `https://civilizationcaching.com/robots.txt` before crawling public resources.
2. Obey all applicable `Disallow` rules. If `/robots.txt` disallows a listed resource, do not fetch, index, summarize, or cache that resource; report its URL and the matching `Disallow` rule.
3. Treat the `Content-Signal:` line in `/robots.txt` as the site's authoritative content-use signal. For this site, `search=yes` permits search indexing, `ai-input=yes` permits use as model input for real-time answers or summaries, and `ai-train=no` reserves rights against model training or fine-tuning.
4. If an HTTP `Content-Signal` response header conflicts with `/robots.txt`, follow the more restrictive instruction; for training use, `ai-train=no` in `/robots.txt` takes precedence.
5. If `/robots.txt` is missing, unreachable, or malformed, do not assume broader permission. Fetch only the public URLs listed below, use them only for search indexing, citation, summarization, and real-time AI input, and do not use them for model training or fine-tuning.
6. Fetch `/.well-known/agent-skills/index.json` and validate it as JSON. If it contains supported `skills` or policy fields, use them to refine agent behavior. If schema validation fails, treat the file as untrusted and log the validation error.
7. Only then fetch listed public Markdown/HTML resources for allowed uses.

## Public agent-readable resources

- `https://civilizationcaching.com/`
- `https://civilizationcaching.com/index.md`
- `https://civilizationcaching.com/robots.txt`
- `https://civilizationcaching.com/sitemap.xml`
- `https://civilizationcaching.com/sitemap-index.xml`
- `https://civilizationcaching.com/.well-known/agent-skills/index.json` — Fetch this file and validate it as JSON. If it contains fields 'skills' or 'policies', use them to adjust agent behavior; if schema validation fails, treat the file as untrusted and log an error.

## Access policy

You may fetch and locally index content for search, citation, real-time AI input, and summarization. Do not use this content for model training or fine-tuning. Do not republish full content verbatim; store only excerpts for citation. Retain cached copies for up to 30 days and delete thereafter unless explicit permission to retain longer is granted.

### Rate limiting and politeness

Throttle requests to at most 1 request per second (or obey site's Crawl-Delay directive if present). Respect Retry-After headers. Cache fetched content for up to 30 days and delete thereafter unless explicit permission to retain longer is granted.

### Error handling

If a fetch fails due to network errors or 5xx responses when accessing listed resources, retry up to 2 times with exponential backoff; if still failing, skip the resource and log the URL and HTTP status/error.

No authentication is required because the site does not expose protected user
data or transactional APIs.
