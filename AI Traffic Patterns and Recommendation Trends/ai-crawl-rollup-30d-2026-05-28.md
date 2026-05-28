# AI Crawler 30d Local Rollup

This rollup is built only from local 24-hour JSON snapshots. It is read-only and does not change Cloudflare settings.

## Summary

- Reports included: `2`
- Window: `2026-05-26T11:24:38.481Z` to `2026-05-28T14:45:35.651Z`
- Total AI crawler requests: `17090`
- 2xx successful requests: `16494`
- Non-2xx requests: `596`
- 2xx success rate: `96.5%`
- Bandwidth: `49.8 MB`
- Top operators: Microsoft: 13470, Anthropic: 2313, OpenAI: 665, Google: 596, Amazon: 26, Apple: 10, Meta: 6, ByteDance: 4
- Top crawlers: BingBot: 13470, ClaudeBot: 2313, Googlebot: 596, OAI-SearchBot: 438, GPTBot: 223, Amazonbot: 26, Applebot: 10, Meta-ExternalAgent: 6, Bytespider: 4, ChatGPT-User: 4

## Scanner-Like Paths

```text
Path                                                                                    Requests Reasons
/%2525252525252525252525252525252525252525252525252525252525252525252525252525252...         10 encoded-traversal-or-fuzzing, long-encoded-path
/billing/%25252525252525252525252525252525252525252525252525252525252525252525252...         10 billing-path-probe, encoded-traversal-or-fuzzing
/app/.env                                                                                     7 environment-file-probe
/.env.staging                                                                                 5 environment-file-probe
/..;/..;/.env                                                                                 4 encoded-traversal-or-fuzzing, environment-file-probe
/.env.                                                                                        4 environment-file-probe
/.env.dev.local                                                                               4 environment-file-probe
/.env.dist                                                                                    4 environment-file-probe
/.env.local                                                                                   4 environment-file-probe
/.env.stage                                                                                   4 environment-file-probe
/.env%252523                                                                                  4 encoded-traversal-or-fuzzing
/%25c0%25ae%25c0%25af.env                                                                     4 encoded-traversal-or-fuzzing
/docker/.env                                                                                  4 environment-file-probe
/__nextjs_action/%252525252525252525252525252525252525252525252525252525252525252...          3 encoded-traversal-or-fuzzing, long-encoded-path
/.env.sample                                                                                  3 environment-file-probe
/.env.template                                                                                3 environment-file-probe
/%2525252ferror%2525252f%2525252eenv                                                          3 encoded-traversal-or-fuzzing
/auth/%25252525252525252525252525252525252525252525252525252525252525252525252525...          3 encoded-traversal-or-fuzzing
/console/%25252525252525252525252525252525252525252525252525252525252525252525252...          3 encoded-traversal-or-fuzzing
/current/.env                                                                                 3 environment-file-probe
```

## Domain Attention Queue

```text
Host                                                           Requests  Success  Non-2xx  Scanner
syntheticlegalentity.com                                       1475    98.7%       19       20
hybridpersonhood.com                                           1058    99.5%        5       20
biometricliability.com                                          263    97.7%        6       19
invisibledetermination.com                                      339    98.2%        6       17
computationalscarcity.com                                       936    99.5%        5       17
climateinterventionism.com                                      562    98.4%        9       13
aurumreserveprotocol.com                                        306    99.3%        2       13
computationalsovereignty.com                                    440    98.4%        7       12
orbitallockdown.com                                             266    97.7%        6       12
biometricsovereignty.com                                        237    94.1%       14       11
energyjurisdiction.com                                          301    95.3%       14       11
syntheticjurisdiction.com                                       137    94.9%        7       11
thefutureisalreadyhereitisjustnotevenlydistributed.com          305    98.0%        6       11
algorithmicenforcement.com                                      298    98.3%        5       11
theageoffusion.com                                              169    97.0%        5       11
offworldassetrights.com                                         361    98.9%        4       11
cognitiveassetclass.com                                         266    98.9%        3       11
offworldpersonhood.com                                          365    99.2%        3       11
automatedjurisprudence.com                                      547    89.9%       55       10
postfiatreservesystems.com                                      247    78.5%       53       10
civilizationcaching.com                                         417    92.1%       33       10
theanswerisblowininthewind.com                                  195    91.8%       16       10
thefirstmarscitizen.com                                         407    96.1%       16       10
lunarresourceprotocol.com                                       335    96.1%       13       10
modelautophagy.com                                              266    95.1%       13       10
```

## Policy Posture

- Keep discovery crawlers allowed/observed.
- Keep public paths accessible: `/`, `/index.md`, `/robots.txt`, `/sitemap.xml`.
- Treat scanner-like paths as the security focus.
- Do not infer a need for Zero Trust, R2, D1, Turnstile, AI Gateway, or Pay Per Crawl enforcement from this rollup alone.

## Included Reports

- `2026-05-27`: `AI Traffic Patterns and Recommendation Trends/ai-crawl-24h-overview-2026-05-27.json`
- `2026-05-28`: `AI Traffic Patterns and Recommendation Trends/ai-crawl-24h-overview-2026-05-28.json`
