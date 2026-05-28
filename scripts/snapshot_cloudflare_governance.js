const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const domainsPath = path.join(root, "domains.json");
const v1LedgerPath = path.join(root, "ops", "domain-governance-ledger.v0.1.json");
const v2LedgerPath = path.join(root, "ops", "domain-governance-ledger.v0.2.json");
const v2SummaryPath = path.join(root, "ops", "domain-governance-ledger-v0.2.md");
const opsDir = path.join(root, "_ops");
const logPath = path.join(opsDir, "cloudflare-governance-snapshot-results.jsonl");

const targetRuleDescription = "CivRadar: managed challenge generic non-browser clients";
const publicPathsExpression =
  '(http.user_agent eq "" or lower(http.user_agent) contains "curl/") and not http.request.uri.path in {"/" "/index.md" "/robots.txt" "/sitemap.xml"}';
const publicPaths = ["/", "/index.md", "/robots.txt", "/sitemap.xml"];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function today() {
  return new Date().toISOString().slice(0, 10);
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cfGet(token, uri) {
  const attempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(uri, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const body = await response.json().catch(() => null);
    if (response.ok && body?.success) {
      return body.result;
    }

    const details = body ? JSON.stringify(body.errors || body) : response.statusText;
    lastError = new Error(`Cloudflare API GET failed ${response.status}: ${details}`);
    if (response.status < 500 || attempt === attempts) {
      break;
    }
    await sleep(500 * attempt);
  }

  throw lastError;
}

async function getSetting(token, zoneId, setting) {
  try {
    const result = await cfGet(
      token,
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/${setting}`,
    );
    return {
      value: result?.value ?? "unknown",
      editable: Boolean(result?.editable),
    };
  } catch (error) {
    return {
      value: "unknown",
      editable: false,
      error: error.message,
    };
  }
}

async function getPublicAccess(host) {
  const homepage = await fetchHead(`https://${host}/`);
  const markdown = await fetchHead(`https://${host}/index.md`);

  return {
    homepage_status: homepage.status,
    homepage_challenged: homepage.challenged,
    link_header_present: homepage.linkHeaderPresent,
    index_md_status: markdown.status,
    index_md_content_type: markdown.contentType,
  };
}

async function fetchHead(uri) {
  try {
    const response = await fetch(uri, {
      method: "HEAD",
      redirect: "manual",
      headers: {
        "User-Agent": "concept-markers-governance-snapshot/0.2",
      },
    });
    return {
      status: response.status,
      challenged: (response.headers.get("cf-mitigated") || "").toLowerCase() === "challenge",
      linkHeaderPresent: Boolean(response.headers.get("link")),
      contentType: response.headers.get("content-type"),
    };
  } catch (error) {
    return {
      status: null,
      challenged: null,
      linkHeaderPresent: null,
      contentType: null,
      error: error.message,
    };
  }
}

function publicPathsAreExempted(expression) {
  if (!expression) return false;
  const hasBaseUserAgentMatch =
    /http\.user_agent\s+eq\s+""/.test(expression) &&
    /lower\(http\.user_agent\)\s+contains\s+"curl\/"/.test(expression);
  const hasNotClause = /\bnot\b/.test(expression);
  const hasAllPublicPaths = publicPaths.every((publicPath) =>
    expression.includes(`"${publicPath}"`),
  );
  return hasBaseUserAgentMatch && hasNotClause && hasAllPublicPaths;
}

function getAgentAccessRuleStatus(rule) {
  if (!rule) {
    return {
      status: "missing",
      action: "unknown",
      description: targetRuleDescription,
    };
  }

  return {
    status: publicPathsAreExempted(rule.expression) ? "public_paths_exempted" : "needs_review",
    action: rule.action || "unknown",
    description: rule.description || targetRuleDescription,
  };
}

function recommendationsFor(cloudflare) {
  const recommendations = [];
  const access = cloudflare.public_access;

  if (access.homepage_challenged === true) {
    recommendations.push(
      "Check custom firewall / agent access rule; homepage is still challenged.",
    );
  }
  if (access.link_header_present === false) {
    recommendations.push(
      "Check _headers deployment for the Pages custom domain; Link header is missing.",
    );
  }
  if (access.index_md_status !== 200) {
    recommendations.push("Redeploy agent-readable artifacts; index.md is not returning 200.");
  }
  if (
    access.index_md_content_type !== null &&
    !access.index_md_content_type.toLowerCase().includes("text/markdown")
  ) {
    recommendations.push("Check static asset MIME / Pages deploy; index.md is not text/markdown.");
  }
  if (cloudflare.agent_access_rule.status !== "public_paths_exempted") {
    recommendations.push(
      "Review Cloudflare agent access rule; public paths are not confirmed exempted.",
    );
  }

  return recommendations;
}

function loadBaseLedger() {
  if (fs.existsSync(v2LedgerPath)) return readJson(v2LedgerPath);
  return readJson(v1LedgerPath);
}

function countBy(records, selector) {
  const counts = new Map();
  for (const record of records) {
    const key = selector(record);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
}

function renderSummary(ledger) {
  const records = ledger.records;
  const statusCounts = countBy(records, (record) => record.cloudflare.zone_status);
  const challengeCount = records.filter(
    (record) => record.cloudflare.public_access.homepage_challenged === true,
  ).length;
  const missingLink = records.filter(
    (record) => record.cloudflare.public_access.link_header_present !== true,
  );
  const badMarkdown = records.filter((record) => {
    const access = record.cloudflare.public_access;
    return (
      access.index_md_status !== 200 ||
      !(access.index_md_content_type || "").toLowerCase().includes("text/markdown")
    );
  });
  const recommendations = records.filter((record) => record.cloudflare.recommendations.length > 0);

  const statusRows = statusCounts
    .map(([status, count]) => `| \`${status}\` | ${String(count).padStart(5, " ")} |`)
    .join("\n");
  const recommendationRows =
    recommendations.length === 0
      ? "- None."
      : recommendations
          .map((record) => `- \`${record.host}\`: ${record.cloudflare.recommendations.join(" ")}`)
          .join("\n");

  return `# Domain Governance Ledger v0.2

This is the human-readable Cloudflare governance snapshot for \`ops/domain-governance-ledger.v0.2.json\`.
The JSON ledger is canonical.

## Snapshot

- Snapshot date: \`${ledger.snapshot_date}\`
- Total domains: \`${records.length}\`
- Scope: Cloudflare zone status, security settings, agent access rule, homepage access, and \`index.md\` access
- Mutation policy: read-only snapshot; no Cloudflare settings were changed by this pass
- Web Bot Auth: deferred; no \`/.well-known/http-message-signatures-directory\` support is declared

## Cloudflare Zone Status

| zone_status | count |
| ----------- | ----: |
${statusRows}

## Public Access Checks

- Homepage challenged: \`${challengeCount}\`
- Missing Link header: \`${missingLink.length}\`
- Markdown artifact issues: \`${badMarkdown.length}\`
- Records with recommendations: \`${recommendations.length}\`

## Recommendations

${recommendationRows}

## Next Pass

1. Fix recommendations in small batches only.
2. Keep Web Bot Auth deferred until key management and response signing are designed.
3. Re-run \`npm run cloudflare:governance:snapshot\` after Cloudflare or Pages deploy changes.
`;
}

async function main() {
  const token = requireToken();
  const snapshotDate = today();
  const domains = readJson(domainsPath).domains;
  const baseLedger = loadBaseLedger();
  const baseByHost = new Map(baseLedger.records.map((record) => [record.host, record]));
  const records = [];

  fs.mkdirSync(opsDir, { recursive: true });
  fs.rmSync(logPath, { force: true });

  for (const domain of domains) {
    const host = domain.host;
    const base = baseByHost.get(host);
    if (!base) throw new Error(`Missing base ledger record for ${host}`);
    console.log(`snapshot Cloudflare governance: ${host}`);

    const row = {
      host,
      success: false,
    };

    try {
      const zones = await cfGet(token, `https://api.cloudflare.com/client/v4/zones?name=${host}`);
      const zone = zones[0];
      if (!zone) throw new Error("zone not found");

      const securityLevel = await getSetting(token, zone.id, "security_level");
      const browserCheck = await getSetting(token, zone.id, "browser_check");
      const contentConverter = await getSetting(token, zone.id, "content_converter");

      let agentRule = null;
      try {
        const ruleset = await cfGet(
          token,
          `https://api.cloudflare.com/client/v4/zones/${zone.id}/rulesets/phases/http_request_firewall_custom/entrypoint`,
        );
        agentRule = (ruleset.rules || []).find(
          (rule) => rule.description === targetRuleDescription,
        );
      } catch (error) {
        agentRule = null;
      }

      const cloudflare = {
        zone_status: zone.status || "unknown",
        last_checked: snapshotDate,
        security_level: securityLevel.value,
        browser_check: browserCheck.value,
        content_converter: {
          value: contentConverter.value,
          editable: contentConverter.editable,
        },
        agent_access_rule: getAgentAccessRuleStatus(agentRule),
        public_access: await getPublicAccess(host),
        recommendations: [],
      };
      cloudflare.recommendations = recommendationsFor(cloudflare);

      records.push({
        ...base,
        cloudflare,
      });

      Object.assign(row, {
        success: true,
        zone_id: zone.id,
        zone_status: cloudflare.zone_status,
        recommendations: cloudflare.recommendations,
      });
    } catch (error) {
      const cloudflare = {
        zone_status: "unknown",
        last_checked: snapshotDate,
        security_level: "unknown",
        browser_check: "unknown",
        content_converter: {
          value: "unknown",
          editable: false,
        },
        agent_access_rule: {
          status: "unknown",
          action: "unknown",
          description: targetRuleDescription,
        },
        public_access: {
          homepage_status: null,
          homepage_challenged: null,
          link_header_present: null,
          index_md_status: null,
          index_md_content_type: null,
        },
        recommendations: [`Snapshot failed: ${error.message}`],
      };

      records.push({
        ...base,
        cloudflare,
      });

      Object.assign(row, {
        error: error.message,
        recommendations: cloudflare.recommendations,
      });
    }

    fs.appendFileSync(logPath, `${JSON.stringify(row)}\n`);
  }

  const ledger = {
    ...baseLedger,
    schema_version: 2,
    generated_from: [
      "domains.json",
      "networklayer/markers.js",
      "RELATIONAL_LAYER.md",
      "Cloudflare API",
      "public HTTP HEAD checks",
    ],
    snapshot_date: snapshotDate,
    records,
  };

  writeJson(v2LedgerPath, ledger);
  fs.writeFileSync(v2SummaryPath, renderSummary(ledger));

  const recommended = records.filter(
    (record) => record.cloudflare.recommendations.length > 0,
  ).length;
  console.log(
    `Cloudflare governance snapshot complete: ${records.length} records, ${recommended} with recommendations.`,
  );
  console.log(`Ledger: ${v2LedgerPath}`);
  console.log(`Summary: ${v2SummaryPath}`);
  console.log(`Log: ${logPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
