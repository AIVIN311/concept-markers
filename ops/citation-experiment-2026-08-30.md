# Citation experiment — 2026-08-30

## Goal

Test whether replacing an indirect opening with one natural, independently quotable definition is followed by observable changes in crawler-family attention or answer-engine source appearance.

This is a bounded pilot, not a claim that wording causes citation or that content length determines ranking.

## Sites and roles

| Site                           | Role                                  | Intervention                                                                                                                                                  |
| ------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `offworldassetrights.com`      | Existing partial-visibility reference | None                                                                                                                                                          |
| `jurisdictionaldrift.com`      | Unchanged control                     | None                                                                                                                                                          |
| `computationalsovereignty.com` | Intervention                          | Replace only the indirect opening with a direct natural-language definition; keep page depth, title, H1, metadata, crawler rules, links, and structure stable |

## T0 source hashes

Recorded before the local intervention:

| File                                  | SHA-256                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| `offworldassetrights/index.html`      | `0A5D6E028539D19F71BC756B7BCEF0599B2D1BE91E4651C5731F59C2AF2D63B5` |
| `offworldassetrights/index.md`        | `D9212328A3A6E1791AA7242B33FAA69F5C03352D0ED9BBE39173AAB3F925E0E8` |
| `jurisdictionaldrift/index.html`      | `9E96A9D6C5CD079D8D6FBC74EC6D49E2F04DD767F325592D60E567C5039830DC` |
| `jurisdictionaldrift/index.md`        | `1815012AEA026767373E6432E31A43BCEAB9B20FBFB60B564F4B4D43DEDC9BE4` |
| `computationalsovereignty/index.html` | `0B8B324C34E1373BAECD3AE32D5BD474F5208B8685C6FB840EF8EB9022E9F9FE` |
| `computationalsovereignty/index.md`   | `1FC84FC91E57286F1C7CF22FE221559DD881F9DCD76EDA880088CBFB2B97CE90` |

## Fixed question families

Run the same questions before and after deployment, recording timestamp, product/mode, answer mention, source appearance, source position, and whether wording is actually attributable to the page.

1. Exact host: `What is on computationalsovereignty.com?`
2. Joined label: `What is computationalsovereignty?`
3. Natural term: `What is computational sovereignty?`
4. Explanatory: `Explain computational sovereignty.`
5. Semantic: `Who should govern access to the computing infrastructure used to train and operate digital systems?`

Equivalent concept-specific questions should be used for the two comparison sites.

## Observation limits

- Current Machine Attention data is daily and host-level, not per-request or per-path raw logging.
- Provider-family counts are based on observed User-Agent strings and are not all IP-verified.
- Current Perplexity, OpenAI, and Anthropic totals combine crawler purposes; they cannot yet prove that an indexing crawler read the deployed version.
- Source appearance can vary without a site change. The unchanged control is required to measure that background instability.

## Deployment record

- Deployment was separately authorized after the local intervention was prepared.
- Cloudflare Pages project: `computationalsovereignty`
- Deployment URL: `https://62b36f7b.computationalsovereignty.pages.dev`
- Public verification completed at approximately `2026-08-30T21:49:00+08:00`.
- Before deployment, the public homepage returned the old opening and `CF-Cache-Status: HIT`.
- The Pages deployment URL returned the new definition and not the old opening.
- A file-scoped cache purge succeeded for `/`, `/index.html`, and `/index.md` on the apex and `www` hosts; no whole-zone purge was used.
- After purge, the apex homepage, apex `index.md`, and `www` homepage returned HTTP 200, `CF-Cache-Status: MISS`, and the new definition. The old opening was absent.
- Post-intervention source hashes:
  - `computationalsovereignty/index.html`: `B07E363BBFE4F8C5037D5BB240E61143258A7908F11A376A5BF5AF14AEA8748C`
  - `computationalsovereignty/index.md`: `96933E69075F9A9266B23402FE17A914C199BA085D0CD64B51BB6D3AB2223F24`
- Local pre/post public captures and verification metadata are stored under `_ops/citation-experiment-2026-08-30/` and remain untracked operational evidence.

## Verification

- Run `npm run format:check`.
- Confirm only the intervention page pair and this experiment record changed.
- Preserve the existing manually observed citation baseline alongside the fixed T0 questions before interpreting post-deployment results.
- The public HTML and Markdown were verified as the new version; post-intervention crawler and citation observations may now begin.
