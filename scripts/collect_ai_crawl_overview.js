const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const domainsPath = path.join(root, "domains.json");
const reportDir = path.join(root, "AI Traffic Patterns and Recommendation Trends");

const crawlerDefinitions = [
  { key: "gptbot", crawler: "GPTBot", operator: "OpenAI", pattern: "GPTBot" },
  { key: "chatgptUser", crawler: "ChatGPT-User", operator: "OpenAI", pattern: "ChatGPT-User" },
  { key: "oaiSearchBot", crawler: "OAI-SearchBot", operator: "OpenAI", pattern: "OAI-SearchBot" },
  { key: "claudeBot", crawler: "ClaudeBot", operator: "Anthropic", pattern: "ClaudeBot" },
  {
    key: "claudeSearchBot",
    crawler: "Claude-SearchBot",
    operator: "Anthropic",
    pattern: "Claude-SearchBot",
  },
  { key: "claudeUser", crawler: "Claude-User", operator: "Anthropic", pattern: "Claude-User" },
  {
    key: "perplexityBot",
    crawler: "PerplexityBot",
    operator: "Perplexity",
    pattern: "PerplexityBot",
  },
  {
    key: "perplexityUser",
    crawler: "Perplexity-User",
    operator: "Perplexity",
    pattern: "Perplexity-User",
  },
  { key: "googlebot", crawler: "Googlebot", operator: "Google", pattern: "Googlebot" },
  {
    key: "googleCloudVertexBot",
    crawler: "Google-CloudVertexBot",
    operator: "Google",
    pattern: "Google-CloudVertexBot",
  },
  { key: "bingbot", crawler: "BingBot", operator: "Microsoft", pattern: "bingbot" },
  { key: "bytespider", crawler: "Bytespider", operator: "ByteDance", pattern: "Bytespider" },
  { key: "ccbot", crawler: "CCBot", operator: "Common Crawl", pattern: "CCBot" },
  {
    key: "metaExternalAgent",
    crawler: "Meta-ExternalAgent",
    operator: "Meta",
    pattern: "meta-externalagent",
  },
  {
    key: "metaExternalFetcher",
    crawler: "Meta-ExternalFetcher",
    operator: "Meta",
    pattern: "meta-externalfetcher",
  },
  { key: "facebookBot", crawler: "FacebookBot", operator: "Meta", pattern: "FacebookBot" },
  { key: "applebot", crawler: "Applebot", operator: "Apple", pattern: "Applebot" },
  { key: "amazonbot", crawler: "Amazonbot", operator: "Amazon", pattern: "Amazonbot" },
  {
    key: "duckAssistBot",
    crawler: "DuckAssistBot",
    operator: "DuckDuckGo",
    pattern: "DuckAssistBot",
  },
  { key: "mistralUser", crawler: "MistralAI-User", operator: "Mistral", pattern: "MistralAI-User" },
];

const publicDiscoveryPaths = new Set(["/", "/index.md", "/robots.txt", "/sitemap.xml"]);
const normalDiscoveryCrawlers = new Set([
  "BingBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Googlebot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
]);

function scannerReasonsForPath(value) {
  const pathValue = value || "";
  const lower = pathValue.toLowerCase();
  const reasons = [];

  if (/(^|\/)\.env(?:[./_-]|$)|%65%6e%76|aws\.env\.json/.test(lower)) {
    reasons.push("environment-file-probe");
  }
  if (/(^|\/)\.git(?:\/|$)|(^|\/)\.github(?:\/|$)|(^|\/)\.gitlab/i.test(pathValue)) {
    reasons.push("git-metadata-probe");
  }
  if (/wp-login\.php|\/wp-admin(?:\/|$)|xmlrpc\.php/i.test(pathValue)) {
    reasons.push("wordpress-probe");
  }
  if (/\/billing\//i.test(pathValue)) {
    reasons.push("billing-path-probe");
  }
  if (/%25/i.test(pathValue) || /%c0%ae/i.test(lower) || /\.\.;|\.\.%2f|\.\.%252f/i.test(lower)) {
    reasons.push("encoded-traversal-or-fuzzing");
  }
  if (pathValue.length > 160 && /%/i.test(pathValue)) {
    reasons.push("long-encoded-path");
  }

  return reasons;
}

function addScannerHit(map, pathValue, count, crawler, operator) {
  const reasons = scannerReasonsForPath(pathValue);
  if (reasons.length === 0) return;

  const key = pathValue || "(unknown)";
  const existing = map.get(key) || {
    path: key,
    count: 0,
    reasons: new Set(),
    crawlers: new Map(),
    operators: new Map(),
  };

  existing.count += count;
  reasons.forEach((reason) => existing.reasons.add(reason));
  increment(existing.crawlers, crawler, count);
  increment(existing.operators, operator, count);
  map.set(key, existing);
}

