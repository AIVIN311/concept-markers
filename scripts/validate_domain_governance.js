const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const ledgerPath = path.join(root, "ops", "domain-governance-ledger.v0.2.json");
const domainsPath = path.join(root, "domains.json");
const markersPath = path.join(root, "networklayer", "markers.js");

const governanceRoles = new Set(["core", "supporting", "bridge", "mirror", "reserve"]);
const strategicPriorities = new Set(["core", "active", "supporting", "reserve"]);
const copyMaturities = new Set(["draft", "published", "locked", "needs_review"]);
const sitemapStatuses = new Set([
  "submitted_success",
  "submitted_pending",
  "unable_fetch",
  "missing",
  "unknown",
]);
const zoneStatuses = new Set(["active", "pending", "moved", "missing", "unknown"]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function extractMarkerGroups(source) {
  const groupsStart = source.indexOf("const groups = [");
  if (groupsStart === -1) {
    throw new Error("Cannot find marker groups in networklayer/markers.js");
  }

  const groupsSource = source.slice(groupsStart);
  const idMatches = [...groupsSource.matchAll(/id:\s*"([^"]+)"/g)];
  const groupIds = new Set(idMatches.map((match) => match[1]));
  const hostToGroup = new Map();

  for (let i = 0; i < idMatches.length; i += 1) {
    const id = idMatches[i][1];
    const start = idMatches[i].index;
    const end =
      i + 1 < idMatches.length ? idMatches[i + 1].index : groupsSource.indexOf("];", start);
    const segment = groupsSource.slice(start, end);

    for (const item of segment.matchAll(/\[\s*"([^"]+)"\s*,\s*"https?:\/\/[^"]+\/"\s*,?\s*\]/g)) {
      hostToGroup.set(item[1].toLowerCase(), id);
    }
  }

  return { groupIds, hostToGroup };
}

function fail(errors, message) {
  errors.push(message);
}

