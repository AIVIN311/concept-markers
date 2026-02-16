#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
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

function buildSitemapXml(folderName, lastmod) {
  const host = folderToHost(folderName);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <url>",
    `    <loc>https://${host}/</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    "    <changefreq>daily</changefreq>",
    "    <priority>1.0</priority>",
    "  </url>",
    "</urlset>",
    "",
  ].join("\n");
}

function main() {
  const siteFolders = getSiteFolders(ROOT);

  if (siteFolders.length === 0) {
    console.error("No site folders with index.html were found.");
    process.exitCode = 1;
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  for (const folderName of siteFolders) {
    const sitemapPath = path.join(ROOT, folderName, "sitemap.xml");
    const xml = buildSitemapXml(folderName, today);
    fs.writeFileSync(sitemapPath, xml, "utf8");
  }

  console.log(`Generated sitemap.xml for ${siteFolders.length} site folders.`);
  console.log(`lastmod date: ${today}`);
}

try {
  main();
} catch (error) {
  console.error("Sitemap generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}