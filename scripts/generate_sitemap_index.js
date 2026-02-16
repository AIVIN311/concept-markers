#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const HUB_FOLDER = "civilizationcaching";
const EXCLUDED_DIRS = new Set(["networklayer"]);
const SUPPORTED_TLDS = [".com", ".ai", ".systems"];

function getSiteFolders(rootDir) {
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !EXCLUDED_DIRS.has(name))
    .filter((name) => fs.existsSync(path.join(rootDir, name, "index.html")))
    .sort((a, b) => a.localeCompare(b));
}

function folderToHost(folderName) {
  const normalized = folderName.toLowerCase();
  if (SUPPORTED_TLDS.some((tld) => normalized.endsWith(tld))) {
    return normalized;
  }
  return `${normalized}.com`;
}

function buildSitemapIndex(hosts, lastmod) {
  const entries = hosts
    .map((host) => {
      return [
        "  <sitemap>",
        `    <loc>https://${host}/sitemap.xml</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        "  </sitemap>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    "</sitemapindex>",
    "",
  ].join("\n");
}

function main() {
  const hubPath = path.join(ROOT, HUB_FOLDER);
  if (!fs.existsSync(hubPath) || !fs.existsSync(path.join(hubPath, "index.html"))) {
    console.error(`Hub folder not found or missing index.html: ${HUB_FOLDER}`);
    process.exitCode = 2;
    return;
  }

  const siteFolders = getSiteFolders(ROOT);
  const hosts = siteFolders.map(folderToHost);
  const today = new Date().toISOString().slice(0, 10);

  const xml = buildSitemapIndex(hosts, today);
  fs.writeFileSync(path.join(hubPath, "sitemap-index.xml"), xml, "utf8");

  console.log(`Wrote ${HUB_FOLDER}/sitemap-index.xml with ${hosts.length} sitemap entries.`);
  console.log(`lastmod date: ${today}`);
}

try {
  main();
} catch (error) {
  console.error("Sitemap index generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
