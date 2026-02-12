#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const vm = require("vm");

const ROOT = process.cwd();
const NETWORK_MARKERS = path.join(ROOT, "networklayer", "markers.js");
const ROOT_MARKERS = path.join(ROOT, "markers.js");
const RELATIONAL_LAYER = path.join(ROOT, "RELATIONAL_LAYER.md");
const OPS_DIR = path.join(ROOT, "_ops");
const STRICT = process.argv.includes("--strict");

const BRIDGE_EXCEPTIONS = {
  "energyjurisdiction.com": {
    narrative_axis: "Sovereign Infrastructure Axis",
    primary_markers_group: "monetary_infrastructure",
  },
  "volatilityasinfrastructure.com": {
    narrative_axis: "Synthetic Systems Axis",
    primary_markers_group: "monetary_infrastructure",
  },
  "humanintelligenceisirreplaceable.com": {
    narrative_axis: "Identity & Cognitive Substrate",
    primary_markers_group: "civilization",
  },
};

function normalizeHost(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/\/$/, "");
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function extractAssignedLiteral(source, variableName, openingChar, closingChar) {
  const varIndex = source.indexOf(`const ${variableName}`);
  if (varIndex === -1) {
    throw new Error(`Cannot find "${variableName}" in markers source.`);
  }

  const equalsIndex = source.indexOf("=", varIndex);
  if (equalsIndex === -1) {
    throw new Error(`Cannot parse assignment for "${variableName}".`);
  }

  const start = source.indexOf(openingChar, equalsIndex);
  if (start === -1) {
    throw new Error(`Cannot find literal start for "${variableName}".`);
  }

  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (inSingle) {
      if (ch === "\\") escaped = true;
      else if (ch === "'") inSingle = false;
      continue;
    }

    if (inDouble) {
      if (ch === "\\") escaped = true;
      else if (ch === '"') inDouble = false;
      continue;
    }

    if (inTemplate) {
      if (ch === "\\") escaped = true;
      else if (ch === "`") inTemplate = false;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      continue;
    }

    if (ch === '"') {
      inDouble = true;
      continue;
    }

    if (ch === "`") {
      inTemplate = true;
      continue;
    }

    if (ch === openingChar) {
      depth += 1;
    } else if (ch === closingChar) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  throw new Error(`Unbalanced literal for "${variableName}".`);
}

function parseMarkersConfig(markersSource) {
  const aliasesLiteral = extractAssignedLiteral(markersSource, "SERIES_ALIASES", "{", "}");
  const groupsLiteral = extractAssignedLiteral(markersSource, "groups", "[", "]");

  const aliases = vm.runInNewContext(`(${aliasesLiteral})`, Object.create(null));
  const groups = vm.runInNewContext(`(${groupsLiteral})`, Object.create(null));

  if (!aliases || typeof aliases !== "object") {
    throw new Error("SERIES_ALIASES parse failed.");
  }
  if (!Array.isArray(groups)) {
    throw new Error("groups parse failed.");
  }

  return { aliases, groups };
}

function walkIndexFiles(dir) {
  const out = [];
  const skipDirs = new Set(["node_modules", ".git", "_ops", ".playwright-cli"]);

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) {
        out.push(...walkIndexFiles(abs));
      }
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase() === "index.html") {
      out.push(abs);
    }
  }
  return out;
}

function extractSeries(html) {
  const match = html.match(/<html[^>]*\sdata-series="([^"]+)"/i);
  return match ? match[1].trim() : "";
}