function scannerHitEntries(map, limit = 10) {
  return [...map.values()]
    .map((entry) => ({
      path: entry.path,
      count: entry.count,
      reasons: [...entry.reasons].sort(),
      top_crawlers: topEntries(entry.crawlers, 5),
      top_operators: topEntries(entry.operators, 5),
    }))
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))
    .slice(0, limit);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function requireToken() {
  const token = (process.env.CLOUDFLARE_API_TOKEN || "").replace(/\r|\n/g, "").trim();
  if (!token || token === "貼上你的新 token" || !/^cf[a-zA-Z0-9_-]+/.test(token)) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN is missing or still contains the placeholder. Set it first.",
    );
  }
  return token;
}

function isoDate(value) {
  return value.toISOString().slice(0, 10);
}

function statusBucket(status) {
  if (status >= 200 && status < 300) return "2xx";
  if (status >= 300 && status < 400) return "3xx";
  if (status >= 400 && status < 500) return "4xx";
  if (status >= 500 && status < 600) return "5xx";
  return "other";
}

function increment(map, key, count) {
  map.set(key, (map.get(key) || 0) + count);
}

function topEntries(map, limit = 10) {
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function escapeGraphqlString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildCrawlerQuery() {
  const fields = crawlerDefinitions
    .map((crawler) => {
      return `${crawler.key}: httpRequestsAdaptiveGroups(
        filter: {
          datetime_geq: $start
          datetime_leq: $end
          requestSource: "eyeball"
          userAgent_like: "%${escapeGraphqlString(crawler.pattern)}%"
        }
        limit: 5000
        orderBy: [count_DESC]
      ) {
        count
        dimensions {
          clientRequestHTTPHost
          clientRequestPath
          edgeResponseStatus
          userAgent
        }
        sum {
          edgeResponseBytes
        }
      }`;
    })
    .join("\n");

  return `query($zoneTag: string, $start: string, $end: string) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      ${fields}
    }
  }
}`;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cfGet(token, uri) {
  const response = await fetch(uri, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const body = await response.json().catch(() => null);
  if (response.ok && body?.success) return body.result;
  const details = body ? JSON.stringify(body.errors || body) : response.statusText;
  throw new Error(`Cloudflare API GET failed ${response.status}: ${details}`);
}

async function graphql(token, query, variables) {
  const attempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    const body = await response.json().catch(() => null);
    if (response.ok && !body?.errors) return body.data;

    const details = body ? JSON.stringify(body.errors || body) : response.statusText;
    lastError = new Error(`Cloudflare GraphQL failed ${response.status}: ${details}`);
    if (response.status < 500 || attempt === attempts) break;
    await sleep(500 * attempt);
  }

  throw lastError;
}

async function getZone(token, host) {
  const zones = await cfGet(token, `https://api.cloudflare.com/client/v4/zones?name=${host}`);
  return zones[0] || null;
}

function emptyDomainRecord(domain, status, note, error = null) {
  return {
    host: domain.host,
    folder: domain.folder,
    status,
    note,
    total_requests: 0,
    successful_requests_2xx: 0,
    unsuccessful_requests_non_2xx: 0,
    bandwidth_bytes: 0,
    status_code_breakdown: { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0, other: 0 },
    top_operators: [],
    top_crawlers: [],
    top_paths: [],
    scanner_like_path_requests: 0,
    scanner_like_paths: [],
    error,
  };
}

function summarizeDomain(domain, zone, zoneData) {
  const operatorCounts = new Map();
  const crawlerCounts = new Map();
  const pathCounts = new Map();
  const scannerPathCounts = new Map();
  const statusCounts = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0, other: 0 };
  let total = 0;
  let successful = 0;
  let bandwidth = 0;

  for (const crawler of crawlerDefinitions) {
    const groups = zoneData[crawler.key] || [];
    for (const group of groups) {
      const count = group.count || 0;
      const status = Number(group.dimensions?.edgeResponseStatus || 0);
      const bucket = statusBucket(status);
      const requestPath = group.dimensions?.clientRequestPath || "(unknown)";

      total += count;
      bandwidth += group.sum?.edgeResponseBytes || 0;
      statusCounts[bucket] += count;
      if (bucket === "2xx") successful += count;
      increment(operatorCounts, crawler.operator, count);
      increment(crawlerCounts, crawler.crawler, count);
      increment(pathCounts, requestPath, count);
      addScannerHit(scannerPathCounts, requestPath, count, crawler.crawler, crawler.operator);
    }
  }

  const scannerLikePaths = scannerHitEntries(scannerPathCounts);

  return {
    host: domain.host,
    folder: domain.folder,
    zone_id: zone.id,
    status: "ok",
    note: total === 0 ? "no_data" : "ok",
    total_requests: total,
    successful_requests_2xx: successful,
    unsuccessful_requests_non_2xx: total - successful,
    bandwidth_bytes: bandwidth,
    status_code_breakdown: statusCounts,
    top_operators: topEntries(operatorCounts),
    top_crawlers: topEntries(crawlerCounts),
    top_paths: topEntries(pathCounts),
    scanner_like_path_requests: scannerLikePaths.reduce((sum, row) => sum + row.count, 0),
    scanner_like_paths: scannerLikePaths,
  };
}

function summarizeFleet(records) {
  const operatorCounts = new Map();
  const crawlerCounts = new Map();
  const pathCounts = new Map();
  const scannerPathCounts = new Map();
  const statusCounts = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0, other: 0 };
  let total = 0;
  let successful = 0;
  let bandwidth = 0;

  for (const record of records) {
    total += record.total_requests;
    successful += record.successful_requests_2xx;
    bandwidth += record.bandwidth_bytes;
    for (const [bucket, count] of Object.entries(record.status_code_breakdown)) {
      statusCounts[bucket] += count;
    }
    for (const row of record.top_operators) increment(operatorCounts, row.name, row.count);
    for (const row of record.top_crawlers) increment(crawlerCounts, row.name, row.count);
    for (const row of record.top_paths) increment(pathCounts, row.name, row.count);
    for (const row of record.scanner_like_paths || []) {
      const existing = scannerPathCounts.get(row.path) || {
        path: row.path,
        count: 0,
        reasons: new Set(),
        crawlers: new Map(),
        operators: new Map(),
      };
      existing.count += row.count;
      for (const reason of row.reasons || []) existing.reasons.add(reason);
      for (const crawler of row.top_crawlers || [])
        increment(existing.crawlers, crawler.name, crawler.count);
      for (const operator of row.top_operators || []) {
        increment(existing.operators, operator.name, operator.count);
      }
      scannerPathCounts.set(row.path, existing);
    }
  }

  return {
    total_domains: records.length,
    domains_with_data: records.filter((record) => record.total_requests > 0).length,
    domains_without_data: records.filter((record) => record.note === "no_data").length,
    domains_with_errors: records.filter((record) => record.status !== "ok").length,
    total_requests: total,
    successful_requests_2xx: successful,
    unsuccessful_requests_non_2xx: total - successful,
    success_rate: total === 0 ? 0 : successful / total,
    bandwidth_bytes: bandwidth,
    status_code_breakdown: statusCounts,
    top_operators: topEntries(operatorCounts),
    top_crawlers: topEntries(crawlerCounts),
    top_paths: topEntries(pathCounts),
    scanner_like_path_requests: records.reduce(
      (sum, record) => sum + (record.scanner_like_path_requests || 0),
      0,
    ),
    scanner_like_paths: scannerHitEntries(scannerPathCounts, 15),
    top_domains: records
      .map((record) => ({
        host: record.host,
        requests: record.total_requests,
        successful_requests_2xx: record.successful_requests_2xx,
        note: record.note,
      }))
      .sort((a, b) => b.requests - a.requests || a.host.localeCompare(b.host))
      .slice(0, 10),
  };
}

