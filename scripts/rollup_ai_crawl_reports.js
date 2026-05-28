const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const reportDir = path.join(root, "AI Traffic Patterns and Recommendation Trends");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function parseArgs(argv) {
  const options = { days: 7 };
  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--days") {
      options.days = Number(argv[index + 1]);
      index += 1;
    }
  }
  if (!Number.isInteger(options.days) || options.days <= 0) {
    throw new Error("--days must be a positive integer.");
  }
  return options;
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

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
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

function compactPath(value, maxLength = 72) {
  if (!value || value.length <= maxLength) return value || "";
  return `${value.slice(0, maxLength - 3)}...`;
}

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

function addScannerHit(map, pathValue, count, reasons = null) {
  const pathReasons = reasons || scannerReasonsForPath(pathValue);
  if (pathReasons.length === 0) return;

  const key = pathValue || "(unknown)";
  const existing = map.get(key) || {
    path: key,
    count: 0,
    reasons: new Set(),
  };
  existing.count += count;
  pathReasons.forEach((reason) => existing.reasons.add(reason));
  map.set(key, existing);
}

function scannerEntries(map, limit = 15) {
  return [...map.values()]
    .map((entry) => ({
      path: entry.path,
      count: entry.count,
      reasons: [...entry.reasons].sort(),
    }))
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))
    .slice(0, limit);
}

function reportDate(report, file) {
  const value = report.window?.end || report.generated_at;
  if (value) return value.slice(0, 10);
  const match = path.basename(file).match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "unknown";
}

function loadReports(days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return fs
    .readdirSync(reportDir)
    .filter((name) => /^ai-crawl-24h-overview-\d{4}-\d{2}-\d{2}\.json$/.test(name))
    .map((name) => {
      const file = path.join(reportDir, name);
      const report = readJson(file);
      const end = new Date(report.window?.end || report.generated_at || 0);
      return { file, report, end };
    })
    .filter((row) => Number.isFinite(row.end.getTime()) && row.end.getTime() >= cutoff)
    .sort((a, b) => a.end - b.end);
}

function summarizeReports(rows, days) {
  const operatorCounts = new Map();
  const crawlerCounts = new Map();
  const pathCounts = new Map();
  const scannerCounts = new Map();
  const domainTotals = new Map();
  let totalRequests = 0;
  let successfulRequests = 0;
  let non2xxRequests = 0;
  let bandwidthBytes = 0;

  for (const row of rows) {
    const report = row.report;
    const fleet = report.fleet_summary || {};
    totalRequests += fleet.total_requests || 0;
    successfulRequests += fleet.successful_requests_2xx || 0;
    non2xxRequests += fleet.unsuccessful_requests_non_2xx || 0;
    bandwidthBytes += fleet.bandwidth_bytes || 0;

    for (const item of fleet.top_operators || []) increment(operatorCounts, item.name, item.count);
    for (const item of fleet.top_crawlers || []) increment(crawlerCounts, item.name, item.count);
    for (const item of fleet.top_paths || []) increment(pathCounts, item.name, item.count);

    for (const item of report.scanner_like_paths || fleet.scanner_like_paths || []) {
      addScannerHit(scannerCounts, item.path, item.count, item.reasons || null);
    }
    if (!(report.scanner_like_paths || fleet.scanner_like_paths)) {
      for (const domain of report.domains || []) {
        for (const item of domain.top_paths || []) {
          addScannerHit(scannerCounts, item.name, item.count);
        }
      }
    }

    for (const domain of report.domains || []) {
      const existing = domainTotals.get(domain.host) || {
        host: domain.host,
        requests: 0,
        successful_requests_2xx: 0,
        unsuccessful_requests_non_2xx: 0,
        scanner_like_path_requests: 0,
      };
      existing.requests += domain.total_requests || 0;
      existing.successful_requests_2xx += domain.successful_requests_2xx || 0;
      existing.unsuccessful_requests_non_2xx += domain.unsuccessful_requests_non_2xx || 0;
      existing.scanner_like_path_requests += domain.scanner_like_path_requests || 0;
      domainTotals.set(domain.host, existing);
    }
  }

  const domainAttentionQueue = [...domainTotals.values()]
    .filter((domain) => {
      const successRate =
        domain.requests === 0 ? 0 : domain.successful_requests_2xx / domain.requests;
      return (
        domain.scanner_like_path_requests >= 3 ||
        domain.unsuccessful_requests_non_2xx >= 10 ||
        (domain.requests >= 20 && successRate < 0.9)
      );
    })
    .map((domain) => ({
      ...domain,
      success_rate: domain.requests === 0 ? 0 : domain.successful_requests_2xx / domain.requests,
    }))
    .sort(
      (a, b) =>
        b.scanner_like_path_requests - a.scanner_like_path_requests ||
        b.unsuccessful_requests_non_2xx - a.unsuccessful_requests_non_2xx ||
        a.host.localeCompare(b.host),
    )
    .slice(0, 25);

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    window: {
      label: `last_${days}_days_from_local_reports`,
      days,
      report_count: rows.length,
      start: rows[0]?.report.window?.start || null,
      end: rows.at(-1)?.report.window?.end || null,
    },
    source: {
      metrics: "local ai-crawl-24h-overview JSON reports",
      mutation_policy: "read_only_observation",
    },
    fleet_summary: {
      total_requests: totalRequests,
      successful_requests_2xx: successfulRequests,
      unsuccessful_requests_non_2xx: non2xxRequests,
      success_rate: totalRequests === 0 ? 0 : successfulRequests / totalRequests,
      bandwidth_bytes: bandwidthBytes,
      top_operators: topEntries(operatorCounts, 10),
      top_crawlers: topEntries(crawlerCounts, 10),
      top_paths: topEntries(pathCounts, 15),
      scanner_like_paths: scannerEntries(scannerCounts, 20),
    },
    domain_attention_queue: domainAttentionQueue,
    included_reports: rows.map((row) => ({
      date: reportDate(row.report, row.file),
      file: path.relative(root, row.file).replace(/\\/g, "/"),
    })),
  };
}