function validateRecord(record, expectedDomain, markerContext, errors) {
  const host = expectedDomain.host;
  const prefix = `${host}:`;

  if (record.host !== host) fail(errors, `${prefix} host mismatch`);
  if (record.folder !== expectedDomain.folder) fail(errors, `${prefix} folder mismatch`);
  if (record.canonical_url !== `https://${host}/`) fail(errors, `${prefix} canonical_url mismatch`);
  if (record.sitemap_url !== `https://${host}/sitemap.xml`)
    fail(errors, `${prefix} sitemap_url mismatch`);
  if (record.robots_url !== `https://${host}/robots.txt`)
    fail(errors, `${prefix} robots_url mismatch`);

  const expectedGroup = markerContext.hostToGroup.get(host);
  if (!expectedGroup) fail(errors, `${prefix} missing from networklayer/markers.js`);
  if (record.marker_group !== expectedGroup) {
    fail(errors, `${prefix} marker_group ${record.marker_group} does not match ${expectedGroup}`);
  }
  if (!markerContext.groupIds.has(record.semantic_axis)) {
    fail(errors, `${prefix} semantic_axis ${record.semantic_axis} is not a known marker group id`);
  }

  if (!governanceRoles.has(record.governance_role)) {
    fail(errors, `${prefix} invalid governance_role ${record.governance_role}`);
  }
  if (!strategicPriorities.has(record.strategic_priority)) {
    fail(errors, `${prefix} invalid strategic_priority ${record.strategic_priority}`);
  }
  if (!copyMaturities.has(record.copy_maturity)) {
    fail(errors, `${prefix} invalid copy_maturity ${record.copy_maturity}`);
  }

  if (!record.cloudflare || !zoneStatuses.has(record.cloudflare.zone_status)) {
    fail(errors, `${prefix} invalid cloudflare.zone_status`);
  }
  if (
    record.cloudflare &&
    record.cloudflare.last_checked !== null &&
    !/^\d{4}-\d{2}-\d{2}$/.test(record.cloudflare.last_checked)
  ) {
    fail(errors, `${prefix} cloudflare.last_checked must be null or YYYY-MM-DD`);
  }
  if (record.cloudflare) {
    if (typeof record.cloudflare.security_level !== "string") {
      fail(errors, `${prefix} cloudflare.security_level must be a string`);
    }
    if (typeof record.cloudflare.browser_check !== "string") {
      fail(errors, `${prefix} cloudflare.browser_check must be a string`);
    }
    if (!record.cloudflare.content_converter) {
      fail(errors, `${prefix} missing cloudflare.content_converter`);
    } else {
      if (typeof record.cloudflare.content_converter.value !== "string") {
        fail(errors, `${prefix} cloudflare.content_converter.value must be a string`);
      }
      if (typeof record.cloudflare.content_converter.editable !== "boolean") {
        fail(errors, `${prefix} cloudflare.content_converter.editable must be a boolean`);
      }
    }
    if (!record.cloudflare.agent_access_rule) {
      fail(errors, `${prefix} missing cloudflare.agent_access_rule`);
    } else {
      for (const field of ["status", "action", "description"]) {
        if (typeof record.cloudflare.agent_access_rule[field] !== "string") {
          fail(errors, `${prefix} cloudflare.agent_access_rule.${field} must be a string`);
        }
      }
    }
    if (!record.cloudflare.public_access) {
      fail(errors, `${prefix} missing cloudflare.public_access`);
    } else {
      for (const field of ["homepage_status", "index_md_status"]) {
        const value = record.cloudflare.public_access[field];
        if (value !== null && typeof value !== "number") {
          fail(errors, `${prefix} cloudflare.public_access.${field} must be number or null`);
        }
      }
      for (const field of ["homepage_challenged", "link_header_present"]) {
        const value = record.cloudflare.public_access[field];
        if (value !== null && typeof value !== "boolean") {
          fail(errors, `${prefix} cloudflare.public_access.${field} must be boolean or null`);
        }
      }
      const contentType = record.cloudflare.public_access.index_md_content_type;
      if (contentType !== null && typeof contentType !== "string") {
        fail(errors, `${prefix} cloudflare.public_access.index_md_content_type must be string or null`);
      }
    }
    if (!Array.isArray(record.cloudflare.recommendations)) {
      fail(errors, `${prefix} cloudflare.recommendations must be an array`);
    } else if (!record.cloudflare.recommendations.every((item) => typeof item === "string")) {
      fail(errors, `${prefix} cloudflare.recommendations must only contain strings`);
    }
  }

  if (!record.search_console) {
    fail(errors, `${prefix} missing search_console`);
    return;
  }
  if (record.search_console.property_type !== "domain") {
    fail(errors, `${prefix} search_console.property_type must be domain`);
  }
  if (!sitemapStatuses.has(record.search_console.sitemap_status)) {
    fail(errors, `${prefix} invalid search_console.sitemap_status`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.search_console.last_checked || "")) {
    fail(errors, `${prefix} search_console.last_checked must be YYYY-MM-DD`);
  }
  if (typeof record.search_console.notes !== "string") {
    fail(errors, `${prefix} search_console.notes must be a string`);
  }
}

function main() {
  const ledger = readJson(ledgerPath);
  const domains = readJson(domainsPath).domains;
  const markerContext = extractMarkerGroups(fs.readFileSync(markersPath, "utf8"));
  const errors = [];

  if (ledger.schema_version !== 2) fail(errors, "schema_version must be 2");
  if (!Array.isArray(ledger.records)) fail(errors, "records must be an array");

  const records = ledger.records || [];
  if (records.length !== domains.length) {
    fail(
      errors,
      `ledger record count ${records.length} does not match domains count ${domains.length}`,
    );
  }

  const recordByHost = new Map();
  for (const record of records) {
    if (recordByHost.has(record.host)) fail(errors, `duplicate ledger host ${record.host}`);
    recordByHost.set(record.host, record);
  }

  for (const domain of domains) {
    const record = recordByHost.get(domain.host);
    if (!record) {
      fail(errors, `missing ledger host ${domain.host}`);
      continue;
    }
    validateRecord(record, domain, markerContext, errors);
  }

  const domainHosts = new Set(domains.map((domain) => domain.host));
  for (const host of recordByHost.keys()) {
    if (!domainHosts.has(host)) fail(errors, `ledger host not in domains.json: ${host}`);
  }

  if (errors.length > 0) {
    console.error("Domain governance ledger validation failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Domain governance ledger OK: ${records.length} records checked.`);
}

main();