function domainSuccessRate(record) {
  return record.total_requests === 0 ? 0 : record.successful_requests_2xx / record.total_requests;
}

function buildDomainAttentionQueue(records) {
  return records
    .map((record) => {
      const reasons = [];
      const scannerCount = record.scanner_like_path_requests || 0;
      const successRate = domainSuccessRate(record);

      if (record.status !== "ok") reasons.push(record.status);
      if (record.total_requests >= 20 && successRate < 0.9)
        reasons.push("low-ai-crawler-success-rate");
      if (record.unsuccessful_requests_non_2xx >= 10) reasons.push("elevated-non-2xx");
      if (scannerCount >= 3) reasons.push("scanner-like-paths-observed");

      if (reasons.length === 0) return null;

      return {
        host: record.host,
        total_requests: record.total_requests,
        successful_requests_2xx: record.successful_requests_2xx,
        unsuccessful_requests_non_2xx: record.unsuccessful_requests_non_2xx,
        success_rate: successRate,
        scanner_like_path_requests: scannerCount,
        reasons,
        suggested_action:
          scannerCount >= 3
            ? "Keep discovery crawlers allowed; review scanner-path WAF coverage only."
            : "Verify live robots/sitemap/index.md access before changing Cloudflare rules.",
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.scanner_like_path_requests - a.scanner_like_path_requests ||
        b.unsuccessful_requests_non_2xx - a.unsuccessful_requests_non_2xx ||
        a.host.localeCompare(b.host),
    )
    .slice(0, 20);
}

function buildCrawlerPolicyRecommendation(fleet) {
  const presentCrawlers = fleet.top_crawlers.map((row) => row.name);
  const observedDiscoveryCrawlers = presentCrawlers.filter((crawler) =>
    normalDiscoveryCrawlers.has(crawler),
  );

  return {
    posture: "allow-and-observe-discovery-crawlers",
    mutation_policy: "read-only-report; no WAF, robots.txt, Pay Per Crawl, or Pages changes",
    recommended_allow_or_observe: observedDiscoveryCrawlers,
    recommended_security_focus: [
      "scanner-like paths",
      "empty user-agent",
      "generic curl user-agent",
      "encoded traversal or fuzzing paths",
    ],
    public_paths_that_must_stay_accessible: [...publicDiscoveryPaths],
    defer: ["Zero Trust", "R2", "D1", "Turnstile", "AI Gateway", "Pay Per Crawl enforcement"],
  };
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function renderNameCounts(rows) {
  if (rows.length === 0) return "None";
  return rows.map((row) => `${row.name}: ${row.count}`).join(", ");
}

function compactPath(value, maxLength = 72) {
  if (!value || value.length <= maxLength) return value || "";
  return `${value.slice(0, maxLength - 3)}...`;
}

function renderPathCounts(rows) {
  if (rows.length === 0) return "None";
  return rows.map((row) => `${compactPath(row.name)}: ${row.count}`).join(", ");
}

function renderScannerPathRows(rows) {
  if (!rows || rows.length === 0) return "None observed in the retained GraphQL groups.";
  return rows
    .map((row) => {
      const crawlers = renderNameCounts(row.top_crawlers || []);
      return `${compactPath(row.path, 82).padEnd(84)} ${String(row.count).padStart(7)} ${row.reasons.join(", ").padEnd(42)} ${crawlers}`;
    })
    .join("\n");
}

function renderAttentionRows(rows) {
  if (!rows || rows.length === 0) return "None.";
  return rows
    .map((row) =>
      [
        row.host.padEnd(58),
        String(row.total_requests).padStart(8),
        formatPercent(row.success_rate).padStart(8),
        String(row.unsuccessful_requests_non_2xx).padStart(8),
        String(row.scanner_like_path_requests).padStart(8),
        row.reasons.join(", "),
      ].join(" "),
    )
    .join("\n");
}

function renderMarkdown(report) {
  const fleet = report.fleet_summary;
  const topDomainsRows = fleet.top_domains
    .map(
      (row) =>
        `${row.host.padEnd(58)} ${String(row.requests).padStart(8)} ${String(
          row.successful_requests_2xx,
        ).padStart(8)} ${row.note}`,
    )
    .join("\n");
  const domainRows = report.domains
    .map((record) => {
      const topOperator = record.top_operators[0]
        ? `${record.top_operators[0].name} (${record.top_operators[0].count})`
        : "";
      const topCrawler = record.top_crawlers[0]
        ? `${record.top_crawlers[0].name} (${record.top_crawlers[0].count})`
        : "";
      const topPath = record.top_paths[0]
        ? `${compactPath(record.top_paths[0].name)} (${record.top_paths[0].count})`
        : "";
      return [
        record.host.padEnd(58),
        String(record.total_requests).padStart(8),
        String(record.successful_requests_2xx).padStart(8),
        String(record.unsuccessful_requests_non_2xx).padStart(8),
        topOperator.padEnd(22),
        topCrawler.padEnd(22),
        topPath.padEnd(78),
        record.note,
      ].join(" ");
    })
    .join("\n");
  const policy = report.crawler_policy_recommendation;

  return `# AI Crawler 24h Overview

This is a 24-hour UTC snapshot across the 67 concept-marker domains. It is an observation report, not a 7-day or 30-day trend conclusion.

## Fleet Summary

- Window: \`${report.window.start}\` to \`${report.window.end}\`
- Domains checked: \`${fleet.total_domains}\`
- Domains with AI crawler data: \`${fleet.domains_with_data}\`
- Total AI crawler requests: \`${fleet.total_requests}\`
- 2xx successful requests: \`${fleet.successful_requests_2xx}\`
- Non-2xx requests: \`${fleet.unsuccessful_requests_non_2xx}\`
- 2xx success rate: \`${formatPercent(fleet.success_rate)}\`
- Bandwidth: \`${formatBytes(fleet.bandwidth_bytes)}\`
- Top operators: ${renderNameCounts(fleet.top_operators)}
- Top crawlers: ${renderNameCounts(fleet.top_crawlers)}
- Top paths: ${renderPathCounts(fleet.top_paths)}
- Scanner-like path requests: \`${fleet.scanner_like_path_requests}\`

## Top Domains

\`\`\`text
Host                                                           Requests      2xx Note
${topDomainsRows}
\`\`\`

## Domain Table

\`\`\`text
Host                                                           Requests      2xx  Non-2xx Top operator           Top crawler            Top path                                                                       Note
${domainRows}
\`\`\`

## Scanner-Like Paths

These paths look like vulnerability scanning or fuzzing. Keep this separate from normal AI/search crawler discovery.

\`\`\`text
Path                                                                                  Requests Reasons                                    Top crawlers
${renderScannerPathRows(fleet.scanner_like_paths)}
\`\`\`

## Domain Attention Queue

\`\`\`text
Host                                                           Requests  Success  Non-2xx  Scanner Reasons
${renderAttentionRows(report.domain_attention_queue)}
\`\`\`

## Crawler Policy Recommendation

- Posture: \`${policy.posture}\`
- Recommended allow/observe crawlers: ${policy.recommended_allow_or_observe.join(", ") || "None observed"}
- Security focus: ${policy.recommended_security_focus.join(", ")}
- Public paths that must stay accessible: ${policy.public_paths_that_must_stay_accessible.map((item) => `\`${item}\``).join(", ")}
- Deferred features: ${policy.defer.join(", ")}

## Method

- Source inventory: \`domains.json\`
- Source metrics: Cloudflare GraphQL Analytics API, read-only
- Classification: conservative user-agent matching based on Cloudflare AI Crawl Control bot reference; user-agent strings can be spoofed when verified bot detection IDs are unavailable
- Full paths are preserved in the JSON report; very long paths are compacted in this Markdown view
- Excluded action: no Cloudflare settings, WAF rules, Pay Per Crawl policy, robots.txt, or Pages deployment changes
- Scanner-like path detection is heuristic and used for attention routing, not automatic enforcement
`;
}

async function main() {
  const token = requireToken();
  const domains = readJson(domainsPath).domains;
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const query = buildCrawlerQuery();
  const records = [];

  fs.mkdirSync(reportDir, { recursive: true });

  for (const domain of domains) {
    console.log(`collect AI crawl overview: ${domain.host}`);
    try {
      const zone = await getZone(token, domain.host);
      if (!zone) {
        records.push(emptyDomainRecord(domain, "zone_missing", "zone_missing"));
        continue;
      }

      const data = await graphql(token, query, {
        zoneTag: zone.id,
        start: start.toISOString(),
        end: end.toISOString(),
      });
      const zoneData = data.viewer.zones[0] || {};
      records.push(summarizeDomain(domain, zone, zoneData));
    } catch (error) {
      records.push(emptyDomainRecord(domain, "api_error", "api_error", error.message));
    }
  }

  const fleetSummary = summarizeFleet(records);
  const report = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    window: {
      start: start.toISOString(),
      end: end.toISOString(),
      timezone: "UTC",
      label: "past_24_hours",
    },
    source: {
      inventory: "domains.json",
      metrics: "Cloudflare GraphQL Analytics API",
      mutation_policy: "read_only_observation",
      classifier: "conservative_user_agent_mapping",
    },
    crawler_definitions: crawlerDefinitions.map(({ crawler, operator, pattern }) => ({
      crawler,
      operator,
      pattern,
    })),
    fleet_summary: fleetSummary,
    scanner_like_paths: fleetSummary.scanner_like_paths,
    domain_attention_queue: buildDomainAttentionQueue(records),
    crawler_policy_recommendation: buildCrawlerPolicyRecommendation(fleetSummary),
    domains: records,
  };

  const stamp = isoDate(end);
  const jsonPath = path.join(reportDir, `ai-crawl-24h-overview-${stamp}.json`);
  const mdPath = path.join(reportDir, `ai-crawl-24h-overview-${stamp}.md`);

  writeJson(jsonPath, report);
  fs.writeFileSync(mdPath, renderMarkdown(report));

  console.log(`AI crawl overview complete: ${records.length} domains.`);
  console.log(`Total requests: ${report.fleet_summary.total_requests}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`Markdown: ${mdPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