function renderNameCounts(rows) {
  if (!rows || rows.length === 0) return "None";
  return rows.map((row) => `${row.name}: ${row.count}`).join(", ");
}

function renderScannerRows(rows) {
  if (!rows || rows.length === 0) return "None.";
  return rows
    .map(
      (row) =>
        `${compactPath(row.path, 84).padEnd(86)} ${String(row.count).padStart(8)} ${row.reasons.join(", ")}`,
    )
    .join("\n");
}

function renderDomainRows(rows) {
  if (!rows || rows.length === 0) return "None.";
  return rows
    .map((row) =>
      [
        row.host.padEnd(58),
        String(row.requests).padStart(8),
        formatPercent(row.success_rate).padStart(8),
        String(row.unsuccessful_requests_non_2xx).padStart(8),
        String(row.scanner_like_path_requests).padStart(8),
      ].join(" "),
    )
    .join("\n");
}

function renderMarkdown(rollup) {
  const fleet = rollup.fleet_summary;
  const reportRows = rollup.included_reports
    .map((row) => `- \`${row.date}\`: \`${row.file}\``)
    .join("\n");

  return `# AI Crawler ${rollup.window.days}d Local Rollup

This rollup is built only from local 24-hour JSON snapshots. It is read-only and does not change Cloudflare settings.

## Summary

- Reports included: \`${rollup.window.report_count}\`
- Window: \`${rollup.window.start || "unknown"}\` to \`${rollup.window.end || "unknown"}\`
- Total AI crawler requests: \`${fleet.total_requests}\`
- 2xx successful requests: \`${fleet.successful_requests_2xx}\`
- Non-2xx requests: \`${fleet.unsuccessful_requests_non_2xx}\`
- 2xx success rate: \`${formatPercent(fleet.success_rate)}\`
- Bandwidth: \`${formatBytes(fleet.bandwidth_bytes)}\`
- Top operators: ${renderNameCounts(fleet.top_operators)}
- Top crawlers: ${renderNameCounts(fleet.top_crawlers)}

## Scanner-Like Paths

\`\`\`text
Path                                                                                    Requests Reasons
${renderScannerRows(fleet.scanner_like_paths)}
\`\`\`

## Domain Attention Queue

\`\`\`text
Host                                                           Requests  Success  Non-2xx  Scanner
${renderDomainRows(rollup.domain_attention_queue)}
\`\`\`

## Policy Posture

- Keep discovery crawlers allowed/observed.
- Keep public paths accessible: \`/\`, \`/index.md\`, \`/robots.txt\`, \`/sitemap.xml\`.
- Treat scanner-like paths as the security focus.
- Do not infer a need for Zero Trust, R2, D1, Turnstile, AI Gateway, or Pay Per Crawl enforcement from this rollup alone.

## Included Reports

${reportRows || "- None."}
`;
}

function main() {
  const options = parseArgs(process.argv);
  const rows = loadReports(options.days);
  if (rows.length === 0) {
    throw new Error(`No local ai-crawl 24h reports found for the last ${options.days} days.`);
  }

  const rollup = summarizeReports(rows, options.days);
  const stamp = new Date().toISOString().slice(0, 10);
  const jsonPath = path.join(reportDir, `ai-crawl-rollup-${options.days}d-${stamp}.json`);
  const mdPath = path.join(reportDir, `ai-crawl-rollup-${options.days}d-${stamp}.md`);

  writeJson(jsonPath, rollup);
  fs.writeFileSync(mdPath, renderMarkdown(rollup));

  console.log(`AI crawl ${options.days}d rollup complete: ${rows.length} reports.`);
  console.log(`Total requests: ${rollup.fleet_summary.total_requests}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`Markdown: ${mdPath}`);
}

main();
