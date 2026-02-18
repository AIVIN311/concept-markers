#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { loadDomains } = require("./lib/domains");

const ROOT = process.cwd();
const HUB_HOST = "civilizationcaching.com";

function gitLastMod(filePath) {
  try {
    const relativePath = path.relative(ROOT, filePath).replace(/\\/g, "/");
    const output = execSync(`git log -1 --format=%cs -- "${relativePath}"`, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(output)) {
      return output;
    }
  } catch {
    // Fall through to UTC date fallback below.
  }

  return new Date().toISOString().slice(0, 10);
}

function buildSitemapIndex(entries) {
  const body = entries
    .map((entry) => {
      return [
        "  <sitemap>",
        `    <loc>${entry.loc}</loc>`,
        `    <lastmod>${entry.lastmod}</lastmod>`,
        "  </sitemap>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</sitemapindex>",
    "",
  ].join("\n");
}

function main() {
  const domains = loadDomains(ROOT);
  const hub = domains.find((domain) => domain.host === HUB_HOST);

  if (!hub) {
    console.error(`Hub host not found in domains.json: ${HUB_HOST}`);
    process.exitCode = 2;
    return;
  }

  const entries = domains.map((domain) => {
    return {
      loc: `https://${domain.host}/sitemap.xml`,
      lastmod: gitLastMod(domain.indexPath),
    };
  });

  const xml = buildSitemapIndex(entries);
  fs.writeFileSync(path.join(ROOT, hub.folder, "sitemap-index.xml"), xml, "utf8");

  console.log(`Wrote ${hub.folder}/sitemap-index.xml with ${entries.length} sitemap entries.`);
  console.log("lastmod source: git commit date per site's index.html (fallback: today UTC).");
}

try {
  main();
} catch (error) {
  console.error("Sitemap index generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