function extractHostFromHtml(relativePath, html) {
  const checks = [
    /<div>\s*©\s*([a-z0-9.-]+\.(?:com|ai|systems))/i,
    /<link\s+rel="canonical"\s+href="https?:\/\/([^/"\s]+)/i,
    /<link\s+rel="alternate"[^>]*href="https?:\/\/([^/"\s]+)/i,
    /<meta\s+property="og:url"\s+content="https?:\/\/([^/"\s]+)/i,
  ];

  for (const re of checks) {
    const match = html.match(re);
    if (match && match[1]) {
      return normalizeHost(match[1]);
    }
  }

  const folder = relativePath.split("/")[0];
  if (!folder) return "";
  if (folder.toLowerCase() === "networklayer") return "";
  if (folder.includes(".")) return normalizeHost(folder);
  return normalizeHost(`${folder}.com`);
}

function parseRelationalAxes(relationalSource) {
  const axes = [];
  const axisRe =
    /###\s+\d+\.\s+([^\n]+)\n\nMapped group id:\s*`([^`]+)`([\s\S]*?)(?=\n###\s+\d+\.|\n##\s+Mirror Architecture)/g;

  let match;
  while ((match = axisRe.exec(relationalSource)) !== null) {
    const title = match[1].trim();
    const mappedGroup = match[2].trim();
    const body = match[3];
    const nodes = [];
    const nodeRe = /-\s*`([^`]+\.(?:com|ai|systems))`/g;
    let nodeMatch;
    while ((nodeMatch = nodeRe.exec(body)) !== null) {
      nodes.push(normalizeHost(nodeMatch[1]));
    }

    axes.push({
      title,
      mapped_group: mappedGroup,
      nodes,
    });
  }

  return axes;
}

function ensureOpsDir() {
  fs.mkdirSync(OPS_DIR, { recursive: true });
}

function writeJson(fileName, payload) {
  fs.writeFileSync(path.join(OPS_DIR, fileName), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function main() {
  const networkMarkers = readUtf8(NETWORK_MARKERS);
  const rootMarkers = readUtf8(ROOT_MARKERS);
  const relationalSource = readUtf8(RELATIONAL_LAYER);
  const markers = parseMarkersConfig(networkMarkers);

  const networkHash = sha256(networkMarkers);
  const rootHash = sha256(rootMarkers);
  const markersSyncOk = networkHash === rootHash;

  const hostToGroup = new Map();
  for (const group of markers.groups) {
    const groupId = group.id;
    if (!Array.isArray(group.items)) continue;
    for (const item of group.items) {
      if (!Array.isArray(item) || item.length < 1) continue;
      const host = normalizeHost(item[0]);
      if (host) hostToGroup.set(host, groupId);
    }
  }

  const indexFiles = walkIndexFiles(ROOT)
    .map((abs) => path.relative(ROOT, abs).replace(/\\/g, "/"))
    .filter((rel) => rel !== "networklayer/index.html");

  const pageRows = [];
  const pageHosts = new Set();

  for (const relPath of indexFiles) {
    const html = readUtf8(path.join(ROOT, relPath));
    const host = extractHostFromHtml(relPath, html);
    if (!host) continue;

    const series = extractSeries(html);
    const mappedGroup = markers.aliases[series] || series || "";
    const markersGroup = hostToGroup.get(host) || "";

    let status = "OK";
    if (!markersGroup) {
      status = "HOST_NOT_IN_MARKERS";
    } else if (mappedGroup !== markersGroup) {
      status = "SERIES_GROUP_MISMATCH";
    }

    pageHosts.add(host);
    pageRows.push({
      host,
      path: relPath,
      data_series: series,
      mapped_group: mappedGroup,
      markers_group: markersGroup,
      status,
    });
  }

  pageRows.sort((a, b) => a.host.localeCompare(b.host));

  const markersHosts = Array.from(hostToGroup.keys()).sort((a, b) => a.localeCompare(b));
  const hostsMissingInPages = markersHosts.filter((host) => !pageHosts.has(host));
  const hostsMissingInMarkers = Array.from(pageHosts)
    .filter((host) => !hostToGroup.has(host))
    .sort((a, b) => a.localeCompare(b));

  const pageMismatches = pageRows.filter((row) => row.status !== "OK");

  const relationalAxes = parseRelationalAxes(relationalSource);
  const docRows = [];
  for (const axis of relationalAxes) {
    for (const host of axis.nodes) {
      const markersGroup = hostToGroup.get(host) || "";
      const bridge = BRIDGE_EXCEPTIONS[host];
      let status = "OK";

      if (!markersGroup) {
        status = "DOC_HOST_NOT_IN_MARKERS";
      } else if (markersGroup !== axis.mapped_group) {
        if (bridge && bridge.primary_markers_group === markersGroup) {
          status = "BRIDGE_EXCEPTION";
        } else {
          status = "DOC_GROUP_MISMATCH";
        }
      }

      docRows.push({
        axis: axis.title,
        node: host,
        mapped_group: axis.mapped_group,
        markers_group: markersGroup,
        status,
      });
    }
  }

  const docMismatches = docRows.filter(
    (row) => row.status === "DOC_GROUP_MISMATCH" || row.status === "DOC_HOST_NOT_IN_MARKERS",
  );
  const bridgeApplied = docRows.filter((row) => row.status === "BRIDGE_EXCEPTION");

  const summary = {
    generated_at: new Date().toISOString(),
    strict_mode: STRICT,
    markers_sync: {
      networklayer_hash_sha256: networkHash,
      root_hash_sha256: rootHash,
      identical: markersSyncOk,
    },
    pages: {
      total_index_pages_scanned: pageRows.length,
      markers_hosts_total: markersHosts.length,
      ok: pageRows.filter((row) => row.status === "OK").length,
      series_group_mismatch: pageRows.filter((row) => row.status === "SERIES_GROUP_MISMATCH")
        .length,
      host_not_in_markers: pageRows.filter((row) => row.status === "HOST_NOT_IN_MARKERS").length,
      hosts_missing_in_pages: hostsMissingInPages.length,
      hosts_missing_in_markers: hostsMissingInMarkers.length,
    },
    relational_layer: {
      axes_checked: relationalAxes.length,
      core_nodes_checked: docRows.length,
      ok: docRows.filter((row) => row.status === "OK").length,
      bridge_exception: bridgeApplied.length,
      mismatch: docMismatches.length,
    },
  };

  const mismatchPayload = {
    page_mismatches: pageMismatches,
    doc_mismatches: docMismatches,
    bridge_exceptions_applied: bridgeApplied,
    hosts_missing_in_pages: hostsMissingInPages,
    hosts_missing_in_markers: hostsMissingInMarkers,
  };

  ensureOpsDir();
  writeJson("markers-audit-summary.json", summary);
  writeJson("markers-audit-mismatch.json", mismatchPayload);

  console.log("Markers audit complete.");
  console.log(`- Markers files identical: ${summary.markers_sync.identical}`);
  console.log(`- Pages scanned: ${summary.pages.total_index_pages_scanned}`);
  console.log(
    `- Page mismatches: ${summary.pages.series_group_mismatch + summary.pages.host_not_in_markers}`,
  );
  console.log(`- Hosts missing in pages: ${summary.pages.hosts_missing_in_pages}`);
  console.log(`- Hosts missing in markers: ${summary.pages.hosts_missing_in_markers}`);
  console.log(`- RELATIONAL mismatches: ${summary.relational_layer.mismatch}`);
  console.log(`- Bridge exceptions applied: ${summary.relational_layer.bridge_exception}`);
  console.log(`- Summary report: ${path.join("_ops", "markers-audit-summary.json")}`);
  console.log(`- Mismatch report: ${path.join("_ops", "markers-audit-mismatch.json")}`);

  const strictFailures =
    (summary.markers_sync.identical ? 0 : 1) +
    summary.pages.series_group_mismatch +
    summary.pages.host_not_in_markers +
    summary.pages.hosts_missing_in_markers +
    summary.relational_layer.mismatch;

  if (STRICT && strictFailures > 0) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error("Markers audit failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
